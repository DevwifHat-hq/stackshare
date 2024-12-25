'use client'

import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Users, Eye, Brain, Dumbbell, Moon, Heart, Shield, Apple } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { StackActions } from './stack-actions'

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
  'longevity': {
    icon: Heart,
    color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
    gradient: 'from-green-500/5 via-transparent'
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
  purpose: string
  views: number
  likes: number
  created_at: string
  user_id: string
  categories: {
    id: string
    name: string
    slug: string
  } | null
  user_profiles: {
    full_name: string | null
    avatar_url: string | null
  } | null
}

export function StackCard({ stack }: { stack: Stack }) {
  const router = useRouter()
  const supabase = createClient()

  const categorySlug = stack.categories?.slug || 'default'
  const categoryStyle = CATEGORY_STYLES[categorySlug as keyof typeof CATEGORY_STYLES] || CATEGORY_STYLES.default
  const CategoryIcon = categoryStyle.icon

  const handleStackClick = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        await supabase.rpc('increment_stack_view', {
          stack_id: stack.id,
          viewer_id: session.user.id
        })
      }
      router.push(`/dashboard/stacks/${stack.id}`)
    } catch (error) {
      console.error('Error tracking view:', error)
      router.push(`/dashboard/stacks/${stack.id}`)
    }
  }

  return (
    <article className="group relative flex flex-col justify-between rounded-xl border bg-card transition-all duration-200 hover:shadow-lg overflow-hidden">
      {/* Category-specific gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${categoryStyle.gradient} to-transparent opacity-50`} />

      <div className="relative p-6">
        <div className="flex items-center justify-between text-xs mb-4">
          <div className="flex items-center gap-2">
            <time dateTime={stack.created_at} className="text-muted-foreground">
              {new Date(stack.created_at).toLocaleDateString()}
            </time>
            <span className="flex items-center gap-1 text-muted-foreground">
              <Eye className="h-3 w-3" />
              {stack.views}
            </span>
          </div>
          {stack.categories && (
            <Link
              href={`/dashboard/discover?category=${stack.categories.slug}`}
              className={`relative z-10 rounded-full px-3 py-1.5 font-medium ${categoryStyle.color} flex items-center gap-2 group-hover:opacity-90 transition-opacity`}
            >
              <CategoryIcon className="h-3.5 w-3.5" />
              {stack.categories.name}
            </Link>
          )}
        </div>

        <div className="space-y-4">
          <button
            onClick={handleStackClick}
            className="block w-full text-left group-hover:text-primary transition-colors"
          >
            <h3 className="text-lg font-semibold text-foreground group-hover:text-primary">
              {stack.name}
            </h3>
          </button>
          <p className="line-clamp-3 text-sm text-muted-foreground">
            {stack.description}
          </p>
          {stack.purpose && (
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-sm">
                <span className="font-medium text-foreground">Benefits: </span>
                {stack.purpose}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="relative mt-4 flex items-center gap-x-4 border-t p-6">
        <div className="flex items-center gap-x-2">
          {stack.user_profiles?.avatar_url ? (
            <img
              src={stack.user_profiles.avatar_url}
              alt=""
              className="h-8 w-8 rounded-full bg-gray-50 ring-2 ring-background"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center ring-2 ring-background">
              <Users className="h-4 w-4 text-primary" />
            </div>
          )}
          <div className="text-sm">
            <p className="font-medium text-foreground">
              {stack.user_profiles?.full_name || 'Anonymous'}
            </p>
          </div>
        </div>
        <div className="flex-1" />
        <StackActions stackId={stack.id} initialLikes={stack.likes} />
      </div>
    </article>
  )
} 