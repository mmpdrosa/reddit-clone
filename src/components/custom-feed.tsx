import { getCurrentUser } from '@/actions/get-current-user'
import { SUBREDDIT_POSTS_INFINITE_SCROLLING_AMOUNT } from '@/config/site'
import { prisma } from '@/lib/prisma'
import { Feed } from './feed'

export async function CustomFeed() {
  const user = await getCurrentUser()

  const userFollowedCommunities = await prisma.subreddit.findMany({
    where: { subscribers: { some: { id: user?.id } } },
  })

  const posts = await prisma.post.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    where: {
      subreddit: {
        id: {
          in: userFollowedCommunities.map(({ id }) => id),
        },
      },
    },
    include: {
      votes: true,
      author: true,
      comments: true,
      subreddit: true,
    },
    take: SUBREDDIT_POSTS_INFINITE_SCROLLING_AMOUNT,
  })

  return <Feed initialPosts={posts} user={user} />
}
