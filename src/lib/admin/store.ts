// Mock Data Store for Admin Dashboard
// This module provides mock data and localStorage persistence

export type UserRole = 'USER' | 'ADMIN'
export type ProductStatus = 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK'
export type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
export type PaymentStatus = 'UNPAID' | 'PAID' | 'REFUNDED'

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image: string | null
  createdAt: string
  updatedAt: string
}

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
  status: ProductStatus
  featured: boolean
  createdAt: string
  updatedAt: string
  category?: Category
}

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  name: string
  price: number
  quantity: number
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
  status: OrderStatus
  paymentStatus: PaymentStatus
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
  role: UserRole
  createdAt: string
  updatedAt: string
}

// Generate unique IDs
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

// Generate slug from text
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

// Initial mock data
const initialCategories: Category[] = [
  {
    id: 'cat_1',
    name: '葫芦摆件',
    slug: 'baijian',
    description: '精美的手工葫芦摆件，装饰家居首选',
    image: 'https://images.unsplash.com/photo-1544457070-4cd773b4d71e?w=400',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'cat_2',
    name: '葫芦灯具',
    slug: 'dengju',
    description: '传统工艺与现代设计的完美结合',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
  },
  {
    id: 'cat_3',
    name: '葫芦茶具',
    slug: 'chaju',
    description: '茶道文化与葫芦艺术的交融',
    image: 'https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?w=400',
    createdAt: '2024-01-03T00:00:00Z',
    updatedAt: '2024-01-03T00:00:00Z',
  },
  {
    id: 'cat_4',
    name: '葫芦配饰',
    slug: 'peishi',
    description: '可佩戴的葫芦饰品，增添东方韵味',
    image: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=400',
    createdAt: '2024-01-04T00:00:00Z',
    updatedAt: '2024-01-04T00:00:00Z',
  },
]

const initialProducts: Product[] = [
  {
    id: 'prod_1',
    name: '福禄双全摆件',
    slug: 'flu-shuangquan-baijian',
    description: '采用优质天然葫芦，经过36道工序精心制作。葫芦谐音"福禄"，象征福气与财富双至。',
    price: 599,
    originalPrice: 799,
    images: ['https://images.unsplash.com/photo-1544457070-4cd773b4d71e?w=800'],
    categoryId: 'cat_1',
    stock: 15,
    status: 'ACTIVE',
    featured: true,
    createdAt: '2024-01-10T00:00:00Z',
    updatedAt: '2024-01-10T00:00:00Z',
  },
  {
    id: 'prod_2',
    name: '龙凤呈祥灯具',
    slug: 'longfeng-chengxiang-dengju',
    description: '手工雕刻龙凤图案，内置LED暖光，营造温馨氛围。',
    price: 1299,
    originalPrice: null,
    images: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800'],
    categoryId: 'cat_2',
    stock: 8,
    status: 'ACTIVE',
    featured: true,
    createdAt: '2024-01-12T00:00:00Z',
    updatedAt: '2024-01-12T00:00:00Z',
  },
  {
    id: 'prod_3',
    name: '山水情怀茶具套装',
    slug: 'shanshui-qinghuai-chaju-taozhuang',
    description: '葫芦与紫砂完美结合，套装包含茶壶、茶杯、茶海。',
    price: 1899,
    originalPrice: 2299,
    images: ['https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?w=800'],
    categoryId: 'cat_3',
    stock: 5,
    status: 'ACTIVE',
    featured: false,
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
  },
  {
    id: 'prod_4',
    name: '如意葫芦项链',
    slug: 'ruyi-hulu-xianglian',
    description: '小巧精致的葫芦吊坠，925纯银打造，可作情侣款。',
    price: 399,
    originalPrice: null,
    images: ['https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=800'],
    categoryId: 'cat_4',
    stock: 20,
    status: 'ACTIVE',
    featured: true,
    createdAt: '2024-01-18T00:00:00Z',
    updatedAt: '2024-01-18T00:00:00Z',
  },
  {
    id: 'prod_5',
    name: '招财进宝葫芦',
    slug: 'zhaocai-jinbao-hulu',
    description: '金色漆艺葫芦，寓意财源广进。适合店铺摆放。',
    price: 899,
    originalPrice: 1099,
    images: ['https://images.unsplash.com/photo-1567696911980-2eed69a46042?w=800'],
    categoryId: 'cat_1',
    stock: 0,
    status: 'OUT_OF_STOCK',
    featured: false,
    createdAt: '2024-01-20T00:00:00Z',
    updatedAt: '2024-01-20T00:00:00Z',
  },
  {
    id: 'prod_6',
    name: '荷塘月色壁灯',
    slug: 'hetang-yuese-bideng',
    description: '葫芦材质壁灯，图案为荷塘月色，意境优美。',
    price: 699,
    originalPrice: null,
    images: ['https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=800'],
    categoryId: 'cat_2',
    stock: 12,
    status: 'ACTIVE',
    featured: false,
    createdAt: '2024-01-22T00:00:00Z',
    updatedAt: '2024-01-22T00:00:00Z',
  },
]

