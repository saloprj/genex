import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { CATEGORIES } from '@/lib/constants'

async function ensureSeeded() {
  const count = await prisma.category.count()
  if (count === 0) {
    await prisma.category.createMany({
      data: CATEGORIES.map((c, i) => ({ slug: c.slug, label: c.label, sortOrder: i })),
    })
  }
}

export async function GET() {
  await ensureSeeded()
  const categories = await prisma.category.findMany({ orderBy: { sortOrder: 'asc' } })
  return NextResponse.json({ categories })
}

export async function POST(req: NextRequest) {
  const { label } = await req.json()
  if (!label?.trim()) return NextResponse.json({ error: 'Label is required' }, { status: 400 })
  const slug = label.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  const existing = await prisma.category.findUnique({ where: { slug } })
  if (existing) return NextResponse.json({ error: 'A category with this slug already exists' }, { status: 400 })
  const count = await prisma.category.count()
  const category = await prisma.category.create({ data: { slug, label: label.trim(), sortOrder: count } })
  return NextResponse.json({ category })
}

export async function PATCH(req: NextRequest) {
  const { id, label } = await req.json()
  if (!id || !label?.trim()) return NextResponse.json({ error: 'id and label are required' }, { status: 400 })
  const category = await prisma.category.update({ where: { id }, data: { label: label.trim() } })
  return NextResponse.json({ category })
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })
  const cat = await prisma.category.findUnique({ where: { id } })
  if (!cat) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const productCount = await prisma.product.count({ where: { category: cat.slug } })
  if (productCount > 0) {
    return NextResponse.json({ error: `Cannot delete: ${productCount} product(s) use this category` }, { status: 400 })
  }
  await prisma.category.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
