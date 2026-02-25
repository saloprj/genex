'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useCartStore } from '@/store/cart'
import { formatPrice } from '@/lib/utils'
import { toast } from '@/components/ui/Toast'
import type { Product } from '@/types'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: Number(product.price),
      image: product.image,
      productCode: product.productCode,
    })
    toast(`${product.name} added to cart`, 'success')
  }

  return (
    <Link href={`/shop/${product.slug}`}>
      <Card hover className="h-full flex flex-col">
        <div className="relative aspect-square bg-brand-dark overflow-hidden">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-brand-teal/10 flex items-center justify-center">
                <span className="text-2xl font-bold text-brand-teal">
                  {product.name.charAt(0)}
                </span>
              </div>
            </div>
          )}
          {!product.inStock && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-sm font-medium text-brand-muted">Out of Stock</span>
            </div>
          )}
        </div>
        <div className="p-4 flex flex-col flex-1">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-sm leading-tight">{product.name}</h3>
            <Badge variant="teal" className="shrink-0">{product.category}</Badge>
          </div>
          {product.dosage && (
            <p className="text-xs text-brand-subtle mb-2">{product.dosage}</p>
          )}
          <div className="mt-auto flex items-center justify-between pt-3">
            <span className="text-lg font-bold font-mono text-brand-teal">
              {formatPrice(product.price)}
            </span>
            {product.inStock && (
              <Button
                size="sm"
                onClick={handleAddToCart}
                className="gap-1.5"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                Add
              </Button>
            )}
          </div>
        </div>
      </Card>
    </Link>
  )
}
