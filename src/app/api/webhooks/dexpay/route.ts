import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyWebhookSignature } from '@/lib/dexpay'
import { getResend } from '@/lib/resend'
import { OrderConfirmationEmail } from '@/emails/OrderConfirmation'

// Dexpay invoice status codes: 1=Waiting, 2=Canceled, 3=Fulfilled, 4=Other
const FULFILLED_STATUS = 3

// Dexpay probes the URL with GET to validate it during webhook registration
export async function GET() {
  return NextResponse.json({ ok: true })
}

export async function POST(request: NextRequest) {
  const body = await request.text()

  // Dexpay sends signature in api-signature header
  const signature = request.headers.get('api-signature') || ''

  if (!verifyWebhookSignature(body, signature)) {
    console.error('Dexpay webhook: invalid or missing signature')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  let event: Record<string, unknown>
  try {
    event = JSON.parse(body)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Webhook body: {"event_type":"invoice_update","payload":[{invoice}, ...]}
  const payloadArr = event.payload as Record<string, unknown>[] | undefined
  const invoice = payloadArr?.[0] ?? (event.data as Record<string, unknown>) ?? event
  const status = Number(invoice.status)

  console.log('Dexpay webhook received, status:', status, 'orderId:', invoice.public_id ?? invoice.order_id)

  if (status === FULFILLED_STATUS) {
    const orderId = (invoice.public_id ?? invoice.order_id) as string | undefined

    if (!orderId) {
      console.error('Dexpay webhook: no orderId in payload', event)
      return NextResponse.json({ received: true })
    }

    // Idempotent: skip if already PAID
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    })

    if (!order) {
      console.error('Dexpay webhook: order not found:', orderId)
      return NextResponse.json({ received: true })
    }

    if (order.status !== 'PENDING') {
      console.log('Dexpay webhook: order already processed, status:', order.status, 'orderId:', orderId)
      return NextResponse.json({ received: true })
    }

    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'PAID',
        paymentId: String(invoice.id ?? invoice.public_id ?? ''),
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
