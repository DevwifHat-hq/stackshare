'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TrendingUp, Users, Calendar, ArrowUp, ArrowDown, AlertCircle, LineChart as ChartIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

interface AnalyticsPanelProps {
  stackId: string
  timeRange?: '7d' | '30d' | '90d'
}

interface DailyData {
  users: Set<string>
  logs: number
  items_logged: Set<string>
}

interface DailyStats {
  date: string
  users: number
  logs: number
  completion_rate: number
}

const DEFAULT_DATA = Array.from({ length: 7 }).map((_, i) => {
  const date = new Date()
  date.setDate(date.getDate() - (6 - i))
  return {
    date: date.toISOString().split('T')[0],
    users: 0,
    logs: 0,
    completion_rate: 0
  }
})

export function AnalyticsPanel({ stackId, timeRange = '30d' }: AnalyticsPanelProps) {
  const [stats, setStats] = useState<DailyStats[]>(DEFAULT_DATA)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [activeTab, setActiveTab] = useState('users')
  const MAX_RETRIES = 3

  useEffect(() => {
    let mounted = true
    let retryTimeout: NodeJS.Timeout

    const fetchAnalytics = async () => {
      if (!stackId) {
        setError('No stack ID provided')
        setLoading(false)
        return
      }

      try {
        const supabase = createClient()
        
        // Calculate date range
        const endDate = new Date()
        const startDate = new Date()
        startDate.setDate(endDate.getDate() - (timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90))

        type DbResult = {
          created_at: string
          user_id: string
          stack_items: {
            id: string
          }
        }

        const { data, error } = await supabase
          .from('daily_logs')
          .select(`
            created_at,
            user_id,
            stack_items!inner (
              id
            )
          `)
          .eq('stack_id', stackId)
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString())
          .returns<DbResult[]>()

        if (error) throw error

        if (mounted) {
          if (!data || data.length === 0) {
            // Use default data if no logs exist
            setStats(DEFAULT_DATA)
          } else {
            // Process data into daily stats
            const dailyData = data.reduce((acc: Record<string, DailyData>, log) => {
              const date = new Date(log.created_at).toISOString().split('T')[0]
              if (!acc[date]) {
                acc[date] = {
                  users: new Set<string>(),
                  logs: 0,
                  items_logged: new Set<string>()
                }
              }
              acc[date].users.add(log.user_id)
              acc[date].logs += 1
              acc[date].items_logged.add(log.stack_items.id)
              return acc
            }, {})

            // Fill in missing dates with zeros
            const allDates = new Set<string>()
            let currentDate = new Date(startDate)
            while (currentDate <= endDate) {
              allDates.add(currentDate.toISOString().split('T')[0])
              currentDate.setDate(currentDate.getDate() + 1)
            }

            // Convert to array format for chart
            const chartData = Array.from(allDates).map(date => ({
              date,
              users: dailyData[date]?.users.size || 0,
              logs: dailyData[date]?.logs || 0,
              completion_rate: dailyData[date] 
                ? (dailyData[date].items_logged.size / dailyData[date].logs) * 100 
                : 0
            }))

            setStats(chartData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()))
          }
          setError(null)
          setLoading(false)
        }
      } catch (err) {
        console.error('Error fetching analytics:', err)
        if (mounted) {
          setError('Failed to load analytics')
          setLoading(false)

          // Retry logic
          if (retryCount < MAX_RETRIES) {
            retryTimeout = setTimeout(() => {
              setRetryCount(prev => prev + 1)
              fetchAnalytics()
            }, Math.min(1000 * Math.pow(2, retryCount), 8000)) // Exponential backoff
          }
        }
      }
    }

    fetchAnalytics()

    return () => {
      mounted = false
      if (retryTimeout) clearTimeout(retryTimeout)
    }
  }, [stackId, timeRange, retryCount])

  if (loading) {
    return (
      <Card className="p-6">
        <div className="h-[300px] bg-muted animate-pulse rounded-lg" />
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="flex flex-col items-center justify-center text-center space-y-4 h-[300px]">
          <AlertCircle className="h-8 w-8 text-destructive" />
          <div>
            <p className="font-medium">Failed to load analytics</p>
            <p className="text-sm text-muted-foreground">
              {retryCount < MAX_RETRIES 
                ? 'Retrying...' 
                : 'Please try again later'}
            </p>
          </div>
        </div>
      </Card>
    )
  }

  const hasData = stats.some(stat => stat.users > 0 || stat.logs > 0)

  if (!hasData) {
    return (
      <Card className="p-6">
        <div className="flex flex-col items-center justify-center text-center space-y-4 h-[300px]">
          <ChartIcon className="h-12 w-12 text-muted-foreground/50" />
          <div>
            <p className="font-medium">No analytics data available yet</p>
            <p className="text-sm text-muted-foreground mb-4">
              Start logging your stack items to see analytics here
            </p>
            <Button variant="outline" size="sm">
              Log Your First Item
            </Button>
          </div>
        </div>
      </Card>
    )
  }

  const getMetricChange = (metric: 'users' | 'logs' | 'completion_rate') => {
    if (stats.length < 2) return 0
    const latest = stats[stats.length - 1][metric]
    const previous = stats[stats.length - 2][metric]
    return previous === 0 ? 0 : ((latest - previous) / previous) * 100
  }

  return (
    <Card className="p-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="users">Active Users</TabsTrigger>
            <TabsTrigger value="logs">Daily Logs</TabsTrigger>
            <TabsTrigger value="completion">Completion Rate</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2">
            {activeTab === 'users' && (
              <Badge variant={getMetricChange('users') >= 0 ? 'default' : 'destructive'}>
                {getMetricChange('users') >= 0 ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
                {Math.abs(getMetricChange('users')).toFixed(1)}% vs previous day
              </Badge>
            )}
            {activeTab === 'logs' && (
              <Badge variant={getMetricChange('logs') >= 0 ? 'default' : 'destructive'}>
                {getMetricChange('logs') >= 0 ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
                {Math.abs(getMetricChange('logs')).toFixed(1)}% vs previous day
              </Badge>
            )}
            {activeTab === 'completion' && (
              <Badge variant={getMetricChange('completion_rate') >= 0 ? 'default' : 'destructive'}>
                {getMetricChange('completion_rate') >= 0 ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
                {Math.abs(getMetricChange('completion_rate')).toFixed(1)}% vs previous day
              </Badge>
            )}
          </div>
        </div>

        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => new Date(date).toLocaleDateString()}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(date) => new Date(date).toLocaleDateString()}
                formatter={(value: number) => [
                  activeTab === 'completion' ? `${value.toFixed(1)}%` : value,
                  activeTab === 'users' ? 'Active Users' : 
                  activeTab === 'logs' ? 'Daily Logs' : 
                  'Completion Rate'
                ]}
              />
              <Line 
                type="monotone" 
                dataKey={
                  activeTab === 'users' ? 'users' : 
                  activeTab === 'logs' ? 'logs' : 
                  'completion_rate'
                }
                stroke="#2563eb"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Tabs>
    </Card>
  )
} 