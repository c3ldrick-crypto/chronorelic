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
      id:             true,
      name:           true,
      class:          true,
      level:          true,
      xpTotal:        true,
      blessedMinutes: true,
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
          <h2 className="font-bold text-[#e2e8f0] text-xl mb-4">Minutes Bénies</h2>
          <p className="text-sm text-[#94a3b8] mb-4">
            Ces minutes vous donnent +200% XP et une chance légendaire accrue.
          </p>
          <div className="space-y-2">
            {character.blessedMinutes.length > 0 ? (
              character.blessedMinutes.map((m: string) => (
                <div key={m} className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
                  <span className="text-amber-300">✨</span>
                  <span className="font-mono font-bold text-[#e2e8f0]">{m}</span>
                </div>
              ))
            ) : (
              <p className="text-[#475569] text-sm">Aucune minute bénie configurée.</p>
            )}
          </div>
          <Link href="/profile" className="block mt-4 text-xs text-violet-400 hover:text-violet-300">
            Configurer mes minutes bénies →
          </Link>
        </div>
      </div>
    </div>
  )
}
