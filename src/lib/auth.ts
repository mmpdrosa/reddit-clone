import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { nanoid } from 'nanoid'
import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

import { prisma } from './prisma'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ token, session }) {
      if (token) {
        session.user.id = token.id
        session.user.name = token.name
        session.user.email = token.email
        session.user.image = token.picture
        session.user.username = token.username
      }

      return session
    },
    async jwt({ token, user }) {
      const dbUser = await prisma.user.findFirst({
        where: { email: token.email },
      })

      if (!dbUser) {
        if (user) {
          token.id = user.id
        }

        return token
      }

      if (!dbUser.username) {
        await prisma.user.update({
          where: {
            id: dbUser.id,
          },
          data: {
            username: nanoid(10),
          },
        })
      }

      return {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        picture: dbUser.image,
        username: dbUser.username,
      }
    },
    redirect() {
      return '/'
    },
  },
  debug: process.env.NODE_ENV === 'development',
}
