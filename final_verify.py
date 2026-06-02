#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Final verification of all sections"""

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
    print("葫韵商城 - 最终验证")
    print("="*60)

    # Get page content
    page, _ = run_cmd(client, "curl -s http://localhost:3000/", sudo=False)

    # Check all sections
    print("\n页面内容检查:")
    sections = [
        ('葫韵', '品牌名'),
        ('传统葫芦工艺', '副标题'),
        ('hero-main.jpg', 'Hero 主图'),
        ('hero-carousel', '轮播图'),
        ('工艺分类', '分类区域标题'),
        ('五大工艺', '分类副标题'),
        ('category-card', '分类卡片'),
        ('烙画葫芦', '烙画分类'),
        ('雕刻葫芦', '雕刻分类'),
        ('彩绘葫芦', '彩绘分类'),
        ('素葫芦', '素葫芦分类'),
        ('葫芦茶具', '茶具分类'),
        ('精选作品', '产品区域标题'),
        ('匠心独运', '产品副标题'),
        ('ProductCard', '产品卡片组件'),
        ('葫芦故事', '故事区域标题'),
        ('文化传承', '故事副标题'),
        ('story-card', '故事卡片'),
        ('匠心传承', '传承区域'),
        ('千年工艺', '传承标题'),
        ('聊城', '产地区域'),
        ('山东聊城', '产地标题'),
        ('订阅', '订阅区域'),
        ('fade-in', '滚动动画'),
        ('section-title', '区块标题样式'),
    ]

    for keyword, desc in sections:
        count = page.count(keyword)
        status = "[OK]" if count > 0 else "[MISS]"
        print(f"  {status} {desc} ({keyword}): {count} 处")

    # Check API data
    print("\nAPI 数据:")
    out, _ = run_cmd(client, "curl -s http://localhost:3000/api/categories | python3 -c 'import sys,json; d=json.load(sys.stdin); print(f\"  分类: {len(d)} 个\")'")
    print(out.strip())

    out, _ = run_cmd(client, "curl -s http://localhost:3000/api/products | python3 -c 'import sys,json; d=json.load(sys.stdin); print(f\"  产品: {len(d[\\\"products\\\"])} 个\")'")
    print(out.strip())

    out, _ = run_cmd(client, "curl -s http://localhost:3000/api/stories | python3 -c 'import sys,json; d=json.load(sys.stdin); print(f\"  故事: {len(d[\\\"stories\\\"])} 个\")'")
    print(out.strip())

    # Check page status
    print("\n页面状态:")
    pages = ['/', '/products', '/stories', '/admin']
    for p in pages:
        out, _ = run_cmd(client, f"curl -s -o /dev/null -w '%{{http_code}}' http://localhost:3000{p}", sudo=False)
        print(f"  {p}: HTTP {out.strip()}")

    # Check for errors
    print("\n错误检查:")
    if "To get started" in page:
        print("  [FAIL] 仍有默认模板内容")
    else:
        print("  [OK] 没有默认模板内容")

    if "Error" in page:
        print("  [WARN] 页面包含错误信息")
    else:
        print("  [OK] 没有错误信息")

    print("\n" + "="*60)
    print("访问地址:")
    print(f"  商城首页: http://{HOST}")
    print(f"  产品列表: http://{HOST}/products")
    print(f"  故事列表: http://{HOST}/stories")
    print(f"  管理后台: http://{HOST}/admin")
    print(f"  管理员: admin@huyun.com / admin123")
    print("="*60)

    client.close()

if __name__ == "__main__":
    main()
