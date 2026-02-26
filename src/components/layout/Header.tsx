'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Menu, X, ShoppingCart, User, LogOut } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useCart } from '@/hooks/useCart'
import { cn } from '@/lib/utils'

export function Header() {
  const pathname = usePathname()
  const { user, loading, signOut } = useAuth()
  const { itemCount } = useCart()
  const [menuOpen, setMenuOpen] = useState(false)

  const navLinks = user
    ? [
        { href: '/shop', label: 'Research' },
        { href: '/orders', label: 'Orders' },
        { href: '/about', label: 'About' },
      ]
    : [
        { href: '/about', label: 'About' },
      ]

  return (
    <header className="sticky top-0 z-50 bg-brand-dark/80 backdrop-blur-md border-b border-brand-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={user ? '/shop' : '/'} className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="Gene X Labs"
              width={140}
              height={40}
              className="h-9 w-auto"
              priority
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-brand-teal',
                  pathname.startsWith(link.href)
                    ? 'text-brand-teal'
                    : 'text-brand-muted'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {!loading && user && (
              <>
                <Link
                  href="/cart"
                  className="relative p-2 text-brand-muted hover:text-brand-text transition-colors"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {itemCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-brand-orange text-white text-xs rounded-full flex items-center justify-center font-medium">
                      {itemCount > 99 ? '99+' : itemCount}
                    </span>
                  )}
                </Link>
                <div className="hidden md:flex items-center gap-2">
                  <Link
                    href="/orders"
                    className="p-2 text-brand-muted hover:text-brand-text transition-colors"
                  >
                    <User className="w-5 h-5" />
                  </Link>
                  <button
                    onClick={signOut}
                    className="p-2 text-brand-muted hover:text-brand-text transition-colors"
                    title="Sign out"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </>
            )}
            {!loading && !user && (
              <Link
                href="/"
                className="text-sm font-medium px-4 py-2 bg-brand-teal text-white rounded-md hover:bg-brand-teal-dark transition-colors"
              >
                Request Access
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 text-brand-muted hover:text-brand-text"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-brand-border bg-brand-dark">
          <div className="px-4 py-3 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  'block py-2 text-sm font-medium transition-colors',
                  pathname.startsWith(link.href)
                    ? 'text-brand-teal'
                    : 'text-brand-muted hover:text-brand-text'
                )}
              >
                {link.label}
              </Link>
            ))}
            {user && (
              <button
                onClick={() => {
                  signOut()
                  setMenuOpen(false)
                }}
                className="block w-full text-left py-2 text-sm font-medium text-brand-muted hover:text-brand-text"
              >
                Sign Out
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
