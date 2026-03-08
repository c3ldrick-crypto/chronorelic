import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma, type PrismaTx } from "@/lib/prisma"
import { Prisma } from "@/generated/prisma/client"
import {
  EXPEDITION_ERAS,
  generateRooms,
  type ActiveExpedition,
  type ExpeditionRoom,
} from "@/lib/game/expedition"
import { HISTORICAL_EVENTS } from "@/lib/game/events"
import { drawRarity, calculateXP } from "@/lib/game/rarity"
import { levelFromXP, talentPointsForLevel } from "@/lib/game/xp"
import { formatCaptureDate } from "@/lib/utils"
import { RESOURCE_DROPS, RESOURCE_EVENT_BONUS, type Resources } from "@/types"

// ── DB helpers — expedition state stored in Character.activeExpeditionData ──

async function getCharacterExpedition(userId: string) {
  return prisma.character.findUnique({
    where:  { userId },
    select: {
      id:                    true,
      level:                 true,
      xpTotal:               true,
      class:                 true,
      activeExpeditionData:  true,
      expeditionCooldowns:   true,
    },
  })
}

function readExpedition(char: { activeExpeditionData: unknown }): ActiveExpedition | null {
  if (!char.activeExpeditionData) return null
  return char.activeExpeditionData as ActiveExpedition
}

function readCooldowns(char: { expeditionCooldowns: unknown }): Record<string, number> {
  if (!char.expeditionCooldowns || typeof char.expeditionCooldowns !== "object") return {}
  return char.expeditionCooldowns as Record<string, number>
}

// ── GET ───────────────────────────────────────────────────────────────────────
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    const userId = session.user.id

    const [char, user] = await Promise.all([
      getCharacterExpedition(userId),
      prisma.user.findUnique({
        where:  { id: userId },
        select: {
          eclatsTemporels: true, chronite: true,
          essencesHistoriques: true, fragmentsAnomalie: true,
        },
      }),
    ])

    const active    = char ? readExpedition(char) : null
    const cooldowns = char ? readCooldowns(char)  : {}
    const now       = Date.now()

    const resources: Resources = {
      eclatsTemporels:     user?.eclatsTemporels     ?? 0,
      chronite:            user?.chronite            ?? 0,
      essencesHistoriques: user?.essencesHistoriques ?? 0,
      fragmentsAnomalie:   user?.fragmentsAnomalie   ?? 0,
    }
    const level = char?.level ?? 1

    const eras = EXPEDITION_ERAS.map(era => {
      const expiry       = cooldowns[era.id] ?? null
      const onCooldown   = expiry !== null && expiry > now
      const cooldownUntil = onCooldown ? expiry : null
      return {
        ...era,
        cooldownUntil,
        onCooldown,
        canAfford:
          resources.eclatsTemporels >= era.entryCost.eclatsTemporels &&
          resources.chronite >= era.entryCost.chronite,
        levelOk: level >= era.requiredLevel,
      }
    })

    return NextResponse.json({ active, eras, resources, level })
  } catch (err) {
    console.error("[expedition] GET error:", err)
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 })
  }
}

// ── POST ──────────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    const userId = session.user.id

    const body = await req.json()
    const { action } = body as { action: string; eraId?: string }

    if (action === "start")   return handleStart(userId, body.eraId)
    if (action === "advance") return handleAdvance(userId)
    if (action === "abandon") return handleAbandon(userId)
    if (action === "dismiss") return handleDismiss(userId)

    return NextResponse.json({ error: "Action invalide" }, { status: 400 })
  } catch (err) {
    console.error("[expedition] POST error:", err)
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 })
  }
}

