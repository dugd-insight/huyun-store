// Payment Types and Interfaces

export type PaymentMethod = 'alipay' | 'wechatpay' | 'stripe' | 'cash'

export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED' | 'REFUNDED' | 'CANCELLED'

export interface PaymentOrder {
  id: string
  orderId: string
  amount: number
  currency: string
  method: PaymentMethod
  status: PaymentStatus
  description?: string
  metadata?: Record<string, string>
  createdAt: Date
  updatedAt: Date
  paidAt?: Date
  refundedAt?: Date
}

export interface CreatePaymentRequest {
  orderId: string
  amount: number
  currency?: string
  description?: string
  metadata?: Record<string, string>
  returnUrl?: string
  notifyUrl?: string
}

export interface PaymentResponse {
  success: boolean
  paymentId: string
  orderId: string
  amount: number
  currency: string
  status: PaymentStatus
  qrCode?: string
  paymentUrl?: string
  paymentForm?: string
  clientSecret?: string
  message?: string
}

export interface PaymentQueryResult {
  success: boolean
  paymentId: string
  orderId: string
  amount: number
  currency: string
  status: PaymentStatus
  paidAt?: Date
  method: PaymentMethod
  transactionId?: string
}

export interface RefundRequest {
  paymentId: string
  amount?: number
  reason?: string
}

export interface RefundResult {
  success: boolean
  refundId: string
  paymentId: string
  amount: number
  status: 'SUCCESS' | 'PENDING' | 'FAILED'
  message?: string
}

// Alipay specific types
export interface AlipayConfig {
  appId: string
  privateKey: string
  publicKey: string
  gatewayUrl: string
  notifyUrl: string
  returnUrl: string
  signType: 'RSA2'
  charset: 'utf-8'
  format: 'JSON'
}

export interface AlipayTradeCreateRequest {
  outTradeNo: string
  totalAmount: string
  subject: string
  body?: string
  timeoutExpress?: string
  notifyUrl?: string
  returnUrl?: string
}

export interface AlipayTradeQueryResponse {
  code: string
  msg: string
  tradeNo: string
  outTradeNo: string
  buyerLogonId: string
  tradeStatus: string
  totalAmount: string
  receiptAmount: string
  buyerPayAmount: string
  pointAmount: string
  invoiceAmount: string
  sendPayDate: string
}

// WeChat Pay specific types
export interface WechatPayConfig {
  appId: string
  mchId: string
  apiKey: string
  apiKeyV3?: string
  certPath?: string
  keyPath?: string
  notifyUrl: string
  spbillCreateIp: string
}

export interface WechatPayUnifiedOrderRequest {
  body: string
  outTradeNo: string
  totalFee: number
  spbillCreateIp: string
  notifyUrl: string
  tradeType: 'NATIVE' | 'JSAPI' | 'APP' | 'H5' | 'MWEB'
  openid?: string
  productId?: string
  sceneInfo?: string
}

export interface WechatPayUnifiedOrderResponse {
  returnCode: string
  returnMsg: string
  resultCode: string
  errCode?: string
  errCodeDes?: string
  prepayId?: string
  codeUrl?: string
  mwebUrl?: string
}

// Stripe specific types
export interface StripeConfig {
  secretKey: string
  publishableKey: string
  webhookSecret: string
  currency: string
}

export interface StripePaymentIntent {
  id: string
  clientSecret: string
  amount: number
  currency: string
  status: string
}

// Webhook payload types
export interface WebhookPayload {
  event: string
  timestamp: number
  signature: string
  data: {
    paymentId: string
    orderId: string
    amount: number
    currency: string
    status: PaymentStatus
    method: PaymentMethod
    transactionId?: string
    metadata?: Record<string, string>
  }
}

// Mock payment storage
export interface MockPaymentRecord {
  id: string
  orderId: string
  amount: number
  currency: string
  method: PaymentMethod
  status: PaymentStatus
  qrCode?: string
  paymentUrl?: string
  clientSecret?: string
  transactionId?: string
  createdAt: string
  updatedAt: string
  paidAt?: string
  refundedAt?: string
  metadata?: Record<string, string>
}
