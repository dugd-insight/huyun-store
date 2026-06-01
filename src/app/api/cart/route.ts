import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { cookies } from 'next/headers'

interface CartItemWithProduct {
  id: string
  cartId: string
  productId: string
  quantity: number
  product: {
    id: string
    name: string
    price: number
    images: string[]
  }
}

async function getOrCreateCart(userId?: string, sessionId?: string) {
  if (userId) {
    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } },
    })
    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
        include: { items: { include: { product: true } } },
      })
    }
    return cart
  }

  if (sessionId) {
    let cart = await prisma.cart.findUnique({
      where: { sessionId },
      include: { items: { include: { product: true } } },
    })
    if (!cart) {
      cart = await prisma.cart.create({
        data: { sessionId },
        include: { items: { include: { product: true } } },
      })
    }
    return cart
  }

  return null
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    const cookieStore = await cookies()
    const sessionId = cookieStore.get('cart-session-id')?.value
    const userId = session?.user?.id

    const cart = await getOrCreateCart(userId, sessionId)

    if (!cart) {
      return NextResponse.json({ items: [], total: 0 })
    }

    const items = cart.items as unknown as CartItemWithProduct[]
    const total = items.reduce(
      (sum, item) => sum + Number(item.product.price) * item.quantity,
      0
    )

    return NextResponse.json({
      items: cart.items,
      total,
    })
  } catch (error) {
    console.error('Error fetching cart:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cart' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId, quantity } = body

    const session = await getServerSession()
    const cookieStore = await cookies()
    let sessionId = cookieStore.get('cart-session-id')?.value

    if (!session?.user?.id && !sessionId) {
      sessionId = crypto.randomUUID()
    }

    const userId = session?.user?.id

    const cart = await getOrCreateCart(userId, sessionId)

    if (!cart) {
      return NextResponse.json(
        { error: 'Failed to create cart' },
        { status: 500 }
      )
    }

    const items = cart.items as unknown as CartItemWithProduct[]
    const existingItem = items.find(
      (item) => item.productId === productId
    )

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      })
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
        },
      })
    }

    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: { items: { include: { product: true } } },
    })

    const updatedItems = updatedCart?.items as unknown as CartItemWithProduct[] || []
    const total = updatedItems.reduce(
      (sum, item) => sum + Number(item.product.price) * item.quantity,
      0
    )

    const response = NextResponse.json({
      items: updatedCart?.items || [],
      total,
    })

    if (sessionId && !userId) {
      response.cookies.set('cart-session-id', sessionId, {
        maxAge: 60 * 60 * 24 * 30,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
      })
    }

    return response
  } catch (error) {
    console.error('Error adding to cart:', error)
    return NextResponse.json(
      { error: 'Failed to add to cart' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { itemId, quantity } = body

    if (quantity <= 0) {
      await prisma.cartItem.delete({
        where: { id: itemId },
      })
    } else {
      await prisma.cartItem.update({
        where: { id: itemId },
        data: { quantity },
      })
    }

    return NextResponse.json({ message: 'Cart updated' })
  } catch (error) {
    console.error('Error updating cart:', error)
    return NextResponse.json(
      { error: 'Failed to update cart' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const itemId = searchParams.get('itemId')

    if (itemId) {
      await prisma.cartItem.delete({
        where: { id: itemId },
      })
    } else {
      const session = await getServerSession()
      const cookieStore = await cookies()
      const sessionId = cookieStore.get('cart-session-id')?.value
      const userId = session?.user?.id

      const cart = await prisma.cart.findFirst({
        where: {
          OR: [{ userId }, { sessionId }],
        },
      })

      if (cart) {
        await prisma.cartItem.deleteMany({
          where: { cartId: cart.id },
        })
      }
    }

    return NextResponse.json({ message: 'Item removed from cart' })
  } catch (error) {
    console.error('Error removing from cart:', error)
    return NextResponse.json(
      { error: 'Failed to remove from cart' },
      { status: 500 }
    )
  }
}
