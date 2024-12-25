'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')

    try {
      const response = await fetch('/auth/sign-in', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error signing in')
      }

      setMessage(data.message)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <main className="flex w-full flex-1 flex-col items-center justify-center px-8 text-center sm:px-20">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">
              Welcome to BioStack
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Track and optimize your biohacking journey
            </p>
          </div>

          <form onSubmit={handleSignIn} className="space-y-6">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Enter your email address"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-primary text-primary-foreground px-4 py-3 rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending link...' : 'Sign in with Email'}
            </button>
          </form>

          {message && (
            <p className="text-sm text-green-600 bg-green-50 p-4 rounded-lg">
              {message}
            </p>
          )}

          {error && (
            <p className="text-sm text-red-600 bg-red-50 p-4 rounded-lg">
              {error}
            </p>
          )}

          <p className="text-sm text-gray-500">
            We'll send you a magic link for secure, passwordless sign in
          </p>
        </div>
      </main>
    </div>
  )
} 