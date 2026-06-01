'use client'

import { useState, useEffect } from 'react'
import { Loader2, CreditCard, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PaymentResponse } from '@/lib/payment'

interface StripeCardFormProps {
  paymentResponse: PaymentResponse
  onSuccess?: () => void
  onCancel?: () => void
  onError?: (error: string) => void
  className?: string
}

export function StripeCardForm({
  paymentResponse,
  onSuccess,
  onCancel,
  onError,
  className,
}: StripeCardFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvc, setCvc] = useState('')
  const [name, setName] = useState('')

  // Demo mode auto-complete
  useEffect(() => {
    if (paymentResponse.message?.includes('Demo Mode')) {
      const timer = setTimeout(() => {
        onSuccess?.()
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [paymentResponse.message, onSuccess])

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ''
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
      return parts.join(' ')
    } else {
      return v
    }
  }

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`
    }
    return v
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // In real implementation, this would use Stripe.js to create a payment method
      // and confirm the payment intent

      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Check payment status
      const response = await fetch(
        `/api/payment/stripe?paymentId=${paymentResponse.paymentId}`
      )
      const result = await response.json()

      if (result.success && result.status === 'SUCCESS') {
        onSuccess?.()
      } else {
        onError?.('Payment failed. Please try again.')
      }
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'Payment failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn('p-6', className)}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Card Number */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">
            卡号
          </label>
          <div className="relative">
            <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
            <input
              type="text"
              placeholder="0000 0000 0000 0000"
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
              maxLength={19}
              className="w-full pl-10 pr-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-cinnabar focus:border-cinnabar outline-none transition-all"
              required
            />
          </div>
        </div>

        {/* Expiry and CVC */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              有效期
            </label>
            <input
              type="text"
              placeholder="MM/YY"
              value={expiry}
              onChange={(e) => setExpiry(formatExpiry(e.target.value))}
              maxLength={5}
              className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-cinnabar focus:border-cinnabar outline-none transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              CVC
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                placeholder="123"
                value={cvc}
                onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                maxLength={4}
                className="w-full pl-9 pr-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-cinnabar focus:border-cinnabar outline-none transition-all"
                required
              />
            </div>
          </div>
        </div>

        {/* Cardholder Name */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">
            持卡人姓名
          </label>
          <input
            type="text"
            placeholder="Full name on card"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-cinnabar focus:border-cinnabar outline-none transition-all"
            required
          />
        </div>

        {/* Amount Display */}
        <div className="bg-stone-50 rounded-lg p-4 text-center">
          <p className="text-sm text-stone-500">支付金额</p>
          <p className="text-2xl font-bold text-cinnabar">
            ${paymentResponse.amount.toFixed(2)}
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-cinnabar text-white py-3 rounded-lg font-medium hover:bg-cinnabar/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              处理中...
            </>
          ) : (
            '确认支付'
          )}
        </button>

        {/* Cancel Button */}
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="w-full py-3 text-stone-500 hover:text-stone-700 transition-colors"
        >
          取消支付
        </button>
      </form>

      {/* Security Notice */}
      <div className="mt-4 flex items-center justify-center text-xs text-stone-400">
        <Lock className="w-3 h-3 mr-1" />
        <span>安全加密支付</span>
      </div>

      {/* Demo Mode Notice */}
      {paymentResponse.message?.includes('Demo Mode') && (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-xs text-amber-700">
            <strong>演示模式:</strong> 支付将在5秒后自动完成
          </p>
        </div>
      )}
    </div>
  )
}

export default StripeCardForm
