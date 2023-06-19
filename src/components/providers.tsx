import * as React from 'react'

import { ThemeProvider } from './theme-provider'
import { QueryClientProvider } from './query-client-provider'

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider>{children}</QueryClientProvider>
    </ThemeProvider>
  )
}
