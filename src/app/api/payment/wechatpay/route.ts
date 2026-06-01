// WeChat Pay API Routes
import { NextRequest, NextResponse } from 'next/server'
import {
  createWechatPayNativeOrder,
  createWechatPayJSAPIOrder,
  createWechatPayH5Order,
  queryWechatPayOrder,
  refundWechatPayOrder,
} from '@/lib/payment/wechatpay'
import { CreatePaymentRequest, RefundRequest } from '@/lib/payment/types'

// Create WeChat Pay order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, ...paymentRequest }: { type: 'native' | 'jsapi' | 'h5' } & CreatePaymentRequest = body

    if (!paymentRequest.orderId || !paymentRequest.amount) {
      return NextResponse.json(
        { error: 'Missing required fields: orderId, amount' },
        { status: 400 }
      )
    }

    let result

    switch (type) {
      case 'native':
        result = await createWechatPayNativeOrder(paymentRequest)
        break
      case 'jsapi':
        const { openid } = body
        if (!openid) {
          return NextResponse.json(
            { error: 'Missing required field: openid for JSAPI payment' },
            { status: 400 }
          )
        }
        result = await createWechatPayJSAPIOrder(paymentRequest, openid)
        break
      case 'h5':
        const { sceneInfo } = body
        if (!sceneInfo) {
          return NextResponse.json(
            { error: 'Missing required field: sceneInfo for H5 payment' },
            { status: 400 }
          )
        }
        result = await createWechatPayH5Order(paymentRequest, sceneInfo)
        break
      default:
        result = await createWechatPayNativeOrder(paymentRequest)
    }

    if (result.success) {
      return NextResponse.json(result, { status: 201 })
    } else {
      return NextResponse.json(
        { error: result.message || 'Failed to create payment order' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('WeChat Pay API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Query WeChat Pay status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const paymentId = searchParams.get('paymentId')

    if (!paymentId) {
      return NextResponse.json(
        { error: 'Missing required parameter: paymentId' },
        { status: 400 }
      )
    }

    const result = await queryWechatPayOrder(paymentId)
    return NextResponse.json(result)
  } catch (error) {
    console.error('WeChat Pay query error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Process WeChat Pay refund
export async function PATCH(request: NextRequest) {
  try {
    const body: RefundRequest = await request.json()

    if (!body.paymentId) {
      return NextResponse.json(
        { error: 'Missing required field: paymentId' },
        { status: 400 }
      )
    }

    const result = await refundWechatPayOrder(body)

    if (result.success) {
      return NextResponse.json(result)
    } else {
      return NextResponse.json(
        { error: result.message || 'Refund failed' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('WeChat Pay refund error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
