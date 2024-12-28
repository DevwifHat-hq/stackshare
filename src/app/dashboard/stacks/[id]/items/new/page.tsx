import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { NewItemForm } from './new-item-form'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function NewItemPage({ params }: PageProps) {
  const { id: stackId } = await params
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    redirect('/')
  }

  // Verify stack ownership
  const { data: stack } = await supabase
    .from('stacks')
    .select('user_id')
    .eq('id', stackId)
    .single()

  if (!stack || stack.user_id !== session.user.id) {
    redirect('/dashboard/discover')
  }

  return (
    <div className="container max-w-2xl mx-auto py-8 px-4">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Add New Item</h1>
          <p className="text-muted-foreground mt-2">
            Add a new item to your stack. Be sure to include all relevant details.
          </p>
        </div>
        
        <NewItemForm stackId={stackId} />
      </div>
    </div>
  )
} 