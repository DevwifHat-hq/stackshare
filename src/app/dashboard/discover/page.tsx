'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Brain, 
  Dumbbell, 
  Moon, 
  Heart, 
  Shield, 
  Apple,
  Eye,
  Users,
  Search as SearchIcon,
  Calendar,
  TrendingUp,
  Activity,
  GitFork
} from 'lucide-react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { TrendingStacks } from '@/components/stack/trending-stacks'
import { ActivityFeed } from '@/components/stack/activity-feed'
import { StackList } from '@/components/stack/stack-list'

const CATEGORY_STYLES = {
  'cognitive-enhancement': {
    icon: Brain,
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
    gradient: 'from-purple-500/5 via-transparent'
  },
  'physical-performance': {
    icon: Dumbbell,
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
    gradient: 'from-blue-500/5 via-transparent'
  },
  'sleep-optimization': {
    icon: Moon,
    color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300',
    gradient: 'from-indigo-500/5 via-transparent'
  },
  'immune-support': {
    icon: Shield,
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
    gradient: 'from-yellow-500/5 via-transparent'
  },
  'nutrition': {
    icon: Apple,
    color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
    gradient: 'from-red-500/5 via-transparent'
  },
  'default': {
    icon: Brain,
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300',
    gradient: 'from-gray-500/5 via-transparent'
  }
} as const

interface Stack {
  id: string
  name: string
  description: string
  created_at: string
  user_id: string
  views: number
  likes: number
  is_public: boolean
  original_stack_id?: string
  original_author?: string
  forks_count: number
  user_profiles: {
    full_name: string
    avatar_url: string | null
  }
  stack_categories: Array<{
    categories: {
      id: string
      name: string
      slug: keyof typeof CATEGORY_STYLES
    } | null
  }>
}

interface Category {
  id: string
  name: string
  slug: string
}

interface PageData {
  stacks: Stack[]
  categories: Category[]
  stats: {
    users: number
    stacks: number
    logs: number
  }
}

interface SearchBarProps {
  defaultValue: string | null;
  onSearch: (value: string) => void;
}

const SearchBar = ({ defaultValue, onSearch }: SearchBarProps) => {
  return (
    <div className="relative">
      <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        className="pl-9"
        placeholder="Try searching for 'morning routine', 'focus', 'energy'..."
        defaultValue={defaultValue || ''}
        onChange={(e) => onSearch(e.target.value)}
      />
    </div>
  )
}

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelect: (slug: string | null) => void;
  loading: boolean;
}

const CategoryFilter = ({ categories, selectedCategory, onSelect, loading }: CategoryFilterProps) => {
  if (loading) return null;

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant={selectedCategory === null ? "default" : "outline"}
        onClick={() => onSelect(null)}
        className="rounded-full"
      >
        All
      </Button>
      {categories.map((category) => {
        const style = CATEGORY_STYLES[category.slug as keyof typeof CATEGORY_STYLES] || CATEGORY_STYLES.default
        const Icon = style.icon
        return (
          <Button
            key={category.id}
            variant={selectedCategory === category.slug ? "default" : "outline"}
            onClick={() => onSelect(category.slug)}
            className="rounded-full"
          >
            <Icon className="mr-2 h-4 w-4" />
            {category.name}
          </Button>
        )
      })}
    </div>
  )
}

interface ApiStack {
  id: string
  name: string
  description: string
  created_at: string
  user_id: string
  views: number
  likes: number
  is_public: boolean
  original_stack_id?: string
  original_author?: string
  forks_count?: number
  user_profiles: {
    full_name: string
    avatar_url: string | null
  } | null
  stack_categories: Array<{
    categories: {
      id: string
      name: string
      slug: string
    } | null
  }> | null
}

