import type { NextAuthConfig } from "next-auth"

export const authConfig = {
  session: { strategy: "jwt" },
  pages: { signIn: '/login' },
  providers: [],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
        token.valorantTag = user.valorantTag
        token.rank = user.rank
        token.preferredServer = user.preferredServer
        token.discordId = user.discordId
      }
      if (trigger === "update" && session) {
        token = { ...token, ...session }
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.valorantTag = token.valorantTag as string | null
        session.user.rank = token.rank as number | null
        session.user.preferredServer = token.preferredServer as string | null
        session.user.discordId = token.discordId as string | null
      }
      return session
    }
  }
} satisfies NextAuthConfig;
