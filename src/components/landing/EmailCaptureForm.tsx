'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { createClient } from '@/lib/supabase/client'
import { toast } from '@/components/ui/Toast'

interface EmailCaptureFormProps {
  showName?: boolean
}

export function EmailCaptureForm({ showName = false }: EmailCaptureFormProps) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !termsAccepted) return

    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: name ? { full_name: name } : undefined,
        },
      })

      if (error) throw error

      setSent(true)
      toast('Magic link sent! Check your email.', 'success')
    } catch (err) {
      toast(
        err instanceof Error ? err.message : 'Failed to send magic link',
        'error'
      )
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="text-center py-4">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-brand-teal/20 mb-3">
          <svg className="w-6 h-6 text-brand-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold mb-1">Check your email</h3>
        <p className="text-sm text-brand-muted">
          We sent a magic link to <strong>{email}</strong>
        </p>
        <p className="text-xs text-brand-subtle mt-2">
          Click the link in your email to access the research catalogue.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 w-full max-w-md">
      {showName && (
        <Input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      )}
      <div className="flex gap-2">
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Button
          type="submit"
          variant="secondary"
          loading={loading}
          disabled={!termsAccepted}
          className="shrink-0"
        >
          {showName ? 'Request Access' : 'Get Started'}
        </Button>
      </div>
      <label className="flex items-start gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={termsAccepted}
          onChange={(e) => setTermsAccepted(e.target.checked)}
          className="mt-1 rounded border-brand-border bg-brand-surface text-brand-teal focus:ring-brand-teal"
        />
        <span className="text-xs text-brand-subtle">
          I understand this content is for educational and research purposes only.
          Not for human consumption.
        </span>
      </label>
    </form>
  )
}