const initialOrders: Order[] = [
  {
    id: 'ord_1',
    userId: 'user_1',
    email: 'zhangsan@example.com',
    name: '张三',
    phone: '13800138000',
    address: '北京市朝阳区建国路88号',
    city: '北京',
    postalCode: '100022',
    country: 'CN',
    total: 1898,
    status: 'DELIVERED',
    paymentStatus: 'PAID',
    createdAt: '2024-01-25T10:30:00Z',
    updatedAt: '2024-01-28T14:20:00Z',
    items: [
      { id: 'item_1', orderId: 'ord_1', productId: 'prod_3', name: '山水情怀茶具套装', price: 1899, quantity: 1 },
    ],
  },
  {
    id: 'ord_2',
    userId: 'user_2',
    email: 'lisi@example.com',
    name: '李四',
    phone: '13900139000',
    address: '上海市浦东新区世纪大道100号',
    city: '上海',
    postalCode: '200120',
    country: 'CN',
    total: 998,
    status: 'SHIPPED',
    paymentStatus: 'PAID',
    createdAt: '2024-02-01T14:20:00Z',
    updatedAt: '2024-02-02T09:15:00Z',
    items: [
      { id: 'item_2', orderId: 'ord_2', productId: 'prod_1', name: '福禄双全摆件', price: 599, quantity: 1 },
      { id: 'item_3', orderId: 'ord_2', productId: 'prod_4', name: '如意葫芦项链', price: 399, quantity: 1 },
    ],
  },
  {
    id: 'ord_3',
    userId: null,
    email: 'wangwu@example.com',
    name: '王五',
    phone: '13700137000',
    address: '广州市天河区天河路123号',
    city: '广州',
    postalCode: '510620',
    country: 'CN',
    total: 1299,
    status: 'PROCESSING',
    paymentStatus: 'PAID',
    createdAt: '2024-02-05T09:00:00Z',
    updatedAt: '2024-02-05T11:30:00Z',
    items: [
      { id: 'item_4', orderId: 'ord_3', productId: 'prod_2', name: '龙凤呈祥灯具', price: 1299, quantity: 1 },
    ],
  },
  {
    id: 'ord_4',
    userId: 'user_3',
    email: 'zhaoliu@example.com',
    name: '赵六',
    phone: '13600136000',
    address: '深圳市南山区科技园路456号',
    city: '深圳',
    postalCode: '518057',
    country: 'CN',
    total: 399,
    status: 'PENDING',
    paymentStatus: 'UNPAID',
    createdAt: '2024-02-08T16:45:00Z',
    updatedAt: '2024-02-08T16:45:00Z',
    items: [
      { id: 'item_5', orderId: 'ord_4', productId: 'prod_4', name: '如意葫芦项链', price: 399, quantity: 1 },
    ],
  },
  {
    id: 'ord_5',
    userId: 'user_1',
    email: 'zhangsan@example.com',
    name: '张三',
    phone: '13800138000',
    address: '北京市朝阳区建国路88号',
    city: '北京',
    postalCode: '100022',
    country: 'CN',
    total: 699,
    status: 'DELIVERED',
    paymentStatus: 'PAID',
    createdAt: '2024-02-10T11:20:00Z',
    updatedAt: '2024-02-14T18:00:00Z',
    items: [
      { id: 'item_6', orderId: 'ord_5', productId: 'prod_6', name: '荷塘月色壁灯', price: 699, quantity: 1 },
    ],
  },
]

