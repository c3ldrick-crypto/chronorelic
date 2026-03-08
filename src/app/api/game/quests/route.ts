import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma, type PrismaTx } from "@/lib/prisma"
import { MAIN_QUESTS, type QuestDefinition, type Rarity, type Resources } from "@/types"
import { levelFromXP } from "@/lib/game/xp"

// Ordre des raretés pour comparaison
const RARITY_ORDER: Rarity[] = ["COMMUNE", "RARE", "EPIQUE", "LEGENDAIRE", "MYTHIQUE"]
function rarityGte(a: Rarity, min: Rarity): boolean {
  return RARITY_ORDER.indexOf(a) >= RARITY_ORDER.indexOf(min)
}

// Calcule la progression actuelle d'un objectif de quête
function computeProgress(
  quest: QuestDefinition,
  stats: {
    totalCaptures: number
    riskyCaptures: number
    characterLevel: number
    rarityCountsGte: Record<Rarity, number>
  }
): { current: number; target: number; done: boolean } {
  const { type, count, rarityMin } = quest.objective
  const target = count

  let current = 0
  switch (type) {
    case "capture":
      current = Math.min(stats.totalCaptures, target)
      break
    case "capture_rarity":
      current = Math.min(stats.rarityCountsGte[rarityMin!] ?? 0, target)
      break
    case "reach_level":
      current = Math.min(stats.characterLevel, target)
      break
    case "use_risky":
      current = Math.min(stats.riskyCaptures, target)
      break
  }

  return { current, target, done: current >= target }
}

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 })

  const userId = session.user.id

  const [character, totalCaptures, riskyCaptures, claims, rareCounts] = await Promise.all([
    prisma.character.findUnique({
      where:  { userId },
      select: { level: true, xpTotal: true },
    }),
    prisma.relic.count({ where: { userId } }),
    prisma.relic.count({ where: { userId, captureMode: "RISKY" } }),
    prisma.questClaim.findMany({ where: { userId }, select: { questId: true } }),
    Promise.all(
      (["RARE", "EPIQUE", "LEGENDAIRE", "MYTHIQUE"] as Rarity[]).map(async (r) => {
        const rarities = RARITY_ORDER.slice(RARITY_ORDER.indexOf(r)) as Rarity[]
        const count = await prisma.relic.count({ where: { userId, rarity: { in: rarities } } })
        return [r, count] as [Rarity, number]
      })
    ),
  ])

  if (!character) return NextResponse.json({ error: "Personnage introuvable" }, { status: 404 })

  const characterLevel   = levelFromXP(character.xpTotal)
  const claimedQuestIds  = new Set(claims.map((c: { questId: string }) => c.questId))
  const rarityCountsGte  = Object.fromEntries(rareCounts) as Record<Rarity, number>

  const stats = { totalCaptures, riskyCaptures, characterLevel, rarityCountsGte }

  // Construire la liste des quêtes avec progression
  const quests = MAIN_QUESTS.map((quest, idx) => {
    const claimed  = claimedQuestIds.has(quest.id)
    const progress = computeProgress(quest, stats)

    // Toutes les quêtes sont accessibles simultanément (non bloquantes)
    const available = !claimed

    return {
      ...quest,
      progress: progress.current,
      target:   progress.target,
      done:     progress.done,
      claimed,
      available,
    }
  })

  return NextResponse.json({ quests, characterLevel })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 })

  const userId = session.user.id
  const { questId } = await req.json()

  const quest = MAIN_QUESTS.find((q) => q.id === questId)
  if (!quest) return NextResponse.json({ error: "Quête introuvable" }, { status: 404 })

  // Vérifier que la quête n'est pas déjà réclamée
  const alreadyClaimed = await prisma.questClaim.findUnique({
    where: { userId_questId: { userId, questId } },
  })
  if (alreadyClaimed) return NextResponse.json({ error: "Récompense déjà réclamée." }, { status: 409 })

  // Récupérer les stats pour vérifier completion
  const [character, totalCaptures, riskyCaptures, rareCounts] = await Promise.all([
    prisma.character.findUnique({ where: { userId }, select: { id: true, xpTotal: true, level: true, talentPoints: true } }),
    prisma.relic.count({ where: { userId } }),
    prisma.relic.count({ where: { userId, captureMode: "RISKY" } }),
    Promise.all(
      (["RARE", "EPIQUE", "LEGENDAIRE", "MYTHIQUE"] as Rarity[]).map(async (r) => {
        const rarities = RARITY_ORDER.slice(RARITY_ORDER.indexOf(r)) as Rarity[]
        const count = await prisma.relic.count({ where: { userId, rarity: { in: rarities } } })
        return [r, count] as [Rarity, number]
      })
    ),
  ])
  if (!character) return NextResponse.json({ error: "Personnage introuvable" }, { status: 404 })

  const characterLevel  = levelFromXP(character.xpTotal)
  const rarityCountsGte = Object.fromEntries(rareCounts) as Record<Rarity, number>
  const stats = { totalCaptures, riskyCaptures, characterLevel, rarityCountsGte }
  const progress = computeProgress(quest, stats)

  if (!progress.done) {
    return NextResponse.json(
      { error: `Objectif incomplet (${progress.current}/${progress.target}).` },
      { status: 400 }
    )
  }

  // Distribuer les récompenses dans une transaction
  await prisma.$transaction(async (tx: PrismaTx) => {
    // Marquer comme réclamée
    await tx.questClaim.create({ data: { userId, questId } })

    // XP
    if (quest.rewards.xp) {
      const newXp    = character.xpTotal + quest.rewards.xp
      const newLevel = levelFromXP(newXp)
      const didLevelUp = newLevel > character.level
      await tx.character.update({
        where: { id: character.id },
        data: {
          xpTotal:      newXp,
          xp:           newXp,
          level:        newLevel,
          talentPoints: didLevelUp ? { increment: newLevel - character.level } : undefined,
        },
      })
    }

    // Talent points supplémentaires
    if (quest.rewards.talentPoints) {
      await tx.character.update({
        where: { id: character.id },
        data:  { talentPoints: { increment: quest.rewards.talentPoints } },
      })
    }

    // Ressources
    if (quest.rewards.resources) {
      const r = quest.rewards.resources as Partial<Resources>
      await tx.user.update({
        where: { id: userId },
        data: {
          eclatsTemporels:     r.eclatsTemporels     ? { increment: r.eclatsTemporels }     : undefined,
          chronite:            r.chronite            ? { increment: r.chronite }            : undefined,
          essencesHistoriques: r.essencesHistoriques ? { increment: r.essencesHistoriques } : undefined,
          fragmentsAnomalie:   r.fragmentsAnomalie   ? { increment: r.fragmentsAnomalie }   : undefined,
        },
      })
    }

    // Items
    if (quest.rewards.items) {
      for (const item of quest.rewards.items) {
        await tx.playerInventory.upsert({
          where:  { userId_itemId: { userId, itemId: item.itemId } },
          update: { quantity: { increment: item.quantity } },
          create: { userId, itemId: item.itemId, quantity: item.quantity },
        })
      }
    }
  })

  return NextResponse.json({ success: true, rewards: quest.rewards })
}
