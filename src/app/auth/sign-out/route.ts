import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const requestUrl = new URL(request.url)
  
  // Create and await the Supabase client
  const supabase = await createClient()

  // Sign out on server
  await supabase.auth.signOut()
  
  // Create response with redirect
  const response = NextResponse.redirect(`${requestUrl.origin}/dashboard/discover`, {
    status: 302,
  })

  // Clear auth cookie by setting it to expire
  const cookieName = 'sb-' + process.env.NEXT_PUBLIC_SUPABASE_PROJECT_REF + '-auth-token'
  response.cookies.set(cookieName, '', {
    expires: new Date(0),
    path: '/',
  })

  return response
} 