import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { formatDate } from '@/lib/utils'

async function getStory(slug: string) {
  return prisma.story.findUnique({
    where: { slug },
  })
}

interface StoryPageProps {
  params: Promise<{ slug: string }>
}

export default async function StoryPage({ params }: StoryPageProps) {
  const { slug } = await params
  const story = await getStory(slug)

  if (!story) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Back Navigation */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/stories"
            className="inline-flex items-center text-stone-600 hover:text-stone-900 transition-colors text-sm"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回故事列表
          </Link>
        </div>
      </div>

      {/* Story Header */}
      <div className="bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {story.image && (
            <div className="relative aspect-[21/9] mb-8 bg-stone-100">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${story.image})` }}
              />
            </div>
          )}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light text-stone-900 mb-4">
            {story.title}
          </h1>
          <div className="flex items-center gap-4 text-sm text-stone-500">
            {story.author && <span>作者：{story.author}</span>}
            {story.author && story.publishedAt && (
              <span className="w-1 h-1 rounded-full bg-stone-300" />
            )}
            {story.publishedAt && (
              <span>{formatDate(story.publishedAt)}</span>
            )}
          </div>
        </div>
      </div>

      {/* Story Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <article className="prose prose-stone prose-lg max-w-none">
          <div
            dangerouslySetInnerHTML={{ __html: story.content }}
            className="text-stone-700 leading-relaxed"
          />
        </article>
      </div>
    </div>
  )
}
