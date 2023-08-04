import { notFound } from 'next/navigation'

import { getCurrentUser } from '@/actions/get-current-user'
import { Post, PostVote, VoteType } from '@prisma/client'
import { PostVoteClient } from './post-vote-client'

interface PostVoteServerProps {
  postId: string
  initialVotesAmount?: number
  initialVote?: VoteType | null
  getData?: () => Promise<(Post & { votes: PostVote[] }) | null>
}

export async function PostVoteServer({
  postId,
  getData,
  initialVote,
  initialVotesAmount,
}: PostVoteServerProps) {
  const user = await getCurrentUser()

  let votesAmount = 0
  let currentVote: VoteType | null | undefined

  if (getData) {
    const post = await getData()

    if (!post) {
      return notFound()
    }

    votesAmount = post.votes.reduce((acc, vote) => {
      if (vote.type === 'UP') {
        return acc + 1
      }

      return acc - 1
    }, 0)

    currentVote = post.votes.find(({ userId }) => userId === user?.id)?.type
  } else {
    votesAmount = initialVotesAmount!
    currentVote = initialVote
  }

  return (
    <PostVoteClient
      postId={postId}
      initialVotesAmount={votesAmount}
      initialVote={currentVote}
    />
  )
}
