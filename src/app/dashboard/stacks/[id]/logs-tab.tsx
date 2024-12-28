'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Brain, Battery, Focus, Calendar, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { CheckInDialog } from './check-in-dialog'

interface StackItem {
  id: string
  name: string
  type: string
  dosage?: string
  timing?: string
  frequency?: string
}

interface DailyLog {
  id: string
  date: string
  mood: number
  energy: number
  focus: number
  notes?: string
  side_effects?: string
  items_taken: string[]
  created_at: string
}

interface Props {
  stack: {
    id: string
    name: string
    stack_items: StackItem[]
    daily_logs: DailyLog[]
  }
}

export function StackLogs({ stack }: Props) {
  const [timeframe, setTimeframe] = useState('month')

  // Get date range based on timeframe
  const getDateRange = () => {
    const end = new Date()
    const start = new Date()
    switch (timeframe) {
      case 'week':
        start.setDate(start.getDate() - 7)
        break
      case 'month':
        start.setDate(start.getDate() - 30)
        break
      case '3months':
        start.setDate(start.getDate() - 90)
        break
      case 'year':
        start.setDate(start.getDate() - 365)
        break
      default:
        start.setDate(start.getDate() - 30) // Default to month
    }
    return { start, end }
  }

  // Filter logs by timeframe
  const { start, end } = getDateRange()
  const filteredLogs = stack.daily_logs
    ?.filter(log => {
      const logDate = new Date(log.date)
      return logDate >= start && logDate <= end
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  // Create a map of item IDs to names for easy lookup
  const itemsMap = stack.stack_items.reduce((acc, item) => {
    acc[item.id] = item.name
    return acc
  }, {} as Record<string, string>)

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold">Daily Logs</h2>
          <p className="text-muted-foreground">
            Track your daily usage and notes
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Past Week</SelectItem>
              <SelectItem value="month">Past Month</SelectItem>
              <SelectItem value="3months">Past 3 Months</SelectItem>
              <SelectItem value="year">Past Year</SelectItem>
            </SelectContent>
          </Select>
          <CheckInDialog stack={stack} />
        </div>
      </div>

      {/* Logs List */}
      <div className="space-y-4">
        {filteredLogs?.map(log => (
          <Card key={log.id}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <CardTitle className="text-base font-medium">
                  {new Date(log.date).toLocaleDateString(undefined, {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </CardTitle>
                <div className="flex gap-2">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Brain className="h-3 w-3" /> {log.mood}/10
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Battery className="h-3 w-3" /> {log.energy}/10
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Focus className="h-3 w-3" /> {log.focus}/10
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Items Taken */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Items Taken</h4>
                <div className="flex flex-wrap gap-2">
                  {log.items_taken.map(itemId => (
                    <Badge key={itemId} variant="secondary">
                      {itemsMap[itemId] || 'Unknown Item'}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Notes */}
              {log.notes && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Notes</h4>
                  <p className="text-sm text-muted-foreground">{log.notes}</p>
                </div>
              )}

              {/* Side Effects */}
              {log.side_effects && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium flex items-center gap-1">
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                    Side Effects
                  </h4>
                  <p className="text-sm text-muted-foreground">{log.side_effects}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {!filteredLogs?.length && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="font-semibold text-lg">No Logs Found</h3>
                <p className="text-muted-foreground">
                  No daily logs found for this timeframe.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 