// Universal Payment Webhook Handler
import { NextRequest, NextResponse } from 'next/server'
import { handleAlipayNotify } from '@/lib/payment/alipay'
import { handleWechatPayNotify } from '@/lib/payment/wechatpay'
import { handleStripeWebhook } from '@/lib/payment/stripe'

// Handle payment webhooks from different providers
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const provider = searchParams.get('provider')

    if (!provider) {
      return NextResponse.json(
        { error: 'Missing required parameter: provider' },
        { status: 400 }
      )
    }

    let success = false

    switch (provider.toLowerCase()) {
      case 'alipay': {
        // Alipay sends form data
        const formData = await request.formData()
        const payload: Record<string, string> = {}
        formData.forEach((value, key) => {
          payload[key] = value.toString()
        })
        success = await handleAlipayNotify(payload)
        break
      }

      case 'wechatpay': {
        // WeChat Pay sends XML
        const xmlData = await request.text()
        success = await handleWechatPayNotify(xmlData)
        // Return XML response for WeChat Pay
        if (success) {
          return new NextResponse(
            '<xml><return_code><![CDATA[SUCCESS]]></return_code><return_msg><![CDATA[OK]]></return_msg></xml>',
            {
              status: 200,
              headers: { 'Content-Type': 'application/xml' },
            }
          )
        }
        break
      }

      case 'stripe': {
        // Stripe sends JSON with signature header
        const payload = await request.text()
        const signature = request.headers.get('stripe-signature') || ''
        success = await handleStripeWebhook(payload, signature)
        break
      }

      default:
        return NextResponse.json(
          { error: 'Unknown payment provider' },
          { status: 400 }
        )
    }

    if (success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json(
        { error: 'Webhook processing failed' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Handle GET requests for return URLs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const provider = searchParams.get('provider')
    const orderId = searchParams.get('orderId')
    const status = searchParams.get('status')

    if (!provider || !orderId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Redirect to order confirmation page with payment status
    const redirectUrl = new URL('/order/confirmation', request.url)
    redirectUrl.searchParams.set('orderId', orderId)
    redirectUrl.searchParams.set('status', status || 'unknown')

    return NextResponse.redirect(redirectUrl)
  } catch (error) {
    console.error('Return URL error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
