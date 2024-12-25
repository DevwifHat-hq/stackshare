// This file will be moved to src/app/dashboard/discover/search-form.tsx
'use client'

import { Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

interface SearchFormProps {
  initialSearch?: string
  initialCategory?: string
  initialSort?: string
  categories: Array<{
    id: string
    name: string
    slug: string
  }>
}

export function SearchForm({ initialSearch, initialCategory, initialSort, categories }: SearchFormProps) {
  const router = useRouter()

  const handleSearch = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const search = formData.get('q')
    const url = new URL(window.location.href)
    if (search) {
      url.searchParams.set('q', search.toString())
    } else {
      url.searchParams.delete('q')
    }
    router.push(url.pathname + url.search)
  }, [router])

  const handleCategoryChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const url = new URL(window.location.href)
    if (e.target.value) {
      url.searchParams.set('category', e.target.value)
    } else {
      url.searchParams.delete('category')
    }
    router.push(url.pathname + url.search)
  }, [router])

  const handleSortChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const url = new URL(window.location.href)
    if (e.target.value) {
      url.searchParams.set('sort', e.target.value)
    } else {
      url.searchParams.delete('sort')
    }
    router.push(url.pathname + url.search)
  }, [router])

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        <form onSubmit={handleSearch}>
          <input
            type="search"
            name="q"
            defaultValue={initialSearch}
            placeholder="Search stacks..."
            className="pl-10 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </form>
      </div>

      {/* Category Filter */}
      <div className="w-full sm:w-48">
        <select
          name="category"
          defaultValue={initialCategory}
          onChange={handleCategoryChange}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <option value="">All Categories</option>
          {categories?.map((category) => (
            <option key={category.id} value={category.slug}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* Sort */}
      <div className="w-full sm:w-40">
        <select
          name="sort"
          defaultValue={initialSort}
          onChange={handleSortChange}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <option value="recent">Most Recent</option>
          <option value="popular">Most Popular</option>
        </select>
      </div>
    </div>
  )
} 