// ── handleStart ───────────────────────────────────────────────────────────────
async function handleStart(userId: string, eraId: string | undefined) {
  if (!eraId) return NextResponse.json({ error: "eraId requis" }, { status: 400 })

  const era = EXPEDITION_ERAS.find(e => e.id === eraId)
  if (!era) return NextResponse.json({ error: "Ère introuvable" }, { status: 404 })

  const char = await getCharacterExpedition(userId)
  if (!char) return NextResponse.json({ error: "Personnage introuvable" }, { status: 404 })

  // Check existing active expedition
  const existing = readExpedition(char)
  if (existing && existing.status === "active") {
    return NextResponse.json({ error: "Vous avez déjà une expédition en cours." }, { status: 409 })
  }

  // Check cooldown
  const cooldowns = readCooldowns(char)
  const expiry    = cooldowns[eraId] ?? null
  if (expiry && expiry > Date.now()) {
    return NextResponse.json({ error: "Cette ère est en cooldown. Revenez plus tard." }, { status: 400 })
  }

  if (char.level < era.requiredLevel) {
    return NextResponse.json({ error: `Niveau ${era.requiredLevel} requis pour cette ère.` }, { status: 403 })
  }

  const user = await prisma.user.findUnique({
    where:  { id: userId },
    select: { eclatsTemporels: true, chronite: true },
  })
  if (!user) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 })

  if (
    user.eclatsTemporels < era.entryCost.eclatsTemporels ||
    user.chronite < era.entryCost.chronite
  ) {
    return NextResponse.json({ error: "Ressources insuffisantes pour entrer dans cette ère." }, { status: 400 })
  }

  const rooms: ExpeditionRoom[] = generateRooms()
  const expedition: ActiveExpedition = {
    userId,
    eraId,
    status:           "active",
    currentRoomIndex: 0,
    rooms,
    startedAt:        Date.now(),
    resourcesSpent:   { eclatsTemporels: era.entryCost.eclatsTemporels, chronite: era.entryCost.chronite },
    rarityBonus:      era.rarityBonus,
  }

  // Set 24h cooldown for this era
  const newCooldowns = { ...cooldowns, [eraId]: Date.now() + 24 * 3600 * 1000 }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: {
        eclatsTemporels: { decrement: era.entryCost.eclatsTemporels },
        chronite:        { decrement: era.entryCost.chronite },
      },
    }),
    prisma.character.update({
      where: { id: char.id },
      data: {
        activeExpeditionData: expedition as object,
        expeditionCooldowns:  newCooldowns as object,
      },
    }),
    prisma.auditLog.create({
      data: {
        userId,
        action:   "EXPEDITION_START",
        resource: `expedition:${eraId}`,
        details:  { eraId, cost: era.entryCost },
      },
    }),
  ])

  return NextResponse.json({ expedition })
}

