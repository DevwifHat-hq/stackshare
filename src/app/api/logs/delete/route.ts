import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { logId } = await request.json()

    if (!logId) {
      return new NextResponse('Log ID is required', { status: 400 })
    }

    // Verify the log belongs to the user
    const { data: log } = await supabase
      .from('daily_logs')
      .select('user_id')
      .eq('id', logId)
      .single()

    if (!log || log.user_id !== session.user.id) {
      return new NextResponse('Not found', { status: 404 })
    }

    // Delete the log
    const { error } = await supabase
      .from('daily_logs')
      .delete()
      .eq('id', logId)

    if (error) throw error

    return new NextResponse('OK', { status: 200 })
  } catch (error) {
    console.error('Error deleting log:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 