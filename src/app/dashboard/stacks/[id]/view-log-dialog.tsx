'use client'

import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { createClient } from '@/lib/supabase/client'
import { useSession } from '@/hooks/use-session'
import { Brain, Battery, Focus } from 'lucide-react'

interface Props {
  stack: {
    id: string
    name: string
  }
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface Log {
  id: string
  created_at: string
  energy_level: number
  focus_level: number
  mood_level: number
  notes: string
  items_taken: {
    item_id: string
    taken: boolean
  }[]
}

export function ViewLogDialog({ stack, open, onOpenChange }: Props) {
  const { session } = useSession()
  const [log, setLog] = useState<Log | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (open && session?.user?.id) {
      loadTodayLog()
    }
  }, [open, session?.user?.id])

  const loadTodayLog = async () => {
    if (!session?.user?.id) return

    setIsLoading(true)
    try {
      const supabase = createClient()
      const today = new Date().toISOString().split('T')[0]

      const { data } = await supabase
        .from('daily_logs')
        .select(`
          id,
          created_at,
          energy_level,
          focus_level,
          mood_level,
          notes,
          items_taken
        `)
        .eq('stack_id', stack.id)
        .eq('user_id', session.user.id)
        .eq('created_date', today)
        .single()

      setLog(data)
    } catch (error) {
      console.error('Failed to load log:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const renderLevel = (level: number) => {
    return [...Array(5)].map((_, i) => (
      <div
        key={i}
        className={`h-2 w-8 rounded ${
          i < level ? 'bg-primary' : 'bg-muted'
        }`}
      />
    ))
  }

  if (!log) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Today's Log</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-4">
            {/* Energy Level */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Battery className="h-4 w-4 text-primary" />
                <span className="font-medium">Energy Level</span>
              </div>
              <div className="flex gap-1">
                {renderLevel(log.energy_level)}
              </div>
            </div>

            {/* Focus Level */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Focus className="h-4 w-4 text-primary" />
                <span className="font-medium">Focus Level</span>
              </div>
              <div className="flex gap-1">
                {renderLevel(log.focus_level)}
              </div>
            </div>

            {/* Mood Level */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-primary" />
                <span className="font-medium">Mood Level</span>
              </div>
              <div className="flex gap-1">
                {renderLevel(log.mood_level)}
              </div>
            </div>
          </div>

          {/* Notes */}
          {log.notes && (
            <div className="space-y-2">
              <h4 className="font-medium">Notes</h4>
              <p className="text-sm text-muted-foreground">{log.notes}</p>
            </div>
          )}

          {/* Items Taken */}
          <div className="space-y-2">
            <h4 className="font-medium">Items Taken</h4>
            <div className="space-y-1">
              {log.items_taken.map((item) => (
                <div
                  key={item.item_id}
                  className="flex items-center gap-2 text-sm"
                >
                  <div
                    className={`h-2 w-2 rounded-full ${
                      item.taken ? 'bg-green-500' : 'bg-red-500'
                    }`}
                  />
                  <span className={item.taken ? 'text-foreground' : 'text-muted-foreground'}>
                    {item.item_id}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 