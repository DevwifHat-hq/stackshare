'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, Pencil, Pill, Plus } from 'lucide-react'
import { useSession } from '@/hooks/use-session'

interface StackItem {
  id: string
  name: string
  description: string
  type?: string
  dosage?: string
  timing?: string
  frequency?: string
}

interface Props {
  stack: {
    id: string
    user_id: string
    stack_items: StackItem[]
  }
}

export function StackItems({ stack }: Props) {
  const { session } = useSession()
  const isOwner = session?.user.id === stack.user_id

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Stack Items</h2>
        {isOwner && (
          <Button asChild variant="outline">
            <Link href={`/dashboard/stacks/${stack.id}/items/new`}>
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Link>
          </Button>
        )}
      </div>
      
      <div className="grid gap-4">
        {stack.stack_items?.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Pill className="h-5 w-5 text-primary" />
                    {item.name}
                  </CardTitle>
                  {item.type && (
                    <CardDescription className="mt-1">
                      Type: {item.type}
                    </CardDescription>
                  )}
                </div>
                {isOwner && (
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/stacks/${stack.id}/items/${item.id}/edit`}>
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>{item.description}</p>
              {(item.dosage || item.timing || item.frequency) && (
                <div className="grid gap-2 text-sm text-muted-foreground">
                  {item.dosage && (
                    <div className="flex items-center gap-2">
                      <Pill className="h-4 w-4" />
                      <span>Dosage: {item.dosage}</span>
                    </div>
                  )}
                  {item.timing && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>Timing: {item.timing}</span>
                    </div>
                  )}
                  {item.frequency && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>Frequency: {item.frequency}</span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {(!stack.stack_items || stack.stack_items.length === 0) && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
              <Pill className="h-8 w-8 mb-4" />
              <p>No items in this stack yet.</p>
              {isOwner && (
                <Button asChild variant="link" className="mt-2">
                  <Link href={`/dashboard/stacks/${stack.id}/items/new`}>
                    Add your first item
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 