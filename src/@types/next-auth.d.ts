import { User } from 'next-auth'

declare module 'next-auth' {
  export interface Session {
    user: User & {
      id: string
      username?: string | null
    }
  }
}

declare module 'next-auth/jwt' {
  export interface JWT {
    id: string
    username?: string | null
  }
}
