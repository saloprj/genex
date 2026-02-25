import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const q = searchParams.get('q')

  const products = await prisma.product.findMany({
    where: {
      ...(category && { category }),
      ...(q && {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
          { productCode: { contains: q, mode: 'insensitive' } },
        ],
      }),
    },
    orderBy: { name: 'asc' },
  })

  return NextResponse.json({ products })
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const adminEmails = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
  if (!adminEmails.includes(user.email.toLowerCase())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id, ...data } = await request.json()
  if (!id) {
    return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
  }

  const product = await prisma.product.update({
    where: { id },
    data,
  })

  return NextResponse.json({ product })
}
