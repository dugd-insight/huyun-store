'use client'

import { useState, useEffect } from 'react'
import { Category } from '@/types'
import { Loader2 } from 'lucide-react'

interface CategoryFilterProps {
  selectedCategory: string
  onSelectCategory: (slug: string) => void
}

export function CategoryFilter({
  selectedCategory,
  onSelectCategory,
}: CategoryFilterProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      const data = await response.json()
      setCategories(data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-stone-400" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-stone-900">分类</h3>
      <div className="space-y-2">
        <button
          onClick={() => onSelectCategory('')}
          className={`w-full text-left px-3 py-2 text-sm transition-colors ${
            selectedCategory === ''
              ? 'bg-stone-900 text-white'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          全部
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.slug)}
            className={`w-full text-left px-3 py-2 text-sm transition-colors flex items-center justify-between ${
              selectedCategory === category.slug
                ? 'bg-stone-900 text-white'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <span>{category.name}</span>
            {(category as any)._count?.products > 0 && (
              <span
                className={`text-xs ${
                  selectedCategory === category.slug
                    ? 'text-stone-300'
                    : 'text-stone-400'
                }`}
              >
                {(category as any)._count.products}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
