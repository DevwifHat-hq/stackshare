import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: { id: string; itemId: string } }
) {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  // Verify stack ownership
  const { data: stack } = await supabase
    .from('stacks')
    .select('user_id')
    .eq('id', params.id)
    .single()

  if (!stack || stack.user_id !== session.user.id) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  // Get item to delete its image
  const { data: item } = await supabase
    .from('stack_items')
    .select('image_url')
    .eq('id', params.itemId)
    .eq('stack_id', params.id)
    .single()

  if (item?.image_url) {
    const oldPath = item.image_url.split('/').pop()
    if (oldPath) {
      await supabase.storage
        .from('stack-items')
        .remove([`${session.user.id}/${params.id}/${oldPath}`])
    }
  }

  // Delete the item
  const { error } = await supabase
    .from('stack_items')
    .delete()
    .eq('id', params.itemId)
    .eq('stack_id', params.id)

  if (error) {
    return new NextResponse('Error deleting item', { status: 500 })
  }

  return NextResponse.redirect(new URL(`/dashboard/stacks/${params.id}`, request.url))
} 