import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = createClient()
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError) {
      console.error('Session error:', sessionError)
      return new NextResponse('Authentication error', { status: 401 })
    }

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Check if user profile exists
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('id', session.user.id)
      .single()

    // If profile doesn't exist, create it
    if (!profile) {
      const username = session.user.email?.split('@')[0] || `user_${Math.random().toString(36).slice(2, 7)}`
      const { error: createProfileError } = await supabase
        .from('user_profiles')
        .insert({
          id: session.user.id,
          username: username,
          full_name: session.user.user_metadata?.full_name || username
        })

      if (createProfileError) {
        console.error('Error creating profile:', createProfileError)
        return new NextResponse(`Error creating profile: ${createProfileError.message}`, { status: 500 })
      }
    }

    const formData = await request.formData()
    const name = formData.get('name')
    const description = formData.get('description')

    if (!name) {
      return new NextResponse('Name is required', { status: 400 })
    }

    // Create the stack
    const { data: stack, error: stackError } = await supabase
      .from('stacks')
      .insert({
        name,
        description: description || null,
        user_id: session.user.id,
      })
      .select()
      .single()

    if (stackError) {
      console.error('Error creating stack:', stackError)
      return new NextResponse(`Error creating stack: ${stackError.message}`, { status: 500 })
    }

    if (!stack) {
      return new NextResponse('Stack was not created', { status: 500 })
    }

    const redirectUrl = new URL(`/dashboard/stacks/${stack.id}`, request.url)
    return NextResponse.redirect(redirectUrl)
  } catch (error) {
    console.error('Stack creation error:', error)
    return new NextResponse(`Internal Server Error: ${error instanceof Error ? error.message : 'Unknown error'}`, { status: 500 })
  }
} 