'use client'

import { Package, Truck, MapPin, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TrackingResult as TrackingResultType } from '@/lib/logistics/service'

interface TrackingResultProps {
  result: TrackingResultType
  className?: string
}

const statusConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  PENDING: { icon: Clock, color: 'text-amber-500', label: '待发货' },
  PICKED_UP: { icon: Package, color: 'text-blue-500', label: '已揽收' },
  IN_TRANSIT: { icon: Truck, color: 'text-blue-500', label: '运输中' },
  OUT_FOR_DELIVERY: { icon: Truck, color: 'text-purple-500', label: '派送中' },
  DELIVERED: { icon: CheckCircle, color: 'text-emerald-500', label: '已签收' },
  EXCEPTION: { icon: AlertCircle, color: 'text-red-500', label: '异常' },
  RETURNED: { icon: Package, color: 'text-stone-500', label: '已退回' },
}

export function TrackingResult({ result, className }: TrackingResultProps) {
  const { trackingNumber, carrier, status, estimatedDelivery, events } = result
  const StatusIcon = statusConfig[status]?.icon || Package
  const statusColor = statusConfig[status]?.color || 'text-stone-500'
  const statusLabel = statusConfig[status]?.label || status

  const carrierNames: Record<string, string> = {
    SF: '顺丰速运',
    YTO: '圆通速递',
    ZTO: '中通快递',
    STO: '申通快递',
    EMS: 'EMS',
    JD: '京东物流',
    DHL: 'DHL',
    FEDEX: 'FedEx',
    UPS: 'UPS',
  }

  return (
    <div className={cn('bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden', className)}>
      {/* Header */}
      <div className="bg-stone-50 px-6 py-4 border-b border-stone-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <StatusIcon className={cn('w-5 h-5', statusColor)} />
              <span className={cn('font-semibold', statusColor)}>{statusLabel}</span>
            </div>
            <p className="text-sm text-stone-500">
              {carrierNames[carrier] || carrier} · {trackingNumber}
            </p>
          </div>
          {estimatedDelivery && (
            <div className="text-right">
              <p className="text-xs text-stone-500">预计送达</p>
              <p className="font-medium text-stone-900">
                {new Date(estimatedDelivery).toLocaleDateString('zh-CN')}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="p-6">
        <div className="relative">
          {events.map((event, index) => {
            const isLatest = index === 0
            const EventIcon = index === 0 ? StatusIcon : MapPin

            return (
              <div key={index} className="flex gap-4 pb-6 last:pb-0">
                {/* Timeline line */}
                {index < events.length - 1 && (
                  <div className="absolute left-[11px] top-6 bottom-0 w-0.5 bg-stone-200" />
                )}

                {/* Icon */}
                <div
                  className={cn(
                    'relative z-10 flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center',
                    isLatest ? 'bg-cinnabar' : 'bg-stone-200'
                  )}
                >
                  <EventIcon className={cn('w-3 h-3', isLatest ? 'text-white' : 'text-stone-500')} />
                </div>

                {/* Content */}
                <div className="flex-1 -mt-1">
                  <p className={cn('font-medium', isLatest ? 'text-stone-900' : 'text-stone-600')}>
                    {event.description}
                  </p>
                  {event.location && (
                    <p className="text-sm text-stone-500 mt-0.5">{event.location}</p>
                  )}
                  <p className="text-xs text-stone-400 mt-1">
                    {new Date(event.time).toLocaleString('zh-CN', {
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default TrackingResult
