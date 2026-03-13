'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { createClient } from '@/lib/supabase/client'
import { toast } from '@/components/ui/Toast'

interface EmailCaptureFormProps {
  showName?: boolean
}

type Step = 'email' | 'code'

const RESEND_COOLDOWN = 60
const OTP_LENGTH = 8

export function EmailCaptureForm({ showName = false }: EmailCaptureFormProps) {
  const router = useRouter()
  const [step, setStep] = useState<Step>('email')

  // email step state
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [loading, setLoading] = useState(false)

  // code step state
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''))
  const [verifying, setVerifying] = useState(false)
  const [codeError, setCodeError] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)
  const [resendError, setResendError] = useState('')

  const inputRefs = useRef<HTMLInputElement[]>([])
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current)
    }
  }, [])

  function startCooldown() {
    setResendCooldown(RESEND_COOLDOWN)
    cooldownRef.current = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(cooldownRef.current!)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  async function sendOtp(emailAddr: string) {
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email: emailAddr,
      options: {
        data: name ? { full_name: name } : undefined,
        // No emailRedirectTo → Supabase sends 6-digit OTP
      },
    })
    return error
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !termsAccepted) return

    setLoading(true)
    const error = await sendOtp(email)
    setLoading(false)

    if (error) {
      const msg = /rate.?limit|too many/i.test(error.message)
        ? 'Too many attempts — wait a few minutes before trying again'
        : error.message
      toast(msg, 'error')
    } else {
      setStep('code')
      startCooldown()
      setTimeout(() => inputRefs.current[0]?.focus(), 50)
    }
  }

  function clearInputs() {
    setDigits(Array(OTP_LENGTH).fill(''))
    setTimeout(() => inputRefs.current[0]?.focus(), 50)
  }

  async function verify(token: string) {
    setVerifying(true)
    setCodeError('')
    const supabase = createClient()
    const { error } = await supabase.auth.verifyOtp({ email, token, type: 'email' })
    if (error) {
      const msg = /expired/i.test(error.message)
        ? 'Code expired — request a new one below'
        : 'Invalid code — check and try again'
      setCodeError(msg)
      clearInputs()
      setVerifying(false)
    } else {
      const next = new URLSearchParams(window.location.search).get('next')
      const safePath = next?.startsWith('/') ? next : '/shop'
      router.push(safePath)
    }
  }

  function handleDigitChange(index: number, value: string) {
    const digit = value.replace(/\D/g, '').slice(-1)
    const newDigits = [...digits]
    newDigits[index] = digit
    setDigits(newDigits)
    setCodeError('')

    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
    }

    if (digit && index === OTP_LENGTH - 1) {
      const token = [...digits.slice(0, OTP_LENGTH - 1), digit].join('')
      if (token.length === OTP_LENGTH) verify(token)
    }
  }

  function handleDigitKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH)
    if (!pasted) return
    const newDigits = [...Array(OTP_LENGTH).fill('')]
    for (let i = 0; i < pasted.length; i++) newDigits[i] = pasted[i]
    setDigits(newDigits)
    setCodeError('')
    if (pasted.length === OTP_LENGTH) {
      verify(pasted)
    } else {
      inputRefs.current[pasted.length]?.focus()
    }
  }

  async function handleResend() {
    if (resendCooldown > 0) return
    setResendError('')
    const error = await sendOtp(email)
    if (error) {
      if (/rate.?limit|too many/i.test(error.message)) {
        setResendError('Too many attempts — wait a few minutes before trying again')
      } else {
        setResendError(error.message)
      }
    } else {
      startCooldown()
      clearInputs()
      toast('New code sent!', 'success')
    }
  }

  // --- Email step ---
  if (step === 'email') {
    return (
      <form onSubmit={handleEmailSubmit} className="space-y-3 w-full max-w-md">
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

  // --- Code step ---
  return (
    <div className="space-y-4 w-full max-w-md">
      <div className="text-center">
        <p className="text-sm text-brand-muted">
          Enter the 6-digit code sent to <strong className="text-brand-text">{email}</strong>
        </p>
      </div>

      <div className="flex gap-2 justify-center">
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={(el) => { if (el) inputRefs.current[i] = el }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={digit}
            onChange={(e) => handleDigitChange(i, e.target.value)}
            onKeyDown={(e) => handleDigitKeyDown(i, e)}
            onPaste={handlePaste}
            disabled={verifying}
            className="w-9 h-11 text-center text-base font-bold rounded border border-brand-border bg-brand-surface text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-teal focus:border-transparent disabled:opacity-50"
          />
        ))}
      </div>

      {verifying && (
        <p className="text-center text-sm text-brand-muted animate-pulse">Verifying…</p>
      )}

      {codeError && (
        <p className="text-center text-sm text-red-400">{codeError}</p>
      )}

      <div className="flex justify-center">
        <Button
          type="button"
          variant="secondary"
          loading={verifying}
          disabled={digits.join('').length < OTP_LENGTH}
          onClick={() => verify(digits.join(''))}
          className="w-full max-w-sm mx-auto block"
        >
          Verify
        </Button>
      </div>

      <div className="text-center space-y-1">
        {resendError && (
          <p className="text-xs text-red-400">{resendError}</p>
        )}
        {resendCooldown > 0 ? (
          <p className="text-xs text-brand-subtle">
            Resend code in 0:{String(resendCooldown).padStart(2, '0')}
          </p>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            className="text-xs text-brand-teal hover:underline"
          >
            Resend code
          </button>
        )}
      </div>

      <div className="text-center">
        <button
          type="button"
          onClick={() => { setStep('email'); setCodeError(''); setResendError(''); setDigits(Array(OTP_LENGTH).fill('')) }}
          className="text-xs text-brand-subtle hover:text-brand-muted"
        >
          ← Use a different email
        </button>
      </div>
    </div>
  )
}
