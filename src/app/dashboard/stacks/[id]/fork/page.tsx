'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { forkStack } from '../actions'

export default function ForkPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [error, setError] = useState<string>()
  const stackId = params.id

  useEffect(() => {
    async function handleFork() {
      try {
        const newStackId = await forkStack(stackId)
        toast.success('Stack forked successfully')
        router.push(`/dashboard/stacks/${newStackId}`)
      } catch (err) {
        console.error('Error forking stack:', err)
        setError(err instanceof Error ? err.message : 'Failed to fork stack')
        toast.error('Failed to fork stack')
      }
    }

    handleFork()
  }, [stackId, router])

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-4">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-red-500 mb-2">Error</h1>
          <div className="text-muted-foreground">{error}</div>
          <button
            onClick={() => router.back()}
            className="mt-4 text-primary hover:underline"
          >
            Go back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-4">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mb-4 mx-auto" />
        <div className="text-muted-foreground">Forking stack...</div>
      </div>
    </div>
  )
} 