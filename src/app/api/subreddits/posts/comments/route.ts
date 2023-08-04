import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { commentSchema } from '@/validations/post'

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return new NextResponse('Unauthorized', { status: 403 })
    }

    const { user } = session

    const body = await req.json()

    const { postId, text, replyToId } = commentSchema.parse(body)

    await prisma.comment.create({
      data: {
        postId,
        text,
        replyToId,
        authorId: user.id,
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
