'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

interface StackLinkBadgeProps {
  stackId: string
  stackName: string
}

export function StackLinkBadge({ stackId, stackName }: StackLinkBadgeProps) {
  return (
    <Link href={`/dashboard/stacks/${stackId}`}>
      <Badge 
        variant="secondary"
        className="hover:bg-secondary/80 cursor-pointer transition-colors"
      >
        {stackName}
      </Badge>
    </Link>
  )
} 