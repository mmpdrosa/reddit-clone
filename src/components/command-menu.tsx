'use client'

import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import * as React from 'react'

import { Prisma, Subreddit } from '@prisma/client'
import { Command, CommandInput } from './ui/command'

export function CommandMenu() {
  const [input, setInput] = React.useState('')

  const {
    data: queryResults,
    refetch,
    isFetched,
    isFetching,
  } = useQuery({
    queryKey: ['search'],
    queryFn: async () => {
      if (!input) return []

      const response = await axios.get(`/api/search?q=${input}`)

      const data = response.data as Subreddit & {
        _count: Prisma.SubredditCountOutputType
      }

      return data
    },
    enabled: false,
  })

  return (
    <Command className="z-5- relative max-w-lg overflow-visible rounded-lg border">
      <CommandInput
        value={input}
        onValueChange={(text) => setInput(text)}
        className="border-none outline-none ring-0 focus:border-none focus:outline-none"
        placeholder="Search communities..."
      />
    </Command>
  )
}
