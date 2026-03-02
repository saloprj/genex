import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { writeFile, unlink } from 'fs/promises'
import path from 'path'

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp']
const MAX_SIZE = 5 * 1024 * 1024 // 5MB

export async function POST(request: NextRequest) {
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

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'Invalid file type. Allowed: png, jpg, webp' }, { status: 400 })
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'File too large. Max 5MB' }, { status: 400 })
  }

  const slug = (formData.get('slug') as string) || 'product'
  const ext = file.name.split('.').pop() || 'png'
  const filename = `${slug}-${Date.now()}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())

  const productsDir = path.join(process.cwd(), 'public', 'products')
  await writeFile(path.join(productsDir, filename), buffer)

  // Delete old image if provided
  const oldImage = formData.get('oldImage') as string | null
  if (oldImage) {
    try {
      const oldPath = path.join(process.cwd(), 'public', oldImage)
      await unlink(oldPath)
    } catch {
      // Old file may not exist, ignore
    }
  }

  return NextResponse.json({ path: `/products/${filename}` })
}
