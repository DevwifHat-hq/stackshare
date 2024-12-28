'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export function SignOutButton() {
  const [isLoading, setIsLoading] = useState(false)

  const handleSignOut = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const res = await fetch('/auth/sign-out', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (!res.ok) throw new Error('Failed to sign out')
      
      // Force reload to clear all client state
      window.location.href = '/dashboard/discover'
    } catch (error) {
      console.error('Sign out error:', error)
      toast.error('Failed to sign out. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleSignOut}
      disabled={isLoading}
      className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary disabled:opacity-50 flex items-center gap-2"
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Signing out...
        </>
      ) : (
        'Sign Out'
      )}
    </button>
  )
} 