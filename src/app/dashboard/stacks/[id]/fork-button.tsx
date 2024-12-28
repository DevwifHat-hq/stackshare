'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Loader2, Plus } from 'lucide-react'
import { forkStack } from './actions'

export default function ForkButton({ stackId }: { stackId: string }) {
  const router = useRouter()
  const [isPending, startTransition] = React.useTransition()

  const handleFork = () => {
    startTransition(async () => {
      try {
        const newStackId = await forkStack(stackId)
        toast.success('Stack forked successfully!')
        router.push(`/dashboard/stacks/${newStackId}`)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to fork stack')
      }
    })
  }

  return (
    <Button 
      variant="outline" 
      className="w-full gap-2" 
      onClick={handleFork}
      disabled={isPending}
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Plus className="h-4 w-4" />
      )}
      {isPending ? 'Creating Fork...' : 'Start Using This Stack'}
    </Button>
  )
} 