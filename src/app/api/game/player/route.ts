import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { levelFromXP } from "@/lib/game/xp"
import { FREE_LIMITS } from "@/types"
import { REDIS_KEYS, cache } from "@/lib/redis"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    const userId = session.user.id
    if (!userId) {
      return NextResponse.json({ error: "Session invalide — reconnectez-vous." }, { status: 401 })
    }

    const [user, captureCount] = await Promise.all([
      prisma.user.findUnique({
        where:  { id: userId },
        select: {
          name:           true,
          isPremium:      true,
          temporalShards: true,
          character: {
            select: {
              name:    true,
              class:   true,
              level:   true,
              xpTotal: true,
            },
          },
          streakData: {
            select: { currentStreak: true, comboCount: true, lastPlayedAt: true },
          },
          relics: {
            orderBy: { capturedAt: "desc" },
            take:    8,
            select: {
              id:         true,
              minute:     true,
              rarity:     true,
              xpGained:   true,
              capturedAt: true,
              historicalEvent: {
                select: { title: true, year: true },
              },
            },
          },
        },
      }),
      cache.get<number>(REDIS_KEYS.captureCount(userId)),
    ])

    if (!user) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 })
    }

    const capturesUsed = captureCount ?? 0
    const classBonus   = user.character?.class === "CHASSEUR" ? 5 : user.character?.class === "CHRONOMANCER" ? 3 : 0
    const maxCaptures  = user.isPremium ? Infinity : FREE_LIMITS.capturesPerDay + classBonus
    const capturesLeft = user.isPremium ? null : Math.max(0, maxCaptures - capturesUsed)

    return NextResponse.json({
      userName:     user.name ?? null,
      character:    user.character
        ? {
            ...user.character,
            level: levelFromXP(user.character.xpTotal),
          }
        : null,
      isPremium:    user.isPremium,
      temporalShards: user.temporalShards,
      capturesLeft,
      recentRelics: user.relics,
      streakCount:  user.streakData?.currentStreak ?? 0,
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error("[player/route] ERROR:", msg)
    return NextResponse.json({ error: `Erreur serveur: ${msg}` }, { status: 500 })
  }
}
