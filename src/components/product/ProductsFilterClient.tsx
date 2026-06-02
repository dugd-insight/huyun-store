'use client'

import { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import { ProductCard } from '@/components/product/ProductCard'
import { useRouter, useSearchParams } from 'next/navigation'

/* ===========================
   类型定义
   =========================== */

interface ProductData {
  id: string
  name: string
  slug: string
  image: string
  category: string
  price: number
  originalPrice?: number | null
  badge?: '新品' | '精品' | '特惠'
}

interface CategoryFilter {
  name: string
  value: string
}

interface ProductsFilterClientProps {
  products: ProductData[]
  categoryFilters: CategoryFilter[]
  initialCategory: string
  initialSearch: string
}

/* ===========================
   产品筛选客户端组件
   负责搜索和分类筛选的交互逻辑，
   通过 URL 参数同步状态实现服务端渲染。
   =========================== */

export default function ProductsFilterClient({
  products,
  categoryFilters,
  initialCategory,
  initialSearch,
}: ProductsFilterClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedCategory, setSelectedCategory] = useState(initialCategory)
  const [searchQuery, setSearchQuery] = useState(initialSearch)
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch)

  // 搜索防抖处理
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // 当搜索或分类变化时更新 URL
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())

    if (selectedCategory) {
      params.set('category', selectedCategory)
    } else {
      params.delete('category')
    }

    if (debouncedSearch) {
      params.set('search', debouncedSearch)
    } else {
      params.delete('search')
    }

    const newUrl = `/products${params.toString() ? '?' + params.toString() : ''}`
    router.push(newUrl, { scroll: false })
  }, [selectedCategory, debouncedSearch, router, searchParams])

  // 客户端实时筛选（优化体验，避免每次输入都触发页面重载）
  const filteredProducts = products.filter((product) => {
    const matchesCategory = !selectedCategory || product.category === selectedCategory
    const matchesSearch = !searchQuery || product.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const handleReset = () => {
    setSelectedCategory('')
    setSearchQuery('')
    setDebouncedSearch('')
  }

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
              onClick={handleReset}
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
