import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const story = await prisma.story.findUnique({
      where: { slug },
    })

    if (!story) {
      return NextResponse.json(
        { error: 'Story not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(story)
  } catch (error) {
    console.error('Error fetching story:', error)
    return NextResponse.json(
      { error: 'Failed to fetch story' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  // 管理员鉴权
  const authError = await requireAdmin()
  if (authError) return authError

  try {
    const { slug } = await params
    const body = await request.json()
    const story = await prisma.story.update({
      where: { slug },
      data: body,
    })

    return NextResponse.json(story)
  } catch (error) {
    console.error('Error updating story:', error)
    return NextResponse.json(
      { error: 'Failed to update story' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  // 管理员鉴权
  const authError = await requireAdmin()
  if (authError) return authError

  try {
    const { slug } = await params
    await prisma.story.delete({
      where: { slug },
    })

    return NextResponse.json({ message: 'Story deleted successfully' })
  } catch (error) {
    console.error('Error deleting story:', error)
    return NextResponse.json(
      { error: 'Failed to delete story' },
      { status: 500 }
    )
  }
}
