'use client'

import { ProductCard } from './ProductCard'
import type { ProductWithVariants } from '@/types'

interface ProductGridProps {
  products: ProductWithVariants[]
}

export function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-brand-muted text-lg">No products found</p>
        <p className="text-brand-subtle text-sm mt-1">
          Try adjusting your search or filters.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
