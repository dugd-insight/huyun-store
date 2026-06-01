import Link from 'next/link'
import { StoryCard } from '@/components/ui/StoryCard'

// 静态示例数据，用于构建时
const sampleStories = [
  {
    id: '1',
    title: '葫芦工艺的起源与传承',
    slug: 'origin-of-gourd-craft',
    content: '葫芦工艺起源于中国古代...',
    excerpt: '探索葫芦工艺在中国传统文化中的起源，以及这门古老技艺如何在现代社会中传承与发展。',
    image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=2070&auto=format&fit=crop',
    author: '葫韵工作室',
    publishedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: '传统雕刻技法详解',
    slug: 'traditional-carving-techniques',
    content: '雕刻是葫芦工艺的核心...',
    excerpt: '深入了解传统葫芦雕刻的各种技法，从选材到成品，每一步都蕴含着匠人的心血。',
    image: null,
    author: '葫韵工作室',
    publishedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    title: '葫芦在民俗文化中的象征意义',
    slug: 'gourd-symbolism',
    content: '葫芦在中国文化中象征着...',
    excerpt: '葫芦在中国传统文化中承载着丰富的象征意义，了解这些寓意能让我们更好地欣赏葫芦艺术。',
    image: null,
    author: '葫韵工作室',
    publishedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export default function StoriesPage() {
  const stories = sampleStories

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl sm:text-4xl font-light text-stone-900 mb-2">
            工艺故事
          </h1>
          <p className="text-stone-600">
            探索葫芦文化背后的精彩故事与传统工艺
          </p>
        </div>
      </div>

      {/* Featured Story */}
      {stories.length > 0 && (
        <div className="bg-stone-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="relative aspect-[16/10] bg-stone-800">
                {stories[0].image ? (
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${stories[0].image})` }}
                  />
                ) : (
                  <div className="absolute inset-0 bg-stone-700 flex items-center justify-center">
                    <span className="text-stone-500">暂无图片</span>
                  </div>
                )}
              </div>
              <div>
                <span className="text-stone-400 text-sm tracking-wider">
                  精选故事
                </span>
                <h2 className="text-3xl sm:text-4xl font-light mt-2 mb-4">
                  {stories[0].title}
                </h2>
                <p className="text-stone-300 leading-relaxed mb-6">
                  {stories[0].excerpt}
                </p>
                <Link
                  href={`/stories/${stories[0].slug}`}
                  className="inline-flex items-center text-white hover:text-stone-300 transition-colors text-sm"
                >
                  阅读全文
                  <svg
                    className="ml-2 h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stories Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-light text-stone-900 mb-8">更多故事</h2>
        {stories.length > 1 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {stories.slice(1).map((story) => (
              <StoryCard key={story.id} story={story as any} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-stone-500">暂无更多故事</p>
          </div>
        )}
      </div>
    </div>
  )
}
