'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { ShoppingCart } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useCartStore } from '@/store/cart'
import { formatPrice } from '@/lib/utils'
import { toast } from '@/components/ui/Toast'
import type { ProductWithVariants } from '@/types'

interface ProductCardProps {
  product: ProductWithVariants
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem)
  const hasVariants = product.variants.length > 0
  const allImages = [product.image, ...(product.images ?? [])].filter(Boolean) as string[]
  const [activeIdx, setActiveIdx] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined)
  const containerRef = useRef<HTMLDivElement>(null)

  const stopCycling = () => {
    clearInterval(intervalRef.current)
    intervalRef.current = undefined
    setActiveIdx(0)
  }

  const startCycling = () => {
    if (allImages.length <= 1) return
    intervalRef.current = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % allImages.length)
    }, 2500)
  }

  // Stop cycling when card scrolls out of view (mobile fix)
  useEffect(() => {
    const el = containerRef.current
    if (!el || allImages.length <= 1) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (!entry.isIntersecting) stopCycling() },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [allImages.length])

  // Cleanup on unmount
  useEffect(() => {
    return () => clearInterval(intervalRef.current)
  }, [])

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    addItem({
      id: product.id,
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: Number(product.price),
      image: product.image,
      productCode: product.productCode,
    })
    toast(`${product.name} added to cart`, 'success')
  }

  const minVariantPrice = hasVariants
    ? Math.min(...product.variants.map((v) => Number(v.price)))
    : null

  return (
    <Link href={`/shop/${product.slug}`}>
      <Card hover className="h-full flex flex-col">
        <div
          ref={containerRef}
          className="relative aspect-square bg-brand-dark overflow-hidden"
          onMouseEnter={startCycling}
          onMouseLeave={stopCycling}
        >
          {allImages.length > 0 ? (
            <Image
              src={allImages[activeIdx]}
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
          {allImages.length > 1 && (
            <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1 pointer-events-none">
              {allImages.map((_, i) => (
                <div
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${i === activeIdx ? 'bg-white' : 'bg-white/40'}`}
                />
              ))}
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
            <div>
              <span className="text-lg font-bold font-mono text-brand-teal">
                {hasVariants ? `From ${formatPrice(minVariantPrice!)}` : formatPrice(product.price)}
              </span>
              {hasVariants && (
                <p className="text-xs text-brand-muted mt-0.5">View Options →</p>
              )}
            </div>
            {!hasVariants && product.inStock && (
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
