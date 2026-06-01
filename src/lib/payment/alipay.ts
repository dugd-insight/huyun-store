// Alipay Payment Integration
import {
  AlipayConfig,
  AlipayTradeCreateRequest,
  CreatePaymentRequest,
  PaymentResponse,
  PaymentQueryResult,
  RefundRequest,
  RefundResult,
} from './types'
import {
  createPaymentRecord,
  getPaymentRecord,
  getPaymentRecordByOrderId,
  updatePaymentStatus,
  simulatePaymentCompletion,
} from './mock-storage'

// Check if we're in mock mode (no real API credentials)
const isMockMode = !process.env.ALIPAY_APP_ID || process.env.ALIPAY_APP_ID === 'mock'

// Alipay configuration
const getAlipayConfig = (): AlipayConfig => ({
  appId: process.env.ALIPAY_APP_ID || 'mock_app_id',
  privateKey: process.env.ALIPAY_PRIVATE_KEY || 'mock_private_key',
  publicKey: process.env.ALIPAY_PUBLIC_KEY || 'mock_public_key',
  gatewayUrl: process.env.ALIPAY_GATEWAY_URL || 'https://openapi.alipay.com/gateway.do',
  notifyUrl: process.env.ALIPAY_NOTIFY_URL || `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/webhook`,
  returnUrl: process.env.ALIPAY_RETURN_URL || `${process.env.NEXT_PUBLIC_APP_URL}/payment/return`,
  signType: 'RSA2',
  charset: 'utf-8',
  format: 'JSON',
})

// Create Alipay payment order
export async function createAlipayOrder(
  request: CreatePaymentRequest
): Promise<PaymentResponse> {
  const config = getAlipayConfig()
  const { orderId, amount, currency = 'CNY', description = '订单支付' } = request

  if (isMockMode) {
    // Mock mode: Create local payment record
    const record = createPaymentRecord(orderId, amount, currency, 'alipay', request.metadata)

    // Simulate auto-completion after 5 seconds (for demo)
    simulatePaymentCompletion(record.id, 10000)

    return {
      success: true,
      paymentId: record.id,
      orderId,
      amount,
      currency,
      status: 'PENDING',
      qrCode: record.qrCode,
      message: '请使用支付宝扫描二维码完成支付（演示模式）',
    }
  }

  // Real Alipay API integration
  try {
    const tradeRequest: AlipayTradeCreateRequest = {
      outTradeNo: orderId,
      totalAmount: amount.toFixed(2),
      subject: description,
      body: request.metadata ? JSON.stringify(request.metadata) : undefined,
      timeoutExpress: '30m',
      notifyUrl: config.notifyUrl,
      returnUrl: request.returnUrl || config.returnUrl,
    }

    // Call Alipay API
    const response = await callAlipayApi('alipay.trade.precreate', tradeRequest as unknown as Record<string, unknown>, config)

    if (response.code === '10000') {
      // Create payment record
      const record = createPaymentRecord(orderId, amount, currency, 'alipay', request.metadata)

      return {
        success: true,
        paymentId: record.id,
        orderId,
        amount,
        currency,
        status: 'PENDING',
        qrCode: response.qrCode,
        message: '请使用支付宝扫描二维码完成支付',
      }
    } else {
      return {
        success: false,
        paymentId: '',
        orderId,
        amount,
        currency,
        status: 'FAILED',
        message: response.msg || '创建支付订单失败',
      }
    }
  } catch (error) {
    console.error('Alipay create order error:', error)
    return {
      success: false,
      paymentId: '',
      orderId,
      amount,
      currency,
      status: 'FAILED',
      message: error instanceof Error ? error.message : '创建支付订单失败',
    }
  }
}

// Query Alipay payment status
export async function queryAlipayOrder(paymentId: string): Promise<PaymentQueryResult> {
  const record = getPaymentRecord(paymentId)

  if (!record) {
    return {
      success: false,
      paymentId,
      orderId: '',
      amount: 0,
      currency: 'CNY',
      status: 'FAILED',
      method: 'alipay',
    }
  }

  if (isMockMode) {
    // Mock mode: Return current status
    return {
      success: true,
      paymentId: record.id,
      orderId: record.orderId,
      amount: record.amount,
      currency: record.currency,
      status: record.status,
      paidAt: record.paidAt ? new Date(record.paidAt) : undefined,
      method: 'alipay',
      transactionId: record.transactionId,
    }
  }

  // Real Alipay API integration
  try {
    const config = getAlipayConfig()
    const response = await callAlipayApi(
      'alipay.trade.query',
      { outTradeNo: record.orderId },
      config
    )

    if (response.code === '10000') {
      const status = mapAlipayStatus(response.tradeStatus)

      // Update local record if status changed
      if (status !== record.status) {
        updatePaymentStatus(record.id, status, response.tradeNo)
      }

      return {
        success: true,
        paymentId: record.id,
        orderId: record.orderId,
        amount: parseFloat(response.totalAmount),
        currency: record.currency,
        status,
        paidAt: response.sendPayDate ? new Date(response.sendPayDate) : undefined,
        method: 'alipay',
        transactionId: response.tradeNo,
      }
    } else {
      return {
        success: false,
        paymentId,
        orderId: record.orderId,
        amount: record.amount,
        currency: record.currency,
        status: record.status,
        method: 'alipay',
      }
    }
  } catch (error) {
    console.error('Alipay query error:', error)
    return {
      success: false,
      paymentId,
      orderId: record.orderId,
      amount: record.amount,
      currency: record.currency,
      status: record.status,
      method: 'alipay',
    }
  }
}

