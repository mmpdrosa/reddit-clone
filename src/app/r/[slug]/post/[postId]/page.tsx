import { notFound } from 'next/navigation'
import * as React from 'react'

import { prisma } from '@/lib/prisma'
import { redis } from '@/lib/redis'
import { CachedPost } from '@/models'
import { Post, PostVote, User } from '@prisma/client'
import { buttonVariants } from '@/components/ui/button'
import { Icons } from '@/components/icons'
import { PostVoteServer } from '@/components/post-vote-server'
import { formatRelative } from 'date-fns'
import { EditorOutput } from '@/components/editor-output'
import { CommentsSection } from '@/components/comments-section'

interface PostPagePros {
  params: {
    postId: string
  }
}

export default async function PostPage({ params }: PostPagePros) {
  const { postId } = params

  const cachedPost = (await redis.hgetall(`post:${postId}`)) as CachedPost

  let post: (Post & { votes: PostVote[]; author: User }) | null = null

  if (!cachedPost) {
    post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
      include: {
        votes: true,
        author: true,
      },
    })
  }

  if (!post && !cachedPost) {
    return notFound()
  }

  return (
    <div>
      <div className="flex h-full items-start justify-between rounded-lg border p-2">
        <React.Suspense fallback={<PostVoteShell />}>
          <PostVoteServer
            postId={post?.id ?? cachedPost.id}
            getData={async () => {
              return await prisma.post.findUnique({
                where: {
                  id: params.postId,
                },
                include: {
                  votes: true,
                },
              })
            }}
          />
        </React.Suspense>

        <div className="w-full flex-1 rounded-sm p-4">
          <p className="mt-1 max-h-40 truncate text-xs">
            Posted by u/{post?.author.username ?? cachedPost.authorUsername}{' '}
            {formatRelative(
              new Date(post?.createdAt ?? cachedPost.createdAt),
              new Date(),
            )}
          </p>
          <h1 className="py-2 text-xl font-semibold leading-6">
            {post?.title ?? cachedPost.title}
          </h1>

          <EditorOutput content={post?.content ?? cachedPost.content} />

          <React.Suspense
            fallback={<Icons.Spinner className="h-5 w-5 animate-spin" />}
          >
            <CommentsSection postId={post?.id ?? cachedPost.id} />
          </React.Suspense>
        </div>
      </div>
    </div>
  )
}

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

function PostVoteShell() {
  return (
    <div className="flex w-20 flex-col items-center pr-6">
      <div className={buttonVariants({ variant: 'ghost', size: 'icon' })}>
        <Icons.UpVote className="h-5 w-5" />
      </div>

      <div className="py-2 text-center text-sm font-medium">
        <Icons.Spinner className="h-3 w-3 animate-spin" />
      </div>

      <div className={buttonVariants({ variant: 'ghost', size: 'icon' })}>
        <Icons.DownVote className="h-5 w-5" />
      </div>
    </div>
  )
}
