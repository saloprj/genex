import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Hr,
  Preview,
  Link,
} from '@react-email/components'

interface WelcomeEmailProps {
  name?: string
}

export function WelcomeEmail({ name }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to Gene X Labs - Your research journey begins</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={heading}>Gene X Labs</Text>
          <Text style={subheading}>Welcome to the Lab</Text>

          <Text style={text}>
            Hi {name || 'Researcher'},
          </Text>
          <Text style={text}>
            Welcome to Gene X Labs. Your access has been verified and you can
            now explore our research compound catalogue.
          </Text>

          <Section style={ctaBox}>
            <Text style={ctaText}>
              Start exploring our research-grade peptides and compounds.
            </Text>
            <Link href={`${process.env.NEXT_PUBLIC_APP_URL || 'https://genexlabs.com'}/shop`} style={button}>
              Browse Catalogue
            </Link>
          </Section>

          <Text style={text}>
            New to peptide research? Check out our Peptides 101 guide for
            a comprehensive introduction to research peptides.
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

const ctaBox = {
  backgroundColor: '#12121a',
  border: '1px solid #1e1e2e',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
  textAlign: 'center' as const,
}

const ctaText = {
  color: '#94a3b8',
  fontSize: '14px',
  margin: '0 0 16px',
}

const button = {
  backgroundColor: '#14b8a6',
  color: '#ffffff',
  padding: '12px 24px',
  borderRadius: '6px',
  fontSize: '14px',
  fontWeight: '600' as const,
  textDecoration: 'none',
}

const hr = {
  borderColor: '#1e1e2e',
  margin: '32px 0 16px',
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
