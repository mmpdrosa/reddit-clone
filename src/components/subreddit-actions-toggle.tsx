'use client'

import { useMutation } from '@tanstack/react-query'
import axios, { AxiosError } from 'axios'
import { useRouter } from 'next/navigation'
import * as React from 'react'

import { Button } from './ui/button'
import { toast } from './ui/use-toast'
import { Icons } from './icons'

interface SubredditActionsToggleProps {
  subredditId: string
  isUserSubscribed: boolean
}

export function SubredditActionsToggle({
  subredditId,
  isUserSubscribed,
}: SubredditActionsToggleProps) {
  const router = useRouter()

  const { mutate: subscribeUserMutate, isLoading: isSubscribingLoading } =
    useMutation({
      mutationFn: async () => {
        const payload = {
          subredditId,
        }

        const response = await axios.post('/api/subreddits/subscribe', payload)

        const data: string = response.data

        return data
      },
      onError: (err) => {
        if (err instanceof AxiosError) {
          if (err.response?.status === 403) {
            router.push('/login')
          }
        }

        return toast({
          title: 'Uh oh! Something went wrong.',
          description: 'There was a problem with your request.',
          variant: 'destructive',
        })
      },
      onSuccess: () => {
        React.startTransition(() => {
          router.refresh()
        })

        return toast({
          description: `You has subscribed successfully.`,
        })
      },
    })

  const { mutate: unsubscribeUserMutate, isLoading: isUnsubscribingLoading } =
    useMutation({
      mutationFn: async () => {
        const payload = {
          subredditId,
        }

        const response = await axios.post(
          '/api/subreddits/unsubscribe',
          payload,
        )

        const data: string = response.data

        return data
      },
      onError: (err) => {
        if (err instanceof AxiosError) {
          if (err.response?.status === 403) {
            router.push('/login')
          }
        }

        return toast({
          title: 'Uh oh! Something went wrong.',
          description: 'There was a problem with your request.',
          variant: 'destructive',
        })
      },
      onSuccess: () => {
        React.startTransition(() => {
          router.refresh()
        })

        return toast({
          description: `You has unsubscribed successfully.`,
        })
      },
    })

  return isUserSubscribed ? (
    <Button
      disabled={isUnsubscribingLoading}
      onClick={() => unsubscribeUserMutate()}
    >
      {isUnsubscribingLoading && (
        <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" />
      )}{' '}
      Leave community
    </Button>
  ) : (
    <Button
      disabled={isSubscribingLoading}
      onClick={() => subscribeUserMutate()}
    >
      {isSubscribingLoading && (
        <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" />
      )}{' '}
      Join community
    </Button>
  )
}
