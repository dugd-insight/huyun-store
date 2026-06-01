'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Loader2, CheckCircle, XCircle, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PaymentResponse, PaymentQueryResult } from '@/lib/payment'

interface WechatPayQRProps {
  paymentResponse: PaymentResponse
  onSuccess?: () => void
  onCancel?: () => void
  onError?: (error: string) => void
  className?: string
}

export function WechatPayQR({
  paymentResponse,
  onSuccess,
  onCancel,
  onError,
  className,
}: WechatPayQRProps) {
  const [status, setStatus] = useState<'pending' | 'success' | 'failed'>('pending')
  const [isPolling, setIsPolling] = useState(true)

  // Poll for payment status
  useEffect(() => {
    if (!paymentResponse.paymentId || !isPolling) return

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(
          `/api/payment/wechatpay?paymentId=${paymentResponse.paymentId}`
        )
        const result: PaymentQueryResult = await response.json()

        if (result.success) {
          if (result.status === 'SUCCESS') {
            setStatus('success')
            setIsPolling(false)
            onSuccess?.()
          } else if (result.status === 'FAILED' || result.status === 'CANCELLED') {
            setStatus('failed')
            setIsPolling(false)
            onError?.('支付失败')
          }
        }
      } catch (error) {
        console.error('Payment status check error:', error)
      }
    }, 3000) // Check every 3 seconds

    // Stop polling after 5 minutes
    const timeout = setTimeout(() => {
      setIsPolling(false)
    }, 5 * 60 * 1000)

    return () => {
      clearInterval(pollInterval)
      clearTimeout(timeout)
    }
  }, [paymentResponse.paymentId, isPolling, onSuccess, onError])

  const handleRefresh = () => {
    setStatus('pending')
    setIsPolling(true)
  }

  return (
    <div className={cn('flex flex-col items-center p-6', className)}>
      {/* QR Code Display */}
      <div className="relative w-48 h-48 mb-4">
        {paymentResponse.qrCode ? (
          <Image
            src={paymentResponse.qrCode}
            alt="微信支付二维码"
            fill
            className="object-contain"
          />
        ) : (
          <div className="w-full h-full bg-stone-100 rounded-lg flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-stone-400 animate-spin" />
          </div>
        )}

        {/* Status Overlay */}
        {status === 'success' && (
          <div className="absolute inset-0 bg-white/90 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
              <p className="text-emerald-600 font-medium">支付成功</p>
            </div>
          </div>
        )}

        {status === 'failed' && (
          <div className="absolute inset-0 bg-white/90 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <XCircle className="w-12 h-12 text-red-500 mx-auto mb-2" />
              <p className="text-red-600 font-medium">支付失败</p>
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="text-center space-y-2">
        <p className="text-stone-700 font-medium">请使用微信扫描二维码</p>
        <p className="text-sm text-stone-500">
          订单金额: <span className="font-semibold text-cinnabar">¥{paymentResponse.amount.toFixed(2)}</span>
        </p>
        {paymentResponse.message && (
          <p className="text-xs text-stone-400">{paymentResponse.message}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-6">
        {status === 'failed' && (
          <button
            onClick={handleRefresh}
            className="flex items-center px-4 py-2 bg-stone-100 text-stone-700 rounded-lg hover:bg-stone-200 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            刷新
          </button>
        )}
        <button
          onClick={onCancel}
          className="px-4 py-2 text-stone-500 hover:text-stone-700 transition-colors"
        >
          取消支付
        </button>
      </div>

      {/* Demo Mode Notice */}
      {paymentResponse.message?.includes('演示模式') && (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-xs text-amber-700">
            <strong>演示模式:</strong> 支付将在10秒后自动完成
          </p>
        </div>
      )}
    </div>
  )
}

export default WechatPayQR
