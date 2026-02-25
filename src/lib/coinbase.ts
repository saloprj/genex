import crypto from 'crypto'

const COINBASE_API_URL = 'https://api.commerce.coinbase.com'

interface CreateChargeParams {
  name: string
  description: string
  amount: string
  currency: string
  metadata: Record<string, string>
  redirectUrl: string
  cancelUrl: string
}

export async function createCharge(params: CreateChargeParams) {
  const response = await fetch(`${COINBASE_API_URL}/charges`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CC-Api-Key': process.env.COINBASE_COMMERCE_API_KEY!,
      'X-CC-Version': '2018-03-22',
    },
    body: JSON.stringify({
      name: params.name,
      description: params.description,
      pricing_type: 'fixed_price',
      local_price: {
        amount: params.amount,
        currency: params.currency,
      },
      metadata: params.metadata,
      redirect_url: params.redirectUrl,
      cancel_url: params.cancelUrl,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Coinbase Commerce error: ${error}`)
  }

  const data = await response.json()
  return data.data
}

export function verifyWebhookSignature(
  rawBody: string,
  signature: string
): boolean {
  const hmac = crypto.createHmac(
    'sha256',
    process.env.COINBASE_COMMERCE_WEBHOOK_SECRET!
  )
  hmac.update(rawBody)
  const computedSignature = hmac.digest('hex')
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(computedSignature)
  )
}
