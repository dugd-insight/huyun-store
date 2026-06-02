'use client'

import Image from 'next/image'
import { formatPrice } from '@/lib/utils'
import { showToast } from '@/components/ui/Toast'
import { ShoppingBag, Heart, Eye } from 'lucide-react'

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
  const discountPercent = hasDiscount 
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0

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

  const getBadgeIcon = (badge?: string) => {
    switch (badge) {
      case '新品':
        return '✦'
      case '精品':
        return '◆'
      case '特惠':
        return '▼'
      default:
        return ''
    }
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    showToast(`"${product.name}" 已加入购物车`, 'success')
  }

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // Quick view functionality can be implemented here
  }

  const handleAddToWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    showToast(`"${product.name}" 已添加到收藏`, 'success')
  }

  return (
    <a 
      href={`/products/${product.slug}`} 
      className="product-card block group"
    >
      <div className="product-card-image-wrapper">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="product-card-image"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
        
        {/* Badge with icon */}
        {product.badge && (
          <span className={`product-card-badge ${getBadgeClass(product.badge)}`}>
            <span className="mr-1">{getBadgeIcon(product.badge)}</span>
            {product.badge}
          </span>
        )}
        
        {/* Discount badge */}
        {hasDiscount && (
          <span className="absolute top-4 right-4 px-2 py-1 bg-[var(--color-cinnabar)] text-white text-xs font-bold rounded-sm">
            -{discountPercent}%
          </span>
        )}
        
        {/* Premium Overlay with Actions */}
        <div className="product-card-overlay">
          <div className="flex flex-col gap-3">
            {/* Quick Actions */}
            <div className="flex gap-2 justify-center mb-2">
              <button
                onClick={handleQuickView}
                className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-[var(--color-ink)] hover:bg-[var(--color-cinnabar)] hover:text-white transition-all duration-300 hover:scale-110"
                aria-label="快速预览"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={handleAddToWishlist}
                className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-[var(--color-ink)] hover:bg-[var(--color-cinnabar)] hover:text-white transition-all duration-300 hover:scale-110"
                aria-label="加入收藏"
              >
                <Heart className="w-4 h-4" />
              </button>
            </div>
            
            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              className="product-card-add-to-cart flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              加入购物车
            </button>
          </div>
        </div>
        
        {/* Shine Effect on Hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </div>
      </div>
      
      {/* Premium Product Info */}
      <div className="p-5">
        {/* Category with gold accent */}
        <p className="text-xs text-[var(--color-gold-dark)] tracking-[0.15em] uppercase mb-2 font-medium">
          {product.category}
        </p>
        
        {/* Product Name with hover effect */}
        <h3 className="font-serif text-[15px] font-semibold text-[var(--color-ink)] mb-3 line-clamp-2 leading-snug group-hover:text-[var(--color-cinnabar)] transition-colors duration-300">
          {product.name}
        </h3>
        
        {/* Price Section with Animation */}
        <div className="flex items-center gap-3">
          <span className="text-[var(--color-cinnabar)] font-bold text-lg tracking-tight">
            {formatPrice(product.price)}
          </span>
          {hasDiscount && (
            <span className="text-sm text-[var(--color-ink)] opacity-40 line-through">
              {formatPrice(product.originalPrice!)}
            </span>
          )}
        </div>
        
        {/* Savings info for discounted items */}
        {hasDiscount && (
          <p className="text-xs text-[var(--color-jade)] mt-2 font-medium">
            省 {formatPrice(product.originalPrice! - product.price)}
          </p>
        )}
      </div>
    </a>
  )
}
