import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { commentVoteSchema } from '@/validations/post'

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return new NextResponse('Unauthorized', { status: 403 })
    }

    const { user } = session

    const body = await req.json()

    const { commentId, type } = commentVoteSchema.parse(body)

    const comment = await prisma.comment.findUnique({
      where: {
        id: commentId,
      },
      include: {
        author: true,
        votes: true,
      },
    })

    if (!comment) {
      return new NextResponse('The comment does not exist.', {
        status: 404,
      })
    }

    const userVote = await prisma.commentVote.findUnique({
      where: {
        userId_commentId: {
          userId: user.id,
          commentId,
        },
      },
    })

    if (userVote) {
      if (userVote.type === type) {
        await prisma.commentVote.delete({
          where: {
            userId_commentId: {
              userId: user.id,
              commentId,
            },
          },
        })
      } else {
        await prisma.commentVote.update({
          where: {
            userId_commentId: {
              userId: user.id,
              commentId,
            },
          },
          data: {
            type,
          },
        })
      }
    } else {
      await prisma.commentVote.create({
        data: {
          userId: user.id,
          commentId,
          type,
        },
      })
    }

    return new NextResponse(null, { status: 200 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(err.issues), { status: 422 })
    }

    return new NextResponse(null, { status: 500 })
  }
}
