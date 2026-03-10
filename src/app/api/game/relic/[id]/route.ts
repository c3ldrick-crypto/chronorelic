import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 })

  const userId = session.user.id
  const { id: relicId } = await params

  const relic = await prisma.relic.findUnique({
    where:   { id: relicId },
    include: {
      historicalEvent: { select: { title: true, year: true, description: true, curiosity: true, category: true } },
    },
  })

  if (!relic || relic.userId !== userId) {
    return NextResponse.json({ error: "Relique introuvable." }, { status: 404 })
  }

  return NextResponse.json({ relic })
}

export async function POST() {
  return NextResponse.json({ error: "Non supporté" }, { status: 410 })
}
