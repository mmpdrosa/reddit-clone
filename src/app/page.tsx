import Link from 'next/link'

import { getCurrentUser } from '@/actions/get-current-user'
import { CustomFeed } from '@/components/custom-feed'
import { GeneralFeed } from '@/components/general-feed'
import { Icons } from '@/components/icons'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default async function Home() {
  const user = await getCurrentUser()

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold md:text-4xl">Your feed</h1>
      <div className="grid grid-cols-1 gap-y-4 py-6 md:grid-cols-3 md:gap-x-4">
        {/* Feed */}
        {user ? <CustomFeed /> : <GeneralFeed />}

        {/* Subreddit Info */}
        <div className="order-first h-fit overflow-hidden rounded-lg border md:order-last">
          <div className="bg-secondary px-6 py-4">
            <p className="flex items-center gap-1.5 py-3 font-semibold">
              <Icons.Home className="h-4 w-4" />
              Home
            </p>
          </div>

          <div className="px-6 py-1 text-sm leading-6">
            <div className="flex justify-between gap-x-4 py-3">
              <p>
                Your personal reddit homepage. Come here to check in with your
                favorite communities.
              </p>
            </div>

            <Link
              href="/r/create"
              className={cn(buttonVariants(), 'mb-6 mt-4 w-full')}
            >
              Create Community
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
