import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { postSchema } from '@/validations/post'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return new NextResponse('Unauthorized', { status: 403 })
    }

    const { user } = session

    const body = await req.json()

    const { subredditId, title, content } = postSchema.parse(body)

    const subreddit = await prisma.subreddit.findUnique({
      where: { id: subredditId },
      include: {
        creator: {
          select: {
            id: true,
          },
        },
      },
    })

    if (!subreddit) {
      return new NextResponse('The subreddit does not exist.', {
        status: 404,
      })
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { subscriptions: { where: { id: subredditId } } },
    })

    if (dbUser?.subscriptions.length === 0) {
      return new NextResponse('The user is not subscribed to this subreddit.', {
        status: 400,
      })
    }

    await prisma.post.create({
      data: {
        subredditId,
        authorId: user.id,
        title,
        content,
      },
    })

    return new NextResponse(null, { status: 200 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(err.issues), { status: 422 })
    }

    return new NextResponse(null, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)

    const session = await getServerSession(authOptions)

    const user = session?.user

    const searchParamsSchema = z.object({
      limit: z.coerce.number(),
      page: z.coerce.number(),
      subredditName: z.string().nullish().optional(),
    })

    const { limit, page, subredditName } = searchParamsSchema.parse({
      limit: url.searchParams.get('limit'),
      page: url.searchParams.get('page'),
      subredditName: url.searchParams.get('subredditName'),
    })

    let whereClause = {}

    if (subredditName) {
      whereClause = {
        subreddit: {
          name: subredditName,
        },
      }
    } else if (user) {
      const userFollowedCommunities = await prisma.subreddit.findMany({
        where: { subscribers: { some: { id: user.id } } },
        select: {
          id: true,
        },
      })

      whereClause = {
        subreddit: {
          id: {
            in: userFollowedCommunities.map(({ id }) => id),
          },
        },
      }
    }

    const posts = await prisma.post.findMany({
      take: limit,
      skip: (page - 1) * limit,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        subreddit: true,
        votes: true,
        author: true,
        comments: true,
      },
      where: whereClause,
    })

    return NextResponse.json(posts)
  } catch (err) {
    if (err instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(err.issues), { status: 422 })
    }

    return new NextResponse(null, { status: 500 })
  }
}
