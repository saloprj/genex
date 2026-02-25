import { prisma } from '@/lib/prisma'
import { Card, CardContent } from '@/components/ui/Card'
import { Package, ShoppingBag, DollarSign, TrendingUp } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const [productCount, orderCount, paidOrders, recentOrders] =
    await Promise.all([
      prisma.product.count(),
      prisma.order.count(),
      prisma.order.findMany({
        where: { status: { in: ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'] } },
        select: { total: true },
      }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { items: true },
      }),
    ])

  const totalRevenue = paidOrders.reduce(
    (sum, o) => sum + Number(o.total),
    0
  )

  const stats = [
    {
      label: 'Total Products',
      value: productCount.toString(),
      icon: Package,
    },
    {
      label: 'Total Orders',
      value: orderCount.toString(),
      icon: ShoppingBag,
    },
    {
      label: 'Revenue',
      value: formatPrice(totalRevenue),
      icon: DollarSign,
    },
    {
      label: 'Paid Orders',
      value: paidOrders.length.toString(),
      icon: TrendingUp,
    },
  ]

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-brand-teal/10 flex items-center justify-center">
                <stat.icon className="w-6 h-6 text-brand-teal" />
              </div>
              <div>
                <p className="text-sm text-brand-muted">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Orders */}
      <Card>
        <CardContent>
          <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>
          {recentOrders.length === 0 ? (
            <p className="text-brand-muted text-sm">No orders yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-brand-border">
                    <th className="text-left py-2 text-brand-muted font-medium">
                      Order
                    </th>
                    <th className="text-left py-2 text-brand-muted font-medium">
                      Status
                    </th>
                    <th className="text-left py-2 text-brand-muted font-medium">
                      Items
                    </th>
                    <th className="text-right py-2 text-brand-muted font-medium">
                      Total
                    </th>
                    <th className="text-right py-2 text-brand-muted font-medium">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-brand-border/50"
                    >
                      <td className="py-3 font-mono text-xs">
                        #{order.id.slice(-8)}
                      </td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded text-xs bg-brand-teal/10 text-brand-teal">
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 text-brand-muted">
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                      </td>
                      <td className="py-3 text-right font-mono">
                        {formatPrice(order.total)}
                      </td>
                      <td className="py-3 text-right text-brand-muted">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
