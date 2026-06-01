// Stripe Payment Integration
import {
  StripeConfig,
  CreatePaymentRequest,
  PaymentResponse,
  PaymentQueryResult,
  RefundRequest,
  RefundResult,
  MockPaymentRecord,
} from './types'
import {
  createPaymentRecord,
  getPaymentRecord,
  getPaymentRecordByOrderId,
  updatePaymentStatus,
  simulatePaymentCompletion,
} from './mock-storage'

// Check if we're in mock mode
const isMockMode = !process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'mock'

// Stripe configuration
const getStripeConfig = (): StripeConfig => ({
  secretKey: process.env.STRIPE_SECRET_KEY || 'mock_secret_key',
  publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || 'mock_publishable_key',
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || 'mock_webhook_secret',
  currency: 'usd',
})

// Create Stripe Payment Intent
export async function createStripePaymentIntent(
  request: CreatePaymentRequest
): Promise<PaymentResponse> {
  const config = getStripeConfig()
  const { orderId, amount, currency = 'usd', description = 'Order Payment' } = request

  if (isMockMode) {
    // Mock mode: Create local payment record
    const record = createPaymentRecord(orderId, amount, currency, 'stripe', request.metadata)

    // Simulate auto-completion after 10 seconds (for demo)
    simulatePaymentCompletion(record.id, 10000)

    return {
      success: true,
      paymentId: record.id,
      orderId,
      amount,
      currency,
      status: 'PENDING',
      clientSecret: record.clientSecret,
      message: 'Please complete payment with your card (Demo Mode)',
    }
  }

  // Real Stripe API integration
  try {
    const response = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        amount: Math.round(amount * 100).toString(), // Convert to cents
        currency: currency.toLowerCase(),
        description,
        metadata: JSON.stringify({
          orderId,
          ...request.metadata,
        }),
        automatic_payment_methods: JSON.stringify({ enabled: true }),
      }).toString(),
    })

    const data = await response.json()

    if (data.error) {
      return {
        success: false,
        paymentId: '',
        orderId,
        amount,
        currency,
        status: 'FAILED',
        message: data.error.message || 'Failed to create payment intent',
      }
    }

    // Create payment record
    const record = createPaymentRecord(orderId, amount, currency, 'stripe', {
      ...request.metadata,
      stripePaymentIntentId: data.id,
    })

    return {
      success: true,
      paymentId: record.id,
      orderId,
      amount,
      currency,
      status: 'PENDING',
      clientSecret: data.client_secret,
      message: 'Please complete payment with your card',
    }
  } catch (error) {
    console.error('Stripe create payment intent error:', error)
    return {
      success: false,
      paymentId: '',
      orderId,
      amount,
      currency,
      status: 'FAILED',
      message: error instanceof Error ? error.message : 'Failed to create payment intent',
    }
  }
}

// Query Stripe payment status
export async function queryStripePayment(paymentId: string): Promise<PaymentQueryResult> {
  const record = getPaymentRecord(paymentId)

  if (!record) {
    return {
      success: false,
      paymentId,
      orderId: '',
      amount: 0,
      currency: 'usd',
      status: 'FAILED',
      method: 'stripe',
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
      method: 'stripe',
      transactionId: record.transactionId,
    }
  }

  // Real Stripe API integration
  try {
    const config = getStripeConfig()
    const stripePaymentIntentId = record.metadata?.stripePaymentIntentId

    if (!stripePaymentIntentId) {
      return {
        success: false,
        paymentId,
        orderId: record.orderId,
        amount: record.amount,
        currency: record.currency,
        status: record.status,
        method: 'stripe',
      }
    }

    const response = await fetch(`https://api.stripe.com/v1/payment_intents/${stripePaymentIntentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${config.secretKey}`,
      },
    })

    const data = await response.json()

    if (data.error) {
      return {
        success: false,
        paymentId,
        orderId: record.orderId,
        amount: record.amount,
        currency: record.currency,
        status: record.status,
        method: 'stripe',
      }
    }

    const status = mapStripeStatus(data.status)

    if (status !== record.status) {
      updatePaymentStatus(record.id, status, data.id)
    }

    return {
      success: true,
      paymentId: record.id,
      orderId: record.orderId,
      amount: data.amount / 100,
      currency: data.currency,
      status,
      paidAt: data.status === 'succeeded' ? new Date() : undefined,
      method: 'stripe',
      transactionId: data.id,
    }
  } catch (error) {
    console.error('Stripe query error:', error)
    return {
      success: false,
      paymentId,
      orderId: record.orderId,
      amount: record.amount,
      currency: record.currency,
      status: record.status,
      method: 'stripe',
    }
  }
}

