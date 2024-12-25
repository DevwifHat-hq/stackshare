import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
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

    const formData = await request.formData()
    const type = formData.get('type')
    const name = formData.get('name')
    const description = formData.get('description')
    const dosage = formData.get('dosage')
    const frequency = formData.get('frequency')
    const timing = formData.get('timing')
    const imageFile = formData.get('image') as File | null

    if (!type || !name) {
      return new NextResponse('Type and name are required', { status: 400 })
    }

    let image_url = null

    // Upload image if provided
    if (imageFile && imageFile.size > 0) {
      const fileExt = imageFile.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `${session.user.id}/${params.id}/${fileName}`

      const { error: uploadError, data } = await supabase.storage
        .from('stack-items')
        .upload(filePath, imageFile)

      if (uploadError) {
        console.error('Error uploading image:', uploadError)
        return new NextResponse(`Error uploading image: ${uploadError.message}`, { status: 500 })
      }

      if (data) {
        const { data: { publicUrl } } = supabase.storage
          .from('stack-items')
          .getPublicUrl(filePath)
        
        image_url = publicUrl
      }
    }

    // Create the item
    const { data: item, error: itemError } = await supabase
      .from('stack_items')
      .insert({
        stack_id: params.id,
        type,
        name,
        description: description || null,
        dosage: dosage || null,
        frequency: frequency || null,
        timing: timing || null,
        image_url,
      })
      .select()
      .single()

    if (itemError) {
      console.error('Error creating item:', itemError)
      return new NextResponse(`Error creating item: ${itemError.message}`, { status: 500 })
    }

    if (!item) {
      return new NextResponse('Item was not created', { status: 500 })
    }

    const redirectUrl = new URL(`/dashboard/stacks/${params.id}`, request.url)
    return NextResponse.redirect(redirectUrl)
  } catch (error) {
    console.error('Item creation error:', error)
    return new NextResponse(`Internal Server Error: ${error instanceof Error ? error.message : 'Unknown error'}`, { status: 500 })
  }
} 