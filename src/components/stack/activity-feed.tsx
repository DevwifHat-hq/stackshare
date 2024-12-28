'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Clock, Pill, AlertCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface ActivityFeedProps {
  stackId?: string
  limit?: number
}

interface ActivityLog {
  id: string
  created_at: string
  user_profiles: {
    full_name: string
    avatar_url?: string
  }
  stack_items: {
    name: string
    dosage?: string
    timing?: string
  }
  notes?: string
}

interface DbActivityLog {
  id: string
  created_at: string
  notes: string | null
  stack_id: string
  user_id: string
  user_profiles: {
    id: string
    full_name: string
    avatar_url: string | null
  }
  stack: {
    id: string
    name: string
    description: string | null
  }
}

export function ActivityFeed({ stackId, limit = 10 }: ActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const MAX_RETRIES = 3

  useEffect(() => {
    let mounted = true
    let retryTimeout: NodeJS.Timeout

    const fetchActivities = async () => {
      try {
        const supabase = createClient()
        
        // First, let's get the logs
        const { data: logs, error: logsError } = await supabase
          .from('daily_logs')
          .select('id, created_at, notes, user_id, stack_id')
          .order('created_at', { ascending: false })
          .limit(limit)

        if (logsError) {
          console.error('Error fetching logs:', logsError)
          throw logsError
        }

        if (!logs || logs.length === 0) {
          console.log('No logs found')
          setActivities([])
          setLoading(false)
          return
        }

        // Get user profiles for these logs
        const { data: users, error: usersError } = await supabase
          .from('user_profiles')
          .select('id, full_name, avatar_url')
          .in('id', logs.map(log => log.user_id))

        if (usersError) {
          console.error('Error fetching users:', usersError)
          throw usersError
        }

        // Get stacks for these logs
        const { data: stacks, error: stacksError } = await supabase
          .from('stacks')
          .select('id, name')
          .in('id', logs.map(log => log.stack_id))

        if (stacksError) {
          console.error('Error fetching stacks:', stacksError)
          throw stacksError
        }

        if (mounted) {
          // Combine the data
          const transformedData: ActivityLog[] = logs.map(log => {
            const user = users?.find(u => u.id === log.user_id)
            const stack = stacks?.find(s => s.id === log.stack_id)
            
            return {
              id: log.id,
              created_at: log.created_at,
              notes: log.notes || undefined,
              user_profiles: {
                full_name: user?.full_name || 'Anonymous',
                avatar_url: user?.avatar_url || undefined
              },
              stack_items: {
                name: stack?.name || 'Unknown Stack',
                dosage: undefined,
                timing: undefined
              }
            }
          })

          console.log('Transformed data:', {
            logsCount: logs.length,
            usersCount: users?.length || 0,
            stacksCount: stacks?.length || 0,
            transformedCount: transformedData.length
          })

          setActivities(transformedData)
          setError(null)
          setLoading(false)
        }
      } catch (err) {
        console.error('Activity feed error:', {
          error: err,
          message: err instanceof Error ? err.message : 'Unknown error',
          stackId,
          retryCount
        })
        
        if (mounted) {
          setError('Failed to load activity feed')
          setLoading(false)

          if (retryCount < MAX_RETRIES) {
            const delay = Math.min(1000 * Math.pow(2, retryCount), 8000)
            console.log(`Retrying in ${delay}ms (attempt ${retryCount + 1}/${MAX_RETRIES})`)
            retryTimeout = setTimeout(() => {
              setRetryCount(prev => prev + 1)
              fetchActivities()
            }, delay)
          }
        }
      }
    }

    setLoading(true)
    setError(null)
    setRetryCount(0)
    fetchActivities()

    return () => {
      mounted = false
      if (retryTimeout) clearTimeout(retryTimeout)
    }
  }, [stackId, limit])

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-4">
            <div className="flex items-start gap-4">
              <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/4 bg-muted animate-pulse rounded" />
                <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <AlertCircle className="h-8 w-8 text-destructive" />
          <div>
            <p className="font-medium">Failed to load activity feed</p>
            <p className="text-sm text-muted-foreground">
              {retryCount < MAX_RETRIES 
                ? `Retrying... (${retryCount + 1}/${MAX_RETRIES})`
                : 'Please try again later'}
            </p>
          </div>
        </div>
      </Card>
    )
  }

  if (activities.length === 0) {
    return (
      <Card className="p-6 text-center text-muted-foreground">
        <p className="mb-2">No activity logs found</p>
        <p className="text-sm">Be the first to try this stack and log your experience!</p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <Card key={activity.id} className="p-4 hover:bg-muted/50 transition-colors">
          <div className="flex items-start gap-4">
            <Avatar className="h-9 w-9 border">
              <AvatarImage src={activity.user_profiles.avatar_url} />
              <AvatarFallback>
                {activity.user_profiles.full_name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-medium truncate">
                  {activity.user_profiles.full_name}
                </p>
                <span className="text-sm text-muted-foreground">·</span>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="mr-1 h-3 w-3" />
                  {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Pill className="h-3 w-3 text-primary" />
                <span className="font-medium">{activity.stack_items.name}</span>
                {activity.stack_items.dosage && (
                  <span className="text-muted-foreground">
                    ({activity.stack_items.dosage})
                  </span>
                )}
              </div>
              {activity.notes && (
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                  {activity.notes}
                </p>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
} 