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

    // Validate stock for all items
    for (const item of items) {
      const stockCheck = await validateStock(item.productId, item.quantity)
      if (!stockCheck.available) {
        return NextResponse.json(
          { error: stockCheck.message || `Insufficient stock for product ${item.productId}` },
          { status: 400 }
        )
      }
    }

    // Calculate total
    let total = 0
    const orderItems = []

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      })

      if (!product) {
        return NextResponse.json(
          { error: `Product ${item.productId} not found` },
          { status: 404 }
        )
      }

      total += Number(product.price) * item.quantity

      orderItems.push({
        productId: item.productId,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
      })
    }

    // Create order
    const order = await prisma.order.create({
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

    // Create payment
    const paymentResult = await createPayment(paymentMethod as PaymentMethod, {
      orderId: order.id,
      amount: total,
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
      const items = order.items.map((item) => ({
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
      const items = order.items.map((item) => ({
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
