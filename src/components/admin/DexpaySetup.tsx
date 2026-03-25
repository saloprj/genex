'use client'

import { useState } from 'react'
import { Webhook } from 'lucide-react'

export function DexpaySetup() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    ok?: boolean
    webhookUrl?: string
    private_key?: string
    error?: string
  } | null>(null)

  async function handleSetup() {
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/admin/dexpay-setup', { method: 'POST' })
      const data = await res.json()
      setResult(data)
    } catch (err) {
      setResult({ error: err instanceof Error ? err.message : 'Request failed' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Webhook className="w-5 h-5 text-brand-teal" />
          <h3 className="font-semibold">Dexpay Webhook</h3>
        </div>
        <button
          onClick={handleSetup}
          disabled={loading}
          className="px-4 py-2 text-sm font-medium rounded-lg bg-brand-teal text-white hover:bg-brand-teal/90 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Registering...' : 'Register Webhook'}
        </button>
      </div>
      <p className="text-xs text-brand-muted mb-3">
        Registers the webhook URL with Dexpay and returns the secret key.
        Current URL: <code className="text-brand-teal">{typeof window !== 'undefined' ? `${window.location.origin}/api/webhooks/dexpay` : ''}</code>
      </p>
      {result && (
        <div className={`text-sm rounded-lg p-3 ${result.error ? 'bg-red-500/10 text-red-400' : 'bg-brand-teal/10 text-brand-light'}`}>
          {result.error ? (
            <p>Error: {result.error}</p>
          ) : (
            <div className="space-y-1 font-mono text-xs">
              <p>Webhook URL: {result.webhookUrl}</p>
              <p className="break-all">
                DEXPAY_WEBHOOK_SECRET=<span className="text-brand-teal select-all">{result.private_key}</span>
              </p>
              <p className="text-brand-muted font-sans mt-2">Copy the secret above into your .env file, then restart the dev server.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
