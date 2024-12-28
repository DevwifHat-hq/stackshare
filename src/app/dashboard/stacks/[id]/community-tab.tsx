'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { MessageSquare, ThumbsUp, Star, Reply, MoreHorizontal } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useSession } from '@/hooks/use-session'
import { toast } from 'sonner'
import { CreatePostDialog } from './create-post-dialog'
import {
  fetchPosts,
  createPostReply,
  togglePostLike,
  toggleReplyLike,
  deletePost,
  deletePostReply,
} from './actions'

interface Post {
  id: string
  stack_id: string
  user_id: string
  content: string
  rating?: number | null
  created_at: string
  created_date: string
  users: {
    id: string
    full_name: string
    avatar_url?: string
  }
  post_likes: { user_id: string }[]
  post_replies: {
    id: string
    user_id: string
    content: string
    created_at: string
    users: {
      id: string
      full_name: string
      avatar_url?: string
    }
    reply_likes: { user_id: string }[]
  }[]
}

interface Props {
  stack: {
    id: string
    name: string
    user_id: string
  }
}

function formatDateTime(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

export function StackCommunity({ stack }: Props) {
  const { session } = useSession()
  const [posts, setPosts] = useState<Post[]>([])
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadPosts()
  }, [])

  const loadPosts = async () => {
    try {
      const data = await fetchPosts(stack.id)
      setPosts(data)
    } catch (error) {
      console.error('Failed to load posts:', error)
      toast.error('Failed to load community posts')
    }
  }

  const handleReply = async (postId: string) => {
    if (!replyContent.trim()) return
    
    setIsLoading(true)
    try {
      await createPostReply(postId, replyContent, stack.id)
      setReplyContent('')
      setReplyingTo(null)
      await loadPosts()
      toast.success('Reply posted successfully')
    } catch (error) {
      console.error('Failed to post reply:', error)
      toast.error('Failed to post reply')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLike = async (postId: string, isReply: boolean = false) => {
    try {
      if (isReply) {
        await toggleReplyLike(postId, stack.id)
      } else {
        await togglePostLike(postId, stack.id)
      }
      await loadPosts()
    } catch (error) {
      console.error('Failed to toggle like:', error)
      toast.error('Failed to update like')
    }
  }

  const handleDelete = async (id: string, isReply: boolean = false) => {
    try {
      if (isReply) {
        await deletePostReply(id, stack.id)
      } else {
        await deletePost(id, stack.id)
      }
      await loadPosts()
      toast.success(isReply ? 'Reply deleted' : 'Post deleted')
    } catch (error) {
      console.error('Failed to delete:', error)
      toast.error('Failed to delete')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold">Community</h2>
          <p className="text-muted-foreground">
            Share your experience and discuss with others
          </p>
        </div>
        <CreatePostDialog stack={stack} onSuccess={loadPosts} />
      </div>

      {/* Posts List */}
      <div className="space-y-6">
        {posts.map(post => (
          <Card key={post.id}>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={post.users.avatar_url} />
                      <AvatarFallback>
                        {post.users.full_name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium">{post.users.full_name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {formatDateTime(post.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {typeof post.rating === 'number' && post.rating !== null && (
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < post.rating!
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {session?.user.id === post.user_id && (
                          <DropdownMenuItem onClick={() => handleDelete(post.id)}>
                            Delete
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem>Report</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground">{post.content}</p>

                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2"
                    onClick={() => handleLike(post.id)}
                  >
                    <ThumbsUp className={`h-4 w-4 ${
                      post.post_likes.some(like => like.user_id === session?.user.id)
                        ? 'fill-current'
                        : ''
                    }`} />
                    {post.post_likes.length}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2"
                    onClick={() => setReplyingTo(post.id)}
                  >
                    <Reply className="h-4 w-4" />
                    Reply
                  </Button>
                </div>

                {/* Reply Input */}
                {replyingTo === post.id && session && (
                  <div className="mt-4">
                    <Textarea
                      placeholder="Write a reply..."
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      className="mb-2"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleReply(post.id)}
                        disabled={!replyContent.trim() || isLoading}
                      >
                        Post Reply
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setReplyingTo(null)
                          setReplyContent('')
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {/* Replies */}
                {post.post_replies?.length > 0 && (
                  <div className="ml-12 space-y-4">
                    {post.post_replies.map(reply => (
                      <div key={reply.id} className="space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={reply.users.avatar_url} />
                              <AvatarFallback>
                                {reply.users.full_name.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="text-sm font-medium">{reply.users.full_name}</h4>
                              <p className="text-xs text-muted-foreground">
                                {formatDateTime(reply.created_at)}
                              </p>
                            </div>
                          </div>
                          {session?.user.id === reply.user_id && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(reply.id, true)}
                            >
                              Delete
                            </Button>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{reply.content}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-2"
                          onClick={() => handleLike(reply.id, true)}
                        >
                          <ThumbsUp className={`h-4 w-4 ${
                            reply.reply_likes.some(like => like.user_id === session?.user.id)
                              ? 'fill-current'
                              : ''
                          }`} />
                          {reply.reply_likes.length}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {!posts.length && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <h3 className="font-semibold text-lg">No Posts Yet</h3>
                <p className="text-muted-foreground">
                  Be the first to share your thoughts about this stack
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 