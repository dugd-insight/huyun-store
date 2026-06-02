import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import ProductsFilterClient from '@/components/product/ProductsFilterClient'

/* ===========================
   产品列表页 - 服务端组件
   使用 URL search params 支持分类筛选和搜索
   =========================== */

interface ProductsPageProps {
  searchParams: Promise<{ category?: string; search?: string }>
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const { category, search } = await searchParams

  // 构建查询条件
  const where: Prisma.ProductWhereInput = {
    status: 'ACTIVE',
  }

  if (category) {
    where.category = { slug: category }
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ]
  }

  // 获取产品列表
  const dbProducts = await prisma.product.findMany({
    where,
    include: { category: true },
    orderBy: { createdAt: 'desc' },
  })

  // 获取所有分类用于筛选栏
  const dbCategories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
  })

  // 映射数据库产品到 UI 组件所需格式
  const products = dbProducts.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    image: p.images[0] || '/images/product-placeholder.jpg',
    category: p.category.name,
    price: Number(p.price),
    originalPrice: p.originalPrice ? Number(p.originalPrice) : null,
    badge: deriveProductBadge(p.name),
  }))

  // 构建分类筛选器
  const categoryFilters = [
    { name: '全部', value: '' },
    ...dbCategories.map((cat) => ({
      name: cat.name,
      value: cat.name,
    })),
  ]

  return (
    <ProductsFilterClient
      products={products}
      categoryFilters={categoryFilters}
      initialCategory={category || ''}
      initialSearch={search || ''}
    />
  )
}

/**
 * 根据产品名称推断 badge 类型。
 */
function deriveProductBadge(name: string): '新品' | '精品' | '特惠' | undefined {
  if (name.includes('新品')) return '新品'
  if (name.includes('精品')) return '精品'
  if (name.includes('特惠') || name.includes('特价') || name.includes('优惠')) return '特惠'
  return undefined
}
