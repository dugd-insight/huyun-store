#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Fix HomeClient.tsx upload and rebuild"""

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

    # Step 1: Fix ownership of components directory
    print("Step 1: Fixing ownership...")
    run_cmd(client, f"chown -R ubuntu:ubuntu {REMOTE_BASE}/src/components", sudo=True)

    # Step 2: Upload HomeClient.tsx
    print("Step 2: Uploading HomeClient.tsx...")
    sftp = client.open_sftp()
    local_path = os.path.join(LOCAL_BASE, "src/components/home/HomeClient.tsx")
    remote_path = f"{REMOTE_BASE}/src/components/home/HomeClient.tsx"

    # Create directory if needed
    try:
        sftp.stat(f"{REMOTE_BASE}/src/components/home")
    except FileNotFoundError:
        run_cmd(client, f"mkdir -p {REMOTE_BASE}/src/components/home", sudo=True)
        run_cmd(client, f"chown -R ubuntu:ubuntu {REMOTE_BASE}/src/components/home", sudo=True)

    sftp.put(local_path, remote_path)
    print("  [OK] HomeClient.tsx uploaded")
    sftp.close()

    # Step 3: Fix all ownership
    print("Step 3: Fixing all ownership...")
    run_cmd(client, f"chown -R ubuntu:ubuntu {REMOTE_BASE}/src", sudo=True)

    # Step 4: Rebuild
    print("Step 4: Rebuilding app...")
    out, err = run_cmd(client, f"cd {REMOTE_BASE} && npm run build", sudo=True)
    print(out[-3000:] if len(out) > 3000 else out)

    # Step 5: Fix .next permissions
    print("Step 5: Fixing .next permissions...")
    run_cmd(client, f"chown -R ubuntu:ubuntu {REMOTE_BASE}/.next", sudo=True)

    # Step 6: Restart PM2
    print("Step 6: Restarting PM2...")
    out, _ = run_cmd(client, "pm2 restart huyun-store", sudo=False)
    print(out)

    # Step 7: Wait and test
    import time
    time.sleep(15)

    print("Step 7: Testing...")
    out, _ = run_cmd(client, "pm2 logs huyun-store --lines 10 --nostream", sudo=False)
    print(out)

    # Check if the page now shows the shop content
    out, _ = run_cmd(client, "curl -s http://localhost:3000/ | grep -o '<title>[^<]*</title>'", sudo=False)
    print(f"Page title: {out}")

    # Check for shop-specific content
    out, _ = run_cmd(client, "curl -s http://localhost:3000/ | grep -c '葫韵\\|HeroCarousel\\|category-card\\|产品\\|故事'", sudo=False)
    print(f"Shop content matches: {out}")

    print("\n[DONE] Fix complete!")
    print(f"[URL] http://{HOST}")

    client.close()

if __name__ == "__main__":
    main()
