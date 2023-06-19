'use client'

import {
  QueryClient,
  QueryClientProviderProps,
  QueryClientProvider as ReactQueryClientProvider,
} from '@tanstack/react-query'
import * as React from 'react'

export function QueryClientProvider({
  children,
  ...props
}: Omit<QueryClientProviderProps, 'client'>) {
  const queryClientRef = React.useRef<QueryClient>()

  if (!queryClientRef.current) {
    queryClientRef.current = new QueryClient()
  }

  return (
    // @ts-ignore
    <ReactQueryClientProvider client={queryClientRef.current} {...props}>
      {children}
    </ReactQueryClientProvider>
  )
}
