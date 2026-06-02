'use client'

/**
 * 类型安全的 API 客户端工具
 *
 * 封装 fetch API，提供统一的接口调用方式：
 * - 自动处理 JSON 序列化/反序列化
 * - 统一错误处理（ApiError 类）
 * - TypeScript 泛型支持
 * - 支持 GET/POST/PUT/PATCH/DELETE 方法
 */

/** API 错误类，包含 HTTP 状态码和响应体 */
export class ApiError extends Error {
  public readonly status: number
  public readonly body: unknown

  constructor(status: number, body: unknown) {
    const message =
      (body as { error?: string })?.error || `API error ${status}`
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

/**
 * 发起 API 请求的基础函数
 *
 * @param path - API 路径（如 /api/products）
 * @param init - fetch 请求配置
 * @returns 解析后的 JSON 响应
 * @throws ApiError 当响应状态码 >= 400 时
 */
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })

  if (!res.ok) {
    let body: unknown
    try {
      body = await res.json()
    } catch {
      body = null
    }
    throw new ApiError(res.status, body)
  }

  // 处理 204 No Content 或空响应
  const text = await res.text()
  if (!text) return {} as T

  return JSON.parse(text) as T
}

/**
 * 类型安全的 API 客户端
 *
 * 使用示例：
 * ```ts
 * // GET 请求
 * const { products } = await apiClient.get<{ products: Product[] }>('/api/products')
 *
 * // POST 请求
 * const product = await apiClient.post<Product>('/api/products', { name: '新商品' })
 *
 * // PATCH 请求
 * const order = await apiClient.patch<Order>('/api/orders', { orderId, status: 'SHIPPED' })
 *
 * // DELETE 请求
 * await apiClient.delete('/api/products/123')
 * ```
 */
export const apiClient = {
  /** 发起 GET 请求 */
  get: <T>(path: string) => request<T>(path),

  /** 发起 POST 请求 */
  post: <T>(path: string, data: unknown) =>
    request<T>(path, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /** 发起 PUT 请求 */
  put: <T>(path: string, data: unknown) =>
    request<T>(path, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  /** 发起 PATCH 请求 */
  patch: <T>(path: string, data: unknown) =>
    request<T>(path, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  /** 发起 DELETE 请求 */
  delete: <T>(path: string) =>
    request<T>(path, {
      method: 'DELETE',
    }),
}
