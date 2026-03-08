import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { cache, REDIS_KEYS } from "@/lib/redis"
import { prisma } from "@/lib/prisma"
import { generateWindowsFromMinutes, ALL_MINUTES, type TimeWindowSet } from "@/lib/game/windows"
import { formatCaptureDate } from "@/lib/utils"

const WINDOW_TTL = 300

export async function POST() {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    const userId = session.user.id

    await cache.del(REDIS_KEYS.timeWindows(userId))
    const captureDate = formatCaptureDate()
    const capturedRelics = await prisma.relic.findMany({
      where: { userId, captureDate },
      select: { minute: true },
    })
    const capturedSet = new Set(capturedRelics.map((r: { minute: string }) => r.minute))
    const windowSet: TimeWindowSet = generateWindowsFromMinutes(ALL_MINUTES, capturedSet)
    await cache.set(REDIS_KEYS.timeWindows(userId), windowSet, WINDOW_TTL)

    return NextResponse.json({
      windows: windowSet.windows,
      expiresAt: windowSet.generatedAt + WINDOW_TTL * 1000,
      captureDate,
    })
  } catch (err) {
    console.error("[windows/refresh] POST error:", err)
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 })
  }
}
