import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma, type PrismaTx } from "@/lib/prisma"
import { CHAIN_DEFINITIONS, computeChainProgress } from "@/lib/game/chains"
import { levelFromXP } from "@/lib/game/xp"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    const userId = session.user.id

    const [relics, claimed] = await Promise.all([
      prisma.relic.findMany({
        where: { userId },
        select: {
          minute: true,
          historicalEvent: { select: { category: true, year: true } },
        },
      }),
      prisma.questClaim.findMany({
        where: { userId, questId: { startsWith: "chain_" } },
        select: { questId: true },
      }),
    ])

    const claimedIds = new Set(claimed.map((c: { questId: string }) => c.questId.replace("chain_", "")))
    const progress = computeChainProgress(relics, claimedIds)

    return NextResponse.json({
      chains: CHAIN_DEFINITIONS.map(chain => ({
        ...chain,
        progress: progress.find(p => p.chainId === chain.id),
      })),
    })
  } catch (err) {
    console.error("[chains] GET error:", err)
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    const userId = session.user.id

    const { chainId } = await req.json()
    const chain = CHAIN_DEFINITIONS.find(c => c.id === chainId)
    if (!chain) return NextResponse.json({ error: "Chaîne introuvable" }, { status: 404 })

    const questId = `chain_${chainId}`

    // Check completion
    const [relics, claimed, character] = await Promise.all([
      prisma.relic.findMany({
        where: { userId },
        select: {
          minute: true,
          historicalEvent: { select: { category: true, year: true } },
        },
      }),
      prisma.questClaim.findMany({
        where: { userId, questId: { startsWith: "chain_" } },
        select: { questId: true },
      }),
      prisma.character.findUnique({
        where: { userId },
        select: { id: true, xpTotal: true, level: true },
      }),
    ])

    if (!character) return NextResponse.json({ error: "Personnage introuvable" }, { status: 404 })

    const claimedIds = new Set(claimed.map((c: { questId: string }) => c.questId.replace("chain_", "")))

    if (claimedIds.has(chainId)) {
      return NextResponse.json({ error: "Récompense déjà réclamée." }, { status: 409 })
    }

    const progress = computeChainProgress(relics, claimedIds)
    const chainProgress = progress.find(p => p.chainId === chainId)
    if (!chainProgress?.completed) {
      return NextResponse.json(
        { error: `Chaîne incomplète (${chainProgress?.captured ?? 0}/${chainProgress?.required ?? 0}).` },
        { status: 400 }
      )
    }

    // Claim rewards in transaction
    await prisma.$transaction(async (tx: PrismaTx) => {
      await tx.questClaim.create({ data: { userId, questId } })

      const newXp = character.xpTotal + chain.reward.xp
      const newLevel = levelFromXP(newXp)
      const didLevelUp = newLevel > character.level

      await tx.character.update({
        where: { id: character.id },
        data: {
          xpTotal: newXp,
          xp:      newXp,
          level:   newLevel,
        },
      })

      await tx.auditLog.create({
        data: {
          userId,
          action:   "CHAIN_CLAIM",
          resource: `chain:${chainId}`,
          details:  { reward: chain.reward as unknown as Record<string, number> },
        },
      })
    })

    return NextResponse.json({ success: true, rewards: chain.reward })
  } catch (err: unknown) {
    // Catch Prisma P2002 double-claim constraint
    if (typeof err === "object" && err !== null && "code" in err && (err as { code: string }).code === "P2002") {
      return NextResponse.json({ error: "Récompense déjà réclamée." }, { status: 409 })
    }
    console.error("[chains] POST error:", err)
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 })
  }
}
