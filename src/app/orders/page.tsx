'use client'

import { useEffect, useState } from 'react'
import { Package, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { DisclaimerBanner } from '@/components/layout/Disclaimer'
import { Badge } from '@/components/ui/Badge'
import { formatPrice } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { OrderWithItems } from '@/types'

const statusColors: Record<string, 'teal' | 'orange' | 'default' | 'outline'> = {
  PENDING: 'orange',
  PAID: 'teal',
  PROCESSING: 'teal',
  SHIPPED: 'teal',
  DELIVERED: 'teal',
  CANCELLED: 'default',
  REFUNDED: 'default',
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderWithItems[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/orders')
        if (res.ok) {
          const data = await res.json()
          setOrders(data.orders)
        }
      } catch (err) {
        console.error('Failed to fetch orders:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <DisclaimerBanner />
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <h1 className="text-3xl font-bold mb-8">Order History</h1>

        {loading ? (
          <div className="text-center py-20">
            <Loader2 className="w-8 h-8 text-brand-teal animate-spin mx-auto mb-4" />
            <p className="text-brand-muted">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-16 h-16 text-brand-subtle mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
            <p className="text-brand-muted">
              Your order history will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-brand-surface border border-brand-border rounded-lg overflow-hidden"
              >
                <button
                  onClick={() =>
                    setExpanded(expanded === order.id ? null : order.id)
                  }
                  className="w-full p-4 flex items-center justify-between hover:bg-brand-dark/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Package className="w-5 h-5 text-brand-muted" />
                    <div className="text-left">
                      <div className="font-medium text-sm">
                        Order #{order.id.slice(-8)}
                      </div>
                      <div className="text-xs text-brand-subtle">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant={statusColors[order.status] || 'default'}>
                      {order.status}
                    </Badge>
                    <span className="font-mono font-bold text-sm">
                      {formatPrice(order.total)}
                    </span>
                    {expanded === order.id ? (
                      <ChevronUp className="w-4 h-4 text-brand-muted" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-brand-muted" />
                    )}
                  </div>
                </button>

                {expanded === order.id && (
                  <div className="border-t border-brand-border p-4 space-y-4">
                    {/* Items */}
                    <div>
                      <h3 className="text-sm font-medium mb-2">Items</h3>
                      <div className="space-y-2">
                        {order.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex justify-between text-sm"
                          >
                            <span className="text-brand-muted">
                              {item.productName} x{item.quantity}
                            </span>
                            <span className="font-mono">
                              {formatPrice(
                                Number(item.priceAtTime) * item.quantity
                              )}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Shipping */}
                    <div>
                      <h3 className="text-sm font-medium mb-2">Shipping</h3>
                      <div className="text-sm text-brand-muted space-y-0.5">
                        <p>{order.shippingName}</p>
                        <p>{order.shippingAddress1}</p>
                        {order.shippingAddress2 && (
                          <p>{order.shippingAddress2}</p>
                        )}
                        <p>
                          {order.shippingCity}
                          {order.shippingState && `, ${order.shippingState}`}{' '}
                          {order.shippingPostalCode}
                        </p>
                        <p>{order.shippingCountry}</p>
                      </div>
                    </div>

                    {/* Payment */}
                    <div className="flex gap-4 text-sm">
                      <span className="text-brand-muted">Payment:</span>
                      <span>
                        {order.paymentMethod === 'STRIPE' ? 'Card' : 'Crypto'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
