'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { formatPrice } from '@/lib/utils'
import { toast } from '@/components/ui/Toast'
import { ProductEditModal } from '@/components/admin/ProductEditModal'
import type { Product } from '@/types'

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products')
      if (res.ok) {
        const data = await res.json()
        setProducts(data.products)
      }
    } catch {
      toast('Failed to fetch products', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const toggleStock = async (product: Product) => {
    try {
      const res = await fetch(`/api/products`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: product.id, inStock: !product.inStock }),
      })
      if (!res.ok) throw new Error()
      toast(`${product.name} ${!product.inStock ? 'in stock' : 'out of stock'}`, 'success')
      fetchProducts()
    } catch {
      toast('Failed to update stock', 'error')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-brand-teal animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Products</h1>
        <p className="text-sm text-brand-muted">{products.length} products</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand-border">
              <th className="text-left py-3 px-2 text-brand-muted font-medium">Product</th>
              <th className="text-left py-3 px-2 text-brand-muted font-medium">Code</th>
              <th className="text-left py-3 px-2 text-brand-muted font-medium">Category</th>
              <th className="text-right py-3 px-2 text-brand-muted font-medium">Price</th>
              <th className="text-center py-3 px-2 text-brand-muted font-medium">Stock</th>
              <th className="text-right py-3 px-2 text-brand-muted font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b border-brand-border/50 hover:bg-brand-dark/30">
                <td className="py-3 px-2">
                  <div className="font-medium">{product.name}</div>
                </td>
                <td className="py-3 px-2 font-mono text-xs text-brand-muted">
                  {product.productCode}
                </td>
                <td className="py-3 px-2">
                  <Badge variant="outline">{product.category}</Badge>
                </td>
                <td className="py-3 px-2 text-right">
                  <span className="font-mono">{formatPrice(product.price)}</span>
                </td>
                <td className="py-3 px-2 text-center">
                  <button
                    onClick={() => toggleStock(product)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      product.inStock
                        ? 'bg-green-900/30 text-green-400 hover:bg-green-900/50'
                        : 'bg-red-900/30 text-red-400 hover:bg-red-900/50'
                    }`}
                  >
                    {product.inStock ? 'In Stock' : 'Out'}
                  </button>
                </td>
                <td className="py-3 px-2 text-right">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditingProduct(product)}
                  >
                    Edit
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingProduct && (
        <ProductEditModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSaved={() => {
            setEditingProduct(null)
            fetchProducts()
          }}
        />
      )}
    </div>
  )
}
