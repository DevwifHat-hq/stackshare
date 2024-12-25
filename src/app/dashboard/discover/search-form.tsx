'use client'

import { Search, X, SlidersHorizontal, ArrowUpDown } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useState, useTransition } from 'react'
import { useDebounce } from '@/lib/hooks/use-debounce'

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
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [search, setSearch] = useState(initialSearch || '')
  const [category, setCategory] = useState(initialCategory || '')
  const [sort, setSort] = useState(initialSort || 'recent')
  
  const debouncedSearch = useDebounce(search, 300)

  // Create URL with current search params
  const createQueryString = useCallback(
    (params: Record<string, string | null>) => {
      const newSearchParams = new URLSearchParams(searchParams?.toString())
      
      Object.entries(params).forEach(([key, value]) => {
        if (value === null) {
          newSearchParams.delete(key)
        } else {
          newSearchParams.set(key, value)
        }
      })
      
      return newSearchParams.toString()
    },
    [searchParams]
  )

  // Handle search input change
  const handleSearchChange = useCallback((value: string) => {
    setSearch(value)
    const queryString = createQueryString({
      q: value || null,
      category: category || null,
      sort: sort !== 'recent' ? sort : null,
    })
    
    startTransition(() => {
      router.push(`?${queryString}`, { scroll: false })
    })
  }, [router, category, sort, createQueryString])

  // Handle category change
  const handleCategoryChange = useCallback((value: string) => {
    setCategory(value)
    const queryString = createQueryString({
      q: debouncedSearch || null,
      category: value || null,
      sort: sort !== 'recent' ? sort : null,
    })
    
    startTransition(() => {
      router.push(`?${queryString}`, { scroll: false })
    })
  }, [router, debouncedSearch, sort, createQueryString])

  // Handle sort change
  const handleSortChange = useCallback((value: string) => {
    setSort(value)
    const queryString = createQueryString({
      q: debouncedSearch || null,
      category: category || null,
      sort: value !== 'recent' ? value : null,
    })
    
    startTransition(() => {
      router.push(`?${queryString}`, { scroll: false })
    })
  }, [router, debouncedSearch, category, createQueryString])

  const handleClearSearch = useCallback(() => {
    handleSearchChange('')
  }, [handleSearchChange])

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <div className="relative">
          <Search className={`absolute left-4 top-3.5 h-5 w-5 transition-colors ${isPending ? 'text-primary' : 'text-muted-foreground'}`} />
          <input
            type="search"
            name="q"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search for stacks by name, description, or purpose..."
            className={`pl-12 pr-12 flex h-12 w-full rounded-full border bg-background/60 backdrop-blur-sm px-4 py-3 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all ${
              isPending ? 'border-primary' : ''
            }`}
          />
          {search && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-4 top-3.5 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <SlidersHorizontal className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <select
            name="category"
            value={category}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className={`pl-9 flex h-10 w-full rounded-lg border bg-background/60 backdrop-blur-sm px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all appearance-none ${
              isPending ? 'border-primary' : ''
            }`}
          >
            <option value="">All Categories</option>
            {categories?.map((category) => (
              <option key={category.id} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-3 pointer-events-none">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-foreground">
              <path d="M1.5 3.5L5 7L8.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        <div className="relative w-full sm:w-48">
          <ArrowUpDown className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <select
            name="sort"
            value={sort}
            onChange={(e) => handleSortChange(e.target.value)}
            className={`pl-9 flex h-10 w-full rounded-lg border bg-background/60 backdrop-blur-sm px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all appearance-none ${
              isPending ? 'border-primary' : ''
            }`}
          >
            <option value="recent">Most Recent</option>
            <option value="popular">Most Popular</option>
          </select>
          <div className="absolute right-3 top-3 pointer-events-none">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-foreground">
              <path d="M1.5 3.5L5 7L8.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
} 