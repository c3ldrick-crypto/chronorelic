import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { ENIGMAS, toPublicEnigma, sortedEnigmas } from "@/lib/game/enigmas"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    const userId = session.user.id

    // Load user's solved enigma IDs
    const claims = await prisma.questClaim.findMany({
      where:  { userId, questId: { startsWith: "enigma_" } },
      select: { questId: true },
    })

    const solvedIds = new Set(claims.map(c => c.questId.replace("enigma_", "")))

    const publicEnigmas = ENIGMAS.map(e => toPublicEnigma(e, solvedIds))

    return NextResponse.json({
      enigmas: sortedEnigmas(publicEnigmas),
      total:   ENIGMAS.length,
      solved:  solvedIds.size,
    })
  } catch (err) {
    console.error("[enigmas/GET]", err)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
