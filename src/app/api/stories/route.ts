import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const featured = searchParams.get('featured')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const where: any = {
      publishedAt: {
        lte: new Date(),
      },
    }

    if (featured === 'true') {
      where.featured = true
    }

    const skip = (page - 1) * limit

    const [stories, total] = await Promise.all([
      prisma.story.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          publishedAt: 'desc',
        },
      }),
      prisma.story.count({ where }),
    ])

    return NextResponse.json({
      stories,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching stories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stories' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  // 管理员鉴权
  const authError = await requireAdmin()
  if (authError) return authError

  try {
    const body = await request.json()
    const { title, slug, content, excerpt, image, author, publishedAt } = body

    const story = await prisma.story.create({
      data: {
        title,
        slug,
        content,
        excerpt,
        image,
        author,
        publishedAt: publishedAt ? new Date(publishedAt) : new Date(),
      },
    })

    return NextResponse.json(story, { status: 201 })
  } catch (error) {
    console.error('Error creating story:', error)
    return NextResponse.json(
      { error: 'Failed to create story' },
      { status: 500 }
    )
  }
}
