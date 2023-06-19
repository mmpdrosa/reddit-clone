import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { subredditSubscriptionSchema } from '@/validations/subreddit'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return new NextResponse('Unauthorized', { status: 403 })
    }

    const { user } = session

    const body = await req.json()

    const { subredditId } = subredditSubscriptionSchema.parse(body)

    const subreddit = await prisma.subreddit.findUnique({
      where: { id: subredditId },
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

    if (dbUser?.subscriptions.length === 1) {
      return new NextResponse(
        'The user is already subscribed to this subreddit.',
        {
          status: 400,
        },
      )
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { subscriptions: { connect: { id: subredditId } } },
    })

    return new NextResponse(null, { status: 200 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(err.issues), { status: 422 })
    }

    return new NextResponse(null, { status: 500 })
  }
}
