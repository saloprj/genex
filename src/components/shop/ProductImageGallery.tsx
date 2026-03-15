'use client'

import { useState } from 'react'
import Image from 'next/image'

interface ProductImageGalleryProps {
  images: string[]
  name: string
}

export function ProductImageGallery({ images, name }: ProductImageGalleryProps) {
  const [selectedIdx, setSelectedIdx] = useState(0)

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
      <div className="relative aspect-square bg-brand-surface border border-brand-border rounded-lg overflow-hidden">
        <Image
          src={images[selectedIdx]}
          alt={name}
          fill
          className="object-cover"
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
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
