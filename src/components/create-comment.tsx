'use client'

import { useMutation } from '@tanstack/react-query'
import axios, { AxiosError } from 'axios'
import { useRouter } from 'next/navigation'
import * as React from 'react'
import { z } from 'zod'

import { commentSchema } from '@/validations/post'
import { Button } from './ui/button'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { toast } from './ui/use-toast'
import { Icons } from './icons'

type CreateCommentRequest = z.infer<typeof commentSchema>

interface CreateCommentProps {
  postId: string
  replyToId?: string
}

export function CreateComment({ postId, replyToId }: CreateCommentProps) {
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
    },
  })

  return (
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

        <div className="mt-2 flex justify-end">
          <Button
            disabled={isLoading || input.length === 0}
            onClick={() => createComment({ postId, text: input, replyToId })}
          >
            {isLoading && (
              <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            Post
          </Button>
        </div>
      </div>
    </div>
  )
}
