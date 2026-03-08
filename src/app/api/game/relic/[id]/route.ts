import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { EQUIP_BONUSES, ANALYZE_REWARDS, ANALYZE_COOLDOWN_MS } from "@/lib/game/constants"
import { CharacterClass } from "@/types"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 })

  const userId = session.user.id
  const { id: relicId } = await params
  const { action, slot: bodySlot } = await req.json() as { action: string; slot?: number }

  // Vérifier que la relique appartient au joueur
  const relic = await prisma.relic.findUnique({
    where:  { id: relicId },
    select: { id: true, userId: true, rarity: true, lastAnalyzedAt: true, equippedBy: { select: { id: true, slot: true } } },
  })
  if (!relic || relic.userId !== userId) {
    return NextResponse.json({ error: "Relique introuvable." }, { status: 404 })
  }

  // ── Action : ANALYZE ─────────────────────────────────────────────────────
  if (action === "analyze") {
    // Fetch talent levels for cooldown reduction
    const character = await prisma.character.findUnique({
      where:  { userId },
      select: { class: true, talents: { select: { talentId: true, level: true } } },
    })
    const charClass   = (character?.class ?? "CHRONOMANCER") as CharacterClass
    const talentMap   = Object.fromEntries((character?.talents ?? []).map((t) => [t.talentId, t.level]))
    // resonance_chrono (CHRONO) or analyse_profonde (ARCHIVISTE): -30min/level
    const cooldownReductionMs =
      ((charClass === "CHRONOMANCER" ? (talentMap["resonance_chrono"] ?? 0) : 0) +
       (charClass === "ARCHIVISTE"   ? (talentMap["analyse_profonde"]  ?? 0) : 0)) * 30 * 60 * 1000
    const effectiveCooldown = Math.max(0, ANALYZE_COOLDOWN_MS - cooldownReductionMs)

    // Vérifier le cooldown
    if (relic.lastAnalyzedAt) {
      const elapsed = Date.now() - relic.lastAnalyzedAt.getTime()
      if (elapsed < effectiveCooldown) {
        const remaining = Math.ceil((effectiveCooldown - elapsed) / 60000)
        return NextResponse.json(
          { error: `Analyse en cours... Revenez dans ${remaining} minute${remaining > 1 ? "s" : ""}.` },
          { status: 429 }
        )
      }
    }

    // bibliotheque (ARCHIVISTE avancé): +15% ressources par niveau
    const bibliothequeLvl = charClass === "ARCHIVISTE" ? (talentMap["bibliotheque"] ?? 0) : 0
    const baseRewards     = ANALYZE_REWARDS[relic.rarity as keyof typeof ANALYZE_REWARDS]
    const rewardMult      = 1 + bibliothequeLvl * 0.15
    const rewards = {
      eclatsTemporels:     Math.floor(baseRewards.eclatsTemporels     * rewardMult),
      chronite:            Math.floor(baseRewards.chronite            * rewardMult),
      essencesHistoriques: Math.floor(baseRewards.essencesHistoriques * rewardMult),
      fragmentsAnomalie:   Math.floor(baseRewards.fragmentsAnomalie   * rewardMult),
    }

    await prisma.$transaction([
      prisma.relic.update({
        where: { id: relicId },
        data:  { lastAnalyzedAt: new Date() },
      }),
      prisma.user.update({
        where: { id: userId },
        data: {
          eclatsTemporels:     { increment: rewards.eclatsTemporels },
          chronite:            { increment: rewards.chronite },
          essencesHistoriques: { increment: rewards.essencesHistoriques },
          fragmentsAnomalie:   { increment: rewards.fragmentsAnomalie },
        },
      }),
      prisma.auditLog.create({
        data: {
          userId,
          action:   "ANALYZE",
          resource: `relic:${relicId}`,
          details:  { rarity: relic.rarity, rewards },
        },
      }),
    ])

    return NextResponse.json({ success: true, rewards })
  }

  // ── Action : EQUIP ───────────────────────────────────────────────────────
  if (action === "equip") {
    const targetSlot = bodySlot ?? 1

    if (![1, 2, 3].includes(targetSlot)) {
      return NextResponse.json({ error: "Slot invalide (1, 2 ou 3)." }, { status: 400 })
    }

    // Déséquiper la relique déjà dans ce slot (si il y en a une)
    const existingInSlot = await prisma.equippedRelic.findUnique({
      where: { userId_slot: { userId, slot: targetSlot } },
    })
    if (existingInSlot) {
      await prisma.equippedRelic.delete({ where: { id: existingInSlot.id } })
    }

    // Déséquiper cette relique si elle était dans un autre slot
    if (relic.equippedBy) {
      await prisma.equippedRelic.delete({ where: { id: relic.equippedBy.id } })
    }

    // Équiper
    await prisma.equippedRelic.create({
      data: { userId, relicId, slot: targetSlot },
    })

    return NextResponse.json({ success: true, slot: targetSlot, bonus: EQUIP_BONUSES[relic.rarity as keyof typeof EQUIP_BONUSES] })
  }

  // ── Action : UNEQUIP ─────────────────────────────────────────────────────
  if (action === "unequip") {
    if (!relic.equippedBy) {
      return NextResponse.json({ error: "Cette relique n'est pas équipée." }, { status: 400 })
    }
    await prisma.equippedRelic.delete({ where: { id: relic.equippedBy.id } })
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: "Action inconnue." }, { status: 400 })
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 })

  const userId = session.user.id
  const { id: relicId } = await params

  const relic = await prisma.relic.findUnique({
    where:  { id: relicId },
    include: {
      historicalEvent: { select: { title: true, year: true, description: true, curiosity: true, category: true } },
      equippedBy:      { select: { slot: true } },
    },
  })

  if (!relic || relic.userId !== userId) {
    return NextResponse.json({ error: "Relique introuvable." }, { status: 404 })
  }

  const analyzeCooldownMs = relic.lastAnalyzedAt
    ? Math.max(0, ANALYZE_COOLDOWN_MS - (Date.now() - relic.lastAnalyzedAt.getTime()))
    : 0

  return NextResponse.json({
    relic: {
      ...relic,
      equippedSlot:        relic.equippedBy?.slot ?? null,
      analyzeReady:        analyzeCooldownMs === 0,
      analyzeCooldownMins: Math.ceil(analyzeCooldownMs / 60000),
      analyzeRewards:      ANALYZE_REWARDS[relic.rarity as keyof typeof ANALYZE_REWARDS],
      equipBonus:          EQUIP_BONUSES[relic.rarity as keyof typeof EQUIP_BONUSES],
    },
  })
}
