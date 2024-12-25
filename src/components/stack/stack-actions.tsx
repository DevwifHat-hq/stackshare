'use client'

import { createClient } from '@/lib/supabase/client'
import { Heart, Bookmark, Share2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from '@/components/ui/use-toast'

interface StackActionsProps {
  stackId: string
  initialLikes: number
  className?: string
}

export function StackActions({ stackId, initialLikes, className = '' }: StackActionsProps) {
  const router = useRouter()
  const [likes, setLikes] = useState(initialLikes)
  const [isLiked, setIsLiked] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function checkUserInteractions() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const [{ data: likes }, { data: saves }] = await Promise.all([
        supabase
          .from('stack_likes')
          .select('id')
          .eq('stack_id', stackId)
          .eq('user_id', session.user.id)
          .single(),
        supabase
          .from('stack_saves')
          .select('id')
          .eq('stack_id', stackId)
          .eq('user_id', session.user.id)
          .single()
      ])

      setIsLiked(!!likes)
      setIsSaved(!!saves)
      setIsLoading(false)
    }

    checkUserInteractions()
  }, [stackId, supabase])

  const handleLike = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/auth/login')
      return
    }

    // Optimistic update
    setIsLiked(prev => !prev)
    setLikes(prev => prev + (isLiked ? -1 : 1))

    const { data, error } = await supabase
      .rpc('toggle_stack_like', { stack_id: stackId })

    if (error) {
      // Revert optimistic update
      setIsLiked(prev => !prev)
      setLikes(prev => prev + (isLiked ? 1 : -1))
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update like"
      })
    } else {
      toast({
        title: data ? "Added to likes" : "Removed from likes",
        description: data ? "Stack has been added to your likes" : "Stack has been removed from your likes"
      })
    }

    router.refresh()
  }, [stackId, isLiked, router, supabase])

  const handleSave = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/auth/login')
      return
    }

    // Optimistic update
    setIsSaved(prev => !prev)

    const { data, error } = await supabase
      .rpc('toggle_stack_save', { stack_id: stackId })

    if (error) {
      // Revert optimistic update
      setIsSaved(prev => !prev)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update save"
      })
    } else {
      toast({
        title: data ? "Added to saved stacks" : "Removed from saved stacks",
        description: data ? "Stack has been saved to your collection" : "Stack has been removed from your saved collection"
      })
    }
  }, [stackId, router, supabase])

  const handleShare = useCallback(async () => {
    try {
      await navigator.share({
        title: 'Check out this stack',
        url: window.location.href
      })
    } catch (error) {
      // Fallback to copying to clipboard
      await navigator.clipboard.writeText(window.location.href)
      toast({
        title: "Link copied",
        description: "Stack link has been copied to your clipboard"
      })
    }
  }, [])

  if (isLoading) {
    return (
      <div className={`flex items-center gap-x-4 text-gray-500 ${className}`}>
        <div className="animate-pulse h-4 w-4 bg-gray-200 rounded" />
        <div className="animate-pulse h-4 w-4 bg-gray-200 rounded" />
        <div className="animate-pulse h-4 w-4 bg-gray-200 rounded" />
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-x-4 text-gray-500 ${className}`}>
      <button
        onClick={handleLike}
        className="flex items-center gap-x-1 transition-colors hover:text-red-500"
      >
        <Heart
          className={`h-4 w-4 ${
            isLiked ? 'fill-red-500 text-red-500' : 'fill-none'
          }`}
        />
        <span>{likes}</span>
      </button>

      <button
        onClick={handleSave}
        className="flex items-center gap-x-1 transition-colors hover:text-primary"
      >
        <Bookmark
          className={`h-4 w-4 ${
            isSaved ? 'fill-primary text-primary' : 'fill-none'
          }`}
        />
      </button>

      <button
        onClick={handleShare}
        className="flex items-center gap-x-1 transition-colors hover:text-primary"
      >
        <Share2 className="h-4 w-4" />
      </button>
    </div>
  )
} 