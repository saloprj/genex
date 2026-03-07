import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

// Dev-only stub: marks order as PAID without a real payment gateway.
// Only available when Supabase is not configured (dev bypass active).
export async function POST(request: NextRequest) {
  const isDevBypass = !process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!isDevBypass) {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { orderId } = await request.json()
  if (!orderId) {
    return NextResponse.json({ error: 'orderId required' }, { status: 400 })
  }

  await prisma.order.update({
    where: { id: orderId },
    data: { status: 'PAID' },
  })

  return NextResponse.json({ url: `/orders?stub=1` })
}
