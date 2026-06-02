#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Update server with latest code from GitHub"""

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
    stdin, stdout, stderr = client.exec_command(cmd, timeout=300)
    out = stdout.read().decode('utf-8', errors='ignore')
    err = stderr.read().decode('utf-8', errors='ignore')
    return out, err

def main():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(HOST, port=PORT, username=USERNAME, password=PASSWORD)

    # Step 1: Pull latest code
    print("="*50)
    print("Step 1: Pulling latest code from GitHub...")
    print("="*50)
    out, err = run_cmd(client, "cd /var/www/huyun-store && git pull origin main", sudo=True)
    print(out)
    if err:
        err_lines = [l for l in err.split('\n') if '[sudo]' not in l and l.strip()]
        if err_lines:
            print('\n'.join(err_lines))

    # Step 2: Install dependencies (including isomorphic-dompurify)
    print("="*50)
    print("Step 2: Installing dependencies...")
    print("="*50)
    out, err = run_cmd(client, "cd /var/www/huyun-store && npm install", sudo=True)
    print(out[:2000])
    if err:
        err_lines = [l for l in err.split('\n') if '[sudo]' not in l and l.strip() and 'WARN' not in l]
        if err_lines:
            print('\n'.join(err_lines[:500]))

    # Step 3: Verify isomorphic-dompurify is installed
    print("="*50)
    print("Step 3: Verifying isomorphic-dompurify...")
    print("="*50)
    out, _ = run_cmd(client, "ls /var/www/huyun-store/node_modules/isomorphic-dompurify/package.json 2>&1", sudo=False)
    print(out)

    # Step 4: Run Prisma generate (in case schema changed)
    print("="*50)
    print("Step 4: Generating Prisma client...")
    print("="*50)
    out, err = run_cmd(client, "cd /var/www/huyun-store && npx prisma generate", sudo=True)
    print(out[:1000])

    # Step 5: Build the app
    print("="*50)
    print("Step 5: Building app...")
    print("="*50)
    out, err = run_cmd(client, "cd /var/www/huyun-store && npm run build", sudo=True)
    print(out[:5000])

    # Step 6: Fix permissions
    print("="*50)
    print("Step 6: Fixing permissions...")
    print("="*50)
    run_cmd(client, "chown -R ubuntu:ubuntu /var/www/huyun-store/.next", sudo=True)

    # Step 7: Restart PM2
    print("="*50)
    print("Step 7: Restarting PM2...")
    print("="*50)
    out, _ = run_cmd(client, "pm2 restart huyun-store", sudo=False)
    print(out)

    # Step 8: Wait and check logs
    print("="*50)
    print("Step 8: Checking app status...")
    print("="*50)
    import time
    time.sleep(10)

    out, _ = run_cmd(client, "pm2 list", sudo=False)
    print(out)

    out, _ = run_cmd(client, "pm2 logs huyun-store --lines 10 --nostream", sudo=False)
    print(out)

    # Step 9: Test HTTP
    print("="*50)
    print("Step 9: Testing HTTP response...")
    print("="*50)
    out, _ = run_cmd(client, "curl -s http://localhost:3000/ | head -c 500", sudo=False)
    print(out)

    print("\n" + "="*50)
    print("[DONE] Server update complete!")
    print(f"[URL] http://{HOST}")
    print("="*50)

    client.close()

if __name__ == "__main__":
    main()
