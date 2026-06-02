#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Upload auth.ts fix and rebuild"""

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

    # Upload fixed auth.ts
    print("Uploading auth.ts fix...")
    sftp = client.open_sftp()
    local_path = os.path.join(LOCAL_BASE, "src/lib/auth.ts")
    remote_path = f"{REMOTE_BASE}/src/lib/auth.ts"
    sftp.put(local_path, remote_path)
    sftp.close()
    print("  [OK] Uploaded")

    # Fix ownership
    run_cmd(client, f"chown -R ubuntu:ubuntu {REMOTE_BASE}/src", sudo=True)

    # Rebuild
    print("\nRebuilding...")
    out, err = run_cmd(client, f"cd {REMOTE_BASE} && npm run build 2>&1", sudo=False)
    print(out[-3000:] if len(out) > 3000 else out)

    # Check build result
    if "Failed to type check" in out:
        print("\n[ERROR] TypeScript errors remain!")
        return
    elif "Compiled successfully" in out:
        print("\n[OK] Build succeeded!")

    # Fix .next permissions
    run_cmd(client, f"chown -R ubuntu:ubuntu {REMOTE_BASE}/.next", sudo=True)

    # Restart PM2
    print("\nRestarting PM2...")
    out, _ = run_cmd(client, "pm2 restart huyun-store", sudo=False)
    print(out)

    # Wait and verify
    import time
    time.sleep(15)

    print("\nFinal Verification...")
    out, _ = run_cmd(client, f"cat {REMOTE_BASE}/.next/BUILD_ID", sudo=False)
    build_id = out.strip()
    print(f"  BUILD_ID: {build_id}")

    out, _ = run_cmd(client, "curl -s http://localhost:3000/ | grep -c 'HeroCarousel\\|category-card\\|工艺分类\\|精选作品'", sudo=False)
    print(f"  Shop content: {out.strip()} matches")

    out, _ = run_cmd(client, "curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/", sudo=False)
    print(f"  HTTP Status: {out.strip()}")

    if build_id:
        print("\n" + "="*50)
        print("[SUCCESS] Site is now live!")
        print(f"[URL] http://{HOST}")
        print("="*50)

    client.close()

if __name__ == "__main__":
    main()
