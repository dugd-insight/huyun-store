#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Upload modified files directly to server via SFTP"""

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

# Files to upload (relative paths)
FILES_TO_UPLOAD = [
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
    "src/lib/auth.ts",
    "src/types/dompurify.d.ts",
    "package.json",
]

# Files to delete on server
FILES_TO_DELETE = [
    "src/app/page.tsx",
]

def main():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(HOST, port=PORT, username=USERNAME, password=PASSWORD)

    sftp = client.open_sftp()

    # Upload modified files
    print("="*50)
    print("Uploading modified files...")
    print("="*50)
    for rel_path in FILES_TO_UPLOAD:
        local_path = os.path.join(LOCAL_BASE, rel_path).replace("\\", "/")
        remote_path = f"{REMOTE_BASE}/{rel_path}"

        # Create remote directory if needed
        remote_dir = os.path.dirname(remote_path)
        try:
            sftp.stat(remote_dir)
        except FileNotFoundError:
            # Use sudo to create directory
            stdin, stdout, stderr = client.exec_command(
                f"echo '{PASSWORD}' | sudo -S mkdir -p {remote_dir}"
            )
            stdout.read()

        try:
            sftp.put(local_path, remote_path)
            print(f"  [OK] {rel_path}")
        except Exception as e:
            print(f"  [FAIL] {rel_path}: {e}")

    # Fix ownership
    print("\nFixing file ownership...")
    stdin, stdout, stderr = client.exec_command(
        f"echo '{PASSWORD}' | sudo -S chown -R ubuntu:ubuntu {REMOTE_BASE}/src"
    )
    stdout.read()

    sftp.close()

    # Delete removed files
    print("\nDeleting removed files...")
    for rel_path in FILES_TO_DELETE:
        remote_path = f"{REMOTE_BASE}/{rel_path}"
        stdin, stdout, stderr = client.exec_command(
            f"echo '{PASSWORD}' | sudo -S rm -f {remote_path}"
        )
        stdout.read()
        print(f"  [DEL] {rel_path}")

    # Install isomorphic-dompurify
    print("\nInstalling isomorphic-dompurify...")
    stdin, stdout, stderr = client.exec_command(
        f"echo '{PASSWORD}' | sudo -S bash -c 'cd {REMOTE_BASE} && npm install isomorphic-dompurify'"
    )
    out = stdout.read().decode('utf-8', errors='ignore')
    err = stderr.read().decode('utf-8', errors='ignore')
    print(out[:1000])

    # Rebuild
    print("\nRebuilding app...")
    stdin, stdout, stderr = client.exec_command(
        f"echo '{PASSWORD}' | sudo -S bash -c 'cd {REMOTE_BASE} && npm run build'"
    )
    out = stdout.read().decode('utf-8', errors='ignore')
    err = stderr.read().decode('utf-8', errors='ignore')
    print(out[:5000])

    # Fix permissions
    print("\nFixing permissions...")
    stdin, stdout, stderr = client.exec_command(
        f"echo '{PASSWORD}' | sudo -S chown -R ubuntu:ubuntu {REMOTE_BASE}/.next"
    )
    stdout.read()

    # Restart PM2
    print("\nRestarting PM2...")
    stdin, stdout, stderr = client.exec_command("pm2 restart huyun-store")
    out = stdout.read().decode('utf-8', errors='ignore')
    print(out)

    # Wait and test
    import time
    time.sleep(10)

    print("\nTesting HTTP response...")
    stdin, stdout, stderr = client.exec_command("curl -s http://localhost:3000/ | head -c 1000")
    out = stdout.read().decode('utf-8', errors='ignore')
    print(out)

    print("\n" + "="*50)
    print("[DONE] Upload and rebuild complete!")
    print(f"[URL] http://{HOST}")
    print("="*50)

    client.close()

if __name__ == "__main__":
    main()
