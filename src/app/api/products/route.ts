import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { slugify } from '@/lib/utils'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const q = searchParams.get('q')

  const products = await prisma.product.findMany({
    where: {
      ...(category && { categories: { has: category } }),
      ...(q && {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
          { productCode: { contains: q, mode: 'insensitive' } },
        ],
      }),
    },
    orderBy: { name: 'asc' },
    include: { variants: { orderBy: { sortOrder: 'asc' } } },
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

  const { id, name, description, price, dosage, categories, researchFocus, image, images, inStock, variants } = await request.json()
  if (!id) {
    return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
  }

  const data: Record<string, unknown> = {}

  if (name !== undefined) data.name = name
  if (description !== undefined) data.description = description
  if (dosage !== undefined) data.dosage = dosage
  if (categories !== undefined) data.categories = categories
  if (researchFocus !== undefined) data.researchFocus = researchFocus
  if (image !== undefined) data.image = image
  if (images !== undefined) data.images = images
  if (inStock !== undefined) data.inStock = inStock

  if (price !== undefined) {
    if (typeof price !== 'number' || price <= 0) {
      return NextResponse.json({ error: 'Price must be greater than 0' }, { status: 400 })
    }
    data.price = price
  }

  // Auto-regenerate slug when name changes
  if (name !== undefined) {
    const newSlug = slugify(name)
    const existing = await prisma.product.findFirst({
      where: { slug: newSlug, id: { not: id } },
    })
    if (existing) {
      return NextResponse.json({ error: 'A product with this name already exists' }, { status: 400 })
    }
    data.slug = newSlug
  }

  const product = await prisma.product.update({
    where: { id },
    data,
  })

  // When variants key is present, replace all variants
  if (variants !== undefined) {
    await prisma.productVariant.deleteMany({ where: { productId: id } })
    if (Array.isArray(variants) && variants.length > 0) {
      await prisma.productVariant.createMany({
        data: variants.map((v: { label: string; price: number; sortOrder?: number }, i: number) => ({
          productId: id,
          label: v.label,
          price: v.price,
          sortOrder: v.sortOrder ?? i,
        })),
      })
    }
  }

  return NextResponse.json({ product })
}
