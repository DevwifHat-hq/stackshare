'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import { Brain, Battery, Focus, Gauge, Moon } from 'lucide-react'
import { toast } from 'sonner'

interface DailyLog {
  mood: number
  energy: number
  focus: number
  stress: number
  sleep_quality: number
  notes: string
}

export default function JournalPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [log, setLog] = useState<DailyLog>({
    mood: 5,
    energy: 5,
    focus: 5,
    stress: 5,
    sleep_quality: 5,
    notes: ''
  })

  useEffect(() => {
    async function fetchTodaysLog() {
      try {
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()

        if (!session) {
          router.push('/auth/signin')
          return
        }

        const today = new Date().toISOString().split('T')[0]
        const { data: todaysLog, error } = await supabase
          .from('daily_logs')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('date', today)
          .single()

        if (error) {
          console.error('Error fetching log:', error)
          return
        }

        if (todaysLog) {
          setLog({
            mood: todaysLog.mood,
            energy: todaysLog.energy,
            focus: todaysLog.focus,
            stress: todaysLog.stress,
            sleep_quality: todaysLog.sleep_quality,
            notes: todaysLog.notes || ''
          })
        }
      } catch (error) {
        console.error('Error in fetchTodaysLog:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTodaysLog()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        router.push('/auth/signin')
        return
      }

      const today = new Date().toISOString().split('T')[0]
      const timestamp = new Date().toISOString()

      // First, check if a log exists for today
      const { data: existingLog } = await supabase
        .from('daily_logs')
        .select('id')
        .eq('user_id', session.user.id)
        .eq('date', today)
        .single()

      const logData = {
        user_id: session.user.id,
        date: today,
        mood: log.mood,
        energy: log.energy,
        focus: log.focus,
        stress: log.stress,
        sleep_quality: log.sleep_quality,
        notes: log.notes || '',
        action: 'log_metrics',
        metadata: {
          mood_score: log.mood,
          energy_score: log.energy,
          focus_score: log.focus,
          stress_score: log.stress,
          sleep_score: log.sleep_quality,
          summary: log.notes
        },
        created_at: timestamp,
        updated_at: timestamp
      }

      let error
      if (existingLog) {
        // Update existing log
        const result = await supabase
          .from('daily_logs')
          .update(logData)
          .eq('id', existingLog.id)
        error = result.error
      } else {
        // Insert new log
        const result = await supabase
          .from('daily_logs')
          .insert([logData])
        error = result.error
      }

      if (error) {
        console.error('Database error:', error)
        throw error
      }

      toast.success('Daily log saved successfully!')
      router.refresh()
      router.push('/dashboard')
    } catch (error: any) {
      console.error('Error saving log:', {
        message: error?.message,
        details: error?.details,
        hint: error?.hint,
        code: error?.code
      })
      toast.error('Failed to save log. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Daily Check-in</CardTitle>
          <CardDescription>
            Track your daily metrics to monitor your progress and identify patterns.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Mood */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">Mood</label>
                  <div className="text-xs text-muted-foreground">How are you feeling today?</div>
                </div>
                <div className="flex items-center">
                  <Brain className="w-4 h-4 mr-2 text-muted-foreground" />
                  <span className="font-bold">{log.mood}/10</span>
                </div>
              </div>
              <Slider
                value={[log.mood]}
                min={1}
                max={10}
                step={1}
                onValueChange={([value]) => setLog(prev => ({ ...prev, mood: value }))}
              />
            </div>

            {/* Energy */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">Energy</label>
                  <div className="text-xs text-muted-foreground">How energetic do you feel?</div>
                </div>
                <div className="flex items-center">
                  <Battery className="w-4 h-4 mr-2 text-muted-foreground" />
                  <span className="font-bold">{log.energy}/10</span>
                </div>
              </div>
              <Slider
                value={[log.energy]}
                min={1}
                max={10}
                step={1}
                onValueChange={([value]) => setLog(prev => ({ ...prev, energy: value }))}
              />
            </div>

            {/* Focus */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">Focus</label>
                  <div className="text-xs text-muted-foreground">How well can you concentrate?</div>
                </div>
                <div className="flex items-center">
                  <Focus className="w-4 h-4 mr-2 text-muted-foreground" />
                  <span className="font-bold">{log.focus}/10</span>
                </div>
              </div>
              <Slider
                value={[log.focus]}
                min={1}
                max={10}
                step={1}
                onValueChange={([value]) => setLog(prev => ({ ...prev, focus: value }))}
              />
            </div>

            {/* Stress */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">Stress</label>
                  <div className="text-xs text-muted-foreground">How stressed are you feeling?</div>
                </div>
                <div className="flex items-center">
                  <Gauge className="w-4 h-4 mr-2 text-muted-foreground" />
                  <span className="font-bold">{log.stress}/10</span>
                </div>
              </div>
              <Slider
                value={[log.stress]}
                min={1}
                max={10}
                step={1}
                onValueChange={([value]) => setLog(prev => ({ ...prev, stress: value }))}
              />
            </div>

            {/* Sleep Quality */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">Sleep Quality</label>
                  <div className="text-xs text-muted-foreground">How well did you sleep?</div>
                </div>
                <div className="flex items-center">
                  <Moon className="w-4 h-4 mr-2 text-muted-foreground" />
                  <span className="font-bold">{log.sleep_quality}/10</span>
                </div>
              </div>
              <Slider
                value={[log.sleep_quality]}
                min={1}
                max={10}
                step={1}
                onValueChange={([value]) => setLog(prev => ({ ...prev, sleep_quality: value }))}
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Notes</label>
              <Textarea
                placeholder="Any additional notes about your day..."
                value={log.notes}
                onChange={(e) => setLog(prev => ({ ...prev, notes: e.target.value }))}
                rows={4}
              />
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/dashboard')}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save Log'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 