import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Brain, Battery, Focus, Gauge, Moon } from 'lucide-react'
import { StackLinkBadge } from '@/components/stack-link-badge'
import { DeleteLogButton } from '@/components/delete-log-button'

interface StackItem {
  id: string
  name: string
  type: string
  dosage?: string
  timing?: string
  frequency?: string
}

interface Stack {
  id: string
  name: string
  stack_items: StackItem[]
  stack_categories: {
    categories: {
      name: string
      slug: string
    }[]
  }[]
}

interface DailyLog {
  id: string
  date: string
  mood: number
  energy: number
  focus: number
  stress: number
  sleep_quality: number
  notes?: string
  side_effects?: string
  items_taken: string[]
  stacks: Stack
}

function getDateRange(days: number) {
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - days)
  return { start, end }
}

export default async function LogsPage() {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      redirect('/')
    }

    // Get last 30 days of logs with stack info
    const { start, end } = getDateRange(30)
    const { data: logs } = await supabase
      .from('daily_logs')
      .select(`
        *,
        stacks (
          id,
          name,
          stack_items (
            id,
            name,
            type,
            dosage
          ),
          stack_categories (
            categories (
              name,
              slug
            )
          )
        )
      `)
      .eq('user_id', session.user.id)
      .gte('date', start.toISOString().split('T')[0])
      .lte('date', end.toISOString().split('T')[0])
      .order('date', { ascending: false })

    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Daily Logs</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Track your daily metrics and progress across all stacks
          </p>
        </div>

        <div className="grid gap-6">
          {logs?.length ? (
            logs.map((log) => (
              <Card key={`${log.id}-${log.date}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(log.date).toLocaleDateString()}
                      </Badge>
                      {log.stacks && (
                        <StackLinkBadge 
                          stackId={log.stacks.id}
                          stackName={log.stacks.name}
                        />
                      )}
                    </div>
                    <DeleteLogButton logId={log.id} date={log.date} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    <div className="flex items-center gap-2">
                      <Brain className="h-4 w-4 text-muted-foreground" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">Mood</p>
                        <p className="text-sm text-muted-foreground">{log.mood}/10</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Battery className="h-4 w-4 text-muted-foreground" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">Energy</p>
                        <p className="text-sm text-muted-foreground">{log.energy}/10</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Focus className="h-4 w-4 text-muted-foreground" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">Focus</p>
                        <p className="text-sm text-muted-foreground">{log.focus}/10</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Gauge className="h-4 w-4 text-muted-foreground" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">Stress</p>
                        <p className="text-sm text-muted-foreground">{log.stress}/10</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Moon className="h-4 w-4 text-muted-foreground" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">Sleep</p>
                        <p className="text-sm text-muted-foreground">{log.sleep_quality}/10</p>
                      </div>
                    </div>
                  </div>
                  {(log.notes || log.side_effects) && (
                    <div className="mt-4 space-y-2">
                      {log.notes && (
                        <div className="text-sm">
                          <span className="font-medium">Notes:</span> {log.notes}
                        </div>
                      )}
                      {log.side_effects && (
                        <div className="text-sm">
                          <span className="font-medium">Side Effects:</span> {log.side_effects}
                        </div>
                      )}
                    </div>
                  )}
                  {log.items_taken?.length > 0 && (
                    <div className="mt-4">
                      <span className="text-sm font-medium">Items Taken:</span>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {log.items_taken.map((itemId: string) => {
                          const item = log.stacks?.stack_items?.find((i: StackItem) => i.id === itemId)
                          return (
                            <Badge key={itemId} variant="secondary">
                              {item?.name || 'Unknown Item'}
                              {item?.dosage && ` (${item.dosage})`}
                            </Badge>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">No logs recorded yet</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    )
  } catch (error) {
    console.error('Logs page error:', error)
    redirect('/')
  }
} 