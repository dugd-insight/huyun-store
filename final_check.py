#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Final verification"""

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

    # 1. API 验证
    print("\n1. API 端点:")
    out, _ = run_cmd(client, "curl -s http://localhost:3000/api/categories | python3 -c 'import sys,json; d=json.load(sys.stdin); print(f\"  分类: {len(d)} 个\")'")
    print(out.strip())

    out, _ = run_cmd(client, "curl -s http://localhost:3000/api/products | python3 -c 'import sys,json; d=json.load(sys.stdin); print(f\"  产品: {len(d[\\\"products\\\"])} 个\")'")
    print(out.strip())

    out, _ = run_cmd(client, "curl -s http://localhost:3000/api/stories | python3 -c 'import sys,json; d=json.load(sys.stdin); print(f\"  故事: {len(d[\\\"stories\\\"])} 个\")'")
    print(out.strip())

    # 2. 页面状态
    print("\n2. 页面状态:")
    out, _ = run_cmd(client, "curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/")
    print(f"  首页: HTTP {out.strip()}")

    out, _ = run_cmd(client, "curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/products")
    print(f"  产品页: HTTP {out.strip()}")

    out, _ = run_cmd(client, "curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/stories")
    print(f"  故事页: HTTP {out.strip()}")

    out, _ = run_cmd(client, "curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/admin")
    print(f"  管理后台: HTTP {out.strip()}")

    # 3. 页面标题
    print("\n3. 页面标题:")
    out, _ = run_cmd(client, "curl -s http://localhost:3000/ | grep -o '<title>[^<]*</title>'")
    print(f"  {out.strip()}")

    # 4. 默认模板检查
    print("\n4. 默认模板检查:")
    out, _ = run_cmd(client, "curl -s http://localhost:3000/ | grep -c 'To get started\\|Deploy Now'")
    count = out.strip()
    if count == "0":
        print("  [OK] 没有默认模板内容")
    else:
        print(f"  [FAIL] 仍有默认模板内容 ({count} 处)")

    # 5. 服务端渲染内容
    print("\n5. 服务端渲染内容:")
    out, _ = run_cmd(client, "curl -s http://localhost:3000/ | grep -o '葫韵' | wc -l")
    print(f"  '葫韵' 出现次数: {out.strip()}")

    # 6. 构建状态
    print("\n6. 构建状态:")
    out, _ = run_cmd(client, "cat /var/www/huyun-store/.next/BUILD_ID")
    print(f"  BUILD_ID: {out.strip()}")

    # 7. PM2 状态
    print("\n7. PM2 状态:")
    out, _ = run_cmd(client, "pm2 list | grep huyun-store")
    print(f"  {out.strip()}")

    print("\n" + "="*60)
    print("访问地址:")
    print(f"  商城首页: http://{HOST}")
    print(f"  产品列表: http://{HOST}/products")
    print(f"  故事列表: http://{HOST}/stories")
    print(f"  管理后台: http://{HOST}/admin")
    print(f"  管理员账号: admin@huyun.com / admin123")
    print("="*60)

    client.close()

if __name__ == "__main__":
    main()
