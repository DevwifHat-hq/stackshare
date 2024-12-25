import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Brain, Users, Eye, Heart, Calendar, Dumbbell, Share2, BookmarkPlus, Clock, Pill, Repeat, Timer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'

export const dynamic = 'force-dynamic'

interface Props {
  params: { id: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function StackPage({ params }: Props) {
  // Store the ID in a variable to avoid repeated access
  const stackId = params.id
  const supabase = await createClient()
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  
  if (sessionError) {
    console.error('Session error:', sessionError)
    throw sessionError
  }

  const { data: stack, error: stackError } = await supabase
    .from('stacks')
    .select(`
      *,
      categories (
        id,
        name,
        slug
      ),
      user_profiles (
        full_name,
        avatar_url
      ),
      stack_items (
        id,
        name,
        description,
        dosage,
        timing,
        type,
        frequency
      )
    `)
    .eq('id', stackId)
    .single()

  if (stackError) {
    console.error('Stack fetch error:', stackError)
    throw stackError
  }

  if (!stack) {
    console.log('Stack not found for ID:', stackId)
    notFound()
  }

  // Increment view count if not owner
  if (session?.user.id !== stack.user_id) {
    const { error: viewError } = await supabase
      .from('stacks')
      .update({ views: (stack.views || 0) + 1 })
      .eq('id', stackId)

    if (viewError) {
      console.error('View count update error:', viewError)
    }
  }

  const isOwner = session?.user.id === stack.user_id

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-8">
      {/* Rest of your JSX - replace all params.id with stackId */}
      <div className="relative">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-transparent to-transparent rounded-lg" />
        <div className="relative p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tight">{stack.name}</h1>
                <p className="text-lg text-muted-foreground">{stack.description}</p>
              </div>
              {stack.purpose && (
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="secondary">Purpose</Badge>
                  <span>{stack.purpose}</span>
                </div>
              )}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{stack.user_profiles?.full_name || 'Anonymous'}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(stack.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              {!isOwner ? (
                <>
                  <Button className="w-full md:w-auto">
                    <BookmarkPlus className="h-4 w-4 mr-2" />
                    Save Stack
                  </Button>
                  <Button variant="outline" className="w-full md:w-auto">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </>
              ) : (
                <Button variant="outline" asChild>
                  <Link href={`/dashboard/stacks/${stackId}/edit`}>
                    Edit Stack
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{stack.views || 0}</p>
                <p className="text-xs text-muted-foreground">Views</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{stack.likes || 0}</p>
                <p className="text-xs text-muted-foreground">Likes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Pill className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{stack.stack_items?.length || 0}</p>
                <p className="text-xs text-muted-foreground">Items</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              {stack.categories?.slug === 'cognitive-enhancement' ? (
                <Brain className="h-4 w-4 text-purple-500" />
              ) : (
                <Dumbbell className="h-4 w-4 text-blue-500" />
              )}
              <div>
                <p className="text-sm font-medium truncate">{stack.categories?.name || 'Uncategorized'}</p>
                <p className="text-xs text-muted-foreground">Category</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stack Items */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold tracking-tight">Stack Items</h2>
          {isOwner && (
            <Button asChild>
              <Link href={`/dashboard/stacks/${stackId}/items/new`}>
                Add Item
              </Link>
            </Button>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {stack.stack_items?.map((item) => (
            <Card key={item.id} className="group relative overflow-hidden">
              {isOwner && (
                <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/stacks/${stackId}/items/${item.id}/edit`}>
                      Edit
                    </Link>
                  </Button>
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-xl">{item.name}</CardTitle>
                {item.type && (
                  <Badge variant="secondary" className="w-fit">
                    {item.type}
                  </Badge>
                )}
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Separator />
                <div className="grid gap-2 text-sm">
                  {item.dosage && (
                    <div className="flex items-center gap-2">
                      <Pill className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Dosage:</span>
                      <span>{item.dosage}</span>
                    </div>
                  )}
                  {item.frequency && (
                    <div className="flex items-center gap-2">
                      <Repeat className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Frequency:</span>
                      <span>{item.frequency}</span>
                    </div>
                  )}
                  {item.timing && (
                    <div className="flex items-center gap-2">
                      <Timer className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Timing:</span>
                      <span>{item.timing}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          {(!stack.stack_items || stack.stack_items.length === 0) && (
            <Card className="col-span-full">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Pill className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">No items in this stack yet</p>
                <p className="text-sm text-muted-foreground mb-6">Start building your stack by adding items</p>
                {isOwner && (
                  <Button asChild>
                    <Link href={`/dashboard/stacks/${stackId}/items/new`}>
                      Add your first item
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
} 