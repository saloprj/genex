'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { CreditCard, Bitcoin, Loader2, FlaskConical } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { DisclaimerBanner } from '@/components/layout/Disclaimer'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useCart } from '@/hooks/useCart'
import { useAuth } from '@/hooks/useAuth'
import { formatPrice } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { toast } from '@/components/ui/Toast'

type PaymentMethod = 'STRIPE' | 'CRYPTO' | 'STUB'

const isDevMode = !process.env.NEXT_PUBLIC_SUPABASE_URL


const COUNTRIES = [
  'United Kingdom', 'United States', 'Australia', 'Canada', 'Germany',
  'France', 'Netherlands', 'Ireland', 'New Zealand', 'Sweden',
  'Norway', 'Denmark', 'Switzerland', 'Austria', 'Belgium',
]

export default function CheckoutPage() {
  const router = useRouter()
  const { items, total, itemCount } = useCart()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('STRIPE')
  const [termsAccepted, setTermsAccepted] = useState(false)
  const prefilled = useRef(false)

  const [shipping, setShipping] = useState({
    name: '',
    email: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United Kingdom',
  })

  // Auto-fill from saved shipping address (last order), then override email from auth
  useEffect(() => {
    if (!user || prefilled.current) return
    prefilled.current = true
    fetch('/api/shipping-address')
      .then((r) => r.json())
      .then((saved) => {
        setShipping((prev) => ({
          name: saved?.name || user.user_metadata?.full_name || prev.name,
          email: user.email || prev.email,
          address1: saved?.address1 || prev.address1,
          address2: saved?.address2 || prev.address2,
          city: saved?.city || prev.city,
          state: saved?.state || prev.state,
          postalCode: saved?.postalCode || prev.postalCode,
          country: saved?.country || prev.country,
        }))
      })
      .catch(() => {
        if (user.email) setShipping((prev) => ({ ...prev, email: user.email! }))
      })
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  const updateField = (field: string, value: string) => {
    setShipping((prev) => ({ ...prev, [field]: value }))
  }

  const handleCheckout = async () => {
    if (!shipping.name || !shipping.email || !shipping.address1 || !shipping.city || !shipping.postalCode) {
      toast('Please fill in all required shipping fields', 'error')
      return
    }
    if (!termsAccepted) {
      toast('Please accept the terms', 'error')
      return
    }
    if (items.length === 0) {
      toast('Your cart is empty', 'error')
      return
    }

    setLoading(true)
    try {
      // 1. Create PENDING order
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.productId,
            productName: item.name,
            quantity: item.quantity,
            priceAtTime: item.price,
            variantId: item.variantId,
            variantLabel: item.variantLabel,
          })),
          shipping,
          paymentMethod: paymentMethod === 'STUB' ? 'STRIPE' : paymentMethod,
        }),
      })

      if (!orderRes.ok) {
        const err = await orderRes.json()
        throw new Error(err.error || 'Failed to create order')
      }

      const { orderId } = await orderRes.json()

      // 2. Create payment session
      const paymentEndpoint =
        paymentMethod === 'STUB'
          ? '/api/checkout/stub'
          : paymentMethod === 'STRIPE'
            ? '/api/checkout/stripe'
            : '/api/checkout/crypto'

      const paymentRes = await fetch(paymentEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      })

      if (!paymentRes.ok) {
        const err = await paymentRes.json()
        throw new Error(err.error || 'Failed to create payment session')
      }

      const { url } = await paymentRes.json()

      // 3. Redirect to payment
      window.location.href = url
    } catch (err) {
      toast(
        err instanceof Error ? err.message : 'Checkout failed',
        'error'
      )
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Cart is empty</h1>
            <Button onClick={() => router.push('/shop')}>
              Browse Catalogue
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <DisclaimerBanner />
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Forms */}
          <div className="lg:col-span-2 space-y-8">
            {/* Shipping */}
            <section className="bg-brand-surface border border-brand-border rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Shipping Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name *"
                  value={shipping.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  required
                />
                <div>
                  <Input
                    label="Email *"
                    type="email"
                    value={shipping.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    required
                    readOnly={!!user?.email}
                    className={user?.email ? 'opacity-60 cursor-not-allowed' : ''}
                  />
                  {user?.email && (
                    <p className="text-xs text-brand-subtle mt-1">From your account</p>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <Input
                    label="Address Line 1 *"
                    value={shipping.address1}
                    onChange={(e) => updateField('address1', e.target.value)}
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <Input
                    label="Address Line 2"
                    value={shipping.address2}
                    onChange={(e) => updateField('address2', e.target.value)}
                  />
                </div>
                <Input
                  label="City *"
                  value={shipping.city}
                  onChange={(e) => updateField('city', e.target.value)}
                  required
                />
                <Input
                  label="State / Province"
                  value={shipping.state}
                  onChange={(e) => updateField('state', e.target.value)}
                />
                <Input
                  label="Postal Code *"
                  value={shipping.postalCode}
                  onChange={(e) => updateField('postalCode', e.target.value)}
                  required
                />
                <div>
                  <label className="block text-sm font-medium text-brand-muted mb-1.5">
                    Country *
                  </label>
                  <select
                    value={shipping.country}
                    onChange={(e) => updateField('country', e.target.value)}
                    className="w-full px-3 py-2 bg-brand-surface border border-brand-border rounded-md text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-teal"
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            {/* Payment Method */}
            <section className="bg-brand-surface border border-brand-border rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Payment Method</h2>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setPaymentMethod('STRIPE')}
                  className={cn(
                    'flex items-center gap-3 p-4 rounded-lg border transition-all',
                    paymentMethod === 'STRIPE'
                      ? 'border-brand-teal bg-brand-teal/5'
                      : 'border-brand-border hover:border-brand-border/80'
                  )}
                >
                  <CreditCard className={cn('w-6 h-6', paymentMethod === 'STRIPE' ? 'text-brand-teal' : 'text-brand-muted')} />
                  <div className="text-left">
                    <div className="font-medium text-sm">Card Payment</div>
                    <div className="text-xs text-brand-subtle">Visa, Mastercard, etc.</div>
                  </div>
                </button>
                <button
                  onClick={() => setPaymentMethod('CRYPTO')}
                  className={cn(
                    'flex items-center gap-3 p-4 rounded-lg border transition-all',
                    paymentMethod === 'CRYPTO'
                      ? 'border-brand-teal bg-brand-teal/5'
                      : 'border-brand-border hover:border-brand-border/80'
                  )}
                >
                  <Bitcoin className={cn('w-6 h-6', paymentMethod === 'CRYPTO' ? 'text-brand-teal' : 'text-brand-muted')} />
                  <div className="text-left">
                    <div className="font-medium text-sm">Cryptocurrency</div>
                    <div className="text-xs text-brand-subtle">USDT, USDC, BTC, ETH +</div>
                  </div>
                </button>
                {isDevMode && (
                  <button
                    onClick={() => setPaymentMethod('STUB')}
                    className={cn(
                      'col-span-2 flex items-center gap-3 p-4 rounded-lg border transition-all',
                      paymentMethod === 'STUB'
                        ? 'border-orange-500 bg-orange-500/5'
                        : 'border-dashed border-brand-border hover:border-orange-500/50'
                    )}
                  >
                    <FlaskConical className={cn('w-6 h-6', paymentMethod === 'STUB' ? 'text-orange-400' : 'text-brand-muted')} />
                    <div className="text-left">
                      <div className="font-medium text-sm">
                        Test Payment
                        <span className="text-xs text-orange-400 ml-2">[DEV ONLY]</span>
                      </div>
                      <div className="text-xs text-brand-subtle">Skip payment gateway — marks order as PAID instantly</div>
                    </div>
                  </button>
                )}
              </div>
            </section>

            {/* Terms */}
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-1 rounded border-brand-border bg-brand-surface text-brand-teal focus:ring-brand-teal"
              />
              <span className="text-xs text-brand-subtle">
                I confirm that all products are for research and educational purposes only,
                not for human consumption. I agree to the terms of service.
              </span>
            </label>
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-brand-surface border border-brand-border rounded-lg p-6 sticky top-24">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
              <div className="space-y-3 mb-4">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-brand-muted">
                      {item.name} x{item.quantity}
                    </span>
                    <span className="font-mono">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-brand-border pt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-brand-muted">Subtotal</span>
                  <span className="font-mono">{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-brand-muted">Shipping</span>
                  <span className="text-brand-subtle">Free</span>
                </div>
                <div className="border-t border-brand-border pt-2 flex justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="text-xl font-bold font-mono text-brand-teal">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>
              <Button
                onClick={handleCheckout}
                size="lg"
                loading={loading}
                disabled={!termsAccepted}
                className="w-full mt-6"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </span>
                ) : (
                  `Pay ${formatPrice(total)}`
                )}
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
