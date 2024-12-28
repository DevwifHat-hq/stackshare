'use client'

import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { GitFork, Heart, Plus } from 'lucide-react'
import { useSession } from '@/hooks/use-session'

interface Props {
  stack: {
    id: string
    name: string
    user_id: string
    user_profiles: {
      full_name: string | null
      avatar_url: string | null
    } | null
    stack_stats: {
      views: number
      likes: number
    } | null
    original_stack_id?: string
    forked_from?: {
      id: string
      name: string
      user_profiles: {
        full_name: string | null
      } | null
    }
  }
}

function getInitials(name: string | null): string {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('')
}

export function StackHeader({ stack }: Props) {
  const { session } = useSession()
  const isOwner = session?.user.id === stack.user_id

  return (
    <div className="flex items-center gap-4 flex-wrap">
      {/* Stack Title & Author */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold truncate">{stack.name}</h1>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Heart className="h-4 w-4" />
            <span>{stack.stack_stats?.likes ?? 0}</span>
          </Button>
        </div>
        <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Avatar className="h-5 w-5">
              <AvatarImage src={stack.user_profiles?.avatar_url || ''} />
              <AvatarFallback>
                {getInitials(stack.user_profiles?.full_name || null)}
              </AvatarFallback>
            </Avatar>
            <span>{stack.user_profiles?.full_name || 'Anonymous'}</span>
            {!stack.original_stack_id && (
              <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4 bg-primary/10 text-primary hover:bg-primary/20">
                OP
              </Badge>
            )}
          </div>
          <span>·</span>
          <span>{stack.stack_stats?.views ?? 0} views</span>
          {stack.forked_from && (
            <>
              <span>·</span>
              <div className="flex items-center gap-1.5">
                <GitFork className="h-3.5 w-3.5" />
                <span className="text-xs">forked from</span>
                <Link 
                  href={`/dashboard/stacks/${stack.forked_from.id}`}
                  className="text-primary hover:underline"
                >
                  {stack.forked_from.name} by {stack.forked_from.user_profiles?.full_name || 'Anonymous'}
                </Link>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        {isOwner ? (
          <Button asChild variant="outline">
            <Link href={`/dashboard/stacks/${stack.id}/edit`}>
              Edit Stack
            </Link>
          </Button>
        ) : (
          <Button 
            variant="outline" 
            className="w-full gap-2" 
            asChild
          >
            <Link href={`/dashboard/stacks/${stack.id}/fork`}>
              <Plus className="h-4 w-4" />
              Start Using This Stack
            </Link>
          </Button>
        )}
      </div>
    </div>
  )
} 