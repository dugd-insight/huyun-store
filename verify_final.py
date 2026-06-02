#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Final verification of the deployed site"""

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
    stdin, stdout, stderr = client.exec_command(cmd, timeout=60)
    out = stdout.read().decode('utf-8', errors='ignore')
    err = stderr.read().decode('utf-8', errors='ignore')
    return out, err

def main():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(HOST, port=PORT, username=USERNAME, password=PASSWORD)

    print("="*60)
    print("1. 检查页面标题")
    print("="*60)
    out, _ = run_cmd(client, "curl -s http://localhost:3000/ | grep -o '<title>[^<]*</title>'", sudo=False)
    print(f"  {out.strip()}")

    print("\n" + "="*60)
    print("2. 检查是否还有 Next.js 默认模板内容")
    print("="*60)
    out, _ = run_cmd(client, "curl -s http://localhost:3000/ | grep -c 'To get started\\|Deploy Now\\|next.svg'", sudo=False)
    count = out.strip()
    if count == "0":
        print("  [OK] 没有默认模板内容")
    else:
        print(f"  [WARN] 仍包含默认模板内容 ({count} 处)")

    print("\n" + "="*60)
    print("3. 检查商城特有内容")
    print("="*60)
    checks = [
        ("葫韵", "品牌名称"),
        ("HeroCarousel", "轮播组件"),
        ("category-card", "分类卡片"),
        ("ProductCard", "产品卡片"),
        ("工艺分类", "分类区域"),
        ("精选作品", "产品区域"),
        ("葫芦故事", "故事区域"),
    ]
    for keyword, desc in checks:
        out, _ = run_cmd(client, f"curl -s http://localhost:3000/ | grep -c '{keyword}'", sudo=False)
        count = out.strip()
        status = "[OK]" if count != "0" else "[MISS]"
        print(f"  {status} {desc} ({keyword}): {count} 处")

    print("\n" + "="*60)
    print("4. 检查 API 端点")
    print("="*60)
    out, _ = run_cmd(client, "curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/api/products", sudo=False)
    print(f"  /api/products: HTTP {out.strip()}")
    out, _ = run_cmd(client, "curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/api/categories", sudo=False)
    print(f"  /api/categories: HTTP {out.strip()}")
    out, _ = run_cmd(client, "curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/api/stories", sudo=False)
    print(f"  /api/stories: HTTP {out.strip()}")

    print("\n" + "="*60)
    print("5. 检查管理后台")
    print("="*60)
    out, _ = run_cmd(client, "curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/admin", sudo=False)
    print(f"  /admin: HTTP {out.strip()}")

    print("\n" + "="*60)
    print("6. 检查产品列表页")
    print("="*60)
    out, _ = run_cmd(client, "curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/products", sudo=False)
    print(f"  /products: HTTP {out.strip()}")

    print("\n" + "="*60)
    print("7. 检查故事列表页")
    print("="*60)
    out, _ = run_cmd(client, "curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/stories", sudo=False)
    print(f"  /stories: HTTP {out.strip()}")

    print("\n" + "="*60)
    print("8. 检查构建状态")
    print("="*60)
    out, _ = run_cmd(client, "cat /var/www/huyun-store/.next/BUILD_ID", sudo=False)
    print(f"  BUILD_ID: {out.strip()}")

    print("\n" + "="*60)
    print("9. 检查关键文件是否存在")
    print("="*60)
    files = [
        "src/app/(shop)/page.tsx",
        "src/components/home/HomeClient.tsx",
        "src/lib/auth.ts",
        "src/types/dompurify.d.ts",
        "node_modules/isomorphic-dompurify/package.json",
    ]
    for f in files:
        out, _ = run_cmd(client, f"ls /var/www/huyun-store/{f} 2>&1", sudo=False)
        status = "[OK]" if "cannot access" not in out else "[MISS]"
        print(f"  {status} {f}")

    print("\n" + "="*60)
    print("[DONE] Verification complete!")
    print(f"[URL] http://{HOST}")
    print("="*60)

    client.close()

if __name__ == "__main__":
    main()
