'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Star,
  StarOff,
  Filter,
  X,
  ImageIcon,
} from 'lucide-react'
import {
  PageHeader,
  Button,
  Input,
  Select,
  Badge,
  Pagination,
  Modal,
  EmptyState,
} from '@/lib/admin/components'
import { Product, Category } from '@/lib/admin/store'
import { apiClient } from '@/lib/api-client'
import { formatPrice, cn } from '@/lib/utils'

const ITEMS_PER_PAGE = 10

/** 产品列表 API 响应结构 */
interface ProductsResponse {
  products: (Product & { category?: { id: string; name: string; slug: string } })[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export default function ProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  // Delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)

  /** 从 API 加载产品和分类数据 */
  const loadData = async () => {
    try {
      setLoading(true)
      const [productsRes, categoriesData] = await Promise.all([
        apiClient.get<ProductsResponse>('/api/products?all=true&limit=999'),
        apiClient.get<Category[]>('/api/categories'),
      ])
      setProducts(productsRes.products)
      setCategories(categoriesData)
    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Filter products (客户端过滤)
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = !selectedCategory || product.categoryId === selectedCategory
    const matchesStatus = !selectedStatus || product.status === selectedStatus
    return matchesSearch && matchesCategory && matchesStatus
  })

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE)
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  /** 删除产品（调用 API） */
  const handleDelete = async () => {
    if (!productToDelete) return
    try {
      await apiClient.delete(`/api/products/${productToDelete.slug}`)
      setDeleteModalOpen(false)
      setProductToDelete(null)
      await loadData()
    } catch (error) {
      console.error('Error deleting product:', error)
    }
  }

  /** 切换推荐状态（调用 API） */
  const handleToggleFeatured = async (product: Product) => {
    try {
      await apiClient.put<Product>(`/api/products/${product.slug}`, {
        featured: !product.featured,
      })
      await loadData()
    } catch (error) {
      console.error('Error toggling featured:', error)
    }
  }

  const getStatusBadge = (status: Product['status']) => {
    const variants: Record<Product['status'], 'success' | 'warning' | 'danger' | 'default'> = {
      ACTIVE: 'success',
      INACTIVE: 'default',
      OUT_OF_STOCK: 'danger',
    }
    const labels: Record<Product['status'], string> = {
      ACTIVE: '上架',
      INACTIVE: '下架',
      OUT_OF_STOCK: '缺货',
    }
    return <Badge variant={variants[status]}>{labels[status]}</Badge>
  }

  const hasFilters = searchQuery || selectedCategory || selectedStatus

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategory('')
    setSelectedStatus('')
    setCurrentPage(1)
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-48 bg-stone-200 rounded"></div>
        <div className="h-14 bg-stone-200 rounded-xl"></div>
        <div className="h-96 bg-stone-200 rounded-xl"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="商品管理"
        description="管理您的商品列表，添加、编辑或删除商品。"
        actions={
          <Link href="/admin/products/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              添加商品
            </Button>
          </Link>
        }
      />

      {/* Filters */}
      <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-stone-400" />
              <Input
                placeholder="搜索商品..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <Select
              options={categories.map((c) => ({ value: c.id, label: c.name }))}
              value={selectedCategory}
              onChange={(value) => {
                setSelectedCategory(value)
                setCurrentPage(1)
              }}
              placeholder="全部分类"
              className="w-40"
            />
            <Select
              options={[
                { value: 'ACTIVE', label: '上架' },
                { value: 'INACTIVE', label: '下架' },
                { value: 'OUT_OF_STOCK', label: '缺货' },
              ]}
              value={selectedStatus}
              onChange={(value) => {
                setSelectedStatus(value)
                setCurrentPage(1)
              }}
              placeholder="全部状态"
              className="w-32"
            />
            {hasFilters && (
              <Button variant="ghost" onClick={clearFilters}>
                <X className="h-4 w-4 mr-2" />
                清除
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Products Table */}
      {paginatedProducts.length === 0 ? (
        <EmptyState
          icon={Filter}
          title={hasFilters ? '没有找到匹配的商品' : '暂无商品'}
          description={
            hasFilters
              ? '尝试调整筛选条件或清除筛选'
              : '点击添加商品按钮创建您的第一个商品'
          }
          action={
            hasFilters
              ? { label: '清除筛选', onClick: clearFilters }
              : { label: '添加商品', onClick: () => router.push('/admin/products/new') }
          }
        />
      ) : (
        <>
          <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-stone-200">
              <thead className="bg-stone-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                    商品
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                    分类
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                    价格
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                    库存
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                    状态
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {paginatedProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-stone-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-12 w-12 flex-shrink-0 rounded-lg overflow-hidden bg-stone-100">
                          {product.images && product.images[0] ? (
                            <Image
                              src={product.images[0]}
                              alt={product.name}
                              width={48}
                              height={48}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                              <ImageIcon className="h-6 w-6 text-stone-400" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-stone-900">
                            {product.featured && (
                              <Star className="inline-block h-3 w-3 text-amber-500 mr-1" />
                            )}
                            {product.name}
                          </p>
                          <p className="text-xs text-stone-500 truncate max-w-[200px]">
                            {product.description || '暂无描述'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-stone-600">
                      {product.category?.name || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-stone-900">
                        {formatPrice(Number(product.price))}
                      </p>
                      {product.originalPrice && (
                        <p className="text-xs text-stone-400 line-through">
                          {formatPrice(Number(product.originalPrice))}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={cn(
                          product.stock <= 5 && product.stock > 0 && 'text-amber-600',
                          product.stock === 0 && 'text-red-600 font-medium'
                        )}
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(product.status)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleToggleFeatured(product)}
                          className="p-1.5 text-stone-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"
                          title={product.featured ? '取消推荐' : '设为推荐'}
                        >
                          {product.featured ? (
                            <Star className="h-4 w-4" />
                          ) : (
                            <StarOff className="h-4 w-4" />
                          )}
                        </button>
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="p-1.5 text-stone-400 hover:text-cinnabar hover:bg-cinnabar/10 rounded-lg transition-colors"
                          title="编辑"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => {
                            setProductToDelete(product)
                            setDeleteModalOpen(true)
                          }}
                          className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="删除"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false)
          setProductToDelete(null)
        }}
        title="确认删除"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-stone-600">
            确定要删除商品 <span className="font-medium text-stone-900">{productToDelete?.name}</span> 吗？
          </p>
          <p className="text-sm text-stone-500">此操作无法撤销。</p>
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => {
                setDeleteModalOpen(false)
                setProductToDelete(null)
              }}
            >
              取消
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              删除
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
