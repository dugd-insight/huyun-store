// Inventory Logs API Routes
import { NextRequest, NextResponse } from 'next/server'
import { getInventoryLogs } from '@/lib/inventory/service'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'

// Valid inventory log types (matching Prisma enum)
type InventoryLogType = 'STOCK_IN' | 'STOCK_OUT' | 'ADJUSTMENT' | 'SALE' | 'RETURN' | 'RESTOCK'

// Get inventory logs
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    // Check if user is admin
    if (!session?.user || (session.user as { role?: string }).role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const types = searchParams.get('types')?.split(',') as InventoryLogType[] | undefined
    const startDate = searchParams.get('startDate')
      ? new Date(searchParams.get('startDate')!)
      : undefined
    const endDate = searchParams.get('endDate')
      ? new Date(searchParams.get('endDate')!)
      : undefined

    if (productId) {
      // Get logs for specific product
      const result = await getInventoryLogs(productId, {
        limit,
        offset,
        types,
        startDate,
        endDate,
      })
      return NextResponse.json(result)
    }

    // Get all recent logs
    const logs = await prisma.inventoryLog.findMany({
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            images: true,
          },
        },
      },
    })

    const total = await prisma.inventoryLog.count()

    return NextResponse.json({
      logs,
      total,
      hasMore: offset + logs.length < total,
    })
  } catch (error) {
    console.error('Inventory logs API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch inventory logs' },
      { status: 500 }
    )
  }
}
