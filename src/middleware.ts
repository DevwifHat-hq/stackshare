import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.delete({
            name,
            ...options,
          })
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()
  const pathname = request.nextUrl.pathname

  console.log('Middleware - Path:', pathname)
  console.log('Middleware - Session:', !!session)

  // Allow auth routes and public pages
  if (
    pathname.startsWith('/auth') || 
    pathname === '/dashboard/discover' ||
    pathname.match(/^\/dashboard\/stacks\/[^/]+$/) // Allow individual stack views
  ) {
    console.log('Middleware - Allowing access to:', pathname)
    return response
  }

  // If not authenticated and trying to access a protected route
  if (!session && pathname !== '/') {
    console.log('Middleware - Redirecting unauthenticated user from:', pathname, 'to: /dashboard/discover')
    return NextResponse.redirect(new URL('/dashboard/discover', request.url))
  }

  // If authenticated and trying to access the home page
  if (session && pathname === '/') {
    console.log('Middleware - Redirecting authenticated user to dashboard')
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
} 