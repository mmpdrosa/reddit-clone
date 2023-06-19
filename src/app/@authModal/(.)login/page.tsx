'use client'

import { useRouter } from 'next/navigation'
import * as React from 'react'

import { SignIn } from '@/components/sign-in'
import { Dialog, DialogContent } from '@/components/ui/dialog'

export default function Login() {
  const router = useRouter()
  const [open, setOpen] = React.useState(true)

  React.useEffect(() => {
    if (!open) {
      router.back()
    }
  }, [open, router])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <SignIn />
      </DialogContent>
    </Dialog>
  )
}
