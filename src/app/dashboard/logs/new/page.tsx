'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import { Brain, Battery, Focus, Gauge, Moon, Loader2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'

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
  description: string
  created_at: string
  stack_items: StackItem[]
}

interface ActiveStackResponse {
  id: string
  stack_id: string
  stack: Stack
}

interface ActiveStack {
  id: string
  stack_id: string
  stack: Stack
}

interface DailyLog {
  mood: number
  energy: number
  focus: number
  stress: number
  sleep_quality: number
  notes: string
  side_effects: string
  selectedItems: Record<string, boolean>
}

const DEFAULT_LOG: DailyLog = {
  mood: 5,
  energy: 5,
  focus: 5,
  stress: 5,
  sleep_quality: 5,
  notes: '',
  side_effects: '',
  selectedItems: {}
}

export default function NewLogPage() {
  const router = useRouter()
  const [log, setLog] = useState<DailyLog>(DEFAULT_LOG)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeStack, setActiveStack] = useState<ActiveStack | null>(null)

  useEffect(() => {
    async function checkActiveStack() {
      setLoading(true)
      const supabase = createClient()
      
      const { data: activeStackData, error } = await supabase
        .from('active_stacks')
        .select(`
          id,
          stack_id,
          stack:stacks (
            id,
            name,
            description,
            created_at,
            stack_items (
              id,
              name,
              type,
              dosage,
              timing,
              frequency
            )
          )
        `)
        .single() as { data: ActiveStackResponse | null, error: any }

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking active stack:', error)
      }

      if (activeStackData) {
        console.log('Active Stack Data:', JSON.stringify(activeStackData, null, 2))
        setActiveStack(activeStackData)
      }

      setLoading(false)
    }

    checkActiveStack()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeStack) {
      toast.error('No active stack selected')
      return
    }

    setSaving(true)
    console.log('Starting submission with data:', {
      activeStack,
      logData: log
    })

    try {
      const supabase = createClient()
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError) {
        console.error('Error getting user:', userError)
        throw userError
      }

      if (!user) {
        throw new Error('No authenticated user')
      }

      console.log('Creating daily log with:', {
        user_id: user.id,
        stack_id: activeStack.stack_id,
        logData: {
          mood: log.mood,
          energy: log.energy,
          focus: log.focus,
          stress: log.stress,
          sleep_quality: log.sleep_quality,
          notes: log.notes,
          side_effects: log.side_effects,
          items_taken: Object.entries(log.selectedItems)
            .filter(([_, taken]) => taken)
            .map(([id]) => id)
        }
      })

      // Create new log
      const { data: newLog, error: logError } = await supabase
        .from('daily_logs')
        .insert({
          user_id: user.id,
          stack_id: activeStack.stack_id,
          date: new Date().toISOString().split('T')[0],
          mood: log.mood,
          energy: log.energy,
          focus: log.focus,
          stress: log.stress,
          sleep_quality: log.sleep_quality,
          notes: log.notes,
          side_effects: log.side_effects,
          items_taken: Object.entries(log.selectedItems)
            .filter(([_, taken]) => taken)
            .map(([id]) => id)
        })
        .select()
        .single()

      if (logError) {
        console.error('Error creating daily log:', {
          error: logError,
          code: logError.code,
          message: logError.message,
          details: logError.details,
          hint: logError.hint
        })
        throw logError
      }

      console.log('Successfully created daily log:', newLog)
      toast.success('Daily log saved successfully')
      router.push('/dashboard/logs')
    } catch (error) {
      console.error('Error saving log:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      })
      if (error instanceof Error) {
        toast.error(`Failed to save log: ${error.message}`)
      } else {
        toast.error('Failed to save log. Please try again.')
      }
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

  if (!activeStack) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No Active Stack</AlertTitle>
            <AlertDescription>
              You need to have an active stack to create a daily log. 
              Please go to your stacks and activate one first.
            </AlertDescription>
          </Alert>
          <div className="mt-6 flex justify-center">
            <Button onClick={() => router.push('/dashboard/stacks')}>
              Go to Stacks
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Daily Check-in</CardTitle>
              <CardDescription>
                Track your daily metrics to monitor your progress
              </CardDescription>
            </div>
            <Badge variant="secondary">
              {activeStack.stack.name}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Items Taken */}
            {activeStack.stack.stack_items.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-medium">Items Taken</h3>
                <div className="space-y-4">
                  {activeStack.stack.stack_items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {item.dosage && `${item.dosage} • `}
                          {item.timing}
                        </div>
                      </div>
                      <Switch
                        checked={log.selectedItems[item.id] || false}
                        onCheckedChange={(checked) => 
                          setLog(prev => ({
                            ...prev,
                            selectedItems: { ...prev.selectedItems, [item.id]: checked }
                          }))
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

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

            {/* Side Effects */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Side Effects</label>
              <Textarea
                placeholder="Any side effects or concerns..."
                value={log.side_effects}
                onChange={(e) => setLog(prev => ({ ...prev, side_effects: e.target.value }))}
                rows={4}
              />
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/dashboard/logs')}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Log'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 