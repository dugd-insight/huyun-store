'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  TrendingUp,
  TrendingDown,
  Package,
  ShoppingCart,
  DollarSign,
  Users,
  ArrowRight,
  Star,
} from 'lucide-react'
import { PageHeader, StatCard, Badge } from '@/lib/admin/components'
import { getStats, getOrders, getProducts } from '@/lib/admin/store'
import { formatPrice, cn } from '@/lib/utils'

export default function DashboardPage() {
  const [stats, setStats] = useState<ReturnType<typeof getStats> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = () => {
      try {
        const statsData = getStats()
        setStats(statsData)
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()

    const handleStorage = () => loadData()
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-48 bg-stone-200 rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-stone-200 rounded-xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-stone-200 rounded-xl"></div>
          <div className="h-80 bg-stone-200 rounded-xl"></div>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-stone-500">加载数据时出错</p>
      </div>
    )
  }

  // Calculate max values for chart scaling
  const maxOrders = Math.max(...stats.ordersByDay.map(d => d.orders), 1)
  const maxRevenue = Math.max(...stats.ordersByDay.map(d => d.revenue), 1)

  // Format date for display
  const formatChartDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return `${date.getMonth() + 1}/${date.getDate()}`
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="数据统计"
        description="查看店铺销售数据和业务指标。"
      />

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="总收入"
          value={formatPrice(stats.totalRevenue)}
          icon={DollarSign}
          color="emerald"
        />
        <StatCard
          title="总订单"
          value={stats.totalOrders}
          icon={ShoppingCart}
          color="cinnabar"
        />
        <StatCard
          title="商品数"
          value={stats.totalProducts}
          icon={Package}
          color="default"
        />
        <StatCard
          title="用户数"
          value={stats.totalUsers}
          icon={Users}
          color="default"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-stone-900">销售趋势</h2>
              <p className="text-sm text-stone-500">最近7天的订单和收入</p>
            </div>
          </div>

          {/* Chart */}
          <div className="h-64 flex items-end justify-between space-x-4">
            {stats.ordersByDay.map((day, index) => (
              <div key={day.date} className="flex-1 flex flex-col items-center">
                {/* Bar */}
                <div className="w-full flex items-end justify-center space-x-2">
                  {/* Orders bar */}
                  <div className="w-6 relative" style={{ height: '160px' }}>
                    <div
                      className="absolute bottom-0 w-full bg-cinnabar/20 rounded-t transition-all duration-500"
                      style={{ height: `${(day.orders / maxOrders) * 100}%` }}
                    />
                    <div
                      className="absolute bottom-0 w-full bg-cinnabar rounded-t transition-all duration-500"
                      style={{ height: `${Math.max((day.orders / maxOrders) * 80, day.orders > 0 ? 10 : 0)}%` }}
                    />
                    {/* Value label */}
                    {day.orders > 0 && (
                      <span className="absolute -top-5 left-1/2 transform -translate-x-1/2 text-xs font-medium text-cinnabar">
                        {day.orders}
                      </span>
                    )}
                  </div>
                  {/* Revenue bar */}
                  <div className="w-6 relative" style={{ height: '160px' }}>
                    <div
                      className="absolute bottom-0 w-full bg-emerald-500/20 rounded-t transition-all duration-500"
                      style={{ height: `${(day.revenue / maxRevenue) * 100}%` }}
                    />
                    <div
                      className="absolute bottom-0 w-full bg-emerald-500 rounded-t transition-all duration-500"
                      style={{ height: `${Math.max((day.revenue / maxRevenue) * 80, day.revenue > 0 ? 10 : 0)}%` }}
                    />
                  </div>
                </div>
                {/* Date label */}
                <span className="mt-2 text-xs text-stone-500">
                  {formatChartDate(day.date)}
                </span>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center space-x-6 mt-6 pt-4 border-t border-stone-100">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-cinnabar rounded mr-2" />
              <span className="text-xs text-stone-600">订单数</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-emerald-500 rounded mr-2" />
              <span className="text-xs text-stone-600">销售额</span>
            </div>
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-stone-900">热销商品</h2>
              <p className="text-sm text-stone-500">销量最高的商品</p>
            </div>
            <Link
              href="/admin/products"
              className="text-sm text-cinnabar hover:text-cinnabar-dark flex items-center"
            >
              查看全部
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>

          <div className="space-y-4">
            {stats.topProducts.length === 0 ? (
              <p className="text-center text-stone-500 py-8">暂无销售数据</p>
            ) : (
              stats.topProducts.map((product, index) => (
                <Link
                  key={product.id}
                  href={`/admin/products/${product.id}`}
                  className="flex items-center p-3 rounded-lg hover:bg-stone-50 transition-colors"
                >
                  <div className="flex items-center flex-1">
                    {/* Rank */}
                    <div
                      className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3',
                        index === 0 && 'bg-amber-100 text-amber-700',
                        index === 1 && 'bg-stone-200 text-stone-600',
                        index === 2 && 'bg-orange-100 text-orange-700',
                        index > 2 && 'bg-stone-100 text-stone-500'
                      )}
                    >
                      {index + 1}
                    </div>

                    {/* Product Image */}
                    <div className="h-12 w-12 rounded-lg overflow-hidden bg-stone-100 flex-shrink-0 mr-3">
                      {product.images && product.images[0] ? (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          width={48}
                          height={48}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <Package className="h-6 w-6 text-stone-400" />
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-stone-900 truncate">
                          {product.name}
                        </p>
                        {product.featured && (
                          <Star className="h-3 w-3 text-amber-500 ml-2 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-stone-500">
                        {formatPrice(product.price)}
                      </p>
                    </div>
                  </div>

                  {/* Sales Count */}
                  <div className="text-right ml-4">
                    <p className="text-sm font-semibold text-stone-900">
                      {product.sales}
                    </p>
                    <p className="text-xs text-stone-500">销量</p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Status Distribution */}
        <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-stone-900 mb-6">订单状态分布</h2>
          <div className="space-y-4">
            {[
              { status: '待处理', count: stats.pendingOrders, color: 'bg-amber-500', variant: 'warning' },
              { status: '处理中', count: getOrders().filter(o => o.status === 'PROCESSING').length, color: 'bg-blue-500', variant: 'info' },
              { status: '已发货', count: getOrders().filter(o => o.status === 'SHIPPED').length, color: 'bg-blue-500', variant: 'info' },
              { status: '已送达', count: getOrders().filter(o => o.status === 'DELIVERED').length, color: 'bg-emerald-500', variant: 'success' },
              { status: '已取消', count: getOrders().filter(o => o.status === 'CANCELLED').length, color: 'bg-red-500', variant: 'danger' },
            ].map((item) => (
              <div key={item.status} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={cn('w-3 h-3 rounded-full mr-3', item.color)} />
                  <span className="text-sm text-stone-600">{item.status}</span>
                </div>
                <span className="text-sm font-medium text-stone-900">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Product Status */}
        <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-stone-900 mb-6">商品状态</h2>
          <div className="space-y-4">
            {[
              { status: '上架中', count: getProducts().filter(p => p.status === 'ACTIVE').length, color: 'bg-emerald-500' },
              { status: '已下架', count: getProducts().filter(p => p.status === 'INACTIVE').length, color: 'bg-stone-400' },
              { status: '缺货', count: stats.outOfStockProducts, color: 'bg-red-500' },
              { status: '推荐商品', count: getProducts().filter(p => p.featured).length, color: 'bg-amber-500' },
            ].map((item) => (
              <div key={item.status} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={cn('w-3 h-3 rounded-full mr-3', item.color)} />
                  <span className="text-sm text-stone-600">{item.status}</span>
                </div>
                <span className="text-sm font-medium text-stone-900">{item.count}</span>
              </div>
            ))}
          </div>

          {/* Inventory Alert */}
          {stats.outOfStockProducts > 0 && (
            <div className="mt-6 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">
                <strong>{stats.outOfStockProducts}</strong> 个商品库存不足
              </p>
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-stone-900 mb-6">快捷操作</h2>
          <div className="space-y-3">
            <Link
              href="/admin/products/new"
              className="flex items-center p-3 rounded-lg bg-stone-50 hover:bg-stone-100 transition-colors"
            >
              <Package className="h-5 w-5 text-cinnabar mr-3" />
              <span className="text-sm font-medium text-stone-700">添加新商品</span>
            </Link>
            <Link
              href="/admin/orders?status=PENDING"
              className="flex items-center p-3 rounded-lg bg-stone-50 hover:bg-stone-100 transition-colors"
            >
              <ShoppingCart className="h-5 w-5 text-cinnabar mr-3" />
              <span className="text-sm font-medium text-stone-700">处理待发货订单</span>
              {stats.pendingOrders > 0 && (
                <Badge variant="warning" className="ml-auto">
                  {stats.pendingOrders}
                </Badge>
              )}
            </Link>
            <Link
              href="/admin/categories"
              className="flex items-center p-3 rounded-lg bg-stone-50 hover:bg-stone-100 transition-colors"
            >
              <TrendingUp className="h-5 w-5 text-cinnabar mr-3" />
              <span className="text-sm font-medium text-stone-700">管理商品分类</span>
            </Link>
            <Link
              href="/admin/stories/new"
              className="flex items-center p-3 rounded-lg bg-stone-50 hover:bg-stone-100 transition-colors"
            >
              <Star className="h-5 w-5 text-cinnabar mr-3" />
              <span className="text-sm font-medium text-stone-700">发布新故事</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
