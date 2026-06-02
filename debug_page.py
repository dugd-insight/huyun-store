#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Debug page rendering"""

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
    print("调试首页渲染")
    print("="*60)

    # 1. 获取页面完整 HTML
    print("\n1. 页面 HTML 分析:")
    out, _ = run_cmd(client, "curl -s http://localhost:3000/ | wc -c", sudo=False)
    print(f"  页面大小: {out.strip()} 字节")

    # 2. 检查关键内容
    print("\n2. 关键内容检查:")
    checks = [
        ('葫韵', '品牌名'),
        ('传统葫芦工艺', '副标题'),
        ('HeroCarousel', '轮播组件'),
        ('hero-', 'Hero图片'),
        ('category-card', '分类卡片'),
        ('工艺分类', '分类标题'),
        ('五大工艺', '分类副标题'),
        ('精选作品', '产品标题'),
        ('匠心独运', '产品副标题'),
        ('葫芦故事', '故事标题'),
        ('文化传承', '故事副标题'),
        ('匠心传承', '传承区域'),
        ('千年工艺', '传承标题'),
        ('聊城', '产地区域'),
        ('山东聊城', '产地标题'),
        ('订阅', '订阅区域'),
        ('/images/', '图片路径'),
        ('fade-in', '动画类'),
        ('section-title', '区块标题类'),
    ]

    for keyword, desc in checks:
        count = out.count(keyword) if 'out' in dir() else 0
        # Re-fetch page for each check
        pass

    # Get page content
    page_content, _ = run_cmd(client, "curl -s http://localhost:3000/", sudo=False)

    for keyword, desc in checks:
        count = page_content.count(keyword)
        status = "[OK]" if count > 0 else "[MISS]"
        print(f"  {status} {desc} ({keyword}): {count} 处")

    # 3. 检查 CSS 是否加载
    print("\n3. CSS 检查:")
    css_count = page_content.count('<link rel="stylesheet"')
    print(f"  CSS 文件数: {css_count}")

    # 4. 检查 JavaScript 是否加载
    print("\n4. JavaScript 检查:")
    js_count = page_content.count('<script')
    print(f"  JS 文件数: {js_count}")

    # 5. 检查 body 内容
    print("\n5. Body 内容 (前2000字符):")
    body_start = page_content.find('<body')
    if body_start > 0:
        body_content = page_content[body_start:body_start+2000]
        print(body_content[:2000])

    # 6. 检查服务器端错误日志
    print("\n6. 最近的错误日志:")
    out, _ = run_cmd(client, "pm2 logs huyun-store --err --lines 20 --nostream", sudo=False)
    print(out[:1000])

    # 7. 检查页面是否有错误信息
    print("\n7. 错误信息检查:")
    if 'Error' in page_content or 'error' in page_content:
        # Find error context
        error_idx = page_content.find('Error')
        if error_idx > 0:
            print(f"  找到错误: {page_content[max(0,error_idx-50):error_idx+200]}")
    else:
        print("  [OK] 没有错误信息")

    client.close()

if __name__ == "__main__":
    main()
