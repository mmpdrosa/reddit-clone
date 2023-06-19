'use client'

import * as React from 'react'
import { signIn } from 'next-auth/react'

import { Button } from './ui/button'
import { Icons } from './icons'
import { toast } from './ui/use-toast'

interface SignInButtonProps extends React.HTMLAttributes<HTMLButtonElement> {}

export function SignInButton({ ...props }: SignInButtonProps) {
  const [isLoading, setIsLoading] = React.useState(false)

  async function signInWithGoogle() {
    setIsLoading(true)

    const callback = await signIn('google', { redirect: false })

    setIsLoading(false)

    if (callback?.error) {
      return toast({
        title: 'Something went wrong.',
        description: 'Your sign in request failed. Please try again.',
        variant: 'destructive',
      })
    }
  }

  return (
    <>
      <Button
        size="sm"
        onClick={signInWithGoogle}
        disabled={isLoading}
        {...props}
      >
        {isLoading ? (
          <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Icons.Google className="mr-2 h-4 w-4" />
        )}
        Google
      </Button>
    </>
  )
}
