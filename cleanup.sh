#!/bin/bash

# HUYUN 商城系统 - 完全清理脚本
# 使用方法: chmod +x cleanup.sh && sudo ./cleanup.sh

set -e

echo "⚠️  开始清理 HUYUN 商城系统..."

APP_NAME="huyun-store"
APP_DIR="/var/www/$APP_NAME"

# 检查是否以root运行
if [ "$EUID" -ne 0 ]; then 
   echo "请使用 sudo 运行此脚本"
   exit 1
fi

# 1. 停止并删除 PM2 进程
echo "🛑 停止 PM2 进程..."
pm2 stop $APP_NAME 2>/dev/null || true
pm2 delete $APP_NAME 2>/dev/null || true
pm2 save 2>/dev/null || true

# 2. 删除应用目录
echo "📁 删除应用目录..."
rm -rf $APP_DIR

# 3. 清理 Nginx 配置
echo "🌐 清理 Nginx 配置..."
rm -f /etc/nginx/sites-available/$APP_NAME
rm -f /etc/nginx/sites-enabled/$APP_NAME
nginx -t && systemctl reload nginx 2>/dev/null || true

# 4. 清理数据库
echo "🗄️  清理数据库..."
sudo -u postgres psql << 'EOF'
DROP DATABASE IF EXISTS $APP_NAME;
DROP USER IF EXISTS $APP_NAME_user;
\q
EOF

# 5. 清理残留文件
echo "🧹 清理残留文件..."
rm -f /root/.pm2/logs/$APP_NAME* 2>/dev/null || true
rm -f /root/.pm2/dump.pm2 2>/dev/null || true

echo ""
echo "✅ 清理完成！"
echo ""
echo "现在可以重新部署："
echo "   curl -O https://raw.githubusercontent.com/dugd-insight/huyun-store/main/deploy.sh"
echo "   chmod +x deploy.sh"
echo "   sudo ./deploy.sh"
