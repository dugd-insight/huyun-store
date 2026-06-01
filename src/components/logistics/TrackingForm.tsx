'use client'

import { useState } from 'react'
import { Search, Package } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TrackingFormProps {
  onTrack: (trackingNumber: string, carrier?: string) => void
  isLoading?: boolean
  className?: string
}

export function TrackingForm({ onTrack, isLoading, className }: TrackingFormProps) {
  const [trackingNumber, setTrackingNumber] = useState('')
  const [carrier, setCarrier] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (trackingNumber.trim()) {
      onTrack(trackingNumber.trim(), carrier || undefined)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-4', className)}>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
          <input
            type="text"
            placeholder="请输入快递单号"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-cinnabar focus:border-cinnabar outline-none transition-all"
            required
          />
        </div>
        <select
          value={carrier}
          onChange={(e) => setCarrier(e.target.value)}
          className="px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-cinnabar focus:border-cinnabar outline-none transition-all bg-white"
        >
          <option value="">自动识别</option>
          <option value="SF">顺丰速运</option>
          <option value="YTO">圆通速递</option>
          <option value="ZTO">中通快递</option>
          <option value="STO">申通快递</option>
          <option value="EMS">EMS</option>
          <option value="JD">京东物流</option>
          <option value="DHL">DHL</option>
          <option value="FEDEX">FedEx</option>
          <option value="UPS">UPS</option>
        </select>
        <button
          type="submit"
          disabled={isLoading || !trackingNumber.trim()}
          className="px-6 py-3 bg-cinnabar text-white rounded-lg font-medium hover:bg-cinnabar/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              查询中...
            </>
          ) : (
            <>
              <Search className="w-5 h-5 mr-2" />
              查询
            </>
          )}
        </button>
      </div>
    </form>
  )
}

export default TrackingForm
