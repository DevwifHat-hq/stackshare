import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Compass, LayoutGrid, LineChart, ListTodo, CheckCircle2, Plus } from 'lucide-react'
import { DailyCheckInButton } from '@/components/daily-check-in-button'

const navigation = [
  { name: 'Overview', href: '/dashboard', icon: LayoutGrid },
  { name: 'Discover', href: '/dashboard/discover', icon: Compass },
  { name: 'My Stacks', href: '/dashboard/stacks', icon: ListTodo },
  { name: 'Trends', href: '/dashboard/trends', icon: LineChart },
]

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth/signin')
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <nav className="flex items-center space-x-8">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-sm font-medium transition-colors hover:text-primary flex items-center gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
            <div className="flex items-center space-x-6">
              <Link
                href={`/dashboard/logs/${new Date().toISOString().split('T')[0]}`}
                className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full transition-colors shadow-sm hover:shadow-md"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span className="font-medium">Daily Check-in</span>
              </Link>
              <Link
                href="/dashboard/stacks/new"
                className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-full transition-colors shadow-sm hover:shadow-md"
              >
                <Plus className="h-4 w-4" />
                <span className="font-medium">Create Stack</span>
              </Link>
              <form action="/auth/sign-out" method="post">
                <button
                  type="submit"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                >
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
} 