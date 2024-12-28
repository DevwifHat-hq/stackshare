import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Compass, LayoutGrid, ListTodo, Plus } from 'lucide-react'
import { DailyCheckInButton } from '@/components/daily-check-in-button'
import { SignOutButton } from '@/components/auth/sign-out-button'

// Split navigation into public and authenticated routes
const navigation = {
  public: [
    { name: 'Discover', href: '/dashboard/discover', icon: Compass },
  ],
  authenticated: [
    { name: 'Overview', href: '/dashboard', icon: LayoutGrid },
    { name: 'My Stacks', href: '/dashboard/stacks', icon: ListTodo },
  ]
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const isAuthenticated = !!session

  // Return the layout for all cases - let middleware handle auth
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <nav className="flex items-center gap-8">
              <Link href="/" className="flex items-center">
                <span className="text-xl font-bold">StackShare</span>
              </Link>
              {/* Always show public routes */}
              {navigation.public.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                )
              })}
              {/* Only show authenticated routes when logged in */}
              {isAuthenticated && navigation.authenticated.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>

            {/* Right side actions */}
            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <>
                  <DailyCheckInButton />
                  <Link
                    href="/dashboard/stacks/new"
                    className="flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 shadow-sm hover:shadow-md"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Create Stack</span>
                  </Link>
                  <SignOutButton />
                </>
              ) : (
                <Link
                  href="/auth/login"
                  className="text-sm font-medium text-primary hover:text-primary/90"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
} 