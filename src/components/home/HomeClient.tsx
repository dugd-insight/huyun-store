'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ChevronDown } from 'lucide-react'
import { HeroCarousel } from '@/components/ui/HeroCarousel'
import { ProductCard } from '@/components/product/ProductCard'
import { StoryModal } from '@/components/ui/StoryModal'

/* ===========================
   Hero Slides 配置（纯展示，保持不变）
   =========================== */

const heroSlides = [
  {
    image: '/images/hero-main.jpg',
    badge: '千年传承 · 匠心独运',
    title: '葫韵',
    subtitle: '传统葫芦工艺',
    description: '传承千年葫芦工艺，每一件作品都承载着匠人的心血与智慧，将东方美学融入现代生活。',
    cta: '探索作品',
    ctaLink: '/products',
  },
  {
    image: '/images/hero-carousel-1.jpg',
    badge: '手工烙画 · 独一无二',
    title: '烙画葫芦',
    subtitle: '',
    description: '以火为墨，以葫芦为纸，千年烙画技艺在葫芦上绽放出独特的艺术魅力。',
    cta: '了解更多',
    ctaLink: '/products?category=pyrography',
  },
  {
    image: '/images/hero-carousel-2.jpg',
    badge: '精雕细琢 · 巧夺天工',
    title: '雕刻葫芦',
    subtitle: '',
    description: '每一刀都蕴含着匠人的功力与审美，雕刻葫芦将传统技艺推向极致。',
    cta: '浏览精品',
    ctaLink: '/products?category=carved',
  },
  {
    image: '/images/hero-carousel-3.jpg',
    badge: '彩绘生辉 · 寓意吉祥',
    title: '彩绘葫芦',
    subtitle: '',
    description: '色彩斑斓的彩绘葫芦，承载着福禄双全的美好祝愿，是送礼佳品。',
    cta: '查看详情',
    ctaLink: '/products?category=painted',
  },
]

/* ===========================
   类型定义
   =========================== */

interface ProductData {
  id: string
  name: string
  slug: string
  image: string
  category: string
  price: number
  originalPrice?: number | null
  badge?: '新品' | '精品' | '特惠'
}

interface StoryData {
  id: string
  title: string
  image: string
  excerpt: string | null
  content: string
  author: string | null
}

interface CategoryData {
  name: string
  desc: string
  image: string
  href: string
}

interface HomeClientProps {
  products: ProductData[]
  stories: StoryData[]
  categories: CategoryData[]
}

/* ===========================
   Scroll Animation Hook
   =========================== */

function useScrollAnimation() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )

    const elements = ref.current?.querySelectorAll('.fade-in-section, .fade-in-left, .fade-in-right, .fade-in-scale')
    elements?.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  return ref
}

/* ===========================
   Home Page Client Component
   =========================== */

