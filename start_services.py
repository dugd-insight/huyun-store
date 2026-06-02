#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Start services"""

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
        f"echo '{PASSWORD}' | sudo -S systemctl start nginx",
        f"echo '{PASSWORD}' | sudo -S systemctl enable nginx",
        f"echo '{PASSWORD}' | sudo -S systemctl status nginx --no-pager",
        "pm2 list",
        "pm2 logs huyun-store --lines 10 --nostream",
    ]

    for cmd in commands:
        print(f"\n{'='*40}")
        stdin, stdout, stderr = client.exec_command(cmd)
        out = stdout.read().decode('utf-8', errors='ignore')
        err = stderr.read().decode('utf-8', errors='ignore')
        if out:
            print(out)
        if err:
            err_lines = [l for l in err.split('\n') if '[sudo]' not in l and l.strip()]
            if err_lines:
                print('\n'.join(err_lines))

    client.close()

if __name__ == "__main__":
    main()
