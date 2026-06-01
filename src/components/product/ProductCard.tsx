import Link from 'next/link'
import Image from 'next/image'
import { Product } from '@/types'
import { formatPrice } from '@/lib/utils'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const imageUrl = product.images?.[0] || '/images/placeholder.jpg'
  const hasDiscount =
    product.originalPrice && product.originalPrice > product.price

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="relative aspect-square bg-stone-100 overflow-hidden mb-4">
        <Image
          src={imageUrl}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
        {hasDiscount && (
          <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1">
            优惠
          </div>
        )}
        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white text-sm">已售罄</span>
          </div>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-xs text-stone-500 uppercase tracking-wider">
          {product.category.name}
        </p>
        <h3 className="text-stone-900 font-medium group-hover:text-stone-600 transition-colors">
          {product.name}
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-stone-900 font-medium">
            {formatPrice(Number(product.price))}
          </span>
          {hasDiscount && (
            <span className="text-sm text-stone-400 line-through">
              {formatPrice(Number(product.originalPrice))}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
