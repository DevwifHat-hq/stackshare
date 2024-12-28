'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { toast } from 'sonner'
import { Brain, Battery, Focus, Plus, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { createLog } from './actions'

interface StackItem {
  id: string
  name: string
  type: string
  dosage?: string
  timing?: string
  frequency?: string
}

interface Props {
  stack: {
    id: string
    name: string
    stack_items: StackItem[]
  }
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function CheckInDialog({ stack, open, onOpenChange, onSuccess }: Props) {
  const [energy, setEnergy] = useState(3)
  const [focus, setFocus] = useState(3)
  const [mood, setMood] = useState(3)
  const [notes, setNotes] = useState('')
  const [itemsTaken, setItemsTaken] = useState<Record<string, boolean>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [hasExistingLog, setHasExistingLog] = useState(false)
  const [showExistingLogDialog, setShowExistingLogDialog] = useState(false)

  useEffect(() => {
    if (open) {
      checkExistingLog()
      const initialItems = stack.stack_items.reduce((acc, item) => {
        acc[item.id] = false
        return acc
      }, {} as Record<string, boolean>)
      setItemsTaken(initialItems)
    }
  }, [open, stack.stack_items])

  const checkExistingLog = async () => {
    const supabase = createClient()
    const today = new Date().toISOString().split('T')[0]

    const { data } = await supabase
      .from('daily_logs')
      .select('id')
      .eq('stack_id', stack.id)
      .eq('date', today)
      .single()

    if (data) {
      setHasExistingLog(true)
      setShowExistingLogDialog(true)
    } else {
      setHasExistingLog(false)
      setShowExistingLogDialog(false)
    }
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      await createLog({
        stackId: stack.id,
        energy,
        focus,
        mood,
        notes: notes.trim(),
        itemsTaken: Object.entries(itemsTaken).map(([id, taken]) => ({
          item_id: id,
          taken
        }))
      })
      
      setEnergy(3)
      setFocus(3)
      setMood(3)
      setNotes('')
      setItemsTaken({})
      onOpenChange(false)
      onSuccess?.()
      toast.success('Check-in logged successfully')
    } catch (error) {
      console.error('Failed to create log:', error)
      toast.error('Failed to save check-in')
    } finally {
      setIsLoading(false)
    }
  }

  if (showExistingLogDialog) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Already Exists</DialogTitle>
            <DialogDescription>
              You have already logged your check-in for today. What would you like to do?
            </DialogDescription>
          </DialogHeader>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You can either view today's log or update it with new information.
            </AlertDescription>
          </Alert>
          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                onOpenChange(false)
                // This will trigger the ViewLogDialog
                onSuccess?.()
              }}
            >
              View Today's Log
            </Button>
            <Button
              onClick={() => {
                setShowExistingLogDialog(false)
              }}
            >
              Update Log
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Daily Check-in</DialogTitle>
        </DialogHeader>
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-6">
          {/* Metrics */}
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                <Label>Mood (1-10)</Label>
              </div>
              <Slider
                value={[mood]}
                onValueChange={([value]) => setMood(value)}
                min={1}
                max={10}
                step={1}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Battery className="h-4 w-4" />
                <Label>Energy (1-10)</Label>
              </div>
              <Slider
                value={[energy]}
                onValueChange={([value]) => setEnergy(value)}
                min={1}
                max={10}
                step={1}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Focus className="h-4 w-4" />
                <Label>Focus (1-10)</Label>
              </div>
              <Slider
                value={[focus]}
                onValueChange={([value]) => setFocus(value)}
                min={1}
                max={10}
                step={1}
              />
            </div>
          </div>

          {/* Items Taken */}
          <div className="space-y-2">
            <Label>Items Taken</Label>
            <div className="space-y-2">
              {stack.stack_items.map(item => (
                <div key={item.id} className="flex items-center gap-2">
                  <Checkbox
                    id={item.id}
                    checked={itemsTaken[item.id]}
                    onCheckedChange={(checked: boolean | 'indeterminate') => {
                      if (checked === true) {
                        setItemsTaken({ ...itemsTaken, [item.id]: true })
                      } else {
                        setItemsTaken({ ...itemsTaken, [item.id]: false })
                      }
                    }}
                  />
                  <Label htmlFor={item.id} className="text-sm">
                    {item.name}
                    {item.dosage && <span className="text-muted-foreground ml-1">({item.dosage})</span>}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How did you feel today? Any notable effects?"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
            >
              {hasExistingLog ? 'Update Log' : 'Save Log'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 