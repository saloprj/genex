import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createCharge } from '@/lib/coinbase'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { orderId } = await request.json()

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 })
    }

    const order = await prisma.order.findFirst({
      where: { id: orderId, userId: user.id, status: 'PENDING' },
      include: { items: true },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    const charge = await createCharge({
      name: `Gene X Labs Order #${order.id.slice(-8)}`,
      description: order.items.map((i) => `${i.productName} x${i.quantity}`).join(', '),
      amount: Number(order.total).toFixed(2),
      currency: 'USD',
      metadata: {
        orderId: order.id,
      },
      redirectUrl: `${appUrl}/checkout/success?orderId=${order.id}`,
      cancelUrl: `${appUrl}/checkout`,
    })

    return NextResponse.json({ url: charge.hosted_url })
  } catch (error) {
    console.error('Coinbase checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create crypto checkout' },
      { status: 500 }
    )
  }
}
