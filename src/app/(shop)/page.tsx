import { ProductCard } from '@/components/product/ProductCard'
import { StoryCard } from '@/components/ui/StoryCard'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

// 静态示例数据，用于构建时
const sampleProducts = [
  {
    id: '1',
    name: '传统雕刻葫芦瓶',
    slug: 'traditional-carved-gourd-vase',
    description: '精美的传统雕刻葫芦瓶，采用百年传承技艺手工制作。',
    price: 1280,
    originalPrice: 1580,
    images: ['https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=2070&auto=format&fit=crop'],
    categoryId: '1',
    stock: 5,
    status: 'ACTIVE' as const,
    featured: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    category: {
      id: '1',
      name: '雕刻葫芦',
      slug: 'carved-gourd',
      description: null,
      image: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  },
  {
    id: '2',
    name: '彩绘福禄葫芦',
    slug: 'painted-fortune-gourd',
    description: '寓意福禄双全的彩绘葫芦，色彩鲜艳，工艺精湛。',
    price: 880,
    originalPrice: null,
    images: ['https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?q=80&w=2449&auto=format&fit=crop'],
    categoryId: '2',
    stock: 8,
    status: 'ACTIVE' as const,
    featured: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    category: {
      id: '2',
      name: '彩绘葫芦',
      slug: 'painted-gourd',
      description: null,
      image: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  },
  {
    id: '3',
    name: '烫画山水葫芦',
    slug: 'pyrography-landscape-gourd',
    description: '采用传统烫画技艺，将山水意境完美呈现于葫芦之上。',
    price: 1680,
    originalPrice: null,
    images: ['https://images.unsplash.com/photo-1513519245088-0e12902e35ca?q=80&w=2070&auto=format&fit=crop'],
    categoryId: '3',
    stock: 3,
    status: 'ACTIVE' as const,
    featured: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    category: {
      id: '3',
      name: '烫画葫芦',
      slug: 'pyrography-gourd',
      description: null,
      image: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  },
  {
    id: '4',
    name: '镂空雕花葫芦灯',
    slug: 'hollow-carved-gourd-lamp',
    description: '精美的镂空雕花葫芦灯，光影交错，美轮美奂。',
    price: 2180,
    originalPrice: 2680,
    images: ['https://images.unsplash.com/photo-1544967082-d9d25d867d66?q=80&w=2070&auto=format&fit=crop'],
    categoryId: '1',
    stock: 2,
    status: 'ACTIVE' as const,
    featured: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    category: {
      id: '1',
      name: '雕刻葫芦',
      slug: 'carved-gourd',
      description: null,
      image: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  },
]

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

export default function HomePage() {
  const products = sampleProducts
  const stories = sampleStories

  return (
    <>
      {/* Hero Section */}
      <section className="relative h-[80vh] min-h-[600px] flex items-center justify-center overflow-hidden bg-stone-900">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-stone-900/60 via-stone-900/40 to-stone-900/80" />
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center" />
        </div>
        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-light text-white mb-6 tracking-tight">
            葫韵
            <span className="block text-2xl sm:text-3xl font-normal mt-2 text-stone-300">
              HUYUN
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-stone-200 mb-8 max-w-2xl mx-auto leading-relaxed">
            传承千年葫芦工艺，每一件作品都承载着匠人的心血与智慧
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/products"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-stone-900 rounded-none hover:bg-stone-100 transition-colors text-sm tracking-wider"
            >
              探索作品
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link
              href="/stories"
              className="inline-flex items-center justify-center px-8 py-4 border border-white text-white rounded-none hover:bg-white/10 transition-colors text-sm tracking-wider"
            >
              了解工艺
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-stone-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl sm:text-4xl font-light text-stone-900 mb-2">
                精选作品
              </h2>
              <p className="text-stone-600">匠心独运，每一件都是艺术品</p>
            </div>
            <Link
              href="/products"
              className="hidden sm:inline-flex items-center text-stone-900 hover:text-stone-600 transition-colors text-sm"
            >
              查看全部
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product as any} />
            ))}
          </div>
          <div className="mt-8 text-center sm:hidden">
            <Link
              href="/products"
              className="inline-flex items-center text-stone-900 hover:text-stone-600 transition-colors text-sm"
            >
              查看全部
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Craftsmanship Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative aspect-[4/3] bg-stone-100">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?q=80&w=2449&auto=format&fit=crop')] bg-cover bg-center" />
            </div>
            <div>
              <h2 className="text-3xl sm:text-4xl font-light text-stone-900 mb-6">
                传统工艺，现代诠释
              </h2>
              <div className="space-y-4 text-stone-600 leading-relaxed">
                <p>
                  葫芦在中国文化中承载着吉祥、福禄的美好寓意。我们的每一件作品都源自对传统工艺的深刻理解与尊重。
                </p>
                <p>
                  从选料、雕刻到上色，每一道工序都由经验丰富的匠人手工完成。我们相信，只有用心，才能创造出有温度的作品。
                </p>
                <p>
                  葫韵致力于将这份传统美学带入现代生活，让更多人感受到东方工艺的独特魅力。
                </p>
              </div>
              <Link
                href="/stories"
                className="inline-flex items-center mt-8 text-stone-900 hover:text-stone-600 transition-colors text-sm"
              >
                了解更多工艺故事
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stories Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-stone-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl sm:text-4xl font-light text-stone-900 mb-2">
                工艺故事
              </h2>
              <p className="text-stone-600">探索葫芦文化背后的精彩故事</p>
            </div>
            <Link
              href="/stories"
              className="hidden sm:inline-flex items-center text-stone-900 hover:text-stone-600 transition-colors text-sm"
            >
              查看全部
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {stories.map((story) => (
              <StoryCard key={story.id} story={story as any} />
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-stone-900">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-light text-white mb-4">
            订阅我们
          </h2>
          <p className="text-stone-400 mb-8">
            获取最新作品资讯和独家优惠
          </p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="输入您的邮箱"
              className="flex-1 px-4 py-3 bg-white/10 border border-white/20 text-white placeholder:text-stone-500 focus:outline-none focus:border-white/40"
            />
            <button
              type="submit"
              className="px-8 py-3 bg-white text-stone-900 hover:bg-stone-100 transition-colors text-sm tracking-wider"
            >
              订阅
            </button>
          </form>
        </div>
      </section>
    </>
  )
}
