import crypto from 'crypto'

const DEXPAY_API_URL = 'https://dexpay-api.dextrade.com'

function signRequest(body: Record<string, unknown>): string {
  // Sort keys alphabetically, concatenate values (arrays joined without separator), append secret, SHA256
  const sortedKeys = Object.keys(body).sort()
  const concatenated = sortedKeys
    .map((k) => (Array.isArray(body[k]) ? (body[k] as unknown[]).join('') : String(body[k])))
    .join('')
  const toHash = concatenated + process.env.DEXPAY_SECRET_KEY!
  return crypto.createHash('sha256').update(toHash).digest('hex')
}

async function dexpayPost(path: string, body: Record<string, unknown>) {
  const signature = signRequest(body)
  const response = await fetch(`${DEXPAY_API_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Api-Key': process.env.DEXPAY_API_TOKEN!,
      'Api-Signature': signature,
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Dexpay API error (${response.status}): ${error}`)
  }

  return response.json()
}

export interface DexpayInvoice {
  public_id: string
  payment_page_url: string
  status: number
  amount_requested: string
  address: string
}

export async function createInvoice(params: {
  orderId: string
  amount: string
  customerEmail: string
  description: string
}): Promise<DexpayInvoice> {
  // amount_requested must be in base units (8 decimal places): $1 = 100000000
  const amountBaseUnits = Math.round(parseFloat(params.amount) * 1e8).toString()

  // converted_coin_id 80 = USDT (cross-network reference currency).
  // Do NOT include currency_id alongside converted_coin_id — they conflict and cause 500.
  // supported_currencies [5,6,87,1,4]: USDT_TRX, USDT_ETH, USDT_BSC, ETH, BTC — enables currency selector UI.
  const body: Record<string, unknown> = {
    project_name: process.env.DEXPAY_PROJECT_NAME!,
    public_id: params.orderId,
    vault_id: parseInt(process.env.DEXPAY_VAULT_ID!),
    converted_coin_id: 80,
    converted_amount_requested: amountBaseUnits,
    supported_currencies: [5, 6, 87, 1, 4],
    order_id: params.orderId,
    customer_email: params.customerEmail,
    description: params.description,
  }

  return dexpayPost('/invoices/create', body)
}

export async function registerWebhook(url: string): Promise<{ private_key: string; public_key: string; id: number }> {
  const body: Record<string, unknown> = {
    event_type: 'invoice_update',
    name: 'genexpep-invoices',
    project_name: process.env.DEXPAY_PROJECT_NAME!,
    url,
  }
  return dexpayPost('/callbacks/config/create', body)
}

export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const secret = process.env.DEXPAY_WEBHOOK_SECRET
  if (!secret) return false // reject if secret not configured

  const hmac = crypto.createHmac('sha256', secret)
  hmac.update(rawBody)
  const computed = hmac.digest('hex')

  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature.toLowerCase()),
      Buffer.from(computed.toLowerCase())
    )
  } catch {
    return false
  }
}
