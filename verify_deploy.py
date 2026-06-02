#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Verify deployment"""

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
    stdin, stdout, stderr = client.exec_command(cmd)
    out = stdout.read().decode('utf-8', errors='ignore')
    err = stderr.read().decode('utf-8', errors='ignore')
    return out, err

def main():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(HOST, port=PORT, username=USERNAME, password=PASSWORD)

    # Clear PM2 logs
    print("Clearing PM2 logs...")
    run_cmd(client, "pm2 flush huyun-store", sudo=False)

    # Restart PM2
    print("Restarting PM2...")
    out, err = run_cmd(client, "pm2 restart huyun-store", sudo=False)
    print(out)

    # Wait for app to start
    import time
    time.sleep(15)

    # Check PM2 status
    print("\nPM2 Status:")
    out, err = run_cmd(client, "pm2 list", sudo=False)
    print(out)

    # Check recent logs
    print("\nRecent Logs:")
    out, err = run_cmd(client, "pm2 logs huyun-store --lines 30 --nostream", sudo=False)
    print(out)

    # Check if .next directory exists
    print("\nChecking .next directory:")
    out, err = run_cmd(client, "ls -la /var/www/huyun-store/.next/ 2>/dev/null | head -20", sudo=False)
    print(out)

    # Check if app is responding
    print("\nTesting HTTP response:")
    out, err = run_cmd(client, "curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/ 2>/dev/null || echo 'Failed'", sudo=False)
    print(f"HTTP Status: {out}")

    print("\n[OK] Verification complete!")
    print(f"[URL] Access URL: http://{HOST}")

    client.close()

if __name__ == "__main__":
    main()
