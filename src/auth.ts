import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { authConfig } from "@/auth.config"

const loginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(8).max(100),
})

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email:    { label: "Email",        type: "email"    },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null

        const { email, password } = parsed.data

        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase().trim() },
          select: {
            id:           true,
            email:        true,
            name:         true,
            image:        true,
            passwordHash: true,
            role:         true,
            isPremium:    true,
          },
        })

        if (!user || !user.passwordHash) return null

        const isValid = await bcrypt.compare(password, user.passwordHash)
        if (!isValid) return null

        return {
          id:        user.id,
          email:     user.email,
          name:      user.name ?? user.email,
          image:     user.image,
          role:      user.role,
          isPremium: user.isPremium,
        }
      },
    }),
  ],
  events: {
    async signIn({ user }) {
      if (user.id) {
        await prisma.auditLog.create({
          data: {
            userId:   user.id,
            action:   "LOGIN",
            resource: "auth",
          },
        }).catch(() => {})
      }
    },
  },
})

// Extension des types NextAuth
declare module "next-auth" {
  interface Session {
    user: {
      id:        string
      email:     string
      name:      string
      image?:    string | null
      role:      string
      isPremium: boolean
    }
  }
}
