import type { NextAuthConfig } from "next-auth"

// Configuration edge-compatible (sans Prisma ni bcrypt)
// Utilisée par le middleware (Edge Runtime)
export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error:  "/login",
  },
  providers: [], // Les providers complets sont dans src/auth.ts
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id        = user.id
        token.role      = (user as { role?: string }).role      ?? "FREE"
        token.isPremium = (user as { isPremium?: boolean }).isPremium ?? false
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id        = token.id as string
        session.user.role      = token.role      as string
        session.user.isPremium = token.isPremium as boolean
      }
      return session
    },
  },
}