// ── handleAdvance ─────────────────────────────────────────────────────────────
async function handleAdvance(userId: string) {
  const char = await getCharacterExpedition(userId)
  if (!char) return NextResponse.json({ error: "Personnage introuvable" }, { status: 404 })

  const expedition = readExpedition(char)
  if (!expedition) return NextResponse.json({ error: "Aucune expédition active." }, { status: 404 })
  if (expedition.status !== "active") return NextResponse.json({ error: "Expédition terminée." }, { status: 400 })

  const roomIdx = expedition.currentRoomIndex
  if (roomIdx >= expedition.rooms.length) {
    return NextResponse.json({ error: "Toutes les salles ont été complétées." }, { status: 400 })
  }

  const era  = EXPEDITION_ERAS.find(e => e.id === expedition.eraId)!
  const room: ExpeditionRoom = expedition.rooms[roomIdx]!

  const user = await prisma.user.findUnique({
    where:  { id: userId },
    select: {
      eclatsTemporels: true, chronite: true,
      essencesHistoriques: true, fragmentsAnomalie: true,
      character: {
        select: {
          id: true, class: true, level: true,
          xpTotal: true, blessedMinutes: true,
        },
      },
    },
  })
  if (!user?.character) return NextResponse.json({ error: "Personnage introuvable" }, { status: 404 })

  let roomResult: Partial<ExpeditionRoom> = {}

  if (room.type === "TREASURE") {
    const treasure: Partial<Resources> = {
      eclatsTemporels: Math.round(era.entryCost.eclatsTemporels * 0.5) + 30,
      chronite:        Math.round(era.entryCost.chronite * 0.5) + 5,
    }
    await prisma.user.update({
      where: { id: userId },
      data: {
        eclatsTemporels: { increment: treasure.eclatsTemporels ?? 0 },
        chronite:        { increment: treasure.chronite ?? 0 },
      },
    })
    roomResult = { treasureAwarded: treasure }

  } else if (room.type === "ANOMALY") {
    const { getTodayAnomalies } = await import("@/lib/game/anomalies")
    const todayAnomalies = getTodayAnomalies()
    const anomaly = todayAnomalies[Math.floor(Math.random() * 2)]!
    // Give a small anomaly bonus
    await prisma.user.update({
      where: { id: userId },
      data: { eclatsTemporels: { increment: 20 }, fragmentsAnomalie: { increment: 1 } },
    })
    roomResult = { anomalyId: anomaly.id }

  } else {
    // SAFE_CAPTURE, RISKY_CAPTURE, BOSS
    const isBoss  = room.type === "BOSS"
    const isRisky = room.type === "RISKY_CAPTURE"

    // Pick a minute from era's historical events
    const eraEvents = HISTORICAL_EVENTS.filter(
      e => e.year >= era.eraMinYear && e.year <= era.eraMaxYear
    )
    let minute: string
    let hasHistoricalEvent = false

    if (eraEvents.length > 0) {
      const picked = eraEvents[Math.floor(Math.random() * eraEvents.length)]!
      minute = picked.minute
      hasHistoricalEvent = true
    } else {
      const idx = Math.floor(Math.random() * 1440)
      const h = Math.floor(idx / 60).toString().padStart(2, "0")
      const m = (idx % 60).toString().padStart(2, "0")
      minute = `${h}:${m}`
    }

    // Avoid duplicate in today's relics
    const captureDate = formatCaptureDate()
    for (let attempt = 0; attempt < 5; attempt++) {
      const dup = await prisma.relic.findUnique({
        where:  { userId_captureDate_minute: { userId, captureDate, minute } },
        select: { id: true },
      })
      if (!dup) break
      if (eraEvents.length > 1) {
        const picked = eraEvents[Math.floor(Math.random() * eraEvents.length)]!
        minute = picked.minute
        hasHistoricalEvent = true
      } else {
        const idx = Math.floor(Math.random() * 1440)
        minute = `${Math.floor(idx / 60).toString().padStart(2, "0")}:${(idx % 60).toString().padStart(2, "0")}`
        hasHistoricalEvent = false
      }
    }

    // Risky: 30% fail chance (no relic but still advance)
    if (isRisky && Math.random() < 0.3) {
      room.cleared = true
      expedition.rooms[roomIdx] = room
      expedition.currentRoomIndex = roomIdx + 1
      if (expedition.currentRoomIndex >= expedition.rooms.length) expedition.status = "completed"
      await prisma.character.update({
        where: { id: char.id },
        data:  { activeExpeditionData: expedition as object },
      })
      return NextResponse.json({ expedition, roomResult: { failed: true }, room })
    }

    // Rarity: expedition guarantees RARE+ for BOSS rooms, boosted odds otherwise
    const rarity = drawRarity({
      characterClass:  user.character.class as import("@/types").CharacterClass,
      isBlessedMinute: user.character.blessedMinutes.includes(minute),
      guaranteedRare:  isBoss, // Boss rooms always RARE+
      talentBonuses: {
        chanceLegendaire: era.rarityBonus + (isBoss ? 40 : 0),
        chanceEpique:     isBoss ? 20 : 10,
        chanceRare:       isRisky ? 20 : 10, // Risky rooms have extra RARE chance
      },
    })

    const xpGained = calculateXP({
      rarity,
      characterClass:     user.character.class as import("@/types").CharacterClass,
      hasHistoricalEvent,
    })
    const drops = { ...RESOURCE_DROPS[rarity] }
    if (hasHistoricalEvent) {
      drops.eclatsTemporels     += RESOURCE_EVENT_BONUS.eclatsTemporels
      drops.chronite            += RESOURCE_EVENT_BONUS.chronite
      drops.essencesHistoriques += RESOURCE_EVENT_BONUS.essencesHistoriques
    }
    // Boss rooms give 2× drops
    if (isBoss) {
      drops.eclatsTemporels     *= 2
      drops.chronite            *= 2
      drops.essencesHistoriques *= 2
      drops.fragmentsAnomalie   *= 2
    }

    const xpBefore    = user.character.xpTotal
    const xpAfter     = xpBefore + xpGained
    const levelBefore = levelFromXP(xpBefore)
    const levelAfter  = levelFromXP(xpAfter)
    const didLevelUp  = levelAfter > levelBefore

    const relic = await prisma.$transaction(async (tx: PrismaTx) => {
      let histEventId: string | undefined
      if (hasHistoricalEvent) {
        const he = await tx.historicalEvent.findFirst({ where: { minute }, select: { id: true } })
        histEventId = he?.id
      }
      const newRelic = await tx.relic.create({
        data: {
          userId,
          minute,
          captureDate,
          rarity,
          xpGained,
          eclatsGained:   drops.eclatsTemporels,
          chroniteGained: drops.chronite,
          captureMode:    isRisky ? "RISKY" : "SAFE",
          historicalEventId: histEventId,
        },
      })
      await tx.character.update({
        where: { id: user.character!.id },
        data: {
          xpTotal:      xpAfter,
          xp:           xpAfter,
          level:        levelAfter,
          talentPoints: didLevelUp
            ? { increment: talentPointsForLevel(levelAfter) - talentPointsForLevel(levelBefore) }
            : undefined,
        },
      })
      await tx.user.update({
        where: { id: userId },
        data: {
          eclatsTemporels:     { increment: drops.eclatsTemporels },
          chronite:            { increment: drops.chronite },
          essencesHistoriques: { increment: drops.essencesHistoriques },
          fragmentsAnomalie:   { increment: drops.fragmentsAnomalie },
        },
      })
      return newRelic
    })

    roomResult = { relicObtained: { relicId: relic.id, rarity, minute, xpGained } }
  }

  // Mark room cleared and advance
  room.cleared = true
  Object.assign(expedition.rooms[roomIdx]!, roomResult)
  expedition.currentRoomIndex = roomIdx + 1

  let completionBonus: { xp: number; eclats: number } | undefined
  if (expedition.currentRoomIndex >= expedition.rooms.length) {
    expedition.status = "completed"
    // Completion bonus scales with era
    const bonusXp     = 150 + era.requiredLevel * 50
    const bonusEclats = 80  + era.requiredLevel * 30
    completionBonus = { xp: bonusXp, eclats: bonusEclats }

    await prisma.$transaction(async (tx: PrismaTx) => {
      const c = await tx.character.findUnique({ where: { userId }, select: { id: true, xpTotal: true, level: true } })
      if (c) {
        const newXp = c.xpTotal + bonusXp
        const newLv = levelFromXP(newXp)
        await tx.character.update({
          where: { id: c.id },
          data: { xpTotal: newXp, xp: newXp, level: newLv, activeExpeditionData: expedition as object },
        })
      }
      await tx.user.update({
        where: { id: userId },
        data: { eclatsTemporels: { increment: bonusEclats } },
      })
    })
  } else {
    await prisma.character.update({
      where: { id: char.id },
      data:  { activeExpeditionData: expedition as object },
    })
  }

  await prisma.auditLog.create({
    data: {
      userId,
      action:   "EXPEDITION_ADVANCE",
      resource: `expedition:${expedition.eraId}:room${roomIdx}`,
      details:  { roomType: room.type, result: roomResult },
    },
  })

  return NextResponse.json({ expedition, roomResult, room: expedition.rooms[roomIdx], completionBonus })
}

