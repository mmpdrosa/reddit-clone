import { Metadata } from 'next'
import { Inter } from 'next/font/google'
import * as React from 'react'

import { Providers } from '@/components/providers'
import { SiteHeader } from '@/components/site-header'
import { Toaster } from '@/components/ui/toaster'
import { cn } from '@/lib/utils'

import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Reddit Clone',
  description: '',
  keywords: [
    'Next.js',
    'React',
    'Tailwind CSS',
    'Server Components',
    'Radix UI',
  ],
  authors: [
    {
      name: 'mmpdrosa',
    },
  ],
  creator: 'mmpdrosa',
}

interface RootLayoutProps {
  children: React.ReactNode
  authModal: React.ReactNode
}

export default function RootLayout({ children, authModal }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          inter.variable,
        )}
      >
        <Providers>
          <div className="relative flex min-h-screen flex-col">
            <SiteHeader />

            <div className="flex-1">{children}</div>
          </div>

          {authModal}

          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
