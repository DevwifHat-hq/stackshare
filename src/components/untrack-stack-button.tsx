'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ZapOff, AlertTriangle, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface UntrackStackButtonProps {
  stackId: string
  activeStackId: string
  stackName: string
}

export function UntrackStackButton({ stackId, activeStackId, stackName }: UntrackStackButtonProps) {
  const [showDialog, setShowDialog] = useState(false)
  const [confirmation, setConfirmation] = useState('')
  const [isUntracking, setIsUntracking] = useState(false)

  async function handleUntrack() {
    if (confirmation !== 'CONFIRM DELETE') return

    setIsUntracking(true)
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from('active_stacks')
        .delete()
        .eq('id', activeStackId)

      if (error) throw error

      toast.success('Stack untracked successfully')
      window.location.reload()
    } catch (error) {
      console.error('Error untracking stack:', error)
      toast.error('Failed to untrack stack')
    } finally {
      setIsUntracking(false)
      setShowDialog(false)
    }
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="border-primary/50 text-primary hover:bg-primary/10 hover:text-primary"
        onClick={() => setShowDialog(true)}
      >
        <ZapOff className="mr-2 h-4 w-4" />
        Stop Tracking
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Untrack Stack
            </DialogTitle>
            <DialogDescription className="space-y-3">
              <p>
                You're about to stop tracking <span className="font-medium">{stackName}</span>. 
                This will:
              </p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Reset your tracking consistency</li>
                <li>Affect your progress tracking</li>
                <li>Impact data analysis for this stack</li>
              </ul>
              <p className="font-medium">
                Type CONFIRM DELETE below to proceed:
              </p>
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              placeholder="Type CONFIRM DELETE"
              className="font-mono"
            />
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setShowDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleUntrack}
              disabled={confirmation !== 'CONFIRM DELETE' || isUntracking}
            >
              {isUntracking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Untracking...
                </>
              ) : (
                'Untrack Stack'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
} 