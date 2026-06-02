// Inventory Management Service
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

// Inventory log types (matching Prisma enum)
type InventoryLogType = 'STOCK_IN' | 'STOCK_OUT' | 'ADJUSTMENT' | 'SALE' | 'RETURN' | 'RESTOCK'

export interface StockAdjustmentParams {
  productId: string
  quantity: number
  type: InventoryLogType | string
  reason?: string
  orderId?: string
  userId?: string
}

export interface InventoryStatus {
  productId: string
  productName: string
  currentStock: number
  lowStockThreshold: number
  status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'
  lastRestocked?: Date
  totalSold: number
  totalAdjusted: number
}

// Adjust stock level
export async function adjustStock(params: StockAdjustmentParams): Promise<{
  success: boolean
  newStock: number
  logId: string
  message?: string
}> {
  const { productId, quantity, type, reason, orderId, userId } = params

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Get current product stock
      const product = await tx.product.findUnique({
        where: { id: productId },
        select: { id: true, stock: true, name: true, lowStockThreshold: true },
      })

      if (!product) {
        throw new Error('Product not found')
      }

      const beforeStock = product.stock
      let afterStock = beforeStock

      // Calculate new stock based on adjustment type
      switch (type) {
        case 'STOCK_IN':
        case 'RESTOCK':
          afterStock = beforeStock + quantity
          break
        case 'STOCK_OUT':
        case 'SALE':
          afterStock = beforeStock - quantity
          if (afterStock < 0) {
            throw new Error('Insufficient stock')
          }
          break
        case 'ADJUSTMENT':
        case 'RETURN':
          afterStock = quantity // Direct set for adjustment
          break
      }

      // Update product stock
      const updateData: Prisma.ProductUpdateInput = {
        stock: afterStock,
      }

      // Update lastRestocked for restock operations
      if (type === 'RESTOCK' || type === 'STOCK_IN') {
        updateData.lastRestocked = new Date()
      }

      // Update product status based on stock level
      if (afterStock === 0) {
        updateData.status = 'OUT_OF_STOCK'
      } else if (afterStock <= product.lowStockThreshold) {
        updateData.status = 'ACTIVE'
      }

      await tx.product.update({
        where: { id: productId },
        data: updateData,
      })

      // Create inventory log
      const log = await tx.inventoryLog.create({
        data: {
          productId,
          type,
          quantity,
          beforeStock,
          afterStock,
          reason,
          orderId,
          userId,
        },
      })

      // Check for low stock alert
      if (afterStock <= product.lowStockThreshold && afterStock > 0) {
        await createOrUpdateStockAlert(tx, productId, product.lowStockThreshold)
      }

      // Resolve stock alert if stock is now above threshold
      if (afterStock > product.lowStockThreshold) {
        await resolveStockAlert(tx, productId)
      }

      return {
        success: true,
        newStock: afterStock,
        logId: log.id,
      }
    })

    return result
  } catch (error) {
    console.error('Stock adjustment error:', error)
    return {
      success: false,
      newStock: 0,
      logId: '',
      message: error instanceof Error ? error.message : 'Stock adjustment failed',
    }
  }
}

// Validate stock availability
export async function validateStock(
  productId: string,
  requestedQuantity: number
): Promise<{
  available: boolean
  currentStock: number
  message?: string
}> {
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { stock: true, name: true, status: true },
    })

    if (!product) {
      return {
        available: false,
        currentStock: 0,
        message: 'Product not found',
      }
    }

    if (product.status === 'INACTIVE') {
      return {
        available: false,
        currentStock: product.stock,
        message: 'Product is not available',
      }
    }

    if (product.stock < requestedQuantity) {
      return {
        available: false,
        currentStock: product.stock,
        message: `Only ${product.stock} items available`,
      }
    }

    return {
      available: true,
      currentStock: product.stock,
    }
  } catch (error) {
    console.error('Stock validation error:', error)
    return {
      available: false,
      currentStock: 0,
      message: 'Failed to validate stock',
    }
  }
}

