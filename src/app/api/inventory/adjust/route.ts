// Stock Adjustment API Route
import { NextRequest, NextResponse } from 'next/server'
import { adjustStock, validateStock } from '@/lib/inventory/service'
import { getServerSession } from 'next-auth'

// Valid adjustment types
const VALID_ADJUSTMENT_TYPES = ['STOCK_IN', 'STOCK_OUT', 'ADJUSTMENT', 'SALE', 'RETURN', 'RESTOCK']

export async function POST(request: NextRequest) {
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
    const { productId, quantity, type, reason } = body

    if (!productId || quantity === undefined || !type) {
      return NextResponse.json(
        { error: 'Missing required fields: productId, quantity, type' },
        { status: 400 }
      )
    }

    // Validate adjustment type
    if (!VALID_ADJUSTMENT_TYPES.includes(type as string)) {
      return NextResponse.json(
        { error: 'Invalid adjustment type' },
        { status: 400 }
      )
    }

    const result = await adjustStock({
      productId,
      quantity: parseInt(quantity),
      type: type as string,
      reason,
      userId: session.user.id,
    })

    if (result.success) {
      return NextResponse.json(result, { status: 200 })
    } else {
      return NextResponse.json(
        { error: result.message || 'Stock adjustment failed' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Stock adjustment API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Validate stock availability
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    const quantity = searchParams.get('quantity')

    if (!productId || !quantity) {
      return NextResponse.json(
        { error: 'Missing required parameters: productId, quantity' },
        { status: 400 }
      )
    }

    const result = await validateStock(productId, parseInt(quantity))
    return NextResponse.json(result)
  } catch (error) {
    console.error('Stock validation API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
