'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { CATEGORIES } from '@/lib/constants'
import { cn } from '@/lib/utils'

export function CategoryFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeCategory = searchParams.get('category') || ''

  const handleCategory = (slug: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (slug === activeCategory) {
      params.delete('category')
    } else {
      params.set('category', slug)
    }
    router.push(`/shop?${params.toString()}`)
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      <button
        onClick={() => {
          const params = new URLSearchParams(searchParams.toString())
          params.delete('category')
          router.push(`/shop?${params.toString()}`)
        }}
        className={cn(
          'shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all border',
          !activeCategory
            ? 'bg-brand-teal text-white border-brand-teal'
            : 'bg-transparent text-brand-muted border-brand-border hover:border-brand-teal/50'
        )}
      >
        All
      </button>
      {CATEGORIES.map((cat) => (
        <button
          key={cat.slug}
          onClick={() => handleCategory(cat.slug)}
          className={cn(
            'shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all border',
            activeCategory === cat.slug
              ? 'bg-brand-teal text-white border-brand-teal'
              : 'bg-transparent text-brand-muted border-brand-border hover:border-brand-teal/50'
          )}
        >
          {cat.label}
        </button>
      ))}
    </div>
  )
}
