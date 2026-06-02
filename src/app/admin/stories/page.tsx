'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Plus,
  Edit,
  Trash2,
  FileText,
  Eye,
  EyeOff,
  ExternalLink,
  ImageIcon,
} from 'lucide-react'
import {
  PageHeader,
  Button,
  Badge,
  Modal,
  EmptyState,
} from '@/lib/admin/components'
import { Story } from '@/lib/admin/store'
import { apiClient } from '@/lib/api-client'
import { formatDate, truncate, cn } from '@/lib/utils'

/** 故事列表 API 响应结构 */
interface StoriesResponse {
  stories: Story[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export default function StoriesPage() {
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)

  // Delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [storyToDelete, setStoryToDelete] = useState<Story | null>(null)

  /** 从 API 加载故事列表（包含未发布的草稿） */
  const loadData = async () => {
    try {
      const data = await apiClient.get<StoriesResponse>('/api/stories?all=true&limit=999')
      setStories(data.stories)
    } catch (error) {
      console.error('Error loading stories:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  /** 删除故事（调用 API） */
  const handleDelete = async () => {
    if (!storyToDelete) return
    try {
      await apiClient.delete(`/api/stories/${storyToDelete.slug}`)
      setDeleteModalOpen(false)
      setStoryToDelete(null)
      await loadData()
    } catch (error) {
      console.error('Error deleting story:', error)
    }
  }

  /** 切换发布状态（调用 API） */
  const handleTogglePublished = async (story: Story) => {
    try {
      const newPublishedAt = story.publishedAt ? null : new Date().toISOString()
      await apiClient.put(`/api/stories/${story.slug}`, {
        publishedAt: newPublishedAt,
      })
      await loadData()
    } catch (error) {
      console.error('Error toggling published:', error)
    }
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
        title="故事管理"
        description="管理您的品牌故事和博客内容。"
        actions={
          <Link href="/admin/stories/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              添加故事
            </Button>
          </Link>
        }
      />

      {/* Stories List */}
      {stories.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="暂无故事"
          description="点击添加故事按钮创建您的第一篇文章"
          action={{ label: '添加故事', onClick: () => window.location.href = '/admin/stories/new' }}
        />
      ) : (
        <div className="space-y-4">
          {stories.map((story) => (
            <div
              key={story.id}
              className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row">
                {/* Story Image */}
                <div className="h-48 md:h-auto md:w-64 flex-shrink-0 bg-stone-100 relative">
                  {story.image ? (
                    <Image
                      src={story.image}
                      alt={story.title}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                      }}
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <ImageIcon className="h-12 w-12 text-stone-300" />
                    </div>
                  )}
                </div>

                {/* Story Content */}
                <div className="flex-1 p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-stone-900">
                          {story.title}
                        </h3>
                        {story.publishedAt ? (
                          <Badge variant="success">已发布</Badge>
                        ) : (
                          <Badge variant="default">草稿</Badge>
                        )}
                      </div>

                      {story.excerpt && (
                        <p className="text-sm text-stone-600 mb-3">
                          {truncate(story.excerpt, 150)}
                        </p>
                      )}

                      <div className="flex items-center text-xs text-stone-500 space-x-4">
                        {story.author && (
                          <span>作者：{story.author}</span>
                        )}
                        <span>创建于 {formatDate(story.createdAt)}</span>
                        {story.publishedAt && (
                          <span>发布于 {formatDate(story.publishedAt)}</span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleTogglePublished(story)}
                        className={cn(
                          'p-2 rounded-lg transition-colors',
                          story.publishedAt
                            ? 'text-emerald-600 hover:bg-emerald-50'
                            : 'text-stone-400 hover:bg-stone-100'
                        )}
                        title={story.publishedAt ? '取消发布' : '发布'}
                      >
                        {story.publishedAt ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                      </button>
                      <Link
                        href={`/admin/stories/${story.id}`}
                        className="p-2 text-stone-400 hover:text-cinnabar hover:bg-cinnabar/10 rounded-lg transition-colors"
                        title="编辑"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <a
                        href={`/stories/${story.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
                        title="查看"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                      <button
                        onClick={() => {
                          setStoryToDelete(story)
                          setDeleteModalOpen(true)
                        }}
                        className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="删除"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false)
          setStoryToDelete(null)
        }}
        title="确认删除"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-stone-600">
            确定要删除故事 <span className="font-medium text-stone-900">{storyToDelete?.title}</span> 吗？
          </p>
          <p className="text-sm text-stone-500">此操作无法撤销。</p>
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => {
                setDeleteModalOpen(false)
                setStoryToDelete(null)
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
