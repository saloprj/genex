'use client'

import { useState } from 'react'
import { ShoppingCart, Minus, Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useCartStore } from '@/store/cart'
import { toast } from '@/components/ui/Toast'
import type { Product } from '@/types'

interface AddToCartButtonProps {
  product: Product
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1)
  const addItem = useCartStore((s) => s.addItem)

  const handleAdd = () => {
    addItem(
      {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: Number(product.price),
        image: product.image,
        productCode: product.productCode,
      },
      quantity
    )
    toast(`${quantity}x ${product.name} added to cart`, 'success')
    setQuantity(1)
  }

  if (!product.inStock) {
    return (
      <Button disabled size="lg" className="w-full">
        Out of Stock
      </Button>
    )
  }

  return (
    <div className="space-y-3">
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
      <Button onClick={handleAdd} size="lg" className="w-full gap-2">
        <ShoppingCart className="w-5 h-5" />
        Add to Cart
      </Button>
    </div>
  )
}
