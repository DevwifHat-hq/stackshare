'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { PenLine, Check, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  stackId?: string
}

export function DailyCheckInButton({ stackId }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [hasLoggedToday, setHasLoggedToday] = useState<boolean | null>(null)
  const [timeRemaining, setTimeRemaining] = useState<string>('')

  useEffect(() => {
    async function checkTodaysLog() {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) return

      const today = new Date().toISOString().split('T')[0]
      const query = supabase
        .from('daily_logs')
        .select('id, created_at')
        .eq('user_id', session.user.id)
        .eq('date', today)

      // If stackId is provided, check for that specific stack
      if (stackId) {
        query.eq('stack_id', stackId)
      }

      const { data } = await query.single()
      setHasLoggedToday(!!data)
    }

    checkTodaysLog()
  }, [pathname, stackId])

  // Update time remaining every minute
  useEffect(() => {
    function updateTimeRemaining() {
      const now = new Date()
      const endOfDay = new Date(now)
      endOfDay.setHours(23, 59, 59, 999)
      
      const diff = endOfDay.getTime() - now.getTime()
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      
      setTimeRemaining(`${hours}h ${minutes}m`)
    }

    updateTimeRemaining()
    const interval = setInterval(updateTimeRemaining, 60000)
    return () => clearInterval(interval)
  }, [])

  // Don't show anything while loading
  if (hasLoggedToday === null) return null

  const handleClick = () => {
    if (hasLoggedToday) {
      // If already logged, show today's log
      const today = new Date().toISOString().split('T')[0]
      if (stackId) {
        router.push(`/dashboard/stacks/${stackId}/logs/${today}`)
      } else {
        router.push(`/dashboard/logs/${today}`)
      }
    } else {
      // If not logged, go to the check-in form
      if (stackId) {
        router.push(`/dashboard/stacks/${stackId}/check-in`)
      } else {
        router.push('/dashboard/logs/new')
      }
    }
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors shadow-sm hover:shadow-md",
        hasLoggedToday
          ? "bg-green-500/10 text-green-600 hover:bg-green-500/20"
          : "bg-primary text-primary-foreground hover:bg-primary/90 animate-pulse"
      )}
    >
      {hasLoggedToday ? (
        <>
          <Check className="h-4 w-4" />
          <span>View Today's Log</span>
        </>
      ) : (
        <>
          <div className="flex items-center gap-2">
            <PenLine className="h-4 w-4" />
            <span>Daily Check-in</span>
            <div className="flex items-center gap-1 text-xs opacity-80 border-l border-primary-foreground/20 pl-2 ml-1">
              <Clock className="h-3 w-3" />
              <span>{timeRemaining} left</span>
            </div>
          </div>
        </>
      )}
    </button>
  )
} 