#!/bin/bash

# HUYUN 葫韵商城系统 - 一键部署脚本
# 使用方法: chmod +x deploy.sh && ./deploy.sh

set -e

echo "🚀 开始部署 HUYUN 商城系统..."

# 配置变量
APP_NAME="huyun-store"
APP_DIR="/var/www/$APP_NAME"
NODE_VERSION="20"
APP_PORT="3000"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查是否以root运行
if [ "$EUID" -ne 0 ]; then 
   echo -e "${RED}请使用 sudo 运行此脚本${NC}"
   exit 1
fi

echo -e "${YELLOW}步骤 1/10: 更新系统...${NC}"
apt-get update -qq

echo -e "${YELLOW}步骤 2/10: 安装 Node.js $NODE_VERSION...${NC}"
if ! command -v node &> /dev/null || [ "$(node -v | cut -d'v' -f2 | cut -d'.' -f1)" != "$NODE_VERSION" ]; then
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
    apt-get install -y nodejs
fi
node -v
npm -v

echo -e "${YELLOW}步骤 3/10: 安装 PM2...${NC}"
npm install -g pm2

echo -e "${YELLOW}步骤 4/10: 安装 PostgreSQL...${NC}"
if ! command -v psql &> /dev/null; then
    apt-get install -y postgresql postgresql-contrib
    systemctl start postgresql
    systemctl enable postgresql
fi

echo -e "${YELLOW}步骤 5/10: 安装 Nginx...${NC}"
if ! command -v nginx &> /dev/null; then
    apt-get install -y nginx
    systemctl start nginx
    systemctl enable nginx
fi

echo -e "${YELLOW}步骤 6/10: 创建数据库...${NC}"
sudo -u postgres psql << EOF
CREATE DATABASE ${APP_NAME};
CREATE USER ${APP_NAME}_user WITH PASSWORD 'huyun_password_2024';
GRANT ALL PRIVILEGES ON DATABASE ${APP_NAME} TO ${APP_NAME}_user;
\q
EOF

echo -e "${YELLOW}步骤 7/10: 克隆代码...${NC}"
if [ -d "$APP_DIR" ]; then
    echo "目录已存在，更新代码..."
    cd $APP_DIR
    git pull origin main
else
    mkdir -p /var/www
    cd /var/www
    git clone https://github.com/dugd-insight/huyun-store.git $APP_NAME
    cd $APP_DIR
fi

echo -e "${YELLOW}步骤 8/10: 安装依赖并构建...${NC}"
cd $APP_DIR
npm install

# 创建环境变量文件
cat > .env << EOF
# Database
DATABASE_URL="postgresql://${APP_NAME}_user:huyun_password_2024@localhost:5432/${APP_NAME}"

# NextAuth
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
NEXTAUTH_URL="http://localhost:${APP_PORT}"

# 支付配置（生产环境需替换为真实密钥）
# ALIPAY_APP_ID=""
# ALIPAY_PRIVATE_KEY=""
# WECHAT_PAY_MCH_ID=""
# STRIPE_SECRET_KEY=""
EOF

# 数据库迁移
npx prisma migrate deploy
npx prisma generate

# 构建
npm run build

echo -e "${YELLOW}步骤 9/10: 配置 PM2...${NC}"
pm2 delete $APP_NAME 2>/dev/null || true
pm2 start npm --name "$APP_NAME" -- start
pm2 save
pm2 startup systemd

echo -e "${YELLOW}步骤 10/10: 配置 Nginx...${NC}"
cat > /etc/nginx/sites-available/$APP_NAME << 'EOF'
server {
    listen 80;
    server_name _;  # 接受所有域名

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # 支付回调需要较长超时
    location /api/payment/webhook {
        proxy_pass http://localhost:3000;
        proxy_read_timeout 60s;
        proxy_connect_timeout 60s;
    }
}
EOF

ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

echo -e "${GREEN}✅ 部署完成！${NC}"
echo ""
echo -e "${GREEN}🌐 访问地址:${NC}"
echo "   前台商城: http://$(curl -s ifconfig.me)"
echo "   Admin后台: http://$(curl -s ifconfig.me)/admin"
echo ""
echo -e "${YELLOW}📋 常用命令:${NC}"
echo "   查看日志: pm2 logs $APP_NAME"
echo "   重启应用: pm2 restart $APP_NAME"
echo "   停止应用: pm2 stop $APP_NAME"
echo "   更新代码: cd $APP_DIR && git pull && npm run build && pm2 restart $APP_NAME"
echo ""
echo -e "${YELLOW}⚠️  注意:${NC}"
echo "   - 数据库: PostgreSQL, 用户: ${APP_NAME}_user, 数据库: ${APP_NAME}"
echo "   - 应用运行在端口: $APP_PORT"
echo "   - 首次访问需要等待应用启动（约10-30秒）"
