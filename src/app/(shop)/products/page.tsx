'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Search } from 'lucide-react'
import { ProductCard } from '@/components/product/ProductCard'

const allProducts = [
  { id: '1', name: '传统烙画山水葫芦', slug: 'traditional-pyrography-landscape', image: '/images/product-1.jpg', category: '烙画葫芦', price: 1280, originalPrice: 1580, badge: '新品' as const },
  { id: '2', name: '精雕双龙戏珠葫芦瓶', slug: 'carved-dragon-gourd-vase', image: '/images/product-2.jpg', category: '雕刻葫芦', price: 2680, originalPrice: null, badge: '精品' as const },
  { id: '3', name: '彩绘福禄寿葫芦', slug: 'painted-fortune-gourd', image: '/images/product-3.jpg', category: '彩绘葫芦', price: 880, originalPrice: 1080, badge: '特惠' as const },
  { id: '4', name: '天然素面大葫芦', slug: 'natural-large-gourd', image: '/images/product-4.jpg', category: '素葫芦', price: 580, originalPrice: null, badge: undefined },
  { id: '5', name: '镂空雕花葫芦灯', slug: 'hollow-carved-gourd-lamp', image: '/images/product-5.jpg', category: '雕刻葫芦', price: 2180, originalPrice: 2680, badge: '特惠' as const },
  { id: '6', name: '烙画百鸟朝凤葫芦', slug: 'pyrography-birds-gourd', image: '/images/product-6.jpg', category: '烙画葫芦', price: 1880, originalPrice: null, badge: '精品' as const },
  { id: '7', name: '彩绘牡丹富贵葫芦', slug: 'painted-peony-gourd', image: '/images/product-7.jpg', category: '彩绘葫芦', price: 980, originalPrice: null, badge: '新品' as const },
  { id: '8', name: '葫芦茶具套装', slug: 'gourd-teaset-collection', image: '/images/product-8.jpg', category: '葫芦茶具', price: 1680, originalPrice: 1980, badge: '新品' as const },
]

const categoryFilters = [
  { name: '全部', value: '' },
  { name: '烙画葫芦', value: '烙画葫芦' },
  { name: '雕刻葫芦', value: '雕刻葫芦' },
  { name: '彩绘葫芦', value: '彩绘葫芦' },
  { name: '素葫芦', value: '素葫芦' },
  { name: '葫芦茶具', value: '葫芦茶具' },
]

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredProducts = allProducts.filter((product) => {
    const matchesCategory = !selectedCategory || product.category === selectedCategory
    const matchesSearch = !searchQuery || product.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div style={{ background: 'var(--color-rice)' }}>
      {/* Page Header */}
      <div className="py-12 md:py-16 px-4 sm:px-6 lg:px-8" style={{ background: 'var(--color-parchment)' }}>
        <div className="max-w-[1280px] mx-auto text-center">
          <h1 className="font-serif text-3xl md:text-4xl font-semibold text-[var(--color-ink)] mb-3">
            全部作品
          </h1>
          <p className="text-sm text-[var(--color-ink)] opacity-60 max-w-lg mx-auto">
            探索我们精心打造的葫芦工艺品系列，每一件都承载着匠人的心血
          </p>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-ink)] opacity-40" />
            <input
              type="text"
              placeholder="搜索作品..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-[var(--color-cloud)] bg-white text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-cinnabar)] transition-colors"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categoryFilters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setSelectedCategory(filter.value)}
                className={`px-4 py-2 text-sm tracking-wider transition-all ${
                  selectedCategory === filter.value
                    ? 'bg-[var(--color-cinnabar)] text-white'
                    : 'bg-white text-[var(--color-ink)] border border-[var(--color-cloud)] hover:border-[var(--color-cinnabar)] hover:text-[var(--color-cinnabar)]'
                }`}
              >
                {filter.name}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <p className="text-xs text-[var(--color-ink)] opacity-50 mb-6">
          共 {filteredProducts.length} 件作品
        </p>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[var(--color-ink)] opacity-50 mb-4">未找到匹配的作品</p>
            <button
              onClick={() => {
                setSelectedCategory('')
                setSearchQuery('')
              }}
              className="text-sm text-[var(--color-cinnabar)] hover:text-[var(--color-cinnabar-dark)] transition-colors"
            >
              清除筛选条件
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
