'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  Plus,
  Eye,
  Settings,
  ArrowRight,
  Clock,
} from 'lucide-react'
import { PageHeader, StatCard, Badge } from '@/lib/admin/components'
import { getStats, getOrders, Order } from '@/lib/admin/store'
import { formatPrice, formatDate } from '@/lib/utils'

export default function AdminDashboard() {
  const [stats, setStats] = useState<ReturnType<typeof getStats> | null>(null)
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = () => {
      try {
        const statsData = getStats()
        const ordersData = getOrders()
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 10)

        setStats(statsData)
        setRecentOrders(ordersData)
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()

    // Reload on storage changes (for cross-tab sync)
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
        <div className="h-96 bg-stone-200 rounded-xl"></div>
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

  const getOrderStatusBadge = (status: Order['status']) => {
    const variants: Record<Order['status'], 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
      PENDING: 'warning',
      PROCESSING: 'info',
      SHIPPED: 'info',
      DELIVERED: 'success',
      CANCELLED: 'danger',
    }
    const labels: Record<Order['status'], string> = {
      PENDING: '待处理',
      PROCESSING: '处理中',
      SHIPPED: '已发货',
      DELIVERED: '已送达',
      CANCELLED: '已取消',
    }
    return <Badge variant={variants[status]}>{labels[status]}</Badge>
  }

  const getPaymentStatusBadge = (status: Order['paymentStatus']) => {
    const variants: Record<Order['paymentStatus'], 'default' | 'success' | 'warning' | 'danger'> = {
      UNPAID: 'danger',
      PAID: 'success',
      REFUNDED: 'warning',
    }
    const labels: Record<Order['paymentStatus'], string> = {
      UNPAID: '未付款',
      PAID: '已付款',
      REFUNDED: '已退款',
    }
    return <Badge variant={variants[status]}>{labels[status]}</Badge>
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="仪表盘"
        description="欢迎回来！以下是您的店铺概览。"
      />

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="商品总数"
          value={stats.totalProducts}
          icon={Package}
          color="cinnabar"
        />
        <StatCard
          title="订单总数"
          value={stats.totalOrders}
          icon={ShoppingCart}
          color="default"
        />
        <StatCard
          title="用户总数"
          value={stats.totalUsers}
          icon={Users}
          color="default"
        />
        <StatCard
          title="总收入"
          value={formatPrice(stats.totalRevenue)}
          icon={DollarSign}
          color="emerald"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/admin/products/new"
          className="flex items-center justify-center p-6 bg-white rounded-xl border border-stone-200 shadow-sm hover:border-cinnabar hover:shadow-md transition-all group"
        >
          <Plus className="h-6 w-6 text-cinnabar mr-3 group-hover:scale-110 transition-transform" />
          <span className="font-medium text-stone-900">添加商品</span>
        </Link>
        <Link
          href="/admin/orders"
          className="flex items-center justify-center p-6 bg-white rounded-xl border border-stone-200 shadow-sm hover:border-cinnabar hover:shadow-md transition-all group"
        >
          <Eye className="h-6 w-6 text-cinnabar mr-3 group-hover:scale-110 transition-transform" />
          <span className="font-medium text-stone-900">查看订单</span>
        </Link>
        <Link
          href="/admin/categories"
          className="flex items-center justify-center p-6 bg-white rounded-xl border border-stone-200 shadow-sm hover:border-cinnabar hover:shadow-md transition-all group"
        >
          <Settings className="h-6 w-6 text-cinnabar mr-3 group-hover:scale-110 transition-transform" />
          <span className="font-medium text-stone-900">管理分类</span>
        </Link>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm">
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center">
            <Clock className="h-5 w-5 text-stone-400 mr-2" />
            <h2 className="text-lg font-semibold text-stone-900">最近订单</h2>
          </div>
          <Link
            href="/admin/orders"
            className="text-sm text-cinnabar hover:text-cinnabar-dark flex items-center"
          >
            查看全部
            <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-stone-200">
            <thead className="bg-stone-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                  订单号
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                  客户
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                  金额
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                  订单状态
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                  支付状态
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                  日期
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-stone-500">
                    暂无订单
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-stone-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-cinnabar">
                      #{order.id.slice(-6).toUpperCase()}
                    </td>
                    <td className="px-6 py-4 text-sm text-stone-900">
                      <div>
                        <p className="font-medium">{order.name}</p>
                        <p className="text-stone-500 text-xs">{order.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-stone-900">
                      {formatPrice(order.total)}
                    </td>
                    <td className="px-6 py-4">
                      {getOrderStatusBadge(order.status)}
                    </td>
                    <td className="px-6 py-4">
                      {getPaymentStatusBadge(order.paymentStatus)}
                    </td>
                    <td className="px-6 py-4 text-sm text-stone-500">
                      {formatDate(order.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alerts */}
      {(stats.pendingOrders > 0 || stats.outOfStockProducts > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stats.pendingOrders > 0 && (
            <Link
              href="/admin/orders?status=PENDING"
              className="flex items-center p-4 bg-amber-50 border border-amber-200 rounded-xl hover:bg-amber-100 transition-colors"
            >
              <div className="p-3 bg-amber-100 rounded-full mr-4">
                <ShoppingCart className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="font-medium text-amber-800">
                  {stats.pendingOrders} 个待处理订单
                </p>
                <p className="text-sm text-amber-600">点击查看</p>
              </div>
            </Link>
          )}
          {stats.outOfStockProducts > 0 && (
            <Link
              href="/admin/products?stock=0"
              className="flex items-center p-4 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-colors"
            >
              <div className="p-3 bg-red-100 rounded-full mr-4">
                <Package className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="font-medium text-red-800">
                  {stats.outOfStockProducts} 个商品缺货
                </p>
                <p className="text-sm text-red-600">点击查看</p>
              </div>
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
