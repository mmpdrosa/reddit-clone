import { z } from 'zod'

export const postSchema = z.object({
  title: z.string().min(3).max(128),
  subredditId: z.string(),
  content: z.any(),
})

export const postVoteSchema = z.object({
  postId: z.string(),
  type: z.enum(['UP', 'DOWN']),
})

export const commentSchema = z.object({
  postId: z.string(),
  text: z.string(),
  replyToId: z.string().optional(),
})

export const commentVoteSchema = z.object({
  commentId: z.string(),
  type: z.enum(['UP', 'DOWN']),
})
