'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Brain, Zap, Shield, Moon, Smile, Dumbbell, Heart, AlertCircle } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/use-toast'
import MDEditor from '@uiw/react-md-editor'
import { cn } from '@/lib/utils'

const CATEGORIES = [
  {
    id: '2b2830ea-e9b5-4c06-8a0e-39b2aae08ba9',
    slug: 'cognitive-enhancement',
    name: 'Cognitive Enhancement',
    description: 'Improve focus, memory, and mental clarity',
    icon: Brain,
    color: 'bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:hover:bg-purple-900/30'
  },
  {
    id: '83cc4c04-6f8d-4ecc-84d3-c2f583070bc6',
    slug: 'energy-vitality',
    name: 'Energy & Vitality',
    description: 'Boost energy levels and overall vitality',
    icon: Zap,
    color: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:hover:bg-yellow-900/30'
  },
  {
    id: '88a98798-3377-4af7-a54c-812ba35a760b',
    slug: 'immune-support',
    name: 'Immune Support',
    description: 'Strengthen immune system and resilience',
    icon: Shield,
    color: 'bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:hover:bg-blue-900/30'
  },
  {
    id: '8c632cf3-ba39-4155-b26b-43b4a04403e9',
    slug: 'sleep-optimization',
    name: 'Sleep Optimization',
    description: 'Improve sleep quality and recovery',
    icon: Moon,
    color: 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-300 dark:hover:bg-indigo-900/30'
  },
  {
    id: '6590fa94-469f-411d-bcd6-eaa169769e27',
    slug: 'mood-enhancement',
    name: 'Mood Enhancement',
    description: 'Support emotional wellbeing and mental health',
    icon: Smile,
    color: 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-300 dark:hover:bg-green-900/30'
  },
  {
    id: '86c01456-55b0-4606-8651-26d1f0eb9820',
    slug: 'physical-performance',
    name: 'Physical Performance',
    description: 'Enhance athletic performance and recovery',
    icon: Dumbbell,
    color: 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-300 dark:hover:bg-red-900/30'
  },
  {
    id: '05a1eed1-f609-476a-ae86-ec4b9466f01e',
    slug: 'longevity',
    name: 'Longevity',
    description: 'Support healthy aging and longevity',
    icon: Heart,
    color: 'bg-pink-100 text-pink-800 hover:bg-pink-200 dark:bg-pink-900/20 dark:text-pink-300 dark:hover:bg-pink-900/30'
  },
  {
    id: 'cd38c77a-5a13-478e-913e-c7db7a2ac3d9',
    slug: 'stress-management',
    name: 'Stress Management',
    description: 'Reduce stress and improve resilience',
    icon: AlertCircle,
    color: 'bg-orange-100 text-orange-800 hover:bg-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:hover:bg-orange-900/30'
  }
]

