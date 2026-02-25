import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getStripe } from '@/lib/stripe'
import { getResend } from '@/lib/resend'
import { OrderConfirmationEmail } from '@/emails/OrderConfirmation'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event
  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Stripe webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const orderId = session.metadata?.orderId

    if (!orderId) {
      console.error('No orderId in Stripe session metadata')
      return NextResponse.json({ received: true })
    }

    // Idempotent: skip if already PAID
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    })

    if (!order || order.status !== 'PENDING') {
      return NextResponse.json({ received: true })
    }

    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'PAID',
        paymentId: session.payment_intent as string,
      },
    })

    // Send confirmation email
    try {
      if (process.env.RESEND_API_KEY) {
        await getResend().emails.send({
          from: process.env.EMAIL_FROM || 'Gene X Labs <noreply@genexlabs.com>',
          to: order.shippingEmail,
          subject: `Order Confirmed - #${order.id.slice(-8)}`,
          react: OrderConfirmationEmail({
            orderId: order.id,
            items: order.items.map((i) => ({
              name: i.productName,
              quantity: i.quantity,
              price: Number(i.priceAtTime),
            })),
            total: Number(order.total),
            shippingName: order.shippingName,
          }),
        })
      }
    } catch (emailErr) {
      console.error('Failed to send order confirmation email:', emailErr)
    }
  }

  return NextResponse.json({ received: true })
}
