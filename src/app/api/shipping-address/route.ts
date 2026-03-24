export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Prefer dedicated saved address, fall back to last order
  const saved = await (prisma as any).shippingAddress.findUnique({
    where: { userId: user.id },
  })

  if (saved) {
    return NextResponse.json({
      name: saved.name,
      address1: saved.address1,
      address2: saved.address2,
      city: saved.city,
      state: saved.state,
      postalCode: saved.postalCode,
      country: saved.country,
    })
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

export async function PUT(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { name, address1, address2, city, state, postalCode, country } = await request.json()

  await (prisma as any).shippingAddress.upsert({
    where: { userId: user.id },
    create: { id: `sa_${user.id}`, userId: user.id, name, address1, address2: address2 ?? '', city, state: state ?? '', postalCode, country },
    update: { name, address1, address2: address2 ?? '', city, state: state ?? '', postalCode, country },
  })

  return NextResponse.json({ ok: true })
}
