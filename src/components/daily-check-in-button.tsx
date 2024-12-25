'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { PenLine, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export function DailyCheckInButton() {
  const router = useRouter()
  const pathname = usePathname()
  const [hasLoggedToday, setHasLoggedToday] = useState<boolean | null>(null)

  useEffect(() => {
    async function checkTodaysLog() {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) return

      const today = new Date().toISOString().split('T')[0]
      const { data } = await supabase
        .from('daily_logs')
        .select('id')
        .eq('user_id', session.user.id)
        .eq('date', today)
        .single()

      setHasLoggedToday(!!data)
    }

    checkTodaysLog()
  }, [pathname])

  // Don't show anything while loading
  if (hasLoggedToday === null) return null

  return (
    <button
      onClick={() => router.push('/dashboard/journal')}
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
        hasLoggedToday
          ? "bg-secondary text-secondary-foreground hover:bg-secondary/90"
          : "bg-primary text-primary-foreground hover:bg-primary/90"
      )}
    >
      {hasLoggedToday ? (
        <>
          <Check className="h-4 w-4" />
          Logged Today
        </>
      ) : (
        <>
          <PenLine className="h-4 w-4" />
          Daily Check-in
        </>
      )}
    </button>
  )
} 