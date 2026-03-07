'use client'

import { useState } from 'react'
import { ShoppingCart, Minus, Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useCartStore } from '@/store/cart'
import { toast } from '@/components/ui/Toast'
import { formatPrice } from '@/lib/utils'
import type { ProductVariant, ProductWithVariants } from '@/types'

interface ProductPurchaseSectionProps {
  product: ProductWithVariants
}

export function ProductPurchaseSection({ product }: ProductPurchaseSectionProps) {
  const [quantity, setQuantity] = useState(1)
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null)
  const addItem = useCartStore((s) => s.addItem)
  const hasVariants = product.variants.length > 0

  if (!product.inStock) {
    return (
      <Button disabled size="lg" className="w-full">
        Out of Stock
      </Button>
    )
  }

  const handleAdd = () => {
    if (hasVariants && !selectedVariant) return

    if (hasVariants && selectedVariant) {
      addItem(
        {
          id: `${product.id}-${selectedVariant.id}`,
          productId: product.id,
          name: product.name,
          slug: product.slug,
          price: Number(selectedVariant.price),
          image: product.image,
          productCode: product.productCode,
          variantId: selectedVariant.id,
          variantLabel: selectedVariant.label,
        },
        quantity
      )
      toast(`${quantity}x ${product.name} (${selectedVariant.label}) added to cart`, 'success')
    } else {
      addItem(
        {
          id: product.id,
          productId: product.id,
          name: product.name,
          slug: product.slug,
          price: Number(product.price),
          image: product.image,
          productCode: product.productCode,
        },
        quantity
      )
      toast(`${quantity}x ${product.name} added to cart`, 'success')
    }
    setQuantity(1)
  }

  const displayPrice = hasVariants && selectedVariant
    ? Number(selectedVariant.price)
    : hasVariants
      ? null
      : Number(product.price)

  return (
    <div className="space-y-4">
      {hasVariants && (
        <div>
          <p className="text-sm font-medium text-brand-muted mb-2">Select Option:</p>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((variant) => (
              <button
                key={variant.id}
                onClick={() => setSelectedVariant(variant)}
                className={`px-4 py-2 rounded-md border text-sm font-medium transition-all ${
                  selectedVariant?.id === variant.id
                    ? 'border-brand-teal bg-brand-teal/10 text-brand-teal'
                    : 'border-brand-border text-brand-muted hover:border-brand-teal/50'
                }`}
              >
                {variant.label}
                <span className="ml-2 font-mono">{formatPrice(variant.price)}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {displayPrice !== null && (
        <p className="text-2xl font-bold font-mono text-brand-teal">
          {formatPrice(displayPrice)}
        </p>
      )}

      <div className="flex items-center gap-3">
        <div className="flex items-center border border-brand-border rounded-md">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="p-2 text-brand-muted hover:text-brand-text transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="px-4 py-2 text-sm font-medium min-w-[3rem] text-center">
            {quantity}
          </span>
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="p-2 text-brand-muted hover:text-brand-text transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      <Button
        onClick={handleAdd}
        size="lg"
        className="w-full gap-2"
        disabled={hasVariants && !selectedVariant}
      >
        <ShoppingCart className="w-5 h-5" />
        Add to Cart
      </Button>
    </div>
  )
}
