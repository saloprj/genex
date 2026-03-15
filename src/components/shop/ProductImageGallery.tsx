'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'

interface ProductImageGalleryProps {
  images: string[]
  name: string
}

export function ProductImageGallery({ images, name }: ProductImageGalleryProps) {
  const [selectedIdx, setSelectedIdx] = useState(0)
  const touchStartX = useRef<number | null>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) < 40) return // too small, ignore

    if (diff > 0) {
      // swipe left → next
      setSelectedIdx((prev) => (prev + 1) % images.length)
    } else {
      // swipe right → prev
      setSelectedIdx((prev) => (prev - 1 + images.length) % images.length)
    }
    touchStartX.current = null
  }

  if (images.length === 0) {
    return (
      <div className="relative aspect-square bg-brand-surface border border-brand-border rounded-lg overflow-hidden flex items-center justify-center">
        <div className="w-24 h-24 rounded-full bg-brand-teal/10 flex items-center justify-center">
          <span className="text-4xl font-bold text-brand-teal">{name.charAt(0)}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div
        className="relative aspect-square bg-brand-surface border border-brand-border rounded-lg overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <Image
          src={images[selectedIdx]}
          alt={name}
          fill
          className="object-cover"
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
        {images.length > 1 && (
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 pointer-events-none">
            {images.map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${i === selectedIdx ? 'bg-white' : 'bg-white/40'}`}
              />
            ))}
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {images.map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setSelectedIdx(i)}
              className={`w-[72px] h-[72px] rounded-md border-2 overflow-hidden flex-shrink-0 transition-colors ${
                i === selectedIdx ? 'border-brand-teal' : 'border-brand-border hover:border-brand-muted'
              }`}
            >
              <Image
                src={src}
                alt={`${name} ${i + 1}`}
                width={72}
                height={72}
                className="object-cover w-full h-full"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
