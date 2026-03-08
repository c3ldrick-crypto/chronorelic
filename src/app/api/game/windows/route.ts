import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { cache, REDIS_KEYS } from "@/lib/redis"
import { generateWindowsFromMinutes, ALL_MINUTES, type TimeWindowSet } from "@/lib/game/windows"
import { formatCaptureDate } from "@/lib/utils"

const WINDOW_TTL = 300 // 5 minutes

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    const userId = session.user.id
    return NextResponse.json(await getOrCreateWindows(userId))
  } catch (err) {
    console.error("[windows] GET error:", err)
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 })
  }
}

async function getOrCreateWindows(userId: string) {
  const key = REDIS_KEYS.timeWindows(userId)
  const cached = await cache.get<TimeWindowSet>(key)
  if (cached && cached.windows.length === 3) {
    const expiresAt = cached.generatedAt + WINDOW_TTL * 1000
    return { windows: cached.windows, expiresAt, captureDate: formatCaptureDate() }
  }

  // Generate new windows
  const captureDate = formatCaptureDate()
  const capturedRelics = await prisma.relic.findMany({
    where: { userId, captureDate },
    select: { minute: true },
  })
  const capturedSet = new Set(capturedRelics.map((r: { minute: string }) => r.minute))
  const windowSet = generateWindowsFromMinutes(ALL_MINUTES, capturedSet)
  await cache.set(key, windowSet, WINDOW_TTL)

  return {
    windows: windowSet.windows,
    expiresAt: windowSet.generatedAt + WINDOW_TTL * 1000,
    captureDate,
  }
}
