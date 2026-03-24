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

  // currency_id 5 = USDT_TRX (base/reference for amount).
  // supported_currencies enables multi-currency selection UI on payment page:
  // 5=USDT_TRX, 6=USDT_ETH, 87=USDT_BSC, 1=ETH, 4=BTC
  // Note: converted_coin_id causes 500 errors from Dexpay API — do not use.
  const body: Record<string, unknown> = {
    project_name: process.env.DEXPAY_PROJECT_NAME!,
    public_id: params.orderId,
    vault_id: parseInt(process.env.DEXPAY_VAULT_ID!),
    currency_id: 5,
    amount_requested: amountBaseUnits,
    supported_currencies: [5, 6, 87, 4],
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
