import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { type Rarity } from "@/types"
import { levelFromXP } from "@/lib/game/xp"

// Ordre des raretés pour comparaison
const RARITY_ORDER: Rarity[] = ["COMMUNE", "RARE", "EPIQUE", "LEGENDAIRE", "MYTHIQUE"]

interface QuestDefinition {
  id:        string
  order:     number
  title:     string
  subtitle:  string
  lore:      string
  objective: { type: "capture" | "capture_rarity" | "reach_level"; count: number; rarityMin?: Rarity }
  rewards:   { xp: number }
}

const MAIN_QUESTS: QuestDefinition[] = [
  {
    id: "q1_first_capture", order: 1,
    title: "Premier Écho", subtitle: "L'Éveil du Gardien",
    lore: "Vous venez d'entendre l'appel du temps. Votre première relique vous attend.",
    objective: { type: "capture", count: 1 },
    rewards: { xp: 50 },
  },
  {
    id: "q2_five_captures", order: 2,
    title: "Collectionneur Naissant", subtitle: "Les Fondations",
    lore: "Cinq instants capturés. Votre collection prend forme.",
    objective: { type: "capture", count: 5 },
    rewards: { xp: 100 },
  },
  {
    id: "q3_first_rare", order: 3,
    title: "Qualité Temporelle", subtitle: "Au-delà du Commun",
    lore: "Une relique RARE brille d'un éclat différent dans votre collection.",
    objective: { type: "capture_rarity", count: 1, rarityMin: "RARE" },
    rewards: { xp: 200 },
  },
  {
    id: "q4_level_10", order: 4,
    title: "Gardien Confirmé", subtitle: "L'Éveil de la Rareté",
    lore: "Niveau 10 atteint. Les reliques RARES vous sont désormais accessibles.",
    objective: { type: "reach_level", count: 10 },
    rewards: { xp: 300 },
  },
  {
    id: "q5_twenty_captures", order: 5,
    title: "Archiviste du Temps", subtitle: "La Grande Collection",
    lore: "Vingt reliques. Votre bibliothèque temporelle impressionne.",
    objective: { type: "capture", count: 20 },
    rewards: { xp: 250 },
  },
  {
    id: "q6_first_epic", order: 6,
    title: "Gardien Épique", subtitle: "Le Seuil du Rare",
    lore: "Une relique ÉPIQUE vibre entre vos mains. L'histoire vous choisit.",
    objective: { type: "capture_rarity", count: 1, rarityMin: "EPIQUE" },
    rewards: { xp: 500 },
  },
  {
    id: "q7_level_20", order: 7,
    title: "Maître Temporel", subtitle: "L'Éveil Épique",
    lore: "Niveau 20. Les ÉPIQUES n'ont plus de secret pour vous.",
    objective: { type: "reach_level", count: 20 },
    rewards: { xp: 600 },
  },
  {
    id: "q8_fifty_captures", order: 8,
    title: "Historien Légendaire", subtitle: "L'Odyssée Temporelle",
    lore: "Cinquante reliques. Vous êtes devenu un véritable gardien du temps.",
    objective: { type: "capture", count: 50 },
    rewards: { xp: 750 },
  },
  {
    id: "q9_first_legendary", order: 9,
    title: "Vision du Légendaire", subtitle: "L'Éclat des Âges",
    lore: "Une relique LÉGENDAIRE. Peu de gardiens peuvent en dire autant.",
    objective: { type: "capture_rarity", count: 1, rarityMin: "LEGENDAIRE" },
    rewards: { xp: 1500 },
  },
  {
    id: "q10_level_30", order: 10,
    title: "Architecte des Âges", subtitle: "Le Palier Légendaire",
    lore: "Niveau 30. Le temps lui-même vous respecte.",
    objective: { type: "reach_level", count: 30 },
    rewards: { xp: 1000 },
  },
]

function computeProgress(
  quest: QuestDefinition,
  stats: { totalCaptures: number; characterLevel: number; rarityCountsGte: Record<string, number> }
): { current: number; target: number; done: boolean } {
  const target = quest.objective.count
  let current = 0

  switch (quest.objective.type) {
    case "capture":
      current = Math.min(stats.totalCaptures, target)
      break
    case "capture_rarity":
      current = Math.min(stats.rarityCountsGte[quest.objective.rarityMin ?? "COMMUNE"] ?? 0, target)
      break
    case "reach_level":
      current = Math.min(stats.characterLevel, target)
      break
  }

  return { current, target, done: current >= target }
}

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 })

  const userId = session.user.id

  const [character, totalCaptures, claims, rareCounts] = await Promise.all([
    prisma.character.findUnique({ where: { userId }, select: { level: true, xpTotal: true } }),
    prisma.relic.count({ where: { userId } }),
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

  const characterLevel  = levelFromXP(character.xpTotal)
  const claimedQuestIds = new Set(claims.map((c: { questId: string }) => c.questId))
  const rarityCountsGte = Object.fromEntries(rareCounts) as Record<string, number>
  const stats = { totalCaptures, characterLevel, rarityCountsGte }

  const quests = MAIN_QUESTS.map((quest) => {
    const claimed  = claimedQuestIds.has(quest.id)
    const progress = computeProgress(quest, stats)
    return { ...quest, progress: progress.current, target: progress.target, done: progress.done, claimed, available: !claimed }
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

  const alreadyClaimed = await prisma.questClaim.findUnique({
    where: { userId_questId: { userId, questId } },
  })
  if (alreadyClaimed) return NextResponse.json({ error: "Récompense déjà réclamée." }, { status: 409 })

  const [character, totalCaptures, rareCounts] = await Promise.all([
    prisma.character.findUnique({ where: { userId }, select: { id: true, xpTotal: true, level: true } }),
    prisma.relic.count({ where: { userId } }),
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
  const rarityCountsGte = Object.fromEntries(rareCounts) as Record<string, number>
  const progress = computeProgress(quest, { totalCaptures, characterLevel, rarityCountsGte })

  if (!progress.done) {
    return NextResponse.json(
      { error: `Objectif incomplet (${progress.current}/${progress.target}).` },
      { status: 400 }
    )
  }

  await prisma.$transaction(async (tx) => {
    await tx.questClaim.create({ data: { userId, questId } })
    if (quest.rewards.xp) {
      const { levelFromXP: lfx } = await import("@/lib/game/xp")
      const newXp    = character.xpTotal + quest.rewards.xp
      const newLevel = lfx(newXp)
      await tx.character.update({
        where: { id: character.id },
        data:  { xpTotal: newXp, xp: newXp, level: newLevel },
      })
    }
  })

  return NextResponse.json({ success: true, rewards: quest.rewards })
}
