import { notFound } from 'next/navigation'

import { getCurrentUser } from '@/actions/get-current-user'
import { Feed } from '@/components/feed'
import { PostCreate } from '@/components/post-create'
import { SUBREDDIT_POSTS_INFINITE_SCROLLING_AMOUNT } from '@/config/site'
import { prisma } from '@/lib/prisma'

interface SubredditPageProps {
  params: {
    slug: string
  }
}

export default async function SubredditPage({ params }: SubredditPageProps) {
  const { slug } = params

  const user = await getCurrentUser()

  const subreddit = await prisma.subreddit.findUnique({
    where: {
      name: slug,
    },
    include: {
      posts: {
        include: {
          author: true,
          subreddit: true,
          votes: true,
          comments: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: SUBREDDIT_POSTS_INFINITE_SCROLLING_AMOUNT,
      },
    },
  })

  if (!subreddit) {
    return notFound()
  }

  return (
    <div className="space-y-6">
      <h1 className="h-14 text-3xl font-bold md:text-4xl">
        r/{subreddit.name}
      </h1>

      <PostCreate user={user} />

      <Feed
        user={user}
        initialPosts={subreddit.posts}
        subredditName={subreddit.name}
      />
    </div>
  )
}
