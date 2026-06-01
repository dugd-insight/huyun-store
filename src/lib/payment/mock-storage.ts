// Mock Payment Storage for Demo Mode
import { MockPaymentRecord, PaymentMethod, PaymentStatus } from './types'

const STORAGE_KEY = 'huyun_payment_records'

// Generate unique payment ID
export function generatePaymentId(): string {
  return `pay_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

// Generate mock QR code data URL
export function generateMockQRCode(paymentId: string): string {
  // Create a simple SVG QR code representation
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
      <rect width="200" height="200" fill="white"/>
      <rect x="10" y="10" width="60" height="60" fill="black"/>
      <rect x="20" y="20" width="40" height="40" fill="white"/>
      <rect x="30" y="30" width="20" height="20" fill="black"/>
      <rect x="130" y="10" width="60" height="60" fill="black"/>
      <rect x="140" y="20" width="40" height="40" fill="white"/>
      <rect x="150" y="30" width="20" height="20" fill="black"/>
      <rect x="10" y="130" width="60" height="60" fill="black"/>
      <rect x="20" y="140" width="40" height="40" fill="white"/>
      <rect x="30" y="150" width="20" height="20" fill="black"/>
      <rect x="90" y="10" width="20" height="20" fill="black"/>
      <rect x="90" y="50" width="20" height="20" fill="black"/>
      <rect x="90" y="90" width="20" height="20" fill="black"/>
      <rect x="50" y="90" width="20" height="20" fill="black"/>
      <rect x="130" y="90" width="20" height="20" fill="black"/>
      <rect x="10" y="90" width="20" height="20" fill="black"/>
      <rect x="170" y="90" width="20" height="20" fill="black"/>
      <rect x="90" y="130" width="20" height="20" fill="black"/>
      <rect x="90" y="170" width="20" height="20" fill="black"/>
      <rect x="130" y="130" width="60" height="20" fill="black"/>
      <rect x="130" y="170" width="60" height="20" fill="black"/>
      <rect x="130" y="150" width="20" height="20" fill="black"/>
      <rect x="170" y="150" width="20" height="20" fill="black"/>
      <text x="100" y="100" text-anchor="middle" font-size="8" fill="black">${paymentId.slice(-8)}</text>
    </svg>
  `
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`
}

// Get all payment records
export function getPaymentRecords(): MockPaymentRecord[] {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(STORAGE_KEY)
  return data ? JSON.parse(data) : []
}

// Get payment record by ID
export function getPaymentRecord(id: string): MockPaymentRecord | undefined {
  return getPaymentRecords().find(p => p.id === id)
}

// Get payment record by order ID
export function getPaymentRecordByOrderId(orderId: string): MockPaymentRecord | undefined {
  return getPaymentRecords().find(p => p.orderId === orderId)
}

// Save payment record
export function savePaymentRecord(record: MockPaymentRecord): void {
  if (typeof window === 'undefined') return
  const records = getPaymentRecords()
  const index = records.findIndex(r => r.id === record.id)
  if (index >= 0) {
    records[index] = record
  } else {
    records.push(record)
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
}

// Create new payment record
export function createPaymentRecord(
  orderId: string,
  amount: number,
  currency: string,
  method: PaymentMethod,
  metadata?: Record<string, string>
): MockPaymentRecord {
  const now = new Date().toISOString()
  const record: MockPaymentRecord = {
    id: generatePaymentId(),
    orderId,
    amount,
    currency,
    method,
    status: 'PENDING',
    createdAt: now,
    updatedAt: now,
    metadata,
  }

  // Generate QR code for Alipay and WeChat Pay
  if (method === 'alipay' || method === 'wechatpay') {
    record.qrCode = generateMockQRCode(record.id)
  }

  // Generate client secret for Stripe
  if (method === 'stripe') {
    record.clientSecret = `pi_${generatePaymentId().slice(4)}_secret_${Math.random().toString(36).substring(2, 10)}`
  }

  savePaymentRecord(record)
  return record
}

// Update payment status
export function updatePaymentStatus(
  id: string,
  status: PaymentStatus,
  transactionId?: string
): MockPaymentRecord | null {
  const record = getPaymentRecord(id)
  if (!record) return null

  record.status = status
  record.updatedAt = new Date().toISOString()

  if (status === 'SUCCESS' && !record.paidAt) {
    record.paidAt = new Date().toISOString()
    record.transactionId = transactionId || `trans_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  }

  if (status === 'REFUNDED' && !record.refundedAt) {
    record.refundedAt = new Date().toISOString()
  }

  savePaymentRecord(record)
  return record
}

// Simulate payment completion (for demo)
export function simulatePaymentCompletion(id: string, delayMs: number = 5000): Promise<boolean> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const record = getPaymentRecord(id)
      if (record && record.status === 'PENDING') {
        updatePaymentStatus(id, 'SUCCESS')
        resolve(true)
      } else {
        resolve(false)
      }
    }, delayMs)
  })
}

// Clear all payment records (for testing)
export function clearPaymentRecords(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}
