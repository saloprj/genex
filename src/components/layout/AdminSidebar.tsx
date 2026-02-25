'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Package, ShoppingBag, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

const links = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-brand-surface border-r border-brand-border min-h-screen p-4 hidden md:block">
      <div className="mb-8">
        <Link href="/shop" className="flex items-center gap-2 text-sm text-brand-muted hover:text-brand-teal transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Shop
        </Link>
      </div>

      <div className="mb-4">
        <h2 className="text-xs font-semibold text-brand-subtle uppercase tracking-wider">
          Admin Panel
        </h2>
      </div>

      <nav className="space-y-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
              pathname === link.href
                ? 'bg-brand-teal/10 text-brand-teal'
                : 'text-brand-muted hover:bg-brand-dark hover:text-brand-text'
            )}
          >
            <link.icon className="w-4 h-4" />
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
