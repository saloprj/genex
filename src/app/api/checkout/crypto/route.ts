import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createInvoice } from '@/lib/dexpay'
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

    let invoice
    try {
      invoice = await createInvoice({
        orderId: order.id,
        amount: Number(order.total).toFixed(2),
        customerEmail: order.shippingEmail,
        description: order.items.map((i) => `${i.productName} x${i.quantity}`).join(', '),
      })
    } catch (invoiceError) {
      console.error('Dexpay invoice creation failed, cancelling order:', invoiceError)
      await prisma.order.update({
        where: { id: order.id },
        data: { status: 'CANCELLED' },
      })
      throw invoiceError
    }

    return NextResponse.json({ url: invoice.payment_page_url })
  } catch (error) {
    console.error('Dexpay checkout error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create crypto checkout' },
      { status: 500 }
    )
  }
}
