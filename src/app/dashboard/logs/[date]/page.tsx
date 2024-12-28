import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Brain, Battery, Target, Zap } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

const METRICS = [
  { id: 'mood', label: 'Mood', color: '#2563eb', icon: Brain },
  { id: 'energy', label: 'Energy', color: '#16a34a', icon: Battery },
  { id: 'focus', label: 'Focus', color: '#9333ea', icon: Target },
  { id: 'stress', label: 'Stress', color: '#dc2626', icon: Zap },
]

interface Props {
  params: {
    date: string
  }
}

interface StackItem {
  id: string
  name: string
  type: string
  dosage?: string
}

interface Stack {
  id: string
  name: string
  stack_items: StackItem[]
}

interface Log {
  id: string
  date: string
  mood: number
  energy: number
  focus: number
  stress: number
  notes?: string
  items_taken: string[]
  stacks: Stack
  [key: string]: any // Allow string indexing for metrics
}

export default async function LogDetailPage({ params }: Props) {
  const supabase = await createClient()
  
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth/signin')
  }

  const date = new Date(params.date).toISOString().split('T')[0]

  const { data: log } = await supabase
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
        )
      )
    `)
    .eq('user_id', session.user.id)
    .eq('date', date)
    .single() as { data: Log | null }

  if (!log) {
    redirect('/dashboard/logs')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Daily Check-in</h1>
        <p className="mt-2 text-muted-foreground">
          Track your daily metrics and reflect on your progress
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>How are you feeling today?</CardTitle>
              <CardDescription>
                Rate your mood, energy, focus, and stress levels
              </CardDescription>
            </div>
            {log.stacks && (
              <Badge variant="secondary">
                {log.stacks.name}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6">
            {METRICS.map((metric) => {
              const Icon = metric.icon
              const value = log[metric.id] as number || 5

              return (
                <div key={metric.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Icon className="h-4 w-4" style={{ color: metric.color }} />
                      {metric.label}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {value}/10
                    </span>
                  </div>
                  <Slider
                    defaultValue={[value]}
                    max={10}
                    step={1}
                    className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
                    style={{
                      '--slider-color': metric.color,
                    } as any}
                    disabled
                  />
                </div>
              )
            })}
          </div>

          {log.notes && (
            <div className="space-y-2">
              <div className="text-sm font-medium">Daily Summary</div>
              <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                {log.notes}
              </div>
            </div>
          )}

          {log.items_taken?.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium">Items Taken</div>
              <div className="flex flex-wrap gap-2">
                {log.items_taken.map((itemId: string) => {
                  const item = log.stacks?.stack_items?.find(i => i.id === itemId)
                  if (!item) return null
                  return (
                    <Badge key={itemId} variant="outline">
                      {item.name} {item.dosage && `(${item.dosage})`}
                    </Badge>
                  )
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button asChild>
          <Link href="/dashboard/logs/new">Update Check-in</Link>
        </Button>
      </div>
    </div>
  )
} 