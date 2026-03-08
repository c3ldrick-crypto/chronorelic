import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { CLASS_CONFIG, CharacterClass } from "@/types"
import { ANALYZE_REWARDS, ANALYZE_COOLDOWN_MS } from "@/lib/game/constants"
import { getEventForMinute } from "@/lib/game/events"

// Today's date as "YYYY-MM-DD" (UTC)
function todayUTC(): string {
  return new Date().toISOString().slice(0, 10)
}

// Resolve effective uses left for today from DB fields
function resolveUsesLeft(
  abilityUsedDate: string,
  abilityUsesLeft: number,
  effectiveUsesPerDay: number
): number {
  if (abilityUsedDate !== todayUTC()) return effectiveUsesPerDay // new day → full uses
  if (abilityUsesLeft < 0) return effectiveUsesPerDay            // never initialized
  return abilityUsesLeft
}

// ── GET — return ability status for today ────────────────────────────────────
export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 })

  const userId = session.user.id

  const character = await prisma.character.findUnique({
    where:  { userId },
    select: {
      class:           true,
      abilityUsedDate: true,
      abilityUsesLeft: true,
      talents:         { select: { talentId: true, level: true } },
    },
  })

  const charClass = (character?.class ?? "CHRONOMANCER") as CharacterClass
  const cfg       = CLASS_CONFIG[charClass]
  const ability   = cfg.activeAbility

  const talentMap = Object.fromEntries((character?.talents ?? []).map((t) => [t.talentId, t.level]))
  const extraUses =
    (charClass === "CHASSEUR" ? (talentMap["chasse_intensive"] ?? 0) : 0) +
    (charClass === "ORACLE"   ? (talentMap["prescience"]       ?? 0) : 0)
  const effectiveUsesPerDay = ability.usesPerDay + extraUses

  const usesLeft = resolveUsesLeft(
    character?.abilityUsedDate ?? "",
    character?.abilityUsesLeft ?? -1,
    effectiveUsesPerDay
  )

  return NextResponse.json({
    ability: {
      ...ability,
      usesPerDay: effectiveUsesPerDay,
      usesLeft,
      usedToday: effectiveUsesPerDay - usesLeft,
    },
  })
}

