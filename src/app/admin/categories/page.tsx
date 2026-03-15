'use client'

import { useState, useEffect } from 'react'
import { Loader2, Pencil, Trash2, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { toast } from '@/components/ui/Toast'

interface Category {
  id: string
  slug: string
  label: string
  sortOrder: number
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingLabel, setEditingLabel] = useState('')
  const [newLabel, setNewLabel] = useState('')
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories')
      if (res.ok) {
        const data = await res.json()
        setCategories(data.categories)
      }
    } catch {
      toast('Failed to load categories', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCategories() }, [])

  const startEdit = (cat: Category) => {
    setEditingId(cat.id)
    setEditingLabel(cat.label)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditingLabel('')
  }

  const saveEdit = async (id: string) => {
    if (!editingLabel.trim()) return
    setSaving(true)
    try {
      const res = await fetch('/api/categories', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, label: editingLabel }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error)
      }
      toast('Category updated', 'success')
      setEditingId(null)
      fetchCategories()
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to update', 'error')
    } finally {
      setSaving(false)
    }
  }

  const addCategory = async () => {
    if (!newLabel.trim()) return
    setSaving(true)
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: newLabel }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error)
      }
      toast('Category added', 'success')
      setNewLabel('')
      fetchCategories()
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to add', 'error')
    } finally {
      setSaving(false)
    }
  }

  const deleteCategory = async (id: string) => {
    setDeletingId(id)
    try {
      const res = await fetch('/api/categories', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error)
      }
      toast('Category deleted', 'success')
      fetchCategories()
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to delete', 'error')
    } finally {
      setDeletingId(null)
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
        <h1 className="text-3xl font-bold">Categories</h1>
        <p className="text-sm text-brand-muted">{categories.length} categories</p>
      </div>

      <div className="max-w-xl">
        <div className="border border-brand-border rounded-lg overflow-hidden mb-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-brand-border bg-brand-dark">
                <th className="text-left px-4 py-3 text-brand-muted font-medium">Label</th>
                <th className="text-left px-4 py-3 text-brand-muted font-medium">Slug</th>
                <th className="w-24" />
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id} className="border-b border-brand-border/50 last:border-0">
                  <td className="px-4 py-3">
                    {editingId === cat.id ? (
                      <input
                        autoFocus
                        value={editingLabel}
                        onChange={(e) => setEditingLabel(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveEdit(cat.id)
                          if (e.key === 'Escape') cancelEdit()
                        }}
                        className="w-full bg-brand-dark border border-brand-teal rounded px-2 py-1 text-brand-text focus:outline-none"
                      />
                    ) : (
                      <span className="font-medium">{cat.label}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-brand-muted">{cat.slug}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {editingId === cat.id ? (
                        <>
                          <button
                            onClick={() => saveEdit(cat.id)}
                            disabled={saving}
                            className="p-1.5 rounded text-green-400 hover:bg-green-900/20 transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="p-1.5 rounded text-brand-muted hover:bg-brand-dark transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEdit(cat)}
                            className="p-1.5 rounded text-brand-muted hover:text-brand-teal hover:bg-brand-teal/10 transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteCategory(cat.id)}
                            disabled={deletingId === cat.id}
                            className="p-1.5 rounded text-brand-muted hover:text-red-400 hover:bg-red-900/10 transition-colors disabled:opacity-40"
                          >
                            {deletingId === cat.id
                              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              : <Trash2 className="w-3.5 h-3.5" />
                            }
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add new */}
        <div className="flex gap-2">
          <Input
            placeholder="New category name..."
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') addCategory() }}
            className="flex-1"
          />
          <Button onClick={addCategory} loading={saving} disabled={!newLabel.trim()}>
            Add
          </Button>
        </div>
        <p className="text-xs text-brand-subtle mt-2">
          Slug is auto-generated from the label and cannot be changed (to avoid breaking existing products).
        </p>
      </div>
    </div>
  )
}
