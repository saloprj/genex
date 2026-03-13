'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function ErrorContent() {
  const params = useSearchParams()
  const message = params.get('message') || 'Authentication failed. Please try again.'

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-dark">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4 text-red-400">Verification Failed</h1>
        <p className="text-brand-muted mb-6">{message}</p>
        <a href="/" className="text-brand-teal hover:underline">Back to home</a>
      </div>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense>
      <ErrorContent />
    </Suspense>
  )
}
