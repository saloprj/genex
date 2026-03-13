import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  if (error) {
    const msg = error === 'access_denied' ? 'Email link has expired. Please request a new one.' : (errorDescription || error)
    return NextResponse.redirect(`${origin}/auth/error?message=${encodeURIComponent(msg)}`)
  }

  if (code) {
    const supabase = await createClient()
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    if (exchangeError) {
      return NextResponse.redirect(`${origin}/auth/error?message=${encodeURIComponent(exchangeError.message)}`)
    }
  }

  return NextResponse.redirect(`${origin}/shop`)
}
