import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Hr,
  Preview,
} from '@react-email/components'

interface OrderConfirmationEmailProps {
  orderId: string
  items: { name: string; quantity: number; price: number }[]
  total: number
  shippingName: string
}

export function OrderConfirmationEmail({
  orderId,
  items,
  total,
  shippingName,
}: OrderConfirmationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your Gene X Labs order has been confirmed</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={heading}>Gene X Labs</Text>
          <Text style={subheading}>Order Confirmed</Text>

          <Text style={text}>Hi {shippingName},</Text>
          <Text style={text}>
            Thank you for your order. Your payment has been confirmed and your
            order is now being processed.
          </Text>

          <Section style={orderBox}>
            <Text style={orderIdText}>
              Order #{orderId.slice(-8)}
            </Text>
            {items.map((item, i) => (
              <Text key={i} style={itemText}>
                {item.name} x{item.quantity} — ${(item.price * item.quantity).toFixed(2)}
              </Text>
            ))}
            <Hr style={hr} />
            <Text style={totalText}>Total: ${total.toFixed(2)}</Text>
          </Section>

          <Text style={text}>
            You will receive a shipping notification once your order has been dispatched.
          </Text>

          <Hr style={hr} />
          <Text style={disclaimer}>
            All products are for research and educational purposes only.
            Not for human consumption.
          </Text>
          <Text style={footer}>Gene X Labs</Text>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: '#0a0a0f',
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
}

const container = {
  margin: '0 auto',
  padding: '40px 20px',
  maxWidth: '560px',
}

const heading = {
  color: '#14b8a6',
  fontSize: '24px',
  fontWeight: '700' as const,
  textAlign: 'center' as const,
  margin: '0 0 4px',
}

const subheading = {
  color: '#f8fafc',
  fontSize: '18px',
  fontWeight: '600' as const,
  textAlign: 'center' as const,
  margin: '0 0 32px',
}

const text = {
  color: '#94a3b8',
  fontSize: '14px',
  lineHeight: '24px',
}

const orderBox = {
  backgroundColor: '#12121a',
  border: '1px solid #1e1e2e',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
}

const orderIdText = {
  color: '#f8fafc',
  fontSize: '14px',
  fontWeight: '600' as const,
  margin: '0 0 12px',
}

const itemText = {
  color: '#94a3b8',
  fontSize: '13px',
  margin: '4px 0',
}

const totalText = {
  color: '#14b8a6',
  fontSize: '16px',
  fontWeight: '700' as const,
  margin: '0',
}

const hr = {
  borderColor: '#1e1e2e',
  margin: '16px 0',
}

const disclaimer = {
  color: '#64748b',
  fontSize: '11px',
  textAlign: 'center' as const,
}

const footer = {
  color: '#64748b',
  fontSize: '12px',
  textAlign: 'center' as const,
  marginTop: '8px',
}
