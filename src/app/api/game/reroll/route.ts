import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { captureRateLimit } from "@/lib/redis"
import type { CharacterClass } from "@/types"
import { drawRarity, calculateXP, isBlessedMinute, isSecretMinute } from "@/lib/game/rarity"
import { getEventForMinute } from "@/lib/game/events"
import { generateNarration } from "@/lib/ai/narrate"
import { levelFromXP } from "@/lib/game/xp"
import { formatMinute } from "@/lib/utils"
import type { PrismaTx } from "@/lib/prisma"

// La relance coûte 50 Éclats Temporels (ou gratuite pour Chronomancien)
const REROLL_SHARD_COST = 50

export async function POST() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
  }

  const userId = session.user.id

  // Rate limiting
  const { success } = await captureRateLimit.limit(userId)
  if (!success) {
    return NextResponse.json({ error: "Trop de requêtes — attendez un moment." }, { status: 429 })
  }

  const user = await prisma.user.findUnique({
    where:  { id: userId },
    select: {
      isPremium:      true,
      temporalShards: true,
      character: {
        select: {
          id:             true,
          class:          true,
          xpTotal:        true,
          blessedMinutes: true,
          talentPoints:   true,
          talents:        { select: { talentId: true, level: true } },
        },
      },
    },
  })

  if (!user?.character) {
    return NextResponse.json({ error: "Personnage introuvable" }, { status: 404 })
  }

  const character = user.character

  // Vérifier que le joueur a droit à la relance
  const isChronomancer = character.class === "CHRONOMANCER"
  const hasTalentReroll = character.talents.some(
    (t: { talentId: string }) => t.talentId === "relance_minute"
  )
  const canReroll = isChronomancer || hasTalentReroll

  if (!canReroll) {
    return NextResponse.json({ error: "Seuls les Chronomanciens peuvent relancer la minute." }, { status: 403 })
  }

  // Coût en éclats si pas Chronomancien natif mais talent relance
  if (!isChronomancer && hasTalentReroll) {
    if (user.temporalShards < REROLL_SHARD_COST) {
      return NextResponse.json({
        error: `Il vous faut ${REROLL_SHARD_COST} Éclats Temporels pour relancer.`,
      }, { status: 402 })
    }
  }

  // Obtenir la minute actuelle (relancée = même minute, rareté recalculée)
  const minute   = formatMinute()
  const blessed  = isBlessedMinute(minute, character.blessedMinutes)
  const secret   = isSecretMinute(minute)
  const unlockedTalents = Object.fromEntries(
    character.talents.map((t: { talentId: string; level: number }) => [t.talentId, t.level])
  )

  // Tirage de rareté (avec bonus de relance : boostActive = true)
  const rarity = drawRarity({
    characterClass:  character.class as CharacterClass,
    isBlessedMinute: blessed,
    boostActive:     true,
  })

  const event  = getEventForMinute(minute)
  const xpBase = calculateXP({
    rarity,
    characterClass:     character.class as CharacterClass,
    isBlessedMinute:    blessed,
    comboCount:         1,
    hasHistoricalEvent: !!event,
  })

  // Narration IA pour les raretés épiques+
  let narration: string | undefined
  if (["EPIQUE", "LEGENDAIRE", "MYTHIQUE"].includes(rarity)) {
    narration = await generateNarration({
      rarity,
      minute,
      characterClass:  character.class as CharacterClass,
      event:           event ?? undefined,
      isBlessedMinute: blessed,
      isSecretMinute:  secret,
    })
  }

  // Transaction
  const result = await prisma.$transaction(async (tx: PrismaTx) => {
    // Déduire les éclats si necessaire
    if (!isChronomancer && hasTalentReroll) {
      await tx.user.update({
        where: { id: userId },
        data:  { temporalShards: { decrement: REROLL_SHARD_COST } },
      })
    }

    // Créer la relique
    const historicalEventId = event
      ? (await tx.historicalEvent.findFirst({ where: { minute }, select: { id: true } }))?.id
      : undefined

    const relic = await tx.relic.create({
      data: {
        userId:            userId,
        minute,
        rarity,
        xpGained:          xpBase,
        isFused:           false,
        historicalEventId: historicalEventId ?? null,
      },
    })

    // XP + niveau
    const newXpTotal = character.xpTotal + xpBase
    const oldLevel   = levelFromXP(character.xpTotal)
    const newLevel   = levelFromXP(newXpTotal)
    const talentPointsGained = newLevel - oldLevel

    await tx.character.update({
      where: { id: character.id },
      data:  {
        xpTotal:      newXpTotal,
        level:        newLevel,
        talentPoints: { increment: talentPointsGained },
      },
    })

    await tx.auditLog.create({
      data: { userId, action: "REROLL_CAPTURE", resource: "relic", details: { relicId: relic.id } },
    })

    return { relic, newXpTotal, newLevel, talentPointsGained }
  })

  return NextResponse.json({
    success:         true,
    relic:           result.relic,
    minute,
    rarity,
    xpGained:        xpBase,
    narration,
    eventTitle:      event?.title,
    eventYear:       event?.year,
    newLevel:        result.newLevel,
    levelUp:         result.talentPointsGained > 0,
    shardsSpent:     isChronomancer ? 0 : REROLL_SHARD_COST,
  })
}
