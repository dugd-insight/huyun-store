# 葫韵 HUYUN - 专业葫芦工艺品跨境电商商城

<p align="center">
  <strong>中国传统葫芦工艺品跨境电商平台</strong><br>
  Next.js 16 + TypeScript + Prisma + PostgreSQL
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/TypeScript-5-blue?logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma" alt="Prisma">
  <img src="https://img.shields.io/badge/PostgreSQL-15-336791?logo=postgresql" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/TailwindCSS-4-06B6D4?logo=tailwindcss" alt="TailwindCSS">
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License">
</p>

---

## 系统概述

基于 Next.js 16 + TypeScript + Prisma + PostgreSQL 构建的企业级跨境电商系统，专注于中国传统葫芦工艺品（聊城葫芦）的全球销售。系统包含完整的前台商城、Admin 管理后台、支付集成、库存管理和物流追踪功能。

## 功能特性

### 🛒 前台商城
- ✅ 响应式设计 (PC/平板/手机)
- ✅ 多语言支持 (中文/English/日本語/한국어)
- ✅ 产品分类与筛选
- ✅ 购物车 (支持游客模式)
- ✅ 用户认证 (邮箱/密码 + Google OAuth)
- ✅ 工艺故事板块 (葫芦文化故事)
- ✅ SEO 优化 (SSR/SSG)

### 🖥️ Admin 管理后台 (`/admin`)
- ✅ 数据统计仪表盘
- ✅ 商品管理 (增删改查、上下架、推荐)
- ✅ 分类管理
- ✅ 故事管理 (发布/编辑/下架)
- ✅ 订单管理 (状态流转、发货处理)
- ✅ 用户管理 (角色权限)
- ✅ 库存管理仪表盘

### 💳 支付集成
- ✅ 支付宝 (扫码支付、查询、退款)
- ✅ 微信支付 (Native/JSAPI/H5)
- ✅ Stripe (国际信用卡、多币种)
- ✅ 统一 Webhook 回调处理
- ✅ Mock 演示模式 (无密钥可体验)

### 📦 库存管理
- ✅ 库存实时查询
- ✅ 入库/出库调整
- ✅ 低库存预警 (可设阈值)
- ✅ 库存操作日志
- ✅ 下单时自动校验库存

### 🚚 物流追踪
- ✅ 顺丰速运 / 圆通快递 / 中通快递
- ✅ 物流轨迹时间线展示
- ✅ 承运商 Webhook 回调
- ✅ 批量发货功能
- ✅ Mock 模拟轨迹

## 技术架构

```
┌─────────────────────────────────────────────────────────────┐
│                        前端层                                │
│  Next.js 16 (App Router) + React 19 + TypeScript 5          │
│  TailwindCSS 4 + Lucide Icons                               │
│  SSR/SSG 服务端渲染 | 多语言 i18n | 响应式设计               │
├─────────────────────────────────────────────────────────────┤
│                        API 层                                │
│  Next.js API Routes (RESTful)                                │
│  NextAuth.js 5 (JWT + Session)                               │
│  支付宝 / 微信支付 / Stripe Webhook                           │
├─────────────────────────────────────────────────────────────┤
│                        数据层                                │
│  Prisma 7 ORM + PostgreSQL 15+                              │
│  类型安全 | 自动迁移 | 数据校验                              │
├─────────────────────────────────────────────────────────────┤
│                        基础设施                              │
│  Docker / Nginx / PM2 / 阿里云OSS                            │
│  GitHub Actions CI/CD (可扩展)                               │
└─────────────────────────────────────────────────────────────┘
```

## 项目结构

