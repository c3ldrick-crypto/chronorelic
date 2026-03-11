import NextAuth from "next-auth"
import { authConfig } from "@/auth.config"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const { auth } = NextAuth(authConfig)

// Routes protégées par rôle
const PROTECTED_ROUTES = {
  game:  ["/play", "/collection", "/inventory", "/talents", "/profile", "/character", "/leaderboard"],
  admin: ["/admin"],
}

export default auth((req: NextRequest & { auth?: { user?: { role?: string } } | null }) => {
  const { pathname } = req.nextUrl
  const session = req.auth

  // ─── Routes Admin ────────────────────────────────
  if (PROTECTED_ROUTES.admin.some((r) => pathname.startsWith(r))) {
    if (!session?.user) {
      return NextResponse.redirect(new URL("/login?error=unauthorized", req.url))
    }
  }

  // ─── Routes Jeu ──────────────────────────────────
  if (PROTECTED_ROUTES.game.some((r) => pathname.startsWith(r))) {
    if (!session?.user) {
      return NextResponse.redirect(new URL("/login?redirect=" + pathname, req.url))
    }
  }

  // ─── Headers de sécurité supplémentaires (OWASP) ─
  const response = NextResponse.next()
  response.headers.set("X-Request-ID", crypto.randomUUID())

  return response
})

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|public/).*)",
  ],
}
