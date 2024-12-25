import { createClient } from '@/lib/supabase/server'
import { MainNav } from '@/components/nav/main-nav'
import { SearchForm } from './search-form'
import { StackCard } from '@/components/stack/stack-card'
import { Suspense } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ActivityFeed } from '@/components/activity-feed'
import { TrendingUp, Users, BookOpen, Activity, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface SearchParams {
  search?: string
  category?: string
  sort?: 'popular' | 'recent'
}

async function getStacks({ search, category, sort }: SearchParams) {
  const supabase = createClient()

  let query = supabase
    .from('stacks')
    .select(`
      id,
      name,
      description,
      purpose,
      views,
      likes,
      created_at,
      user_id,
      categories!inner (
        id,
        name,
        slug
      ),
      user_profiles!inner (
        full_name,
        avatar_url
      )
    `)
    .eq('is_public', true)

  // Apply search filter
  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,purpose.ilike.%${search}%`)
  }

  // Apply category filter
  if (category) {
    query = query.eq('categories.slug', category)
  }

  // Apply sorting
  if (sort === 'popular') {
    query = query.order('likes', { ascending: false })
  } else {
    query = query.order('created_at', { ascending: false })
  }

  const { data: stacks, error } = await query

  if (error) {
    console.error('Error fetching stacks:', error)
    return []
  }

  return stacks
}

async function getCategories() {
  const supabase = createClient()
  const { data: categories, error } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  if (error) {
    console.error('Error fetching categories:', error)
    return []
  }

  return categories
}

async function getActivity() {
  const supabase = createClient()
  const { data: activity, error } = await supabase
    .from('activity')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) {
    console.error('Error fetching activity:', error)
    return []
  }

  return activity
}

async function getCommunityStats() {
  const supabase = createClient()
  const { data: stats, error } = await supabase
    .from('community_stats')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)

  if (error) {
    console.error('Error fetching community stats:', error)
    return { stacks: 0, users: 0, logs: 0 }
  }

  return stats[0]
}

export default async function DiscoverPage({ searchParams }: PageProps) {
  const validatedParams = {
    search: typeof searchParams.q === 'string' ? searchParams.q : undefined,
    category: typeof searchParams.category === 'string' ? searchParams.category : undefined,
    sort: (typeof searchParams.sort === 'string' && ['popular', 'recent'].includes(searchParams.sort)) 
      ? searchParams.sort as 'popular' | 'recent' 
      : 'popular' // Default to popular for public page
  }

  const [stacks, categories, activity, stats] = await Promise.all([
    getStacks(validatedParams),
    getCategories(),
    getActivity(),
    getCommunityStats()
  ])

  return (
    <>
      <MainNav />
      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-background pt-16 pb-24">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.primary.100),theme(colors.background))]" />
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center">
              <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
                Discover & Share Your
                <span className="text-primary block">Biohacking Stacks</span>
              </h1>
              <p className="mt-6 text-lg leading-8 text-muted-foreground">
                Join our community of biohackers sharing their knowledge and experiences. Find the perfect stack for your goals and track your progress.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link
                  href="/auth/login"
                  className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  Get Started
                </Link>
                <Link
                  href="#popular-stacks"
                  className="text-sm font-semibold leading-6 text-muted-foreground hover:text-primary"
                >
                  Browse Stacks <ArrowRight className="inline h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="border-y bg-muted/50">
          <div className="container mx-auto px-4 py-12">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="flex flex-col items-center justify-center">
                <div className="flex items-center gap-2 text-2xl font-bold">
                  <BookOpen className="h-6 w-6 text-primary" />
                  {stats.stacks}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">Public Stacks</div>
              </div>
              <div className="flex flex-col items-center justify-center">
                <div className="flex items-center gap-2 text-2xl font-bold">
                  <Users className="h-6 w-6 text-primary" />
                  {stats.users}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">Active Members</div>
              </div>
              <div className="flex flex-col items-center justify-center">
                <div className="flex items-center gap-2 text-2xl font-bold">
                  <Activity className="h-6 w-6 text-primary" />
                  {stats.logs}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">Daily Logs</div>
              </div>
            </div>
          </div>
        </section>

        {/* Search Section */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="rounded-xl border bg-gradient-to-b from-card to-card/50 p-6 shadow-lg">
              <div className="mx-auto max-w-2xl">
                <h2 className="mb-4 text-center text-lg font-semibold">Find Your Next Stack</h2>
                <SearchForm
                  initialSearch={validatedParams.search}
                  initialCategory={validatedParams.category}
                  initialSort={validatedParams.sort}
                  categories={categories}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-12" id="popular-stacks">
          <div className="container mx-auto px-4">
            <div className="grid gap-8 lg:grid-cols-[1fr,320px]">
              {/* Results */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold">
                    {validatedParams.sort === 'popular' ? 'Popular Stacks' : 'Recent Stacks'}
                  </h2>
                  <div className="text-sm text-muted-foreground">
                    {stacks.length} {stacks.length === 1 ? 'stack' : 'stacks'} found
                  </div>
                </div>

                <Suspense
                  fallback={
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                      {[...Array(6)].map((_, i) => (
                        <StackSkeleton key={i} />
                      ))}
                    </div>
                  }
                >
                  {stacks && stacks.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                      {stacks.map((stack) => (
                        <StackCard key={stack.id} stack={stack} />
                      ))}
                    </div>
                  ) : (
                    <EmptyState search={validatedParams.search} category={validatedParams.category} />
                  )}
                </Suspense>
              </div>

              {/* Activity Feed */}
              <div>
                <Card className="sticky top-24 hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div>
                      <CardTitle className="text-base">Recent Activity</CardTitle>
                    </div>
                    <TrendingUp className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent className="pt-4">
                    <ActivityFeed items={activity} />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
} 