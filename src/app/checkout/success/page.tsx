'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Package, Loader2 } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/Button'
import { useCartStore } from '@/store/cart'
import { formatPrice } from '@/lib/utils'
import type { OrderWithItems } from '@/types'

function SuccessContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')
  const [order, setOrder] = useState<OrderWithItems | null>(null)
  const [loading, setLoading] = useState(true)
  const clearCart = useCartStore((s) => s.clearCart)

  useEffect(() => {
    clearCart()
  }, [clearCart])

  useEffect(() => {
    if (!orderId) {
      setLoading(false)
      return
    }

    let intervalId: ReturnType<typeof setInterval> | null = null

    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/orders?orderId=${orderId}`)
        if (res.ok) {
          const data = await res.json()
          setOrder(data.order)
          // Stop polling once order is no longer PENDING
          if (data.order?.status && data.order.status !== 'PENDING' && intervalId) {
            clearInterval(intervalId)
            intervalId = null
          }
        }
      } catch {
        // Order might not be transitioned yet
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()

    // Poll every 3s while order is still PENDING
    intervalId = setInterval(fetchOrder, 3000)

    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [orderId])

  if (loading) {
    return (
      <div>
        <Loader2 className="w-10 h-10 text-brand-teal animate-spin mx-auto mb-4" />
        <p className="text-brand-muted">Loading order details...</p>
      </div>
    )
  }

  const isPending = order?.status === 'PENDING'

  return (
    <>
      <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-6 ${isPending ? 'bg-yellow-500/20' : 'bg-brand-teal/20'}`}>
        {isPending ? (
          <Loader2 className="w-8 h-8 text-yellow-500 animate-spin" />
        ) : (
          <CheckCircle className="w-8 h-8 text-brand-teal" />
        )}
      </div>
      <h1 className="text-3xl font-bold mb-2">
        {isPending ? 'Waiting for Payment Confirmation...' : 'Order Confirmed!'}
      </h1>
      <p className="text-brand-muted mb-8">
        {isPending
          ? 'Your payment is being processed. This page will update automatically.'
          : 'Thank you for your order. You will receive a confirmation email shortly.'}
      </p>

      {order && (
        <div className="bg-brand-surface border border-brand-border rounded-lg p-6 text-left mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-5 h-5 text-brand-teal" />
            <span className="font-semibold">Order Details</span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-brand-muted">Order ID</span>
              <span className="font-mono text-xs">{order.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-muted">Status</span>
              <span className="text-brand-teal font-medium">{order.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-muted">Payment</span>
              <span>{order.paymentMethod === 'STRIPE' ? 'Card' : 'Crypto'}</span>
            </div>
            <div className="border-t border-brand-border pt-2 mt-2">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between py-1">
                  <span className="text-brand-muted">
                    {item.productName} x{item.quantity}
                  </span>
                  <span className="font-mono">
                    {formatPrice(Number(item.priceAtTime) * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-brand-border pt-2 flex justify-between font-semibold">
              <span>Total</span>
              <span className="text-brand-teal font-mono">
                {formatPrice(order.total)}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-4 justify-center">
        <Link href="/orders">
          <Button variant="outline">View Orders</Button>
        </Link>
        <Link href="/shop">
          <Button>Continue Shopping</Button>
        </Link>
      </div>
    </>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-lg w-full text-center">
          <Suspense
            fallback={
              <div>
                <Loader2 className="w-10 h-10 text-brand-teal animate-spin mx-auto mb-4" />
                <p className="text-brand-muted">Loading...</p>
              </div>
            }
          >
            <SuccessContent />
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  )
}
