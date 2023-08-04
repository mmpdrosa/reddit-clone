import { Comment, Post, PostVote, Subreddit, User } from '@prisma/client'

export type ExtendedPost = Post & {
  subreddit: Subreddit
  votes: PostVote[]
  author: User
  comments: Comment[]
}

export type CachedPost = {
  id: string
  title: string
  authorUsername: string
  content: string
  currentUserVote: PostVote['type'] | null
  createdAt: Date
}
