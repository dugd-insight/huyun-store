'use client'

import { useState } from 'react'
import { CreditCard, QrCode, Wallet, Truck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PaymentMethod, PaymentMethodInfo, paymentMethods, getAvailablePaymentMethods } from '@/lib/payment'

interface PaymentMethodsProps {
  selectedMethod: PaymentMethod | null
  onSelect: (method: PaymentMethod) => void
  currency?: string
  className?: string
}

const methodIcons: Record<string, React.ElementType> = {
  alipay: QrCode,
  wechatpay: QrCode,
  stripe: CreditCard,
  cash: Truck,
}

export function PaymentMethods({
  selectedMethod,
  onSelect,
  currency = 'CNY',
  className,
}: PaymentMethodsProps) {
  const [availableMethods] = useState<PaymentMethodInfo[]>(() =>
    getAvailablePaymentMethods(currency)
  )

  return (
    <div className={cn('space-y-3', className)}>
      <h3 className="text-sm font-medium text-stone-700">选择支付方式</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {availableMethods.map((method) => {
          const Icon = methodIcons[method.id] || Wallet
          const isSelected = selectedMethod === method.id

          return (
            <button
              key={method.id}
              onClick={() => onSelect(method.id)}
              className={cn(
                'flex items-center p-4 rounded-xl border-2 transition-all duration-200 text-left',
                isSelected
                  ? 'border-cinnabar bg-cinnabar/5'
                  : 'border-stone-200 hover:border-stone-300 hover:bg-stone-50'
              )}
            >
              <div
                className={cn(
                  'flex items-center justify-center w-10 h-10 rounded-lg mr-3',
                  isSelected ? 'bg-cinnabar text-white' : 'bg-stone-100 text-stone-600'
                )}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className={cn('font-medium', isSelected ? 'text-cinnabar' : 'text-stone-900')}>
                  {method.name}
                </p>
                <p className="text-xs text-stone-500">{method.description}</p>
              </div>
              {isSelected && (
                <div className="w-5 h-5 rounded-full bg-cinnabar flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default PaymentMethods
