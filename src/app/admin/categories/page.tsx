'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import {
  Plus,
  Edit,
  Trash2,
  Layers,
} from 'lucide-react'
import {
  PageHeader,
  Button,
  Input,
  Textarea,
  Modal,
  EmptyState,
  Badge,
} from '@/lib/admin/components'
import { Category, generateSlug } from '@/lib/admin/store'
import { apiClient } from '@/lib/api-client'

/** 分类 API 返回结构（包含商品数量） */
interface CategoryWithCount extends Category {
  _count?: { products: number }
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryWithCount[]>([])
  const [loading, setLoading] = useState(true)
  const [productCounts, setProductCounts] = useState<Record<string, number>>({})

  // Modal states
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image: '',
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)

  /** 从 API 加载分类数据 */
  const loadData = async () => {
    try {
      const categoriesData = await apiClient.get<CategoryWithCount[]>('/api/categories')
      setCategories(categoriesData)

      // 从 API 返回的 _count 提取商品数量
      const counts: Record<string, number> = {}
      categoriesData.forEach((cat) => {
        counts[cat.id] = cat._count?.products || 0
      })
      setProductCounts(counts)
    } catch (error) {
      console.error('Error loading categories:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Open modal for adding/editing
  const openModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category)
      setFormData({
        name: category.name,
        slug: category.slug,
        description: category.description || '',
        image: category.image || '',
      })
    } else {
      setEditingCategory(null)
      setFormData({
        name: '',
        slug: '',
        description: '',
        image: '',
      })
    }
    setFormErrors({})
    setModalOpen(true)
  }

  // Validate form
  const validate = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.name.trim()) {
      errors.name = '请输入分类名称'
    }

    if (!formData.slug.trim()) {
      errors.slug = '请输入分类slug'
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      errors.slug = 'slug只能包含小写字母、数字和连字符'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  /** 提交表单（创建或更新分类，调用 API） */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    setIsSaving(true)

    try {
      const categoryData = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        description: formData.description.trim() || null,
        image: formData.image.trim() || null,
      }

      if (editingCategory) {
        // 使用 slug 作为路径参数调用 PUT 更新
        await apiClient.put(`/api/categories/${editingCategory.slug}`, categoryData)
      } else {
        await apiClient.post('/api/categories', categoryData)
      }

      setModalOpen(false)
      await loadData()
    } catch (error) {
      console.error('Error saving category:', error)
    } finally {
      setIsSaving(false)
    }
  }

  /** 删除分类（调用 API） */
  const handleDelete = async () => {
    if (!categoryToDelete) return

    // 检查分类下是否有商品
    if (productCounts[categoryToDelete.id] > 0) {
      alert('该分类下有商品，无法删除。请先删除或移动该分类下的商品。')
      setDeleteModalOpen(false)
      setCategoryToDelete(null)
      return
    }

    try {
      await apiClient.delete(`/api/categories/${categoryToDelete.slug}`)
      setDeleteModalOpen(false)
      setCategoryToDelete(null)
      await loadData()
    } catch (error) {
      console.error('Error deleting category:', error)
    }
  }

  // Auto-generate slug from name
  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      slug: generateSlug(name),
    }))
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
        title="分类管理"
        description="管理您的商品分类，创建和编辑分类以便更好地组织商品。"
        actions={
          <Button onClick={() => openModal()}>
            <Plus className="h-4 w-4 mr-2" />
            添加分类
          </Button>
        }
      />

      {/* Categories Grid */}
      {categories.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="暂无分类"
          description="点击添加分类按钮创建您的第一个商品分类"
          action={{ label: '添加分类', onClick: () => openModal() }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <div
              key={category.id}
              className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Category Image */}
              <div className="h-40 bg-stone-100 relative">
                {category.image ? (
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                    }}
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <Layers className="h-12 w-12 text-stone-300" />
                  </div>
                )}
              </div>

              {/* Category Info */}
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-stone-900">{category.name}</h3>
                    <p className="text-sm text-stone-500 mt-1">{category.slug}</p>
                  </div>
                  <Badge variant="default">
                    {productCounts[category.id] || 0} 个商品
                  </Badge>
                </div>
                {category.description && (
                  <p className="text-sm text-stone-600 mt-3 line-clamp-2">
                    {category.description}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="px-4 py-3 border-t border-stone-100 flex justify-end space-x-2">
                <button
                  onClick={() => openModal(category)}
                  className="p-2 text-stone-400 hover:text-cinnabar hover:bg-cinnabar/10 rounded-lg transition-colors"
                  title="编辑"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    setCategoryToDelete(category)
                    setDeleteModalOpen(true)
                  }}
                  className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="删除"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCategory ? '编辑分类' : '添加分类'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="分类名称"
            placeholder="例如：葫芦摆件"
            value={formData.name}
            onChange={(e) => handleNameChange(e.target.value)}
            error={formErrors.name}
            required
          />
          <Input
            label="Slug"
            placeholder="baijian"
            value={formData.slug}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, slug: e.target.value.toLowerCase() }))
            }
            error={formErrors.slug}
            required
          />
          <Textarea
            label="描述"
            placeholder="分类描述（可选）"
            value={formData.description}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            rows={3}
          />
          <Input
            label="图片URL"
            placeholder="https://example.com/image.jpg"
            value={formData.image}
            onChange={(e) => setFormData((prev) => ({ ...prev, image: e.target.value }))}
          />
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setModalOpen(false)}
            >
              取消
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? '保存中...' : '保存'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false)
          setCategoryToDelete(null)
        }}
        title="确认删除"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-stone-600">
            确定要删除分类 <span className="font-medium text-stone-900">{categoryToDelete?.name}</span> 吗？
          </p>
          {categoryToDelete && productCounts[categoryToDelete.id] > 0 && (
            <div className="flex items-start p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
              <div className="flex-shrink-0 mr-2">
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <p>该分类下有 {productCounts[categoryToDelete.id]} 个商品，无法删除。请先删除或移动该分类下的商品。</p>
            </div>
          )}
          {(!categoryToDelete || productCounts[categoryToDelete.id] === 0) && (
            <p className="text-sm text-stone-500">此操作无法撤销。</p>
          )}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => {
                setDeleteModalOpen(false)
                setCategoryToDelete(null)
              }}
            >
              取消
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              disabled={!categoryToDelete || productCounts[categoryToDelete.id] > 0}
            >
              删除
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
