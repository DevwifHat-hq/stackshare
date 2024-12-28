'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

interface NewItemData {
  type: string
  name: string
  description: string
  dosage?: string | null
  frequency?: string | null
  timing?: string | null
}

export async function addStackItem(stackId: string, data: NewItemData) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session?.user?.id) {
    throw new Error('You must be logged in to add items')
  }

  // Verify stack ownership
  const { data: stack } = await supabase
    .from('stacks')
    .select('user_id')
    .eq('id', stackId)
    .single()

  if (!stack || stack.user_id !== session.user.id) {
    throw new Error('You can only add items to your own stacks')
  }

  // Clean up the data by removing null values
  const cleanData = {
    ...data,
    dosage: data.dosage || undefined,
    frequency: data.frequency || undefined,
    timing: data.timing || undefined,
  }

  // Add the item
  const { error } = await supabase
    .from('stack_items')
    .insert({
      stack_id: stackId,
      ...cleanData,
    })

  if (error) {
    console.error('Database error:', error)
    throw new Error('Failed to add item. Please try again.')
  }

  revalidatePath(`/dashboard/stacks/${stackId}`)
  return { success: true }
} 