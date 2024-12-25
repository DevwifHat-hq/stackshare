'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Target, Trophy, Calendar, ArrowRight, Flame, Plus } from 'lucide-react'
import Link from 'next/link'

interface Log {
  date: string
  metrics: Record<string, number>
}

interface Stack {
  id: string
  name: string
  description: string
  created_at: string
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function DashboardPage() {
  const [logs, setLogs] = useState<Log[]>([])
  const [stacks, setStacks] = useState<Stack[]>([])
  const [loading, setLoading] = useState(true)
  const [currentStreak, setCurrentStreak] = useState(0)
  const [longestStreak, setLongestStreak] = useState(0)

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()
      console.log('Fetching data...')
      
      // Fetch logs
      const { data: logsData, error: logsError } = await supabase
        .from('daily_logs')
        .select('date, metrics')
        .order('date', { ascending: true })

      if (logsError) {
        console.error('Error fetching logs:', logsError)
      } else if (logsData) {
        setLogs(logsData)
        calculateStreaks(logsData)
      }

      // Fetch stacks
      const { data: stacksData, error: stacksError } = await supabase
        .from('stacks')
        .select('id, name, description, created_at')
        .order('created_at', { ascending: false })

      if (stacksError) {
        console.error('Error fetching stacks:', stacksError)
      } else if (stacksData) {
        setStacks(stacksData)
      }

      setLoading(false)
    }

