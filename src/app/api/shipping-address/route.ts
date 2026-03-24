export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const lastOrder = await prisma.order.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    select: {
      shippingName: true,
      shippingAddress1: true,
      shippingAddress2: true,
      shippingCity: true,
      shippingState: true,
      shippingPostalCode: true,
      shippingCountry: true,
    },
  })

  if (!lastOrder) {
    return NextResponse.json(null)
  }

  return NextResponse.json({
    name: lastOrder.shippingName,
    address1: lastOrder.shippingAddress1,
    address2: lastOrder.shippingAddress2 ?? '',
    city: lastOrder.shippingCity,
    state: lastOrder.shippingState ?? '',
    postalCode: lastOrder.shippingPostalCode,
    country: lastOrder.shippingCountry,
  })
}
