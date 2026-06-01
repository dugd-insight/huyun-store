'use client'

import { useState, useEffect } from 'react'
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react'
import { CartItem } from '@/types'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const [items, setItems] = useState<CartItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchCart()
    }
  }, [isOpen])

  const fetchCart = async () => {
    try {
      const response = await fetch('/api/cart')
      const data = await response.json()
      setItems(data.items || [])
      setTotal(data.total || 0)
    } catch (error) {
      console.error('Error fetching cart:', error)
    }
  }

  const updateQuantity = async (itemId: string, quantity: number) => {
    setLoading(true)
    try {
      await fetch('/api/cart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, quantity }),
      })
      await fetchCart()
    } catch (error) {
      console.error('Error updating cart:', error)
    } finally {
      setLoading(false)
    }
  }

  const removeItem = async (itemId: string) => {
    setLoading(true)
    try {
      await fetch(`/api/cart?itemId=${itemId}`, {
        method: 'DELETE',
      })
      await fetchCart()
    } catch (error) {
      console.error('Error removing item:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-stone-200">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              <h2 className="text-lg font-medium">购物车</h2>
              <span className="text-sm text-stone-500">({items.length})</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-stone-100 transition-colors"
              aria-label="关闭"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <ShoppingBag className="h-12 w-12 text-stone-300 mb-4" />
                <p className="text-stone-500 mb-4">购物车是空的</p>
                <Link
                  href="/products"
                  onClick={onClose}
                  className="text-stone-900 hover:underline"
                >
                  去购物
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 py-4 border-b border-stone-100"
                  >
                    <div className="relative w-20 h-20 bg-stone-100 flex-shrink-0">
                      {item.product.images?.[0] ? (
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-400 text-xs">
                          无图片
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-stone-900 truncate">
                        {item.product.name}
                      </h3>
                      <p className="text-sm text-stone-500 mt-1">
                        {formatPrice(Number(item.product.price))}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          disabled={loading || item.quantity <= 1}
                          className="p-1 hover:bg-stone-100 disabled:opacity-50"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center text-sm">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          disabled={loading}
                          className="p-1 hover:bg-stone-100 disabled:opacity-50"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => removeItem(item.id)}
                          disabled={loading}
                          className="p-1 hover:bg-stone-100 text-red-500 ml-auto"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t border-stone-200 p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-stone-600">合计</span>
                <span className="text-xl font-medium">
                  {formatPrice(total)}
                </span>
              </div>
              <Link
                href="/checkout"
                onClick={onClose}
                className="block w-full py-3 bg-stone-900 text-white text-center hover:bg-stone-800 transition-colors"
              >
                结算
              </Link>
              <button
                onClick={onClose}
                className="block w-full py-3 border border-stone-300 text-stone-700 text-center hover:bg-stone-50 transition-colors"
              >
                继续购物
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
