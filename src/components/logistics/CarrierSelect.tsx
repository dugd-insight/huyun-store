'use client'

import { useEffect, useState } from 'react'
import { Truck } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Carrier {
  id: string
  name: string
  code: string
}

interface CarrierSelectProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

export function CarrierSelect({ value, onChange, className }: CarrierSelectProps) {
  const [carriers, setCarriers] = useState<Carrier[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchCarriers()
  }, [])

  const fetchCarriers = async () => {
    try {
      const response = await fetch('/api/logistics/carriers')
      const data = await response.json()
      setCarriers(data.carriers || [])
    } catch (error) {
      console.error('Failed to fetch carriers:', error)
      // Fallback carriers
      setCarriers([
        { id: 'sf-express', name: '顺丰速运', code: 'SF' },
        { id: 'yto', name: '圆通速递', code: 'YTO' },
        { id: 'zto', name: '中通快递', code: 'ZTO' },
        { id: 'sto', name: '申通快递', code: 'STO' },
        { id: 'ems', name: 'EMS', code: 'EMS' },
        { id: 'jd', name: '京东物流', code: 'JD' },
        { id: 'dhl', name: 'DHL', code: 'DHL' },
        { id: 'fedex', name: 'FedEx', code: 'FEDEX' },
        { id: 'ups', name: 'UPS', code: 'UPS' },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn('relative', className)}>
      <Truck className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={isLoading}
        className="w-full pl-10 pr-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-cinnabar focus:border-cinnabar outline-none transition-all bg-white disabled:opacity-50"
      >
        <option value="">选择物流公司</option>
        {carriers.map((carrier) => (
          <option key={carrier.id} value={carrier.code}>
            {carrier.name}
          </option>
        ))}
      </select>
    </div>
  )
}

export default CarrierSelect
