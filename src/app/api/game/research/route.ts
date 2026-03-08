import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { RESEARCH_TREE, isNodeUnlocked } from "@/lib/game/research"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }
    const userId = session.user.id

    const [user, researchProgress] = await Promise.all([
      prisma.user.findUnique({
        where:  { id: userId },
        select: { connaissanceTemp: true },
      }),
      prisma.researchProgress.findMany({
        where:  { userId },
        select: { nodeId: true, level: true, unlockedAt: true },
      }),
    ])

    const userLevels = Object.fromEntries(
      researchProgress.map((r: { nodeId: string; level: number }) => [r.nodeId, r.level])
    )

    const nodes = RESEARCH_TREE.map(node => ({
      ...node,
      currentLevel: userLevels[node.id] ?? 0,
      isMaxed:      (userLevels[node.id] ?? 0) >= node.maxLevel,
      isUnlocked:   isNodeUnlocked(node.id, userLevels),
      nextCost:     (userLevels[node.id] ?? 0) < node.maxLevel
        ? node.costPerLevel[userLevels[node.id] ?? 0]
        : null,
    }))

    return NextResponse.json({
      connaissance: user?.connaissanceTemp ?? 0,
      nodes,
    })
  } catch (err) {
    console.error("[research GET]", err)
    return NextResponse.json({ error: "Erreur interne." }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }
    const userId = session.user.id

    const { nodeId } = await req.json() as { nodeId: string }
    const node = RESEARCH_TREE.find(n => n.id === nodeId)
    if (!node) {
      return NextResponse.json({ error: "Nœud de recherche inconnu." }, { status: 400 })
    }

    const [user, allProgress] = await Promise.all([
      prisma.user.findUnique({
        where:  { id: userId },
        select: { connaissanceTemp: true },
      }),
      prisma.researchProgress.findMany({
        where:  { userId },
        select: { nodeId: true, level: true },
      }),
    ])

    const userLevels = Object.fromEntries(
      allProgress.map((r: { nodeId: string; level: number }) => [r.nodeId, r.level])
    )
    const currentLevel = userLevels[nodeId] ?? 0

    if (currentLevel >= node.maxLevel) {
      return NextResponse.json({ error: "Ce nœud est déjà au niveau maximum." }, { status: 400 })
    }

    if (!isNodeUnlocked(nodeId, userLevels)) {
      return NextResponse.json({ error: "Prérequis non satisfait." }, { status: 403 })
    }

    const cost = node.costPerLevel[currentLevel]
    if ((user?.connaissanceTemp ?? 0) < cost) {
      return NextResponse.json(
        { error: `Connaissance insuffisante. Requis: ${cost}, disponible: ${user?.connaissanceTemp ?? 0}.` },
        { status: 400 }
      )
    }

    const newLevel = currentLevel + 1

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data:  { connaissanceTemp: { decrement: cost } },
      })

      await tx.researchProgress.upsert({
        where:  { userId_nodeId: { userId, nodeId } },
        create: { userId, nodeId, level: newLevel, unlockedAt: new Date() },
        update: { level: newLevel },
      })
    })

    return NextResponse.json({
      success:   true,
      nodeId,
      newLevel,
      effect:    {
        type:        node.effect.type,
        value:       node.effect.value[newLevel],
        description: node.effect.description,
      },
      message: `"${node.label}" niveau ${newLevel} débloqué ! ${node.effect.description.replace("X", String(node.effect.value[newLevel]))}`,
    })
  } catch (err) {
    console.error("[research POST]", err)
    return NextResponse.json({ error: "Erreur interne." }, { status: 500 })
  }
}
