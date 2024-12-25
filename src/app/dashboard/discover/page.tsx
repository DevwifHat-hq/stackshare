'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Brain, Dumbbell, TrendingUp, Users, Search as SearchIcon, Activity, BookOpen, Eye, Heart } from 'lucide-react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'

interface Stack {
  id: string
  name: string
  description: string
  created_at: string
  user_id: string
  views: number
  likes: number
  categories: {
    id: string
    name: string
    slug: string
  }
  user_profiles: {
    full_name: string
    avatar_url: string
  }
}

interface Category {
  id: string
  name: string
  slug: string
}

interface ActivityItem {
  id: string
  created_at: string
  action: string
  metadata: {
    mood_score?: number
    energy_score?: number
    focus_score?: number
    summary?: string
  }
  user_profiles: {
    id: string
    full_name: string
    avatar_url: string
  }
  stacks?: {
    id: string
    name: string
  }
}

interface PageData {
  stacks: Stack[]
  categories: Category[]
  activity: ActivityItem[]
  stats: {
    users: number
    stacks: number
    logs: number
  }
}

export default function DiscoverPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<PageData>({
    stacks: [],
    categories: [],
    activity: [],
    stats: { users: 0, stacks: 0, logs: 0 }
  })

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        router.push('/auth/signin')
        return
      }

      // Fetch categories first
      const { data: categories } = await supabase
        .from('categories')
        .select('*')
        .order('name')

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
          categories (
            id,
            name,
            slug
          ),
          user_profiles (
            full_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false })

      // Apply search filter if provided
      const search = searchParams.get('q')
      if (search) {
        query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
      }

      // Apply category filter if provided
      const category = searchParams.get('category')
      if (category) {
        query = query.eq('categories.id', category)
      }

      // Get activity feed with more details
      const [stacksResult, activityResult, statsResult] = await Promise.all([
        query,
        supabase
          .from('daily_logs')
          .select(`
            id,
            created_at,
            action,
            metadata,
            user_id,
            stack_id,
            user_profiles (
              id,
              full_name,
              avatar_url
            ),
            stacks (
              id,
              name
            )
          `)
          .order('created_at', { ascending: false })
          .limit(10),
        Promise.all([
          supabase.from('stacks').select('*', { count: 'exact', head: true }),
          supabase.from('user_profiles').select('*', { count: 'exact', head: true }),
          supabase.from('daily_logs').select('*', { count: 'exact', head: true })
        ])
      ])

      console.log('Stacks result:', stacksResult)
      const [{ count: totalStacks }, { count: totalUsers }, { count: totalLogs }] = statsResult

      setData({
        stacks: (stacksResult.data || []).map(stack => ({
          ...stack,
          categories: stack.categories || { id: '', name: '', slug: '' },
          user_profiles: stack.user_profiles || { full_name: '', avatar_url: '' }
        })) as Stack[],
        categories: categories || [],
        activity: (activityResult.data || []).map(item => ({
          ...item,
          user_profiles: item.user_profiles || { id: '', full_name: '', avatar_url: '' },
          stacks: item.stacks
        })) as ActivityItem[],
        stats: {
          stacks: totalStacks || 0,
          users: totalUsers || 0,
          logs: totalLogs || 0
        }
      })
      setLoading(false)
    }

    fetchData()
  }, [searchParams, router])

  const handleSearch = (q: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (q) {
      params.set('q', q)
    } else {
      params.delete('q')
    }
    router.push(`/dashboard/discover?${params.toString()}`)
  }

  return (
    <div className="space-y-8">
      {/* Header with Stats */}
      <div className="relative">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
        <div className="relative py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-6 lg:mb-0">
              <h1 className="text-4xl font-bold tracking-tight text-foreground">
                Discover Stacks
              </h1>
              <p className="mt-3 text-lg text-muted-foreground max-w-2xl">
                Explore and learn from the community's biohacking stacks. Find inspiration, share your knowledge, and connect with others.
              </p>
            </div>

            <div className="flex flex-col gap-4 lg:items-end">
              {/* Compact Stats */}
              <div className="flex gap-6 text-sm">
                {loading ? (
                  <>
                    <StatSkeleton />
                    <StatSkeleton />
                    <StatSkeleton />
                  </>
                ) : (
                  <>
                    <Stat
                      icon={BookOpen}
                      value={data.stats.stacks}
                      label="Stacks"
                    />
                    <Stat
                      icon={Users}
                      value={data.stats.users}
                      label="Users"
                    />
                    <Stat
                      icon={Activity}
                      value={data.stats.logs}
                      label="Logs"
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <SearchBar
        defaultValue={searchParams.get('q') || ''}
        onSearch={handleSearch}
      />

      <div className="grid gap-8 lg:grid-cols-[1fr,400px]">
        {/* Main Content */}
        <div className="space-y-6">
          {/* Categories */}
          <CategoryFilter
            categories={data.categories}
            selectedCategory={searchParams.get('category')}
            loading={loading}
          />

          {/* Stacks Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <StackCardSkeleton key={i} />
              ))
            ) : data.stacks.length > 0 ? (
              data.stacks.map((stack) => (
                <StackCard key={stack.id} stack={stack} />
              ))
            ) : (
              <EmptyState query={searchParams.get('q')} />
            )}
          </div>
        </div>

        {/* Activity Feed */}
        <div>
          <Card className="sticky top-4">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-6">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <ActivityItemSkeleton key={i} />
                ))
              ) : data.activity.length > 0 ? (
                data.activity.map((item) => (
                  <ActivityItem key={item.id} item={item} />
                ))
              ) : (
                <EmptyActivity />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// Components
function Stat({ icon: Icon, value, label }: { icon: any; value: number; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="rounded-lg bg-primary/10 p-2">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div>
        <div className="font-semibold">{value}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
    </div>
  )
}

function StatSkeleton() {
  return (
    <div className="flex items-center gap-2">
      <Skeleton className="h-8 w-8 rounded-lg" />
      <div>
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-3 w-16 mt-1" />
      </div>
    </div>
  )
}

function SearchBar({ defaultValue, onSearch }: { defaultValue?: string; onSearch: (q: string) => void }) {
  return (
    <div className="relative overflow-hidden rounded-xl border bg-gradient-to-b from-background to-background/50 shadow-xl">
      {/* Decorative elements */}
      <div className="absolute inset-0 bg-grid-slate-100/50 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/50" />
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-tr from-primary/10 via-transparent to-secondary/10" />
      
      {/* Content */}
      <div className="relative px-8 py-10">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-4 text-2xl font-bold tracking-tight">Find Your Next Stack</h2>
          <p className="mb-6 text-muted-foreground">
            Search through our collection of biohacking stacks and discover new ways to optimize your performance.
          </p>
          <form className="group flex items-center gap-2" onSubmit={(e) => {
            e.preventDefault()
            const formData = new FormData(e.currentTarget)
            onSearch(formData.get('q')?.toString() || '')
          }}>
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                name="q"
                placeholder="Try searching for 'morning routine', 'focus', 'energy'..."
                defaultValue={defaultValue}
                className="w-full pl-10 pr-4 py-6 text-base bg-background/80 backdrop-blur-sm transition-shadow duration-300 group-hover:shadow-md"
              />
            </div>
            <Button type="submit" size="lg" className="px-8">
              Search
            </Button>
          </form>
          {/* Quick filters */}
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <span>Popular:</span>
            <button
              onClick={() => onSearch('morning')}
              className="rounded-full px-3 py-1 bg-primary/10 hover:bg-primary/20 transition-colors"
            >
              Morning Routine
            </button>
            <button
              onClick={() => onSearch('focus')}
              className="rounded-full px-3 py-1 bg-primary/10 hover:bg-primary/20 transition-colors"
            >
              Focus
            </button>
            <button
              onClick={() => onSearch('sleep')}
              className="rounded-full px-3 py-1 bg-primary/10 hover:bg-primary/20 transition-colors"
            >
              Sleep
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function CategoryFilter({ categories, selectedCategory, loading }: { categories: Category[]; selectedCategory?: string; loading: boolean }) {
  if (loading) {
    return (
      <div className="flex gap-2 flex-wrap">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-20 rounded-md" />
        ))}
      </div>
    )
  }

  return (
    <div className="flex gap-2 flex-wrap">
      <Link
        href="/dashboard/discover"
        className={`inline-flex items-center justify-center rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 
          ${!selectedCategory ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'border border-input bg-background hover:bg-accent hover:text-accent-foreground'}`}
      >
        All
      </Link>
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/dashboard/discover?category=${category.id}`}
          className={`inline-flex items-center justify-center rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 
            ${selectedCategory === category.id ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'border border-input bg-background hover:bg-accent hover:text-accent-foreground'}`}
        >
          {category.name}
        </Link>
      ))}
    </div>
  )
}

function StackCard({ stack }: { stack: Stack }) {
  return (
    <Link href={`/dashboard/stacks/${stack.id}`} className="block">
      <Card className="group hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/50">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors">
                {stack.name}
              </CardTitle>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Avatar className="h-5 w-5">
                  <AvatarImage src={stack.user_profiles?.avatar_url} />
                  <AvatarFallback>
                    <Users className="h-3 w-3" />
                  </AvatarFallback>
                </Avatar>
                <span>{stack.user_profiles?.full_name || 'Anonymous'}</span>
                <span>•</span>
                <span>{new Date(stack.created_at).toLocaleDateString()}</span>
              </div>
            </div>
            {stack.categories?.slug === 'cognitive-enhancement' ? (
              <div className="rounded-full bg-purple-100 p-2">
                <Brain className="h-4 w-4 text-purple-500" />
              </div>
            ) : (
              <div className="rounded-full bg-blue-100 p-2">
                <Dumbbell className="h-4 w-4 text-blue-500" />
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
            {stack.description}
          </p>
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {stack.views || 0} views
              </span>
              <span className="flex items-center gap-1">
                <Heart className="h-3 w-3" />
                {stack.likes || 0} likes
              </span>
            </div>
            <div className="text-xs text-primary font-medium group-hover:translate-x-1 transition-transform">
              View Stack →
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

function StackCardSkeleton() {
  return (
    <Card className="border-2">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded-full" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-4">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-3 w-20" />
        </div>
      </CardContent>
    </Card>
  )
}

function ActivityItem({ item }: { item: ActivityItem }) {
  return (
    <div className="group relative">
      <div className="flex gap-4">
        <Avatar className="h-8 w-8">
          <AvatarImage src={item.user_profiles?.avatar_url} />
          <AvatarFallback>
            <Users className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
        <div className="space-y-1 flex-1">
          <p className="text-sm leading-tight">
            <span className="font-medium">
              {item.user_profiles?.full_name || 'Anonymous'}
            </span>{' '}
            {item.stacks ? (
              <>
                logged progress on{' '}
                <Link href={`/dashboard/stacks/${item.stacks.id}`} className="font-medium hover:underline">
                  {item.stacks.name}
                </Link>
              </>
            ) : (
              'logged their daily metrics'
            )}
          </p>
          <div className="flex items-center gap-2">
            <time className="text-xs text-muted-foreground">
              {new Date(item.created_at).toLocaleDateString()}
            </time>
            {item.metadata?.mood_score && (
              <Badge variant="secondary" className="text-xs">
                Mood: {item.metadata.mood_score}/10
              </Badge>
            )}
            {item.metadata?.energy_score && (
              <Badge variant="secondary" className="text-xs">
                Energy: {item.metadata.energy_score}/10
              </Badge>
            )}
          </div>
        </div>
      </div>
      {item.metadata?.summary && (
        <div className="mt-2 ml-12 text-sm text-muted-foreground">
          "{item.metadata.summary}"
        </div>
      )}
    </div>
  )
}

function ActivityItemSkeleton() {
  return (
    <div className="flex gap-4">
      <Skeleton className="h-8 w-8 rounded-full" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-3/4" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-24" />
        </div>
      </div>
    </div>
  )
}

function EmptyState({ query }: { query?: string }) {
  return (
    <Card className="col-span-full">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <SearchIcon className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <p className="text-lg font-medium text-muted-foreground mb-2">
          {query
            ? `No results found for "${query}"`
            : 'No stacks found'}
        </p>
        <p className="text-sm text-muted-foreground mb-6">
          Try adjusting your search or create your own stack
        </p>
        <Link
          href="/dashboard/stacks/new"
          className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Create a Stack
        </Link>
      </CardContent>
    </Card>
  )
}

function EmptyActivity() {
  return (
    <div className="text-center py-6">
      <Activity className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
      <p className="text-sm text-muted-foreground">No recent activity</p>
    </div>
  )
} 