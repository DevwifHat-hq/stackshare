import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import NewItemForm from './form'

export default async function NewItemPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    redirect('/')
  }

  const stackId = await params.id

  if (!stackId) {
    redirect('/dashboard/stacks')
  }

  const { data: stack } = await supabase
    .from('stacks')
    .select('*')
    .eq('id', stackId)
    .single()

  if (!stack || stack.user_id !== session.user.id) {
    redirect('/dashboard/stacks')
  }

  async function createItem(formData: FormData) {
    'use server'

    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return { error: 'Unauthorized' }
    }

    const type = formData.get('type')
    const name = formData.get('name')
    const description = formData.get('description')
    const dosage = formData.get('dosage')
    const frequency = formData.get('frequency')
    const timing = formData.get('timing')
    const imageFile = formData.get('image') as File | null

    if (!type || !name) {
      return { error: 'Type and name are required' }
    }

    let image_url = null

    // Upload image if provided
    if (imageFile && imageFile.size > 0) {
      const fileExt = imageFile.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `${session.user.id}/${stackId}/${fileName}`

      const { error: uploadError, data } = await supabase.storage
        .from('stack-items')
        .upload(filePath, imageFile)

      if (uploadError) {
        console.error('Error uploading image:', uploadError)
        return { error: `Error uploading image: ${uploadError.message}` }
      }

      if (data) {
        const { data: { publicUrl } } = supabase.storage
          .from('stack-items')
          .getPublicUrl(filePath)
        
        image_url = publicUrl
      }
    }

    // Create the item
    const { error: itemError } = await supabase
      .from('stack_items')
      .insert({
        stack_id: stackId,
        type,
        name,
        description: description || null,
        dosage: dosage || null,
        frequency: frequency || null,
        timing: timing || null,
        image_url,
      })

    if (itemError) {
      console.error('Error creating item:', itemError)
      return { error: `Error creating item: ${itemError.message}` }
    }

    revalidatePath(`/dashboard/stacks/${stackId}`)
    redirect(`/dashboard/stacks/${stackId}`)
  }

  return <NewItemForm params={params} stack={stack} createItem={createItem} />
} 