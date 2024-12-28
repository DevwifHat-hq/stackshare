interface StackItem {
  id: string
  name: string
  type: string
  dosage?: string
  timing?: string
  frequency?: string
}

interface Stack {
  id: string
  name: string
  description: string
  created_at: string
  stack_items: StackItem[]
  stack_categories: {
    category_id: string
    category: {
      id: string
      name: string
      slug: string
    }
  }[]
  daily_logs: {
    created_at: string
  }[]
}

interface EnhancedStack extends Stack {
  relevanceScore: number
  category: string
}

// Calculate a relevance score based on various factors
export function calculateRelevanceScore(stack: Stack): number {
  const now = new Date()
  let score = 0

  // Usage frequency boost (last 30 days)
  const recentLogs = stack.daily_logs?.filter(log => {
    const logDate = new Date(log.created_at)
    const daysSinceLog = (now.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24)
    return daysSinceLog <= 30
  }).length || 0
  score += recentLogs * 5

  // Completeness boost (filled out description, items, etc.)
  if (stack.description?.length > 50) score += 5
  if (stack.stack_items?.length > 0) score += 5
  if (stack.stack_categories?.length > 0) score += 5

  return score
}

// Get the primary category label for a stack
export function getCategoryLabel(stack: Stack): string {
  // Get all category names
  const categories = stack.stack_categories?.map(sc => 
    sc.category.name
  ) || []

  // Priority categories (order matters)
  const priorityCategories = [
    'Sleep',
    'Focus',
    'Energy',
    'Recovery',
    'Longevity',
    'Mood',
    'Stress',
    'Gut Health'
  ]

  // Find the first matching priority category
  const primaryCategory = priorityCategories.find(pc => 
    categories.some(c => c.toLowerCase().includes(pc.toLowerCase()))
  )

  // If no priority category matches, use the first category or 'Other'
  return primaryCategory || categories[0] || 'Other'
}

// Sort stacks by relevance and group by category
export function organizeStacks(stacks: Stack[]): Record<string, EnhancedStack[]> {
  const enhancedStacks = stacks.map(stack => ({
    ...stack,
    relevanceScore: calculateRelevanceScore(stack),
    category: getCategoryLabel(stack)
  }))
  .sort((a, b) => b.relevanceScore - a.relevanceScore)

  // Group by category
  return enhancedStacks.reduce((acc, stack) => {
    const category = stack.category
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(stack)
    return acc
  }, {} as Record<string, EnhancedStack[]>)
} 