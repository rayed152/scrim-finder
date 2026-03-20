import { type DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      valorantTag?: string | null
      rank?: number | null
      preferredServer?: string | null
      discordId?: string | null
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    valorantTag?: string | null
    rank?: number | null
    preferredServer?: string | null
    discordId?: string | null
  }
}
