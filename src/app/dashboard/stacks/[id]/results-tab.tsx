'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Brain, Battery, Focus, Target } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface DailyLog {
  id: string
  date: string
  mood: number
  energy: number
  focus: number
  notes?: string
  side_effects?: string
  items_taken: string[]
}

interface Props {
  stack: {
    id: string
    name: string
    daily_logs: DailyLog[]
  }
}

const METRICS = [
  { id: 'mood', label: 'Mood', color: '#2563eb', icon: Brain },
  { id: 'energy', label: 'Energy', color: '#16a34a', icon: Battery },
  { id: 'focus', label: 'Focus', color: '#9333ea', icon: Focus },
]

export function ResultsTab({ stack }: Props) {
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

  // Filter and prepare data for charts
  const { start, end } = getDateRange()
  const filteredLogs = stack.daily_logs
    ?.filter(log => {
      const logDate = new Date(log.date)
      return logDate >= start && logDate <= end
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  // Calculate averages
  const averages = METRICS.reduce((acc, metric) => {
    const values = filteredLogs?.map(log => log[metric.id as keyof DailyLog] as number) || []
    acc[metric.id] = values.length 
      ? Math.round((values.reduce((sum, val) => sum + val, 0) / values.length) * 10) / 10
      : 0
    return acc
  }, {} as Record<string, number>)

  // Format data for charts
  const chartData = filteredLogs?.map(log => ({
    date: new Date(log.date).toLocaleDateString(),
    mood: log.mood,
    energy: log.energy,
    focus: log.focus,
  }))

  if (!stack.daily_logs?.length) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <Target className="h-12 w-12 mx-auto text-muted-foreground" />
            <h3 className="font-semibold text-lg">No Results Yet</h3>
            <p className="text-muted-foreground">
              Start tracking your daily progress to see results here.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Timeframe Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Stack Results</h2>
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
      </div>

      {/* Averages Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {METRICS.map(metric => {
          const Icon = metric.icon
          return (
            <Card key={metric.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Icon className="h-4 w-4" style={{ color: metric.color }} />
                  Average {metric.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{averages[metric.id]}/10</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Based on {filteredLogs?.length || 0} logs
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Metrics Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Progress Over Time</CardTitle>
          <CardDescription>
            Track how your metrics change over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  domain={[0, 10]}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip />
                {METRICS.map(metric => (
                  <Line
                    key={metric.id}
                    type="monotone"
                    dataKey={metric.id}
                    stroke={metric.color}
                    strokeWidth={2}
                    dot={false}
                    name={metric.label}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 