const initialStories: Story[] = [
  {
    id: 'story_1',
    title: '葫芦文化的千年传承',
    slug: 'hulu-wenhua-de-qiannian-chuancheng',
    content: `葫芦，作为中华民族最古老的吉祥物之一，承载着数千年的文化内涵。

早在远古时期，葫芦就被先民用作盛水、装酒的容器。随着时间的推移，它逐渐演变为一种文化符号，象征着"福禄"——即福气与财富。

在传统工艺中，葫芦雕刻是一门极其讲究的艺术。工匠们需要在葫芦表面精心刻画各种图案，如龙凤呈祥、花鸟鱼虫、山水人物等。每一件作品都需要经过采摘、晾晒、打磨、雕刻、上色等多道工序，耗时数月甚至数年才能完成。

HuYun品牌致力于将这一传统工艺发扬光大。我们与多位资深葫芦雕刻艺人合作，将传统技法与现代审美相结合，创造出既具古典韵味又符合当代生活方式的葫芦艺术品。

每一件HuYun产品，都是对传统文化的致敬，也是对匠人精神的传承。`,
    excerpt: '探索葫芦文化的历史渊源，了解这一传统工艺品背后的故事。',
    image: 'https://images.unsplash.com/photo-1544457070-4cd773b4d71e?w=1200',
    author: 'HuYun Studio',
    publishedAt: '2024-01-15T00:00:00Z',
    createdAt: '2024-01-10T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
  },
  {
    id: 'story_2',
    title: '匠心独运：一位葫芦雕刻师的故事',
    slug: 'jiangxin-duyun-yiwei-hulu-diaoke-shi-de-gushi',
    content: `王德明师傅，今年68岁，是山东省潍坊市的一位资深葫芦雕刻艺人。

"我16岁开始学这门手艺，"王师傅说，"那时候村里几乎家家户户都种葫芦，但真正会雕刻的没几个。"

经过五十多年的钻研，王师傅掌握了包括浅浮雕、深浮雕、透雕在内的多种技法。他的作品多次获得国家级工艺美术奖项，被国内外收藏家追捧。

"雕刻葫芦最重要的是耐心和手感，"王师傅解释道，"每一刀下去都不能重来，必须胸有成竹。"

2018年，HuYun团队找到了王师傅，希望将他的技艺与现代设计理念相结合。"一开始我是有顾虑的，"王师傅坦诚地说，"但看到他们的设计稿后，我发现这些年轻人真的很懂传统文化的美。"

如今，王师傅的作品通过HuYun平台走向了全国各地乃至海外市场。"能让更多人了解和喜爱葫芦工艺，这是我最大的心愿。"`,
    excerpt: '聆听68岁葫芦雕刻大师王德明的匠心故事。',
    image: 'https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?w=1200',
    author: 'HuYun Studio',
    publishedAt: '2024-01-20T00:00:00Z',
    createdAt: '2024-01-18T00:00:00Z',
    updatedAt: '2024-01-20T00:00:00Z',
  },
  {
    id: 'story_3',
    title: '如何挑选和保养葫芦制品',
    slug: 'ruhe-tiaoxuan-he-baoyang-hulu-zhipin',
    content: `葫芦制品不仅美观大方，还具有收藏价值。但要想让您的葫芦制品保持最佳状态，需要掌握一些基本的挑选和保养知识。

## 如何挑选优质葫芦制品

1. **看外观**：优质的葫芦表面应该光滑均匀，没有明显的疤痕或裂纹。颜色以淡黄色或金黄色为佳。

2. **听声音**：轻轻敲击葫芦，真正的老葫芦会发出清脆悦耳的声音，而新葫芦或处理过的葫芦声音则较为沉闷。

3. **掂重量**：同样大小的葫芦，越重的通常品质越好，说明其密度高、质地好。

4. **查工艺**：仔细观察雕刻线条是否流畅，图案是否对称，整体比例是否协调。

## 日常保养技巧

1. **避免阳光直射**：长时间的阳光暴晒会导致葫芦开裂或褪色。

2. **保持干燥**：葫芦最怕潮湿，存放环境应保持通风干燥。

3. **定期清洁**：用软布轻轻擦拭即可，不要使用化学清洁剂。

4. **适当把玩**：经常把玩可以让葫芦表面形成漂亮的包浆，增添韵味。`,
    excerpt: '掌握挑选和保养技巧，让您的葫芦制品历久弥新。',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200',
    author: 'HuYun Studio',
    publishedAt: '2024-01-25T00:00:00Z',
    createdAt: '2024-01-22T00:00:00Z',
    updatedAt: '2024-01-25T00:00:00Z',
  },
]

