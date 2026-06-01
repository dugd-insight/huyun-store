// Stock Alert API Routes
import { NextRequest, NextResponse } from 'next/server'
import { getLowStockAlerts, markAlertNotified } from '@/lib/inventory/service'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'

// Get low stock alerts
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
    const activeOnly = searchParams.get('activeOnly') !== 'false'

    const alerts = await getLowStockAlerts(activeOnly)
    return NextResponse.json({ alerts })
  } catch (error) {
    console.error('Stock alert API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stock alerts' },
      { status: 500 }
    )
  }
}

// Mark alert as notified
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    // Check if user is admin
    if (!session?.user || (session.user as { role?: string }).role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { alertId } = body

    if (!alertId) {
      return NextResponse.json(
        { error: 'Missing required field: alertId' },
        { status: 400 }
      )
    }

    const success = await markAlertNotified(alertId)

    if (success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json(
        { error: 'Failed to mark alert as notified' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Mark alert notified API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Resolve alert (mark as inactive)
export async function DELETE(request: NextRequest) {
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
    const alertId = searchParams.get('alertId')

    if (!alertId) {
      return NextResponse.json(
        { error: 'Missing required parameter: alertId' },
        { status: 400 }
      )
    }

    await prisma.stockAlert.update({
      where: { id: alertId },
      data: {
        isActive: false,
        resolvedAt: new Date(),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Resolve alert API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
