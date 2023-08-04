import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redis } from '@/lib/redis'
import { CachedPost } from '@/models'
import { postVoteSchema } from '@/validations/post'

const CACHE_AFTER_UPVOTES = 1

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return new NextResponse('Unauthorized', { status: 403 })
    }

    const { user } = session

    const body = await req.json()

    const { postId, type } = postVoteSchema.parse(body)

    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
      include: {
        author: true,
        votes: true,
      },
    })

    if (!post) {
      return new NextResponse('The post does not exist.', {
        status: 404,
      })
    }

    const userVote = await prisma.postVote.findUnique({
      where: {
        userId_postId: {
          postId,
          userId: user.id,
        },
      },
    })

    if (userVote) {
      if (userVote.type === type) {
        await prisma.postVote.delete({
          where: {
            userId_postId: {
              postId,
              userId: user.id,
            },
          },
        })
      } else {
        await prisma.postVote.update({
          where: {
            userId_postId: {
              postId,
              userId: user.id,
            },
          },
          data: {
            type,
          },
        })
      }
    } else {
      await prisma.postVote.create({
        data: {
          type,
          userId: user.id,
          postId,
        },
      })
    }

    const votesAmount = post.votes.reduce((acc, vote) => {
      if (vote.type === 'UP') {
        return acc + 1
      }

      return acc - 1
    }, 0)

    if (votesAmount >= CACHE_AFTER_UPVOTES) {
      const cachePayload = {
        id: post.id,
        title: post.title,
        authorUsername: post.author.username,
        content: JSON.stringify(post.content),
        currentUserVote: type,
        createdAt: post.createdAt,
      } as CachedPost

      await redis.hset(`post:${postId}`, cachePayload)
    }

    return new NextResponse(null, { status: 200 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(err.issues), { status: 422 })
    }

    return new NextResponse(null, { status: 500 })
  }
}
