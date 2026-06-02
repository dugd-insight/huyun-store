#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Final fix - create DB tables, upload files, rebuild"""

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

    # Step 1: Upload fixed files
    print("="*50)
    print("Step 1: Uploading fixed files...")
    print("="*50)
    sftp = client.open_sftp()

    files_to_upload = [
        "src/app/(shop)/page.tsx",
        "src/components/home/HomeClient.tsx",
    ]

    for rel_path in files_to_upload:
        local_path = os.path.join(LOCAL_BASE, rel_path).replace("\\", "/")
        remote_path = f"{REMOTE_BASE}/{rel_path}"
        try:
            sftp.put(local_path, remote_path)
            print(f"  [OK] {rel_path}")
        except Exception as e:
            print(f"  [FAIL] {rel_path}: {e}")

    sftp.close()

    # Step 2: Fix ownership
    print("\nStep 2: Fixing ownership...")
    run_cmd(client, f"chown -R ubuntu:ubuntu {REMOTE_BASE}/src", sudo=True)

    # Step 3: Create database tables using prisma db push
    print("\nStep 3: Creating database tables...")
    out, err = run_cmd(client, f"cd {REMOTE_BASE} && npx prisma db push 2>&1", sudo=False)
    print(out[:2000])
    if err:
        err_lines = [l for l in err.split('\n') if l.strip() and 'warn' not in l.lower()]
        if err_lines:
            print("Errors:", '\n'.join(err_lines[:20]))

    # Step 4: Generate Prisma client
    print("\nStep 4: Generating Prisma client...")
    out, _ = run_cmd(client, f"cd {REMOTE_BASE} && npx prisma generate", sudo=False)
    print(out[:500])

    # Step 5: Rebuild
    print("\nStep 5: Rebuilding app...")
    out, err = run_cmd(client, f"cd {REMOTE_BASE} && npm run build 2>&1", sudo=False)
    # Show last 2000 chars of output
    print(out[-2000:] if len(out) > 2000 else out)

    # Step 6: Fix .next permissions
    print("\nStep 6: Fixing .next permissions...")
    run_cmd(client, f"chown -R ubuntu:ubuntu {REMOTE_BASE}/.next", sudo=True)

    # Step 7: Restart PM2
    print("\nStep 7: Restarting PM2...")
    out, _ = run_cmd(client, "pm2 restart huyun-store", sudo=False)
    print(out)

    # Step 8: Wait and verify
    import time
    time.sleep(15)

    print("\nStep 8: Verification...")

    # Check BUILD_ID
    out, _ = run_cmd(client, f"cat {REMOTE_BASE}/.next/BUILD_ID", sudo=False)
    print(f"  BUILD_ID: {out.strip()}")

    # Check API
    out, _ = run_cmd(client, "curl -s http://localhost:3000/api/products | head -c 300", sudo=False)
    print(f"  /api/products: {out[:300]}")

    # Check page content
    out, _ = run_cmd(client, "curl -s http://localhost:3000/ | grep -c 'HeroCarousel\\|category-card\\|工艺分类\\|精选作品'", sudo=False)
    print(f"  Shop content matches: {out.strip()}")

    # Check page title
    out, _ = run_cmd(client, "curl -s http://localhost:3000/ | grep -o '<title>[^<]*</title>'", sudo=False)
    print(f"  Page title: {out.strip()}")

    print("\n" + "="*50)
    print("[DONE] Final fix complete!")
    print(f"[URL] http://{HOST}")
    print("="*50)

    client.close()

if __name__ == "__main__":
    main()
