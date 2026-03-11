import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { HERO_STORIES, getHeroStory } from "@/lib/game/heroRelic"

// GET — récupère toute la progression HERO de l'utilisateur
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 })

    const userId = session.user.id
    const rows = await prisma.heroRelicProgress.findMany({
      where: { userId },
      orderBy: [{ status: "asc" }, { startedAt: "asc" }],
    })

    const stories = rows.map((row) => {
      const story = getHeroStory(row.storyId)
      if (!story) return null
      return {
        storyId:        story.id,
        storyTitle:     story.title,
        storyIcon:      story.icon,
        storyTheme:     story.theme,
        difficulty:     story.difficulty,
        era:            story.era,
        year:           story.year,
        status:         row.status,
        endType:        row.endType,
        currentSegment: row.currentSegment,
        choicesPath:    row.choicesPath,
        startedAt:      row.startedAt.toISOString(),
        completedAt:    row.completedAt?.toISOString() ?? null,
      }
    }).filter(Boolean)

    const stats = {
      totalStories:        HERO_STORIES.length,
      discovered:          rows.length,
      inProgress:          rows.filter(r => r.status === "IN_PROGRESS").length,
      completedHistorical: rows.filter(r => r.status === "COMPLETED" && r.endType === "HISTORICAL").length,
      completedAlternate:  rows.filter(r => r.status === "COMPLETED" && r.endType === "ALTERNATE").length,
      dead:                rows.filter(r => r.status === "DEAD").length,
    }

    return NextResponse.json({ stories, stats })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: `Erreur serveur: ${msg}` }, { status: 500 })
  }
}

// POST — sauvegarde la progression d'une histoire HERO
export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 })

    const userId = session.user.id
    const body = await req.json()
    const { storyId, currentSegment, choicesPath, status, endType } = body as {
      storyId?: string
      currentSegment?: string
      choicesPath?: string[]
      status?: string
      endType?: string
    }

    if (!storyId || !currentSegment) {
      return NextResponse.json({ error: "storyId et currentSegment requis" }, { status: 400 })
    }

    const story = getHeroStory(storyId)
    if (!story) return NextResponse.json({ error: "Histoire introuvable" }, { status: 404 })

    const completedAt = (status === "COMPLETED" || status === "DEAD") ? new Date() : undefined

    const progress = await prisma.heroRelicProgress.upsert({
      where: { userId_storyId: { userId, storyId } },
      create: {
        userId,
        storyId,
        currentSegment,
        choicesPath: choicesPath ?? [],
        status: (status ?? "IN_PROGRESS") as "IN_PROGRESS" | "COMPLETED" | "DEAD",
        endType: (endType ?? null) as "HISTORICAL" | "ALTERNATE" | null,
        completedAt,
      },
      update: {
        currentSegment,
        choicesPath: choicesPath ?? [],
        status: (status ?? "IN_PROGRESS") as "IN_PROGRESS" | "COMPLETED" | "DEAD",
        endType: (endType ?? null) as "HISTORICAL" | "ALTERNATE" | null,
        ...(completedAt ? { completedAt } : {}),
      },
    })

    return NextResponse.json({ success: true, progress })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: `Erreur serveur: ${msg}` }, { status: 500 })
  }
}
