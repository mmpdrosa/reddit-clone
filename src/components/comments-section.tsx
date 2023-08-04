import { getCurrentUser } from '@/actions/get-current-user'
import { prisma } from '@/lib/prisma'
import { CreateComment } from './create-comment'
import { PostComment } from './post-comment'
import { Separator } from './ui/separator'

interface CommentsSectionProps {
  postId: string
}

export async function CommentsSection({ postId }: CommentsSectionProps) {
  const user = await getCurrentUser()

  const comments = await prisma.comment.findMany({
    where: {
      postId,
      replyToId: null,
    },
    include: {
      author: true,
      votes: true,
      replies: {
        include: {
          author: true,
          votes: true,
        },
      },
    },
  })

  return (
    <div className="mt-4 flex flex-col gap-y-4">
      <Separator className="my-6" />

      <CreateComment postId={postId} />

      <div className="mt-4 flex flex-col gap-y-6">
        {comments
          .filter((comment) => !comment.replyToId)
          .map((topLevelComment) => {
            const commentVotesAmount = topLevelComment.votes.reduce(
              (acc, vote) => {
                if (vote.type === 'UP') {
                  return acc + 1
                }

                return acc - 1
              },
              0,
            )

            const userCommentVote = topLevelComment.votes.find(
              (vote) => vote.userId === user?.id,
            )

            return (
              <div key={topLevelComment.id} className="flex flex-col">
                <div className="mb-2">
                  <PostComment
                    postId={postId}
                    comment={topLevelComment}
                    votesAmount={commentVotesAmount}
                    currentVote={userCommentVote?.type}
                    user={user}
                  />
                </div>

                {topLevelComment.replies
                  .sort((a, b) => b.votes.length - a.votes.length)
                  .map((reply) => {
                    const replyVotesAmount = reply.votes.reduce((acc, vote) => {
                      if (vote.type === 'UP') {
                        return acc + 1
                      }

                      return acc - 1
                    }, 0)

                    const userCommentVote = reply.votes.find(
                      (vote) => vote.userId === user?.id,
                    )

                    return (
                      <div key={reply.id} className="ml-2 border-l-2 py-2 pl-4">
                        <PostComment
                          comment={reply}
                          currentVote={userCommentVote?.type}
                          votesAmount={replyVotesAmount}
                          postId={postId}
                          user={user}
                        />
                      </div>
                    )
                  })}
              </div>
            )
          })}
      </div>
    </div>
  )
}