export default function HomeClient({ products, stories, categories }: HomeClientProps) {
  const sectionRef = useScrollAnimation()
  const [selectedStory, setSelectedStory] = useState<StoryData | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const openStoryModal = (story: StoryData) => {
    setSelectedStory(story)
    setIsModalOpen(true)
  }

  const scrollToContent = () => {
    const categoriesSection = document.getElementById('categories')
    if (categoriesSection) {
      categoriesSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div ref={sectionRef}>
      {/* ===========================
          Hero Carousel with Scroll Indicator
          =========================== */}
      <section className="relative">
        <HeroCarousel slides={heroSlides} autoPlayInterval={6000} />
        
        {/* Scroll Indicator */}
        <button 
          onClick={scrollToContent}
          className="scroll-indicator"
          aria-label="向下滚动"
        >
          <span>探索更多</span>
          <ChevronDown />
        </button>
      </section>

      {/* ===========================
          Categories Section - Premium Grid
          =========================== */}
      <section id="categories" className="py-20 md:py-28 px-4 sm:px-6 lg:px-8" style={{ background: 'var(--color-parchment)' }}>
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-16 fade-in-section">
            <span className="section-label">
              工艺分类
            </span>
            <h2 className="section-title">
              五大工艺门类
            </h2>
            <p className="section-subtitle">
              涵盖烙画、雕刻、彩绘、天然及茶具，满足不同审美需求
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5 md:gap-6">
            {categories.map((cat, i) => (
              <Link
                key={cat.name}
                href={cat.href}
                className="category-card fade-in-section hover-shine"
                style={{ transitionDelay: `${i * 0.1}s` }}
              >
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  className="category-card-image"
                  sizes="(max-width: 768px) 50vw, 20vw"
                />
                <div className="category-card-overlay">
                  <h3 className="category-card-title">{cat.name}</h3>
                  <p className="category-card-desc">{cat.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===========================
          Products Section - Premium Cards
          =========================== */}
      <section className="py-20 md:py-28 px-4 sm:px-6 lg:px-8" style={{ background: 'var(--color-rice)' }}>
        <div className="max-w-[1400px] mx-auto">
          <div className="flex items-end justify-between mb-16 fade-in-section">
            <div>
              <span className="section-label !justify-start">
                精选作品
              </span>
              <h2 className="section-title !text-left">
                匠心独运
              </h2>
              <p className="text-sm text-[var(--color-ink)] opacity-60 mt-2">
                每一件都是独一无二的艺术品
              </p>
            </div>
            <Link
              href="/products"
              className="hidden sm:inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-cinnabar)] text-white text-sm font-medium tracking-wider transition-all duration-300 hover:bg-[var(--color-cinnabar-dark)] hover:-translate-y-1 hover:shadow-lg rounded-md"
            >
              查看全部
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-6">
            {products.map((product, i) => (
              <div key={product.id} className="fade-in-section" style={{ transitionDelay: `${i * 0.08}s` }}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
          
          <div className="mt-12 text-center sm:hidden">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-cinnabar)] text-white text-sm font-medium tracking-wider rounded-md"
            >
              查看全部作品
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ===========================
          Stories Section - Dark Premium
          =========================== */}
      {stories.length > 0 && (
        <section className="py-20 md:py-28 px-4 sm:px-6 lg:px-8" style={{ background: 'var(--color-ink)' }}>
          <div className="max-w-[1400px] mx-auto">
            <div className="text-center mb-16 fade-in-section">
              <span className="section-label" style={{ color: 'var(--color-gold)' }}>
                <span style={{ background: 'var(--color-gold)' }}></span>
                葫芦故事
                <span style={{ background: 'var(--color-gold)' }}></span>
              </span>
              <h2 className="section-title text-white">
                文化传承
              </h2>
              <p className="text-sm text-white/60 max-w-lg mx-auto mt-3">
                每一个葫芦背后都有一个故事，每一段故事都承载着文化的传承
              </p>
            </div>

            {/* Story Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6 mb-10">
              {stories.slice(0, 4).map((story, i) => (
                <div
                  key={story.id}
                  className="story-card fade-in-section cursor-pointer group"
                  style={{ transitionDelay: `${i * 0.1}s` }}
                  onClick={() => openStoryModal(story)}
                >
                  <div className="story-card-image-wrapper">
                    <Image
                      src={story.image}
                      alt={story.title}
                      fill
                      className="story-card-image"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                    <div className="story-card-overlay">
                      <h3 className="story-card-title group-hover:text-[var(--color-gold)] transition-colors">{story.title}</h3>
                      <p className="story-card-excerpt">{story.excerpt}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Featured Story (第5个故事) */}
            {stories.length > 4 && (
              <div
                className="featured-story fade-in-section cursor-pointer group"
                onClick={() => openStoryModal(stories[4])}
              >
                <div className="relative aspect-[16/10] overflow-hidden rounded-lg">
                  <Image
                    src={stories[4].image}
                    alt={stories[4].title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
                <div>
                  <span className="text-xs tracking-[0.25em] uppercase text-[var(--color-gold)] font-medium">
                    精选故事
                  </span>
                  <h3 className="font-serif text-2xl md:text-3xl font-semibold text-white mt-3 mb-5 group-hover:text-[var(--color-gold)] transition-colors">
                    {stories[4].title}
                  </h3>
                  <p className="text-base text-white/70 leading-relaxed mb-6">
                    {stories[4].excerpt}
                  </p>
                  <span className="inline-flex items-center gap-2 text-sm text-[var(--color-gold)] hover:text-white transition-all duration-300 group/link">
                    阅读全文
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/link:translate-x-1" />
                  </span>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ===========================
          Heritage Section - Premium Layout
          =========================== */}
      <section id="heritage" className="py-20 md:py-28 px-4 sm:px-6 lg:px-8" style={{ background: 'var(--color-parchment)' }}>
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl shadow-2xl fade-in-left group">
              <Image
                src="/images/about-craftsmanship.jpg"
                alt="匠心传承"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
            <div className="fade-in-right">
              <span className="text-xs tracking-[0.25em] uppercase text-[var(--color-cinnabar)] font-medium">
                匠心传承
              </span>
              <h2 className="font-serif text-3xl md:text-4xl font-semibold text-[var(--color-ink)] mt-3 mb-6">
                千年工艺 代代相传
              </h2>
              <p className="text-base text-[var(--color-ink)] opacity-70 leading-relaxed mb-8">
                葫芦工艺在中国有着数千年的历史。从选材到成品，每一道工序都凝聚着匠人的心血与智慧。我们的工艺传承人，世代从事葫芦加工，将这门古老技艺完整地保留至今。
              </p>
              <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="text-center p-4 rounded-lg bg-white/50 hover:bg-white transition-colors duration-300 hover:shadow-lg group">
                  <div className="feature-icon mx-auto !w-16 !h-16 group-hover:scale-110 transition-transform">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                  </div>
                  <h4 className="font-serif text-sm font-semibold text-[var(--color-ink)] mb-1">纯手工</h4>
                  <p className="text-xs text-[var(--color-ink)] opacity-50">每一件作品均为手工制作</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-white/50 hover:bg-white transition-colors duration-300 hover:shadow-lg group">
                  <div className="feature-icon mx-auto !w-16 !h-16 group-hover:scale-110 transition-transform">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="font-serif text-sm font-semibold text-[var(--color-ink)] mb-1">百年传承</h4>
                  <p className="text-xs text-[var(--color-ink)] opacity-50">世代相传的精湛技艺</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-white/50 hover:bg-white transition-colors duration-300 hover:shadow-lg group">
                  <div className="feature-icon mx-auto !w-16 !h-16 group-hover:scale-110 transition-transform">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                  <h4 className="font-serif text-sm font-semibold text-[var(--color-ink)] mb-1">独一无二</h4>
                  <p className="text-xs text-[var(--color-ink)] opacity-50">每件作品都是孤品</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===========================
          Origin Section - Premium Stats
          =========================== */}
      <section id="origin" className="py-20 md:py-28 px-4 sm:px-6 lg:px-8" style={{ background: 'var(--color-ink)' }}>
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="fade-in-left order-2 lg:order-1">
              <span className="text-xs tracking-[0.25em] uppercase text-[var(--color-gold)] font-medium">
                中国葫芦之乡
              </span>
              <h2 className="font-serif text-3xl md:text-4xl font-semibold text-white mt-3 mb-6">
                山东聊城 · 葫芦之乡
              </h2>
              <p className="text-base text-white/70 leading-relaxed mb-10">
                聊城，位于山东省西部，素有"中国葫芦之乡"的美誉。这里种植葫芦的历史已有六百余年，是全国最大的葫芦种植和加工基地。聊城葫芦以其品种繁多、品质优良而闻名于世。
              </p>
              <div className="grid grid-cols-3 gap-4">
                <div className="stat-item">
                  <div className="stat-number">600+</div>
                  <p className="stat-label">年种植历史</p>
                </div>
                <div className="stat-item">
                  <div className="stat-number">50+</div>
                  <p className="stat-label">葫芦品种</p>
                </div>
                <div className="stat-item">
                  <div className="stat-number">1000+</div>
                  <p className="stat-label">从业家庭</p>
                </div>
              </div>
            </div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl shadow-2xl fade-in-right order-1 lg:order-2 group">
              <Image
                src="/images/about-origin.jpg"
                alt="聊城葫芦之乡"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* ===========================
          Newsletter Section - Premium
          =========================== */}
      <section className="newsletter-section">
        <div className="max-w-[1400px] mx-auto relative z-10">
          <span className="section-label !text-white/80 !mb-4">
            <span className="!bg-white/30"></span>
            订阅资讯
            <span className="!bg-white/30"></span>
          </span>
          <h2 className="newsletter-title">订阅葫韵资讯</h2>
          <p className="newsletter-desc">
            第一时间获取新品资讯、工艺故事和独家优惠
          </p>
          <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="请输入您的邮箱地址"
              className="newsletter-input"
            />
            <button type="submit" className="newsletter-button">
              立即订阅
            </button>
          </form>
        </div>
      </section>

      {/* ===========================
          Story Modal
          =========================== */}
      <StoryModal
        story={selectedStory}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  )
}
