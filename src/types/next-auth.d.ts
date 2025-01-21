import NextAuth from "next-auth"
import type { Member } from "@prisma/client";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      member: Member,
      id: number,
    } & DefaultSession["user"]
  }
}