'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Loader2 } from 'lucide-react'
import { fetchStack, updateStack } from '../actions'

export default function EditStackPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params)
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [isSaving, setIsSaving] = React.useState(false)
  const [formData, setFormData] = React.useState({
    name: '',
    description: '',
    purpose: '',
    is_public: false
  })

  React.useEffect(() => {
    async function loadStack() {
      try {
        const stackData = await fetchStack(resolvedParams.id)
        setFormData({
          name: stackData.name,
          description: stackData.description,
          purpose: stackData.purpose || '',
          is_public: stackData.is_public
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load stack')
      } finally {
        setIsLoading(false)
      }
    }

    loadStack()
  }, [resolvedParams.id])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!formData.name || !formData.description) {
      toast.error('Name and description are required')
      return
    }

    try {
      setIsSaving(true)
      await updateStack(resolvedParams.id, formData)
      toast.success('Stack updated successfully!')
      router.push(`/dashboard/stacks/${resolvedParams.id}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update stack')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <p className="text-lg text-destructive">{error}</p>
        <Button variant="outline" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <Card>
        <CardHeader>
          <CardTitle>Edit Stack</CardTitle>
          <CardDescription>Update your stack details</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="purpose">Purpose (Optional)</Label>
              <Textarea
                id="purpose"
                value={formData.purpose}
                onChange={e => setFormData(prev => ({ ...prev, purpose: e.target.value }))}
              />
              <p className="text-sm text-muted-foreground">
                Explain the purpose or goal of this stack
              </p>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="public">Public Stack</Label>
                <p className="text-sm text-muted-foreground">
                  Make this stack visible to everyone
                </p>
              </div>
              <Switch
                id="public"
                checked={formData.is_public}
                onCheckedChange={checked => setFormData(prev => ({ ...prev, is_public: checked }))}
              />
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 