export default function DiscoverPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<PageData>({
    stacks: [],
    categories: [],
    stats: { users: 0, stacks: 0, logs: 0 }
  })

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      const supabase = createClient()

      try {
        // Fetch categories first
        const { data: categories, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .order('name')

        if (categoriesError) {
          console.error('Error fetching categories:', categoriesError)
          throw categoriesError
        }

        let query = supabase
          .from('stacks')
          .select(`
            id,
            name,
            description,
            created_at,
            user_id,
            views,
            likes,
            is_public,
            original_stack_id,
            original_author,
            forks_count,
            user_profiles (
              full_name,
              avatar_url
            ),
            stack_categories (
              categories (
                id,
                name,
                slug
              )
            )
          `)
          .eq('is_public', true)
          .order('created_at', { ascending: false })

        // Apply search filter if provided
        const search = searchParams.get('q')
        if (search) {
          query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
        }

        // Apply user type filter
        const userType = searchParams.get('user_type')
        if (userType === 'verified') {
          query = query.not('user_profiles', 'is', null)
        } else if (userType === 'anonymous') {
          query = query.is('user_profiles', null)
        }

        // Apply category filter if provided
        const categoryParam = searchParams.get('category')
        if (categoryParam) {
          query = query.eq('stack_categories.categories.slug', categoryParam)
        }

        // Apply sort
        const sort = searchParams.get('sort')
        switch (sort) {
          case 'new':
            query = query.order('created_at', { ascending: false })
            break
          case 'top':
            query = query.order('likes', { ascending: false })
            break
          case 'trending':
          default:
            query = query.order('views', { ascending: false })
            break
        }

        const [{ data: stacks, error: stacksError }, statsResult] = await Promise.all([
          query as unknown as Promise<{ data: ApiStack[] | null, error: any }>,
          Promise.all([
            supabase.from('stacks').select('*', { count: 'exact', head: true }).eq('is_public', true),
            supabase.from('user_profiles').select('*', { count: 'exact', head: true }),
            supabase.from('daily_logs').select('*', { count: 'exact', head: true })
          ])
        ])

        console.log('Query filters:', {
          search: searchParams.get('q'),
          category: searchParams.get('category'),
          userType: searchParams.get('user_type'),
          sort: searchParams.get('sort')
        })

        console.log('Stacks result:', {
          count: stacks?.length || 0,
          error: stacksError,
          errorDetails: stacksError instanceof Error ? stacksError.message : stacksError,
          firstStack: stacks?.[0]
        })

        if (stacksError) {
          console.error('Error fetching stacks:', stacksError)
          throw stacksError
        }

        const [stacksCount, usersCount, logsCount] = statsResult
        
        if (stacksCount.error || usersCount.error || logsCount.error) {
          console.error('Error fetching stats:', {
            stacks: stacksCount.error,
            users: usersCount.error,
            logs: logsCount.error
          })
          throw new Error('Failed to fetch stats')
        }

        // Transform the data to ensure it matches our Stack type
        const transformedStacks: Stack[] = (stacks || []).map(stack => {
          const userProfile = stack.user_profiles

          const stackCategories = stack.stack_categories || []

          return {
            id: stack.id,
            name: stack.name,
            description: stack.description,
            created_at: stack.created_at,
            user_id: stack.user_id,
            views: stack.views || 0,
            likes: stack.likes || 0,
            is_public: stack.is_public,
            original_stack_id: stack.original_stack_id,
            original_author: stack.original_author,
            forks_count: stack.forks_count || 0,
            user_profiles: {
              full_name: userProfile?.full_name || 'Anonymous',
              avatar_url: userProfile?.avatar_url || null
            },
            stack_categories: stackCategories.map(sc => ({
              categories: sc.categories && {
                id: sc.categories.id,
                name: sc.categories.name,
                slug: sc.categories.slug as keyof typeof CATEGORY_STYLES
              }
            }))
          }
        })

        setData({
          stacks: transformedStacks,
          categories: categories || [],
          stats: {
            stacks: stacksCount.count || 0,
            users: usersCount.count || 0,
            logs: logsCount.count || 0
          }
        })
      } catch (error) {
        console.error('Error fetching data:', error instanceof Error ? error.message : error)
        if (error instanceof Error) {
          console.error('Stack trace:', error.stack)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [searchParams])

  const handleSearch = (q: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (q) {
      params.set('q', q)
    } else {
      params.delete('q')
    }
    router.push(`/dashboard/discover?${params.toString()}`)
  }

  const handleCategorySelect = (slug: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (slug) {
      params.set('category', slug)
    } else {
      params.delete('category')
    }
    router.push(`/dashboard/discover?${params.toString()}`)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with USP */}
      <div className="relative border-b bg-gradient-to-b from-muted/50 via-background to-background">
        <div className="container mx-auto px-4 py-12 sm:py-16">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Optimize Your Daily Performance
            </h1>
            <p className="mt-4 text-xl text-muted-foreground">
              Discover and track proven supplement stacks curated by the community. 
              Find what works, share your results, and optimize your routine.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <div className="w-full max-w-md">
                <SearchBar defaultValue={searchParams.get('q')} onSearch={handleSearch} />
              </div>
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/dashboard/stacks/new">Create Your Stack</Link>
              </Button>
            </div>
            
            {/* Key Benefits */}
            <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3">
              <div className="flex flex-col items-center">
                <div className="rounded-full bg-primary/10 p-3">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 font-semibold">Data-Driven Results</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Track effectiveness and see real user experiences
                </p>
              </div>
              <div className="flex flex-col items-center">
                <div className="rounded-full bg-primary/10 p-3">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 font-semibold">Community Verified</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Learn from others' experiences and share your own
                </p>
              </div>
              <div className="flex flex-col items-center">
                <div className="rounded-full bg-primary/10 p-3">
                  <Activity className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 font-semibold">Personalized Tracking</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Monitor your progress and optimize your routine
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="mt-12 flex items-center justify-center gap-8 text-center">
              <div>
                <div className="text-2xl font-bold">{data.stats.stacks}</div>
                <div className="text-sm text-muted-foreground">Active Stacks</div>
              </div>
              <div className="h-12 w-px bg-border" />
              <div>
                <div className="text-2xl font-bold">{data.stats.users}</div>
                <div className="text-sm text-muted-foreground">Community Members</div>
              </div>
              <div className="h-12 w-px bg-border" />
              <div>
                <div className="text-2xl font-bold">{data.stats.logs}</div>
                <div className="text-sm text-muted-foreground">Daily Logs</div>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative gradient */}
        <div className="absolute inset-x-0 top-0 -z-10 transform-gpu overflow-hidden blur-3xl" aria-hidden="true">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary to-primary-foreground opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar - Categories */}
          <div className="col-span-12 lg:col-span-3">
            <div className="sticky top-6 space-y-6">
              <div className="space-y-2">
                <h2 className="text-lg font-semibold">Categories</h2>
                <nav className="flex flex-col space-y-1">
                  <button
                    onClick={() => handleCategorySelect(null)}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted ${
                      !searchParams.get('category') ? 'bg-primary text-primary-foreground' : ''
                    }`}
                  >
                    <Brain className="h-4 w-4" />
                    <span className="truncate">All Stacks</span>
                  </button>
                  {data.categories.map((category) => {
                    const style = CATEGORY_STYLES[category.slug as keyof typeof CATEGORY_STYLES] || CATEGORY_STYLES.default
                    const Icon = style.icon
                    return (
                      <button
                        key={category.id}
                        onClick={() => handleCategorySelect(category.slug)}
                        className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted ${
                          searchParams.get('category') === category.slug ? 'bg-primary text-primary-foreground' : ''
                        }`}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="truncate">{category.name}</span>
                      </button>
                    )
                  })}
                </nav>
              </div>

              <div className="rounded-lg border bg-card p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-primary" />
                    <span className="font-medium">Community Stats</span>
                  </div>
                </div>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total Stacks</span>
                    <span className="font-medium">{data.stats.stacks}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Active Users</span>
                    <span className="font-medium">{data.stats.users}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Daily Logs</span>
                    <span className="font-medium">{data.stats.logs}</span>
                  </div>
                </div>
              </div>

              {/* User Type Filter */}
              <div className="space-y-2">
                <h2 className="text-lg font-semibold">User Type</h2>
                <nav className="flex flex-col space-y-1">
                  <button
                    onClick={() => {
                      const params = new URLSearchParams(searchParams.toString())
                      params.delete('user_type')
                      router.push(`/dashboard/discover?${params.toString()}`)
                    }}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted ${
                      !searchParams.get('user_type') ? 'bg-primary text-primary-foreground' : ''
                    }`}
                  >
                    <Users className="h-4 w-4" />
                    <span className="truncate">All Users</span>
                  </button>
                  <button
                    onClick={() => {
                      const params = new URLSearchParams(searchParams.toString())
                      params.set('user_type', 'verified')
                      router.push(`/dashboard/discover?${params.toString()}`)
                    }}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted ${
                      searchParams.get('user_type') === 'verified' ? 'bg-primary text-primary-foreground' : ''
                    }`}
                  >
                    <Shield className="h-4 w-4" />
                    <span className="truncate">Verified Users</span>
                  </button>
                  <button
                    onClick={() => {
                      const params = new URLSearchParams(searchParams.toString())
                      params.set('user_type', 'anonymous')
                      router.push(`/dashboard/discover?${params.toString()}`)
                    }}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted ${
                      searchParams.get('user_type') === 'anonymous' ? 'bg-primary text-primary-foreground' : ''
                    }`}
                  >
                    <Users className="h-4 w-4" />
                    <span className="truncate">Anonymous Users</span>
                  </button>
                </nav>
              </div>
            </div>
          </div>

          {/* Main Content - Stack List */}
          <div className="col-span-12 lg:col-span-9">
            <div className="space-y-6">
              {/* Sort Options */}
              <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={!searchParams.get('sort') || searchParams.get('sort') === 'trending' ? 'text-primary font-medium' : ''}
                    onClick={() => {
                      const params = new URLSearchParams(searchParams.toString())
                      params.set('sort', 'trending')
                      router.push(`/dashboard/discover?${params.toString()}`)
                    }}
                  >
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Trending
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={searchParams.get('sort') === 'new' ? 'text-primary font-medium' : ''}
                    onClick={() => {
                      const params = new URLSearchParams(searchParams.toString())
                      params.set('sort', 'new')
                      router.push(`/dashboard/discover?${params.toString()}`)
                    }}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    New
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={searchParams.get('sort') === 'top' ? 'text-primary font-medium' : ''}
                    onClick={() => {
                      const params = new URLSearchParams(searchParams.toString())
                      params.set('sort', 'top')
                      router.push(`/dashboard/discover?${params.toString()}`)
                    }}
                  >
                    <Heart className="mr-2 h-4 w-4" />
                    Top
                  </Button>
                </div>
              </div>

              {/* Stack Cards */}
              <div className="space-y-4">
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 w-1/3 bg-muted animate-pulse rounded" />
                          <div className="h-3 w-1/4 bg-muted animate-pulse rounded" />
                        </div>
                      </div>
                    </Card>
                  ))
                ) : data.stacks.length > 0 ? (
                  data.stacks.map((stack) => (
                    <div key={stack.id} className="group relative">
                      <Link href={`/dashboard/stacks/${stack.id}`}>
                        <Card className={`p-4 transition-all hover:shadow-md ${stack.original_stack_id ? 'bg-muted/30' : ''}`}>
                          <div className="flex items-start gap-4">
                            <Avatar className="h-10 w-10 border">
                              <AvatarImage src={stack.user_profiles?.avatar_url || ''} />
                              <AvatarFallback>
                                {stack.user_profiles?.full_name?.split(' ').map(n => n[0]).join('') || '?'}
                              </AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-x-4">
                                <div className="space-y-1 min-w-0">
                                  <h3 className="font-medium text-base group-hover:text-primary truncate">
                                    {stack.name}
                                  </h3>
                                  <div className="flex items-center gap-2 text-sm">
                                    <span className="text-muted-foreground truncate">
                                      {stack.user_profiles?.full_name || 'Anonymous'}
                                    </span>
                                    {stack.original_stack_id && (
                                      <>
                                        <span className="text-muted-foreground/50">•</span>
                                        <div className="flex items-center gap-1.5 text-muted-foreground">
                                          <GitFork className="h-3.5 w-3.5" />
                                          <span className="text-xs">forked from</span>
                                          <Link 
                                            href={`/dashboard/stacks/${stack.original_stack_id}`}
                                            className="text-primary hover:underline"
                                            onClick={(e) => e.stopPropagation()}
                                          >
                                            {stack.original_author || 'Anonymous'}
                                          </Link>
                                        </div>
                                      </>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-3 shrink-0">
                                  <div className="flex items-center gap-1.5" title="Views">
                                    <Eye className="h-4 w-4 text-muted-foreground/70" />
                                    <span className="text-sm tabular-nums">{stack.views || 0}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5" title="Likes">
                                    <Heart className={`h-4 w-4 ${stack.likes > 0 ? 'fill-current text-red-500' : 'text-muted-foreground/70'}`} />
                                    <span className="text-sm tabular-nums">{stack.likes || 0}</span>
                                  </div>
                                  {(stack.forks_count ?? 0) > 0 && (
                                    <div className="flex items-center gap-1.5" title="Forks">
                                      <GitFork className="h-4 w-4 text-muted-foreground/70" />
                                      <span className="text-sm tabular-nums">{stack.forks_count}</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {stack.description && (
                                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                                  {stack.description}
                                </p>
                              )}

                              {stack.stack_categories?.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-1.5">
                                  {stack.stack_categories?.filter(sc => sc.categories).map(({ categories }) => {
                                    if (!categories?.slug) return null
                                    const style = CATEGORY_STYLES[categories.slug] || CATEGORY_STYLES.default
                                    const Icon = style.icon
                                    return (
                                      <Badge 
                                        key={categories.id} 
                                        variant="secondary" 
                                        className={`${style.color} text-xs`}
                                      >
                                        <Icon className="mr-1 h-3 w-3" />
                                        {categories.name}
                                      </Badge>
                                    )
                                  })}
                                </div>
                              )}
                            </div>
                          </div>
                        </Card>
                      </Link>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full">
                    <Card className="p-12 text-center">
                      <div className="mx-auto flex max-w-lg flex-col items-center justify-center">
                        <SearchIcon className="h-12 w-12 text-muted-foreground/50" />
                        <h3 className="mt-6 text-lg font-semibold">No stacks found</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {searchParams.get('q')
                            ? `No results found for "${searchParams.get('q')}"`
                            : 'Try adjusting your filters or create your own stack'}
                        </p>
                        <Button asChild className="mt-8">
                          <Link href="/dashboard/stacks/new">Create a Stack</Link>
                        </Button>
                      </div>
                    </Card>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 