// ── handleAbandon ─────────────────────────────────────────────────────────────
async function handleAbandon(userId: string) {
  const char = await getCharacterExpedition(userId)
  if (!char) return NextResponse.json({ error: "Personnage introuvable" }, { status: 404 })

  const expedition = readExpedition(char)
  if (!expedition) return NextResponse.json({ error: "Aucune expédition active." }, { status: 404 })

  await prisma.$transaction([
    prisma.character.update({
      where: { id: char.id },
      data:  { activeExpeditionData: Prisma.DbNull },
    }),
    prisma.auditLog.create({
      data: {
        userId,
        action:   "EXPEDITION_ABANDON",
        resource: `expedition:${expedition.eraId}`,
        details:  { roomsCleared: expedition.currentRoomIndex },
      },
    }),
  ])

  return NextResponse.json({ success: true, message: "Expédition abandonnée." })
}

// ── handleDismiss — clear completed/abandoned expedition from DB ────────────
async function handleDismiss(userId: string) {
  const char = await getCharacterExpedition(userId)
  if (!char) return NextResponse.json({ error: "Personnage introuvable" }, { status: 404 })

  await prisma.character.update({
    where: { id: char.id },
    data:  { activeExpeditionData: Prisma.DbNull },
  })

  return NextResponse.json({ success: true })
}
