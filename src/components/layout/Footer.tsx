import Link from 'next/link'
import { DISCLAIMER_TEXT, SITE_NAME } from '@/lib/constants'

export function Footer() {
  return (
    <footer className="border-t border-brand-border bg-brand-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-full bg-brand-teal/20 border border-brand-teal/40 flex items-center justify-center">
                <span className="text-brand-teal font-bold text-xs">G</span>
              </div>
              <span className="font-bold tracking-tight">
                GENE X<span className="text-brand-muted font-normal ml-1">LABS</span>
              </span>
            </div>
            <p className="text-sm text-brand-subtle">
              Precision research peptides for scientific exploration.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold mb-3">Links</h4>
            <div className="space-y-2">
              <Link href="/about" className="block text-sm text-brand-muted hover:text-brand-teal transition-colors">
                About
              </Link>
              <Link href="/shop" className="block text-sm text-brand-muted hover:text-brand-teal transition-colors">
                Research Catalogue
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold mb-3">Contact</h4>
            <p className="text-sm text-brand-muted">info@genexlabs.com</p>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 pt-6 border-t border-brand-border">
          <p className="text-xs text-brand-subtle text-center">
            {DISCLAIMER_TEXT}
          </p>
          <p className="text-xs text-brand-subtle text-center mt-2">
            &copy; {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
