import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const createOrderSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string(),
      productName: z.string(),
      quantity: z.number().int().positive(),
      priceAtTime: z.number().positive(),
      variantId: z.string().optional(),
      variantLabel: z.string().optional(),
    })
  ),
  shipping: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    address1: z.string().min(1),
    address2: z.string().optional().default(''),
    city: z.string().min(1),
    state: z.string().optional().default(''),
    postalCode: z.string().min(1),
    country: z.string().min(1),
  }),
  paymentMethod: z.enum(['STRIPE', 'CRYPTO']),
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = createOrderSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { items, shipping, paymentMethod } = parsed.data

    const subtotal = items.reduce(
      (sum, item) => sum + item.priceAtTime * item.quantity,
      0
    )

    const order = await prisma.order.create({
      data: {
        userId: user.id,
        status: 'PENDING',
        paymentMethod,
        subtotal,
        total: subtotal,
        shippingName: shipping.name,
        shippingEmail: shipping.email,
        shippingAddress1: shipping.address1,
        shippingAddress2: shipping.address2 || null,
        shippingCity: shipping.city,
        shippingState: shipping.state || null,
        shippingPostalCode: shipping.postalCode,
        shippingCountry: shipping.country,
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            priceAtTime: item.priceAtTime,
            variantId: item.variantId,
            variantLabel: item.variantLabel,
          })),
        },
      },
      include: { items: true },
    })

    return NextResponse.json({ orderId: order.id })
  } catch (error) {
    console.error('Order creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('orderId')

    if (orderId) {
      const order = await prisma.order.findFirst({
        where: { id: orderId, userId: user.id },
        include: { items: true },
      })

      if (!order) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      }

      return NextResponse.json({ order })
    }

    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ orders })
  } catch (error) {
    console.error('Order fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}
