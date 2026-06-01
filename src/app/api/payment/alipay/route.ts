// Alipay Payment API Routes
import { NextRequest, NextResponse } from 'next/server'
import { createAlipayOrder, queryAlipayOrder, refundAlipayOrder, handleAlipayNotify } from '@/lib/payment/alipay'
import { CreatePaymentRequest, RefundRequest } from '@/lib/payment/types'

// Create Alipay payment order
export async function POST(request: NextRequest) {
  try {
    const body: CreatePaymentRequest = await request.json()

    if (!body.orderId || !body.amount) {
      return NextResponse.json(
        { error: 'Missing required fields: orderId, amount' },
        { status: 400 }
      )
    }

    const result = await createAlipayOrder(body)

    if (result.success) {
      return NextResponse.json(result, { status: 201 })
    } else {
      return NextResponse.json(
        { error: result.message || 'Failed to create payment order' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Alipay API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Query Alipay payment status
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

    const result = await queryAlipayOrder(paymentId)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Alipay query error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Process Alipay refund
export async function PATCH(request: NextRequest) {
  try {
    const body: RefundRequest = await request.json()

    if (!body.paymentId) {
      return NextResponse.json(
        { error: 'Missing required field: paymentId' },
        { status: 400 }
      )
    }

    const result = await refundAlipayOrder(body)

    if (result.success) {
      return NextResponse.json(result)
    } else {
      return NextResponse.json(
        { error: result.message || 'Refund failed' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Alipay refund error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
