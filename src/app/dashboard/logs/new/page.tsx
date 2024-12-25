'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/components/ui/use-toast'

const METRICS = [
  { id: 'mood', label: 'Mood', color: '#2563eb', icon: '😊' },
  { id: 'energy', label: 'Energy', color: '#16a34a', icon: '⚡' },
  { id: 'focus', label: 'Focus', color: '#9333ea', icon: '🎯' },
  { id: 'stress', label: 'Stress', color: '#dc2626', icon: '😰' },
  { id: 'sleep_quality', label: 'Sleep Quality', color: '#2dd4bf', icon: '😴' },
]

export default function NewLogPage() {
  const router = useRouter()
  const supabase = createClient()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    mood: 5,
    energy: 5,
    focus: 5,
    stress: 5,
    sleep_quality: 5,
    notes: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('No session')

      const today = new Date().toISOString().split('T')[0]

      const { error } = await supabase
        .from('daily_logs')
        .upsert({
          user_id: session.user.id,
          date: today,
          ...formData,
        })

      if (error) throw error

      toast({
        title: 'Success!',
        description: 'Your daily log has been saved.',
      })

      router.push('/dashboard')
      router.refresh()
    } catch (error) {
      console.error('Error saving log:', error)
      toast({
        title: 'Error',
        description: 'Failed to save your daily log. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleMetricChange = (metric: string, value: number[]) => {
    setFormData(prev => ({
      ...prev,
      [metric]: value[0]
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Daily Check-in</h2>
        <p className="text-muted-foreground">
          How are you feeling today? Rate each aspect from 1-10
        </p>
      </div>

      <div className="grid gap-6">
        {METRICS.map((metric) => (
          <Card key={metric.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>{metric.icon}</span>
                {metric.label}
                <span className="ml-auto text-2xl font-bold">
                  {formData[metric.id]}
                </span>
              </CardTitle>
              <CardDescription>
                Rate your {metric.label.toLowerCase()} level from 1-10
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Slider
                value={[formData[metric.id]]}
                onValueChange={(value) => handleMetricChange(metric.id, value)}
                min={1}
                max={10}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                <span>Low</span>
                <span>High</span>
              </div>
            </CardContent>
          </Card>
        ))}

        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
            <CardDescription>
              Add any additional notes about your day (optional)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="How was your day? Any notable events or observations?"
              className="min-h-[100px]"
            />
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          size="lg"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Save Daily Log'}
        </Button>
      </div>
    </form>
  )
} 