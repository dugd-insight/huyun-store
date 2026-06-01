'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import {
  Search,
  Eye,
  Filter,
  X,
  ChevronDown,
  Package,
  MapPin,
  Phone,
  Mail,
  Clock,
} from 'lucide-react'
import {
  PageHeader,
  Button,
  Input,
  Select,
  Badge,
  Pagination,
  Modal,
  EmptyState,
} from '@/lib/admin/components'
import {
  getOrders,
  getOrder,
  updateOrder,
  Order,
  OrderStatus,
  PaymentStatus,
} from '@/lib/admin/store'
import { formatPrice, formatDate, cn } from '@/lib/utils'

const ITEMS_PER_PAGE = 10

const ORDER_STATUS_OPTIONS = [
  { value: 'PENDING', label: '待处理' },
  { value: 'PROCESSING', label: '处理中' },
  { value: 'SHIPPED', label: '已发货' },
  { value: 'DELIVERED', label: '已送达' },
  { value: 'CANCELLED', label: '已取消' },
]

const PAYMENT_STATUS_OPTIONS = [
  { value: 'UNPAID', label: '未付款' },
  { value: 'PAID', label: '已付款' },
  { value: 'REFUNDED', label: '已退款' },
]

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  // Order detail modal
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  // Update status modal
  const [statusModalOpen, setStatusModalOpen] = useState(false)
  const [updateStatusType, setUpdateStatusType] = useState<'order' | 'payment' | null>(null)
  const [newStatus, setNewStatus] = useState('')

  const loadData = () => {
    try {
      const ordersData = getOrders()
      setOrders(ordersData)
    } catch (error) {
      console.error('Error loading orders:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()

    const handleStorage = () => loadData()
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      !searchQuery ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = !selectedStatus || order.status === selectedStatus
    const matchesPaymentStatus = !selectedPaymentStatus || order.paymentStatus === selectedPaymentStatus
    return matchesSearch && matchesStatus && matchesPaymentStatus
  })

  // Sort by date (newest first)
  const sortedOrders = [...filteredOrders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  // Pagination
  const totalPages = Math.ceil(sortedOrders.length / ITEMS_PER_PAGE)
  const paginatedOrders = sortedOrders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const viewOrderDetail = (order: Order) => {
    setSelectedOrder(order)
    setDetailModalOpen(true)
  }

  const openStatusModal = (order: Order, type: 'order' | 'payment') => {
    setSelectedOrder(order)
    setUpdateStatusType(type)
    setNewStatus(type === 'order' ? order.status : order.paymentStatus)
    setStatusModalOpen(true)
  }

  const handleUpdateStatus = () => {
    if (!selectedOrder || !updateStatusType || !newStatus) return

    const updateData = updateStatusType === 'order'
      ? { status: newStatus as OrderStatus }
      : { paymentStatus: newStatus as PaymentStatus }

    updateOrder(selectedOrder.id, updateData)
    setStatusModalOpen(false)

    // Refresh data
    loadData()

    // Update selected order if detail modal is open
    if (detailModalOpen && selectedOrder) {
      const updated = getOrder(selectedOrder.id)
      if (updated) {
        setSelectedOrder(updated)
      }
    }
  }

  const getOrderStatusBadge = (status: OrderStatus) => {
    const variants: Record<OrderStatus, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
      PENDING: 'warning',
      PROCESSING: 'info',
      SHIPPED: 'info',
      DELIVERED: 'success',
      CANCELLED: 'danger',
    }
    const labels: Record<OrderStatus, string> = {
      PENDING: '待处理',
      PROCESSING: '处理中',
      SHIPPED: '已发货',
      DELIVERED: '已送达',
      CANCELLED: '已取消',
    }
    return <Badge variant={variants[status]}>{labels[status]}</Badge>
  }

  const getPaymentStatusBadge = (status: PaymentStatus) => {
    const variants: Record<PaymentStatus, 'default' | 'success' | 'warning' | 'danger'> = {
      UNPAID: 'danger',
      PAID: 'success',
      REFUNDED: 'warning',
    }
    const labels: Record<PaymentStatus, string> = {
      UNPAID: '未付款',
      PAID: '已付款',
      REFUNDED: '已退款',
    }
    return <Badge variant={variants[status]}>{labels[status]}</Badge>
  }

  const hasFilters = searchQuery || selectedStatus || selectedPaymentStatus

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedStatus('')
    setSelectedPaymentStatus('')
    setCurrentPage(1)
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-48 bg-stone-200 rounded"></div>
        <div className="h-14 bg-stone-200 rounded-xl"></div>
        <div className="h-96 bg-stone-200 rounded-xl"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="订单管理"
        description="查看和处理客户订单，更新订单状态。"
      />

      {/* Filters */}
      <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-stone-400" />
              <Input
                placeholder="搜索订单号、客户姓名或邮箱..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <Select
              options={ORDER_STATUS_OPTIONS}
              value={selectedStatus}
              onChange={(value) => {
                setSelectedStatus(value)
                setCurrentPage(1)
              }}
              placeholder="订单状态"
              className="w-32"
            />
            <Select
              options={PAYMENT_STATUS_OPTIONS}
              value={selectedPaymentStatus}
              onChange={(value) => {
                setSelectedPaymentStatus(value)
                setCurrentPage(1)
              }}
              placeholder="支付状态"
              className="w-32"
            />
            {hasFilters && (
              <Button variant="ghost" onClick={clearFilters}>
                <X className="h-4 w-4 mr-2" />
                清除
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Orders Table */}
      {paginatedOrders.length === 0 ? (
        <EmptyState
          icon={Filter}
          title={hasFilters ? '没有找到匹配的订单' : '暂无订单'}
          description={
            hasFilters ? '尝试调整筛选条件或清除筛选' : '当有客户下单时会显示在这里'
          }
          action={hasFilters ? { label: '清除筛选', onClick: clearFilters } : undefined}
        />
      ) : (
        <>
          <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
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
                    商品
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {paginatedOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-stone-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-cinnabar">
                      #{order.id.slice(-6).toUpperCase()}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-stone-900">{order.name}</p>
                        <p className="text-xs text-stone-500">{order.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-stone-600">
                      {order.items.length} 件商品
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
                    <td className="px-6 py-4">
                      <button
                        onClick={() => viewOrderDetail(order)}
                        className="p-1.5 text-stone-400 hover:text-cinnabar hover:bg-cinnabar/10 rounded-lg transition-colors"
                        title="查看详情"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </>
      )}

      {/* Order Detail Modal */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false)
          setSelectedOrder(null)
        }}
        title="订单详情"
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-6">
            {/* Order Header */}
            <div className="flex items-center justify-between pb-4 border-b border-stone-200">
              <div>
                <p className="text-lg font-semibold text-stone-900">
                  订单 #{selectedOrder.id.slice(-6).toUpperCase()}
                </p>
                <p className="text-sm text-stone-500">
                  创建于 {formatDate(selectedOrder.createdAt)}
                </p>
              </div>
              <div className="flex gap-2">
                {getOrderStatusBadge(selectedOrder.status)}
                {getPaymentStatusBadge(selectedOrder.paymentStatus)}
              </div>
            </div>

            {/* Customer Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start">
                <Mail className="h-5 w-5 text-stone-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-stone-700">邮箱</p>
                  <p className="text-sm text-stone-900">{selectedOrder.email}</p>
                </div>
              </div>
              <div className="flex items-start">
                <Phone className="h-5 w-5 text-stone-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-stone-700">电话</p>
                  <p className="text-sm text-stone-900">{selectedOrder.phone}</p>
                </div>
              </div>
              <div className="flex items-start md:col-span-2">
                <MapPin className="h-5 w-5 text-stone-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-stone-700">收货地址</p>
                  <p className="text-sm text-stone-900">
                    {selectedOrder.name}，{selectedOrder.address}，{selectedOrder.city} {selectedOrder.postalCode}，{selectedOrder.country}
                  </p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h4 className="text-sm font-medium text-stone-700 mb-3">商品列表</h4>
              <div className="border border-stone-200 rounded-lg divide-y divide-stone-200">
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-stone-900">{item.name}</p>
                      <p className="text-xs text-stone-500">
                        {formatPrice(item.price)} x {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-medium text-stone-900">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-end">
                <div className="text-right">
                  <p className="text-sm text-stone-500">订单总额</p>
                  <p className="text-xl font-semibold text-cinnabar">
                    {formatPrice(selectedOrder.total)}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between pt-4 border-t border-stone-200">
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() => openStatusModal(selectedOrder, 'order')}
                >
                  更新订单状态
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => openStatusModal(selectedOrder, 'payment')}
                >
                  更新支付状态
                </Button>
              </div>
              <Button
                variant="ghost"
                onClick={() => {
                  setDetailModalOpen(false)
                  setSelectedOrder(null)
                }}
              >
                关闭
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Update Status Modal */}
      <Modal
        isOpen={statusModalOpen}
        onClose={() => {
          setStatusModalOpen(false)
          setUpdateStatusType(null)
          setNewStatus('')
        }}
        title={updateStatusType === 'order' ? '更新订单状态' : '更新支付状态'}
        size="sm"
      >
        {updateStatusType && (
          <div className="space-y-4">
            <Select
              label="选择状态"
              options={updateStatusType === 'order' ? ORDER_STATUS_OPTIONS : PAYMENT_STATUS_OPTIONS}
              value={newStatus}
              onChange={setNewStatus}
            />
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="secondary"
                onClick={() => {
                  setStatusModalOpen(false)
                  setUpdateStatusType(null)
                  setNewStatus('')
                }}
              >
                取消
              </Button>
              <Button onClick={handleUpdateStatus}>确认更新</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
