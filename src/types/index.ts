export interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  originalPrice: number | null
  images: string[]
  categoryId: string
  stock: number
  status: 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK'
  featured: boolean
  createdAt: string
  updatedAt: string
  category: Category
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image: string | null
  createdAt: string
  updatedAt: string
}

export interface CartItem {
  id: string
  cartId: string
  productId: string
  quantity: number
  product: Product
}

export interface Cart {
  items: CartItem[]
  total: number
}

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  name: string
  price: number
  quantity: number
  product?: Product
}

export interface Order {
  id: string
  userId: string | null
  email: string
  name: string
  phone: string
  address: string
  city: string
  postalCode: string | null
  country: string
  total: number
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
  paymentStatus: 'UNPAID' | 'PAID' | 'REFUNDED'
  createdAt: string
  updatedAt: string
  items: OrderItem[]
}

export interface Story {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string | null
  image: string | null
  author: string | null
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface User {
  id: string
  email: string
  name: string | null
  image: string | null
  role: 'USER' | 'ADMIN'
}

export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface ProductsResponse {
  products: Product[]
  pagination: Pagination
}

export interface StoriesResponse {
  stories: Story[]
  pagination: Pagination
}
