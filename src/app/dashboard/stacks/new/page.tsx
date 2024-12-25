'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Brain, Dumbbell } from 'lucide-react'

export default function NewStackPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [categories, setCategories] = useState<Array<{ id: string; name: string; slug: string }>>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')

  useEffect(() => {
    async function init() {
      setLoading(true)
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        router.push('/auth/signin')
        return
      }

      // Fetch categories
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*')
        .order('name')

      setCategories(categoriesData || [])
      setLoading(false)
    }

    init()
  }, [router])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)

    const formData = new FormData(event.currentTarget)
    const name = formData.get('name')?.toString()
    const description = formData.get('description')?.toString()
    const purpose = formData.get('purpose')?.toString()

    if (!name || !description || !selectedCategory) {
      alert('Please fill in all required fields')
      setSubmitting(false)
      return
    }

    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      router.push('/auth/signin')
      return
    }

    const { data: stack, error } = await supabase
      .from('stacks')
      .insert({
        name,
        description,
        purpose,
        category_id: selectedCategory,
        user_id: session.user.id,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating stack:', error)
      alert('Failed to create stack. Please try again.')
      setSubmitting(false)
      return
    }

    router.push(`/dashboard/stacks/${stack.id}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Create New Stack</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Share your biohacking stack with the community
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Stack Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Name
              </label>
              <Input
                id="name"
                name="name"
                placeholder="Give your stack a name"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe what this stack is about"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="purpose" className="text-sm font-medium">
                Purpose (optional)
              </label>
              <Textarea
                id="purpose"
                name="purpose"
                placeholder="What is the goal of this stack?"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <div className="grid grid-cols-2 gap-4">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center gap-2 p-4 rounded-lg border transition-colors ${
                      selectedCategory === category.id
                        ? 'border-primary bg-primary/5'
                        : 'border-input hover:bg-accent'
                    }`}
                  >
                    {category.slug === 'cognitive-enhancement' ? (
                      <Brain className="h-5 w-5 text-purple-500" />
                    ) : (
                      <Dumbbell className="h-5 w-5 text-blue-500" />
                    )}
                    <span className="text-sm font-medium">{category.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Stack'}
          </Button>
        </div>
      </form>
    </div>
  )
} 