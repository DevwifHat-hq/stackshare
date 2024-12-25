import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Brain, Plus, ArrowRight, Clock, Calendar, Target, GitFork, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

export const dynamic = 'force-dynamic'

interface Stack {
  id: string
  name: string
  description: string
  created_at: string
  views: number
  likes: number
  forks_count: number
  version: string
  forked_from?: {
    id: string
    name: string
    user_profiles: {
      full_name: string
    }
  }
  user_profiles: {
    full_name: string
    avatar_url?: string
  }
  stack_items?: any[]
  categories?: {
    name: string
    slug: string
  } | null
}

export default async function StacksPage() {
  const supabase = await createClient()
  const { data: stacks } = await supabase
    .from('stacks')
    .select(`
      *,
      categories (
        name,
        slug
      ),
      forked_from (
        id,
        name,
        user_profiles (
          full_name
        )
      ),
      user_profiles (
        full_name,
        avatar_url
      )
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Stacks</h1>
          <p className="mt-2 text-muted-foreground">
            Manage and track your supplement and habit stacks
          </p>
        </div>
        <Button asChild size="lg" className="mt-4 lg:mt-0">
          <Link href="/dashboard/stacks/new" className="gap-2">
            <Plus className="h-4 w-4" />
            New Stack
          </Link>
        </Button>
      </div>

      {/* Stacks Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {stacks?.map((stack: Stack) => (
          <Link key={stack.id} href={`/dashboard/stacks/${stack.id}`}>
            <Card className="h-full hover:shadow-lg transition-all duration-200 group">
              <CardHeader className="space-y-1">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="mb-2">
                    {stack.categories?.name || 'Uncategorized'}
                  </Badge>
                  <div className="flex items-center gap-2">
                    {stack.version && (
                      <Badge variant="outline" className="text-xs">
                        v{stack.version}
                      </Badge>
                    )}
                    <span className="text-sm text-muted-foreground">
                      {new Date(stack.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <CardTitle className="text-xl group-hover:text-primary transition-colors">
                  {stack.name}
                </CardTitle>
                {stack.forked_from && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <GitFork className="h-3 w-3" />
                    <span>
                      Forked from{' '}
                      <span className="font-medium">
                        {stack.forked_from.user_profiles.full_name}'s {stack.forked_from.name}
                      </span>
                    </span>
                  </div>
                )}
                <CardDescription className="line-clamp-2">
                  {stack.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Target className="h-4 w-4" />
                      {stack.views || 0} views
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      {stack.likes || 0} likes
                    </span>
                    <span className="flex items-center gap-1">
                      <GitFork className="h-4 w-4" />
                      {stack.forks_count || 0} forks
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {stack.stack_items?.length || 0} items
                    </span>
                  </div>
                  <span className="flex items-center gap-1 text-primary font-medium group-hover:translate-x-1 transition-transform">
                    View Details
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </CardFooter>
            </Card>
          </Link>
        ))}

        {/* Empty State */}
        {(!stacks || stacks.length === 0) && (
          <Card className="col-span-full">
            <CardHeader>
              <CardTitle>No stacks yet</CardTitle>
              <CardDescription>
                Create your first stack or fork one from the community to get started
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <Button asChild>
                <Link href="/dashboard/stacks/new" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Your First Stack
                </Link>
              </Button>
              <span className="text-sm text-muted-foreground">or</span>
              <Button asChild variant="outline">
                <Link href="/dashboard/discover" className="gap-2">
                  <GitFork className="h-4 w-4" />
                  Fork from Community
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 