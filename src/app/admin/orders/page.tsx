'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatPrice } from '@/lib/utils'
import { toast } from '@/components/ui/Toast'
import type { OrderWithItems } from '@/types'

const STATUS_FLOW = ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'] as const
const statusColors: Record<string, 'teal' | 'orange' | 'default'> = {
  PENDING: 'orange',
  PAID: 'teal',
  PROCESSING: 'teal',
  SHIPPED: 'teal',
  DELIVERED: 'teal',
  CANCELLED: 'default',
  REFUNDED: 'default',
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderWithItems[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('')

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/admin/orders')
      if (res.ok) {
        const data = await res.json()
        setOrders(data.orders)
      }
    } catch {
      toast('Failed to fetch orders', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus }),
      })
      if (!res.ok) throw new Error()
      toast(`Order updated to ${newStatus}`, 'success')
      fetchOrders()
    } catch {
      toast('Failed to update order', 'error')
    }
  }

  const getNextStatus = (currentStatus: string) => {
    const idx = STATUS_FLOW.indexOf(currentStatus as (typeof STATUS_FLOW)[number])
    if (idx === -1 || idx >= STATUS_FLOW.length - 1) return null
    return STATUS_FLOW[idx + 1]
  }

  const filteredOrders = filter
    ? orders.filter((o) => o.status === filter)
    : orders

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-brand-teal animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Orders</h1>

      {/* Filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => setFilter('')}
          className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
            !filter
              ? 'bg-brand-teal text-white border-brand-teal'
              : 'text-brand-muted border-brand-border hover:border-brand-teal/50'
          }`}
        >
          All ({orders.length})
        </button>
        {STATUS_FLOW.map((status) => {
          const count = orders.filter((o) => o.status === status).length
          return (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                filter === status
                  ? 'bg-brand-teal text-white border-brand-teal'
                  : 'text-brand-muted border-brand-border hover:border-brand-teal/50'
              }`}
            >
              {status} ({count})
            </button>
          )
        })}
      </div>

      {filteredOrders.length === 0 ? (
        <p className="text-brand-muted text-center py-10">No orders found.</p>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const nextStatus = getNextStatus(order.status)
            return (
              <div
                key={order.id}
                className="bg-brand-surface border border-brand-border rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm">
                        #{order.id.slice(-8)}
                      </span>
                      <Badge variant={statusColors[order.status] || 'default'}>
                        {order.status}
                      </Badge>
                      <Badge variant="outline">
                        {order.paymentMethod === 'STRIPE' ? 'Card' : 'Crypto'}
                      </Badge>
                    </div>
                    <p className="text-xs text-brand-subtle mt-1">
                      {new Date(order.createdAt).toLocaleString()} &mdash;{' '}
                      {order.shippingName} ({order.shippingEmail})
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-bold text-brand-teal">
                      {formatPrice(order.total)}
                    </p>
                    {nextStatus && (
                      <Button
                        size="sm"
                        className="mt-2"
                        onClick={() => updateStatus(order.id, nextStatus)}
                      >
                        Mark {nextStatus}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Items */}
                <div className="text-xs text-brand-muted space-y-1">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between">
                      <span>
                        {item.productName} x{item.quantity}
                      </span>
                      <span className="font-mono">
                        {formatPrice(Number(item.priceAtTime) * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Shipping */}
                <div className="mt-2 pt-2 border-t border-brand-border/50 text-xs text-brand-subtle">
                  {order.shippingAddress1}, {order.shippingCity}{' '}
                  {order.shippingPostalCode}, {order.shippingCountry}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
