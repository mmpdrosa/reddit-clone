'use client'

import { Session } from 'next-auth'
import { usePathname, useRouter } from 'next/navigation'

import { Button } from './ui/button'
import { Input } from './ui/input'
import { UserAvatar } from './user-avatar'
import { Icons } from './icons'

interface PostCreateProps {
  user: Session['user'] | undefined
}

export function PostCreate({ user }: PostCreateProps) {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <div className="overflow-hidden rounded-sm border">
      <div className="flex h-full justify-between gap-2 px-6 py-4">
        <div className="relative">
          <UserAvatar
            user={{ name: user?.name || null, image: user?.image || null }}
          />

          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 outline outline-2 outline-white" />
        </div>

        <Input
          readOnly
          onClick={() => router.push(pathname + '/submit')}
          placeholder="Create post"
        />

        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push(pathname + '/submit')}
        >
          <Icons.Image className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push(pathname + '/submit')}
        >
          <Icons.Link className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
