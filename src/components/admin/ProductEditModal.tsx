'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { toast } from '@/components/ui/Toast'
import { CATEGORIES } from '@/lib/constants'
import type { Product } from '@/types'

interface ProductEditModalProps {
  product: Product
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

  // Clean up object URL on unmount
  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview)
    }
  }, [imagePreview])

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

  const handleSave = async () => {
    const priceNum = parseFloat(price)
    if (isNaN(priceNum) || priceNum <= 0) {
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
          price: priceNum,
          dosage: dosage.trim() || null,
          category,
          researchFocus: researchFocus.trim() || null,
          image: imagePath,
          inStock,
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
            <input
              type="file"
              accept=".png,.jpg,.jpeg,.webp"
              onChange={handleFileChange}
              className="block w-full text-sm text-brand-muted file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-brand-surface file:text-brand-text file:cursor-pointer hover:file:bg-brand-border"
            />
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
              {CATEGORIES.map((cat) => (
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
