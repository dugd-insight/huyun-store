import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateStock, deductStockForOrder, restoreStockForCancelledOrder } from '@/lib/inventory/service'
import { createPayment, PaymentMethod } from '@/lib/payment'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const status = searchParams.get('status')

    const where: Record<string, unknown> = {}
    if (userId) where.userId = userId
    if (status) where.status = status

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}

/**
 * 创建订单 - 使用事务保护
 *
 * 将以下步骤封装在单个数据库事务中，确保数据一致性：
 * 1. 验证每个商品的库存
 * 2. 验证商品存在并计算总价
 * 3. 创建订单及订单项
 * 4. 记录库存扣减日志
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      email,
      name,
      phone,
      address,
      city,
      postalCode,
      country,
      items,
      userId,
      paymentMethod = 'alipay',
    } = body

    // Validate required fields
    if (!email || !name || !phone || !address || !city || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Pre-transaction stock validation (early exit for insufficient stock)
    for (const item of items) {
      const stockCheck = await validateStock(item.productId, item.quantity)
      if (!stockCheck.available) {
        return NextResponse.json(
          { error: stockCheck.message || `Insufficient stock for product ${item.productId}` },
          { status: 400 }
        )
      }
    }

    // Use a transaction to ensure atomicity of order creation and stock management
    const order = await prisma.$transaction(async (tx) => {
      // 1. Verify products and calculate total inside transaction
      let total = 0
      const orderItems: Array<{
        productId: string
        name: string
        price: any
        quantity: number
      }> = []

      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          select: {
            id: true,
            name: true,
            price: true,
            stock: true,
            status: true,
          },
        })

        if (!product) {
          throw new Error(`Product ${item.productId} not found`)
        }

        // Verify stock availability within the transaction
        if (product.status !== 'ACTIVE' || product.stock < item.quantity) {
          throw new Error(`Insufficient stock for product ${product.name}`)
        }

        total += Number(product.price) * item.quantity

        orderItems.push({
          productId: item.productId,
          name: product.name,
          price: product.price,
          quantity: item.quantity,
        })
      }

      // 2. Create order and order items
      const createdOrder = await tx.order.create({
        data: {
          email,
          name,
          phone,
          address,
          city,
          postalCode: postalCode || '',
          country: country || 'CN',
          total,
          status: 'PENDING',
          paymentStatus: 'UNPAID',
          userId,
          items: {
            create: orderItems,
          },
        },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  images: true,
                },
              },
            },
          },
        },
      })

      // 3. Record inventory logs for stock deduction
      for (const item of orderItems) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          select: { stock: true },
        })

        if (!product) continue

        const beforeStock = product.stock
        const afterStock = beforeStock - item.quantity

        // Update product stock
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: afterStock,
            status: afterStock === 0 ? 'OUT_OF_STOCK' : 'ACTIVE',
          },
        })

        // Create inventory log
        await tx.inventoryLog.create({
          data: {
            productId: item.productId,
            type: 'SALE',
            quantity: item.quantity,
            beforeStock,
            afterStock,
            reason: `Order ${createdOrder.id}`,
            orderId: createdOrder.id,
          },
        })
      }

      return createdOrder
    })

    // Create payment (outside transaction as it's an external service call)
    const paymentResult = await createPayment(paymentMethod as PaymentMethod, {
      orderId: order.id,
      amount: Number(order.total),
      currency: 'CNY',
      description: `Order ${order.id}`,
      metadata: {
        customerName: name,
        customerEmail: email,
      },
    })

    return NextResponse.json({
      order,
      payment: paymentResult,
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating order:', error)

    // Handle transaction-specific errors
    if (error instanceof Error && error.message.includes('Insufficient stock')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}

// Update order (for admin operations)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, status, paymentStatus, trackingNumber, carrier } = body

    if (!orderId) {
      return NextResponse.json(
        { error: 'Missing required field: orderId' },
        { status: 400 }
      )
    }

    const updateData: Record<string, unknown> = {}
    if (status) updateData.status = status
    if (paymentStatus) updateData.paymentStatus = paymentStatus
    if (trackingNumber) updateData.trackingNumber = trackingNumber
    if (carrier) updateData.carrier = carrier

    const order = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
      include: {
        items: true,
      },
    })

    // Handle stock operations based on status change
    if (status === 'CANCELLED' && order.paymentStatus !== 'REFUNDED') {
      // Restore stock for cancelled orders
      const items = order.items.map((item: { productId: string; quantity: number }) => ({
        productId: item.productId,
        quantity: item.quantity,
      }))
      await restoreStockForCancelledOrder(orderId, items)
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    )
  }
}

// Handle payment success webhook
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, paymentStatus } = body

    if (!orderId || !paymentStatus) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus },
      include: {
        items: true,
      },
    })

    // Deduct stock on successful payment
    if (paymentStatus === 'PAID') {
      const items = order.items.map((item: any) => ({
        productId: item.productId,
        quantity: item.quantity,
      }))
      await deductStockForOrder(orderId, items)
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error updating payment status:', error)
    return NextResponse.json(
      { error: 'Failed to update payment status' },
      { status: 500 }
    )
  }
}
