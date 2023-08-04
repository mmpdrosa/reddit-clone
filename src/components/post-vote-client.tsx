'use client'

import { usePrevious } from '@mantine/hooks'
import { useMutation } from '@tanstack/react-query'
import axios, { AxiosError } from 'axios'
import { useRouter } from 'next/navigation'
import * as React from 'react'

import { cn } from '@/lib/utils'
import { VoteType } from '@prisma/client'
import { Icons } from './icons'
import { Button } from './ui/button'
import { toast } from './ui/use-toast'

interface PostVoteClientProps {
  postId: string
  initialVotesAmount: number
  initialVote?: VoteType | null
}

export function PostVoteClient({
  postId,
  initialVote,
  initialVotesAmount,
}: PostVoteClientProps) {
  const [votesAmount, setVotesAmount] = React.useState(initialVotesAmount)
  const [currentVote, setCurrentVote] = React.useState(initialVote)
  const previousVote = usePrevious(currentVote)
  const router = useRouter()

  React.useEffect(() => {
    setCurrentVote(initialVote)
  }, [initialVote])

  const { mutate: voteMutate } = useMutation({
    mutationFn: async (type: VoteType) => {
      const payload = {
        postId,
        type,
      }

      await axios.patch('/api/subreddits/posts/votes', payload)
    },
    onError: (err, type) => {
      if (type === 'UP') {
        setVotesAmount((prev) => prev - 1)
      } else {
        setVotesAmount((prev) => prev + 1)
      }

      setCurrentVote(previousVote)

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
    onMutate: (type) => {
      if (currentVote === type) {
        setCurrentVote(undefined)

        if (type === 'UP') setVotesAmount((prev) => prev - 1)
        if (type === 'DOWN') setVotesAmount((prev) => prev + 1)
      } else {
        setCurrentVote(type)

        if (type === 'UP')
          setVotesAmount((prev) => prev + (currentVote ? 2 : 1))
        if (type === 'DOWN')
          setVotesAmount((prev) => prev - (currentVote ? 2 : 1))
      }
    },
  })

  return (
    <div className="flex flex-col items-center gap-4 pb-4 pr-6 sm:w-20 sm:gap-0 sm:pb-0">
      <Button
        variant="ghost"
        size="icon"
        aria-label="upvote"
        onClick={() => voteMutate('UP')}
      >
        <Icons.UpVote
          className={cn('h-5 w-5', {
            'fill-emerald-500 text-emerald-500': currentVote === 'UP',
          })}
        />
      </Button>
      <p className="py-2 text-center text-sm font-medium">{votesAmount}</p>
      <Button
        variant="ghost"
        size="icon"
        aria-label="downvote"
        onClick={() => voteMutate('DOWN')}
      >
        <Icons.DownVote
          className={cn('h-5 w-5', {
            'fill-red-500 text-red-500': currentVote === 'DOWN',
          })}
        />
      </Button>
    </div>
  )
}
