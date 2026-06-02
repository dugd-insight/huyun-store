'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { X } from 'lucide-react'

interface StoryData {
  id: string
  title: string
  image: string
  content: string
  excerpt?: string
  author?: string
}

interface StoryModalProps {
  story: StoryData | null
  isOpen: boolean
  onClose: () => void
}

export function StoryModal({ story, isOpen, onClose }: StoryModalProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(onClose, 300)
  }

  if (!story || !isOpen) return null

  return (
    <div
      className={`modal-backdrop ${isVisible ? 'animate-fade-in' : ''}`}
      onClick={handleClose}
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button className="modal-close" onClick={handleClose} aria-label="Close">
          <X className="w-5 h-5" />
        </button>

        {/* Story Image */}
        <div className="relative aspect-[16/9] w-full">
          <Image
            src={story.image}
            alt={story.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 800px"
          />
        </div>

        {/* Story Content */}
        <div className="p-8 md:p-12">
          <h2 className="font-serif text-2xl md:text-3xl font-semibold text-[var(--color-ink)] mb-4">
            {story.title}
          </h2>
          {story.author && (
            <p className="text-sm text-[var(--color-gold)] mb-6 tracking-wider">
              {story.author}
            </p>
          )}
          <div
            className="prose prose-lg max-w-none text-[var(--color-ink)] leading-relaxed"
            dangerouslySetInnerHTML={{ __html: story.content }}
          />
        </div>
      </div>
    </div>
  )
}
