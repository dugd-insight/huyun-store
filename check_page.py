#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Check page content"""

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
    print("页面内容检查")
    print("="*60)

    # Get full page content
    out, _ = run_cmd(client, "curl -s http://localhost:3000/", sudo=False)

    # Check title
    import re
    title_match = re.search(r'<title>([^<]*)</title>', out)
    if title_match:
        print(f"\n标题: {title_match.group(1)}")

    # Check for key content
    checks = [
        ('葫韵', '品牌名'),
        ('传统葫芦工艺', '副标题'),
        ('HeroCarousel', '轮播组件'),
        ('category-card', '分类卡片'),
        ('工艺分类', '分类区域标题'),
        ('精选作品', '产品区域标题'),
        ('葫芦故事', '故事区域标题'),
        ('/images/', '图片路径'),
        ('/products', '产品链接'),
        ('/stories', '故事链接'),
    ]

    print("\n内容检查:")
    for keyword, desc in checks:
        count = out.count(keyword)
        status = "[OK]" if count > 0 else "[MISS]"
        print(f"  {status} {desc} ({keyword}): {count} 处")

    # Check API endpoints
    print("\nAPI 端点检查:")
    endpoints = ['/api/products', '/api/categories', '/api/stories']
    for ep in endpoints:
        out, _ = run_cmd(client, f"curl -s http://localhost:3000{ep}", sudo=False)
        print(f"  {ep}: {out[:100]}")

    # Check if it's showing the default template
    print("\n默认模板检查:")
    if "To get started" in out or "Deploy Now" in out:
        print("  [FAIL] 仍然显示 Next.js 默认模板!")
    else:
        print("  [OK] 没有默认模板内容")

    # Show first 500 chars of body
    print("\n页面前500字符:")
    body_start = out.find('<body')
    if body_start > 0:
        print(out[body_start:body_start+500])

    client.close()

if __name__ == "__main__":
    main()
