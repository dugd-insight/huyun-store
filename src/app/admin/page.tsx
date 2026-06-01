'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  AlertTriangle,
  Truck,
  CreditCard,
  ArrowRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { StatCard } from '@/lib/admin/components'

interface DashboardStats {
  totalProducts: number
  totalOrders: number
  totalUsers: number
  totalRevenue: number
  lowStockCount: number
  pendingShipments: number
  recentOrders: Array<{
    id: string
    name: string
    total: number
    status: string
    createdAt: string
  }>
  recentPayments: Array<{
    id: string
    orderId: string
    amount: number
    method: string
    status: string
    createdAt: string
  }>
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      setIsLoading(true)
      // Fetch data from multiple endpoints
      const [productsRes, ordersRes, usersRes, alertsRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/orders'),
        fetch('/api/users'),
        fetch('/api/inventory/alert'),
      ])

      const products = await productsRes.json()
      const orders = await ordersRes.json()
      const users = await usersRes.json()
      const alerts = await alertsRes.json()

      // Calculate stats
      const totalRevenue = orders.reduce((sum: number, order: { total: number }) => sum + Number(order.total), 0)
      const pendingOrders = orders.filter((o: { status: string }) => o.status === 'PENDING' || o.status === 'PROCESSING')
      const recentOrders = orders.slice(0, 5)

      setStats({
        totalProducts: products.length,
        totalOrders: orders.length,
        totalUsers: users.length,
        totalRevenue,
        lowStockCount: alerts.alerts?.length || 0,
        pendingShipments: pendingOrders.length,
        recentOrders,
        recentPayments: [], // Would fetch from payment records
      })
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-cinnabar/30 border-t-cinnabar rounded-full animate-spin" />
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-stone-500">加载失败，请刷新页面重试</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-stone-900">仪表盘</h1>
        <p className="text-sm text-stone-500">
          {new Date().toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long',
          })}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="总商品数"
          value={stats.totalProducts}
          icon={Package}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="总订单数"
          value={stats.totalOrders}
          icon={ShoppingCart}
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="总用户数"
          value={stats.totalUsers}
          icon={Users}
          trend={{ value: 15, isPositive: true }}
        />
        <StatCard
          title="总销售额"
          value={`¥${stats.totalRevenue.toFixed(2)}`}
          icon={TrendingUp}
          trend={{ value: 23, isPositive: true }}
        />
      </div>

      {/* Alerts & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Low Stock Alert */}
        <div className="bg-white rounded-xl border border-stone-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-stone-900">库存预警</h3>
            <div className="p-2 bg-amber-50 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
          </div>
          {stats.lowStockCount > 0 ? (
            <>
              <p className="text-3xl font-bold text-amber-600 mb-2">{stats.lowStockCount}</p>
              <p className="text-sm text-stone-500 mb-4">个商品库存不足</p>
              <Link
                href="/admin/inventory"
                className="inline-flex items-center text-sm text-cinnabar hover:text-cinnabar/80 font-medium"
              >
                查看详情
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </>
          ) : (
            <>
              <p className="text-3xl font-bold text-emerald-600 mb-2">0</p>
              <p className="text-sm text-stone-500">所有商品库存充足</p>
            </>
          )}
        </div>

        {/* Pending Shipments */}
        <div className="bg-white rounded-xl border border-stone-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-stone-900">待发货订单</h3>
            <div className="p-2 bg-blue-50 rounded-lg">
              <Truck className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          {stats.pendingShipments > 0 ? (
            <>
              <p className="text-3xl font-bold text-blue-600 mb-2">{stats.pendingShipments}</p>
              <p className="text-sm text-stone-500 mb-4">个订单等待发货</p>
              <Link
                href="/admin/orders"
                className="inline-flex items-center text-sm text-cinnabar hover:text-cinnabar/80 font-medium"
              >
                去处理
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </>
          ) : (
            <>
              <p className="text-3xl font-bold text-emerald-600 mb-2">0</p>
              <p className="text-sm text-stone-500">所有订单已处理</p>
            </>
          )}
        </div>

        {/* Recent Payments */}
        <div className="bg-white rounded-xl border border-stone-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-stone-900">最近收款</h3>
            <div className="p-2 bg-emerald-50 rounded-lg">
              <CreditCard className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-emerald-600 mb-2">
            ¥{stats.recentOrders.filter((o) => o.status !== 'CANCELLED').reduce((sum, o) => sum + o.total, 0).toFixed(2)}
          </p>
          <p className="text-sm text-stone-500">今日收款总额</p>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200">
          <h3 className="font-semibold text-stone-900">最近订单</h3>
          <Link
            href="/admin/orders"
            className="text-sm text-cinnabar hover:text-cinnabar/80 font-medium"
          >
            查看全部
          </Link>
        </div>
        <div className="divide-y divide-stone-100">
          {stats.recentOrders.length === 0 ? (
            <div className="px-6 py-8 text-center text-stone-500">
              暂无订单
            </div>
          ) : (
            stats.recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between px-6 py-4 hover:bg-stone-50">
                <div>
                  <p className="font-medium text-stone-900">{order.name}</p>
                  <p className="text-sm text-stone-500">
                    {new Date(order.createdAt).toLocaleDateString('zh-CN')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-stone-900">¥{Number(order.total).toFixed(2)}</p>
                  <span
                    className={cn(
                      'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
                      order.status === 'DELIVERED' && 'bg-emerald-50 text-emerald-600',
                      order.status === 'SHIPPED' && 'bg-blue-50 text-blue-600',
                      order.status === 'PENDING' && 'bg-amber-50 text-amber-600',
                      order.status === 'CANCELLED' && 'bg-red-50 text-red-600',
                      order.status === 'PROCESSING' && 'bg-purple-50 text-purple-600'
                    )}
                  >
                    {order.status === 'PENDING' && '待处理'}
                    {order.status === 'PROCESSING' && '处理中'}
                    {order.status === 'SHIPPED' && '已发货'}
                    {order.status === 'DELIVERED' && '已完成'}
                    {order.status === 'CANCELLED' && '已取消'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