export default function CreateStackPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    purpose: '',
    is_public: true
  })

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId)
      }
      if (prev.length >= 3) {
        toast({
          title: "Category limit reached",
          description: "You can select up to 3 categories",
          variant: "destructive"
        })
        return prev
      }
      return [...prev, categoryId]
    })
  }

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Name required",
        description: "Please give your stack a name",
        variant: "destructive"
      })
      return
    }

    if (selectedCategories.length === 0) {
      toast({
        title: "Category required",
        description: "Please select at least one category",
        variant: "destructive"
      })
      return
    }

    // Validate that we have valid UUIDs
    const selectedCategoryObjects = selectedCategories
      .map(id => CATEGORIES.find(c => c.id === id))
      .filter((c): c is typeof CATEGORIES[0] => c !== undefined)

    if (selectedCategoryObjects.length !== selectedCategories.length) {
      toast({
        title: "Invalid categories",
        description: "Some selected categories are invalid",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    const supabase = createClient()

    try {
      // Get the current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to create a stack",
          variant: "destructive"
        })
        router.push('/auth/signin')
        return
      }

      // Create the stack with user_id
      const { data: stack, error: stackError } = await supabase
        .from('stacks')
        .insert({
          name: formData.name,
          description: formData.description,
          purpose: formData.purpose,
          is_public: formData.is_public,
          user_id: session.user.id
        })
        .select()
        .single()

      if (stackError) {
        console.error('Stack creation error:', stackError)
        throw stackError
      }

      if (!stack) {
        throw new Error('No stack returned after creation')
      }

      // Create category relationships with better error handling
      const categoryPromises = selectedCategoryObjects.map(async category => {
        console.log('Associating category:', category.name, 'with ID:', category.id)
        const { error } = await supabase
          .from('stack_categories')
          .insert({
            stack_id: stack.id,
            category_id: category.id
          })
        
        if (error) {
          console.error(`Error associating category ${category.name}:`, error.message, error.details, error.hint)
          return { error }
        }
        console.log('Successfully associated category:', category.name)
        return { success: true }
      })

      const categoryResults = await Promise.all(categoryPromises)
      const categoryErrors = categoryResults.filter(result => 'error' in result)
      
      if (categoryErrors.length > 0) {
        console.error('Category association errors:', JSON.stringify(categoryErrors, null, 2))
        throw new Error(`Failed to associate categories: ${categoryErrors.map(e => e.error?.message || 'Unknown error').join(', ')}`)
      }

      router.push(`/dashboard/stacks/${stack.id}`)
      toast({
        title: "Stack created",
        description: "Your stack has been created successfully"
      })
    } catch (error) {
      console.error('Error creating stack:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "There was an error creating your stack",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create New Stack</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Share your biohacking stack with the community
        </p>
      </div>

      <Tabs defaultValue="details" className="space-y-6">
        <TabsList>
          <TabsTrigger value="details">Stack Details</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Provide the essential details about your stack
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Give your stack a name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <div data-color-mode="light">
                  <MDEditor
                    value={formData.description}
                    onChange={(value) => setFormData({ ...formData, description: value || '' })}
                    preview="edit"
                    height={200}
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Supports markdown formatting for rich text
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="purpose">Purpose (optional)</Label>
                <div data-color-mode="light">
                  <MDEditor
                    value={formData.purpose}
                    onChange={(value) => setFormData({ ...formData, purpose: value || '' })}
                    preview="edit"
                    height={150}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="public"
                  checked={formData.is_public}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_public: checked })}
                />
                <Label htmlFor="public">Make this stack public</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
              <CardDescription>
                Select up to 3 categories that best describe your stack
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {CATEGORIES.map((category) => {
                  const Icon = category.icon
                  const isSelected = selectedCategories.includes(category.id)
                  return (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryToggle(category.id)}
                      className={cn(
                        "flex items-start gap-4 p-4 rounded-lg text-left transition-colors",
                        category.color,
                        isSelected && "ring-2 ring-primary"
                      )}
                    >
                      <Icon className="h-5 w-5 mt-0.5" />
                      <div>
                        <h3 className="font-medium">{category.name}</h3>
                        <p className="text-sm opacity-90">{category.description}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>
                Preview how your stack will appear to others
              </CardDescription>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <h2 className="text-2xl font-bold">{formData.name || 'Untitled Stack'}</h2>
              <div className="flex flex-wrap gap-2 my-4">
                {selectedCategories.map(categoryId => {
                  const category = CATEGORIES.find(c => c.id === categoryId)
                  if (!category) return null
                  const Icon = category.icon
                  return (
                    <div
                      key={categoryId}
                      className={cn(
                        "inline-flex items-center gap-1 px-2 py-1 rounded-md text-sm",
                        category.color
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {category.name}
                    </div>
                  )
                })}
              </div>
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <MDEditor.Markdown source={formData.description || '*No description provided*'} />
              </div>
              {formData.purpose && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-2">Purpose</h3>
                  <MDEditor.Markdown source={formData.purpose} />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-4">
        <Button
          variant="outline"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Stack'}
        </Button>
      </div>
    </div>
  )
} 