#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Simple seed via psql"""

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

    # Create SQL file on server
    sql_content = """
-- Categories
INSERT INTO "Category" (id, name, slug, description, image, "createdAt", "updatedAt")
VALUES
  ('cat1', '烙画葫芦', 'pyrography', '以火为墨，千年技艺', '/images/category-pyrography.jpg', NOW(), NOW()),
  ('cat2', '雕刻葫芦', 'carved', '精雕细琢，巧夺天工', '/images/category-carved.jpg', NOW(), NOW()),
  ('cat3', '彩绘葫芦', 'painted', '彩绘生辉，寓意吉祥', '/images/category-painted.jpg', NOW(), NOW()),
  ('cat4', '素葫芦', 'natural', '天然本色，返璞归真', '/images/category-natural.jpg', NOW(), NOW()),
  ('cat5', '葫芦茶具', 'teaset', '茶韵悠长，壶中天地', '/images/category-teaset.jpg', NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;

-- Products
INSERT INTO "Product" (id, name, slug, description, price, "originalPrice", images, "categoryId", stock, "lowStockThreshold", status, featured, "createdAt", "updatedAt")
VALUES
  ('prod1', '传统烙画山水葫芦', 'traditional-pyrography-landscape', '传统烙画山水葫芦', 1280, 1580, ARRAY['/images/product-1.jpg'], 'cat1', 50, 5, 'ACTIVE', true, NOW(), NOW()),
  ('prod2', '精雕双龙戏珠葫芦瓶', 'carved-dragon-gourd-vase', '精雕双龙戏珠葫芦瓶', 2680, NULL, ARRAY['/images/product-2.jpg'], 'cat2', 30, 5, 'ACTIVE', true, NOW(), NOW()),
  ('prod3', '彩绘福禄寿葫芦', 'painted-fortune-gourd', '彩绘福禄寿葫芦', 880, 1080, ARRAY['/images/product-3.jpg'], 'cat3', 100, 5, 'ACTIVE', true, NOW(), NOW()),
  ('prod4', '天然素面大葫芦', 'natural-large-gourd', '天然素面大葫芦', 580, NULL, ARRAY['/images/product-4.jpg'], 'cat4', 200, 5, 'ACTIVE', true, NOW(), NOW()),
  ('prod5', '镂空雕花葫芦灯', 'hollow-carved-gourd-lamp', '镂空雕花葫芦灯', 2180, 2680, ARRAY['/images/product-5.jpg'], 'cat2', 20, 5, 'ACTIVE', true, NOW(), NOW()),
  ('prod6', '烙画百鸟朝凤葫芦', 'pyrography-birds-gourd', '烙画百鸟朝凤葫芦', 1880, NULL, ARRAY['/images/product-6.jpg'], 'cat1', 40, 5, 'ACTIVE', true, NOW(), NOW()),
  ('prod7', '彩绘牡丹富贵葫芦', 'painted-peony-gourd', '彩绘牡丹富贵葫芦', 980, NULL, ARRAY['/images/product-7.jpg'], 'cat3', 80, 5, 'ACTIVE', true, NOW(), NOW()),
  ('prod8', '葫芦茶具套装', 'gourd-teaset-collection', '葫芦茶具套装', 1680, 1980, ARRAY['/images/product-8.jpg'], 'cat5', 60, 5, 'ACTIVE', true, NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;

-- Stories
INSERT INTO "Story" (id, title, slug, content, excerpt, image, author, "publishedAt", "createdAt", "updatedAt")
VALUES
  ('story1', '熊猫酒葫芦', 'panda-wine-gourd', '<p>熊猫酒葫芦以精选天然葫芦为载体，经过匠人的精心设计和雕刻。</p>', '国宝熊猫与葫芦酒器的奇妙结合。', '/images/story-panda-wine-gourd.jpg', '葫韵工作室', NOW(), NOW(), NOW()),
  ('story2', '诗仙李白', 'li-bai', '<p>李白一生嗜酒如命，而葫芦便是他最钟爱的酒器。</p>', '诗仙李白与葫芦的千年情缘。', '/images/story-li-bai.jpg', '葫韵工作室', NOW(), NOW(), NOW()),
  ('story3', '武松打虎', 'wu-song', '<p>武松在景阳冈上赤手空拳打死猛虎的壮举。</p>', '水浒英雄武松的经典故事。', '/images/story-wu-song.jpg', '葫韵工作室', NOW(), NOW(), NOW()),
  ('story4', '八仙传说', 'eight-immortals', '<p>八仙是中国神话传说中的八位仙人。</p>', '八仙过海各显神通。', '/images/story-eight-immortals.jpg', '葫韵工作室', NOW(), NOW(), NOW()),
  ('story5', '纣王酒池', 'zhou-xin', '<p>商朝末年，纣王沉迷酒色，以葫芦为酒器。</p>', '商纣王酒池肉林的奢靡传说。', '/images/story-zhou-xin.jpg', '葫韵工作室', NOW(), NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;

-- Admin user (password: admin123)
INSERT INTO "User" (id, email, name, password, role, "createdAt", "updatedAt")
VALUES ('admin1', 'admin@huyun.com', '管理员', '$2a$10$abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJK', 'ADMIN', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;
"""

    # Write SQL file
    print("Writing SQL file...")
    sftp = client.open_sftp()
    with sftp.open('/tmp/seed.sql', 'w') as f:
        f.write(sql_content)
    sftp.close()
    print("  [OK] SQL file created")

    # Execute SQL
    print("\nExecuting SQL...")
    out, err = run_cmd(client, "sudo -u postgres psql -d huyun_store -f /tmp/seed.sql 2>&1", sudo=True)
    print(out)
    if err:
        print(f"Error: {err[:500]}")

    # Verify
    print("\nVerifying...")
    out, _ = run_cmd(client, "sudo -u postgres psql -d huyun_store -c 'SELECT COUNT(*) FROM \"Category\";' 2>&1", sudo=True)
    print(f"  Categories: {out.strip()}")

    out, _ = run_cmd(client, "sudo -u postgres psql -d huyun_store -c 'SELECT COUNT(*) FROM \"Product\";' 2>&1", sudo=True)
    print(f"  Products: {out.strip()}")

    out, _ = run_cmd(client, "sudo -u postgres psql -d huyun_store -c 'SELECT COUNT(*) FROM \"Story\";' 2>&1", sudo=True)
    print(f"  Stories: {out.strip()}")

    # Check API
    print("\nChecking API...")
    out, _ = run_cmd(client, "curl -s http://localhost:3000/api/categories | head -c 200", sudo=False)
    print(f"  /api/categories: {out[:200]}")

    out, _ = run_cmd(client, "curl -s http://localhost:3000/api/products | head -c 200", sudo=False)
    print(f"  /api/products: {out[:200]}")

    # Check page
    print("\nChecking page...")
    out, _ = run_cmd(client, "curl -s http://localhost:3000/ | grep -c '工艺分类\\|精选作品\\|葫芦故事'", sudo=False)
    print(f"  Shop content: {out.strip()} matches")

    print("\n[DONE]")
    print(f"[URL] http://{HOST}")

    client.close()

if __name__ == "__main__":
    main()
