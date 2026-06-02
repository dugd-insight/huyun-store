'use client'

import Image from 'next/image'
import { formatPrice } from '@/lib/utils'
import { showToast } from '@/components/ui/Toast'

interface ProductCardData {
  id: string
  name: string
  slug: string
  image: string
  category: string
  price: number
  originalPrice?: number | null
  badge?: '新品' | '精品' | '特惠'
}

interface ProductCardProps {
  product: ProductCardData
}

export function ProductCard({ product }: ProductCardProps) {
  const hasDiscount = product.originalPrice && product.originalPrice > product.price

  const getBadgeClass = (badge?: string) => {
    switch (badge) {
      case '新品':
        return 'badge-new'
      case '精品':
        return 'badge-featured'
      case '特惠':
        return 'badge-sale'
      default:
        return ''
    }
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    showToast(`"${product.name}" 已加入购物车`, 'success')
  }

  return (
    <a href={`/products/${product.slug}`} className="product-card block">
      <div className="product-card-image-wrapper">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="product-card-image"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
        {product.badge && (
          <span className={`product-card-badge ${getBadgeClass(product.badge)}`}>
            {product.badge}
          </span>
        )}
        <div className="product-card-overlay">
          <button
            onClick={handleAddToCart}
            className="product-card-add-to-cart"
          >
            加入购物车
          </button>
        </div>
      </div>
      <div className="p-4">
        <p className="text-xs text-[var(--color-gold)] tracking-wider mb-1">
          {product.category}
        </p>
        <h3 className="font-serif text-sm font-medium text-[var(--color-ink)] mb-2 line-clamp-2">
          {product.name}
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-[var(--color-cinnabar)] font-semibold text-sm">
            {formatPrice(product.price)}
          </span>
          {hasDiscount && (
            <span className="text-xs text-[var(--color-ink)] opacity-40 line-through">
              {formatPrice(product.originalPrice!)}
            </span>
          )}
        </div>
      </div>
    </a>
  )
}
