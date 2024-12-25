import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Brain, Battery, Target, Zap } from 'lucide-react'

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

export default async function LogDetailPage({ params }: Props) {
  const supabase = await createClient()
  
  // Get session using cookies
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth/signin')
  }

  // Get existing log for this date
  const { data: log } = await supabase
    .from('daily_logs')
    .select('*')
    .eq('user_id', session.user.id)
    .eq('date', params.date)
    .single()

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
          <CardTitle>How are you feeling today?</CardTitle>
          <CardDescription>
            Rate your mood, energy, focus, and stress levels
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {METRICS.map((metric) => {
            const Icon = metric.icon
            const value = log?.metrics?.[metric.id] || 5

            return (
              <div key={metric.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <Icon className="h-4 w-4" style={{ color: metric.color }} />
                    {metric.label}
                  </label>
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

          <div className="space-y-2">
            <label className="text-sm font-medium">Daily Summary</label>
            <Textarea
              placeholder="How was your day? What worked well? What could be improved?"
              className="min-h-[100px]"
              defaultValue={log?.summary || ''}
              disabled
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button asChild>
          <a href="/dashboard/logs/new">Update Check-in</a>
        </Button>
      </div>
    </div>
  )
} 