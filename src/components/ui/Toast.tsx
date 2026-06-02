'use client'

import { useState, useEffect, useCallback } from 'react'
import { CheckCircle, XCircle, X } from 'lucide-react'

export interface ToastMessage {
  id: string
  type: 'success' | 'error' | 'info'
  message: string
}

let toastId = 0

// Global toast state management
const listeners: Set<(toasts: ToastMessage[]) => void> = new Set()
let globalToasts: ToastMessage[] = []

function emitChange() {
  listeners.forEach((listener) => listener([...globalToasts]))
}

export function showToast(message: string, type: 'success' | 'error' | 'info' = 'success') {
  const id = `toast-${++toastId}`
  const toast: ToastMessage = { id, type, message }
  globalToasts = [...globalToasts, toast]
  emitChange()

  // Auto remove after 3 seconds
  setTimeout(() => {
    globalToasts = globalToasts.filter((t) => t.id !== id)
    emitChange()
  }, 3000)
}

export function Toast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  useEffect(() => {
    listeners.add(setToasts)
    return () => {
      listeners.delete(setToasts)
    }
  }, [])

  const removeToast = useCallback((id: string) => {
    globalToasts = globalToasts.filter((t) => t.id !== id)
    emitChange()
  }, [])

  if (toasts.length === 0) return null

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast ${
            toast.type === 'success'
              ? 'toast-success'
              : toast.type === 'error'
              ? 'toast-error'
              : ''
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-[var(--color-jade)] flex-shrink-0" />
          ) : (
            <XCircle className="w-5 h-5 text-[var(--color-cinnabar)] flex-shrink-0" />
          )}
          <span className="text-sm text-[var(--color-ink)] flex-1">{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-[var(--color-ink)] opacity-40 hover:opacity-100 transition-opacity flex-shrink-0"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
