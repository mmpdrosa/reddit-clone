import { format } from 'date-fns'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import * as React from 'react'

import { getCurrentUser } from '@/actions/get-current-user'
import { SubredditActionsToggle } from '@/components/subreddit-actions-toggle'
import { buttonVariants } from '@/components/ui/button'
import { prisma } from '@/lib/prisma'
import { cn } from '@/lib/utils'

interface SubredditLayoutProps {
  children: React.ReactNode
  params: {
    slug: string
  }
}

export default async function SubredditLayout({
  children,
  params,
}: SubredditLayoutProps) {
  const { slug } = params

  const subreddit = await prisma.subreddit.findUnique({
    where: { name: slug },
    include: {
      posts: {
        include: {
          author: true,
          votes: true,
        },
      },
      _count: {
        select: { subscribers: true },
      },
    },
  })

  if (!subreddit) {
    return notFound()
  }

  const user = await getCurrentUser()

  const dbUser = !user
    ? undefined
    : await prisma.user.findUnique({
        where: { id: user.id },
        select: {
          subscriptions: {
            where: { name: slug },
          },
        },
      })

  const isUserSubscribed = dbUser?.subscriptions.length === 1
  const subredditMembers = subreddit._count.subscribers
  const isUserCreator = subreddit.creatorId === user?.id

  return (
    <div className="mx-auto h-full px-4 pt-12 sm:container">
      <div>
        <div className="grid grid-cols-1 gap-y-4 py-6 md:grid-cols-3 md:gap-x-4">
          <div className="col-span-2 flex flex-col space-y-6">{children}</div>

          <div className="order-first hidden h-fit rounded-lg border md:order-last md:block">
            <div className="px-6 pt-6">
              <p className="py-3 font-semibold">About r/{slug}</p>
            </div>

            <dl className="divide-y px-6 py-4 text-sm leading-6">
              <div className="flex justify-between gap-x-4 py-3">
                <dt>Created</dt>
                <dd>
                  <time dateTime={subreddit.createdAt.toDateString()}>
                    {format(subreddit.createdAt, 'MMM d, yyyy')}
                  </time>
                </dd>
              </div>

              <div className="flex justify-between gap-x-4 py-3">
                <dt>Members</dt>
                <dd>
                  <span>{subredditMembers}</span>
                </dd>
              </div>

              {isUserCreator && (
                <div className="flex justify-between gap-x-4 py-3">
                  <p>You created this community</p>
                </div>
              )}
            </dl>

            <div className="grid grid-cols-1 gap-2 px-6 pb-4">
              {!isUserCreator && (
                <SubredditActionsToggle
                  subredditId={subreddit.id}
                  isUserSubscribed={isUserSubscribed}
                />
              )}

              <Link
                href={`/r/${slug}/submit`}
                className={cn(buttonVariants({ variant: 'outline' }))}
              >
                Create Post
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
