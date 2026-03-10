import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma, type PrismaTx } from "@/lib/prisma"
import { captureRateLimit, REDIS_KEYS, cache } from "@/lib/redis"
import { drawRarity, calculateXP, isSecretMinute } from "@/lib/game/rarity"
import { levelFromXP } from "@/lib/game/xp"
import { getEventForMinute } from "@/lib/game/events"
import { generateNarration } from "@/lib/ai/narrate"
import { FREE_LIMITS, CharacterClass } from "@/types"
import { formatMinute, formatCaptureDate } from "@/lib/utils"
import {
  CHRONOLITHE_STORIES,
  CHRONOLITHE_DROP_CHANCE,
  MAX_ACTIVE_STORIES,
  getStoryById,
  type ChronolitheDropResult,
} from "@/lib/game/chronolithe"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    const userId = session.user.id

    // Rate limiting
    const { success: rateLimitOk } = await captureRateLimit.limit(userId)
    if (!rateLimitOk) {
      return NextResponse.json({ error: "Trop de captures. Attendez quelques secondes." }, { status: 429 })
    }

    // Parse body
    const body = await req.json().catch(() => ({})) as {
      minute?: string
    }

    // Load user
    const user = await prisma.user.findUnique({
      where:  { id: userId },
      select: {
        isPremium:  true,
        character: {
          select: {
            id:      true,
            class:   true,
            level:   true,
            xpTotal: true,
          },
        },
        streakData: { select: { comboCount: true, lastPlayedAt: true } },
      },
    })

    if (!user?.character) {
      return NextResponse.json({ error: "Personnage introuvable." }, { status: 404 })
    }

    const charLevel = user.character.level
    const charClass = user.character.class as CharacterClass

    // ── Daily capture limit (freemium) ─────────────────────────────────────────
    if (!user.isPremium) {
      const capturesKey  = REDIS_KEYS.captureCount(userId)
      const capturesUsed = (await cache.get<number>(capturesKey)) ?? 0
      const classBonus   = charClass === "CHASSEUR" ? 5 : charClass === "CHRONOMANCER" ? 3 : 0
      const maxCaptures  = FREE_LIMITS.capturesPerDay + classBonus
      if (capturesUsed >= maxCaptures) {
        return NextResponse.json(
          { error: "Limite de captures atteinte pour aujourd'hui. Revenez demain ou passez Premium !" },
          { status: 403 }
        )
      }
      const midnight = new Date(); midnight.setHours(24, 0, 0, 0)
      const ttl = Math.floor((midnight.getTime() - Date.now()) / 1000)
      await cache.set(capturesKey, capturesUsed + 1, ttl)
    }

    // ── Resolve target minute ──────────────────────────────────────────────────
    const clientMinute = typeof body.minute === "string" && /^\d{2}:\d{2}$/.test(body.minute)
      ? body.minute
      : undefined
    const minute      = clientMinute ?? formatMinute()
    const captureDate = formatCaptureDate()

    // Uniqueness check
    const existing = await prisma.relic.findUnique({
      where:  { userId_captureDate_minute: { userId, captureDate, minute } },
      select: { id: true },
    })
    if (existing) {
      return NextResponse.json(
        { error: `La minute ${minute} est déjà capturée aujourd'hui !`, alreadyCaptured: true },
        { status: 409 }
      )
    }

    const isNewDay = !user.streakData?.lastPlayedAt ||
      new Date(user.streakData.lastPlayedAt).toDateString() !== new Date().toDateString()

    // ── Rarity draw (level-gated) ─────────────────────────────────────────────
    const boostActive = !!(await cache.get(REDIS_KEYS.boostActive(userId)))
    const rarity = drawRarity({
      characterClass: charClass,
      boostActive,
      playerLevel:    charLevel,
    })

    const isSecret = isSecretMinute(minute)
    const event    = getEventForMinute(minute)

    // ── XP ──────────────────────────────────────────────────────────────────
    const xpGained = calculateXP({
      rarity,
      characterClass:     charClass,
      hasHistoricalEvent: !!event,
      comboCount:         user.streakData?.comboCount ?? 0,
    })

    // ── Level up ──────────────────────────────────────────────────────────────
    const xpBefore   = user.character.xpTotal
    const xpAfter    = xpBefore + xpGained
    const levelBefore = levelFromXP(xpBefore)
    const levelAfter  = levelFromXP(xpAfter)
    const didLevelUp  = levelAfter > levelBefore

    // ── AI narration (EPIQUE+ only) ────────────────────────────────────────────
    let narration: string | undefined
    if (rarity === "EPIQUE" || rarity === "LEGENDAIRE" || rarity === "MYTHIQUE" || (event && rarity !== "COMMUNE")) {
      narration = await generateNarration({
        minute, rarity,
        characterClass:  charClass,
        event,
        isBlessedMinute: false,
        isSecretMinute:  isSecret,
        hasLoreEnrichi:  false,
      }).catch(() => undefined)
    }

    // ── DB Transaction ────────────────────────────────────────────────────────
    const relic = await prisma.$transaction(async (tx: PrismaTx) => {
      const historicalEventSelect = { title: true, year: true, description: true, curiosity: true, category: true }

      const newRelic = await tx.relic.create({
        data: {
          userId,
          minute,
          captureDate,
          rarity,
          xpGained,
          historicalEventId: event
            ? (await tx.historicalEvent.findFirst({ where: { minute }, select: { id: true } }))?.id
            : undefined,
        },
        include: { historicalEvent: { select: historicalEventSelect } },
      })

      // Update character XP + level
      await tx.character.update({
        where: { id: user.character!.id },
        data: {
          xpTotal: xpAfter,
          xp:      xpAfter,
          level:   levelAfter,
        },
      })

      // Streak
      const lastPlay   = user.streakData?.lastPlayedAt
      const yesterday  = new Date(); yesterday.setDate(yesterday.getDate() - 1)
      const wasYesterday = lastPlay && new Date(lastPlay).toDateString() === yesterday.toDateString()
      await tx.streakData.upsert({
        where:  { userId },
        create: { userId, lastPlayedAt: new Date(), comboCount: 1, currentStreak: 1, updatedAt: new Date() },
        update: {
          lastPlayedAt:  new Date(),
          comboCount:    { increment: 1 },
          currentStreak: isNewDay ? (wasYesterday ? { increment: 1 } : 1) : undefined,
          updatedAt:     new Date(),
        },
      })

      await cache.leaderboardAdd(REDIS_KEYS.leaderboard(), userId, xpAfter).catch(() => {})
      await tx.auditLog.create({
        data: {
          userId,
          action:   "CAPTURE",
          resource: `relic:${newRelic.id}`,
          details:  { minute, rarity, xpGained },
        },
      })

      return newRelic
    })

    // ── CHRONOLITHE drop check ────────────────────────────────────────────────
    let chronolitheSegment: ChronolitheDropResult | undefined
    if (Math.random() < CHRONOLITHE_DROP_CHANCE) {
      try {
        const [activeStories, allSeen] = await Promise.all([
          prisma.chronolitheProgress.findMany({
            where:   { userId, status: "IN_PROGRESS" },
            orderBy: { startedAt: "asc" },
          }),
          prisma.chronolitheProgress.findMany({
            where:  { userId },
            select: { storyId: true, unlockedSegments: true, status: true, id: true },
          }),
        ])

        const seenIds = new Set(allSeen.map((s) => s.storyId))
        let targetStoryId: string | null = null
        let isNewStory = false

        if (activeStories.length < MAX_ACTIVE_STORIES) {
          const unseenStories = CHRONOLITHE_STORIES.filter((s) => !seenIds.has(s.id))
          if (unseenStories.length > 0) {
            const pick = unseenStories[Math.floor(Math.random() * unseenStories.length)]
            targetStoryId = pick.id
            isNewStory    = true
          } else if (activeStories.length > 0) {
            const pick = activeStories[Math.floor(Math.random() * activeStories.length)]
            targetStoryId = pick.storyId
          } else {
            const completed = allSeen.filter((s) => s.status === "COMPLETED")
            if (completed.length > 0) {
              const pick = completed[0]
              targetStoryId = pick.storyId
              await prisma.chronolitheProgress.update({
                where: { id: pick.id },
                data:  { status: "IN_PROGRESS", unlockedSegments: 0, completedAt: null },
              })
              isNewStory = true
            }
          }
        } else {
          const sorted = [...activeStories].sort((a, b) => a.unlockedSegments - b.unlockedSegments)
          targetStoryId = sorted[0].storyId
        }

        if (targetStoryId) {
          const story    = getStoryById(targetStoryId)!
          const progress = allSeen.find((s) => s.storyId === targetStoryId)

          let newSegmentIndex: number

          if (!progress || isNewStory) {
            await prisma.chronolitheProgress.upsert({
              where:  { userId_storyId: { userId, storyId: targetStoryId } },
              create: { userId, storyId: targetStoryId, unlockedSegments: 1, status: "IN_PROGRESS" },
              update: { unlockedSegments: 1, status: "IN_PROGRESS", completedAt: null },
            })
            newSegmentIndex = 1
          } else {
            newSegmentIndex = Math.min(progress.unlockedSegments + 1, story.segments.length)
            const isCompleted = newSegmentIndex >= story.segments.length
            await prisma.chronolitheProgress.update({
              where: { id: progress.id },
              data:  {
                unlockedSegments: newSegmentIndex,
                status:           isCompleted ? "COMPLETED" : "IN_PROGRESS",
                completedAt:      isCompleted ? new Date() : null,
              },
            })
          }

          const segment     = story.segments[newSegmentIndex - 1]
          const isCompleted = newSegmentIndex >= story.segments.length
          chronolitheSegment = {
            storyId:      story.id,
            storyTitle:   story.title,
            storyIcon:    story.icon,
            theme:        story.theme,
            segmentIndex: newSegmentIndex,
            segmentTitle: segment.title,
            segmentText:  segment.text,
            segmentHook:  segment.hook,
            isNewStory,
            isCompleted,
            totalSegments: story.segments.length,
          }
        }
      } catch (chronoErr) {
        console.error("[capture] Chronolithe drop failed (non-blocking):", chronoErr)
      }
    }

    // ── Enigma completion check (XP only — no resource rewards) ───────────────
    let completedEnigmas: Array<{ id: string; title: string; difficulty: string; reward: { xp: number; label: string } }> = []
    try {
      const { ENIGMAS } = await import("@/lib/game/enigmas")
      const matchingEnigmas = ENIGMAS.filter(e => e.targetMinute === minute)
      if (matchingEnigmas.length > 0) {
        const existingClaims = await prisma.questClaim.findMany({
          where:  { userId, questId: { in: matchingEnigmas.map(e => `enigma_${e.id}`) } },
          select: { questId: true },
        })
        const claimedSet = new Set(existingClaims.map(c => c.questId))
        const toResolve  = matchingEnigmas.filter(e => !claimedSet.has(`enigma_${e.id}`))

        for (const enigma of toResolve) {
          await prisma.$transaction(async (tx) => {
            await tx.questClaim.create({ data: { userId, questId: `enigma_${enigma.id}` } })
            if (enigma.reward.xp > 0) {
              await tx.character.update({
                where: { id: user.character!.id },
                data:  { xpTotal: { increment: enigma.reward.xp }, xp: { increment: enigma.reward.xp } },
              })
            }
            await tx.auditLog.create({
              data: { userId, action: "ENIGMA_SOLVED", resource: `enigma:${enigma.id}`, details: { enigmaId: enigma.id, minute } },
            })
          })
          completedEnigmas.push({ id: enigma.id, title: enigma.title, difficulty: enigma.difficulty, reward: { xp: enigma.reward.xp, label: enigma.reward.label } })
        }
      }
    } catch { /* non-blocking */ }

    // ── Chain completion check ─────────────────────────────────────────────────
    let newlyCompletedChains: Array<{ chainId: string; label: string }> = []
    try {
      const { computeChainProgress, CHAIN_DEFINITIONS } = await import("@/lib/game/chains")
      const [chainRelics, chainClaims] = await Promise.all([
        prisma.relic.findMany({
          where:  { userId },
          select: { minute: true, historicalEvent: { select: { category: true, year: true } } },
        }),
        prisma.questClaim.findMany({
          where:  { userId, questId: { startsWith: "chain_" } },
          select: { questId: true },
        }),
      ])
      const claimedIds = new Set(chainClaims.map((c: { questId: string }) => c.questId.replace("chain_", "")))
      const progress   = computeChainProgress(chainRelics, claimedIds)
      newlyCompletedChains = progress
        .filter(p => p.completed && !p.claimed)
        .map(p => ({
          chainId: p.chainId,
          label:   CHAIN_DEFINITIONS.find(c => c.id === p.chainId)?.label ?? p.chainId,
        }))
    } catch { /* ignore */ }

    return NextResponse.json({
      relicId:          relic.id,
      minute,
      rarity,
      xpGained,
      narration,
      eventTitle:       relic.historicalEvent?.title,
      eventYear:        relic.historicalEvent?.year,
      eventDescription: relic.historicalEvent?.description,
      eventCuriosity:   relic.historicalEvent?.curiosity,
      eventCategory:    relic.historicalEvent?.category,
      isMythique:       rarity === "MYTHIQUE",
      didLevelUp,
      newLevel:         didLevelUp ? levelAfter : undefined,
      completedEnigmas,
      newlyCompletedChains,
      chronolitheSegment,
      relic: {
        id: relic.id, minute, rarity, xpGained,
        capturedAt: relic.capturedAt, isFused: false,
        historicalEvent: relic.historicalEvent,
      },
    })
  } catch (err) {
    console.error("[capture] Unhandled error:", err)
    return NextResponse.json({ error: "Une erreur interne est survenue. Réessayez." }, { status: 500 })
  }
}
