'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Brain, Beaker, Clock, Calendar } from 'lucide-react'

interface StackItem {
  id: string
  name: string
  type: string
  dosage?: string
  timing?: string
  frequency?: string
  description?: string
}

interface Category {
  id: string
  name: string
  slug: string
}

interface Props {
  stack: {
    id: string
    name: string
    description: string
    purpose?: string
    created_at: string
    stack_items: StackItem[]
    stack_categories: {
      category_id: string
      category: Category
    }[]
  }
}

export function StackOverview({ stack }: Props) {
  const categories = stack.stack_categories.map(sc => sc.category)
  const createdDate = new Date(stack.created_at).toLocaleDateString()

  return (
    <div className="space-y-6">
      {/* Purpose & Categories */}
      <Card>
        <CardHeader>
          <CardTitle>About this Stack</CardTitle>
          <CardDescription>Purpose and key information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {stack.purpose && (
            <div className="space-y-2">
              <h3 className="font-medium">Purpose</h3>
              <p className="text-sm text-muted-foreground">{stack.purpose}</p>
            </div>
          )}

          <div className="space-y-2">
            <h3 className="font-medium">Categories</h3>
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <Badge key={category.id} variant="secondary">
                  {category.name}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            Created on {createdDate}
          </div>
        </CardContent>
      </Card>

      {/* Stack Items */}
      <Card>
        <CardHeader>
          <CardTitle>Stack Items</CardTitle>
          <CardDescription>Supplements and compounds in this stack</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {stack.stack_items.map(item => (
              <div key={item.id} className="space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium">{item.name}</h3>
                    {item.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {item.description}
                      </p>
                    )}
                  </div>
                  <Badge variant="outline">{item.type}</Badge>
                </div>
                
                <div className="flex gap-4 text-sm text-muted-foreground">
                  {item.dosage && (
                    <div className="flex items-center gap-1">
                      <Beaker className="h-4 w-4" />
                      {item.dosage}
                    </div>
                  )}
                  {item.timing && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {item.timing}
                    </div>
                  )}
                  {item.frequency && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {item.frequency}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 