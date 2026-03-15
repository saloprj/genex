'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { X } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { toast } from '@/components/ui/Toast'
import { formatPrice } from '@/lib/utils'
import type { ProductWithVariants } from '@/types'

interface CategoryOption {
  id: string
  slug: string
  label: string
}

interface VariantRow {
  id?: string
  label: string
  price: string
}

interface ProductEditModalProps {
  product: ProductWithVariants
  onClose: () => void
  onSaved: () => void
}

export function ProductEditModal({ product, onClose, onSaved }: ProductEditModalProps) {
  const [name, setName] = useState(product.name)
  const [description, setDescription] = useState(product.description)
  const [price, setPrice] = useState(String(product.price))
  const [dosage, setDosage] = useState(product.dosage || '')
  const [category, setCategory] = useState(product.category)
  const [researchFocus, setResearchFocus] = useState(product.researchFocus || '')
  const [inStock, setInStock] = useState(product.inStock)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageError, setImageError] = useState('')
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState<CategoryOption[]>([])
  const [variants, setVariants] = useState<VariantRow[]>(
    product.variants.map((v) => ({ id: v.id, label: v.label, price: String(v.price) }))
  )

  // Clean up object URL on unmount
  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview)
    }
  }, [imagePreview])

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((d) => setCategories(d.categories ?? []))
      .catch(() => {})
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setImageError('')
    if (!file) return

    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setImageError('Only PNG, JPG, and WebP files are allowed')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setImageError('File must be under 5MB')
      return
    }

    if (imagePreview) URL.revokeObjectURL(imagePreview)
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const addVariant = () => {
    setVariants((prev) => [...prev, { label: '', price: '' }])
  }

  const removeVariant = (index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index))
  }

  const updateVariant = (index: number, field: 'label' | 'price', value: string) => {
    setVariants((prev) => prev.map((v, i) => i === index ? { ...v, [field]: value } : v))
  }

  const handleSave = async () => {
    const effectivePrice = variants.length > 0
      ? Math.min(...variants.map(v => parseFloat(v.price)))
      : parseFloat(price)
    if (variants.length === 0 && (isNaN(effectivePrice) || effectivePrice <= 0)) {
      toast('Price must be greater than 0', 'error')
      return
    }
    if (!name.trim()) {
      toast('Name is required', 'error')
      return
    }
    if (!description.trim()) {
      toast('Description is required', 'error')
      return
    }

    // Validate variants
    for (const v of variants) {
      if (!v.label.trim()) {
        toast('Variant label cannot be empty', 'error')
        return
      }
      if (!v.price || !(parseFloat(v.price) > 0)) {
        toast(`Variant "${v.label}" must have a valid price`, 'error')
        return
      }
    }

    setSaving(true)
    try {
      let imagePath = product.image

      // Upload new image if selected
      if (imageFile) {
        const formData = new FormData()
        formData.append('file', imageFile)
        formData.append('slug', product.slug)
        if (product.image) {
          formData.append('oldImage', product.image)
        }

        const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData })
        if (!uploadRes.ok) {
          const err = await uploadRes.json()
          throw new Error(err.error || 'Image upload failed')
        }
        const { path } = await uploadRes.json()
        imagePath = path
      }

      // Update product
      const res = await fetch('/api/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: product.id,
          name: name.trim(),
          description: description.trim(),
          price: effectivePrice,
          dosage: dosage.trim() || null,
          category,
          researchFocus: researchFocus.trim() || null,
          image: imagePath,
          inStock,
          variants: variants.map((v, i) => ({
            label: v.label.trim(),
            price: parseFloat(v.price),
            sortOrder: i,
          })),
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to update product')
      }

      toast('Product updated', 'success')
      onSaved()
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to save', 'error')
    } finally {
      setSaving(false)
    }
  }

  const currentImage = imagePreview || (product.image ? product.image : null)

  return (
    <Modal isOpen onClose={onClose} title="Edit Product" className="max-w-2xl">
      <div className="p-6 space-y-5">
        {/* Image */}
        <div className="flex items-start gap-4">
          <div className="w-[150px] h-[150px] flex-shrink-0 rounded-lg border border-brand-border bg-brand-dark overflow-hidden flex items-center justify-center">
            {currentImage ? (
              <Image
                src={currentImage}
                alt={product.name}
                width={150}
                height={150}
                className="object-contain w-full h-full"
                unoptimized={!!imagePreview}
              />
            ) : (
              <span className="text-brand-subtle text-xs">No image</span>
            )}
          </div>
          <div className="flex-1 space-y-2">
            <label className="block text-sm font-medium text-brand-muted">Product Image</label>
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <span className="px-3 py-1.5 rounded-md text-sm font-medium bg-brand-surface text-brand-text hover:bg-brand-border transition-colors">
                {imageFile ? 'Change Image' : 'Choose Image'}
              </span>
              {imageFile && (
                <span className="text-xs text-brand-muted truncate max-w-[160px]">{imageFile.name}</span>
              )}
              <input
                type="file"
                accept=".png,.jpg,.jpeg,.webp"
                onChange={handleFileChange}
                className="sr-only"
              />
            </label>
            <p className="text-xs text-brand-subtle">PNG, JPG, or WebP. Max 5MB.</p>
            {imageError && <p className="text-xs text-red-400">{imageError}</p>}
          </div>
        </div>

        {/* Name + Code */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            label="Product Code"
            value={product.productCode}
            disabled
            className="opacity-60"
          />
        </div>

        {/* Category + Dosage */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-brand-muted mb-1.5">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 bg-brand-surface border border-brand-border rounded-md text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-teal focus:border-transparent"
            >
              {categories.map((cat) => (
                <option key={cat.slug} value={cat.slug}>{cat.label}</option>
              ))}
            </select>
          </div>
          <Input
            label="Dosage"
            value={dosage}
            onChange={(e) => setDosage(e.target.value)}
          />
        </div>

        {/* Price + Stock */}
        {variants.length === 0 ? (
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Price"
              type="number"
              step="0.01"
              min="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={inStock}
                  onChange={(e) => setInStock(e.target.checked)}
                  className="w-4 h-4 rounded border-brand-border bg-brand-surface text-brand-teal focus:ring-brand-teal"
                />
                <span className="text-sm font-medium text-brand-text">In Stock</span>
              </label>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <p className="text-sm text-brand-muted">
              Price set by variants ({formatPrice(Math.min(...variants.map(v => parseFloat(v.price) || 0)))}
              {variants.length > 1 && ` – ${formatPrice(Math.max(...variants.map(v => parseFloat(v.price) || 0)))}`})
            </p>
            <label className="flex items-center gap-2 cursor-pointer ml-auto">
              <input
                type="checkbox"
                checked={inStock}
                onChange={(e) => setInStock(e.target.checked)}
                className="w-4 h-4 rounded border-brand-border bg-brand-surface text-brand-teal focus:ring-brand-teal"
              />
              <span className="text-sm font-medium text-brand-text">In Stock</span>
            </label>
          </div>
        )}

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-brand-muted mb-1.5">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={6}
            className="w-full px-3 py-2 bg-brand-surface border border-brand-border rounded-md text-brand-text placeholder:text-brand-subtle focus:outline-none focus:ring-2 focus:ring-brand-teal focus:border-transparent resize-none"
          />
        </div>

        {/* Research Focus */}
        <div>
          <label className="block text-sm font-medium text-brand-muted mb-1.5">Research Focus</label>
          <textarea
            value={researchFocus}
            onChange={(e) => setResearchFocus(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 bg-brand-surface border border-brand-border rounded-md text-brand-text placeholder:text-brand-subtle focus:outline-none focus:ring-2 focus:ring-brand-teal focus:border-transparent resize-none"
          />
        </div>

        {/* Variants */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-brand-muted">Variants</label>
            <button
              type="button"
              onClick={addVariant}
              className="text-xs text-brand-teal hover:text-brand-teal/80 font-medium"
            >
              + Add Variant
            </button>
          </div>
          {variants.length > 0 && (
            <div className="border border-brand-border rounded-md overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-brand-border bg-brand-dark">
                    <th className="text-left px-3 py-2 text-brand-muted font-medium">Label (e.g. 5mg*10vials)</th>
                    <th className="text-left px-3 py-2 text-brand-muted font-medium w-28">Price</th>
                    <th className="w-10" />
                  </tr>
                </thead>
                <tbody>
                  {variants.map((variant, i) => (
                    <tr key={i} className="border-b border-brand-border/50 last:border-0">
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={variant.label}
                          onChange={(e) => updateVariant(i, 'label', e.target.value)}
                          placeholder="e.g. 5mg*10vials"
                          className="w-full bg-transparent text-brand-text placeholder:text-brand-subtle focus:outline-none"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          value={variant.price}
                          onChange={(e) => updateVariant(i, 'price', e.target.value)}
                          placeholder="0.00"
                          step="0.01"
                          min="0.01"
                          className="w-full bg-transparent text-brand-text placeholder:text-brand-subtle focus:outline-none"
                        />
                      </td>
                      <td className="px-2 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => removeVariant(i)}
                          className="text-brand-subtle hover:text-red-400 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} loading={saving}>
            Save Changes
          </Button>
        </div>
      </div>
    </Modal>
  )
}
