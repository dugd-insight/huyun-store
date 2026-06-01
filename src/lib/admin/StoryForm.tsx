'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Save, Eye, EyeOff, ImageIcon } from 'lucide-react'
import {
  Button,
  Input,
  Textarea,
  Toggle,
} from '@/lib/admin/components'
import {
  getStory,
  createStory,
  updateStory,
  generateSlug,
  Story,
} from '@/lib/admin/store'

interface StoryFormProps {
  storyId?: string
}

interface FormData {
  title: string
  slug: string
  content: string
  excerpt: string
  image: string
  author: string
  published: boolean
}

interface FormErrors {
  title?: string
  slug?: string
  content?: string
}

export function StoryForm({ storyId }: StoryFormProps) {
  const router = useRouter()
  const isEditing = !!storyId

  const [formData, setFormData] = useState<FormData>({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    image: '',
    author: '',
    published: false,
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(isEditing)
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)

  // Load story data if editing
  useEffect(() => {
    if (storyId) {
      const story = getStory(storyId)
      if (story) {
        setFormData({
          title: story.title,
          slug: story.slug,
          content: story.content,
          excerpt: story.excerpt || '',
          image: story.image || '',
          author: story.author || '',
          published: !!story.publishedAt,
        })
        setSlugManuallyEdited(true)
      } else {
        router.push('/admin/stories')
      }
      setIsLoading(false)
    }
  }, [storyId, router])

  // Auto-generate slug from title
  const handleTitleChange = (title: string) => {
    setFormData((prev) => ({ ...prev, title }))
    if (!slugManuallyEdited) {
      setFormData((prev) => ({ ...prev, slug: generateSlug(title) }))
    }
  }

  // Handle slug change
  const handleSlugChange = (slug: string) => {
    setSlugManuallyEdited(true)
    setFormData((prev) => ({ ...prev, slug: generateSlug(slug) }))
  }

  // Validate form
  const validate = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.title.trim()) {
      newErrors.title = '请输入故事标题'
    }

    if (!formData.slug.trim()) {
      newErrors.slug = '请输入故事slug'
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = 'slug只能包含小写字母、数字和连字符'
    }

    if (!formData.content.trim()) {
      newErrors.content = '请输入故事内容'
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
      const storyData = {
        title: formData.title.trim(),
        slug: formData.slug.trim(),
        content: formData.content.trim(),
        excerpt: formData.excerpt.trim() || null,
        image: formData.image.trim() || null,
        author: formData.author.trim() || null,
        publishedAt: formData.published ? new Date().toISOString() : null,
      }

      if (isEditing && storyId) {
        updateStory(storyId, storyData)
      } else {
        createStory(storyData)
      }

      router.push('/admin/stories')
    } catch (error) {
      console.error('Error saving story:', error)
    } finally {
      setIsSaving(false)
    }
  }

  // Toggle published status
  const handleTogglePublished = () => {
    setFormData((prev) => ({ ...prev, published: !prev.published }))
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
            href="/admin/stories"
            className="mr-4 p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-semibold text-stone-900">
            {isEditing ? '编辑故事' : '添加故事'}
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
          <div className="space-y-4">
            <Input
              label="标题"
              placeholder="输入故事标题"
              value={formData.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              error={errors.title}
              required
            />
            <Input
              label="Slug"
              placeholder="story-slug"
              value={formData.slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              error={errors.slug}
              required
            />
            <Input
              label="作者"
              placeholder="作者名称（可选）"
              value={formData.author}
              onChange={(e) => setFormData((prev) => ({ ...prev, author: e.target.value }))}
            />
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-stone-900 mb-4">故事内容</h2>
          <div className="space-y-4">
            <Textarea
              label="摘要"
              placeholder="简短描述（将在列表页显示）"
              value={formData.excerpt}
              onChange={(e) => setFormData((prev) => ({ ...prev, excerpt: e.target.value }))}
              rows={2}
            />
            <div className="space-y-1">
              <label className="block text-sm font-medium text-stone-700">
                正文内容 <span className="text-red-500">*</span>
              </label>
              <Textarea
                placeholder="输入故事正文内容..."
                value={formData.content}
                onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
                rows={16}
                error={errors.content}
                required
              />
              <p className="text-xs text-stone-500">
                支持富文本格式，可以使用 Markdown 或纯文本
              </p>
            </div>
          </div>
        </div>

        {/* Image & Status */}
        <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-stone-900 mb-4">图片与发布</h2>
          <div className="space-y-4">
            {/* Image Preview */}
            {formData.image && (
              <div className="relative h-48 rounded-lg overflow-hidden bg-stone-100">
                <Image
                  src={formData.image}
                  alt="故事封面"
                  fill
                  className="object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                  }}
                />
              </div>
            )}
            <Input
              label="封面图片URL"
              placeholder="https://example.com/image.jpg"
              value={formData.image}
              onChange={(e) => setFormData((prev) => ({ ...prev, image: e.target.value }))}
            />
            <div className="flex items-center justify-between pt-4 border-t border-stone-200">
              <div>
                <Toggle
                  label="立即发布"
                  checked={formData.published}
                  onChange={handleTogglePublished}
                />
                <p className="mt-1 text-xs text-stone-500">
                  {formData.published ? '故事将显示在故事列表' : '故事将保存为草稿'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-4">
          <Link href="/admin/stories">
            <Button type="button" variant="secondary">
              取消
            </Button>
          </Link>
          <Button type="submit" disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? '保存中...' : '保存故事'}
          </Button>
        </div>
      </form>
    </div>
  )
}
