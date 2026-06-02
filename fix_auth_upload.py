#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Upload auth fix and rebuild"""

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

    # Upload fixed auth file
    print("Uploading auth fix...")
    sftp = client.open_sftp()
    local_path = os.path.join(LOCAL_BASE, "src/app/api/auth/[...nextauth]/route.ts")
    remote_path = f"{REMOTE_BASE}/src/app/api/auth/[...nextauth]/route.ts"
    sftp.put(local_path, remote_path)
    sftp.close()
    print("  [OK] Auth file uploaded")

    # Fix ownership
    run_cmd(client, f"chown -R ubuntu:ubuntu {REMOTE_BASE}/src", sudo=True)

    # Rebuild
    print("\nRebuilding...")
    out, err = run_cmd(client, f"cd {REMOTE_BASE} && npm run build 2>&1", sudo=False)
    print(out[-3000:] if len(out) > 3000 else out)

    # Fix .next permissions
    run_cmd(client, f"chown -R ubuntu:ubuntu {REMOTE_BASE}/.next", sudo=True)

    # Restart PM2
    print("\nRestarting PM2...")
    out, _ = run_cmd(client, "pm2 restart huyun-store", sudo=False)
    print(out)

    # Wait and verify
    import time
    time.sleep(15)

    print("\nVerification...")
    out, _ = run_cmd(client, f"cat {REMOTE_BASE}/.next/BUILD_ID", sudo=False)
    print(f"  BUILD_ID: {out.strip()}")

    out, _ = run_cmd(client, "curl -s http://localhost:3000/api/products | head -c 200", sudo=False)
    print(f"  API: {out[:200]}")

    out, _ = run_cmd(client, "curl -s http://localhost:3000/ | grep -c 'HeroCarousel\\|category-card\\|工艺分类\\|精选作品\\|葫韵'", sudo=False)
    print(f"  Shop content: {out.strip()} matches")

    print("\n[DONE]")
    print(f"[URL] http://{HOST}")

    client.close()

if __name__ == "__main__":
    main()
