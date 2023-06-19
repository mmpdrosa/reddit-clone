import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { subredditSchema } from '@/validations/subreddit'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return new NextResponse('Unauthorized', { status: 403 })
    }

    const { user } = session

    const body = await req.json()

    const { name } = subredditSchema.parse(body)

    const subredditExists = await prisma.subreddit.findUnique({
      where: { name },
    })

    if (subredditExists) {
      return new NextResponse('The subreddit already exists.', {
        status: 409,
      })
    }

    const subreddit = await prisma.subreddit.create({
      data: { name, creatorId: user.id },
      select: { id: true, name: true },
    })

    await prisma.subreddit.update({
      where: { id: subreddit.id },
      data: {
        subscribers: {
          connect: { id: user.id },
        },
      },
    })

    return new NextResponse(name)
  } catch (err) {
    if (err instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(err.issues), { status: 422 })
    }

    return new NextResponse(null, { status: 500 })
  }
}
