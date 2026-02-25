import { AlertTriangle } from 'lucide-react'
import { DISCLAIMER_TEXT } from '@/lib/constants'

export function Disclaimer() {
  return (
    <div className="bg-brand-orange/5 border border-brand-orange/20 rounded-md px-4 py-3 flex items-start gap-3">
      <AlertTriangle className="w-5 h-5 text-brand-orange shrink-0 mt-0.5" />
      <p className="text-xs text-brand-orange/80">{DISCLAIMER_TEXT}</p>
    </div>
  )
}

export function DisclaimerBanner() {
  return (
    <div className="bg-brand-surface border-b border-brand-border">
      <div className="max-w-7xl mx-auto px-4 py-2">
        <p className="text-xs text-brand-subtle text-center">
          {DISCLAIMER_TEXT}
        </p>
      </div>
    </div>
  )
}
