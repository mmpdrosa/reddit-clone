'use client'

import { useMutation } from '@tanstack/react-query'
import axios, { AxiosError } from 'axios'
import { formatRelative } from 'date-fns'
import { Session } from 'next-auth'
import { useRouter } from 'next/navigation'
import * as React from 'react'
import { z } from 'zod'

import { commentSchema } from '@/validations/post'
import { Comment, CommentVote, User, VoteType } from '@prisma/client'
import { CommentVotes } from './comment-votes'
import { Icons } from './icons'
import { Button } from './ui/button'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { toast } from './ui/use-toast'
import { UserAvatar } from './user-avatar'

type ExtendedComment = Comment & {
  votes: CommentVote[]
  author: User
}
type CreateCommentRequest = z.infer<typeof commentSchema>

interface PostCommentProps {
  postId: string
  comment: ExtendedComment
  votesAmount: number
  currentVote?: VoteType
  user?: Session['user']
}

export function PostComment({
  postId,
  comment,
  votesAmount,
  currentVote,
  user,
}: PostCommentProps) {
  const commentRef = React.useRef<HTMLDivElement>(null)
  const [isReplying, setIsReplying] = React.useState(false)
  const [input, setInput] = React.useState('')
  const router = useRouter()

  const { mutate: createComment, isLoading } = useMutation({
    mutationFn: async ({ postId, text, replyToId }: CreateCommentRequest) => {
      const payload = {
        postId,
        text,
        replyToId,
      }

      const response = await axios.patch(
        `/api/subreddits/posts/comments`,
        payload,
      )

      const data = response.data
      return data
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 403) {
          return router.push('/login')
        }
      }

      return toast({
        title: 'Uh oh! Something went wrong.',
        description: 'There was a problem with your request.',
        variant: 'destructive',
      })
    },
    onSuccess: () => {
      router.refresh()
      setInput('')
      setIsReplying(false)
    },
  })

  return (
    <div className="flex flex-col" ref={commentRef}>
      <div className="flex items-center">
        <UserAvatar
          user={{
            name: comment.author.username || null,
            image: comment.author.image || null,
          }}
        />

        <div className="ml-2 flex items-center gap-x-2">
          <p className="text-sm font-medium">u/{comment.author.username}</p>
          <p className="max-h-40 truncate text-xs">
            {formatRelative(new Date(comment.createdAt), new Date())}
          </p>
        </div>
      </div>

      <p className="mt-2 text-sm">{comment.text}</p>

      <div className="flex flex-wrap items-center gap-2">
        <CommentVotes
          commentId={comment.id}
          initialVotesAmount={votesAmount}
          initialVote={currentVote}
        />

        <Button
          variant="ghost"
          size="sm"
          aria-label="reply"
          onClick={() => {
            if (!user) {
              return router.push('/login')
            }

            setIsReplying(true)
          }}
        >
          <Icons.Message className="mr-2 h-4 w-4" />
          Reply
        </Button>

        {isReplying && (
          <div className="grid w-full gap-1.5">
            <Label htmlFor="comment">Your comment</Label>
            <div className="mt-2">
              <Textarea
                id="comment"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={1}
                placeholder="What are your thoughts?"
              />

              <div className="mt-2 flex justify-end gap-2">
                <Button tabIndex={-1} onClick={() => setIsReplying(false)}>
                  Cancel
                </Button>
                <Button
                  disabled={isLoading || input.length === 0}
                  onClick={() =>
                    createComment({
                      postId,
                      text: input,
                      replyToId: comment.replyToId ?? comment.id,
                    })
                  }
                >
                  {isLoading && (
                    <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Post
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
