import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { registerWebhook } from '@/lib/dexpay'

// One-time endpoint to register Dexpay webhook and get the private_key.
// Call: POST /api/admin/dexpay-setup  (admin only)
export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map((e) => e.trim())
  if (!user || !adminEmails.includes(user.email || '')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://genexpep.com'
  const webhookUrl = `${appUrl}/api/webhooks/dexpay`

  try {
    const result = await registerWebhook(webhookUrl)
    return NextResponse.json({
      ok: true,
      webhookUrl,
      id: result.id,
      private_key: result.private_key,
      public_key: result.public_key,
      note: 'Set DEXPAY_WEBHOOK_SECRET to the private_key value above, then rebuild.',
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to register webhook' },
      { status: 500 }
    )
  }
}
