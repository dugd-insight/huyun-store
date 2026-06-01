'use client'

import { useState, useEffect } from 'react'
import {
  Search,
  Users as UsersIcon,
  Shield,
  User,
  ChevronDown,
} from 'lucide-react'
import {
  PageHeader,
  Input,
  Select,
  Badge,
  Pagination,
  Modal,
  EmptyState,
  Button,
} from '@/lib/admin/components'
import {
  getUsers,
  getUserOrdersCount,
  updateUser,
  User as UserType,
  UserRole,
} from '@/lib/admin/store'
import { formatDate, cn } from '@/lib/utils'

const ITEMS_PER_PAGE = 10

export default function UsersPage() {
  const [users, setUsers] = useState<UserType[]>([])
  const [userOrderCounts, setUserOrderCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRole, setSelectedRole] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  // Role update modal
  const [roleModalOpen, setRoleModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null)
  const [newRole, setNewRole] = useState<UserRole>('USER')

  const loadData = () => {
    try {
      const usersData = getUsers()
      setUsers(usersData)

      // Load order counts
      const counts: Record<string, number> = {}
      usersData.forEach((user) => {
        counts[user.id] = getUserOrdersCount(user.id)
      })
      setUserOrderCounts(counts)
    } catch (error) {
      console.error('Error loading users:', error)
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

  // Filter users
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      !searchQuery ||
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = !selectedRole || user.role === selectedRole
    return matchesSearch && matchesRole
  })

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE)
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const openRoleModal = (user: UserType) => {
    setSelectedUser(user)
    setNewRole(user.role)
    setRoleModalOpen(true)
  }

  const handleUpdateRole = () => {
    if (!selectedUser) return

    updateUser(selectedUser.id, { role: newRole })
    setRoleModalOpen(false)
    loadData()
  }

  const getRoleBadge = (role: UserRole) => {
    return role === 'ADMIN' ? (
      <Badge variant="info">
        <Shield className="h-3 w-3 mr-1" />
        管理员
      </Badge>
    ) : (
      <Badge variant="default">
        <User className="h-3 w-3 mr-1" />
        用户
      </Badge>
    )
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
        title="用户管理"
        description="查看和管理注册用户，设置用户权限。"
      />

      {/* Filters */}
      <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-stone-400" />
              <Input
                placeholder="搜索用户名或邮箱..."
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
              options={[
                { value: 'USER', label: '普通用户' },
                { value: 'ADMIN', label: '管理员' },
              ]}
              value={selectedRole}
              onChange={(value) => {
                setSelectedRole(value)
                setCurrentPage(1)
              }}
              placeholder="全部角色"
              className="w-32"
            />
          </div>
        </div>
      </div>

      {/* Users Table */}
      {paginatedUsers.length === 0 ? (
        <EmptyState
          icon={UsersIcon}
          title={searchQuery || selectedRole ? '没有找到匹配的用户' : '暂无用户'}
          description={
            searchQuery || selectedRole
              ? '尝试调整搜索条件或清除筛选'
              : '当有用户注册时会显示在这里'
          }
        />
      ) : (
        <>
          <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-stone-200">
              <thead className="bg-stone-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                    用户
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                    邮箱
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                    角色
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                    订单数
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                    注册时间
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {paginatedUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-stone-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-stone-100 flex items-center justify-center">
                          {user.image ? (
                            <img
                              src={user.image}
                              alt={user.name || 'User'}
                              className="h-full w-full rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-sm font-medium text-stone-600">
                              {(user.name || user.email).charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-stone-900">
                            {user.name || '未设置姓名'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-stone-600">
                      {user.email}
                    </td>
                    <td className="px-6 py-4">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="px-6 py-4 text-sm text-stone-600">
                      {userOrderCounts[user.id] || 0}
                    </td>
                    <td className="px-6 py-4 text-sm text-stone-500">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => openRoleModal(user)}
                        className={cn(
                          'p-2 rounded-lg transition-colors',
                          user.role === 'ADMIN'
                            ? 'text-amber-600 hover:bg-amber-50'
                            : 'text-stone-400 hover:bg-stone-100'
                        )}
                        title="修改角色"
                      >
                        <Shield className="h-4 w-4" />
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

      {/* Role Update Modal */}
      <Modal
        isOpen={roleModalOpen}
        onClose={() => {
          setRoleModalOpen(false)
          setSelectedUser(null)
        }}
        title="修改用户角色"
        size="sm"
      >
        {selectedUser && (
          <div className="space-y-4">
            <div className="p-4 bg-stone-50 rounded-lg">
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-full bg-stone-200 flex items-center justify-center mr-4">
                  {selectedUser.image ? (
                    <img
                      src={selectedUser.image}
                      alt={selectedUser.name || 'User'}
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-lg font-medium text-stone-600">
                      {(selectedUser.name || selectedUser.email).charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <p className="font-medium text-stone-900">
                    {selectedUser.name || '未设置姓名'}
                  </p>
                  <p className="text-sm text-stone-500">{selectedUser.email}</p>
                </div>
              </div>
            </div>

            <Select
              label="选择角色"
              options={[
                { value: 'USER', label: '普通用户' },
                { value: 'ADMIN', label: '管理员' },
              ]}
              value={newRole}
              onChange={(value) => setNewRole(value as UserRole)}
            />

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-sm text-amber-800">
                {newRole === 'ADMIN'
                  ? '管理员可以访问管理后台的所有功能。'
                  : '普通用户只能浏览和购买商品。'}
              </p>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="secondary"
                onClick={() => {
                  setRoleModalOpen(false)
                  setSelectedUser(null)
                }}
              >
                取消
              </Button>
              <Button onClick={handleUpdateRole}>确认修改</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
