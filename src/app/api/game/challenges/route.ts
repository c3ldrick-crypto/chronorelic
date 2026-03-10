import { NextResponse }        from "next/server"
import { auth }                 from "@/auth"
import { prisma }               from "@/lib/prisma"
import { cache }                from "@/lib/redis"
import { getDailyChallenges }   from "@/lib/game/challenges"
import type { ChallengeDefinition } from "@/lib/game/challenges"

const RARITY_ORDER = ["COMMUNE", "RARE", "EPIQUE", "LEGENDAIRE", "MYTHIQUE"]

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
  }
  const userId  = session.user.id
  const today   = new Date()
  const dateStr = today.toISOString().slice(0, 10)

  const todayStart = new Date(`${dateStr}T00:00:00.000Z`)
  const todayEnd   = new Date(`${dateStr}T23:59:59.999Z`)

  const challenges = getDailyChallenges(today)

  const todayRelics = await prisma.relic.findMany({
    where: {
      userId,
      capturedAt: { gte: todayStart, lte: todayEnd },
    },
    select: {
      rarity:      true,
      capturedAt:  true,
      historicalEvent: { select: { id: true } },
    },
  })

  const claimedKey = `game:challenges:claimed:${userId}:${dateStr}`
  const claimedRaw = await cache.get<string[]>(claimedKey)
  const claimed    = Array.isArray(claimedRaw) ? claimedRaw : []

  function getProgress(c: ChallengeDefinition): number {
    switch (c.type) {
      case "captures":
        return todayRelics.length
      case "morning": {
        const before10 = todayRelics.filter(r => new Date(r.capturedAt).getUTCHours() < 10)
        return Math.min(before10.length, 1)
      }
      case "rarity": {
        const minIdx = RARITY_ORDER.indexOf(c.rarityTarget ?? "RARE")
        return todayRelics.filter(r => RARITY_ORDER.indexOf(r.rarity) >= minIdx).length
      }
      case "event":
        return todayRelics.filter(r => r.historicalEvent !== null).length
      default:
        return 0
    }
  }

  return NextResponse.json({
    challenges: challenges.map(c => {
      const progress = getProgress(c)
      return { ...c, progress, completed: progress >= c.target, claimed: claimed.includes(c.id) }
    }),
  })
}

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
  const claimedRaw = await cache.get<string[]>(claimedKey)
  const claimed    = Array.isArray(claimedRaw) ? claimedRaw : []
  if (claimed.includes(challengeId)) {
    return NextResponse.json({ error: "Défi déjà réclamé" }, { status: 409 })
  }

  const challenges = getDailyChallenges(today)
  const challenge  = challenges.find(c => c.id === challengeId)
  if (!challenge) {
    return NextResponse.json({ error: "Défi introuvable pour aujourd'hui" }, { status: 404 })
  }

  await cache.set(claimedKey, [...claimed, challengeId], 172800)

  // Reward: XP only in v2
  if (challenge.reward.xp) {
    const character = await prisma.character.findUnique({ where: { userId }, select: { id: true } })
    if (character) {
      await prisma.character.update({
        where: { id: character.id },
        data:  { xpTotal: { increment: challenge.reward.xp }, xp: { increment: challenge.reward.xp } },
      })
    }
  }

  return NextResponse.json({ success: true, reward: challenge.reward })
}