// Process Stripe refund
export async function refundStripePayment(request: RefundRequest): Promise<RefundResult> {
  const { paymentId, amount, reason } = request
  const record = getPaymentRecord(paymentId)

  if (!record) {
    return {
      success: false,
      refundId: '',
      paymentId,
      amount: amount || 0,
      status: 'FAILED',
      message: 'Payment record not found',
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
      message: 'Refund processed successfully (Demo Mode)',
    }
  }

  // Real Stripe API integration
  try {
    const config = getStripeConfig()
    const stripePaymentIntentId = record.metadata?.stripePaymentIntentId

    if (!stripePaymentIntentId) {
      return {
        success: false,
        refundId: '',
        paymentId,
        amount: refundAmount,
        status: 'FAILED',
        message: 'Stripe payment intent ID not found',
      }
    }

    const refundParams: Record<string, string> = {
      payment_intent: stripePaymentIntentId,
      reason: reason || 'requested_by_customer',
    }

    if (amount) {
      refundParams.amount = Math.round(amount * 100).toString()
    }

    const response = await fetch('https://api.stripe.com/v1/refunds', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(refundParams).toString(),
    })

    const data = await response.json()

    if (data.error) {
      return {
        success: false,
        refundId: '',
        paymentId,
        amount: refundAmount,
        status: 'FAILED',
        message: data.error.message || 'Refund failed',
      }
    }

    updatePaymentStatus(record.id, 'REFUNDED')

    return {
      success: true,
      refundId: data.id,
      paymentId,
      amount: data.amount / 100,
      status: 'SUCCESS',
      message: 'Refund processed successfully',
    }
  } catch (error) {
    console.error('Stripe refund error:', error)
    return {
      success: false,
      refundId: '',
      paymentId,
      amount: refundAmount,
      status: 'FAILED',
      message: error instanceof Error ? error.message : 'Refund failed',
    }
  }
}

// Handle Stripe webhook
export async function handleStripeWebhook(payload: string, signature: string): Promise<boolean> {
  if (isMockMode) {
    return true
  }

  try {
    const config = getStripeConfig()

    // Verify webhook signature
    const isValid = verifyStripeWebhookSignature(payload, signature, config.webhookSecret)
    if (!isValid) {
      console.error('Stripe webhook signature verification failed')
      return false
    }

    const event = JSON.parse(payload)

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object
        const orderId = paymentIntent.metadata?.orderId

        if (orderId) {
          const record = getPaymentRecordByOrderId(orderId)
          if (record) {
            updatePaymentStatus(record.id, 'SUCCESS', paymentIntent.id)
          }
        }
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object
        const orderId = paymentIntent.metadata?.orderId

        if (orderId) {
          const record = getPaymentRecordByOrderId(orderId)
          if (record) {
            updatePaymentStatus(record.id, 'FAILED', paymentIntent.id)
          }
        }
        break
      }

      case 'charge.refunded': {
        const charge = event.data.object
        const paymentIntentId = charge.payment_intent

        // Find record by stripe payment intent ID
        const records = getPaymentRecords()
        const record = records.find((r: MockPaymentRecord) => r.metadata?.stripePaymentIntentId === paymentIntentId)

        if (record) {
          updatePaymentStatus(record.id, 'REFUNDED', charge.id)
        }
        break
      }
    }

    return true
  } catch (error) {
    console.error('Stripe webhook error:', error)
    return false
  }
}

// Get Stripe publishable key (for client-side)
export function getStripePublishableKey(): string {
  return getStripeConfig().publishableKey
}

// Helper: Verify Stripe webhook signature
function verifyStripeWebhookSignature(payload: string, signature: string, secret: string): boolean {
  // In real implementation, use Stripe's webhook verification
  // This is a mock implementation
  return true
}

// Helper: Map Stripe status to our status
function mapStripeStatus(stripeStatus: string): 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED' | 'REFUNDED' | 'CANCELLED' {
  const statusMap: Record<string, 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED' | 'REFUNDED' | 'CANCELLED'> = {
    requires_payment_method: 'PENDING',
    requires_confirmation: 'PROCESSING',
    requires_action: 'PROCESSING',
    processing: 'PROCESSING',
    requires_capture: 'PROCESSING',
    canceled: 'CANCELLED',
    succeeded: 'SUCCESS',
  }
  return statusMap[stripeStatus] || 'PENDING'
}

// Helper: Get all payment records (for webhook lookup)
function getPaymentRecords() {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem('huyun_payment_records')
  return data ? JSON.parse(data) : []
}
