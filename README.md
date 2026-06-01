# 葫韵 HUYUN - 专业葫芦工艺品商城系统

## 系统概述

基于 Next.js 14 + TypeScript + Prisma + PostgreSQL 构建的企业级电商系统，专注于中国传统葫芦工艺品销售。

## 技术架构

| 层级 | 技术栈 |
|------|--------|
| 前端框架 | Next.js 16 (App Router) + React 19 |
| 语言 | TypeScript 5 |
| 样式 | TailwindCSS 4 |
| 数据库 | PostgreSQL 15+ |
| ORM | Prisma 7 |
| 认证 | NextAuth.js 5 |
| 部署 | Docker / 云服务器 |

## 项目结构

```
huyun-store-pro/
├── prisma/
│   ├── schema.prisma      # 数据库模型定义
│   └── seed.ts            # 种子数据
├── src/
│   ├── app/               # Next.js App Router
│   │   ├── (shop)/        # 商店页面组
│   │   ├── api/           # API 路由
│   │   └── layout.tsx     # 根布局
│   ├── components/        # React 组件
│   ├── lib/               # 工具库
│   └── types/             # TypeScript 类型
├── public/                # 静态资源
├── docker-compose.yml     # Docker 部署配置
└── package.json
```

## 核心功能

### 已完成功能
- ✅ 多语言支持 (中/英/日/韩)
- ✅ 响应式设计 (PC/平板/手机)
- ✅ 产品分类与筛选
- ✅ 购物车 (支持游客模式)
- ✅ 用户认证 (邮箱/密码 + OAuth)
- ✅ 工艺故事板块
- ✅ 订单管理系统

### 待开发功能
- 🔄 支付集成 (支付宝/微信/Stripe)
- 🔄 管理员后台
- 🔄 库存管理
- 🔄 物流追踪

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
复制 `.env.example` 为 `.env`：

```env
# 数据库
DATABASE_URL="postgresql://用户名:密码@localhost:5432/huyun_store"

# NextAuth 密钥 (生成命令: openssl rand -base64 32)
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# OAuth 提供商 (可选)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# 支付配置 (待接入)
ALIPAY_APP_ID=""
WECHAT_PAY_MCH_ID=""
```

### 4. 初始化数据库
```bash
# 创建数据库
npx prisma migrate dev --name init

# 填充种子数据
npx prisma db seed
```

### 5. 启动开发服务器
```bash
npm run dev
```

访问 http://localhost:3000

## 生产部署

### 方式一：Docker 部署

```bash
# 构建并启动
docker-compose up -d

# 执行数据库迁移
docker-compose exec app npx prisma migrate deploy
```

### 方式二：云服务器部署 (推荐)

#### 1. 准备服务器
- 阿里云/腾讯云 ECS (2核4G起)
- CentOS 8 / Ubuntu 22.04
- 安装 Node.js 20, PostgreSQL 15, Nginx

#### 2. 部署步骤
```bash
# 克隆代码
git clone <your-repo> /var/www/huyun-store
cd /var/www/huyun-store

# 安装依赖
npm install --production

# 配置环境变量
vim .env

# 构建
npm run build

# 启动 (使用 PM2)
npm install -g pm2
pm2 start npm --name "huyun-store" -- start
```

#### 3. Nginx 配置
```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

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

## 数据库模型

### 核心实体

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  password  String?  // bcrypt 加密
  role      Role     @default(USER)
  carts     Cart[]
  orders    Order[]
}

model Product {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  description String?
  price       Decimal  @db.Decimal(10, 2)
  stock       Int      @default(0)
  images      String[]
  category    Category @relation(fields: [categoryId], references: [id])
  isFeatured  Boolean  @default(false)
  status      Status   @default(ACTIVE)
}

model Order {
  id            String      @id @default(cuid())
  user          User        @relation(fields: [userId], references: [id])
  items         OrderItem[]
  total         Decimal     @db.Decimal(10, 2)
  status        OrderStatus @default(PENDING)
  paymentStatus PaymentStatus @default(UNPAID)
}
```

## API 接口文档

### 产品接口
```
GET    /api/products          # 获取产品列表
GET    /api/products/:id      # 获取产品详情
POST   /api/products          # 创建产品 (Admin)
PUT    /api/products/:id      # 更新产品 (Admin)
DELETE /api/products/:id      # 删除产品 (Admin)
```

### 购物车接口
```
GET    /api/cart              # 获取购物车
POST   /api/cart              # 添加商品
PUT    /api/cart/:itemId      # 更新数量
DELETE /api/cart/:itemId      # 删除商品
```

### 订单接口
```
GET    /api/orders            # 获取订单列表
POST   /api/orders            # 创建订单
GET    /api/orders/:id        # 获取订单详情
```

## 扩展开发

### 添加新语言
1. 在 `src/i18n/messages/` 创建翻译文件
2. 在 `src/i18n/config.ts` 添加语言配置

### 添加支付方式
1. 在 `src/lib/payment/` 创建支付提供商适配器
2. 在 `src/app/api/payment/` 添加支付回调接口
3. 在订单流程中集成支付确认

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
# PM2 日志
pm2 logs huyun-store

# Nginx 日志
tail -f /var/log/nginx/access.log
```

## 许可证

MIT License

## 联系方式

- 邮箱: hello@huyun.com
- 官网: https://huyun.com
