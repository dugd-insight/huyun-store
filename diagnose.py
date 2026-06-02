#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Diagnose deployment issues"""

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
    stdin, stdout, stderr = client.exec_command(cmd, timeout=30)
    out = stdout.read().decode('utf-8', errors='ignore')
    err = stderr.read().decode('utf-8', errors='ignore')
    return out, err

def main():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(HOST, port=PORT, username=USERNAME, password=PASSWORD)

    print("="*60)
    print("1. PM2 状态")
    print("="*60)
    out, _ = run_cmd(client, "pm2 list", sudo=False)
    print(out)

    print("="*60)
    print("2. PM2 错误日志 (最近)")
    print("="*60)
    out, _ = run_cmd(client, "pm2 logs huyun-store --err --lines 50 --nostream", sudo=False)
    print(out)

    print("="*60)
    print("3. PM2 输出日志 (最近)")
    print("="*60)
    out, _ = run_cmd(client, "pm2 logs huyun-store --out --lines 20 --nostream", sudo=False)
    print(out)

    print("="*60)
    print("4. .next 目录是否存在")
    print("="*60)
    out, _ = run_cmd(client, "ls -la /var/www/huyun-store/.next/BUILD_ID 2>&1", sudo=False)
    print(out)

    print("="*60)
    print("5. .env 文件内容")
    print("="*60)
    out, _ = run_cmd(client, "cat /var/www/huyun-store/.env", sudo=False)
    print(out)

    print("="*60)
    print("6. node_modules 是否完整")
    print("="*60)
    out, _ = run_cmd(client, "ls /var/www/huyun-store/node_modules/.package-lock.json 2>&1 && echo 'node_modules OK'", sudo=False)
    print(out)

    print("="*60)
    print("7. isomorphic-dompurify 是否安装")
    print("="*60)
    out, _ = run_cmd(client, "ls /var/www/huyun-store/node_modules/isomorphic-dompurify 2>&1", sudo=False)
    print(out)

    print("="*60)
    print("8. curl 测试 localhost:3000")
    print("="*60)
    out, _ = run_cmd(client, "curl -s -o /dev/null -w 'HTTP %{http_code}\\n' http://localhost:3000/ 2>&1", sudo=False)
    print(out)

    print("="*60)
    print("9. curl 测试返回内容前500字符")
    print("="*60)
    out, _ = run_cmd(client, "curl -s http://localhost:3000/ 2>&1 | head -c 2000", sudo=False)
    print(out)

    print("="*60)
    print("10. Nginx 配置")
    print("="*60)
    out, _ = run_cmd(client, "cat /etc/nginx/sites-available/huyun-store", sudo=False)
    print(out)

    print("="*60)
    print("11. Nginx 错误日志")
    print("="*60)
    out, _ = run_cmd(client, "tail -20 /var/log/nginx/error.log", sudo=True)
    print(out)

    print("="*60)
    print("12. 端口监听情况")
    print("="*60)
    out, _ = run_cmd(client, "ss -tlnp | grep -E '3000|80'", sudo=True)
    print(out)

    print("="*60)
    print("13. 文件权限")
    print("="*60)
    out, _ = run_cmd(client, "ls -la /var/www/huyun-store/ | head -15", sudo=False)
    print(out)

    print("="*60)
    print("14. package.json scripts")
    print("="*60)
    out, _ = run_cmd(client, "cat /var/www/huyun-store/package.json | grep -A5 scripts", sudo=False)
    print(out)

    client.close()
    print("\n[DONE] Diagnosis complete")

if __name__ == "__main__":
    main()
