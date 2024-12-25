'use client'

import { Users, Activity as ActivityIcon, CheckCircle2, Sparkles } from 'lucide-react'

interface ActivityItem {
  id: string
  type: 'log' | 'stack'
  title: string
  description?: string
  created_at: string
  user: {
    name: string
    avatar_url: string | null
  }
}

function formatTimeAgo(date: string) {
  const now = new Date()
  const past = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return 'just now'
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours}h ago`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) {
    return `${diffInDays}d ago`
  }

  const diffInWeeks = Math.floor(diffInDays / 7)
  if (diffInWeeks < 4) {
    return `${diffInWeeks}w ago`
  }

  const diffInMonths = Math.floor(diffInDays / 30)
  if (diffInMonths < 12) {
    return `${diffInMonths}mo ago`
  }

  return past.toLocaleDateString()
}

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h3 className="font-semibold">Latest Updates</h3>
        <p className="text-sm text-muted-foreground">
          See what's happening in the community
        </p>
      </div>

      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
        
        <div className="space-y-6">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="relative flex gap-x-4 pl-4 group"
            >
              {/* Timeline dot */}
              <div className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border-2 border-background bg-border group-hover:border-primary group-hover:bg-primary transition-colors" />

              {/* Avatar */}
              <div className="relative mt-1 flex h-8 w-8 flex-none items-center justify-center">
                {item.user.avatar_url ? (
                  <img
                    src={item.user.avatar_url}
                    alt=""
                    className="h-8 w-8 rounded-full bg-gray-50 ring-2 ring-background"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center ring-2 ring-background">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                )}
                <span className="absolute -bottom-0.5 -right-1 rounded-full bg-background p-0.5">
                  {item.type === 'log' ? (
                    <CheckCircle2 className="h-3 w-3 text-green-500" aria-hidden="true" />
                  ) : (
                    <Sparkles className="h-3 w-3 text-amber-500" aria-hidden="true" />
                  )}
                </span>
              </div>

              {/* Content */}
              <div className="flex-auto">
                <div className="text-sm">
                  <span className="font-medium text-foreground">{item.user.name}</span>
                  {' '}
                  <span className="text-muted-foreground">{item.title}</span>
                  {item.description && (
                    <>
                      {': '}
                      <span className="font-medium text-foreground group-hover:text-primary transition-colors">{item.description}</span>
                    </>
                  )}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatTimeAgo(item.created_at)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 