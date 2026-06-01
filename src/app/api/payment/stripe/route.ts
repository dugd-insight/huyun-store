// Stripe Payment API Routes
import { NextRequest, NextResponse } from 'next/server'
import {
  createStripePaymentIntent,
  queryStripePayment,
  refundStripePayment,
  getStripePublishableKey,
} from '@/lib/payment/stripe'
import { CreatePaymentRequest, RefundRequest } from '@/lib/payment/types'

// Create Stripe Payment Intent
export async function POST(request: NextRequest) {
  try {
    const body: CreatePaymentRequest = await request.json()

    if (!body.orderId || !body.amount) {
      return NextResponse.json(
        { error: 'Missing required fields: orderId, amount' },
        { status: 400 }
      )
    }

    const result = await createStripePaymentIntent(body)

    if (result.success) {
      return NextResponse.json(result, { status: 201 })
    } else {
      return NextResponse.json(
        { error: result.message || 'Failed to create payment intent' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Stripe API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Query Stripe payment status
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

    const result = await queryStripePayment(paymentId)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Stripe query error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Process Stripe refund
export async function PATCH(request: NextRequest) {
  try {
    const body: RefundRequest = await request.json()

    if (!body.paymentId) {
      return NextResponse.json(
        { error: 'Missing required field: paymentId' },
        { status: 400 }
      )
    }

    const result = await refundStripePayment(body)

    if (result.success) {
      return NextResponse.json(result)
    } else {
      return NextResponse.json(
        { error: result.message || 'Refund failed' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Stripe refund error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Get Stripe publishable key (for client-side initialization)
export async function OPTIONS() {
  return NextResponse.json({
    publishableKey: getStripePublishableKey(),
  })
}
