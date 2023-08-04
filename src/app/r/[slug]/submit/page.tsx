import { notFound } from 'next/navigation'

import { Editor } from '@/components/editor'
import { Button } from '@/components/ui/button'
import { prisma } from '@/lib/prisma'

interface SubmitPageProps {
  params: {
    slug: string
  }
}

export default async function SubmitPage({ params }: SubmitPageProps) {
  const slug = params.slug

  const subreddit = await prisma.subreddit.findUnique({ where: { name: slug } })

  if (!subreddit) {
    return notFound()
  }

  return (
    <div className="flex flex-col items-start gap-6">
      <div className="border-b pb-5">
        <div className="-ml-2 -mt-2 flex flex-wrap items-baseline">
          <h3 className="ml2 mt-2 text-base font-semibold leading-6">
            Create Post
          </h3>
          <p className="ml-2 mt-1 truncate text-sm">in r/{slug}</p>
        </div>
      </div>

      <Editor subredditId={subreddit.id} />

      <div className="flex w-full justify-end">
        <Button type="submit" className="w-full" form="subreddit-post-form">
          Post
        </Button>
      </div>
    </div>
  )
}
