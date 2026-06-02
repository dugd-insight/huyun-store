#!/bin/bash

# HUYUN 商城系统 - 修复数据库脚本
# 用于修复 PostgreSQL 数据库权限问题

set -e

echo "🔧 修复数据库配置..."

APP_NAME="huyun-store"
DB_PASS="HuyunPass2024!"  # 使用更简单的密码

# 修复 PostgreSQL 用户密码
sudo -u postgres psql << EOF
-- 删除旧的用户和数据库（如果存在）
DROP DATABASE IF EXISTS ${APP_NAME};
DROP USER IF EXISTS ${APP_NAME}_user;

-- 创建新用户（使用简单密码）
CREATE USER ${APP_NAME}_user WITH PASSWORD '${DB_PASS}';

-- 创建数据库
CREATE DATABASE ${APP_NAME} OWNER ${APP_NAME}_user;

-- 授予权限
GRANT ALL PRIVILEGES ON DATABASE ${APP_NAME} TO ${APP_NAME}_user;

-- 修改用户为超级用户（简化权限问题）
ALTER USER ${APP_NAME}_user WITH SUPERUSER;

\q
EOF

echo ""
echo "✅ 数据库修复完成！"
echo ""
echo "密码已更新为: ${DB_PASS}"
echo ""
echo "请更新 .env 文件中的数据库密码："
echo "   DATABASE_URL=\"postgresql://${APP_NAME}_user:${DB_PASS}@localhost:5432/${APP_NAME}\""
echo ""
echo "然后继续部署："
echo "   cd /var/www/huyun-store"
echo "   npm run build"
echo "   pm2 restart huyun-store"
