import Link from 'next/link'

import { cn } from '@/lib/utils'
import { Icons } from './icons'
import { buttonVariants } from './ui/button'
import { SignInButton } from './sign-in-button'

export function SignIn() {
  return (
    <div className="flex flex-col items-center space-y-2 text-center">
      <Icons.Logo className="h-6 w-6" />
      <h1 className="text-2xl font-semibold tracking-tight">Welcome back!</h1>
      <p className="max-w-xs text-sm text-muted-foreground">
        By continuing, you are setting up a Reddit account and agree to our{' '}
        <Link
          href="/user-agreement"
          className="underline underline-offset-4 hover:text-primary"
        >
          User Agreement
        </Link>{' '}
        and{' '}
        <Link
          href="/privacy-policy"
          className="underline underline-offset-4 hover:text-primary"
        >
          Privacy Policy
        </Link>
        .
      </p>

      <SignInButton />

      <p className="px-8 text-center text-sm">
        New to Reddit?{' '}
        <Link
          href="/register"
          className={cn(buttonVariants({ variant: 'link' }), 'p-0')}
        >
          Sign Up
        </Link>
      </p>
    </div>
  )
}
