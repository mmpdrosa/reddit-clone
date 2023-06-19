'use client'

import { useMutation } from '@tanstack/react-query'
import axios, { AxiosError } from 'axios'
import { useRouter } from 'next/navigation'
import * as React from 'react'

import { Icons } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { toast } from '@/components/ui/use-toast'

export default function CreateSubredditPage() {
  const [subreddit, setSubreddit] = React.useState('')
  const router = useRouter()

  const { mutate: createSubredditMutate, isLoading } = useMutation({
    mutationFn: async () => {
      const payload = {
        name: subreddit,
      }

      const response = await axios.post('/api/subreddits', payload)

      const data: string = await response.data

      return data
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 403) {
          router.push('/login')
        }

        if (err.response?.status === 409) {
          return toast({
            title: 'Subreddit already exists.',
            description: 'Please choose a different subreddit name.',
            variant: 'destructive',
          })
        }

        if (err.response?.status === 422) {
          return toast({
            title: 'Invalid subreddit name.',
            description: 'Please choose a name between 3 and 21 characters.',
            variant: 'destructive',
          })
        }
      }

      return toast({
        title: 'Uh oh! Something went wrong.',
        description: 'There was a problem with your request.',
        variant: 'destructive',
      })
    },
    onSuccess: (subreddit) => {
      router.push(`/r/${subreddit}`)
    },
  })

  return (
    <div className="container mx-auto flex h-full max-w-3xl items-center py-10">
      <div className="relative h-fit w-full space-y-6 rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Create a community</h1>
        </div>

        <Separator />

        <div className="grid items-center gap-1.5">
          <Label htmlFor="subreddit">Email</Label>

          <div className="relative">
            <p className="absolute inset-y-0 left-0 grid w-8 place-items-center text-sm">
              r/
            </p>
            <Input
              id="subreddit"
              className="pl-6"
              value={subreddit}
              onChange={(e) => setSubreddit(e.target.value)}
            />
          </div>

          <p className="text-sm text-muted-foreground">
            Community names including capitalization cannot be changed.
          </p>
        </div>

        <div className="flex justify-end gap-4">
          <Button variant="secondary" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button
            disabled={isLoading || subreddit.length === 0}
            onClick={() => createSubredditMutate()}
          >
            {isLoading && (
              <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            Create Community
          </Button>
        </div>
      </div>
    </div>
  )
}
