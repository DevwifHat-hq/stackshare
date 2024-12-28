'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

interface UpdateStackInput {
  name: string
  description: string
  purpose?: string
  is_public: boolean
}

interface CreateLogInput {
  stackId: string
  energy: number
  focus: number
  mood: number
  notes: string
  itemsTaken: {
    item_id: string
    taken: boolean
  }[]
}

export async function fetchStack(stackId: string) {
  const supabase = await createClient()
  
  // Fetch stack with all related data
  const { data: stack, error } = await supabase
    .from('stacks')
    .select(`
      *,
      user_profiles (
        full_name,
        avatar_url
      ),
      stack_categories (
        categories (
          id,
          name,
          slug
        )
      ),
      stack_items (
        id,
        name,
        description,
        type,
        dosage,
        timing,
        frequency
      ),
      stack_stats (
        views,
        likes,
        forks,
        active_users_count,
        daily_active_users_count
      ),
      forked_from:original_stack_id (
        id,
        name,
        user_profiles (
          full_name
        )
      ),
      discussion_count:discussions(count)
    `)
    .eq('id', stackId)
    .single()

  if (error) {
    throw new Error(`Failed to fetch stack: ${error.message}`)
  }

  if (!stack) {
    throw new Error('Stack not found')
  }

  // Try to increment views, but don't fail if the function doesn't exist
  try {
    // Increment views only if we haven't seen this stack before
    const { error: statsError } = await supabase.rpc('increment_stack_views', {
      p_stack_id: stackId
    })

    if (statsError && !statsError.message.includes('could not find the function')) {
      console.error('Error incrementing views:', statsError.message)
    }
  } catch (error) {
    // Silently handle any errors with view tracking
    console.error('Error tracking view:', error)
  }

  return stack
}

export async function updateStack(stackId: string, data: UpdateStackInput) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session?.user?.id) {
    throw new Error('You must be logged in to update a stack')
  }

  // First verify ownership
  const { data: stack, error: fetchError } = await supabase
    .from('stacks')
    .select('user_id')
    .eq('id', stackId)
    .single()

  if (fetchError) {
    console.error('Error fetching stack:', fetchError)
    throw new Error('Failed to verify stack ownership')
  }

  if (stack.user_id !== session.user.id) {
    throw new Error('You can only edit your own stacks')
  }

  // Update the stack
  const { error: updateError } = await supabase
    .from('stacks')
    .update({
      name: data.name,
      description: data.description,
      purpose: data.purpose,
      is_public: data.is_public
    })
    .eq('id', stackId)

  if (updateError) {
    console.error('Error updating stack:', updateError)
    throw new Error('Failed to update stack')
  }

  revalidatePath('/dashboard/stacks/[id]')
  return stackId
}

// Fetch posts for a stack
export async function fetchPosts(stackId: string) {
  const supabase = await createClient()
  
  const { data: posts, error } = await supabase
    .from('stack_posts_with_users')
    .select(`
      *,
      post_likes (
        user_id
      ),
      post_replies:post_replies_with_users (
        *,
        reply_likes (
          user_id
        )
      )
    `)
    .eq('stack_id', stackId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching posts:', error)
    throw error
  }
  return posts
}

// Create a new post
export async function createPost(
  stackId: string,
  content: string,
  rating: number | null = null
) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session?.user?.id) {
    throw new Error('You must be logged in to create a post')
  }

  const now = new Date()
  const created_date = now.toISOString().split('T')[0]
  
  const { error } = await supabase
    .from('stack_posts')
    .insert({
      stack_id: stackId,
      content,
      rating,
      user_id: session.user.id,
      created_date
    })

  if (error) {
    if (error.code === '23505' && error.message?.includes('stack_posts_user_stack_date_review_idx')) {
      throw new Error(
        rating 
          ? 'You have already reviewed this stack today. You can post another review tomorrow.'
          : 'Failed to create post. Please try again.'
      )
    }
    console.error('Error creating post:', error)
    throw new Error('Failed to create post. Please try again.')
  }
  
  revalidatePath(`/dashboard/stacks/${stackId}`)
}

