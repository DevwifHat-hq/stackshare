'use client'

import { Star } from 'lucide-react'

interface Props {
  value: number | null
  onChange: (rating: number) => void
}

export function RatingSelector({ value, onChange }: Props) {
  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => {
        const rating = i + 1
        return (
          <button
            key={i}
            type="button"
            onClick={() => onChange(rating)}
            className="hover:scale-110 transition-transform"
          >
            <Star
              className={`h-6 w-6 ${
                value !== null && rating <= value
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        )
      })}
    </div>
  )
} 