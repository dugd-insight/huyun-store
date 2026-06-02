#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Rebuild app on server"""

import paramiko
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

HOST = "140.143.159.15"
PORT = 22
USERNAME = "ubuntu"
PASSWORD = "dugd&198778"

def main():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(HOST, port=PORT, username=USERNAME, password=PASSWORD)

    commands = [
        # Set up database first
        f"echo '{PASSWORD}' | sudo -S -u postgres psql -c \"DROP DATABASE IF EXISTS huyun_store;\"",
        f"echo '{PASSWORD}' | sudo -S -u postgres psql -c \"DROP USER IF EXISTS huyun_store_user;\"",
        f"echo '{PASSWORD}' | sudo -S -u postgres psql -c \"CREATE USER huyun_store_user WITH PASSWORD 'HuyunPass2024';\"",
        f"echo '{PASSWORD}' | sudo -S -u postgres psql -c \"CREATE DATABASE huyun_store OWNER huyun_store_user;\"",
        f"echo '{PASSWORD}' | sudo -S -u postgres psql -c \"GRANT ALL PRIVILEGES ON DATABASE huyun_store TO huyun_store_user;\"",
        f"echo '{PASSWORD}' | sudo -S -u postgres psql -c \"ALTER USER huyun_store_user WITH SUPERUSER;\"",

        # Run Prisma migrations
        "cd /var/www/huyun-store && npx prisma migrate deploy",

        # Seed database if seed file exists
        "cd /var/www/huyun-store && npx prisma db seed 2>/dev/null || echo 'No seed file found, skipping...'",

        # Restart the app
        "pm2 restart huyun-store",

        # Wait and check logs
        "sleep 5 && pm2 logs huyun-store --lines 20 --nostream",
    ]

    for cmd in commands:
        print(f"\n{'='*50}")
        print(f"Running: {cmd[:80]}...")
        print('='*50)
        stdin, stdout, stderr = client.exec_command(cmd)
        out = stdout.read().decode('utf-8', errors='ignore')
        err = stderr.read().decode('utf-8', errors='ignore')
        if out:
            print(out[:3000])
        if err:
            err_lines = [l for l in err.split('\n') if '[sudo]' not in l and l.strip()]
            if err_lines:
                print('\n'.join(err_lines[:1000]))

    print("\n[OK] Rebuild complete!")
    client.close()

if __name__ == "__main__":
    main()
