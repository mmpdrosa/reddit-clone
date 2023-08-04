'use client'

import { useIntersection } from '@mantine/hooks'
import { useInfiniteQuery } from '@tanstack/react-query'
import axios from 'axios'
import { Session } from 'next-auth'
import * as React from 'react'

import { SUBREDDIT_POSTS_INFINITE_SCROLLING_AMOUNT } from '@/config/site'
import { ExtendedPost } from '@/models'
import { Post } from './post'

interface FeedProps {
  initialPosts: ExtendedPost[]
  subredditName?: string
  user: Session['user'] | undefined
}

export function Feed({ initialPosts, subredditName, user }: FeedProps) {
  const lastPostRef = React.useRef<HTMLElement>(null)
  const { ref, entry } = useIntersection({
    root: lastPostRef.current,
    threshold: 1,
  })

  const { data, fetchNextPage, isFetchingNextPage } = useInfiniteQuery(
    ['posts'],
    async ({ pageParam = 1 }) => {
      console.log(pageParam)

      const query =
        `/api/subreddits/posts?limit=${SUBREDDIT_POSTS_INFINITE_SCROLLING_AMOUNT}&page=${pageParam}` +
        (subredditName ? `&subredditName=${subredditName}` : '')

      const response = await axios.get(query)

      const data: ExtendedPost[] = response.data

      return data
    },
    {
      getNextPageParam: (_, pages) => {
        return pages.length + 1
      },
      initialData: {
        pages: [initialPosts],
        pageParams: [1],
      },
    },
  )

  React.useEffect(() => {
    if (entry?.isIntersecting) {
      fetchNextPage()
    }
  }, [entry, fetchNextPage])

  const posts = data?.pages.flatMap((page) => page) ?? initialPosts

  return (
    <ul className="col-span-2 flex flex-col space-y-6">
      {posts.map((post, index) => {
        const votesAmount = post.votes.reduce((acc, vote) => {
          if (vote.type === 'UP') {
            return acc + 1
          }

          return acc - 1
        }, 0)

        const currentUserVote = post.votes.find(
          (vote) => vote.userId === user?.id,
        )

        if (index === posts.length - 1) {
          return (
            <li key={post.id} ref={ref}>
              <Post
                post={post}
                subredditName={post.subreddit.name}
                commentsAmount={post.comments.length}
                currentVote={currentUserVote}
                votesAmount={votesAmount}
              />
            </li>
          )
        }

        return (
          <Post
            key={post.id}
            post={post}
            subredditName={post.subreddit.name}
            commentsAmount={post.comments.length}
            currentVote={currentUserVote}
            votesAmount={votesAmount}
          />
        )
      })}
    </ul>
  )
}
