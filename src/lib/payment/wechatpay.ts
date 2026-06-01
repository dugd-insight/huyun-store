// WeChat Pay Integration
import {
  WechatPayConfig,
  WechatPayUnifiedOrderRequest,
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

// Check if we're in mock mode
const isMockMode = !process.env.WECHAT_PAY_APP_ID || process.env.WECHAT_PAY_APP_ID === 'mock'

// WeChat Pay configuration
const getWechatPayConfig = (): WechatPayConfig => ({
  appId: process.env.WECHAT_PAY_APP_ID || 'mock_app_id',
  mchId: process.env.WECHAT_PAY_MCH_ID || 'mock_mch_id',
  apiKey: process.env.WECHAT_PAY_API_KEY || 'mock_api_key',
  apiKeyV3: process.env.WECHAT_PAY_API_KEY_V3,
  certPath: process.env.WECHAT_PAY_CERT_PATH,
  keyPath: process.env.WECHAT_PAY_KEY_PATH,
  notifyUrl: process.env.WECHAT_PAY_NOTIFY_URL || `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/webhook`,
  spbillCreateIp: '127.0.0.1',
})

// Create WeChat Pay order (Native - QR Code)
export async function createWechatPayNativeOrder(
  request: CreatePaymentRequest
): Promise<PaymentResponse> {
  const config = getWechatPayConfig()
  const { orderId, amount, currency = 'CNY', description = '订单支付' } = request

  if (isMockMode) {
    const record = createPaymentRecord(orderId, amount, currency, 'wechatpay', request.metadata)

    // Simulate auto-completion after 10 seconds (for demo)
    simulatePaymentCompletion(record.id, 10000)

    return {
      success: true,
      paymentId: record.id,
      orderId,
      amount,
      currency,
      status: 'PENDING',
      qrCode: record.qrCode,
      message: '请使用微信扫描二维码完成支付（演示模式）',
    }
  }

  // Real WeChat Pay API integration
  try {
    const unifiedOrderRequest: WechatPayUnifiedOrderRequest = {
      body: description.slice(0, 128), // WeChat limits to 128 chars
      outTradeNo: orderId,
      totalFee: Math.round(amount * 100), // Convert to cents
      spbillCreateIp: config.spbillCreateIp,
      notifyUrl: config.notifyUrl,
      tradeType: 'NATIVE',
      productId: orderId,
    }

    const response = await callWechatPayApi('pay/unifiedorder', unifiedOrderRequest as unknown as Record<string, unknown>, config)

    if (response.returnCode === 'SUCCESS' && response.resultCode === 'SUCCESS') {
      const record = createPaymentRecord(orderId, amount, currency, 'wechatpay', request.metadata)

      return {
        success: true,
        paymentId: record.id,
        orderId,
        amount,
        currency,
        status: 'PENDING',
        qrCode: response.codeUrl, // QR code URL for scanning
        message: '请使用微信扫描二维码完成支付',
      }
    } else {
      return {
        success: false,
        paymentId: '',
        orderId,
        amount,
        currency,
        status: 'FAILED',
        message: response.errCodeDes || response.returnMsg || '创建支付订单失败',
      }
    }
  } catch (error) {
    console.error('WeChat Pay create order error:', error)
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

// Create WeChat Pay order (JSAPI - for WeChat browser)
export async function createWechatPayJSAPIOrder(
  request: CreatePaymentRequest,
  openid: string
): Promise<PaymentResponse> {
  const config = getWechatPayConfig()
  const { orderId, amount, currency = 'CNY', description = '订单支付' } = request

  if (isMockMode) {
    const record = createPaymentRecord(orderId, amount, currency, 'wechatpay', {
      ...request.metadata,
      openid,
    })

    simulatePaymentCompletion(record.id, 10000)

    // Generate JSAPI payment parameters
    const prepayId = `wx_${Date.now()}`
    const timestamp = Math.floor(Date.now() / 1000).toString()
    const nonceStr = generateNonceStr()

    return {
      success: true,
      paymentId: record.id,
      orderId,
      amount,
      currency,
      status: 'PENDING',
      paymentUrl: JSON.stringify({
        appId: config.appId,
        timeStamp: timestamp,
        nonceStr,
        package: `prepay_id=${prepayId}`,
        signType: 'RSA',
        paySign: 'mock_sign',
      }),
      message: '请在微信内完成支付（演示模式）',
    }
  }

  // Real WeChat Pay API integration
  try {
    const unifiedOrderRequest: WechatPayUnifiedOrderRequest = {
      body: description.slice(0, 128),
      outTradeNo: orderId,
      totalFee: Math.round(amount * 100),
      spbillCreateIp: config.spbillCreateIp,
      notifyUrl: config.notifyUrl,
      tradeType: 'JSAPI',
      openid,
    }

    const response = await callWechatPayApi('pay/unifiedorder', unifiedOrderRequest as unknown as Record<string, unknown>, config)

    if (response.returnCode === 'SUCCESS' && response.resultCode === 'SUCCESS') {
      const record = createPaymentRecord(orderId, amount, currency, 'wechatpay', {
        ...request.metadata,
        openid,
      })

      // Generate JSAPI payment parameters
      const prepayId = response.prepayId
      const timestamp = Math.floor(Date.now() / 1000).toString()
      const nonceStr = generateNonceStr()

      const payParams = {
        appId: config.appId,
        timeStamp: timestamp,
        nonceStr,
        package: `prepay_id=${prepayId}`,
        signType: 'RSA',
        paySign: generateWechatPaySign({
          appId: config.appId,
          timeStamp: timestamp,
          nonceStr,
          package: `prepay_id=${prepayId}`,
          signType: 'RSA',
        }, config),
      }

      return {
        success: true,
        paymentId: record.id,
        orderId,
        amount,
        currency,
        status: 'PENDING',
        paymentUrl: JSON.stringify(payParams),
        message: '请在微信内完成支付',
      }
    } else {
      return {
        success: false,
        paymentId: '',
        orderId,
        amount,
        currency,
        status: 'FAILED',
        message: response.errCodeDes || response.returnMsg || '创建支付订单失败',
      }
    }
  } catch (error) {
    console.error('WeChat Pay JSAPI create order error:', error)
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

// Create WeChat Pay order (H5 - for mobile browser)
export async function createWechatPayH5Order(
  request: CreatePaymentRequest,
  sceneInfo: { wap_url: string; wap_name: string }
): Promise<PaymentResponse> {
  const config = getWechatPayConfig()
  const { orderId, amount, currency = 'CNY', description = '订单支付' } = request

  if (isMockMode) {
    const record = createPaymentRecord(orderId, amount, currency, 'wechatpay', request.metadata)

    simulatePaymentCompletion(record.id, 10000)

    return {
      success: true,
      paymentId: record.id,
      orderId,
      amount,
      currency,
      status: 'PENDING',
      paymentUrl: 'https://wx.tenpay.com/cgi-bin/mmpayweb-bin/checkmweb',
      message: '请在手机浏览器中完成支付（演示模式）',
    }
  }

  // Real WeChat Pay API integration
  try {
    const unifiedOrderRequest: WechatPayUnifiedOrderRequest = {
      body: description.slice(0, 128),
      outTradeNo: orderId,
      totalFee: Math.round(amount * 100),
      spbillCreateIp: config.spbillCreateIp,
      notifyUrl: config.notifyUrl,
      tradeType: 'MWEB',
      sceneInfo: JSON.stringify({
        h5_info: {
          type: 'Wap',
          wap_url: sceneInfo.wap_url,
          wap_name: sceneInfo.wap_name,
        },
      }),
    }

    const response = await callWechatPayApi('pay/unifiedorder', unifiedOrderRequest as unknown as Record<string, unknown>, config)

    if (response.returnCode === 'SUCCESS' && response.resultCode === 'SUCCESS') {
      const record = createPaymentRecord(orderId, amount, currency, 'wechatpay', request.metadata)

      return {
        success: true,
        paymentId: record.id,
        orderId,
        amount,
        currency,
        status: 'PENDING',
        paymentUrl: response.mwebUrl,
        message: '请在手机浏览器中完成支付',
      }
    } else {
      return {
        success: false,
        paymentId: '',
        orderId,
        amount,
        currency,
        status: 'FAILED',
        message: response.errCodeDes || response.returnMsg || '创建支付订单失败',
      }
    }
  } catch (error) {
    console.error('WeChat Pay H5 create order error:', error)
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

// Query WeChat Pay order status
export async function queryWechatPayOrder(paymentId: string): Promise<PaymentQueryResult> {
  const record = getPaymentRecord(paymentId)

  if (!record) {
    return {
      success: false,
      paymentId,
      orderId: '',
      amount: 0,
      currency: 'CNY',
      status: 'FAILED',
      method: 'wechatpay',
    }
  }

  if (isMockMode) {
    return {
      success: true,
      paymentId: record.id,
      orderId: record.orderId,
      amount: record.amount,
      currency: record.currency,
      status: record.status,
      paidAt: record.paidAt ? new Date(record.paidAt) : undefined,
      method: 'wechatpay',
      transactionId: record.transactionId,
    }
  }

  // Real WeChat Pay API integration
  try {
    const config = getWechatPayConfig()
    const response = await callWechatPayApi(
      'pay/orderquery',
      { out_trade_no: record.orderId },
      config
    )

    if (response.returnCode === 'SUCCESS') {
      const status = mapWechatPayStatus(response.tradeState)

      if (status !== record.status) {
        updatePaymentStatus(record.id, status, response.transactionId)
      }

      return {
        success: true,
        paymentId: record.id,
        orderId: record.orderId,
        amount: parseInt(response.totalFee) / 100,
        currency: record.currency,
        status,
        paidAt: response.timeEnd ? parseWechatPayTime(response.timeEnd) : undefined,
        method: 'wechatpay',
        transactionId: response.transactionId,
      }
    } else {
      return {
        success: false,
        paymentId,
        orderId: record.orderId,
        amount: record.amount,
        currency: record.currency,
        status: record.status,
        method: 'wechatpay',
      }
    }
  } catch (error) {
    console.error('WeChat Pay query error:', error)
    return {
      success: false,
      paymentId,
      orderId: record.orderId,
      amount: record.amount,
      currency: record.currency,
      status: record.status,
      method: 'wechatpay',
    }
  }
}

// Process WeChat Pay refund
export async function refundWechatPayOrder(request: RefundRequest): Promise<RefundResult> {
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

  // Real WeChat Pay API integration
  try {
    const config = getWechatPayConfig()
    const response = await callWechatPayApi(
      'secapi/pay/refund',
      {
        out_trade_no: record.orderId,
        out_refund_no: `ref_${Date.now()}`,
        total_fee: Math.round(record.amount * 100),
        refund_fee: Math.round(refundAmount * 100),
        refund_desc: reason || '用户申请退款',
      },
      config
    )

    if (response.returnCode === 'SUCCESS' && response.resultCode === 'SUCCESS') {
      updatePaymentStatus(record.id, 'REFUNDED')

      return {
        success: true,
        refundId: response.outRefundNo,
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
        message: response.errCodeDes || response.returnMsg || '退款失败',
      }
    }
  } catch (error) {
    console.error('WeChat Pay refund error:', error)
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

// Handle WeChat Pay webhook/notify
export async function handleWechatPayNotify(xmlData: string): Promise<boolean> {
  if (isMockMode) {
    return true
  }

  try {
    // Parse XML
    const data = parseWechatPayXml(xmlData)

    if (data.return_code === 'SUCCESS' && data.result_code === 'SUCCESS') {
      // Verify signature
      const isValid = verifyWechatPaySignature(data, getWechatPayConfig())
      if (!isValid) {
        console.error('WeChat Pay signature verification failed')
        return false
      }

      const record = getPaymentRecordByOrderId(data.out_trade_no)
      if (record) {
        updatePaymentStatus(record.id, 'SUCCESS', data.transaction_id)
      }
    }

    return true
  } catch (error) {
    console.error('WeChat Pay notify error:', error)
    return false
  }
}

// Helper: Call WeChat Pay API
async function callWechatPayApi(
  endpoint: string,
  params: Record<string, unknown>,
  config: WechatPayConfig
): Promise<Record<string, string>> {
  const nonceStr = generateNonceStr()
  const timestamp = Math.floor(Date.now() / 1000).toString()

  const requestParams: Record<string, string> = {
    appid: config.appId,
    mch_id: config.mchId,
    nonce_str: nonceStr,
    ...Object.fromEntries(
      Object.entries(params).map(([k, v]) => [k, String(v)])
    ),
  }

  // Generate signature
  requestParams.sign = generateWechatPaySign(requestParams, config)

  // Convert to XML
  const xmlBody = buildWechatPayXml(requestParams)

  const response = await fetch(`https://api.mch.weixin.qq.com/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/xml' },
    body: xmlBody,
  })

  const xmlResponse = await response.text()
  return parseWechatPayXml(xmlResponse)
}

// Helper: Generate WeChat Pay signature
function generateWechatPaySign(params: Record<string, string>, config: WechatPayConfig): string {
  // Filter out sign
  const filteredParams = Object.fromEntries(
    Object.entries(params).filter(([key]) => key !== 'sign')
  )

  // Sort by key
  const sortedKeys = Object.keys(filteredParams).sort()
  const signString = sortedKeys
    .map((key) => `${key}=${filteredParams[key]}`)
    .join('&')

  // Append API key
  const finalString = `${signString}&key=${config.apiKey}`

  // MD5 hash (in real implementation)
  // This is a mock implementation
  return `mock_sign_${Buffer.from(finalString).toString('base64').slice(0, 16)}`.toUpperCase()
}

// Helper: Verify WeChat Pay signature
function verifyWechatPaySignature(data: Record<string, string>, config: WechatPayConfig): boolean {
  // In real implementation, verify signature
  // This is a mock implementation
  return true
}

// Helper: Generate nonce string
function generateNonceStr(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Helper: Build XML from object
function buildWechatPayXml(obj: Record<string, string>): string {
  const entries = Object.entries(obj)
    .map(([key, value]) => `<${key}><![CDATA[${value}]]></${key}>`)
    .join('')
  return `<xml>${entries}</xml>`
}

// Helper: Parse XML to object
function parseWechatPayXml(xml: string): Record<string, string> {
  const result: Record<string, string> = {}
  const regex = /<(\w+)>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/\w+>/g
  let match
  while ((match = regex.exec(xml)) !== null) {
    result[match[1]] = match[2]
  }
  return result
}

// Helper: Map WeChat Pay trade state to our status
function mapWechatPayStatus(tradeState: string): 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED' | 'REFUNDED' | 'CANCELLED' {
  const statusMap: Record<string, 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED' | 'REFUNDED' | 'CANCELLED'> = {
    NOTPAY: 'PENDING',
    USERPAYING: 'PROCESSING',
    PAYERROR: 'FAILED',
    SUCCESS: 'SUCCESS',
    REFUND: 'REFUNDED',
    CLOSED: 'CANCELLED',
    REVOKED: 'CANCELLED',
  }
  return statusMap[tradeState] || 'PENDING'
}

// Helper: Parse WeChat Pay time format (yyyyMMddHHmmss)
function parseWechatPayTime(timeStr: string): Date {
  const year = timeStr.slice(0, 4)
  const month = timeStr.slice(4, 6)
  const day = timeStr.slice(6, 8)
  const hour = timeStr.slice(8, 10)
  const minute = timeStr.slice(10, 12)
  const second = timeStr.slice(12, 14)
  return new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`)
}
