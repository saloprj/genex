'use client'

import { useEffect, useState } from 'react'
import { Loader2, Save, Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { formatPrice } from '@/lib/utils'
import { toast } from '@/components/ui/Toast'
import type { Product } from '@/types'

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<Partial<Product>>({})
  const [saving, setSaving] = useState(false)

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

  const startEdit = (product: Product) => {
    setEditingId(product.id)
    setEditData({
      price: product.price,
      inStock: product.inStock,
      description: product.description,
    })
  }

  const saveEdit = async (productId: string) => {
    setSaving(true)
    try {
      const res = await fetch(`/api/products`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: productId, ...editData }),
      })
      if (!res.ok) throw new Error()
      toast('Product updated', 'success')
      setEditingId(null)
      fetchProducts()
    } catch {
      toast('Failed to update product', 'error')
    } finally {
      setSaving(false)
    }
  }

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
                  {editingId === product.id && (
                    <textarea
                      value={editData.description as string}
                      onChange={(e) =>
                        setEditData({ ...editData, description: e.target.value })
                      }
                      className="mt-2 w-full px-2 py-1 bg-brand-dark border border-brand-border rounded text-xs resize-none"
                      rows={2}
                    />
                  )}
                </td>
                <td className="py-3 px-2 font-mono text-xs text-brand-muted">
                  {product.productCode}
                </td>
                <td className="py-3 px-2">
                  <Badge variant="outline">{product.category}</Badge>
                </td>
                <td className="py-3 px-2 text-right">
                  {editingId === product.id ? (
                    <input
                      type="number"
                      step="0.01"
                      value={editData.price as unknown as string}
                      onChange={(e) =>
                        setEditData({ ...editData, price: parseFloat(e.target.value) as unknown as Product['price'] })
                      }
                      className="w-24 px-2 py-1 bg-brand-dark border border-brand-border rounded text-sm text-right font-mono"
                    />
                  ) : (
                    <span className="font-mono">{formatPrice(product.price)}</span>
                  )}
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
                  {editingId === product.id ? (
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        onClick={() => saveEdit(product.id)}
                        loading={saving}
                      >
                        <Save className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingId(null)}
                      >
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => startEdit(product)}
                    >
                      Edit
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
