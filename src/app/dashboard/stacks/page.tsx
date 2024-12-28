import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Zap } from 'lucide-react'
import { StacksList } from '@/app/dashboard/stacks/stacks-list'
import { UntrackStackButton } from '@/components/untrack-stack-button'
import { organizeStacks } from '@/lib/stack-utils'

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

interface ActiveStackData {
  id: string
  stack_id: string
  stack: {
    id: string
    name: string
    description: string
    stack_items: StackItem[]
  }
}

export default async function StacksPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/')
  }

  // Fetch active stack
  const { data: activeStackData } = await supabase
    .from('active_stacks')
    .select(`
      id,
      stack_id,
      stack:stacks (
        id,
        name,
        description,
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
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle() as { data: ActiveStackData | null }

  // Fetch all stacks with additional data for sorting
  const { data: stacks, error: stacksError } = await supabase
    .from('stacks')
    .select(`
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
      ),
      stack_categories (
        category_id,
        category:categories (
          id,
          name,
          slug
        )
      ),
      daily_logs (
        created_at
      )
    `)
    .order('created_at', { ascending: false }) as { data: Stack[] | null, error: any }

  console.log('Stacks query result:', {
    stacks: stacks?.length || 0,
    error: stacksError,
    firstStack: stacks?.[0],
    categories: stacks ? Object.keys(organizeStacks(stacks)) : []
  })

  // Organize stacks by category and relevance
  const stacksByCategory = stacks ? organizeStacks(stacks) : {}

  // Sort categories by priority
  const priorityOrder = [
    'Sleep',
    'Focus',
    'Energy',
    'Recovery',
    'Longevity',
    'Mood',
    'Stress',
    'Gut Health',
    'Other'
  ]

  const sortedCategories = Object.entries(stacksByCategory)
    .sort(([a], [b]) => {
      const aIndex = priorityOrder.indexOf(a)
      const bIndex = priorityOrder.indexOf(b)
      if (aIndex === -1) return 1
      if (bIndex === -1) return -1
      return aIndex - bIndex
    })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Your Stacks</h1>
        <p className="text-muted-foreground mt-2">
          Create and manage your supplement stacks
        </p>
      </div>

      {/* Active Stack Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-lg font-semibold">Active Stack</h2>
          <Badge variant="default" className="bg-primary hover:bg-primary">Currently Tracking</Badge>
        </div>
        
        <div className="grid gap-6 md:grid-cols-[2fr,1fr]">
          {activeStackData ? (
            <Card className="border-primary/50 shadow-[0_0_0_1px] shadow-primary/25">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      {activeStackData.stack.name}
                      <Badge variant="secondary" className="ml-2">Active</Badge>
                    </CardTitle>
                    <CardDescription className="mt-1.5">{activeStackData.stack.description}</CardDescription>
                  </div>
                  <UntrackStackButton
                    stackId={activeStackData.stack.id}
                    activeStackId={activeStackData.id}
                    stackName={activeStackData.stack.name}
                  />
                </div>
              </CardHeader>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <Alert>
                  <AlertTitle>No Active Stack</AlertTitle>
                  <AlertDescription>
                    You don't have any active stacks. Activate a stack below to start tracking your daily logs.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}

          <Card className="bg-muted/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <Zap className="h-4 w-4 text-primary" />
                Why Track One Stack?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                <p className="mb-3">
                  For accurate results, we recommend focusing on one supplement stack at a time.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="mt-1 block h-1.5 w-1.5 rounded-full bg-primary/70" />
                    <span>Track specific combinations accurately</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 block h-1.5 w-1.5 rounded-full bg-primary/70" />
                    <span>Identify effective supplements</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 block h-1.5 w-1.5 rounded-full bg-primary/70" />
                    <span>Minimize supplement interactions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 block h-1.5 w-1.5 rounded-full bg-primary/70" />
                    <span>Make data-driven decisions</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Available Stacks Section */}
      <div className="space-y-6 pt-4">
        <h2 className="text-lg font-semibold">Available Stacks</h2>
        {sortedCategories.map(([category, categoryStacks]) => (
          <div key={category} className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium text-muted-foreground">{category}</h3>
              <Badge variant="outline" className="text-xs">
                {categoryStacks.length} {categoryStacks.length === 1 ? 'stack' : 'stacks'}
              </Badge>
            </div>
            <StacksList 
              stacks={categoryStacks} 
              activeStackId={activeStackData?.stack_id} 
            />
          </div>
        ))}
      </div>
    </div>
  )
} 