// Create a reply
export async function createPostReply(postId: string, content: string, stackId: string) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session?.user?.id) {
    throw new Error('You must be logged in to reply')
  }

  const { error } = await supabase
    .from('post_replies')
    .insert({
      post_id: postId,
      content,
      user_id: session.user.id
    })

  if (error) throw error
  revalidatePath(`/dashboard/stacks/${stackId}`)
}

// Toggle like on post
export async function togglePostLike(postId: string, stackId: string) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session?.user?.id) {
    throw new Error('You must be logged in to like a post')
  }

  // Check if already liked
  const { data: existingLike } = await supabase
    .from('post_likes')
    .select()
    .eq('post_id', postId)
    .eq('user_id', session.user.id)
    .single()

  if (existingLike) {
    // Unlike
    await supabase
      .from('post_likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', session.user.id)
  } else {
    // Like
    await supabase
      .from('post_likes')
      .insert({
        post_id: postId,
        user_id: session.user.id
      })
  }

  revalidatePath(`/dashboard/stacks/${stackId}`)
}

// Toggle like on reply
export async function toggleReplyLike(replyId: string, stackId: string) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session?.user?.id) {
    throw new Error('You must be logged in to like a reply')
  }

  // Check if already liked
  const { data: existingLike } = await supabase
    .from('reply_likes')
    .select()
    .eq('reply_id', replyId)
    .eq('user_id', session.user.id)
    .single()

  if (existingLike) {
    // Unlike
    await supabase
      .from('reply_likes')
      .delete()
      .eq('reply_id', replyId)
      .eq('user_id', session.user.id)
  } else {
    // Like
    await supabase
      .from('reply_likes')
      .insert({
        reply_id: replyId,
        user_id: session.user.id
      })
  }

  revalidatePath(`/dashboard/stacks/${stackId}`)
}

// Delete post
export async function deletePost(postId: string, stackId: string) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session?.user?.id) {
    throw new Error('You must be logged in to delete a post')
  }

  const { error } = await supabase
    .from('stack_posts')
    .delete()
    .eq('id', postId)
    .eq('user_id', session.user.id)

  if (error) throw error
  revalidatePath(`/dashboard/stacks/${stackId}`)
}

// Delete reply
export async function deletePostReply(replyId: string, stackId: string) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session?.user?.id) {
    throw new Error('You must be logged in to delete a reply')
  }

  const { error } = await supabase
    .from('post_replies')
    .delete()
    .eq('id', replyId)
    .eq('user_id', session.user.id)

  if (error) throw error
  revalidatePath(`/dashboard/stacks/${stackId}`)
}

export async function createLog(input: CreateLogInput) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session?.user?.id) {
    throw new Error('You must be logged in to create a log')
  }

  const now = new Date()
  const created_date = now.toISOString().split('T')[0]
  
  // First check if a log already exists
  const { data: existingLog } = await supabase
    .from('daily_logs')
    .select('id')
    .eq('stack_id', input.stackId)
    .eq('user_id', session.user.id)
    .eq('date', created_date)
    .single()

  if (existingLog) {
    // Update existing log instead of creating a new one
    const { error: updateError } = await supabase
      .from('daily_logs')
      .update({
        energy_level: input.energy,
        focus_level: input.focus,
        mood_level: input.mood,
        notes: input.notes,
        items_taken: input.itemsTaken,
        updated_at: now.toISOString()
      })
      .eq('id', existingLog.id)

    if (updateError) {
      console.error('Error updating log:', updateError)
      throw new Error('Failed to update log. Please try again.')
    }
  } else {
    // Create new log
    const { error: createError } = await supabase
      .from('daily_logs')
      .insert({
        stack_id: input.stackId,
        user_id: session.user.id,
        energy_level: input.energy,
        focus_level: input.focus,
        mood_level: input.mood,
        notes: input.notes,
        items_taken: input.itemsTaken,
        date: created_date
      })

    if (createError) {
      console.error('Error creating log:', createError)
      throw new Error('Failed to create log. Please try again.')
    }
  }
  
  revalidatePath(`/dashboard/stacks/${input.stackId}`)
} 