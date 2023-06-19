import Link from 'next/link'

import { getCurrentUser } from '@/actions/get-current-user'
import { cn } from '@/lib/utils'
import { Icons } from './icons'
import { ModeToggle } from './mode-toggle'
import { buttonVariants } from './ui/button'
import { UserAccountNav } from './user-account-nav'

export async function SiteHeader() {
  const user = await getCurrentUser()

  return (
    <header className="supports-backdrop-blur:bg-background/60 z-40 border-b bg-background/95 backdrop-blur">
      <div className="container flex h-14 items-center">
        <div className="mr-4">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Icons.Logo className="h-6 w-6" />
            <span className="hidden font-bold sm:inline-block">Reddit</span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-between space-x-2 sm:space-x-4 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {/* <CommandMenu /> */}
          </div>
          <nav className="flex items-center space-x-2">
            <ModeToggle />

            {user ? (
              <UserAccountNav
                user={{
                  name: user.name,
                  image: user.image,
                  email: user.email,
                }}
              />
            ) : (
              <Link
                href="/login"
                className={cn(buttonVariants({ variant: 'secondary' }))}
              >
                Sign In
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