// Process Alipay refund
export async function refundAlipayOrder(request: RefundRequest): Promise<RefundResult> {
  const { paymentId, amount, reason } = request
  const record = getPaymentRecord(paymentId)

  if (!record) {
    return {
      success: false,
      refundId: '',
      paymentId,
      amount: amount || 0,
      status: 'FAILED',
      message: '支付记录不存在',
    }
  }

  const refundAmount = amount || record.amount

  if (isMockMode) {
    // Mock mode: Process refund immediately
    updatePaymentStatus(record.id, 'REFUNDED')

    return {
      success: true,
      refundId: `ref_${Date.now()}`,
      paymentId,
      amount: refundAmount,
      status: 'SUCCESS',
      message: '退款成功（演示模式）',
    }
  }

  // Real Alipay API integration
  try {
    const config = getAlipayConfig()
    const response = await callAlipayApi(
      'alipay.trade.refund',
      {
        outTradeNo: record.orderId,
        refundAmount: refundAmount.toFixed(2),
        refundReason: reason || '用户申请退款',
      },
      config
    )

    if (response.code === '10000') {
      updatePaymentStatus(record.id, 'REFUNDED')

      return {
        success: true,
        refundId: response.refundNo,
        paymentId,
        amount: refundAmount,
        status: 'SUCCESS',
        message: '退款成功',
      }
    } else {
      return {
        success: false,
        refundId: '',
        paymentId,
        amount: refundAmount,
        status: 'FAILED',
        message: response.msg || '退款失败',
      }
    }
  } catch (error) {
    console.error('Alipay refund error:', error)
    return {
      success: false,
      refundId: '',
      paymentId,
      amount: refundAmount,
      status: 'FAILED',
      message: error instanceof Error ? error.message : '退款失败',
    }
  }
}

// Handle Alipay webhook/notify
export async function handleAlipayNotify(payload: Record<string, string>): Promise<boolean> {
  if (isMockMode) {
    return true
  }

  try {
    // Verify signature
    const isValid = verifyAlipaySignature(payload, getAlipayConfig())
    if (!isValid) {
      console.error('Alipay signature verification failed')
      return false
    }

    const { out_trade_no, trade_status, trade_no } = payload

    if (trade_status === 'TRADE_SUCCESS' || trade_status === 'TRADE_FINISHED') {
      const record = getPaymentRecordByOrderId(out_trade_no)
      if (record) {
        updatePaymentStatus(record.id, 'SUCCESS', trade_no)
      }
    }

    return true
  } catch (error) {
    console.error('Alipay notify error:', error)
    return false
  }
}

// Helper: Call Alipay API
async function callAlipayApi(
  method: string,
  bizContent: Record<string, unknown>,
  config: AlipayConfig
): Promise<Record<string, string>> {
  const timestamp = new Date().toISOString().replace(/\..*/, '+08:00')
  const params: Record<string, string> = {
    app_id: config.appId,
    method,
    format: config.format,
    charset: config.charset,
    sign_type: config.signType,
    timestamp,
    version: '1.0',
    biz_content: JSON.stringify(bizContent),
  }

  // Generate signature
  params.sign = generateAlipaySignature(params, config)

  const response = await fetch(config.gatewayUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(params).toString(),
  })

  const data = await response.json()
  const responseKey = method.replace(/\./g, '_') + '_response'

  return data[responseKey] || data
}

// Helper: Generate Alipay signature
function generateAlipaySignature(params: Record<string, string>, config: AlipayConfig): string {
  // Remove sign and sign_type from params
  const filteredParams = Object.fromEntries(
    Object.entries(params).filter(([key]) => key !== 'sign' && key !== 'sign_type')
  )

  // Sort params by key
  const sortedKeys = Object.keys(filteredParams).sort()
  const signString = sortedKeys
    .map((key) => `${key}=${filteredParams[key]}`)
    .join('&')

  // In real implementation, use crypto to sign with RSA2
  // This is a mock implementation
  return `mock_sign_${Buffer.from(signString).toString('base64').slice(0, 20)}`
}

// Helper: Verify Alipay signature
function verifyAlipaySignature(payload: Record<string, string>, config: AlipayConfig): boolean {
  // In real implementation, verify signature with Alipay public key
  // This is a mock implementation
  return true
}

// Helper: Map Alipay trade status to our status
function mapAlipayStatus(tradeStatus: string): 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED' | 'REFUNDED' | 'CANCELLED' {
  const statusMap: Record<string, 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED' | 'REFUNDED' | 'CANCELLED'> = {
    WAIT_BUYER_PAY: 'PENDING',
    TRADE_CLOSED: 'CANCELLED',
    TRADE_SUCCESS: 'SUCCESS',
    TRADE_FINISHED: 'SUCCESS',
  }
  return statusMap[tradeStatus] || 'PENDING'
}
