'use client'

import { useEffect, useState } from 'react'
import { Package, AlertTriangle, TrendingUp, TrendingDown, Plus, Minus, History } from 'lucide-react'
import { cn } from '@/lib/utils'
import { InventoryStatus } from '@/lib/inventory/service'

interface StockAlert {
  id: string
  productId: string
  threshold: number
  isActive: boolean
  createdAt: string
  product: {
    id: string
    name: string
    stock: number
    lowStockThreshold: number
    images: string[]
  }
}

interface InventoryLog {
  id: string
  productId: string
  type: string
  quantity: number
  beforeStock: number
  afterStock: number
  reason?: string
  createdAt: string
  product: {
    name: string
  }
}

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryStatus[]>([])
  const [alerts, setAlerts] = useState<StockAlert[]>([])
  const [logs, setLogs] = useState<InventoryLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'alerts' | 'logs'>('overview')
  const [selectedProduct, setSelectedProduct] = useState<InventoryStatus | null>(null)
  const [adjustmentAmount, setAdjustmentAmount] = useState('')
  const [adjustmentReason, setAdjustmentReason] = useState('')
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false)

  useEffect(() => {
    fetchInventoryData()
  }, [])

  const fetchInventoryData = async () => {
    try {
      setIsLoading(true)
      const [inventoryRes, alertsRes, logsRes] = await Promise.all([
        fetch('/api/inventory'),
        fetch('/api/inventory/alert'),
        fetch('/api/inventory/logs'),
      ])

      const inventoryData = await inventoryRes.json()
      const alertsData = await alertsRes.json()
      const logsData = await logsRes.json()

      setInventory(inventoryData.inventory || [])
      setAlerts(alertsData.alerts || [])
      setLogs(logsData.logs || [])
    } catch (error) {
      console.error('Failed to fetch inventory data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAdjustStock = async () => {
    if (!selectedProduct || !adjustmentAmount) return

    try {
      const response = await fetch('/api/inventory/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProduct.productId,
          quantity: parseInt(adjustmentAmount),
          type: parseInt(adjustmentAmount) > 0 ? 'STOCK_IN' : 'STOCK_OUT',
          reason: adjustmentReason || 'Manual adjustment',
        }),
      })

      if (response.ok) {
        setShowAdjustmentModal(false)
        setAdjustmentAmount('')
        setAdjustmentReason('')
        setSelectedProduct(null)
        fetchInventoryData()
      }
    } catch (error) {
      console.error('Failed to adjust stock:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'IN_STOCK':
        return 'text-emerald-600 bg-emerald-50'
      case 'LOW_STOCK':
        return 'text-amber-600 bg-amber-50'
      case 'OUT_OF_STOCK':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-stone-600 bg-stone-50'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'IN_STOCK':
        return '库存充足'
      case 'LOW_STOCK':
        return '库存不足'
      case 'OUT_OF_STOCK':
        return '缺货'
      default:
        return status
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-cinnabar/30 border-t-cinnabar rounded-full animate-spin" />
      </div>
    )
  }

  const stats = {
    totalProducts: inventory.length,
    lowStock: inventory.filter((i) => i.status === 'LOW_STOCK').length,
    outOfStock: inventory.filter((i) => i.status === 'OUT_OF_STOCK').length,
    totalValue: inventory.reduce((sum, i) => sum + i.currentStock, 0),
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-stone-900">库存管理</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl border border-stone-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-stone-500">总商品数</p>
              <p className="text-2xl font-semibold text-stone-900">{stats.totalProducts}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-stone-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-stone-500">库存不足</p>
              <p className="text-2xl font-semibold text-amber-600">{stats.lowStock}</p>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-stone-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-stone-500">缺货商品</p>
              <p className="text-2xl font-semibold text-red-600">{stats.outOfStock}</p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-stone-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-stone-500">总库存量</p>
              <p className="text-2xl font-semibold text-emerald-600">{stats.totalValue}</p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg">
              <TrendingUp className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-stone-200">
        <nav className="flex gap-6">
          {[
            { id: 'overview', label: '库存概览', icon: Package },
            { id: 'alerts', label: `库存预警 (${alerts.length})`, icon: AlertTriangle },
            { id: 'logs', label: '操作记录', icon: History },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={cn(
                'flex items-center gap-2 pb-4 text-sm font-medium border-b-2 transition-colors',
                activeTab === tab.id
                  ? 'border-cinnabar text-cinnabar'
                  : 'border-transparent text-stone-500 hover:text-stone-700'
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'overview' && (
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-stone-50">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-stone-600">商品</th>
                <th className="text-center px-6 py-4 text-sm font-medium text-stone-600">当前库存</th>
                <th className="text-center px-6 py-4 text-sm font-medium text-stone-600">预警阈值</th>
                <th className="text-center px-6 py-4 text-sm font-medium text-stone-600">状态</th>
                <th className="text-center px-6 py-4 text-sm font-medium text-stone-600">总销量</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-stone-600">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {inventory.map((item) => (
                <tr key={item.productId} className="hover:bg-stone-50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-stone-900">{item.productName}</p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={cn(
                      'font-semibold',
                      item.currentStock === 0 ? 'text-red-600' :
                      item.currentStock <= item.lowStockThreshold ? 'text-amber-600' :
                      'text-emerald-600'
                    )}>
                      {item.currentStock}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-stone-600">
                    {item.lowStockThreshold}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={cn(
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                      getStatusColor(item.status)
                    )}>
                      {getStatusLabel(item.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-stone-600">
                    {item.totalSold}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => {
                        setSelectedProduct(item)
                        setShowAdjustmentModal(true)
                      }}
                      className="text-cinnabar hover:text-cinnabar/80 text-sm font-medium"
                    >
                      调整库存
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'alerts' && (
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
          {alerts.length === 0 ? (
            <div className="p-12 text-center">
              <AlertTriangle className="w-12 h-12 text-stone-300 mx-auto mb-4" />
              <p className="text-stone-500">暂无库存预警</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-stone-50">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-medium text-stone-600">商品</th>
                  <th className="text-center px-6 py-4 text-sm font-medium text-stone-600">当前库存</th>
                  <th className="text-center px-6 py-4 text-sm font-medium text-stone-600">预警阈值</th>
                  <th className="text-center px-6 py-4 text-sm font-medium text-stone-600">预警时间</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {alerts.map((alert) => (
                  <tr key={alert.id} className="hover:bg-stone-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-stone-900">{alert.product.name}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-semibold text-red-600">{alert.product.stock}</span>
                    </td>
                    <td className="px-6 py-4 text-center text-stone-600">
                      {alert.threshold}
                    </td>
                    <td className="px-6 py-4 text-center text-stone-500">
                      {new Date(alert.createdAt).toLocaleDateString('zh-CN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-stone-50">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-stone-600">商品</th>
                <th className="text-center px-6 py-4 text-sm font-medium text-stone-600">操作类型</th>
                <th className="text-center px-6 py-4 text-sm font-medium text-stone-600">数量</th>
                <th className="text-center px-6 py-4 text-sm font-medium text-stone-600">变动前</th>
                <th className="text-center px-6 py-4 text-sm font-medium text-stone-600">变动后</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-stone-600">原因</th>
                <th className="text-center px-6 py-4 text-sm font-medium text-stone-600">时间</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-stone-50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-stone-900">{log.product.name}</p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={cn(
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                      log.type === 'STOCK_IN' || log.type === 'RESTOCK' || log.type === 'RETURN'
                        ? 'bg-emerald-50 text-emerald-600'
                        : log.type === 'STOCK_OUT' || log.type === 'SALE'
                        ? 'bg-red-50 text-red-600'
                        : 'bg-blue-50 text-blue-600'
                    )}>
                      {log.type === 'STOCK_IN' && '入库'}
                      {log.type === 'STOCK_OUT' && '出库'}
                      {log.type === 'SALE' && '销售'}
                      {log.type === 'RETURN' && '退货'}
                      {log.type === 'RESTOCK' && '补货'}
                      {log.type === 'ADJUSTMENT' && '调整'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center font-medium">
                    <span className={cn(
                      log.quantity > 0 ? 'text-emerald-600' : 'text-red-600'
                    )}>
                      {log.quantity > 0 ? '+' : ''}{log.quantity}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-stone-600">
                    {log.beforeStock}
                  </td>
                  <td className="px-6 py-4 text-center text-stone-600">
                    {log.afterStock}
                  </td>
                  <td className="px-6 py-4 text-stone-600">
                    {log.reason || '-'}
                  </td>
                  <td className="px-6 py-4 text-center text-stone-500">
                    {new Date(log.createdAt).toLocaleString('zh-CN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Adjustment Modal */}
      {showAdjustmentModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-stone-900 mb-4">
              调整库存 - {selectedProduct.productName}
            </h3>
            <p className="text-sm text-stone-500 mb-4">
              当前库存: <span className="font-semibold">{selectedProduct.currentStock}</span>
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  调整数量 (正数为入库，负数为出库)
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustmentAmount((prev) => String((parseInt(prev) || 0) - 1))}
                    className="p-2 border border-stone-300 rounded-lg hover:bg-stone-50"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    value={adjustmentAmount}
                    onChange={(e) => setAdjustmentAmount(e.target.value)}
                    className="flex-1 px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-cinnabar focus:border-cinnabar outline-none text-center"
                    placeholder="0"
                  />
                  <button
                    type="button"
                    onClick={() => setAdjustmentAmount((prev) => String((parseInt(prev) || 0) + 1))}
                    className="p-2 border border-stone-300 rounded-lg hover:bg-stone-50"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  调整原因
                </label>
                <input
                  type="text"
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                  className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-cinnabar focus:border-cinnabar outline-none"
                  placeholder="请输入调整原因"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowAdjustmentModal(false)
                    setSelectedProduct(null)
                    setAdjustmentAmount('')
                    setAdjustmentReason('')
                  }}
                  className="flex-1 px-4 py-2 border border-stone-300 text-stone-700 rounded-lg hover:bg-stone-50 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleAdjustStock}
                  disabled={!adjustmentAmount || adjustmentAmount === '0'}
                  className="flex-1 px-4 py-2 bg-cinnabar text-white rounded-lg hover:bg-cinnabar/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  确认调整
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
