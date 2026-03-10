import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"

export default async function CharacterPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const character = await prisma.character.findUnique({
    where:  { userId: session.user.id },
    select: {
      id:      true,
      name:    true,
      class:   true,
      level:   true,
      xpTotal: true,
    },
  })

  if (!character) redirect("/character/create")

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="font-display text-3xl font-black text-gradient-violet mb-8">Profil du Gardien</h1>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card-cosmic p-6">
          <h2 className="font-bold text-[#e2e8f0] text-xl mb-4">Informations</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-[#94a3b8]">Nom</span>
              <span className="font-semibold text-[#e2e8f0]">{character.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#94a3b8]">Classe</span>
              <span className="font-semibold text-violet-300">{character.class}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#94a3b8]">Niveau</span>
              <span className="font-semibold text-[#e2e8f0]">{character.level}</span>
            </div>
          </div>
        </div>

        <div className="card-cosmic p-6">
          <h2 className="font-bold text-[#e2e8f0] text-xl mb-4">Progression</h2>
          <p className="text-sm text-[#94a3b8]">
            XP Total : {character.xpTotal} — Niveau {character.level}
          </p>
          <Link href="/play" className="block mt-4 text-xs text-violet-400 hover:text-violet-300">
            Aller capturer →
          </Link>
        </div>
      </div>
    </div>
  )
}