// Get inventory status for all products
export async function getInventoryStatus(): Promise<InventoryStatus[]> {
  try {
    const products = await prisma.product.findMany({
      include: {
        inventoryLogs: {
          select: {
            type: true,
            quantity: true,
          },
        },
      },
    })

    return products.map((product) => {
      const totalSold = product.inventoryLogs
        .filter((log) => log.type === 'SALE')
        .reduce((sum, log) => sum + log.quantity, 0)

      const totalAdjusted = product.inventoryLogs
        .filter((log) => log.type === 'ADJUSTMENT')
        .reduce((sum, log) => sum + Math.abs(log.quantity), 0)

      let status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' = 'IN_STOCK'
      if (product.stock === 0) {
        status = 'OUT_OF_STOCK'
      } else if (product.stock <= product.lowStockThreshold) {
        status = 'LOW_STOCK'
      }

      return {
        productId: product.id,
        productName: product.name,
        currentStock: product.stock,
        lowStockThreshold: product.lowStockThreshold,
        status,
        lastRestocked: product.lastRestocked || undefined,
        totalSold,
        totalAdjusted,
      }
    })
  } catch (error) {
    console.error('Get inventory status error:', error)
    return []
  }
}

// Get inventory logs for a product
export async function getInventoryLogs(
  productId: string,
  options?: {
    limit?: number
    offset?: number
    types?: string[]
    startDate?: Date
    endDate?: Date
  }
) {
  const { limit = 50, offset = 0, types, startDate, endDate } = options || {}

  try {
    const where: Prisma.InventoryLogWhereInput = { productId }

    if (types && types.length > 0) {
      where.type = { in: types }
    }

    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) where.createdAt.gte = startDate
      if (endDate) where.createdAt.lte = endDate
    }

    const [logs, total] = await Promise.all([
      prisma.inventoryLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.inventoryLog.count({ where }),
    ])

    return {
      logs,
      total,
      hasMore: offset + logs.length < total,
    }
  } catch (error) {
    console.error('Get inventory logs error:', error)
    return { logs: [], total: 0, hasMore: false }
  }
}

// Get low stock alerts
export async function getLowStockAlerts(activeOnly = true) {
  try {
    const where: Prisma.StockAlertWhereInput = {}
    if (activeOnly) {
      where.isActive = true
    }

    const alerts = await prisma.stockAlert.findMany({
      where,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            stock: true,
            lowStockThreshold: true,
            images: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return alerts
  } catch (error) {
    console.error('Get low stock alerts error:', error)
    return []
  }
}

// Create or update stock alert
async function createOrUpdateStockAlert(
  tx: Prisma.TransactionClient,
  productId: string,
  threshold: number
) {
  const existingAlert = await tx.stockAlert.findFirst({
    where: {
      productId,
      isActive: true,
    },
  })

  if (existingAlert) {
    return existingAlert
  }

  return tx.stockAlert.create({
    data: {
      productId,
      threshold,
      isActive: true,
    },
  })
}

// Resolve stock alert
async function resolveStockAlert(tx: Prisma.TransactionClient, productId: string) {
  await tx.stockAlert.updateMany({
    where: {
      productId,
      isActive: true,
    },
    data: {
      isActive: false,
      resolvedAt: new Date(),
    },
  })
}

// Mark alert as notified
export async function markAlertNotified(alertId: string) {
  try {
    await prisma.stockAlert.update({
      where: { id: alertId },
      data: { notifiedAt: new Date() },
    })
    return true
  } catch (error) {
    console.error('Mark alert notified error:', error)
    return false
  }
}

// Deduct stock for order items
export async function deductStockForOrder(
  orderId: string,
  items: Array<{ productId: string; quantity: number }>,
  userId?: string
): Promise<{ success: boolean; message?: string }> {
  try {
    for (const item of items) {
      const result = await adjustStock({
        productId: item.productId,
        quantity: item.quantity,
        type: 'SALE',
        reason: `Order ${orderId}`,
        orderId,
        userId,
      })

      if (!result.success) {
        return {
          success: false,
          message: result.message,
        }
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Deduct stock for order error:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to deduct stock',
    }
  }
}

// Restore stock for cancelled order
export async function restoreStockForCancelledOrder(
  orderId: string,
  items: Array<{ productId: string; quantity: number }>,
  userId?: string
): Promise<{ success: boolean; message?: string }> {
  try {
    for (const item of items) {
      const result = await adjustStock({
        productId: item.productId,
        quantity: item.quantity,
        type: 'RETURN',
        reason: `Order ${orderId} cancelled`,
        orderId,
        userId,
      })

      if (!result.success) {
        return {
          success: false,
          message: result.message,
        }
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Restore stock for cancelled order error:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to restore stock',
    }
  }
}
