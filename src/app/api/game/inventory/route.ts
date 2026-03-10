import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    const userId = session.user.id

    const relics = await prisma.relic.findMany({
      where:   { userId },
      orderBy: { capturedAt: "desc" },
      include: {
        historicalEvent: {
          select: { title: true, year: true, description: true, curiosity: true, category: true },
        },
      },
    })

    return NextResponse.json({ relics, equippedSlots: [], totalBonus: { xpBonus: 0, resourceBonus: 0 } })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error("[inventory/route] ERROR:", msg)
    return NextResponse.json({ error: `Erreur serveur: ${msg}`, relics: [] }, { status: 500 })
  }
}

export async function POST() {
  return NextResponse.json({ error: "Non supporté" }, { status: 410 })
}
