'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { MessageSquare, Star } from 'lucide-react'
import { RatingSelector } from './rating-selector'
import { useSession } from '@/hooks/use-session'
import { toast } from 'sonner'
import { createPost } from './actions'
import { createClient } from '@/lib/supabase/client'

interface Props {
  stack: {
    id: string
    name: string
  }
  onSuccess: () => void
}

async function checkExistingReview(stackId: string, userId: string) {
  const supabase = createClient()
  const today = new Date().toISOString().split('T')[0]
  
  const { data } = await supabase
    .from('stack_posts')
    .select('id')
    .eq('stack_id', stackId)
    .eq('user_id', userId)
    .eq('created_date', today)
    .not('rating', 'is', null)
    .single()

  return !!data
}

export function CreatePostDialog({ stack, onSuccess }: Props) {
  const { session } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const [isReview, setIsReview] = useState(false)
  const [content, setContent] = useState('')
  const [rating, setRating] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hasReviewedToday, setHasReviewedToday] = useState(false)

  useEffect(() => {
    if (isOpen && isReview && session?.user?.id) {
      checkExistingReview(stack.id, session.user.id).then(exists => {
        setHasReviewedToday(exists)
        if (exists) {
          setIsReview(false)
          toast.error('You have already reviewed this stack today. You can post another review tomorrow.')
        }
      })
    }
  }, [isOpen, isReview, session?.user?.id, stack.id])

  const handleSubmit = async () => {
    if (!content.trim() || (isReview && !rating)) return
    if (!session?.user?.id) {
      toast.error('You must be logged in to post')
      return
    }
    
    if (isReview) {
      const hasReviewed = await checkExistingReview(stack.id, session.user.id)
      if (hasReviewed) {
        toast.error('You have already reviewed this stack today. You can post another review tomorrow.')
        setIsReview(false)
        return
      }
    }
    
    setIsLoading(true)
    try {
      await createPost(stack.id, content.trim(), isReview ? rating : null)
      setContent('')
      setRating(null)
      setIsOpen(false)
      onSuccess()
      toast.success(isReview ? 'Review posted successfully' : 'Discussion started successfully')
    } catch (error: any) {
      console.error('Failed to create post:', error)
      toast.error(error?.message || 'Failed to post')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <div className="flex items-center gap-4">
        <DialogTrigger asChild>
          <Button variant="outline" onClick={() => setIsReview(false)}>
            <MessageSquare className="h-4 w-4 mr-2" />
            Start Discussion
          </Button>
        </DialogTrigger>
        <DialogTrigger asChild>
          <Button 
            onClick={() => setIsReview(true)}
            disabled={hasReviewedToday}
            title={hasReviewedToday ? "You can post another review tomorrow" : undefined}
          >
            <Star className="h-4 w-4 mr-2" />
            Write Review
            {hasReviewedToday && <span className="ml-2 text-xs">(Tomorrow)</span>}
          </Button>
        </DialogTrigger>
      </div>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isReview ? 'Write a Review' : 'Start a Discussion'}
          </DialogTitle>
          <DialogDescription>
            {isReview
              ? 'Share your experience with this stack'
              : 'Start a discussion about this stack'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isReview && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Rating</label>
              <RatingSelector value={rating} onChange={setRating} />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">
              {isReview ? 'Review' : 'Message'}
            </label>
            <Textarea
              placeholder={
                isReview
                  ? 'Write your review...'
                  : 'Start the discussion...'
              }
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
            />
          </div>

          <div className="flex justify-end gap-4">
            <Button
              variant="outline"
              onClick={() => {
                setContent('')
                setRating(null)
                setIsOpen(false)
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!content.trim() || (isReview && !rating) || isLoading}
            >
              {isLoading ? 'Posting...' : 'Post'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 