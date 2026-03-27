export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import { ProductGrid } from '@/components/shop/ProductGrid'
import { ProductSearch } from '@/components/shop/ProductSearch'
import { CategoryFilter } from '@/components/shop/CategoryFilter'
import { Skeleton } from '@/components/ui/Skeleton'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Research Catalogue',
  description: 'Browse Gene X Labs\' full catalogue of research-grade peptides including BPC-157, TB-500, semaglutide, tirzepatide, CJC-1295, ipamorelin, and more.',
  alternates: { canonical: 'https://genexpep.com/shop' },
  openGraph: {
    url: 'https://genexpep.com/shop',
    title: 'Research Peptide Catalogue | Gene X Labs',
    description: 'Browse Gene X Labs\' full catalogue of research-grade peptides. Education-first approach with COA available for every batch.',
  },
}

interface ShopPageProps {
  searchParams: Promise<{ category?: string; q?: string }>
}

async function ProductsSection({ searchParams }: { searchParams: { category?: string; q?: string } }) {
  const { category, q } = searchParams

  const products = await prisma.product.findMany({
    where: {
      ...(category && { categories: { has: category } }),
      ...(q && {
        OR: [
          { name: { contains: q, mode: 'insensitive' as const } },
          { description: { contains: q, mode: 'insensitive' as const } },
          { productCode: { contains: q, mode: 'insensitive' as const } },
        ],
      }),
    },
    orderBy: { name: 'asc' },
    include: { variants: { orderBy: { sortOrder: 'asc' } } },
  })

  return <ProductGrid products={products} />
}

function ProductsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="bg-brand-surface border border-brand-border rounded-lg overflow-hidden">
          <Skeleton className="aspect-square" />
          <div className="p-4 space-y-3">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-8 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Research Compound Catalogue</h1>
        <p className="text-brand-muted">
          Browse our collection of research-grade peptides and compounds.
        </p>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Suspense>
              <ProductSearch />
            </Suspense>
          </div>
        </div>

        <Suspense>
          <CategoryFilter />
        </Suspense>

        <Suspense fallback={<ProductsSkeleton />}>
          <ProductsSection searchParams={params} />
        </Suspense>
      </div>
    </div>
  )
}
