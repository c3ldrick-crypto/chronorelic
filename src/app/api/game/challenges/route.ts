import { NextResponse }        from "next/server"
import { auth }                 from "@/auth"
import { prisma }               from "@/lib/prisma"
import { cache }                from "@/lib/redis"
import { getDailyChallenges }   from "@/lib/game/challenges"
import type { ChallengeDefinition } from "@/lib/game/challenges"

const RARITY_ORDER = ["COMMUNE", "RARE", "EPIQUE", "LEGENDAIRE", "MYTHIQUE"]

// ─── GET — Progression des défis du jour ─────────────────────────────────────
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
  }
  const userId  = session.user.id
  const today   = new Date()
  const dateStr = today.toISOString().slice(0, 10)

  // Début et fin de journée UTC
  const todayStart = new Date(`${dateStr}T00:00:00.000Z`)
  const todayEnd   = new Date(`${dateStr}T23:59:59.999Z`)

  const challenges = getDailyChallenges(today)

  // ── Requête reliques d'aujourd'hui ──────────────────────────────────────────
  const todayRelics = await prisma.relic.findMany({
    where: {
      userId,
      capturedAt: { gte: todayStart, lte: todayEnd },
    },
    select: {
      rarity:      true,
      capturedAt:  true,
      captureMode: true,
      historicalEvent: { select: { id: true } },
      lastAnalyzedAt:  true,
    },
  })

  // ── Analyse aujourd'hui (reliques analysées au moins une fois aujourd'hui) ──
  const analyzedToday = await prisma.relic.count({
    where: {
      userId,
      lastAnalyzedAt: { gte: todayStart, lte: todayEnd },
    },
  })

  // ── Récolte Sanctuaire aujourd'hui ─────────────────────────────────────────
  const sanctuaire = await prisma.sanctuaire.findUnique({
    where:  { userId },
    select: { lastHarvestedAt: true },
  })
  const harvestedToday = sanctuaire?.lastHarvestedAt
    ? sanctuaire.lastHarvestedAt >= todayStart
    : false

  // ── Capacité de classe utilisée aujourd'hui ────────────────────────────────
  const character = await prisma.character.findUnique({
    where:  { userId },
    select: { abilityUsedDate: true },
  })
  const abilityUsedToday = character?.abilityUsedDate === dateStr

  // ── Défis déjà réclamés ────────────────────────────────────────────────────
  const claimedKey     = `game:challenges:claimed:${userId}:${dateStr}`
  const claimedRaw     = await cache.get<string[]>(claimedKey)
  const claimed        = Array.isArray(claimedRaw) ? claimedRaw : []

  // ── Calcul de progression par type ────────────────────────────────────────
  function getProgress(c: ChallengeDefinition): number {
    switch (c.type) {
      case "captures":
        return todayRelics.length

      case "morning": {
        const before10 = todayRelics.filter(r => {
          const h = new Date(r.capturedAt).getUTCHours()
          return h < 10
        })
        return Math.min(before10.length, 1)
      }

      case "rarity": {
        const minIdx = RARITY_ORDER.indexOf(c.rarityTarget ?? "RARE")
        return todayRelics.filter(r => RARITY_ORDER.indexOf(r.rarity) >= minIdx).length
      }

      case "event":
        return todayRelics.filter(r => r.historicalEvent !== null).length

      case "risky":
        return todayRelics.filter(r => r.captureMode === "RISKY").length

      case "ability":
        return abilityUsedToday ? 1 : 0

      case "harvest":
        return harvestedToday ? 1 : 0

      case "analyze":
        return Math.min(analyzedToday, c.target)

      default:
        return 0
    }
  }

  return NextResponse.json({
    challenges: challenges.map(c => {
      const progress = getProgress(c)
      return {
        ...c,
        progress,
        completed: progress >= c.target,
        claimed:   claimed.includes(c.id),
      }
    }),
  })
}

// ─── POST — Réclamer la récompense d'un défi complété ────────────────────────
export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
  }
  const userId = session.user.id

  const body = await req.json() as { challengeId?: string }
  const { challengeId } = body
  if (!challengeId) {
    return NextResponse.json({ error: "challengeId manquant" }, { status: 400 })
  }

  const today      = new Date()
  const dateStr    = today.toISOString().slice(0, 10)
  const claimedKey = `game:challenges:claimed:${userId}:${dateStr}`

  // Vérifier déjà réclamé
  const claimedRaw = await cache.get<string[]>(claimedKey)
  const claimed    = Array.isArray(claimedRaw) ? claimedRaw : []
  if (claimed.includes(challengeId)) {
    return NextResponse.json({ error: "Défi déjà réclamé" }, { status: 409 })
  }

  // Trouver le défi
  const challenges = getDailyChallenges(today)
  const challenge  = challenges.find(c => c.id === challengeId)
  if (!challenge) {
    return NextResponse.json({ error: "Défi introuvable pour aujourd'hui" }, { status: 404 })
  }

  // Marquer comme réclamé (TTL 48h pour sécurité)
  const newClaimed = [...claimed, challengeId]
  await cache.set(claimedKey, newClaimed, 172800)

  // Distribuer les récompenses
  const r = challenge.reward
  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data:  {
        eclatsTemporels:     r.eclatsTemporels     ? { increment: r.eclatsTemporels }     : undefined,
        chronite:            r.chronite            ? { increment: r.chronite }            : undefined,
        essencesHistoriques: r.essencesHistoriques ? { increment: r.essencesHistoriques } : undefined,
        fragmentsAnomalie:   r.fragmentsAnomalie   ? { increment: r.fragmentsAnomalie }   : undefined,
      },
    })
    if (r.talentPoints) {
      await tx.character.update({
        where: { userId },
        data:  { talentPoints: { increment: r.talentPoints } },
      })
    }
  })

  return NextResponse.json({ success: true, reward: challenge.reward })
}
