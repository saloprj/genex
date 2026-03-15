export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, FlaskConical, FileText, Shield } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { Badge } from '@/components/ui/Badge'
import { Disclaimer } from '@/components/layout/Disclaimer'
import { ProductPurchaseSection } from '@/components/shop/ProductPurchaseSection'
import { ProductImageGallery } from '@/components/shop/ProductImageGallery'
import type { Metadata } from 'next'

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params
  const product = await prisma.product.findUnique({ where: { slug } })
  if (!product) return { title: 'Product Not Found' }
  return {
    title: product.name,
    description: product.description,
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { variants: { orderBy: { sortOrder: 'asc' } } },
  })

  if (!product) notFound()

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-brand-muted mb-6">
        <Link href="/shop" className="hover:text-brand-teal transition-colors flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" />
          Research Compound Catalogue
        </Link>
        <span>/</span>
        <span className="text-brand-text">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Image gallery */}
        <ProductImageGallery
          images={[product.image, ...product.images].filter(Boolean) as string[]}
          name={product.name}
        />

        {/* Details */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Badge variant="teal">{product.category}</Badge>
              {product.inStock ? (
                <Badge variant="teal">In Stock</Badge>
              ) : (
                <Badge variant="orange">Out of Stock</Badge>
              )}
            </div>
            <h1 className="text-3xl font-bold mb-1">{product.name}</h1>
            {product.dosage && (
              <div className="flex items-center gap-2 text-sm text-brand-muted">
                <FlaskConical className="w-4 h-4" />
                <span>{product.dosage}</span>
              </div>
            )}
          </div>

          <ProductPurchaseSection product={product} />

          {/* Description */}
          <div className="border-t border-brand-border pt-6">
            <h2 className="text-lg font-semibold mb-3">Research Details</h2>
            <p className="text-brand-muted text-sm leading-relaxed">
              {product.description}
            </p>
          </div>

          {product.researchFocus && (
            <div className="border-t border-brand-border pt-6">
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-brand-teal" />
                Research Focus
              </h2>
              <p className="text-brand-muted text-sm leading-relaxed">
                {product.researchFocus}
              </p>
            </div>
          )}

          {/* Info cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-brand-surface border border-brand-border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-brand-teal" />
                <span className="text-sm font-medium">COA Available</span>
              </div>
              <p className="text-xs text-brand-subtle">
                Certificates of Analysis available for each batch.
              </p>
            </div>
            <div className="bg-brand-surface border border-brand-border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-brand-teal" />
                <span className="text-sm font-medium">Research Only</span>
              </div>
              <p className="text-xs text-brand-subtle">
                For research and educational purposes only.
              </p>
            </div>
          </div>

          {/* Product Code */}
          <div className="text-xs text-brand-subtle">
            Product Code: <span className="font-mono">{product.productCode}</span>
          </div>

          <Disclaimer />
        </div>
      </div>
    </div>
  )
}
