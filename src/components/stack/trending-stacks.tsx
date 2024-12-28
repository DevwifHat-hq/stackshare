'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Eye, Heart } from 'lucide-react'
import Link from 'next/link'

interface TrendingStack {
  id: string
  name: string
  description: string
  views: number
  likes: number
  user_profiles: {
    full_name: string
    avatar_url: string | null
  }
}

export function TrendingStacks() {
  const [stacks, setStacks] = useState<TrendingStack[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTrendingStacks = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('stacks')
        .select(`
          id,
          name,
          description,
          views,
          likes,
          user_profiles!inner (
            full_name,
            avatar_url
          )
        `)
        .eq('is_public', true)
        .order('views', { ascending: false })
        .limit(3)
        .returns<TrendingStack[]>()

      if (data) {
        setStacks(data)
      }
      setLoading(false)
    }

    fetchTrendingStacks()
  }, [])

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 w-2/3 bg-muted animate-pulse rounded" />
              <div className="h-2 w-1/3 bg-muted animate-pulse rounded" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (stacks.length === 0) {
    return (
      <div className="text-sm text-muted-foreground text-center py-2">
        No trending stacks yet
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {stacks.map((stack) => (
        <Link
          key={stack.id}
          href={`/dashboard/stacks/${stack.id}`}
          className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
        >
          <Avatar className="h-8 w-8 border">
            <AvatarImage src={stack.user_profiles.avatar_url || ''} />
            <AvatarFallback>
              {stack.user_profiles.full_name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">
              {stack.name}
            </p>
            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
              <div className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {stack.views}
              </div>
              <div className="flex items-center gap-1">
                <Heart className="h-3 w-3" />
                {stack.likes}
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
} 