    fetchData()
  }, [])

  function calculateStreaks(logs: Log[]) {
    const today = new Date()
    const activityMap = new Map(logs.map(log => [log.date, log]))
    
    let current = 0
    let longest = 0
    let tempStreak = 0
    
    // Calculate streaks
    const dates = Array.from({ length: 365 }, (_, i) => {
      const date = new Date()
      date.setDate(today.getDate() - i)
      return date.toISOString().split('T')[0]
    })

    for (const date of dates) {
      if (activityMap.has(date)) {
        tempStreak++
        longest = Math.max(longest, tempStreak)
        if (date === today.toISOString().split('T')[0]) {
          current = tempStreak
        }
      } else {
        tempStreak = 0
      }
    }

    setCurrentStreak(current)
    setLongestStreak(longest)
  }

  function getActivityLevel(metrics?: Record<string, number>): number {
    return metrics ? 1 : 0 // Simplify to binary: checked in (1) or not (0)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Generate calendar data for full year
  const today = new Date()
  const yearAgo = new Date(today)
  yearAgo.setFullYear(yearAgo.getFullYear() - 1)
  
  const weeks: string[][] = []
  let currentWeek: string[] = []
  let currentMonth = ''
  const monthLabels: { label: string, week: number }[] = []
  
  for (let d = new Date(yearAgo); d <= today; d.setDate(d.getDate() + 1)) {
    const monthName = d.toLocaleDateString('en-US', { month: 'short' })
    if (monthName !== currentMonth) {
      currentMonth = monthName
      monthLabels.push({ label: monthName, week: weeks.length })
    }

    if (d.getDay() === 0 && currentWeek.length > 0) {
      weeks.push(currentWeek)
      currentWeek = []
    }
    currentWeek.push(d.toISOString().split('T')[0])
    if (d.getTime() === today.getTime()) {
      weeks.push(currentWeek)
    }
  }

  const activityMap = new Map(logs.map(log => [log.date, log]))

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
        <p className="text-muted-foreground">
          Track your progress and maintain your daily routines
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-orange-100 p-2">
                <Flame className="h-4 w-4 text-orange-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{currentStreak}</div>
                <div className="text-xs text-muted-foreground">Day streak</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-blue-100 p-2">
                <Trophy className="h-4 w-4 text-blue-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{longestStreak}</div>
                <div className="text-xs text-muted-foreground">Best streak</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-green-100 p-2">
                <Calendar className="h-4 w-4 text-green-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{logs.length}</div>
                <div className="text-xs text-muted-foreground">Total logs</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User's Stacks */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Your Stacks</h2>
          <Link 
            href="/dashboard/stacks/new" 
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/90"
          >
            <Plus className="h-4 w-4" />
            Create Stack
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {stacks.slice(0, 3).map((stack) => (
            <Card key={stack.id}>
              <CardContent className="pt-4">
                <Link href={`/dashboard/stacks/${stack.id}`} className="block group">
                  <h3 className="font-medium group-hover:text-primary transition-colors">
                    {stack.name}
                  </h3>
                  {stack.description && (
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {stack.description}
                    </p>
                  )}
                </Link>
              </CardContent>
            </Card>
          ))}
          {stacks.length === 0 && (
            <Card className="md:col-span-3">
              <CardContent className="py-6">
                <div className="text-center text-muted-foreground">
                  <p>You haven't created any stacks yet.</p>
                  <Link 
                    href="/dashboard/stacks/new"
                    className="inline-flex items-center gap-1 mt-2 text-sm font-medium text-primary hover:text-primary/90"
                  >
                    <Plus className="h-4 w-4" />
                    Create your first stack
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
          {stacks.length > 3 && (
            <Card className="relative group overflow-hidden">
              <CardContent className="pt-4">
                <Link 
                  href="/dashboard/stacks" 
                  className="block text-center group-hover:text-primary transition-colors"
                >
                  <p className="font-medium">View All Stacks</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    +{stacks.length - 3} more
                  </p>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Activity Calendar */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Activity (Past Year)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            {/* Days of week */}
            <div className="grid grid-rows-7 gap-[3px] text-sm text-muted-foreground">
              {DAYS.map((day, i) => (
                <div key={i} className="h-[16px] leading-[16px] pr-3">{day}</div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="relative flex-1 overflow-x-auto">
              {/* Month labels */}
              <div className="absolute -top-6 left-0 right-0">
                <div className="flex text-sm text-muted-foreground">
                  {monthLabels.map(({ label, week }, i) => (
                    <div
                      key={i}
                      className="absolute whitespace-nowrap"
                      style={{ left: `${week * 19}px` }}
                    >
                      {label}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-[3px] min-w-fit pt-1">
                {weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="grid grid-rows-7 gap-[3px]">
                    {Array.from({ length: 7 }).map((_, dayIndex) => {
                      const date = week[dayIndex]
                      if (!date) return <div key={`empty-${dayIndex}`} className="w-[16px] h-[16px]" />

                      const activity = activityMap.get(date)
                      const isCheckedIn = Boolean(activity)
                      const isToday = date === today.toISOString().split('T')[0]
                      
                      return (
                        <Link
                          key={date}
                          href={`/dashboard/logs/${date}`}
                          className={`
                            w-[16px] h-[16px] rounded-sm transition-all
                            ${!isCheckedIn ? 'bg-[#ebedf0] hover:bg-[#ebedf0]/80' : ''}
                            ${isCheckedIn ? 'bg-[#40c463] hover:bg-[#40c463]/90' : ''}
                            ${isToday ? 'ring-1 ring-primary ring-offset-1' : ''}
                          `}
                          title={`${new Date(date).toLocaleDateString('en-US', { 
                            weekday: 'long',
                            month: 'long', 
                            day: 'numeric',
                            year: 'numeric'
                          })}${isCheckedIn ? ' - Checked in' : ' - Not checked in'}`}
                        />
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-end gap-3 mt-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-[16px] h-[16px] rounded-sm bg-[#ebedf0]" />
                <span>Not checked in</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-[16px] h-[16px] rounded-sm bg-[#40c463]" />
                <span>Checked in</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recent Activity</h2>
          <Link 
            href="/dashboard/logs" 
            className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
          >
            View all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="space-y-4">
          {logs.slice(-5).reverse().map((log) => (
            <Card key={log.date}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      {new Date(log.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    <div className="flex gap-4 mt-1">
                      {Object.entries(log.metrics || {}).map(([key, value]) => (
                        <span key={key} className="text-sm text-muted-foreground">
                          {key.charAt(0).toUpperCase() + key.slice(1)}: {value}/10
                        </span>
                      ))}
                    </div>
                  </div>
                  <Link
                    href={`/dashboard/logs/${log.date}`}
                    className="text-sm text-primary hover:underline"
                  >
                    View Details
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
} 