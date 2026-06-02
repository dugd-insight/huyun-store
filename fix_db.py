#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Fix database connection and rebuild"""

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

    # Step 1: Check database status
    print("="*50)
    print("Step 1: Checking PostgreSQL status...")
    print("="*50)
    out, _ = run_cmd(client, "systemctl status postgresql --no-pager | head -5", sudo=True)
    print(out)

    # Step 2: Check if database exists
    print("="*50)
    print("Step 2: Checking database...")
    print("="*50)
    out, _ = run_cmd(client, "sudo -u postgres psql -c '\\l' | grep huyun", sudo=True)
    print(out)

    # Step 3: Create database and user if needed
    print("="*50)
    print("Step 3: Ensuring database and user exist...")
    print("="*50)
    db_commands = [
        "sudo -u postgres psql -c \"SELECT 1 FROM pg_roles WHERE rolname='huyun_store_user'\" | grep -c 1",
    ]
    out, _ = run_cmd(client, db_commands[0], sudo=True)
    user_exists = out.strip()

    if user_exists == "0":
        print("  Creating user and database...")
        run_cmd(client, "sudo -u postgres psql -c \"CREATE USER huyun_store_user WITH PASSWORD 'HuyunPass2024';\"", sudo=True)
        run_cmd(client, "sudo -u postgres psql -c \"CREATE DATABASE huyun_store OWNER huyun_store_user;\"", sudo=True)
        run_cmd(client, "sudo -u postgres psql -c \"GRANT ALL PRIVILEGES ON DATABASE huyun_store TO huyun_store_user;\"", sudo=True)
        run_cmd(client, "sudo -u postgres psql -c \"ALTER USER huyun_store_user WITH SUPERUSER;\"", sudo=True)
        print("  [OK] User and database created")
    else:
        print("  [OK] User already exists")

    # Step 4: Test database connection
    print("="*50)
    print("Step 4: Testing database connection...")
    print("="*50)
    out, err = run_cmd(client, "cd /var/www/huyun-store && npx prisma db pull --print 2>&1 | head -10", sudo=False)
    print(out)
    if err:
        print(f"  Error: {err[:500]}")

    # Step 5: Run Prisma migrations
    print("="*50)
    print("Step 5: Running Prisma migrations...")
    print("="*50)
    out, err = run_cmd(client, "cd /var/www/huyun-store && npx prisma migrate deploy 2>&1", sudo=False)
    print(out)
    if err:
        print(f"  Error: {err[:500]}")

    # Step 6: Generate Prisma client
    print("="*50)
    print("Step 6: Generating Prisma client...")
    print("="*50)
    out, _ = run_cmd(client, "cd /var/www/huyun-store && npx prisma generate", sudo=False)
    print(out[:500])

    # Step 7: Rebuild
    print("="*50)
    print("Step 7: Rebuilding app...")
    print("="*50)
    out, err = run_cmd(client, "cd /var/www/huyun-store && npm run build 2>&1", sudo=False)
    # Show last 3000 chars
    print(out[-3000:] if len(out) > 3000 else out)

    # Step 8: Fix permissions
    print("="*50)
    print("Step 8: Fixing permissions...")
    print("="*50)
    run_cmd(client, "chown -R ubuntu:ubuntu /var/www/huyun-store/.next", sudo=True)

    # Step 9: Restart PM2
    print("="*50)
    print("Step 9: Restarting PM2...")
    print("="*50)
    out, _ = run_cmd(client, "pm2 restart huyun-store", sudo=False)
    print(out)

    # Step 10: Wait and test
    import time
    time.sleep(15)

    print("="*50)
    print("Step 10: Testing...")
    print("="*50)

    # Check BUILD_ID
    out, _ = run_cmd(client, "cat /var/www/huyun-store/.next/BUILD_ID", sudo=False)
    print(f"  BUILD_ID: {out.strip()}")

    # Check API
    out, _ = run_cmd(client, "curl -s http://localhost:3000/api/products | head -c 200", sudo=False)
    print(f"  /api/products: {out[:200]}")

    # Check page content
    out, _ = run_cmd(client, "curl -s http://localhost:3000/ | grep -c 'HeroCarousel\\|category-card\\|工艺分类'", sudo=False)
    print(f"  Shop content matches: {out.strip()}")

    print("\n[DONE] Database fix complete!")

    client.close()

if __name__ == "__main__":
    main()
