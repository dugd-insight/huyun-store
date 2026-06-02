// Logistics Tracking Service
import { prisma } from '@/lib/prisma'
import { ShipmentStatus, Prisma } from '@prisma/client'

export interface TrackingEvent {
  time: string
  status: string
  description: string
  location?: string
}

export interface TrackingResult {
  success: boolean
  trackingNumber: string
  carrier: string
  status: ShipmentStatus
  estimatedDelivery?: Date
  events: TrackingEvent[]
  error?: string
}

export interface CreateShipmentParams {
  orderId: string
  trackingNumber: string
  carrier: string
  origin?: string
  destination?: string
  estimatedDelivery?: Date
}

// Supported carriers
export const supportedCarriers = [
  { id: 'sf-express', name: '顺丰速运', code: 'SF' },
  { id: 'yto', name: '圆通速递', code: 'YTO' },
  { id: 'zto', name: '中通快递', code: 'ZTO' },
  { id: 'sto', name: '申通快递', code: 'STO' },
  { id: 'ems', name: 'EMS', code: 'EMS' },
  { id: 'jd', name: '京东物流', code: 'JD' },
  { id: 'dhl', name: 'DHL', code: 'DHL' },
  { id: 'fedex', name: 'FedEx', code: 'FEDEX' },
  { id: 'ups', name: 'UPS', code: 'UPS' },
]

// Create new shipment
export async function createShipment(
  params: CreateShipmentParams
): Promise<{ success: boolean; shipmentId?: string; error?: string }> {
  try {
    const shipment = await prisma.shipment.create({
      data: {
        orderId: params.orderId,
        trackingNumber: params.trackingNumber,
        carrier: params.carrier,
        status: 'PENDING',
        origin: params.origin,
        destination: params.destination,
        estimatedDelivery: params.estimatedDelivery,
      },
    })

    // Update order status to SHIPPED if this is the first shipment
    await prisma.order.update({
      where: { id: params.orderId },
      data: {
        status: 'SHIPPED',
        trackingNumber: params.trackingNumber,
        carrier: params.carrier,
        shippedAt: new Date(),
      },
    })

    return { success: true, shipmentId: shipment.id }
  } catch (error) {
    console.error('Create shipment error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create shipment',
    }
  }
}

// Track shipment
export async function trackShipment(
  trackingNumber: string,
  carrier?: string
): Promise<TrackingResult> {
  try {
    // Find shipment in database
    const shipment = await prisma.shipment.findFirst({
      where: { trackingNumber },
      include: { order: true },
    })

    if (!shipment) {
      // Generate mock tracking data for demo
      return generateMockTracking(trackingNumber, carrier || 'SF')
    }

    // In real implementation, call carrier API
    // For demo, generate mock tracking events
    const trackingData = generateMockTracking(
      trackingNumber,
      shipment.carrier,
      shipment.status as ShipmentStatus
    )

    // Update shipment with latest tracking data
    if (trackingData.success) {
      await prisma.shipment.update({
        where: { id: shipment.id },
        data: {
          status: trackingData.status,
          trackingData: trackingData.events as any,
          deliveredAt:
            trackingData.status === 'DELIVERED' ? new Date() : undefined,
        },
      })

      // Update order status if delivered
      if (trackingData.status === 'DELIVERED') {
        await prisma.order.update({
          where: { id: shipment.orderId },
          data: { status: 'DELIVERED' },
        })
      }
    }

    return trackingData
  } catch (error) {
    console.error('Track shipment error:', error)
    return {
      success: false,
      trackingNumber,
      carrier: carrier || 'UNKNOWN',
      status: 'EXCEPTION',
      events: [],
      error: error instanceof Error ? error.message : 'Tracking failed',
    }
  }
}

// Get shipments for an order
export async function getOrderShipments(orderId: string) {
  try {
    const shipments = await prisma.shipment.findMany({
      where: { orderId },
      orderBy: { createdAt: 'desc' },
    })
    return shipments
  } catch (error) {
    console.error('Get order shipments error:', error)
    return []
  }
}

// Update shipment status
export async function updateShipmentStatus(
  shipmentId: string,
  status: ShipmentStatus,
  trackingData?: TrackingEvent[]
): Promise<boolean> {
  try {
    await prisma.shipment.update({
      where: { id: shipmentId },
      data: {
        status,
        trackingData: trackingData as any,
        deliveredAt: status === 'DELIVERED' ? new Date() : undefined,
      },
    })

    // Update order status
    const shipment = await prisma.shipment.findUnique({
      where: { id: shipmentId },
      select: { orderId: true },
    })

    if (shipment) {
      const orderStatus =
        status === 'DELIVERED'
          ? 'DELIVERED'
          : status === 'IN_TRANSIT'
          ? 'SHIPPED'
          : undefined

      if (orderStatus) {
        await prisma.order.update({
          where: { id: shipment.orderId },
          data: { status: orderStatus },
        })
      }
    }

    return true
  } catch (error) {
    console.error('Update shipment status error:', error)
    return false
  }
}

// Get pending shipments count
export async function getPendingShipmentsCount(): Promise<number> {
  try {
    const count = await prisma.shipment.count({
      where: {
        status: {
          in: ['PENDING', 'PICKED_UP'],
        },
      },
    })
    return count
  } catch (error) {
    console.error('Get pending shipments count error:', error)
    return 0
  }
}

// Get recent shipments
export async function getRecentShipments(limit: number = 10) {
  try {
    const shipments = await prisma.shipment.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        order: {
          select: {
            id: true,
            name: true,
            email: true,
            total: true,
          },
        },
      },
    })
    return shipments
  } catch (error) {
    console.error('Get recent shipments error:', error)
    return []
  }
}

// Generate mock tracking data for demo
function generateMockTracking(
  trackingNumber: string,
  carrier: string,
  currentStatus?: ShipmentStatus
): TrackingResult {
  const now = new Date()
  const events: TrackingEvent[] = []

  // Generate mock events based on status
  const status = currentStatus || 'IN_TRANSIT'

  // Always add shipment created event
  events.push({
    time: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'PENDING',
    description: '订单已创建，等待发货',
    location: '发货仓库',
  })

  events.push({
    time: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'PICKED_UP',
    description: '快递员已揽收',
    location: '发货城市',
  })

  events.push({
    time: new Date(now.getTime() - 1.5 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'IN_TRANSIT',
    description: '快件已到达转运中心',
    location: '转运中心',
  })

  if (status === 'IN_TRANSIT' || status === 'OUT_FOR_DELIVERY' || status === 'DELIVERED') {
    events.push({
      time: new Date(now.getTime() - 0.5 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'IN_TRANSIT',
      description: '快件已发往目的地',
      location: '运输中',
    })
  }

  if (status === 'OUT_FOR_DELIVERY' || status === 'DELIVERED') {
    events.push({
      time: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      status: 'OUT_FOR_DELIVERY',
      description: '快递员正在派送中',
      location: '目的地城市',
    })
  }

  if (status === 'DELIVERED') {
    events.push({
      time: now.toISOString(),
      status: 'DELIVERED',
      description: '快件已签收，感谢您的使用',
      location: '目的地城市',
    })
  }

  return {
    success: true,
    trackingNumber,
    carrier,
    status,
    estimatedDelivery: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000),
    events: events.reverse(),
  }
}

// Get carrier name by code
export function getCarrierName(carrierCode: string): string {
  const carrier = supportedCarriers.find((c) => c.code === carrierCode || c.id === carrierCode)
  return carrier?.name || carrierCode
}
