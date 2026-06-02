// Logistics Webhook Handler
import { NextRequest, NextResponse } from 'next/server'
import { updateShipmentStatus, TrackingEvent } from '@/lib/logistics/service'

// Shipment status types (matching Prisma enum)
type ShipmentStatus = 'PENDING' | 'PICKED_UP' | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'EXCEPTION' | 'RETURNED'

// Handle carrier webhook updates
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { trackingNumber, status, events, carrier } = body

    if (!trackingNumber || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: trackingNumber, status' },
        { status: 400 }
      )
    }

    // Map carrier status to our status
    const mappedStatus = mapCarrierStatus(status)

    // Update shipment status
    const success = await updateShipmentStatus(
      trackingNumber,
      mappedStatus,
      events as TrackingEvent[]
    )

    if (success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json(
        { error: 'Failed to update shipment status' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Logistics webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Map carrier status to our status
function mapCarrierStatus(carrierStatus: string): ShipmentStatus {
  const statusMap: Record<string, ShipmentStatus> = {
    pending: 'PENDING',
    picked_up: 'PICKED_UP',
    in_transit: 'IN_TRANSIT',
    out_for_delivery: 'OUT_FOR_DELIVERY',
    delivered: 'DELIVERED',
    exception: 'EXCEPTION',
    returned: 'RETURNED',
  }

  return statusMap[carrierStatus.toLowerCase()] || 'PENDING'
}
