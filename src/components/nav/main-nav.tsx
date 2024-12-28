'use client'

import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Compass, LayoutGrid, LineChart, ListTodo, Menu, X, Calendar, Home, Search, Library, Plus, CheckCircle2 } from 'lucide-react'
import { useState } from 'react'
import { SignInButton } from '@/components/auth/SignInButton'
import { cn } from "@/lib/utils"
import { DailyCheckInButton } from '@/components/daily-check-in-button'

const navigation = {
  public: [
    { name: 'Discover', href: '/dashboard/discover', icon: Compass },
    { name: 'About', href: '/about', icon: LayoutGrid },
  ],
  authenticated: [
    { name: 'Overview', href: '/dashboard', icon: LayoutGrid },
    { name: 'My Stacks', href: '/dashboard/stacks', icon: ListTodo },
    { name: 'Trends', href: '/dashboard/trends', icon: LineChart },
  ]
}

export function MainNav() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const supabase = createClient()
  const today = new Date().toISOString().split('T')[0]

  const isActive = (href: string) => {
    if (href === '/') return pathname === href
    return pathname.startsWith(href)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold">StackShare</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              {navigation.public.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`text-sm font-medium transition-colors hover:text-primary flex items-center gap-2 ${
                      isActive(item.href) ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Desktop Auth/User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <DailyCheckInButton />
            <Link
              href="/dashboard/stacks/new"
              className={cn(
                "flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-full transition-colors",
                "shadow-sm hover:shadow-md"
              )}
            >
              <Plus className="h-4 w-4" />
              <span className="font-medium">Create Stack</span>
            </Link>
            <SignInButton />
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {isOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden border-t">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex flex-col space-y-4">
              {navigation.public.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`text-sm font-medium transition-colors hover:text-primary flex items-center gap-2 ${
                      isActive(item.href) ? 'text-primary' : 'text-muted-foreground'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                )
              })}
              <div className="pt-4 border-t">
                <div className="flex flex-col space-y-4 mb-4">
                  <DailyCheckInButton />
                  <Link
                    href="/dashboard/stacks/new"
                    className="flex items-center gap-2 text-sm font-medium text-primary"
                    onClick={() => setIsOpen(false)}
                  >
                    <Plus className="h-4 w-4" />
                    Create Stack
                  </Link>
                </div>
                <SignInButton />
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  )
} 