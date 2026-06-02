#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Complete fix - recreate tables, rebuild, restart"""

import paramiko
import sys
import io
import os

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

HOST = "140.143.159.15"
PORT = 22
USERNAME = "ubuntu"
PASSWORD = "dugd&198778"

LOCAL_BASE = "D:/CodeBuddy/huyun/huyun-store"
REMOTE_BASE = "/var/www/huyun-store"

def run_cmd(client, cmd, sudo=False):
    if sudo:
        cmd = f"echo '{PASSWORD}' | sudo -S bash -c \"{cmd}\""
    stdin, stdout, stderr = client.exec_command(cmd, timeout=300)
    out = stdout.read().decode('utf-8', errors='ignore')
    err = stderr.read().decode('utf-8', errors='ignore')
    return out, err

def main():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(HOST, port=PORT, username=USERNAME, password=PASSWORD)

    # Step 1: Stop PM2
    print("="*50)
    print("Step 1: Stopping PM2...")
    print("="*50)
    run_cmd(client, "pm2 stop huyun-store", sudo=False)

    # Step 2: Check database tables
    print("\nStep 2: Checking database...")
    out, _ = run_cmd(client, "sudo -u postgres psql -d huyun_store -c '\\dt' 2>&1", sudo=True)
    print(out)

    # Step 3: Drop and recreate database
    print("\nStep 3: Recreating database...")
    run_cmd(client, "sudo -u postgres psql -c 'DROP DATABASE IF EXISTS huyun_store;'", sudo=True)
    run_cmd(client, "sudo -u postgres psql -c 'CREATE DATABASE huyun_store OWNER huyun_store_user;'", sudo=True)
    run_cmd(client, "sudo -u postgres psql -c 'GRANT ALL PRIVILEGES ON DATABASE huyun_store TO huyun_store_user;'", sudo=True)
    print("  [OK] Database recreated")

    # Step 4: Upload all source files
    print("\nStep 4: Uploading source files...")
    sftp = client.open_sftp()

    files_to_upload = [
        "src/app/(shop)/page.tsx",
        "src/app/(shop)/products/page.tsx",
        "src/app/(shop)/stories/page.tsx",
        "src/app/(shop)/stories/[slug]/page.tsx",
        "src/app/api/auth/[...nextauth]/route.ts",
        "src/app/api/categories/route.ts",
        "src/app/api/orders/route.ts",
        "src/app/api/products/route.ts",
        "src/app/api/products/[slug]/route.ts",
        "src/app/api/stories/route.ts",
        "src/app/api/stories/[slug]/route.ts",
        "src/components/home/HomeClient.tsx",
        "src/components/product/ProductsFilterClient.tsx",
        "src/components/ui/StoryModal.tsx",
        "src/lib/auth.ts",
        "src/types/dompurify.d.ts",
        "package.json",
    ]

    for rel_path in files_to_upload:
        local_path = os.path.join(LOCAL_BASE, rel_path).replace("\\", "/")
        remote_path = f"{REMOTE_BASE}/{rel_path}"
        try:
            # Ensure directory exists
            remote_dir = os.path.dirname(remote_path)
            try:
                sftp.stat(remote_dir)
            except:
                run_cmd(client, f"mkdir -p {remote_dir}", sudo=True)

            sftp.put(local_path, remote_path)
            print(f"  [OK] {rel_path}")
        except Exception as e:
            print(f"  [FAIL] {rel_path}: {e}")

    sftp.close()

    # Step 5: Delete old page.tsx if it exists
    print("\nStep 5: Cleaning up old files...")
    run_cmd(client, f"rm -f {REMOTE_BASE}/src/app/page.tsx", sudo=True)
    print("  [OK] Removed old page.tsx")

    # Step 6: Fix ownership
    print("\nStep 6: Fixing ownership...")
    run_cmd(client, f"chown -R ubuntu:ubuntu {REMOTE_BASE}/src", sudo=True)
    run_cmd(client, f"chown -R ubuntu:ubuntu {REMOTE_BASE}/package.json", sudo=True)

    # Step 7: Install dependencies
    print("\nStep 7: Installing dependencies...")
    out, _ = run_cmd(client, f"cd {REMOTE_BASE} && npm install 2>&1 | tail -5", sudo=True)
    print(out)

    # Step 8: Run Prisma db push
    print("\nStep 8: Creating database tables...")
    out, err = run_cmd(client, f"cd {REMOTE_BASE} && npx prisma db push 2>&1", sudo=False)
    print(out)
    if err:
        print(f"Error: {err[:500]}")

    # Step 9: Generate Prisma client
    print("\nStep 9: Generating Prisma client...")
    out, _ = run_cmd(client, f"cd {REMOTE_BASE} && npx prisma generate 2>&1", sudo=False)
    print(out[:500])

    # Step 10: Delete .next cache
    print("\nStep 10: Cleaning build cache...")
    run_cmd(client, f"rm -rf {REMOTE_BASE}/.next", sudo=True)
    print("  [OK] .next directory removed")

    # Step 11: Rebuild
    print("\nStep 11: Rebuilding app...")
    out, err = run_cmd(client, f"cd {REMOTE_BASE} && npm run build 2>&1", sudo=False)
    print(out[-3000:] if len(out) > 3000 else out)

    # Check build result
    if "Failed to type check" in out:
        print("\n[ERROR] TypeScript errors!")
        return
    elif "Compiled successfully" in out:
        print("\n[OK] Build succeeded!")

    # Step 12: Fix .next permissions
    print("\nStep 12: Fixing permissions...")
    run_cmd(client, f"chown -R ubuntu:ubuntu {REMOTE_BASE}/.next", sudo=True)

    # Step 13: Seed database
    print("\nStep 13: Seeding database...")
    # Write SQL file
    sql_content = """
INSERT INTO "Category" (id, name, slug, description, image, "createdAt", "updatedAt")
VALUES
  ('cat1', '烙画葫芦', 'pyrography', '以火为墨，千年技艺', '/images/category-pyrography.jpg', NOW(), NOW()),
  ('cat2', '雕刻葫芦', 'carved', '精雕细琢，巧夺天工', '/images/category-carved.jpg', NOW(), NOW()),
  ('cat3', '彩绘葫芦', 'painted', '彩绘生辉，寓意吉祥', '/images/category-painted.jpg', NOW(), NOW()),
  ('cat4', '素葫芦', 'natural', '天然本色，返璞归真', '/images/category-natural.jpg', NOW(), NOW()),
  ('cat5', '葫芦茶具', 'teaset', '茶韵悠长，壶中天地', '/images/category-teaset.jpg', NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;

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

INSERT INTO "Story" (id, title, slug, content, excerpt, image, author, "publishedAt", "createdAt", "updatedAt")
VALUES
  ('story1', '熊猫酒葫芦', 'panda-wine-gourd', '<p>熊猫酒葫芦以精选天然葫芦为载体。</p>', '国宝熊猫与葫芦酒器的奇妙结合。', '/images/story-panda-wine-gourd.jpg', '葫韵工作室', NOW(), NOW(), NOW()),
  ('story2', '诗仙李白', 'li-bai', '<p>李白一生嗜酒如命，葫芦是他最钟爱的酒器。</p>', '诗仙李白与葫芦的千年情缘。', '/images/story-li-bai.jpg', '葫韵工作室', NOW(), NOW(), NOW()),
  ('story3', '武松打虎', 'wu-song', '<p>武松在景阳冈上赤手空拳打死猛虎。</p>', '水浒英雄武松的经典故事。', '/images/story-wu-song.jpg', '葫韵工作室', NOW(), NOW(), NOW()),
  ('story4', '八仙传说', 'eight-immortals', '<p>八仙是中国神话传说中的八位仙人。</p>', '八仙过海各显神通。', '/images/story-eight-immortals.jpg', '葫韵工作室', NOW(), NOW(), NOW()),
  ('story5', '纣王酒池', 'zhou-xin', '<p>商朝末年，纣王以葫芦为酒器。</p>', '商纣王酒池肉林的奢靡传说。', '/images/story-zhou-xin.jpg', '葫韵工作室', NOW(), NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;
"""

    sftp = client.open_sftp()
    with sftp.open('/tmp/seed.sql', 'w') as f:
        f.write(sql_content)
    sftp.close()

    out, _ = run_cmd(client, "sudo -u postgres psql -d huyun_store -f /tmp/seed.sql 2>&1", sudo=True)
    print(out[:500])

    # Step 14: Restart PM2
    print("\nStep 14: Restarting PM2...")
    run_cmd(client, "pm2 delete huyun-store", sudo=False)
    out, _ = run_cmd(client, f"cd {REMOTE_BASE} && pm2 start npm --name huyun-store -- start", sudo=False)
    print(out)

    # Step 15: Wait and verify
    import time
    time.sleep(20)

    print("\n" + "="*50)
    print("验证结果")
    print("="*50)

    # Check BUILD_ID
    out, _ = run_cmd(client, f"cat {REMOTE_BASE}/.next/BUILD_ID", sudo=False)
    print(f"  BUILD_ID: {out.strip()}")

    # Check API
    out, _ = run_cmd(client, "curl -s http://localhost:3000/api/categories | head -c 100", sudo=False)
    print(f"  /api/categories: {out[:100]}")

    # Check page content
    out, _ = run_cmd(client, "curl -s http://localhost:3000/ | head -c 500", sudo=False)
    print(f"\n  页面前500字符:")
    print(f"  {out[:500]}")

    # Check for default template
    if "To get started" in out:
        print("\n  [FAIL] 仍然显示默认模板!")
    else:
        print("\n  [OK] 没有默认模板内容")

    # Check for shop content
    if "葫韵" in out:
        print("  [OK] 包含品牌名")

    print(f"\n[DONE] http://{HOST}")

    client.close()

if __name__ == "__main__":
    main()
