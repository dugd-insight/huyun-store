'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, Clock, Loader2, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PaymentQueryResult, PaymentMethod } from '@/lib/payment'

interface PaymentStatusProps {
  paymentId: string
  method: PaymentMethod
  onStatusChange?: (status: 'success' | 'failed' | 'pending') => void
  className?: string
}

export function PaymentStatus({
  paymentId,
  method,
  onStatusChange,
  className,
}: PaymentStatusProps) {
  const [status, setStatus] = useState<'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED' | 'REFUNDED' | 'CANCELLED'>('PENDING')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const checkStatus = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/payment/${method}?paymentId=${paymentId}`)
      const result: PaymentQueryResult = await response.json()

      if (result.success) {
        setStatus(result.status)

        if (result.status === 'SUCCESS') {
          onStatusChange?.('success')
        } else if (result.status === 'FAILED' || result.status === 'CANCELLED') {
          onStatusChange?.('failed')
        } else {
          onStatusChange?.('pending')
        }
      } else {
        setError('无法获取支付状态')
      }
    } catch (err) {
      setError('检查支付状态时出错')
    } finally {
      setIsLoading(false)
    }
  }

  // Initial check and polling
  useEffect(() => {
    checkStatus()

    // Poll every 3 seconds if still pending
    const interval = setInterval(() => {
      if (status === 'PENDING' || status === 'PROCESSING') {
        checkStatus()
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [paymentId, method, status])

  const getStatusConfig = () => {
    switch (status) {
      case 'SUCCESS':
        return {
          icon: CheckCircle,
          color: 'text-emerald-500',
          bgColor: 'bg-emerald-50',
          borderColor: 'border-emerald-200',
          title: '支付成功',
          description: '您的订单已支付成功',
        }
      case 'FAILED':
        return {
          icon: XCircle,
          color: 'text-red-500',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          title: '支付失败',
          description: '支付过程中出现问题，请重试',
        }
      case 'CANCELLED':
        return {
          icon: XCircle,
          color: 'text-stone-500',
          bgColor: 'bg-stone-50',
          borderColor: 'border-stone-200',
          title: '支付已取消',
          description: '您已取消此次支付',
        }
      case 'REFUNDED':
        return {
          icon: RefreshCw,
          color: 'text-amber-500',
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200',
          title: '已退款',
          description: '该订单已退款',
        }
      case 'PROCESSING':
        return {
          icon: Loader2,
          color: 'text-blue-500',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          title: '处理中',
          description: '正在处理您的支付，请稍候',
        }
      default:
        return {
          icon: Clock,
          color: 'text-amber-500',
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200',
          title: '等待支付',
          description: '请完成支付操作',
        }
    }
  }

  const config = getStatusConfig()
  const Icon = config.icon

  return (
    <div
      className={cn(
        'p-6 rounded-xl border-2',
        config.bgColor,
        config.borderColor,
        className
      )}
    >
      <div className="flex flex-col items-center text-center">
        <div className={cn('mb-4', config.color)}>
          <Icon className={cn('w-16 h-16', status === 'PENDING' || status === 'PROCESSING' ? 'animate-pulse' : '')} />
        </div>

        <h3 className={cn('text-xl font-semibold mb-2', config.color)}>
          {config.title}
        </h3>

        <p className="text-stone-600 mb-4">{config.description}</p>

        {isLoading && (
          <div className="flex items-center text-stone-500">
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            <span className="text-sm">正在检查支付状态...</span>
          </div>
        )}

        {error && (
          <div className="mt-2">
            <p className="text-red-500 text-sm">{error}</p>
            <button
              onClick={checkStatus}
              className="mt-2 text-sm text-cinnabar hover:underline"
            >
              重试
            </button>
          </div>
        )}

        {/* Payment Details */}
        <div className="mt-4 pt-4 border-t border-stone-200 w-full">
          <div className="flex justify-between text-sm">
            <span className="text-stone-500">支付方式</span>
            <span className="font-medium text-stone-900">
              {method === 'alipay' && '支付宝'}
              {method === 'wechatpay' && '微信支付'}
              {method === 'stripe' && '信用卡'}
              {method === 'cash' && '货到付款'}
            </span>
          </div>
          <div className="flex justify-between text-sm mt-2">
            <span className="text-stone-500">支付单号</span>
            <span className="font-medium text-stone-900 font-mono">
              {paymentId.slice(-12)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentStatus
