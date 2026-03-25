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

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const successUrl = `${appUrl}/checkout/success?orderId=${order.id}`

    let invoice
    try {
      invoice = await createInvoice({
        orderId: order.id,
        amount: Number(order.total).toFixed(2),
        customerEmail: order.shippingEmail,
        description: order.items
          .map((item: { productName: string; quantity: number }) => `${item.productName} x${item.quantity}`)
          .join(', '),
      })
    } catch (invoiceError) {
      console.error('Dexpay invoice creation failed, cancelling order:', invoiceError)
      await prisma.order.update({
        where: { id: order.id },
        data: { status: 'CANCELLED' },
      })
      throw invoiceError
    }

    let paymentUrl = invoice.payment_page_url
    try {
      const u = new URL(paymentUrl)
      u.searchParams.set('success_url', successUrl)
      paymentUrl = u.toString()
    } catch {
      const sep = paymentUrl.includes('?') ? '&' : '?'
      paymentUrl = `${paymentUrl}${sep}success_url=${encodeURIComponent(successUrl)}`
    }

    return NextResponse.json({ url: paymentUrl })
  } catch (error) {
    console.error('Dexpay checkout error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create crypto checkout' },
      { status: 500 }
    )
  }
}
