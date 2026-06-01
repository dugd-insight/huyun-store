'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Save, Plus, X, ImageIcon, AlertCircle } from 'lucide-react'
import {
  Button,
  Input,
  Textarea,
  Select,
  Toggle,
} from '@/lib/admin/components'
import {
  getProduct,
  createProduct,
  updateProduct,
  getCategories,
  Category,
  Product,
  ProductStatus,
  generateSlug,
} from '@/lib/admin/store'

interface ProductFormProps {
  productId?: string
}

interface FormData {
  name: string
  slug: string
  description: string
  price: string
  originalPrice: string
  categoryId: string
  stock: string
  images: string[]
  featured: boolean
  status: ProductStatus
}

interface FormErrors {
  name?: string
  slug?: string
  price?: string
  categoryId?: string
  stock?: string
}

export function ProductForm({ productId }: ProductFormProps) {
  const router = useRouter()
  const isEditing = !!productId

  const [formData, setFormData] = useState<FormData>({
    name: '',
    slug: '',
    description: '',
    price: '',
    originalPrice: '',
    categoryId: '',
    stock: '0',
    images: [],
    featured: false,
    status: 'ACTIVE',
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [categories, setCategories] = useState<Category[]>([])
  const [newImageUrl, setNewImageUrl] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(isEditing)
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)

  // Load categories
  useEffect(() => {
    setCategories(getCategories())
  }, [])

  // Load product data if editing
  useEffect(() => {
    if (productId) {
      const product = getProduct(productId)
      if (product) {
        setFormData({
          name: product.name,
          slug: product.slug,
          description: product.description || '',
          price: product.price.toString(),
          originalPrice: product.originalPrice?.toString() || '',
          categoryId: product.categoryId,
          stock: product.stock.toString(),
          images: product.images || [],
          featured: product.featured,
          status: product.status,
        })
        setSlugManuallyEdited(true)
      } else {
        router.push('/admin/products')
      }
      setIsLoading(false)
    }
  }, [productId, router])

  // Auto-generate slug from name
  const handleNameChange = (name: string) => {
    setFormData((prev) => ({ ...prev, name }))
    if (!slugManuallyEdited) {
      setFormData((prev) => ({ ...prev, slug: generateSlug(name) }))
    }
  }

  // Handle slug change
  const handleSlugChange = (slug: string) => {
    setSlugManuallyEdited(true)
    setFormData((prev) => ({ ...prev, slug: generateSlug(slug) }))
  }

  // Add image URL
  const handleAddImage = () => {
    if (newImageUrl && isValidUrl(newImageUrl)) {
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, newImageUrl],
      }))
      setNewImageUrl('')
    }
  }

  // Remove image
  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
  }

  // Validate URL
  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  // Validate form
  const validate = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = '请输入商品名称'
    }

    if (!formData.slug.trim()) {
      newErrors.slug = '请输入商品slug'
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = 'slug只能包含小写字母、数字和连字符'
    }

    if (!formData.price.trim()) {
      newErrors.price = '请输入商品价格'
    } else if (isNaN(parseFloat(formData.price)) || parseFloat(formData.price) < 0) {
      newErrors.price = '请输入有效的价格'
    }

    if (formData.originalPrice && (isNaN(parseFloat(formData.originalPrice)) || parseFloat(formData.originalPrice) < 0)) {
      newErrors.price = '请输入有效的原价'
    }

    if (!formData.categoryId) {
      newErrors.categoryId = '请选择商品分类'
    }

    if (!formData.stock.trim()) {
      newErrors.stock = '请输入库存数量'
    } else if (isNaN(parseInt(formData.stock)) || parseInt(formData.stock) < 0) {
      newErrors.stock = '请输入有效的库存数量'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    setIsSaving(true)

    try {
      const productData = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        description: formData.description.trim() || null,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
        categoryId: formData.categoryId,
        stock: parseInt(formData.stock),
        images: formData.images,
        featured: formData.featured,
        status: formData.status,
      }

      if (isEditing && productId) {
        updateProduct(productId, productData)
      } else {
        createProduct(productData)
      }

      router.push('/admin/products')
    } catch (error) {
      console.error('Error saving product:', error)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-48 bg-stone-200 rounded"></div>
        <div className="h-96 bg-stone-200 rounded-xl"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link
            href="/admin/products"
            className="mr-4 p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-semibold text-stone-900">
            {isEditing ? '编辑商品' : '添加商品'}
          </h1>
        </div>
        <Button onClick={handleSubmit} disabled={isSaving}>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? '保存中...' : '保存'}
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-stone-900 mb-4">基本信息</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Input
                label="商品名称"
                placeholder="输入商品名称"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                error={errors.name}
                required
              />
            </div>
            <div className="md:col-span-2">
              <Input
                label="Slug"
                placeholder="product-slug"
                value={formData.slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                error={errors.slug}
                required
              />
              <p className="mt-1 text-xs text-stone-500">
                URL友好的标识符，将用于商品详情页URL
              </p>
            </div>
            <div className="md:col-span-2">
              <Textarea
                label="商品描述"
                placeholder="详细描述商品的特点、材质、使用方法等..."
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                rows={4}
              />
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-stone-900 mb-4">价格与库存</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="售价 (CNY)"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={formData.price}
              onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
              error={errors.price}
              required
            />
            <Input
              label="原价 (CNY)"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={formData.originalPrice}
              onChange={(e) => setFormData((prev) => ({ ...prev, originalPrice: e.target.value }))}
            />
            <Input
              label="库存"
              type="number"
              min="0"
              placeholder="0"
              value={formData.stock}
              onChange={(e) => setFormData((prev) => ({ ...prev, stock: e.target.value }))}
              error={errors.stock}
              required
            />
          </div>
        </div>

        {/* Category & Status */}
        <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-stone-900 mb-4">分类与状态</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="商品分类"
              options={categories.map((c) => ({ value: c.id, label: c.name }))}
              value={formData.categoryId}
              onChange={(value) => setFormData((prev) => ({ ...prev, categoryId: value }))}
              placeholder="选择分类"
              error={errors.categoryId}
            />
            <Select
              label="商品状态"
              options={[
                { value: 'ACTIVE', label: '上架' },
                { value: 'INACTIVE', label: '下架' },
                { value: 'OUT_OF_STOCK', label: '缺货' },
              ]}
              value={formData.status}
              onChange={(value) => setFormData((prev) => ({ ...prev, status: value as ProductStatus }))}
            />
          </div>
          <div className="mt-4">
            <Toggle
              label="推荐商品"
              checked={formData.featured}
              onChange={(checked) => setFormData((prev) => ({ ...prev, featured: checked }))}
            />
            <p className="mt-1 text-xs text-stone-500">
              推荐商品将显示在首页精选区域
            </p>
          </div>
        </div>

        {/* Images */}
        <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-stone-900 mb-4">商品图片</h2>

          {/* Image Preview */}
          {formData.images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {formData.images.map((url, index) => (
                <div
                  key={index}
                  className="relative aspect-square rounded-lg overflow-hidden bg-stone-100 group"
                >
                  <Image
                    src={url}
                    alt={`商品图片 ${index + 1}`}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  {index === 0 && (
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-cinnabar text-white text-xs rounded">
                      封面
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Add Image */}
          <div className="flex gap-2">
            <Input
              placeholder="输入图片URL..."
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddImage()
                }
              }}
              className="flex-1"
            />
            <Button type="button" variant="secondary" onClick={handleAddImage}>
              <Plus className="h-4 w-4 mr-2" />
              添加
            </Button>
          </div>
          <p className="mt-2 text-xs text-stone-500">
            支持从图床或CDN输入图片URL地址
          </p>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-4">
          <Link href="/admin/products">
            <Button type="button" variant="secondary">
              取消
            </Button>
          </Link>
          <Button type="submit" disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? '保存中...' : '保存商品'}
          </Button>
        </div>
      </form>
    </div>
  )
}
