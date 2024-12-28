'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function deleteLog(logId: string) {
  try {
    const supabase = await createClient()
    
    const { error } = await supabase
      .from('daily_logs')
      .delete()
      .eq('id', logId)

    if (error) throw error

    revalidatePath('/dashboard/logs')
    return { success: true }
  } catch (error) {
    console.error('Error deleting log:', error)
    return { success: false, error }
  }
} 