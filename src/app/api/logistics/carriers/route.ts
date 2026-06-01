// Carriers API Route
import { NextRequest, NextResponse } from 'next/server'
import { supportedCarriers } from '@/lib/logistics/service'

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({ carriers: supportedCarriers })
  } catch (error) {
    console.error('Get carriers API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch carriers' },
      { status: 500 }
    )
  }
}
