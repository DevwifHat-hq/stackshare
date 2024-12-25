'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface Log {
  date: string
  completed: boolean
}

interface StreakCalendarProps {
  logs: Log[]
  currentStreak: number
  longestStreak: number
}

export function StreakCalendar({ logs, currentStreak, longestStreak }: StreakCalendarProps) {
  // Get the last 30 days
  const getLast30Days = () => {
    const days = []
    const today = new Date()
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)
      days.push(date)
    }
    return days
  }

  const days = getLast30Days()

  // Function to check if a day has a log
  const hasLog = (date: Date) => {
    return logs.some(log => {
      const logDate = new Date(log.date)
      return logDate.toISOString().split('T')[0] === date.toISOString().split('T')[0]
    })
  }

  // Function to get the day's intensity class based on surrounding days
  const getDayClass = (date: Date) => {
    if (!hasLog(date)) return 'bg-muted'
    
    const intensity = logs.filter(log => {
      const logDate = new Date(log.date)
      const diffTime = Math.abs(logDate.getTime() - date.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays <= 2 // Within 2 days
    }).length

    return cn(
      'transition-all',
      intensity >= 3 ? 'bg-primary' : 
      intensity === 2 ? 'bg-primary/80' : 
      'bg-primary/60'
    )
  }

  // Function to format date for tooltip
  const formatDate = (date: Date) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Calendar</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <div className="grid grid-cols-15 gap-1">
            {days.map((day: Date) => (
              <div
                key={day.toISOString()}
                className={cn(
                  'h-4 w-4 rounded-sm',
                  getDayClass(day)
                )}
                title={`${formatDate(day)}${hasLog(day) ? ' - Completed' : ''}`}
              />
            ))}
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <div>30 days ago</div>
            <div>Today</div>
          </div>
          <div className="flex items-center justify-between border-t pt-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{currentStreak}</div>
              <div className="text-xs text-muted-foreground">Current Streak</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{longestStreak}</div>
              <div className="text-xs text-muted-foreground">Longest Streak</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 