// ── POST — use active ability ────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 })

  const userId = session.user.id
  const body   = await req.json().catch(() => ({})) as { action?: string }

  const user = await prisma.user.findUnique({
    where:  { id: userId },
    select: {
      eclatsTemporels: true, chronite: true,
      essencesHistoriques: true, fragmentsAnomalie: true,
      character: {
        select: {
          id:              true,
          class:           true,
          abilityUsedDate: true,
          abilityUsesLeft: true,
          talents:         { select: { talentId: true, level: true } },
        },
      },
      relics: {
        where:  { lastAnalyzedAt: null },
        select: { id: true, rarity: true, lastAnalyzedAt: true },
        take: 100,
      },
    },
  })

  if (!user?.character) return NextResponse.json({ error: "Personnage introuvable." }, { status: 404 })

  const charClass = user.character.class as CharacterClass
  const cfg       = CLASS_CONFIG[charClass]
  const ability   = cfg.activeAbility

  if (body.action !== ability.effect) {
    return NextResponse.json({ error: "Action invalide pour cette classe." }, { status: 400 })
  }

  const talentMap = Object.fromEntries((user.character.talents).map((t) => [t.talentId, t.level]))
  const extraUses =
    (charClass === "CHASSEUR" ? (talentMap["chasse_intensive"] ?? 0) : 0) +
    (charClass === "ORACLE"   ? (talentMap["prescience"]       ?? 0) : 0)
  const effectiveUsesPerDay = ability.usesPerDay + extraUses

  const usesLeft = resolveUsesLeft(
    user.character.abilityUsedDate,
    user.character.abilityUsesLeft,
    effectiveUsesPerDay
  )

  if (usesLeft <= 0) {
    return NextResponse.json(
      { error: `Capacité épuisée. Revenez demain (${effectiveUsesPerDay} utilisation${effectiveUsesPerDay > 1 ? "s" : ""}/jour).` },
      { status: 429 }
    )
  }

  const newUsesLeft = usesLeft - 1
  const today       = todayUTC()

  // ── CHRONOMANCER: Relance Temporelle ────────────────────────────────────
  if (ability.effect === "CHRONOMANCER_REROLL") {
    await prisma.character.update({
      where: { id: user.character.id },
      data:  { rerollBonusNext: true, abilityUsedDate: today, abilityUsesLeft: newUsesLeft },
    })
    return NextResponse.json({
      success: true,
      message: "Relance Temporelle activée ! Votre prochaine capture bénéficie de +30% de bonus de rareté.",
      effect:  "CHRONOMANCER_REROLL",
      usesLeft: newUsesLeft,
    })
  }

  // ── ARCHIVISTE: Synthèse des Savoirs ────────────────────────────────────
  if (ability.effect === "ARCHIVISTE_BATCH_ANALYZE") {
    const allRelics = await prisma.relic.findMany({
      where:  { userId },
      select: { id: true, rarity: true, lastAnalyzedAt: true },
    })

    const readyRelics = allRelics.filter((r) => {
      if (!r.lastAnalyzedAt) return true
      return Date.now() - r.lastAnalyzedAt.getTime() >= ANALYZE_COOLDOWN_MS
    })

    if (readyRelics.length === 0) {
      return NextResponse.json({ error: "Aucune relique n'est prête pour l'analyse." }, { status: 400 })
    }

    const totalRewards = { eclatsTemporels: 0, chronite: 0, essencesHistoriques: 0, fragmentsAnomalie: 0 }
    for (const r of readyRelics) {
      const rewards = ANALYZE_REWARDS[r.rarity as keyof typeof ANALYZE_REWARDS]
      totalRewards.eclatsTemporels     += rewards.eclatsTemporels
      totalRewards.chronite            += rewards.chronite
      totalRewards.essencesHistoriques += rewards.essencesHistoriques
      totalRewards.fragmentsAnomalie   += rewards.fragmentsAnomalie
    }

    const now2 = new Date()
    await prisma.$transaction([
      ...readyRelics.map((r) =>
        prisma.relic.update({ where: { id: r.id }, data: { lastAnalyzedAt: now2 } })
      ),
      prisma.user.update({
        where: { id: userId },
        data: {
          eclatsTemporels:     { increment: totalRewards.eclatsTemporels     },
          chronite:            { increment: totalRewards.chronite            },
          essencesHistoriques: { increment: totalRewards.essencesHistoriques },
          fragmentsAnomalie:   { increment: totalRewards.fragmentsAnomalie   },
        },
      }),
      prisma.character.update({
        where: { id: user.character.id },
        data:  { abilityUsedDate: today, abilityUsesLeft: newUsesLeft },
      }),
    ])

    return NextResponse.json({
      success:      true,
      message:      `${readyRelics.length} relique${readyRelics.length > 1 ? "s" : ""} analysée${readyRelics.length > 1 ? "s" : ""} instantanément !`,
      effect:       "ARCHIVISTE_BATCH_ANALYZE",
      relicsCount:  readyRelics.length,
      totalRewards,
      usesLeft:     newUsesLeft,
    })
  }

  // ── CHASSEUR: Instinct de Chasse ─────────────────────────────────────────
  if (ability.effect === "CHASSEUR_GUARANTEED_RARE") {
    await prisma.character.update({
      where: { id: user.character.id },
      data:  { guaranteedRareNext: true, abilityUsedDate: today, abilityUsesLeft: newUsesLeft },
    })
    return NextResponse.json({
      success:  true,
      message:  "Instinct de Chasse activé ! Votre prochaine capture est garantie RARE ou supérieur.",
      effect:   "CHASSEUR_GUARANTEED_RARE",
      usesLeft: newUsesLeft,
    })
  }

  // ── ORACLE: Vision Prophétique ───────────────────────────────────────────
  if (ability.effect === "ORACLE_VISION") {
    const eventMinutes = [
      "02:20", "06:06", "08:15", "11:11", "12:00",
      "14:14", "16:00", "20:17", "21:21", "22:22",
      "00:00", "07:07", "09:11", "12:37", "17:30",
    ]

    const visions = eventMinutes
      .map((minute) => ({ minute, event: getEventForMinute(minute) }))
      .filter((v) => v.event !== undefined)
      .slice(0, 5)
      .map((v) => ({
        minute:      v.minute,
        title:       v.event!.title,
        year:        v.event!.year,
        description: v.event!.description,
        category:    v.event!.category,
      }))

    await prisma.character.update({
      where: { id: user.character.id },
      data:  { abilityUsedDate: today, abilityUsesLeft: newUsesLeft },
    })

    return NextResponse.json({
      success:  true,
      message:  "Vision Prophétique ! Les 5 minutes les plus chargées en énergie historique vous sont révélées.",
      effect:   "ORACLE_VISION",
      visions,
      usesLeft: newUsesLeft,
    })
  }

  return NextResponse.json({ error: "Action inconnue." }, { status: 400 })
}
