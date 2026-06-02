#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Fix deployment - update env and rebuild"""

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

    # Fix .env file with correct database URL
    env_content = """# Database
DATABASE_URL="postgresql://huyun_store_user:HuyunPass2024@localhost:5432/huyun_store"

# NextAuth
NEXTAUTH_SECRET="huyun-store-secret-key-2024-production"
NEXTAUTH_URL="http://140.143.159.15"
"""

    commands = [
        # Update .env file
        f"cat > /var/www/huyun-store/.env << 'EOF'\n{env_content}\nEOF",

        # Verify .env content
        "cat /var/www/huyun-store/.env",

        # Run Prisma migrations
        "cd /var/www/huyun-store && npx prisma migrate deploy",

        # Build the app
        "cd /var/www/huyun-store && npm run build",

        # Restart PM2
        "pm2 restart huyun-store",

        # Wait and check
        "sleep 10 && pm2 logs huyun-store --lines 30 --nostream",
    ]

    for cmd in commands:
        print(f"\n{'='*50}")
        print(f"Running: {cmd[:80]}...")
        print('='*50)
        stdin, stdout, stderr = client.exec_command(cmd)
        out = stdout.read().decode('utf-8', errors='ignore')
        err = stderr.read().decode('utf-8', errors='ignore')
        if out:
            print(out[:5000])
        if err:
            err_lines = [l for l in err.split('\n') if '[sudo]' not in l and l.strip()]
            if err_lines:
                print('\n'.join(err_lines[:2000]))

    print("\n[OK] Fix complete!")
    client.close()

if __name__ == "__main__":
    main()
