import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { NextResponse } from 'next/server'

/**
 * 验证当前请求是否来自管理员用户。
 * 用于保护需要管理员权限的 API 端点（POST/PUT/DELETE）。
 *
 * @returns null 表示授权通过；NextResponse 表示未授权（应直接返回该响应）
 */
export async function requireAdmin(): Promise<NextResponse | null> {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return null
}