const initialUsers: User[] = [
  {
    id: 'user_admin',
    email: 'admin@huyun.com',
    name: '管理员',
    image: null,
    role: 'ADMIN',
    createdAt: '2023-06-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'user_1',
    email: 'zhangsan@example.com',
    name: '张三',
    image: null,
    role: 'USER',
    createdAt: '2024-01-05T00:00:00Z',
    updatedAt: '2024-01-25T00:00:00Z',
  },
  {
    id: 'user_2',
    email: 'lisi@example.com',
    name: '李四',
    image: null,
    role: 'USER',
    createdAt: '2024-01-08T00:00:00Z',
    updatedAt: '2024-02-01T00:00:00Z',
  },
  {
    id: 'user_3',
    email: 'zhaoliu@example.com',
    name: '赵六',
    image: null,
    role: 'USER',
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-02-08T00:00:00Z',
  },
  {
    id: 'user_4',
    email: 'sunqi@example.com',
    name: '孙七',
    image: null,
    role: 'USER',
    createdAt: '2024-01-20T00:00:00Z',
    updatedAt: '2024-01-20T00:00:00Z',
  },
]

// Storage keys
const STORAGE_KEYS = {
  CATEGORIES: 'huyun_admin_categories',
  PRODUCTS: 'huyun_admin_products',
  ORDERS: 'huyun_admin_orders',
  STORIES: 'huyun_admin_stories',
  USERS: 'huyun_admin_users',
}

// Initialize localStorage with mock data
export function initializeMockData() {
  if (typeof window === 'undefined') return

  if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(initialCategories))
  }
  if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(initialProducts))
  }
  if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(initialOrders))
  }
  if (!localStorage.getItem(STORAGE_KEYS.STORIES)) {
    localStorage.setItem(STORAGE_KEYS.STORIES, JSON.stringify(initialStories))
  }
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(initialUsers))
  }
}

// Categories CRUD
export function getCategories(): Category[] {
  if (typeof window === 'undefined') return initialCategories
  const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES)
  return data ? JSON.parse(data) : initialCategories
}

export function getCategory(id: string): Category | undefined {
  return getCategories().find(c => c.id === id)
}

export function createCategory(data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Category {
  const category: Category = {
    ...data,
    id: generateId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  const categories = getCategories()
  categories.push(category)
  localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories))
  return category
}

export function updateCategory(id: string, data: Partial<Category>): Category | null {
  const categories = getCategories()
  const index = categories.findIndex(c => c.id === id)
  if (index === -1) return null
  categories[index] = { ...categories[index], ...data, updatedAt: new Date().toISOString() }
  localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories))
  return categories[index]
}

export function deleteCategory(id: string): boolean {
  const categories = getCategories()
  const filtered = categories.filter(c => c.id !== id)
  if (filtered.length === categories.length) return false
  localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(filtered))
  return true
}

// Products CRUD
export function getProducts(): Product[] {
  if (typeof window === 'undefined') return initialProducts
  const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS)
  const products: Product[] = data ? JSON.parse(data) : initialProducts
  const categories = getCategories()
  return products.map(p => ({
    ...p,
    category: categories.find(c => c.id === p.categoryId),
  }))
}

export function getProduct(id: string): Product | undefined {
  return getProducts().find(p => p.id === id)
}

export function createProduct(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product {
  const product: Product = {
    ...data,
    id: generateId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  const products = getProducts().map(p => {
    if (p.id === product.id) return product
    return p
  })
  if (!products.find(p => p.id === product.id)) {
    const rawProducts = getRawProducts()
    rawProducts.push(product)
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(rawProducts))
  }
  return product
}

function getRawProducts(): Product[] {
  if (typeof window === 'undefined') return initialProducts
  const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS)
  return data ? JSON.parse(data) : initialProducts
}

export function updateProduct(id: string, data: Partial<Product>): Product | null {
  const products = getRawProducts()
  const index = products.findIndex(p => p.id === id)
  if (index === -1) return null
  products[index] = { ...products[index], ...data, updatedAt: new Date().toISOString() }
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products))
  return { ...products[index], category: getCategories().find(c => c.id === products[index].categoryId) }
}

export function deleteProduct(id: string): boolean {
  const products = getRawProducts()
  const filtered = products.filter(p => p.id !== id)
  if (filtered.length === products.length) return false
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(filtered))
  return true
}

