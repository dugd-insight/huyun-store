'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ChevronDown } from 'lucide-react'
import { HeroCarousel } from '@/components/ui/HeroCarousel'
import { ProductCard } from '@/components/product/ProductCard'
import { StoryModal } from '@/components/ui/StoryModal'

/* ===========================
   Data
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

const categories = [
  { name: '烙画葫芦', desc: '以火为墨，千年技艺', image: '/images/category-pyrography.jpg', href: '/products?category=pyrography' },
  { name: '雕刻葫芦', desc: '精雕细琢，巧夺天工', image: '/images/category-carved.jpg', href: '/products?category=carved' },
  { name: '彩绘葫芦', desc: '彩绘生辉，寓意吉祥', image: '/images/category-painted.jpg', href: '/products?category=painted' },
  { name: '素葫芦', desc: '天然本色，返璞归真', image: '/images/category-natural.jpg', href: '/products?category=natural' },
  { name: '葫芦茶具', desc: '茶韵悠长，壶中天地', image: '/images/category-teaset.jpg', href: '/products?category=teaset' },
]

const products = [
  { id: '1', name: '传统烙画山水葫芦', slug: 'traditional-pyrography-landscape', image: '/images/product-1.jpg', category: '烙画葫芦', price: 1280, originalPrice: 1580, badge: '新品' as const },
  { id: '2', name: '精雕双龙戏珠葫芦瓶', slug: 'carved-dragon-gourd-vase', image: '/images/product-2.jpg', category: '雕刻葫芦', price: 2680, originalPrice: null, badge: '精品' as const },
  { id: '3', name: '彩绘福禄寿葫芦', slug: 'painted-fortune-gourd', image: '/images/product-3.jpg', category: '彩绘葫芦', price: 880, originalPrice: 1080, badge: '特惠' as const },
  { id: '4', name: '天然素面大葫芦', slug: 'natural-large-gourd', image: '/images/product-4.jpg', category: '素葫芦', price: 580, originalPrice: null, badge: undefined },
  { id: '5', name: '镂空雕花葫芦灯', slug: 'hollow-carved-gourd-lamp', image: '/images/product-5.jpg', category: '雕刻葫芦', price: 2180, originalPrice: 2680, badge: '特惠' as const },
  { id: '6', name: '烙画百鸟朝凤葫芦', slug: 'pyrography-birds-gourd', image: '/images/product-6.jpg', category: '烙画葫芦', price: 1880, originalPrice: null, badge: '精品' as const },
  { id: '7', name: '彩绘牡丹富贵葫芦', slug: 'painted-peony-gourd', image: '/images/product-7.jpg', category: '彩绘葫芦', price: 980, originalPrice: null, badge: '新品' as const },
  { id: '8', name: '葫芦茶具套装', slug: 'gourd-teaset-collection', image: '/images/product-8.jpg', category: '葫芦茶具', price: 1680, originalPrice: 1980, badge: '新品' as const },
]

const stories = [
  {
    id: '1',
    title: '熊猫酒葫芦',
    image: '/images/story-panda-wine-gourd.jpg',
    excerpt: '国宝熊猫与葫芦酒器的奇妙结合，展现中华文化的独特魅力。',
    content: '<p>在中国传统文化中，葫芦一直被视为吉祥的象征。而熊猫作为国宝，更是中华文化的代表。当这两种元素巧妙结合，便诞生了独特的熊猫酒葫芦。</p><p>熊猫酒葫芦以精选天然葫芦为载体，经过匠人的精心设计和雕刻，将憨态可掬的熊猫形象栩栩如生地呈现在葫芦之上。每一个细节都经过反复推敲，力求完美。</p><p>这种独特的工艺品不仅具有实用价值，更是一件值得收藏的艺术品。它承载着匠人对传统文化的理解与创新，展现了中华工艺的博大精深。</p>',
    author: '葫韵工作室',
  },
  {
    id: '2',
    title: '诗仙李白',
    image: '/images/story-li-bai.jpg',
    excerpt: '诗仙李白与葫芦的千年情缘，酒中仙人的浪漫传说。',
    content: '<p>李白，字太白，号青莲居士，被誉为"诗仙"。他一生嗜酒如命，而葫芦便是他最钟爱的酒器。</p><p>据传，李白常常腰挂葫芦，骑驴漫游天下。每至一处，便取葫芦饮酒，酒兴大发时便挥毫泼墨，留下千古名篇。葫芦之于李白，不仅是酒器，更是他自由不羁精神的象征。</p><p>在我们的葫芦工艺品中，匠人们以精湛的烙画技艺，将李白醉酒吟诗的场景刻画在葫芦之上，让千年前的浪漫在葫芦上重现。</p>',
    author: '葫韵工作室',
  },
  {
    id: '3',
    title: '武松打虎',
    image: '/images/story-wu-song.jpg',
    excerpt: '水浒英雄武松的经典故事，在葫芦上演绎传奇。',
    content: '<p>《水浒传》中武松打虎的故事家喻户晓。武松在景阳冈上赤手空拳打死猛虎的壮举，展现了中华民族勇武不屈的精神。</p><p>匠人们以雕刻和彩绘相结合的技法，将武松打虎的精彩瞬间凝固在葫芦之上。武松的英姿、猛虎的凶猛，都在方寸之间得到了完美的呈现。</p><p>这件作品不仅是对经典文学作品的致敬，更是对中华传统工艺的一次精彩演绎。</p>',
    author: '葫韵工作室',
  },
  {
    id: '4',
    title: '八仙传说',
    image: '/images/story-eight-immortals.jpg',
    excerpt: '八仙过海各显神通，葫芦承载着仙人的法力与智慧。',
    content: '<p>八仙是中国神话传说中的八位仙人，他们各自拥有独特的法器和神通。其中，铁拐李的葫芦尤为著名——这个看似普通的葫芦，却蕴含着无穷的法力。</p><p>传说铁拐李的葫芦中装有灵丹妙药，能治百病、起死回生。在民间信仰中，葫芦也因此成为了消灾祛病、保佑平安的吉祥物。</p><p>我们的八仙系列葫芦工艺品，以八仙为主题，运用多种传统工艺技法，将八仙的形象和故事生动地呈现在葫芦之上。</p>',
    author: '葫韵工作室',
  },
  {
    id: '5',
    title: '纣王酒池',
    image: '/images/story-zhou-xin.jpg',
    excerpt: '商纣王酒池肉林的奢靡传说，葫芦见证千年兴衰。',
    content: '<p>商朝末年，纣王沉迷酒色，以葫芦为酒器，建造了著名的"酒池肉林"。这段历史虽然以亡国告终，却也让葫芦作为酒器的历史更加悠久。</p><p>据考古发现，早在新石器时代，葫芦就已经被用作酒器和水器。在中国数千年的饮酒文化中，葫芦始终扮演着重要的角色。</p><p>我们的酒葫芦系列，正是对这一悠久历史的致敬。每一个酒葫芦都经过严格的选材和精湛的工艺制作，既是对传统的传承，也是对品质的坚持。</p>',
    author: '葫韵工作室',
  },
]

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
   Home Page Component
   =========================== */

export default function HomePage() {
  const sectionRef = useScrollAnimation()
  const [selectedStory, setSelectedStory] = useState<typeof stories[0] | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const openStoryModal = (story: typeof stories[0]) => {
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

          {/* Featured Story */}
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
        </div>
      </section>

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
