'use client'

import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Zap, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useState } from 'react'

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
  stack_categories: {
    category_id: string
    category: {
      id: string
      name: string
      slug: string
    }
  }[]
  daily_logs: {
    created_at: string
  }[]
}

interface EnhancedStack extends Stack {
  relevanceScore: number
  category: string
}

function StackItem({ name, dosage, timing }: { name: string; dosage?: string; timing?: string }) {
  return (
    <div className="flex items-baseline justify-between text-sm">
      <span className="font-medium truncate max-w-[60%]">{name}</span>
      <span className="text-muted-foreground whitespace-nowrap ml-2">
        {dosage && `${dosage} • `}{timing}
      </span>
    </div>
  )
}

interface StacksListProps {
  stacks: EnhancedStack[]
  activeStackId?: string
}

export function StacksList({ stacks, activeStackId }: StacksListProps) {
  const [activating, setActivating] = useState<string | null>(null)

  async function handleActivateStack(stackId: string) {
    setActivating(stackId)
    const supabase = createClient()

    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('No authenticated user')
      }

      // First deactivate any existing active stack
      if (activeStackId) {
        await supabase
          .from('active_stacks')
          .delete()
          .eq('stack_id', activeStackId)
      }

      // Then activate the new stack
      const { error } = await supabase
        .from('active_stacks')
        .insert({ 
          stack_id: stackId,
          user_id: user.id 
        })

      if (error) throw error

      // Record a stack view
      await supabase
        .from('stack_views')
        .insert({
          stack_id: stackId,
          user_id: user.id,
          viewed_at: new Date().toISOString()
        })

      toast.success('Stack activated successfully')
      window.location.reload()
    } catch (error) {
      console.error('Error activating stack:', error)
      toast.error('Failed to activate stack')
    } finally {
      setActivating(null)
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {stacks.map((stack) => {
        const isActive = stack.id === activeStackId
        
        return (
          <Link 
            key={stack.id} 
            href={`/dashboard/stacks/${stack.id}`}
            className={`block transition-transform hover:scale-[1.02] active:scale-[0.98] ${isActive ? 'opacity-50' : ''}`}
          >
            <Card className="h-full p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="space-y-1 flex-1 min-w-0 mr-4">
                  <h3 className="font-semibold truncate">{stack.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{stack.description}</p>
                </div>
                {!isActive && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="shrink-0"
                    onClick={(e) => {
                      e.preventDefault()
                      handleActivateStack(stack.id)
                    }}
                    disabled={activating === stack.id}
                  >
                    {activating === stack.id ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <Zap className="h-4 w-4 mr-1" />
                    )}
                    Start Tracking
                  </Button>
                )}
              </div>
              <div className="space-y-2">
                {stack.stack_items?.map((item) => (
                  <StackItem
                    key={item.id}
                    name={item.name}
                    dosage={item.dosage}
                    timing={item.timing}
                  />
                ))}
              </div>
            </Card>
          </Link>
        )
      })}
    </div>
  )
} 