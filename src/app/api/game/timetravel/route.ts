import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma, type PrismaTx } from "@/lib/prisma"
import { CRAFT_ITEMS, RESOURCE_DROPS, RESOURCE_EVENT_BONUS, CharacterClass } from "@/types"
import { drawRarity, calculateXP, isBlessedMinute, isSecretMinute, rollJackpot } from "@/lib/game/rarity"
import { levelFromXP } from "@/lib/game/xp"
import { getEventForMinute } from "@/lib/game/events"
import { generateNarration } from "@/lib/ai/narrate"
import { z } from "zod"
import { formatCaptureDate } from "@/lib/utils"

const schema = z.object({
  itemId:    z.string(),
  // Minute cible au format "HH:MM" — optionnel pour TIME_TRAVEL_RANDOM
  targetMinute: z.string().regex(/^\d{2}:\d{2}$/).optional(),
})

function minuteFromDate(d: Date): string {
  return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", hour12: false })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
  }

  const userId = session.user.id

  let body: z.infer<typeof schema>
  try { body = schema.parse(await req.json()) }
  catch { return NextResponse.json({ error: "Données invalides." }, { status: 400 }) }

  const item = CRAFT_ITEMS.find(i => i.id === body.itemId)
  if (!item) return NextResponse.json({ error: "Objet inconnu." }, { status: 404 })

  // Vérifier l'inventaire
  const inventoryEntry = await prisma.playerInventory.findUnique({
    where: { userId_itemId: { userId, itemId: item.id } },
  })
  if (!inventoryEntry || inventoryEntry.quantity < 1) {
    return NextResponse.json({ error: "Vous ne possédez pas cet objet." }, { status: 400 })
  }

  // Charger le joueur
  const user = await prisma.user.findUnique({
    where:  { id: userId },
    select: {
      character: {
        select: {
          id: true, class: true, xpTotal: true, level: true,
          blessedMinutes: true,
          talents: { select: { talentId: true, level: true } },
        },
      },
      streakData: { select: { comboCount: true } },
    },
  })
  if (!user?.character) return NextResponse.json({ error: "Personnage introuvable." }, { status: 404 })

  // Déterminer la minute cible
  let targetMinute: string
  const now = new Date()

  if (item.effect === "TIME_TRAVEL_RANDOM") {
    // Minute aléatoire dans le timeRange (en minutes dans le passé)
    const offsetMs = Math.floor(Math.random() * (item.timeRange ?? 60)) * 60 * 1000
    const pastDate  = new Date(now.getTime() - offsetMs)
    targetMinute    = minuteFromDate(pastDate)
  } else if (body.targetMinute) {
    targetMinute = body.targetMinute
    // Vérifier que la minute est dans la plage autorisée par l'objet
    const [h, m] = targetMinute.split(":").map(Number)
    const targetMs = h * 60 * 60 * 1000 + m * 60 * 1000
    const nowMs    = now.getHours() * 60 * 60 * 1000 + now.getMinutes() * 60 * 1000
    let diffMin    = (nowMs - targetMs) / 60000
    if (diffMin < 0) diffMin += 24 * 60  // gestion du minuit
    if (diffMin > (item.timeRange ?? 60)) {
      return NextResponse.json(
        { error: `La minute ${targetMinute} est hors de portée de cet objet (max ${item.timeRange} min dans le passé).` },
        { status: 400 }
      )
    }
  } else {
    return NextResponse.json({ error: "Minute cible requise pour cet objet." }, { status: 400 })
  }

  // Vérifier que la minute n'est pas déjà capturée aujourd'hui (sauf DUPLICATE_CAPTURE)
  const captureDate = formatCaptureDate()
  if (item.effect !== "DUPLICATE_CAPTURE") {
    const existing = await prisma.relic.findUnique({
      where: { userId_captureDate_minute: { userId, captureDate, minute: targetMinute } },
    })
    if (existing) {
      return NextResponse.json(
        { error: `La minute ${targetMinute} est déjà dans votre collection.`, alreadyCaptured: true },
        { status: 409 }
      )
    }
  }

  // Tirage du succès selon le taux de l'objet
  const success = Math.random() * 100 < item.successRate

  if (!success && item.riskFail) {
    // Échec : consommer l'objet + pénalité ressources
    await prisma.$transaction([
      prisma.playerInventory.update({
        where: { userId_itemId: { userId, itemId: item.id } },
        data:  { quantity: { decrement: 1 } },
      }),
      prisma.user.update({
        where: { id: userId },
        data: {
          eclatsTemporels:     { decrement: Math.min(item.riskFail.eclatsTemporels,     999999) },
          chronite:            { decrement: Math.min(item.riskFail.chronite,            999999) },
          essencesHistoriques: { decrement: Math.min(item.riskFail.essencesHistoriques, 999999) },
        },
      }),
      prisma.auditLog.create({
        data: {
          userId, action: "TIME_TRAVEL_FAIL", resource: `item:${item.id}`,
          details: { itemId: item.id, targetMinute, lost: { ...item.riskFail } } as object,
        },
      }),
    ])
    return NextResponse.json({
      success:    false,
      message:    `Le voyage temporel a échoué. Le flux temporel a rejeté votre tentative.`,
      targetMinute,
      lost:       item.riskFail,
    })
  }

  // Succès : capturer la minute passée
  const talents = Object.fromEntries(
    user.character.talents.map((t: { talentId: string; level: number }) => [t.talentId, t.level])
  )
  const blessed  = isBlessedMinute(targetMinute, user.character.blessedMinutes)
  const isSecret = isSecretMinute(targetMinute)
  const event    = getEventForMinute(targetMinute)
  const jackpot  = rollJackpot(talents["jackpot_xp"] ?? 0)

  const rarity = drawRarity({
    characterClass:  user.character.class as CharacterClass,
    isBlessedMinute: blessed,
    talentBonuses: {
      chanceEpique:     (talents["chance_epique"]     ?? 0) * 5,
      chanceLegendaire: (talents["oracle_legendaire"] ?? 0) > 0 ? 10 : 0,
      chanceMythique:   (talents["drop_mythique"]     ?? 0) * 0.5,
    },
  })

  let xpGained = calculateXP({
    rarity,
    characterClass:     user.character.class as CharacterClass,
    hasHistoricalEvent: !!event,
    comboCount:         user.streakData?.comboCount ?? 0,
    isBlessedMinute:    blessed,
    talentDistorsion:   talents["distorsion"]      ?? 0,
    talentErudit:       talents["bonus_xp_events"] ?? 0,
    jackpotRoll:        jackpot,
  })

  // Bonus Voyage Temporel : +25% XP (récompense du risque)
  xpGained = Math.floor(xpGained * 1.25)

  const drops = { ...RESOURCE_DROPS[rarity] }
  if (event) {
    drops.eclatsTemporels     += RESOURCE_EVENT_BONUS.eclatsTemporels
    drops.chronite            += RESOURCE_EVENT_BONUS.chronite
    drops.essencesHistoriques += RESOURCE_EVENT_BONUS.essencesHistoriques
  }

  const xpBefore    = user.character.xpTotal
  const xpAfter     = xpBefore + xpGained
  const levelBefore = levelFromXP(xpBefore)
  const levelAfter  = levelFromXP(xpAfter)
  const didLevelUp  = levelAfter > levelBefore

  let narration: string | undefined
  if (rarity === "EPIQUE" || rarity === "LEGENDAIRE" || rarity === "MYTHIQUE" || (event && rarity !== "COMMUNE")) {
    narration = await generateNarration({
      minute: targetMinute, rarity,
      characterClass:  user.character.class as CharacterClass,
      event,
      isBlessedMinute: blessed,
      isSecretMinute:  isSecret,
      hasLoreEnrichi:  (talents["lore_enrichi"] ?? 0) > 0,
    }).catch(() => undefined)
  }

  const relic = await prisma.$transaction(async (tx: PrismaTx) => {
    // DUPLICATE_CAPTURE : supprimer l'ancienne puis recréer
    if (item.effect === "DUPLICATE_CAPTURE") {
      await tx.relic.deleteMany({ where: { userId, minute: targetMinute } })
    }

    const newRelic = await tx.relic.create({
      data: {
        userId,
        minute:         targetMinute,
        captureDate,
        rarity,
        xpGained,
        eclatsGained:   drops.eclatsTemporels,
        chroniteGained: drops.chronite,
        isTimeTraveled: true,
        historicalEventId: event
          ? (await tx.historicalEvent.findFirst({ where: { minute: targetMinute }, select: { id: true } }))?.id
          : undefined,
      },
      include: { historicalEvent: { select: { title: true, year: true } } },
    })

    await tx.character.update({
      where: { id: user.character!.id },
      data: {
        xpTotal:      xpAfter,
        xp:           xpAfter,
        level:        levelAfter,
        talentPoints: didLevelUp ? { increment: levelAfter - levelBefore } : undefined,
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

    // Consommer l'objet
    await tx.playerInventory.update({
      where: { userId_itemId: { userId, itemId: item.id } },
      data:  { quantity: { decrement: 1 } },
    })

    await tx.auditLog.create({
      data: {
        userId, action: "TIME_TRAVEL", resource: `relic:${newRelic.id}`,
        details: { itemId: item.id, targetMinute, rarity, xpGained },
      },
    })

    return newRelic
  })

  return NextResponse.json({
    success:    true,
    relicId:    relic.id,
    minute:     targetMinute,
    rarity,
    xpGained,
    narration,
    eventTitle: relic.historicalEvent?.title,
    eventYear:  relic.historicalEvent?.year,
    didLevelUp,
    newLevel:   didLevelUp ? levelAfter : undefined,
    drops,
    timeTraveled: true,
    relic: {
      id: relic.id, minute: targetMinute, rarity, xpGained,
      capturedAt: relic.capturedAt, isTimeTraveled: true,
      historicalEvent: relic.historicalEvent,
    },
  })
}
