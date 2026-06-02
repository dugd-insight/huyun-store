#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Final fix - permissions and rebuild"""

import paramiko
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

HOST = "140.143.159.15"
PORT = 22
USERNAME = "ubuntu"
PASSWORD = "dugd&198778"

def run_cmd(client, cmd, sudo=True):
    if sudo:
        cmd = f"echo '{PASSWORD}' | sudo -S bash -c \"{cmd}\""
    stdin, stdout, stderr = client.exec_command(cmd)
    out = stdout.read().decode('utf-8', errors='ignore')
    err = stderr.read().decode('utf-8', errors='ignore')
    if out:
        print(out[:3000])
    if err:
        err_lines = [l for l in err.split('\n') if '[sudo]' not in l and l.strip()]
        if err_lines:
            print('\n'.join(err_lines[:500]))

def main():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(HOST, port=PORT, username=USERNAME, password=PASSWORD)

    # Step 1: Fix ownership of the entire project directory
    print("="*50)
    print("Step 1: Fixing ownership...")
    print("="*50)
    run_cmd(client, "chown -R ubuntu:ubuntu /var/www/huyun-store")

    # Step 2: Update .env file
    print("="*50)
    print("Step 2: Updating .env...")
    print("="*50)

    env_content = 'DATABASE_URL="postgresql://huyun_store_user:HuyunPass2024@localhost:5432/huyun_store"\\nNEXTAUTH_SECRET="huyun-store-secret-key-2024-production"\\nNEXTAUTH_URL="http://140.143.159.15"'

    run_cmd(client, f"cd /var/www/huyun-store && printf '{env_content}' > .env")
    run_cmd(client, "cat /var/www/huyun-store/.env", sudo=False)

    # Step 3: Run Prisma migrations
    print("="*50)
    print("Step 3: Running Prisma migrations...")
    print("="*50)
    run_cmd(client, "cd /var/www/huyun-store && npx prisma migrate deploy", sudo=False)

    # Step 4: Build the app
    print("="*50)
    print("Step 4: Building app...")
    print("="*50)
    run_cmd(client, "cd /var/www/huyun-store && npm run build", sudo=False)

    # Step 5: Restart PM2
    print("="*50)
    print("Step 5: Restarting PM2...")
    print("="*50)
    run_cmd(client, "pm2 restart huyun-store", sudo=False)

    # Step 6: Check logs
    print("="*50)
    print("Step 6: Checking logs...")
    print("="*50)
    run_cmd(client, "sleep 10 && pm2 logs huyun-store --lines 20 --nostream", sudo=False)

    print("\n[OK] Fix complete!")
    client.close()

if __name__ == "__main__":
    main()
