// Inventory API Routes
import { NextRequest, NextResponse } from 'next/server'
import { getInventoryStatus, getLowStockAlerts } from '@/lib/inventory/service'
import { prisma } from '@/lib/prisma'

// Get inventory status for all products
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')

    if (productId) {
      // Get specific product inventory
      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: {
          id: true,
          name: true,
          stock: true,
          lowStockThreshold: true,
          lastRestocked: true,
          status: true,
          inventoryLogs: {
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
        },
      })

      if (!product) {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        )
      }

      let status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' = 'IN_STOCK'
      if (product.stock === 0) {
        status = 'OUT_OF_STOCK'
      } else if (product.stock <= product.lowStockThreshold) {
        status = 'LOW_STOCK'
      }

      return NextResponse.json({
        productId: product.id,
        productName: product.name,
        currentStock: product.stock,
        lowStockThreshold: product.lowStockThreshold,
        status,
        lastRestocked: product.lastRestocked,
        recentLogs: product.inventoryLogs,
      })
    }

    // Get all inventory status
    const inventory = await getInventoryStatus()
    return NextResponse.json({ inventory })
  } catch (error) {
    console.error('Inventory API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch inventory status' },
      { status: 500 }
    )
  }
}
