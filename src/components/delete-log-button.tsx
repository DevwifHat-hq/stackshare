'use client'

import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface Props {
  logId: string
  date: string
}

export function DeleteLogButton({ logId, date }: Props) {
  const router = useRouter()
  const formattedDate = new Date(date).toLocaleDateString()
  
  const handleDelete = async () => {
    const deletePromise = async () => {
      const response = await fetch('/api/logs/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ logId }),
      })

      if (!response.ok) {
        throw new Error('Failed to delete log')
      }
    }

    try {
      await toast.promise(deletePromise(), {
        loading: 'Deleting log...',
        success: 'Log deleted successfully',
        error: 'Failed to delete log',
      })
      
      router.refresh()
    } catch (error) {
      console.error('Error deleting log:', error)
    }
  }
  
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Log</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete your log from {formattedDate}? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => handleDelete()}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
} 