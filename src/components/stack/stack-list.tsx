import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { GitFork, Heart, Eye, Users } from 'lucide-react'

interface Stack {
  id: string
  name: string
  description: string
  created_at: string
  user_id: string
  views: number
  likes: number
  is_public: boolean
  original_stack_id?: string
  original_author?: string
  fork_count?: number
  user_profiles: {
    full_name: string
    avatar_url: string | null
  }
  stack_categories: Array<{
    categories: {
      id: string
      name: string
      slug: string
    } | null
  }>
}

interface StackNode extends Stack {
  forks?: StackNode[]
}

interface StackListProps {
  stacks: Stack[]
}

function organizeStacks(stacks: Stack[]): StackNode[] {
  const stackMap = new Map<string, StackNode>()
  const rootStacks: StackNode[] = []

  // First pass: Create all nodes and store them in the map
  stacks.forEach(stack => {
    stackMap.set(stack.id, { ...stack, forks: [] })
  })

  // Second pass: Organize into tree structure
  stacks.forEach(stack => {
    const node = stackMap.get(stack.id)!
    if (stack.original_stack_id && stackMap.has(stack.original_stack_id)) {
      // This is a fork, add it to its parent's forks array
      const parent = stackMap.get(stack.original_stack_id)!
      parent.forks = parent.forks || []
      parent.forks.push(node)
    } else {
      // This is a root stack
      rootStacks.push(node)
    }
  })

  return rootStacks
}

function StackCard({ stack, level = 0 }: { stack: StackNode; level?: number }) {
  return (
    <div style={{ marginLeft: `${level * 2}rem` }}>
      <Card className={level > 0 ? 'border-l-4 border-l-primary/20' : ''}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle>
                <Link 
                  href={`/dashboard/stacks/${stack.id}`}
                  className="hover:text-primary transition-colors"
                >
                  {stack.name}
                </Link>
              </CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Avatar className="h-5 w-5">
                  <AvatarImage src={stack.user_profiles?.avatar_url || ''} />
                  <AvatarFallback>
                    {stack.user_profiles?.full_name?.split(' ').map(n => n[0]).join('') || '?'}
                  </AvatarFallback>
                </Avatar>
                <span>{stack.user_profiles?.full_name || 'Anonymous'}</span>
                {stack.original_stack_id && (
                  <>
                    <GitFork className="h-4 w-4" />
                    <span>forked from {stack.original_author}</span>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" className="gap-1">
                <Eye className="h-4 w-4" />
                <span>{stack.views}</span>
              </Button>
              <Button variant="ghost" size="sm" className="gap-1">
                <Heart className="h-4 w-4" />
                <span>{stack.likes}</span>
              </Button>
              {(stack.fork_count ?? 0) > 0 && (
                <Button variant="ghost" size="sm" className="gap-1">
                  <GitFork className="h-4 w-4" />
                  <span>{stack.fork_count}</span>
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <CardDescription>{stack.description}</CardDescription>
          <div className="mt-4 flex flex-wrap gap-2">
            {stack.stack_categories.map(({ categories }) => (
              categories && (
                <Badge key={categories.id} variant="outline">
                  {categories.name}
                </Badge>
              )
            ))}
          </div>
        </CardContent>
      </Card>
      {stack.forks && stack.forks.length > 0 && (
        <div className="mt-4 space-y-4">
          {stack.forks.map(fork => (
            <StackCard key={fork.id} stack={fork} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

export function StackList({ stacks }: StackListProps) {
  const organizedStacks = organizeStacks(stacks)
  
  return (
    <div className="space-y-4">
      {organizedStacks.map(stack => (
        <StackCard key={stack.id} stack={stack} />
      ))}
    </div>
  )
} 