```
huyun-store-pro/
├── prisma/
│   ├── schema.prisma              # 数据库模型定义
│   └── config.ts                  # Prisma 配置
├── src/
│   ├── app/
│   │   ├── (shop)/                # 前台商城页面
│   │   │   ├── page.tsx           # 首页
│   │   │   ├── products/          # 产品列表
│   │   │   ├── stories/           # 工艺故事
│   │   │   └── layout.tsx         # 商城布局
│   │   ├── admin/                 # Admin 管理后台
│   │   │   ├── page.tsx           # 仪表盘
│   │   │   ├── products/          # 商品管理
│   │   │   ├── categories/        # 分类管理
│   │   │   ├── stories/           # 故事管理
│   │   │   ├── orders/            # 订单管理
│   │   │   ├── users/             # 用户管理
│   │   │   ├── inventory/         # 库存管理
│   │   │   ├── dashboard/         # 数据统计
│   │   │   └── layout.tsx         # Admin 布局
│   │   └── api/                   # API 路由
│   │       ├── auth/              # 认证接口
│   │       ├── products/          # 产品接口
│   │       ├── categories/        # 分类接口
│   │       ├── cart/              # 购物车接口
│   │       ├── orders/            # 订单接口
│   │       ├── stories/           # 故事接口
│   │       ├── payment/           # 支付接口
│   │       │   ├── alipay/        # 支付宝
│   │       │   ├── wechatpay/     # 微信支付
│   │       │   ├── stripe/        # Stripe
│   │       │   └── webhook/       # 统一回调
│   │       ├── inventory/         # 库存接口
│   │       └── logistics/         # 物流接口
│   ├── components/
│   │   ├── layout/                # Header, Footer
│   │   ├── product/               # ProductCard, CategoryFilter
│   │   ├── cart/                  # CartDrawer
│   │   ├── payment/               # PaymentMethods, QRCode, CardForm
│   │   ├── logistics/             # TrackingForm, TrackingResult
│   │   └── ui/                    # 通用UI组件
│   ├── lib/
│   │   ├── payment/               # 支付服务 (alipay/wechatpay/stripe)
│   │   ├── inventory/             # 库存服务
│   │   ├── logistics/             # 物流服务
│   │   ├── admin/                 # Admin工具库
│   │   ├── prisma.ts              # Prisma 客户端
│   │   └── utils.ts               # 工具函数
│   ├── i18n/                      # 多语言配置
│   │   ├── config.ts
│   │   └── messages/              # zh/en/ja/ko 翻译文件
│   └── types/                     # TypeScript 类型定义
├── public/                        # 静态资源
├── .env.example                  # 环境变量示例
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## 快速开始

### 1. 环境要求
- Node.js 20+
- PostgreSQL 15+
- npm 或 yarn

### 2. 安装依赖
```bash
cd huyun-store-pro
npm install
```

### 3. 配置环境变量
```bash
cp .env.example .env
```

编辑 `.env`：
```env
# ===== 数据库 =====
DATABASE_URL="postgresql://user:password@localhost:5432/huyun_store"

# ===== NextAuth =====
NEXTAUTH_SECRET="your-secret-key"          # openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"

# ===== OAuth (可选) =====
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# ===== 支付宝 =====
ALIPAY_APP_ID=""
ALIPAY_PRIVATE_KEY=""
ALIPAY_PUBLIC_KEY=""
ALIPAY_NOTIFY_URL="https://your-domain.com/api/payment/webhook"

# ===== 微信支付 =====
WECHAT_PAY_MCH_ID=""
WECHAT_PAY_API_KEY=""
WECHAT_PAY_APP_ID=""
WECHAT_PAY_NOTIFY_URL="https://your-domain.com/api/payment/webhook"

# ===== Stripe (国际支付) =====
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""
STRIPE_PUBLISHABLE_KEY=""

# ===== 物流 =====
SF_APP_ID=""           # 顺丰
SF_APP_KEY=""
YTO_API_KEY=""         # 圆通
ZTO_API_KEY=""         # 中通
```

> 💡 **无密钥时自动进入 Mock 演示模式**，可完整体验所有功能。

### 4. 初始化数据库
```bash
npx prisma migrate dev --name init
npx prisma db seed
```

### 5. 启动开发服务器
```bash
npm run dev
```

| 入口 | 地址 | 说明 |
|------|------|------|
| 前台商城 | http://localhost:3000 | 用户端商城 |
| Admin 后台 | http://localhost:3000/admin | 管理后台 |
| API 文档 | http://localhost:3000/api | RESTful API |

## 数据库模型

### ER 关系图

```
User ─────┬──── Cart ──── CartItem ──── Product ──── Category
          │
          ├──── Order ──── OrderItem ──── Product
          │
          └──── StockAlert ──── Product

Product ──── InventoryLog
Order ────── Shipment
Story (独立)
```

### 核心模型

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  password  String?
  role      Role     @default(USER)
}

model Product {
  id                String   @id @default(cuid())
  name              String
  slug              String   @unique
  price             Decimal  @db.Decimal(10, 2)
  stock             Int      @default(0)
  lowStockThreshold Int      @default(10)
  images            String[]
  isFeatured        Boolean  @default(false)
  status            Status   @default(ACTIVE)
  category          Category @relation(fields: [categoryId], references: [id])
}

model Order {
  id            String        @id @default(cuid())
  total         Decimal       @db.Decimal(10, 2)
  status        OrderStatus   @default(PENDING)
  paymentStatus PaymentStatus @default(UNPAID)
  paymentMethod String?
  trackingNumber String?
  carrier        String?
}

model InventoryLog {
  id        String          @id @default(cuid())
  product   Product         @relation(fields: [productId], references: [id])
  type      InventoryType
  quantity  Int
  reason    String?
}

model Shipment {
  id          String   @id @default(cuid())
  order       Order    @relation(fields: [orderId], references: [id])
  carrier     String
  trackingNumber String
  status      String
}
```

