// Shared UI Components for Admin Dashboard
'use client'

import { useState, useEffect, createContext, useContext, ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  Layers,
  FileText,
  ShoppingCart,
  Users,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  LogOut,
  User,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { initializeMockData } from '@/lib/admin/store'

// Navigation items
const navigation = [
  { name: '仪表盘', href: '/admin', icon: LayoutDashboard },
  { name: '商品管理', href: '/admin/products', icon: Package },
  { name: '分类管理', href: '/admin/categories', icon: Layers },
  { name: '库存管理', href: '/admin/inventory', icon: BarChart3, badge: 'lowStock' },
  { name: '故事管理', href: '/admin/stories', icon: FileText },
  { name: '订单管理', href: '/admin/orders', icon: ShoppingCart },
  { name: '用户管理', href: '/admin/users', icon: Users },
  { name: '数据统计', href: '/admin/dashboard', icon: BarChart3 },
]

// Sidebar Context
interface SidebarContextType {
  isCollapsed: boolean
  setIsCollapsed: (value: boolean) => void
  isMobileOpen: boolean
  setIsMobileOpen: (value: boolean) => void
}

const SidebarContext = createContext<SidebarContextType>({
  isCollapsed: false,
  setIsCollapsed: () => {},
  isMobileOpen: false,
  setIsMobileOpen: () => {},
})

export function useSidebar() {
  return useContext(SidebarContext)
}

// Admin Layout Component
interface AdminLayoutProps {
  children: ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [lowStockCount, setLowStockCount] = useState(0)
  const pathname = usePathname()

  // Initialize mock data on mount
  useEffect(() => {
    initializeMockData()
  }, [])

  // Fetch low stock count
  useEffect(() => {
    const fetchLowStockCount = async () => {
      try {
        const response = await fetch('/api/inventory/alert')
        if (response.ok) {
          const data = await response.json()
          setLowStockCount(data.alerts?.length || 0)
        }
      } catch (error) {
        console.error('Failed to fetch low stock count:', error)
      }
    }

    fetchLowStockCount()
    // Refresh every 5 minutes
    const interval = setInterval(fetchLowStockCount, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileOpen(false)
  }, [pathname])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMobileOpen])

  return (
    <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }}>
      <div className="min-h-screen bg-stone-50">
        {/* Mobile Overlay */}
        {isMobileOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={cn(
            'fixed top-0 left-0 z-50 h-full bg-stone-900 text-white transition-all duration-300',
            isCollapsed ? 'w-16' : 'w-64',
            isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          )}
        >
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-stone-800">
            {!isCollapsed && (
              <Link href="/admin" className="flex items-center space-x-2">
                <span className="text-xl font-light tracking-tight">葫韵</span>
                <span className="text-xs text-stone-400 tracking-widest">HUYUN</span>
              </Link>
            )}
            {isCollapsed && (
              <span className="mx-auto text-xl font-light">H</span>
            )}
            <button
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden p-1 hover:bg-stone-800 rounded"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
              const showBadge = item.badge === 'lowStock' && lowStockCount > 0
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center px-3 py-2.5 rounded-lg transition-colors',
                    isActive
                      ? 'bg-cinnabar text-white'
                      : 'text-stone-300 hover:bg-stone-800 hover:text-white',
                    isCollapsed && 'justify-center'
                  )}
                  title={isCollapsed ? item.name : undefined}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!isCollapsed && (
                    <>
                      <span className="ml-3 text-sm flex-1">{item.name}</span>
                      {showBadge && (
                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                          {lowStockCount}
                        </span>
                      )}
                    </>
                  )}
                  {isCollapsed && showBadge && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Collapse Toggle (Desktop) */}
          <div className="hidden lg:block border-t border-stone-800 p-2">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="flex items-center justify-center w-full p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-lg transition-colors"
            >
              {isCollapsed ? (
                <ChevronRight className="h-5 w-5" />
              ) : (
                <>
                  <ChevronLeft className="h-5 w-5" />
                  <span className="ml-2 text-sm">收起</span>
                </>
              )}
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <div
          className={cn(
            'min-h-screen transition-all duration-300',
            isCollapsed ? 'lg:pl-16' : 'lg:pl-64'
          )}
        >
          {/* Top Header */}
          <header className="sticky top-0 z-30 h-16 bg-white border-b border-stone-200 shadow-sm">
            <div className="flex items-center justify-between h-full px-4 lg:px-6">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileOpen(true)}
                className="lg:hidden p-2 -ml-2 text-stone-600 hover:text-stone-900"
              >
                <Menu className="h-6 w-6" />
              </button>

              {/* Breadcrumb / Page Title */}
              <div className="hidden lg:flex items-center text-sm text-stone-500">
                <span>管理后台</span>
              </div>

              {/* Right Side */}
              <div className="flex items-center space-x-4">
                {/* Admin User */}
                <div className="flex items-center space-x-3">
                  <div className="hidden sm:flex flex-col items-end">
                    <span className="text-sm font-medium text-stone-900">管理员</span>
                    <span className="text-xs text-stone-500">admin@huyun.com</span>
                  </div>
                  <div className="h-9 w-9 rounded-full bg-cinnabar flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                </div>

                {/* Logout */}
                <button className="p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors">
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="p-4 lg:p-6">{children}</main>
        </div>
      </div>
    </SidebarContext.Provider>
  )
}

