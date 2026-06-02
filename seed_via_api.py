#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Seed database via API endpoints"""

import paramiko
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

HOST = "140.143.159.15"
PORT = 22
USERNAME = "ubuntu"
PASSWORD = "dugd&198778"

def run_cmd(client, cmd, sudo=False):
    if sudo:
        cmd = f"echo '{PASSWORD}' | sudo -S bash -c \"{cmd}\""
    stdin, stdout, stderr = client.exec_command(cmd, timeout=120)
    out = stdout.read().decode('utf-8', errors='ignore')
    err = stderr.read().decode('utf-8', errors='ignore')
    return out, err

def main():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(HOST, port=PORT, username=USERNAME, password=PASSWORD)

    # Create admin user first
    print("="*50)
    print("Step 1: Creating admin user...")
    print("="*50)

    admin_script = '''
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@huyun.com' },
    update: {},
    create: {
      email: 'admin@huyun.com',
      name: '管理员',
      password: hashedPassword,
      role: 'ADMIN',
    },
  })
  console.log('Admin user created:', admin.email)
}

main().catch(console.error).finally(() => prisma.$disconnect())
'''

    sftp = client.open_sftp()
    with sftp.open('/var/www/huyun-store/create-admin.js', 'w') as f:
        f.write(admin_script)
    sftp.close()

    out, err = run_cmd(client, "cd /var/www/huyun-store && node create-admin.js 2>&1", sudo=True)
    print(out)
    if err:
        print(f"Error: {err[:200]}")

    # Create categories via SQL
    print("="*50)
    print("Step 2: Creating categories...")
    print("="*50)

    sql_commands = [
        """INSERT INTO "Category" (id, name, slug, description, image, "createdAt", "updatedAt")
        VALUES ('cat1', '烙画葫芦', 'pyrography', '以火为墨，千年技艺', '/images/category-pyrography.jpg', NOW(), NOW())
        ON CONFLICT (slug) DO NOTHING;""",
        """INSERT INTO "Category" (id, name, slug, description, image, "createdAt", "updatedAt")
        VALUES ('cat2', '雕刻葫芦', 'carved', '精雕细琢，巧夺天工', '/images/category-carved.jpg', NOW(), NOW())
        ON CONFLICT (slug) DO NOTHING;""",
        """INSERT INTO "Category" (id, name, slug, description, image, "createdAt", "updatedAt")
        VALUES ('cat3', '彩绘葫芦', 'painted', '彩绘生辉，寓意吉祥', '/images/category-painted.jpg', NOW(), NOW())
        ON CONFLICT (slug) DO NOTHING;""",
        """INSERT INTO "Category" (id, name, slug, description, image, "createdAt", "updatedAt")
        VALUES ('cat4', '素葫芦', 'natural', '天然本色，返璞归真', '/images/category-natural.jpg', NOW(), NOW())
        ON CONFLICT (slug) DO NOTHING;""",
        """INSERT INTO "Category" (id, name, slug, description, image, "createdAt", "updatedAt")
        VALUES ('cat5', '葫芦茶具', 'teaset', '茶韵悠长，壶中天地', '/images/category-teaset.jpg', NOW(), NOW())
        ON CONFLICT (slug) DO NOTHING;""",
    ]

    for sql in sql_commands:
        cmd = f"sudo -u postgres psql -d huyun_store -c \"{sql}\""
        out, err = run_cmd(client, cmd, sudo=True)
        print(f"  {out.strip()[:100]}")

    # Create products
    print("\n" + "="*50)
    print("Step 3: Creating products...")
    print("="*50)

    products_sql = [
        """INSERT INTO "Product" (id, name, slug, description, price, "originalPrice", images, "categoryId", stock, "lowStockThreshold", status, featured, "createdAt", "updatedAt")
        VALUES ('prod1', '传统烙画山水葫芦', 'traditional-pyrography-landscape', '传统烙画山水葫芦，精美绝伦', 1280, 1580, ARRAY['/images/product-1.jpg'], 'cat1', 50, 5, 'ACTIVE', true, NOW(), NOW())
        ON CONFLICT (slug) DO NOTHING;""",
        """INSERT INTO "Product" (id, name, slug, description, price, "originalPrice", images, "categoryId", stock, "lowStockThreshold", status, featured, "createdAt", "updatedAt")
        VALUES ('prod2', '精雕双龙戏珠葫芦瓶', 'carved-dragon-gourd-vase', '精雕双龙戏珠葫芦瓶，工艺精湛', 2680, NULL, ARRAY['/images/product-2.jpg'], 'cat2', 30, 5, 'ACTIVE', true, NOW(), NOW())
        ON CONFLICT (slug) DO NOTHING;""",
        """INSERT INTO "Product" (id, name, slug, description, price, "originalPrice", images, "categoryId", stock, "lowStockThreshold", status, featured, "createdAt", "updatedAt")
        VALUES ('prod3', '彩绘福禄寿葫芦', 'painted-fortune-gourd', '彩绘福禄寿葫芦，寓意吉祥', 880, 1080, ARRAY['/images/product-3.jpg'], 'cat3', 100, 5, 'ACTIVE', true, NOW(), NOW())
        ON CONFLICT (slug) DO NOTHING;""",
        """INSERT INTO "Product" (id, name, slug, description, price, "originalPrice", images, "categoryId", stock, "lowStockThreshold", status, featured, "createdAt", "updatedAt")
        VALUES ('prod4', '天然素面大葫芦', 'natural-large-gourd', '天然素面大葫芦，返璞归真', 580, NULL, ARRAY['/images/product-4.jpg'], 'cat4', 200, 5, 'ACTIVE', true, NOW(), NOW())
        ON CONFLICT (slug) DO NOTHING;""",
        """INSERT INTO "Product" (id, name, slug, description, price, "originalPrice", images, "categoryId", stock, "lowStockThreshold", status, featured, "createdAt", "updatedAt")
        VALUES ('prod5', '镂空雕花葫芦灯', 'hollow-carved-gourd-lamp', '镂空雕花葫芦灯，精美绝伦', 2180, 2680, ARRAY['/images/product-5.jpg'], 'cat2', 20, 5, 'ACTIVE', true, NOW(), NOW())
        ON CONFLICT (slug) DO NOTHING;""",
        """INSERT INTO "Product" (id, name, slug, description, price, "originalPrice", images, "categoryId", stock, "lowStockThreshold", status, featured, "createdAt", "updatedAt")
        VALUES ('prod6', '烙画百鸟朝凤葫芦', 'pyrography-birds-gourd', '烙画百鸟朝凤葫芦，栩栩如生', 1880, NULL, ARRAY['/images/product-6.jpg'], 'cat1', 40, 5, 'ACTIVE', true, NOW(), NOW())
        ON CONFLICT (slug) DO NOTHING;""",
        """INSERT INTO "Product" (id, name, slug, description, price, "originalPrice", images, "categoryId", stock, "lowStockThreshold", status, featured, "createdAt", "updatedAt")
        VALUES ('prod7', '彩绘牡丹富贵葫芦', 'painted-peony-gourd', '彩绘牡丹富贵葫芦，富贵吉祥', 980, NULL, ARRAY['/images/product-7.jpg'], 'cat3', 80, 5, 'ACTIVE', true, NOW(), NOW())
        ON CONFLICT (slug) DO NOTHING;""",
        """INSERT INTO "Product" (id, name, slug, description, price, "originalPrice", images, "categoryId", stock, "lowStockThreshold", status, featured, "createdAt", "updatedAt")
        VALUES ('prod8', '葫芦茶具套装', 'gourd-teaset-collection', '葫芦茶具套装，茶韵悠长', 1680, 1980, ARRAY['/images/product-8.jpg'], 'cat5', 60, 5, 'ACTIVE', true, NOW(), NOW())
        ON CONFLICT (slug) DO NOTHING;""",
    ]

    for sql in products_sql:
        cmd = f"sudo -u postgres psql -d huyun_store -c \"{sql}\""
        out, err = run_cmd(client, cmd, sudo=True)
        print(f"  {out.strip()[:100]}")

    # Create stories
    print("\n" + "="*50)
    print("Step 4: Creating stories...")
    print("="*50)

    stories_sql = [
        """INSERT INTO "Story" (id, title, slug, content, excerpt, image, author, "publishedAt", "createdAt", "updatedAt")
        VALUES ('story1', '熊猫酒葫芦', 'panda-wine-gourd', '<p>在中国传统文化中，葫芦一直被视为吉祥的象征。而熊猫作为国宝，更是中华文化的代表。</p>', '国宝熊猫与葫芦酒器的奇妙结合，展现中华文化的独特魅力。', '/images/story-panda-wine-gourd.jpg', '葫韵工作室', NOW(), NOW(), NOW())
        ON CONFLICT (slug) DO NOTHING;""",
        """INSERT INTO "Story" (id, title, slug, content, excerpt, image, author, "publishedAt", "createdAt", "updatedAt")
        VALUES ('story2', '诗仙李白', 'li-bai', '<p>李白，字太白，号青莲居士，被誉为"诗仙"。他一生嗜酒如命，而葫芦便是他最钟爱的酒器。</p>', '诗仙李白与葫芦的千年情缘，酒中仙人的浪漫传说。', '/images/story-li-bai.jpg', '葫韵工作室', NOW(), NOW(), NOW())
        ON CONFLICT (slug) DO NOTHING;""",
        """INSERT INTO "Story" (id, title, slug, content, excerpt, image, author, "publishedAt", "createdAt", "updatedAt")
        VALUES ('story3', '武松打虎', 'wu-song', '<p>《水浒传》中武松打虎的故事家喻户晓。武松在景阳冈上赤手空拳打死猛虎的壮举，展现了中华民族勇武不屈的精神。</p>', '水浒英雄武松的经典故事，在葫芦上演绎传奇。', '/images/story-wu-song.jpg', '葫韵工作室', NOW(), NOW(), NOW())
        ON CONFLICT (slug) DO NOTHING;""",
        """INSERT INTO "Story" (id, title, slug, content, excerpt, image, author, "publishedAt", "createdAt", "updatedAt")
        VALUES ('story4', '八仙传说', 'eight-immortals', '<p>八仙是中国神话传说中的八位仙人，他们各自拥有独特的法器和神通。</p>', '八仙过海各显神通，葫芦承载着仙人的法力与智慧。', '/images/story-eight-immortals.jpg', '葫韵工作室', NOW(), NOW(), NOW())
        ON CONFLICT (slug) DO NOTHING;""",
        """INSERT INTO "Story" (id, title, slug, content, excerpt, image, author, "publishedAt", "createdAt", "updatedAt")
        VALUES ('story5', '纣王酒池', 'zhou-xin', '<p>商朝末年，纣王沉迷酒色，以葫芦为酒器，建造了著名的"酒池肉林"。</p>', '商纣王酒池肉林的奢靡传说，葫芦见证千年兴衰。', '/images/story-zhou-xin.jpg', '葫韵工作室', NOW(), NOW(), NOW())
        ON CONFLICT (slug) DO NOTHING;""",
    ]

    for sql in stories_sql:
        cmd = f"sudo -u postgres psql -d huyun_store -c \"{sql}\""
        out, err = run_cmd(client, cmd, sudo=True)
        print(f"  {out.strip()[:100]}")

    # Verify
    print("\n" + "="*50)
    print("Step 5: Verifying...")
    print("="*50)

    out, _ = run_cmd(client, "curl -s http://localhost:3000/api/categories | python3 -c 'import sys,json; d=json.load(sys.stdin); print(f\"Categories: {len(d)}\")'", sudo=False)
    print(f"  {out.strip()}")

    out, _ = run_cmd(client, "curl -s http://localhost:3000/api/products | python3 -c 'import sys,json; d=json.load(sys.stdin); print(f\"Products: {len(d[\\\"products\\\"])}\")'", sudo=False)
    print(f"  {out.strip()}")

    out, _ = run_cmd(client, "curl -s http://localhost:3000/api/stories | python3 -c 'import sys,json; d=json.load(sys.stdin); print(f\"Stories: {len(d[\\\"stories\\\"])}\")'", sudo=False)
    print(f"  {out.strip()}")

    # Check page content
    print("\n" + "="*50)
    print("Step 6: Checking page content...")
    print("="*50)

    out, _ = run_cmd(client, "curl -s http://localhost:3000/ | grep -c '工艺分类\\|精选作品\\|葫芦故事'", sudo=False)
    print(f"  Shop content matches: {out.strip()}")

    print("\n" + "="*50)
    print("[DONE] Database seeded!")
    print(f"[URL] http://{HOST}")
    print(f"[ADMIN] http://{HOST}/admin")
    print("[LOGIN] admin@huyun.com / admin123")
    print("="*50)

    client.close()

if __name__ == "__main__":
    main()
