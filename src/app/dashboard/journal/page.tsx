'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import { Brain, Battery, Focus, Gauge, Moon, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface DailyLog {
  mood: number
  energy: number
  focus: number
  stress: number
  sleep_quality: number
  notes: string
}

const DEFAULT_LOG: DailyLog = {
  mood: 5,
  energy: 5,
  focus: 5,
  stress: 5,
  sleep_quality: 5,
  notes: ''
}

export default function JournalPage() {
  const router = useRouter()
  const [log, setLog] = useState<DailyLog>(DEFAULT_LOG)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function checkExistingLog() {
      setLoading(true)
      const supabase = createClient()
      const today = new Date().toISOString().split('T')[0]

      const { data: existingLog } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('date', today)
        .single()

      if (existingLog) {
        setLog({
          mood: existingLog.metrics?.mood || 5,
          energy: existingLog.metrics?.energy || 5,
          focus: existingLog.metrics?.focus || 5,
          stress: existingLog.metrics?.stress || 5,
          sleep_quality: existingLog.metrics?.sleep_quality || 5,
          notes: existingLog.summary || ''
        })
      }
      setLoading(false)
    }

    checkExistingLog()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const supabase = createClient()
      const today = new Date().toISOString().split('T')[0]

      // Check for existing log first
      const { data: existingLog } = await supabase
        .from('daily_logs')
        .select('id')
        .eq('date', today)
        .single()

      const metrics = {
        mood: log.mood,
        energy: log.energy,
        focus: log.focus,
        stress: log.stress,
        sleep_quality: log.sleep_quality
      }

      if (existingLog) {
        // Update existing log
        await supabase
          .from('daily_logs')
          .update({
            metrics,
            summary: log.notes,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingLog.id)
      } else {
        // Create new log
        await supabase
          .from('daily_logs')
          .insert({
            date: today,
            metrics,
            summary: log.notes
          })
      }

      toast.success('Daily log saved successfully')
      router.push('/dashboard')
    } catch (error) {
      console.error('Error saving log:', error)
      toast.error('Failed to save log. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
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
                  <div className="text-xs text-muted-foreground">How stressed do you feel?</div>
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