// Stat Card Component
interface StatCardProps {
  title: string
  value: string | number
  icon: React.ElementType
  trend?: {
    value: number
    isPositive: boolean
  }
  color?: 'default' | 'cinnabar' | 'emerald' | 'amber'
}

export function StatCard({ title, value, icon: Icon, trend, color = 'default' }: StatCardProps) {
  const colorClasses = {
    default: 'bg-white border-stone-200',
    cinnabar: 'bg-cinnabar/10 border-cinnabar/20',
    emerald: 'bg-emerald-500/10 border-emerald-500/20',
    amber: 'bg-amber-500/10 border-amber-500/20',
  }

  const iconColorClasses = {
    default: 'text-stone-600',
    cinnabar: 'text-cinnabar',
    emerald: 'text-emerald-600',
    amber: 'text-amber-600',
  }

  return (
    <div className={cn('rounded-xl border p-6 shadow-sm', colorClasses[color])}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-stone-500">{title}</p>
          <p className="mt-2 text-3xl font-semibold text-stone-900">{value}</p>
          {trend && (
            <p className={cn('mt-2 text-sm font-medium', trend.isPositive ? 'text-emerald-600' : 'text-red-600')}>
              {trend.isPositive ? '+' : ''}{trend.value}% vs 上期
            </p>
          )}
        </div>
        <div className={cn('p-3 rounded-lg', color === 'default' ? 'bg-stone-100' : '')}>
          <Icon className={cn('h-6 w-6', iconColorClasses[color])} />
        </div>
      </div>
    </div>
  )
}

// Data Table Component
interface Column<T> {
  key: string
  header: string
  render?: (item: T) => ReactNode
  className?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  emptyMessage?: string
  onRowClick?: (item: T) => void
}

export function DataTable<T extends { id: string }>({
  columns,
  data,
  emptyMessage = '暂无数据',
  onRowClick,
}: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
      <table className="min-w-full divide-y divide-stone-200">
        <thead className="bg-stone-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={cn(
                  'px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider',
                  column.className
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-200">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-12 text-center text-stone-500">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <tr
                key={item.id}
                className={cn(
                  'hover:bg-stone-50 transition-colors',
                  onRowClick && 'cursor-pointer'
                )}
                onClick={() => onRowClick?.(item)}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn('px-6 py-4 text-sm text-stone-900', column.className)}
                  >
                    {column.render
                      ? column.render(item)
                      : (item as Record<string, unknown>)[column.key] as ReactNode}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

