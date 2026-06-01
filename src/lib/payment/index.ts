// Payment Module - Main exports

export * from './types'
export * from './mock-storage'
export * from './alipay'
export * from './wechatpay'
export * from './stripe'

import {
  CreatePaymentRequest,
  PaymentResponse,
  PaymentQueryResult,
  RefundRequest,
  RefundResult,
  PaymentMethod,
} from './types'
import { createAlipayOrder, queryAlipayOrder, refundAlipayOrder } from './alipay'
import {
  createWechatPayNativeOrder,
  createWechatPayJSAPIOrder,
  createWechatPayH5Order,
  queryWechatPayOrder,
  refundWechatPayOrder,
} from './wechatpay'
import { createStripePaymentIntent, queryStripePayment, refundStripePayment } from './stripe'

// Unified payment interface
export async function createPayment(
  method: PaymentMethod,
  request: CreatePaymentRequest
): Promise<PaymentResponse> {
  switch (method) {
    case 'alipay':
      return createAlipayOrder(request)
    case 'wechatpay':
      return createWechatPayNativeOrder(request)
    case 'stripe':
      return createStripePaymentIntent(request)
    default:
      return {
        success: false,
        paymentId: '',
        orderId: request.orderId,
        amount: request.amount,
        currency: request.currency || 'CNY',
        status: 'FAILED',
        message: 'Unsupported payment method',
      }
  }
}

// Unified payment query
export async function queryPayment(
  method: PaymentMethod,
  paymentId: string
): Promise<PaymentQueryResult> {
  switch (method) {
    case 'alipay':
      return queryAlipayOrder(paymentId)
    case 'wechatpay':
      return queryWechatPayOrder(paymentId)
    case 'stripe':
      return queryStripePayment(paymentId)
    default:
      return {
        success: false,
        paymentId,
        orderId: '',
        amount: 0,
        currency: 'CNY',
        status: 'FAILED',
        method,
      }
  }
}

// Unified refund
export async function processRefund(
  method: PaymentMethod,
  request: RefundRequest
): Promise<RefundResult> {
  switch (method) {
    case 'alipay':
      return refundAlipayOrder(request)
    case 'wechatpay':
      return refundWechatPayOrder(request)
    case 'stripe':
      return refundStripePayment(request)
    default:
      return {
        success: false,
        refundId: '',
        paymentId: request.paymentId,
        amount: request.amount || 0,
        status: 'FAILED',
        message: 'Unsupported payment method',
      }
  }
}

// Payment method display info
export interface PaymentMethodInfo {
  id: PaymentMethod
  name: string
  description: string
  icon: string
  supportedCurrencies: string[]
  isAvailable: boolean
}

export const paymentMethods: PaymentMethodInfo[] = [
  {
    id: 'alipay',
    name: '支付宝',
    description: '使用支付宝扫描二维码完成支付',
    icon: 'alipay',
    supportedCurrencies: ['CNY'],
    isAvailable: true,
  },
  {
    id: 'wechatpay',
    name: '微信支付',
    description: '使用微信扫描二维码完成支付',
    icon: 'wechatpay',
    supportedCurrencies: ['CNY'],
    isAvailable: true,
  },
  {
    id: 'stripe',
    name: '信用卡/借记卡',
    description: '支持 Visa、MasterCard、American Express 等国际信用卡',
    icon: 'stripe',
    supportedCurrencies: ['USD', 'EUR', 'GBP', 'JPY', 'CNY'],
    isAvailable: true,
  },
  {
    id: 'cash',
    name: '货到付款',
    description: '商品送达时支付现金',
    icon: 'cash',
    supportedCurrencies: ['CNY'],
    isAvailable: true,
  },
]

export function getPaymentMethodInfo(method: PaymentMethod): PaymentMethodInfo | undefined {
  return paymentMethods.find(m => m.id === method)
}

export function getAvailablePaymentMethods(currency?: string): PaymentMethodInfo[] {
  if (!currency) {
    return paymentMethods.filter(m => m.isAvailable)
  }
  return paymentMethods.filter(
    m => m.isAvailable && m.supportedCurrencies.includes(currency.toUpperCase())
  )
}
