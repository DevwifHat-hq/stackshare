'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StackOverview } from '@/app/dashboard/stacks/[id]/overview-tab'
import { StackLogs } from '@/app/dashboard/stacks/[id]/logs-tab'
import { StackCommunity } from '@/app/dashboard/stacks/[id]/community-tab'
import { ResultsTab } from '@/app/dashboard/stacks/[id]/results-tab'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { DailyCheckInButton } from '@/components/daily-check-in-button'

const supabase = createClient()

export default function StackPage() {
  const params = useParams()
  const stackId = params.id as string
  const queryClient = useQueryClient()

  // Fetch stack data
  const { data: stack, isLoading } = useQuery({
    queryKey: ['stack', stackId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stacks')
        .select(`
          *,
          user_profiles (
            id,
            full_name,
            avatar_url
          ),
          stack_items (
            id,
            name,
            type,
            dosage,
            timing,
            frequency,
            description
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
            id,
            date,
            mood,
            energy,
            focus,
            notes,
            side_effects,
            items_taken,
            created_at
          )
        `)
        .eq('id', stackId)
        .single()

      if (error) throw error
      return data
    }
  })

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!stack) {
    return <div>Stack not found</div>
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{stack.name}</h1>
        <p className="text-muted-foreground mt-2">{stack.description}</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="community">Community</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <StackOverview stack={stack} />
        </TabsContent>

        <TabsContent value="logs">
          <StackLogs stack={stack} />
        </TabsContent>

        <TabsContent value="results">
          <ResultsTab stack={stack} />
        </TabsContent>

        <TabsContent value="community">
          <StackCommunity stack={stack} />
        </TabsContent>
      </Tabs>

      <DailyCheckInButton stackId={stack.id} />
    </div>
  )
} 