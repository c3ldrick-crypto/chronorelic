import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { CHRONOLITHE_STORIES, getStoryById } from "@/lib/game/chronolithe"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    const userId = session.user.id

    const progressRows = await prisma.chronolitheProgress.findMany({
      where:   { userId },
      orderBy: [{ status: "asc" }, { startedAt: "asc" }],
    })

    const stories = progressRows.map((row) => {
      const story = getStoryById(row.storyId)
      if (!story) return null

      const safeUnlocked = Math.min(row.unlockedSegments, story.segments.length)
      const unlockedSegments = story.segments.slice(0, safeUnlocked).map((seg) => ({
        index: seg.index,
        title: seg.title,
        text:  seg.text,
        hook:  seg.hook,
      }))

      return {
        storyId:          story.id,
        storyTitle:       story.title,
        storyIcon:        story.icon,
        theme:            story.theme,
        status:           row.status,
        unlockedSegments: safeUnlocked,
        totalSegments:    story.segments.length,
        startedAt:        row.startedAt.toISOString(),
        completedAt:      row.completedAt?.toISOString() ?? null,
        segments:         unlockedSegments,
      }
    }).filter(Boolean)

    const stats = {
      totalStories:   CHRONOLITHE_STORIES.length,
      discovered:     progressRows.length,
      inProgress:     progressRows.filter((r) => r.status === "IN_PROGRESS").length,
      completed:      progressRows.filter((r) => r.status === "COMPLETED").length,
      totalSegments:  progressRows.reduce((acc, r) => acc + r.unlockedSegments, 0),
    }

    return NextResponse.json({ stories, stats })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error("[chronolithe/route] ERROR:", msg)
    return NextResponse.json({ error: `Erreur serveur: ${msg}` }, { status: 500 })
  }
}
