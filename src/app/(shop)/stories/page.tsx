import { prisma } from '@/lib/prisma'
import { ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

/* ===========================
   故事列表页 - 服务端组件
   =========================== */

export default async function StoriesPage() {
  const stories = await prisma.story.findMany({
    orderBy: { publishedAt: 'desc' },
    take: 20,
  })

  const featuredStory = stories[0] || null
  const regularStories = stories.slice(1)

  return (
    <div style={{ background: 'var(--color-rice)' }}>
      {/* Page Header */}
      <div className="py-12 md:py-16 px-4 sm:px-6 lg:px-8" style={{ background: 'var(--color-parchment)' }}>
        <div className="max-w-[1280px] mx-auto text-center">
          <h1 className="font-serif text-3xl md:text-4xl font-semibold text-[var(--color-ink)] mb-3">
            葫芦故事
          </h1>
          <p className="text-sm text-[var(--color-ink)] opacity-60 max-w-lg mx-auto">
            每一个葫芦背后都有一个故事，每一段故事都承载着文化的传承
          </p>
        </div>
      </div>

      {/* Featured Story */}
      {featuredStory && (
        <div className="py-12 md:py-16 px-4 sm:px-6 lg:px-8" style={{ background: 'var(--color-ink)' }}>
          <div className="max-w-[1280px] mx-auto">
            <Link
              href={`/stories/${featuredStory.slug}`}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center group"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                {featuredStory.image && (
                  <Image
                    src={featuredStory.image}
                    alt={featuredStory.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                )}
              </div>
              <div>
                <span className="text-xs tracking-[0.2em] uppercase text-[var(--color-gold)]">
                  精选故事
                </span>
                <h2 className="font-serif text-2xl md:text-3xl font-semibold text-white mt-2 mb-4">
                  {featuredStory.title}
                </h2>
                <p className="text-sm text-white/70 leading-relaxed mb-6">
                  {featuredStory.excerpt}
                </p>
                <span className="inline-flex items-center gap-1 text-sm text-[var(--color-cinnabar-light)] group-hover:text-white transition-colors">
                  阅读全文
                  <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </Link>
          </div>
        </div>
      )}

      {/* Stories Grid */}
      {regularStories.length > 0 && (
        <div className="py-12 md:py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-[1280px] mx-auto">
            <h2 className="font-serif text-xl md:text-2xl font-semibold text-[var(--color-ink)] mb-8">
              更多故事
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
              {regularStories.map((story) => (
                <Link
                  key={story.id}
                  href={`/stories/${story.slug}`}
                  className="story-card group"
                >
                  <div className="story-card-image-wrapper">
                    {story.image && (
                      <Image
                        src={story.image}
                        alt={story.title}
                        fill
                        className="story-card-image"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    )}
                    <div className="story-card-overlay">
                      <h3 className="story-card-title">{story.title}</h3>
                      <p className="story-card-excerpt">{story.excerpt}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {stories.length === 0 && (
        <div className="py-20 text-center">
          <p className="text-[var(--color-ink)] opacity-50">暂无故事内容</p>
        </div>
      )}
    </div>
  )
}
