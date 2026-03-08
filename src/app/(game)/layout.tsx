import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { Navbar } from "@/components/layout/Navbar"
import { levelFromXP } from "@/lib/game/xp"

export default async function GameLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  // Récupérer les données du joueur
  const user = await prisma.user.findUnique({
    where:  { id: session.user.id },
    select: {
      id:             true,
      name:           true,
      email:          true,
      role:           true,
      isPremium:      true,
      temporalShards: true,
      character: {
        select: { level: true, xpTotal: true },
      },
    },
  })

  if (!user) {
    redirect("/login")
  }

  const level = user.character
    ? levelFromXP(user.character.xpTotal)
    : undefined

  return (
    <div className="min-h-screen nebula-bg">
      <Navbar
        user={{
          name:           user.name ?? "Gardien",
          email:          user.email,
          role:           user.role,
          isPremium:      user.isPremium,
          temporalShards: user.temporalShards,
          level,
        }}
      />
      <main className="pt-16 min-h-[calc(100vh-64px)]">
        {children}
      </main>
    </div>
  )
}
