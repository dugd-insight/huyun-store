'use client'

import { useState, useEffect } from 'react'
import { ProductCard } from '@/components/product/ProductCard'
import { CategoryFilter } from '@/components/product/CategoryFilter'
import { Product } from '@/types'
import { Loader2 } from 'lucide-react'

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchProducts()
  }, [selectedCategory, page])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (selectedCategory) params.append('category', selectedCategory)
      params.append('page', page.toString())
      params.append('limit', '12')

      const response = await fetch(`/api/products?${params}`)
      const data = await response.json()
      setProducts(data.products)
      setTotalPages(data.pagination.totalPages)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl sm:text-4xl font-light text-stone-900 mb-2">
            全部作品
          </h1>
          <p className="text-stone-600">
            探索我们精心打造的葫芦工艺品系列
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <CategoryFilter
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-stone-400" />
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-stone-500">暂无商品</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-12 flex justify-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (pageNum) => (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`px-4 py-2 text-sm ${
                            page === pageNum
                              ? 'bg-stone-900 text-white'
                              : 'bg-white text-stone-900 hover:bg-stone-100'
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
