import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { ECHO_STORIES, ECHO_FRAGMENTS_PER_VOICE } from "@/lib/game/echoRelic"

// GET — fetch all Echo progress for current user
export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
  }

  const userId = session.user.id

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const progress = await (prisma as any).echoRelicProgress.findMany({
    where:   { userId },
    orderBy: { createdAt: "asc" },
  })

  const total        = progress.length
  const revealed     = progress.filter(p => p.status === "REVEALED").length
  const inProgress   = progress.filter(p => p.status === "IN_PROGRESS").length
  const totalFrags   = progress.reduce((acc, p) => acc + p.fragmentsA + p.fragmentsB, 0)

  const stories = progress.map(p => {
    const story = ECHO_STORIES.find(s => s.id === p.storyId)
    return {
      storyId:    p.storyId,
      storyTitle: story?.title ?? p.storyId,
      storyIcon:  story?.icon  ?? "🔊",
      fragmentsA: p.fragmentsA,
      fragmentsB: p.fragmentsB,
      status:     p.status,
      createdAt:  p.createdAt,
    }
  })

  return NextResponse.json({ stories, stats: { total, revealed, inProgress, totalFrags } })
}

// POST — increment a fragment for a story
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
  }

  const userId = session.user.id

  const body = await req.json().catch(() => ({})) as {
    storyId?: string
    voice?:   "A" | "B"
  }

  if (!body.storyId || (body.voice !== "A" && body.voice !== "B")) {
    return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 })
  }

  const { storyId, voice } = body

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const existing = await (prisma as any).echoRelicProgress.findUnique({
    where: { userId_storyId: { userId, storyId } },
  })

  const currentA = existing?.fragmentsA ?? 0
  const currentB = existing?.fragmentsB ?? 0

  const newA = voice === "A" ? Math.min(currentA + 1, ECHO_FRAGMENTS_PER_VOICE) : currentA
  const newB = voice === "B" ? Math.min(currentB + 1, ECHO_FRAGMENTS_PER_VOICE) : currentB
  const isRevealed = newA >= ECHO_FRAGMENTS_PER_VOICE && newB >= ECHO_FRAGMENTS_PER_VOICE

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updated = await (prisma as any).echoRelicProgress.upsert({
    where:  { userId_storyId: { userId, storyId } },
    create: {
      userId,
      storyId,
      fragmentsA: newA,
      fragmentsB: newB,
      status:     isRevealed ? "REVEALED" : "IN_PROGRESS",
    },
    update: {
      fragmentsA: newA,
      fragmentsB: newB,
      status:     isRevealed ? "REVEALED" : "IN_PROGRESS",
    },
  })

  return NextResponse.json({ success: true, fragmentsA: updated.fragmentsA, fragmentsB: updated.fragmentsB, status: updated.status })
}
