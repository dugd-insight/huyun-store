#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Seed database with initial data"""

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
    stdin, stdout, stderr = client.exec_command(cmd, timeout=120)
    out = stdout.read().decode('utf-8', errors='ignore')
    err = stderr.read().decode('utf-8', errors='ignore')
    return out, err

def main():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(HOST, port=PORT, username=USERNAME, password=PASSWORD)

    # Create seed script on server
    seed_script = '''
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'pyrography' },
      update: {},
      create: {
        name: '烙画葫芦',
        slug: 'pyrography',
        description: '以火为墨，千年技艺',
        image: '/images/category-pyrography.jpg',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'carved' },
      update: {},
      create: {
        name: '雕刻葫芦',
        slug: 'carved',
        description: '精雕细琢，巧夺天工',
        image: '/images/category-carved.jpg',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'painted' },
      update: {},
      create: {
        name: '彩绘葫芦',
        slug: 'painted',
        description: '彩绘生辉，寓意吉祥',
        image: '/images/category-painted.jpg',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'natural' },
      update: {},
      create: {
        name: '素葫芦',
        slug: 'natural',
        description: '天然本色，返璞归真',
        image: '/images/category-natural.jpg',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'teaset' },
      update: {},
      create: {
        name: '葫芦茶具',
        slug: 'teaset',
        description: '茶韵悠长，壶中天地',
        image: '/images/category-teaset.jpg',
      },
    }),
  ])
  console.log(`Created ${categories.length} categories`)

  // Create products
  const products = await Promise.all([
    prisma.product.upsert({
      where: { slug: 'traditional-pyrography-landscape' },
      update: {},
      create: {
        name: '传统烙画山水葫芦',
        slug: 'traditional-pyrography-landscape',
        description: '传统烙画山水葫芦，精美绝伦',
        price: 1280,
        originalPrice: 1580,
        images: ['/images/product-1.jpg'],
        categoryId: categories[0].id,
        stock: 50,
        featured: true,
      },
    }),
    prisma.product.upsert({
      where: { slug: 'carved-dragon-gourd-vase' },
      update: {},
      create: {
        name: '精雕双龙戏珠葫芦瓶',
        slug: 'carved-dragon-gourd-vase',
        description: '精雕双龙戏珠葫芦瓶，工艺精湛',
        price: 2680,
        images: ['/images/product-2.jpg'],
        categoryId: categories[1].id,
        stock: 30,
        featured: true,
      },
    }),
    prisma.product.upsert({
      where: { slug: 'painted-fortune-gourd' },
      update: {},
      create: {
        name: '彩绘福禄寿葫芦',
        slug: 'painted-fortune-gourd',
        description: '彩绘福禄寿葫芦，寓意吉祥',
        price: 880,
        originalPrice: 1080,
        images: ['/images/product-3.jpg'],
        categoryId: categories[2].id,
        stock: 100,
        featured: true,
      },
    }),
    prisma.product.upsert({
      where: { slug: 'natural-large-gourd' },
      update: {},
      create: {
        name: '天然素面大葫芦',
        slug: 'natural-large-gourd',
        description: '天然素面大葫芦，返璞归真',
        price: 580,
        images: ['/images/product-4.jpg'],
        categoryId: categories[3].id,
        stock: 200,
        featured: true,
      },
    }),
    prisma.product.upsert({
      where: { slug: 'hollow-carved-gourd-lamp' },
      update: {},
      create: {
        name: '镂空雕花葫芦灯',
        slug: 'hollow-carved-gourd-lamp',
        description: '镂空雕花葫芦灯，精美绝伦',
        price: 2180,
        originalPrice: 2680,
        images: ['/images/product-5.jpg'],
        categoryId: categories[1].id,
        stock: 20,
        featured: true,
      },
    }),
    prisma.product.upsert({
      where: { slug: 'pyrography-birds-gourd' },
      update: {},
      create: {
        name: '烙画百鸟朝凤葫芦',
        slug: 'pyrography-birds-gourd',
        description: '烙画百鸟朝凤葫芦，栩栩如生',
        price: 1880,
        images: ['/images/product-6.jpg'],
        categoryId: categories[0].id,
        stock: 40,
        featured: true,
      },
    }),
    prisma.product.upsert({
      where: { slug: 'painted-peony-gourd' },
      update: {},
      create: {
        name: '彩绘牡丹富贵葫芦',
        slug: 'painted-peony-gourd',
        description: '彩绘牡丹富贵葫芦，富贵吉祥',
        price: 980,
        images: ['/images/product-7.jpg'],
        categoryId: categories[2].id,
        stock: 80,
        featured: true,
      },
    }),
    prisma.product.upsert({
      where: { slug: 'gourd-teaset-collection' },
      update: {},
      create: {
        name: '葫芦茶具套装',
        slug: 'gourd-teaset-collection',
        description: '葫芦茶具套装，茶韵悠长',
        price: 1680,
        originalPrice: 1980,
        images: ['/images/product-8.jpg'],
        categoryId: categories[4].id,
        stock: 60,
        featured: true,
      },
    }),
  ])
  console.log(`Created ${products.length} products`)

  // Create stories
  const stories = await Promise.all([
    prisma.story.upsert({
      where: { slug: 'panda-wine-gourd' },
      update: {},
      create: {
        title: '熊猫酒葫芦',
        slug: 'panda-wine-gourd',
        content: '<p>在中国传统文化中，葫芦一直被视为吉祥的象征。而熊猫作为国宝，更是中华文化的代表。当这两种元素巧妙结合，便诞生了独特的熊猫酒葫芦。</p><p>熊猫酒葫芦以精选天然葫芦为载体，经过匠人的精心设计和雕刻，将憨态可掬的熊猫形象栩栩如生地呈现在葫芦之上。每一个细节都经过反复推敲，力求完美。</p>',
        excerpt: '国宝熊猫与葫芦酒器的奇妙结合，展现中华文化的独特魅力。',
        image: '/images/story-panda-wine-gourd.jpg',
        author: '葫韵工作室',
        publishedAt: new Date(),
      },
    }),
    prisma.story.upsert({
      where: { slug: 'li-bai' },
      update: {},
      create: {
        title: '诗仙李白',
        slug: 'li-bai',
        content: '<p>李白，字太白，号青莲居士，被誉为"诗仙"。他一生嗜酒如命，而葫芦便是他最钟爱的酒器。</p><p>据传，李白常常腰挂葫芦，骑驴漫游天下。每至一处，便取葫芦饮酒，酒兴大发时便挥毫泼墨，留下千古名篇。</p>',
        excerpt: '诗仙李白与葫芦的千年情缘，酒中仙人的浪漫传说。',
        image: '/images/story-li-bai.jpg',
        author: '葫韵工作室',
        publishedAt: new Date(),
      },
    }),
    prisma.story.upsert({
      where: { slug: 'wu-song' },
      update: {},
      create: {
        title: '武松打虎',
        slug: 'wu-song',
        content: '<p>《水浒传》中武松打虎的故事家喻户晓。武松在景阳冈上赤手空拳打死猛虎的壮举，展现了中华民族勇武不屈的精神。</p><p>匠人们以雕刻和彩绘相结合的技法，将武松打虎的精彩瞬间凝固在葫芦之上。</p>',
        excerpt: '水浒英雄武松的经典故事，在葫芦上演绎传奇。',
        image: '/images/story-wu-song.jpg',
        author: '葫韵工作室',
        publishedAt: new Date(),
      },
    }),
    prisma.story.upsert({
      where: { slug: 'eight-immortals' },
      update: {},
      create: {
        title: '八仙传说',
        slug: 'eight-immortals',
        content: '<p>八仙是中国神话传说中的八位仙人，他们各自拥有独特的法器和神通。其中，铁拐李的葫芦尤为著名。</p><p>传说铁拐李的葫芦中装有灵丹妙药，能治百病、起死回生。</p>',
        excerpt: '八仙过海各显神通，葫芦承载着仙人的法力与智慧。',
        image: '/images/story-eight-immortals.jpg',
        author: '葫韵工作室',
        publishedAt: new Date(),
      },
    }),
    prisma.story.upsert({
      where: { slug: 'zhou-xin' },
      update: {},
      create: {
        title: '纣王酒池',
        slug: 'zhou-xin',
        content: '<p>商朝末年，纣王沉迷酒色，以葫芦为酒器，建造了著名的"酒池肉林"。</p><p>据考古发现，早在新石器时代，葫芦就已经被用作酒器和水器。</p>',
        excerpt: '商纣王酒池肉林的奢靡传说，葫芦见证千年兴衰。',
        image: '/images/story-zhou-xin.jpg',
        author: '葫韵工作室',
        publishedAt: new Date(),
      },
    }),
  ])
  console.log(`Created ${stories.length} stories`)

  // Create admin user
  const bcrypt = require('bcryptjs')
  const hashedPassword = await bcrypt.hash('admin123', 10)

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@huyun.com' },
    update: {},
    create: {
      email: 'admin@huyun.com',
      name: '管理员',
      password: hashedPassword,
      role: 'ADMIN',
    },
  })
  console.log(`Created admin user: ${adminUser.email}`)

  console.log('Seeding complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
'''

    # Write seed script to server
    print("Creating seed script...")
    sftp = client.open_sftp()
    with sftp.open('/var/www/huyun-store/seed.js', 'w') as f:
        f.write(seed_script)
    sftp.close()
    print("  [OK] Seed script created")

    # Run seed script
    print("\nRunning seed script...")
    out, err = run_cmd(client, "cd /var/www/huyun-store && node seed.js", sudo=True)
    print(out)
    if err:
        print(f"Errors: {err[:500]}")

    # Verify data
    print("\nVerifying data...")
    out, _ = run_cmd(client, "curl -s http://localhost:3000/api/products | python3 -c 'import sys,json; d=json.load(sys.stdin); print(f\"Products: {len(d[\\\"products\\\"])}\")'", sudo=False)
    print(f"  {out.strip()}")

    out, _ = run_cmd(client, "curl -s http://localhost:3000/api/categories | python3 -c 'import sys,json; d=json.load(sys.stdin); print(f\"Categories: {len(d)}\")'", sudo=False)
    print(f"  {out.strip()}")

    out, _ = run_cmd(client, "curl -s http://localhost:3000/api/stories | python3 -c 'import sys,json; d=json.load(sys.stdin); print(f\"Stories: {len(d[\\\"stories\\\"])}\")'", sudo=False)
    print(f"  {out.strip()}")

    print("\n[DONE] Database seeded!")
    print(f"[URL] http://{HOST}")
    print(f"[ADMIN] http://{HOST}/admin (admin@huyun.com / admin123)")

    client.close()

if __name__ == "__main__":
    main()
