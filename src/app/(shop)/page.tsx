import { prisma } from '@/lib/prisma'
import HomeClient from '@/components/home/HomeClient'

/* ===========================
   服务端数据获取
   =========================== */

async function getFeaturedProducts() {
  const products = await prisma.product.findMany({
    where: { featured: true, status: 'ACTIVE' },
    include: { category: true },
    take: 8,
    orderBy: { createdAt: 'desc' },
  })

  return products.map((p) => {
    const badge = deriveProductBadge(p.name)
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      image: p.images[0] || '/images/product-placeholder.jpg',
      category: p.category.name,
      price: Number(p.price),
      originalPrice: p.originalPrice ? Number(p.originalPrice) : null,
      badge: badge,
    }
  })
}

async function getLatestStories() {
  return prisma.story.findMany({
    orderBy: { publishedAt: 'desc' },
    take: 5,
  })
}

async function getCategories() {
  const dbCategories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
  })

  // 映射数据库分类到 UI 所需格式
  const categoryHrefMap: Record<string, string> = {
    '烙画葫芦': '/products?category=pyrography',
    '雕刻葫芦': '/products?category=carved',
    '彩绘葫芦': '/products?category=painted',
    '素葫芦': '/products?category=natural',
    '葫芦茶具': '/products?category=teaset',
  }

  return dbCategories.map((cat) => ({
    name: cat.name,
    desc: cat.description || '',
    image: cat.image || '/images/category-placeholder.jpg',
    href: categoryHrefMap[cat.name] || `/products?category=${cat.slug}`,
  }))
}

/**
 * 根据产品名称推断 badge 类型。
 * 当数据库中没有 badge 字段时，通过产品名称中的关键词进行推断。
 */
function deriveProductBadge(name: string): '新品' | '精品' | '特惠' | undefined {
  if (name.includes('新品')) return '新品'
  if (name.includes('精品')) return '精品'
  if (name.includes('特惠') || name.includes('特价') || name.includes('优惠')) return '特惠'
  return undefined
}

/* ===========================
   首页服务端组件
   =========================== */

export default async function HomePage() {
  const [products, stories, categories] = await Promise.all([
    getFeaturedProducts(),
    getLatestStories(),
    getCategories(),
  ])

  return (
    <HomeClient
      products={products}
      stories={stories}
      categories={categories}
    />
  )
}