// Modal Component
interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-black/50 transition-opacity"
          onClick={onClose}
        />
        <div
          className={cn(
            'relative w-full bg-white rounded-xl shadow-2xl',
            sizeClasses[size]
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200">
            <h3 className="text-lg font-semibold text-stone-900">{title}</h3>
            <button
              onClick={onClose}
              className="p-1 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-4 max-h-[calc(100vh-200px)] overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

// Button Component
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  className,
  ...props
}: ButtonProps) {
  const variantClasses = {
    primary: 'bg-cinnabar text-white hover:bg-cinnabar/90',
    secondary: 'bg-stone-100 text-stone-900 hover:bg-stone-200',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    ghost: 'bg-transparent text-stone-600 hover:bg-stone-100',
  }

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-medium rounded-lg transition-colors',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

// Input Component
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-stone-700">{label}</label>
      )}
      <input
        className={cn(
          'block w-full rounded-lg border border-stone-300 px-3 py-2 text-sm placeholder:text-stone-400',
          'focus:border-cinnabar focus:outline-none focus:ring-1 focus:ring-cinnabar',
          error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
          className
        )}
        {...props}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}

// Textarea Component
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export function Textarea({ label, error, className, ...props }: TextareaProps) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-stone-700">{label}</label>
      )}
      <textarea
        className={cn(
          'block w-full rounded-lg border border-stone-300 px-3 py-2 text-sm placeholder:text-stone-400',
          'focus:border-cinnabar focus:outline-none focus:ring-1 focus:ring-cinnabar',
          error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
          className
        )}
        {...props}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}

// Select Component
interface SelectOption {
  value: string
  label: string
}

interface SelectProps {
  label?: string
  error?: string
  options: SelectOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function Select({ label, error, options, value, onChange, placeholder, className }: SelectProps) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-stone-700">{label}</label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'block w-full rounded-lg border border-stone-300 px-3 py-2 text-sm bg-white',
          'focus:border-cinnabar focus:outline-none focus:ring-1 focus:ring-cinnabar',
          error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
          className
        )}
      >
        {placeholder && (
          <option value="">{placeholder}</option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}

// Toggle Component
interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  disabled?: boolean
}

export function Toggle({ checked, onChange, label, disabled }: ToggleProps) {
  return (
    <label className="inline-flex items-center cursor-pointer">
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
        />
        <div
          className={cn(
            'w-11 h-6 rounded-full transition-colors',
            checked ? 'bg-cinnabar' : 'bg-stone-300',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        />
        <div
          className={cn(
            'absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform',
            checked && 'translate-x-5'
          )}
        />
      </div>
      {label && <span className="ml-3 text-sm text-stone-700">{label}</span>}
    </label>
  )
}

// Badge Component
interface BadgeProps {
  children: ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
  className?: string
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variantClasses = {
    default: 'bg-stone-100 text-stone-700',
    success: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  )
}

// Pagination Component
interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  return (
    <div className="flex items-center justify-center space-x-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1.5 text-sm font-medium text-stone-600 hover:bg-stone-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        上一页
      </button>
      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={cn(
            'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
            page === currentPage
              ? 'bg-cinnabar text-white'
              : 'text-stone-600 hover:bg-stone-100'
          )}
        >
          {page}
        </button>
      ))}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1.5 text-sm font-medium text-stone-600 hover:bg-stone-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        下一页
      </button>
    </div>
  )
}

// Empty State Component
interface EmptyStateProps {
  icon?: React.ElementType
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {Icon && (
        <div className="p-4 bg-stone-100 rounded-full mb-4">
          <Icon className="h-8 w-8 text-stone-400" />
        </div>
      )}
      <h3 className="text-lg font-medium text-stone-900">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-stone-500 max-w-sm">{description}</p>
      )}
      {action && (
        <Button onClick={action.onClick} className="mt-4">
          {action.label}
        </Button>
      )}
    </div>
  )
}

// Loading Spinner
export function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  }

  return (
    <div className="animate-spin rounded-full border-2 border-stone-300 border-t-cinnabar" style={{ width: 24, height: 24 }} />
  )
}

// Page Header Component
interface PageHeaderProps {
  title: string
  description?: string
  actions?: ReactNode
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-semibold text-stone-900">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-stone-500">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center space-x-3">{actions}</div>}
    </div>
  )
}