// Orders CRUD
export function getOrders(): Order[] {
  if (typeof window === 'undefined') return initialOrders
  const data = localStorage.getItem(STORAGE_KEYS.ORDERS)
  return data ? JSON.parse(data) : initialOrders
}

export function getOrder(id: string): Order | undefined {
  return getOrders().find(o => o.id === id)
}

export function updateOrder(id: string, data: Partial<Order>): Order | null {
  const orders = getOrders()
  const index = orders.findIndex(o => o.id === id)
  if (index === -1) return null
  orders[index] = { ...orders[index], ...data, updatedAt: new Date().toISOString() }
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders))
  return orders[index]
}

// Stories CRUD
export function getStories(): Story[] {
  if (typeof window === 'undefined') return initialStories
  const data = localStorage.getItem(STORAGE_KEYS.STORIES)
  return data ? JSON.parse(data) : initialStories
}

export function getStory(id: string): Story | undefined {
  return getStories().find(s => s.id === id)
}

export function createStory(data: Omit<Story, 'id' | 'createdAt' | 'updatedAt'>): Story {
  const story: Story = {
    ...data,
    id: generateId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  const stories = getStories()
  stories.push(story)
  localStorage.setItem(STORAGE_KEYS.STORIES, JSON.stringify(stories))
  return story
}

export function updateStory(id: string, data: Partial<Story>): Story | null {
  const stories = getStories()
  const index = stories.findIndex(s => s.id === id)
  if (index === -1) return null
  stories[index] = { ...stories[index], ...data, updatedAt: new Date().toISOString() }
  localStorage.setItem(STORAGE_KEYS.STORIES, JSON.stringify(stories))
  return stories[index]
}

export function deleteStory(id: string): boolean {
  const stories = getStories()
  const filtered = stories.filter(s => s.id !== id)
  if (filtered.length === stories.length) return false
  localStorage.setItem(STORAGE_KEYS.STORIES, JSON.stringify(filtered))
  return true
}

// Users CRUD
export function getUsers(): User[] {
  if (typeof window === 'undefined') return initialUsers
  const data = localStorage.getItem(STORAGE_KEYS.USERS)
  return data ? JSON.parse(data) : initialUsers
}

export function getUser(id: string): User | undefined {
  return getUsers().find(u => u.id === id)
}

export function updateUser(id: string, data: Partial<User>): User | null {
  const users = getUsers()
  const index = users.findIndex(u => u.id === id)
  if (index === -1) return null
  users[index] = { ...users[index], ...data, updatedAt: new Date().toISOString() }
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users))
  return users[index]
}

// Statistics helpers
export function getStats() {
  const products = getProducts()
  const orders = getOrders()
  const users = getUsers()

  const totalRevenue = orders
    .filter(o => o.paymentStatus === 'PAID')
    .reduce((sum, o) => sum + o.total, 0)

  const pendingOrders = orders.filter(o => o.status === 'PENDING').length

  const outOfStockProducts = products.filter(p => p.stock === 0).length

  // Orders by day for chart (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    return date.toISOString().split('T')[0]
  })

  const ordersByDay = last7Days.map(date => ({
    date,
    orders: orders.filter(o => o.createdAt.startsWith(date)).length,
    revenue: orders
      .filter(o => o.createdAt.startsWith(date) && o.paymentStatus === 'PAID')
      .reduce((sum, o) => sum + o.total, 0),
  }))

  // Top selling products (mock - based on order items)
  const productSales: Record<string, number> = {}
  orders.forEach(order => {
    order.items.forEach(item => {
      productSales[item.productId] = (productSales[item.productId] || 0) + item.quantity
    })
  })

  const topProducts = products
    .map(p => ({
      ...p,
      sales: productSales[p.id] || 0,
    }))
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 5)

  return {
    totalProducts: products.length,
    totalOrders: orders.length,
    totalUsers: users.filter(u => u.role === 'USER').length,
    totalRevenue,
    pendingOrders,
    outOfStockProducts,
    ordersByDay,
    topProducts,
  }
}

// Get orders count by user
export function getUserOrdersCount(userId: string): number {
  return getOrders().filter(o => o.userId === userId).length
}

// Get product count by category
export function getCategoryProductCount(categoryId: string): number {
  return getProducts().filter(p => p.categoryId === categoryId).length
}
