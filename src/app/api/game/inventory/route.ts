import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { EQUIP_BONUSES } from "@/lib/game/constants"

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
  }

  const userId = session.user.id

  const [relics, equippedSlots] = await Promise.all([
    prisma.relic.findMany({
      where:   { userId },
      orderBy: { capturedAt: "desc" },
      include: {
        historicalEvent: {
          select: { title: true, year: true, description: true, curiosity: true, category: true },
        },
        equippedBy: { select: { slot: true } },
      },
    }),
    prisma.equippedRelic.findMany({
      where:   { userId },
      include: { relic: { select: { id: true, minute: true, rarity: true, captureDate: true } } },
      orderBy: { slot: "asc" },
    }),
  ])

  const relicsWithExtras = relics.map((r) => ({
    ...r,
    equippedSlot:   r.equippedBy?.slot ?? null,
    analyzeReady:   !r.lastAnalyzedAt || (Date.now() - r.lastAnalyzedAt.getTime()) >= 4 * 60 * 60 * 1000,
  }))

  const slots = [1, 2, 3].map((slot) => {
    const equipped = equippedSlots.find((e) => e.slot === slot)
    return {
      slot,
      relic:  equipped?.relic ?? null,
      bonus:  equipped ? EQUIP_BONUSES[equipped.relic.rarity as keyof typeof EQUIP_BONUSES] : null,
    }
  })

  // Calcul des bonus totaux actifs
  const totalBonus = slots.reduce(
    (acc, s) => ({
      xpBonus:       acc.xpBonus       + (s.bonus?.xpBonus       ?? 0),
      resourceBonus: acc.resourceBonus + (s.bonus?.resourceBonus ?? 0),
    }),
    { xpBonus: 0, resourceBonus: 0 }
  )

  return NextResponse.json({ relics: relicsWithExtras, equippedSlots: slots, totalBonus })
}