## API 接口文档

### 产品
```
GET    /api/products              # 产品列表 (?category=&search=&page=)
GET    /api/products/:slug        # 产品详情
POST   /api/products              # 创建产品 [Admin]
PUT    /api/products/:slug        # 更新产品 [Admin]
DELETE /api/products/:slug        # 删除产品 [Admin]
```

### 购物车
```
GET    /api/cart                  # 获取购物车
POST   /api/cart                  # 添加商品
PUT    /api/cart/:itemId          # 更新数量
DELETE /api/cart/:itemId          # 删除商品
```

### 订单
```
GET    /api/orders                # 订单列表
POST   /api/orders                # 创建订单
GET    /api/orders/:id            # 订单详情
PUT    /api/orders/:id            # 更新订单状态 [Admin]
```

### 支付
```
POST   /api/payment/alipay/create     # 创建支付宝订单
POST   /api/payment/wechatpay/create  # 创建微信支付订单
POST   /api/payment/stripe/create     # 创建Stripe支付
POST   /api/payment/webhook           # 统一支付回调
```

### 库存
```
GET    /api/inventory            # 库存概览
POST   /api/inventory/adjust     # 库存调整 (入库/出库)
GET    /api/inventory/alert      # 低库存预警
GET    /api/inventory/logs       # 操作日志
```

### 物流
```
GET    /api/logistics/track      # 物流查询 (?number=&carrier=)
GET    /api/logistics/carriers   # 承运商列表
POST   /api/logistics/webhook    # 物流状态回调
```

## 生产部署

### Docker 部署

```bash
docker-compose up -d
docker-compose exec app npx prisma migrate deploy
```

### 云服务器部署 (阿里云/腾讯云)

```bash
# 1. 克隆代码
git clone https://github.com/dugd-insight/huyun-store.git /var/www/huyun-store
cd /var/www/huyun-store

# 2. 安装依赖
npm install --production

# 3. 配置环境变量
vim .env

# 4. 构建
npm run build

# 5. 启动
pm2 start npm --name "huyun-store" -- start
```

### Nginx 反向代理

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # 支付回调超时设置
    location /api/payment/webhook {
        proxy_pass http://localhost:3000;
        proxy_read_timeout 30s;
    }

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 订单流程

```
用户浏览 → 加入购物车 → 提交订单 → 选择支付 → 支付成功
    │           │            │           │           │
    │           │            │           │      ┌────┴────┐
    │           │            │           │      │ 扣减库存 │
    │           │            │           │      │ 创建发货单│
    │           │            │           │      └────┬────┘
    │           │            │           │           │
    │           │       库存校验 ←───────┘      物流追踪
    │           │       (不足则拦截)
    │           │
    │      ┌────┴────┐
    │      │游客模式  │ → localStorage
    │      │登录用户  │ → 数据库同步
    │      └─────────┘
```

## 扩展开发

### 添加新语言
1. 在 `src/i18n/messages/` 创建翻译文件 (如 `fr.json`)
2. 在 `src/i18n/config.ts` 添加语言配置

### 添加支付方式
1. 在 `src/lib/payment/` 创建支付适配器
2. 在 `src/app/api/payment/` 添加 API 路由
3. 在 `src/components/payment/` 添加 UI 组件

### 添加物流承运商
1. 在 `src/lib/logistics/carriers/` 创建适配器
2. 在 `src/lib/logistics/service.ts` 注册承运商

## 维护指南

### 数据库备份
```bash
# 手动备份
pg_dump -U postgres huyun_store > backup_$(date +%Y%m%d).sql

# 自动备份 (crontab)
0 2 * * * pg_dump -U postgres huyun_store | gzip > /backup/db_$(date +\%Y\%m\%d).sql.gz
```

### 日志查看
```bash
pm2 logs huyun-store          # 应用日志
tail -f /var/log/nginx/access.log  # Nginx日志
```

## 许可证

[MIT License](LICENSE)

## 联系方式

- 📧 邮箱: hello@huyun.com
- 🌐 官网: https://huyun.com
- 📦 仓库: https://github.com/dugd-insight/huyun-store
