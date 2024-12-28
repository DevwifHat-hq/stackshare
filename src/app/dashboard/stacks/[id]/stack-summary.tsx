'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Brain, Users, GitFork, Eye, Activity, Calendar, ThumbsUp, TrendingUp, TrendingDown } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"

interface Props {
  stack: {
    description: string
    purpose?: string
    created_at: string
    is_public: boolean
    user_profiles: {
      full_name: string | null
      avatar_url: string | null
    } | null
    stack_stats: {
      views: number
      likes: number
      forks: number
      active_users_count: number
      daily_active_users_count: number
    } | null
    forked_from?: {
      id: string
      name: string
      user_profiles: {
        full_name: string | null
      } | null
    }
  }
}

export function StackSummary({ stack }: Props) {
  const stats = [
    {
      label: 'Views',
      value: stack.stack_stats?.views || 0,
      icon: Eye,
      tooltip: 'Total number of times this stack has been viewed',
      trend: 'up',
    },
    {
      label: 'Active Users',
      value: stack.stack_stats?.active_users_count || 0,
      icon: Users,
      tooltip: 'Number of users currently using this stack',
      trend: 'up',
    },
    {
      label: 'Daily Active',
      value: stack.stack_stats?.daily_active_users_count || 0,
      icon: Activity,
      tooltip: 'Users who have logged activity in the last 24 hours',
      trend: 'down',
    },
    {
      label: 'Forks',
      value: stack.stack_stats?.forks || 0,
      icon: GitFork,
      tooltip: 'Number of times this stack has been forked',
      trend: 'up',
    },
    {
      label: 'Likes',
      value: stack.stack_stats?.likes || 0,
      icon: ThumbsUp,
      tooltip: 'Number of users who liked this stack',
      trend: 'neutral',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Stack Stats */}
      <TooltipProvider>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {stats.map((stat) => (
            <Tooltip key={stat.label}>
              <TooltipTrigger asChild>
                <Card className="bg-card/50 hover:bg-card/80 transition-colors cursor-help">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between text-muted-foreground mb-2">
                      <div className="flex items-center gap-2">
                        <stat.icon className="h-4 w-4" />
                        <span className="text-sm font-medium">{stat.label}</span>
                      </div>
                      {stat.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
                      {stat.trend === 'down' && <TrendingDown className="h-4 w-4 text-red-500" />}
                    </div>
                    <p className="text-2xl font-bold">{stat.value.toLocaleString()}</p>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent>
                <p>{stat.tooltip}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>

      {/* Stack Info */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Stack Summary */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                <span>Stack Summary</span>
                <Badge variant={stack.is_public ? "default" : "secondary"}>
                  {stack.is_public ? "Public" : "Private"}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Created {formatDistanceToNow(new Date(stack.created_at))} ago</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <p className="text-lg leading-relaxed">{stack.description || 'No description provided.'}</p>
          </CardContent>
        </Card>

        {/* Stack Purpose */}
        {stack.purpose && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Purpose & Goals
              </CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p className="text-lg leading-relaxed">{stack.purpose}</p>
            </CardContent>
          </Card>
        )}

        {/* Forked From */}
        {stack.forked_from && (
          <Card className="md:col-span-2 bg-muted/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-sm">
                <GitFork className="h-4 w-4" />
                <span>Forked from </span>
                <span className="font-medium">{stack.forked_from.name}</span>
                {stack.forked_from.user_profiles?.full_name && (
                  <>
                    <span>by</span>
                    <span className="font-medium">{stack.forked_from.user_profiles.full_name}</span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 