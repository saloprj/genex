import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyWebhookSignature } from '@/lib/coinbase'
import { getResend } from '@/lib/resend'
import { OrderConfirmationEmail } from '@/emails/OrderConfirmation'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('x-cc-webhook-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  try {
    const isValid = verifyWebhookSignature(body, signature)
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }
  } catch {
    return NextResponse.json({ error: 'Signature verification failed' }, { status: 400 })
  }

  const event = JSON.parse(body)
  const eventType = event.event?.type

  if (eventType === 'charge:confirmed' || eventType === 'charge:resolved') {
    const orderId = event.event?.data?.metadata?.orderId

    if (!orderId) {
      console.error('No orderId in Coinbase webhook metadata')
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
        paymentId: event.event?.data?.id || null,
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
