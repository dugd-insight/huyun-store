// Logistics Tracking API Routes
import { NextRequest, NextResponse } from 'next/server'
import { trackShipment, getOrderShipments } from '@/lib/logistics/service'

// Track shipment by tracking number
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const trackingNumber = searchParams.get('trackingNumber')
    const carrier = searchParams.get('carrier') || undefined
    const orderId = searchParams.get('orderId')

    if (orderId) {
      // Get all shipments for an order
      const shipments = await getOrderShipments(orderId)
      return NextResponse.json({ shipments })
    }

    if (!trackingNumber) {
      return NextResponse.json(
        { error: 'Missing required parameter: trackingNumber or orderId' },
        { status: 400 }
      )
    }

    const result = await trackShipment(trackingNumber, carrier)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Track shipment API error:', error)
    return NextResponse.json(
      { error: 'Failed to track shipment' },
      { status: 500 }
    )
  }
}
