import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { EQUIP_BONUSES, ANALYZE_REWARDS, ANALYZE_COOLDOWN_MS } from "@/lib/game/constants"

export async function GET() {
  try {
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
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error("[inventory/route] ERROR:", msg)
    return NextResponse.json(
      { error: `Erreur serveur: ${msg}`, relics: [], equippedSlots: [{ slot: 1, relic: null, bonus: null }, { slot: 2, relic: null, bonus: null }, { slot: 3, relic: null, bonus: null }], totalBonus: { xpBonus: 0, resourceBonus: 0 } },
      { status: 500 }
    )
  }
}

// POST — batch analyze all ready relics
export async function POST(_req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 })

    const userId = session.user.id

    const allRelics = await prisma.relic.findMany({
      where:  { userId },
      select: { id: true, rarity: true, lastAnalyzedAt: true },
    })

    const readyRelics = allRelics.filter((r) =>
      !r.lastAnalyzedAt || Date.now() - r.lastAnalyzedAt.getTime() >= ANALYZE_COOLDOWN_MS
    )

    if (readyRelics.length === 0) {
      return NextResponse.json({ error: "Aucune relique prête à analyser." }, { status: 400 })
    }

    const totals = { eclatsTemporels: 0, chronite: 0, essencesHistoriques: 0, fragmentsAnomalie: 0 }
    for (const r of readyRelics) {
      const rw = ANALYZE_REWARDS[r.rarity as keyof typeof ANALYZE_REWARDS]
      totals.eclatsTemporels     += rw.eclatsTemporels
      totals.chronite            += rw.chronite
      totals.essencesHistoriques += rw.essencesHistoriques
      totals.fragmentsAnomalie   += rw.fragmentsAnomalie
    }

    const now = new Date()
    await prisma.$transaction([
      ...readyRelics.map((r) => prisma.relic.update({ where: { id: r.id }, data: { lastAnalyzedAt: now } })),
      prisma.user.update({
        where: { id: userId },
        data: {
          eclatsTemporels:     { increment: totals.eclatsTemporels     },
          chronite:            { increment: totals.chronite            },
          essencesHistoriques: { increment: totals.essencesHistoriques },
          fragmentsAnomalie:   { increment: totals.fragmentsAnomalie   },
        },
      }),
    ])

    return NextResponse.json({ success: true, count: readyRelics.length, rewards: totals })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error("[inventory/route] ERROR:", msg)
    return NextResponse.json(
      { error: `Erreur serveur: ${msg}`, relics: [], equippedSlots: [{ slot: 1, relic: null, bonus: null }, { slot: 2, relic: null, bonus: null }, { slot: 3, relic: null, bonus: null }], totalBonus: { xpBonus: 0, resourceBonus: 0 } },
      { status: 500 }
    )
  }
}
