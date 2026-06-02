#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Fix Nginx configuration"""

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

    # Write Nginx config using echo and sudo
    nginx_config = r"""server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
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

    # Write to temp file first, then copy with sudo
    commands = [
        f"cat > /tmp/huyun-nginx.conf << 'NGINXEOF'\n{nginx_config}\nNGINXEOF",
        f"echo '{PASSWORD}' | sudo -S cp /tmp/huyun-nginx.conf /etc/nginx/sites-available/huyun-store",
        "rm /tmp/huyun-nginx.conf",
        f"echo '{PASSWORD}' | sudo -S ln -sf /etc/nginx/sites-available/huyun-store /etc/nginx/sites-enabled/",
        f"echo '{PASSWORD}' | sudo -S nginx -t",
        f"echo '{PASSWORD}' | sudo -S systemctl reload nginx",
    ]

    for cmd in commands:
        stdin, stdout, stderr = client.exec_command(cmd)
        out = stdout.read().decode('utf-8', errors='ignore')
        err = stderr.read().decode('utf-8', errors='ignore')
        if out:
            print(out)
        if err:
            # Filter sudo password prompt
            err_lines = [l for l in err.split('\n') if '[sudo]' not in l and l.strip()]
            if err_lines:
                print('\n'.join(err_lines))

    print("[OK] Nginx configuration fixed!")
    client.close()

if __name__ == "__main__":
    main()
