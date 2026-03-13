'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

export default function VerifyPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleVerification = async () => {
      const supabase = createClient()

      const params = new URLSearchParams(window.location.search)
      const errorCode = params.get('error_code')
      const code = params.get('code')

      if (errorCode) {
        if (errorCode === 'otp_expired') {
          setError('This link has expired. Please request a new one.')
        } else {
          setError(params.get('error_description') || 'Verification failed.')
        }
        return
      }

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) {
          setError(error.message)
          return
        }
      }

      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        router.replace('/shop')
      } else {
        setError('Verification failed. Please try again.')
      }
    }

    handleVerification()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-dark">
      <div className="text-center">
        {error ? (
          <div>
            <h1 className="text-2xl font-bold mb-4 text-red-400">
              Verification Failed
            </h1>
            <p className="text-brand-muted mb-6">{error}</p>
            <a
              href="/"
              className="text-brand-teal hover:underline"
            >
              Back to home
            </a>
          </div>
        ) : (
          <div>
            <Loader2 className="w-8 h-8 text-brand-teal animate-spin mx-auto mb-4" />
            <h1 className="text-xl font-semibold mb-2">Verifying your email...</h1>
            <p className="text-sm text-brand-muted">
              Please wait while we confirm your access.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
