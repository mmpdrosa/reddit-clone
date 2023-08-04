import { formatRelative } from 'date-fns'
import * as React from 'react'

import { Post as PostModel, PostVote, User } from '@prisma/client'
import { Icons } from './icons'
import { EditorOutput } from './editor-output'
import { PostVoteClient } from './post-vote-client'

interface PostProps {
  subredditName: string
  post: PostModel & {
    author: User
    votes: PostVote[]
  }
  commentsAmount: number
  votesAmount: number
  currentVote?: Pick<PostVote, 'type'>
}

export function Post({
  subredditName,
  post,
  commentsAmount,
  votesAmount,
  currentVote,
}: PostProps) {
  const contentRef = React.useRef<HTMLDivElement>(null)

  return (
    <div className="rounded-md border">
      <div className="flex justify-between px-6 py-4">
        <PostVoteClient
          postId={post.id}
          initialVotesAmount={votesAmount}
          initialVote={currentVote?.type}
        />

        <div className="w-0 flex-1">
          <div className="mt-1 max-h-40 text-xs">
            <a
              href={`/r/${subredditName}`}
              className="text-sm underline underline-offset-2"
            >
              r/{subredditName}
            </a>
            <span className="px-1">•</span>
            <span>Posted by u/{post.author.username}</span>{' '}
            {formatRelative(new Date(post.createdAt), new Date())}
          </div>

          <a href={`/r/${subredditName}/post/${post.id}`}>
            <h1 className="py-2 text-lg font-semibold leading-6">
              {post.title}
            </h1>
          </a>

          <div
            className="relative max-h-40 w-full overflow-clip text-sm"
            ref={contentRef}
          >
            <EditorOutput content={post.content} />

            {contentRef.current?.clientHeight === 160 && (
              <div className="absolute bottom-0 left-0 h-24 w-full bg-gradient-to-t from-secondary to-transparent" />
            )}
          </div>
        </div>
      </div>

      <div className="z-20 p-4 text-sm sm:px-6">
        <a
          href={`/r/${subredditName}/post/${post.id}`}
          className="flex items-center"
        >
          <Icons.Message className="mr-2 h-4 w-4" /> {commentsAmount} comments
        </a>
      </div>
    </div>
  )
}
