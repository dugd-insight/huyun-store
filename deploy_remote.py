#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Remote deployment script using paramiko
"""

import paramiko
import sys
import time
import io

# Server configuration
HOST = "140.143.159.15"
PORT = 22
USERNAME = "ubuntu"
PASSWORD = "dugd&198778"

# Set stdout encoding to utf-8
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

def create_ssh_client():
    """Create SSH client connection"""
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(HOST, port=PORT, username=USERNAME, password=PASSWORD)
    return client

def execute_command(client, command, sudo=False):
    """Execute remote command"""
    if sudo:
        command = f"echo '{PASSWORD}' | sudo -S bash -c \"{command}\""

    print(f"\n{'='*60}")
    print(f"Executing: {command[:80]}...")
    print('='*60)

    stdin, stdout, stderr = client.exec_command(command)

    # Get output
    output = stdout.read().decode('utf-8', errors='ignore')
    error = stderr.read().decode('utf-8', errors='ignore')

    if output:
        print("Output:")
        print(output[:2000])

    if error:
        # Filter out sudo password prompt
        error_lines = [line for line in error.split('\n') if '[sudo]' not in line and line.strip()]
        if error_lines:
            print("Error:")
            print('\n'.join(error_lines[:500]))

    return stdout.channel.recv_exit_status(), output, error

def main():
    """Main function"""
    print("[START] Starting remote deployment of HUYUN Store...")
    print(f"Server: {HOST}")
    print(f"Username: {USERNAME}")

    try:
        # Create SSH connection
        print("\n[CONNECT] Connecting to server...")
        client = create_ssh_client()
        print("[OK] SSH connection successful!")

        # Step 1: Clean up old deployment
        print("\n" + "="*60)
        print("Step 1/6: Cleaning up old deployment...")
        print("="*60)

        cleanup_commands = [
            "pm2 stop huyun-store 2>/dev/null || true",
            "pm2 delete huyun-store 2>/dev/null || true",
            "pm2 save 2>/dev/null || true",
            "rm -rf /var/www/huyun-store",
            "rm -f /etc/nginx/sites-available/huyun-store",
            "rm -f /etc/nginx/sites-enabled/huyun-store",
        ]

        for cmd in cleanup_commands:
            execute_command(client, cmd, sudo=True)

        # Step 2: Install system dependencies
        print("\n" + "="*60)
        print("Step 2/6: Installing system dependencies...")
        print("="*60)

        install_commands = [
            "apt-get update -qq",
            "apt-get install -y curl git",
        ]

        for cmd in install_commands:
            execute_command(client, cmd, sudo=True)

        # Step 3: Install Node.js 20
        print("\n" + "="*60)
        print("Step 3/6: Installing Node.js 20...")
        print("="*60)

        node_commands = [
            "curl -fsSL https://deb.nodesource.com/setup_20.x | bash -",
            "apt-get install -y nodejs",
            "node -v",
            "npm -v",
            "npm install -g pm2",
        ]

        for cmd in node_commands:
            execute_command(client, cmd, sudo=True)

        # Step 4: Clone code
        print("\n" + "="*60)
        print("Step 4/6: Cloning code...")
        print("="*60)

        clone_commands = [
            "mkdir -p /var/www",
            "cd /var/www && git clone https://github.com/dugd-insight/huyun-store.git huyun-store",
        ]

        for cmd in clone_commands:
            execute_command(client, cmd, sudo=True)

        # Step 5: Install dependencies and build
        print("\n" + "="*60)
        print("Step 5/6: Installing dependencies and building...")
        print("="*60)

        # First install npm dependencies
        execute_command(client, "cd /var/www/huyun-store && npm install", sudo=True)

        # Create .env file
        env_content = """# Database
DATABASE_URL="postgresql://huyun-store_user:HuyunPass2024@localhost:5432/huyun-store"

# NextAuth
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
NEXTAUTH_URL="http://localhost:3000"
"""
        execute_command(client, f"cd /var/www/huyun-store && echo '{env_content}' > .env", sudo=True)

        # Generate Prisma client and build
        execute_command(client, "cd /var/www/huyun-store && npx prisma generate", sudo=True)
        execute_command(client, "cd /var/www/huyun-store && npm run build", sudo=True)

        # Step 6: Configure PM2 and Nginx
        print("\n" + "="*60)
        print("Step 6/6: Configuring PM2 and Nginx...")
        print("="*60)

        pm2_commands = [
            "cd /var/www/huyun-store && pm2 start npm --name huyun-store -- start",
            "pm2 save",
        ]

        for cmd in pm2_commands:
            execute_command(client, cmd, sudo=True)

        # Configure Nginx
        nginx_config = """server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /api/payment/webhook {
        proxy_pass http://localhost:3000;
        proxy_read_timeout 60s;
        proxy_connect_timeout 60s;
    }
}"""

        execute_command(client, f"echo '{nginx_config}' > /etc/nginx/sites-available/huyun-store", sudo=True)
        execute_command(client, "ln -sf /etc/nginx/sites-available/huyun-store /etc/nginx/sites-enabled/", sudo=True)
        execute_command(client, "rm -f /etc/nginx/sites-enabled/default", sudo=True)
        execute_command(client, "nginx -t && systemctl reload nginx", sudo=True)

        # Get server IP
        print("\n" + "="*60)
        print("Deployment Complete!")
        print("="*60)

        execute_command(client, "curl -s ifconfig.me", sudo=False)

        print("\n[SUCCESS] Deployment successful!")
        print("[URL] Access URL: http://140.143.159.15")
        print("[ADMIN] Admin Panel: http://140.143.159.15/admin")

        client.close()
        return 0

    except Exception as e:
        print(f"\n[ERROR] Deployment failed: {e}")
        import traceback
        traceback.print_exc()
        return 1

if __name__ == "__main__":
    sys.exit(main())
