import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { indexToMinute, formatCaptureDate } from "@/lib/utils"
import { getAllEventMinutes } from "@/lib/game/events"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
  }

  const userId = session.user.id
  const { searchParams } = new URL(req.url)
  const dateParam = searchParams.get("date") // "YYYY-MM-DD" for day drill-down

  // Récupérer toutes les reliques
  const relics = await prisma.relic.findMany({
    where:  { userId },
    select: { minute: true, rarity: true, captureDate: true },
    orderBy: { capturedAt: "asc" },
  })

  const eventMinutes = new Set(getAllEventMinutes())

  if (dateParam) {
    // ── Mode détail d'un jour ────────────────────────────────────────────────
    // Retourner la grille 1440 pour ce jour spécifique
    const dayRelics = relics.filter((r) => r.captureDate === dateParam || (r.captureDate === "" && dateParam === formatCaptureDate()))
    const capturedMap = new Map<string, string>()
    const rarityOrder = ["COMMUNE", "RARE", "EPIQUE", "LEGENDAIRE", "MYTHIQUE"]
    for (const r of dayRelics) {
      const existing = capturedMap.get(r.minute)
      if (!existing || rarityOrder.indexOf(r.rarity) > rarityOrder.indexOf(existing)) {
        capturedMap.set(r.minute, r.rarity)
      }
    }

    const grid = Array.from({ length: 1440 }, (_, i) => {
      const minute = indexToMinute(i)
      return {
        minute,
        captured: capturedMap.has(minute),
        rarity:   capturedMap.get(minute) ?? null,
        hasEvent: eventMinutes.has(minute),
      }
    })

    const byRarity = {
      COMMUNE:    0, RARE: 0, EPIQUE: 0, LEGENDAIRE: 0, MYTHIQUE: 0,
    } as Record<string, number>
    for (const r of capturedMap.values()) byRarity[r] = (byRarity[r] ?? 0) + 1

    return NextResponse.json({
      mode:  "day",
      date:  dateParam,
      grid,
      stats: {
        total:      capturedMap.size,
        percentage: Math.round((capturedMap.size / 1440) * 100 * 10) / 10,
        byRarity,
      },
    })
  }

  // ── Mode calendrier annuel ───────────────────────────────────────────────
  // Grouper par date de capture
  interface DayInfo {
    count:      number
    maxRarity:  string
    hasLegend:  boolean
    hasMythic:  boolean
  }
  const dayMap = new Map<string, DayInfo>()
  const rarityOrder = ["COMMUNE", "RARE", "EPIQUE", "LEGENDAIRE", "MYTHIQUE"]
  const today = formatCaptureDate()

  for (const r of relics) {
    const d = r.captureDate || today // legacy relics without captureDate count for today
    const existing = dayMap.get(d)
    if (!existing) {
      dayMap.set(d, {
        count:     1,
        maxRarity: r.rarity,
        hasLegend: r.rarity === "LEGENDAIRE" || r.rarity === "MYTHIQUE",
        hasMythic: r.rarity === "MYTHIQUE",
      })
    } else {
      existing.count++
      if (rarityOrder.indexOf(r.rarity) > rarityOrder.indexOf(existing.maxRarity)) {
        existing.maxRarity = r.rarity
      }
      if (r.rarity === "LEGENDAIRE" || r.rarity === "MYTHIQUE") existing.hasLegend = true
      if (r.rarity === "MYTHIQUE") existing.hasMythic = true
    }
  }

  // Construire le calendrier — 365 jours depuis aujourd'hui
  const calendarDays: {
    date:      string
    count:     number
    maxRarity: string | null
    hasLegend: boolean
    hasMythic: boolean
  }[] = []

  const now = new Date()
  // Build last 365 days + any historical days beyond that
  const historicalDates = new Set<string>()
  for (const d of dayMap.keys()) historicalDates.add(d)

  // Include all days with captures + last 365 days
  for (let i = 364; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const dateStr = formatCaptureDate(d)
    historicalDates.delete(dateStr) // will be included below
    const info = dayMap.get(dateStr)
    calendarDays.push({
      date:      dateStr,
      count:     info?.count      ?? 0,
      maxRarity: info?.maxRarity  ?? null,
      hasLegend: info?.hasLegend  ?? false,
      hasMythic: info?.hasMythic  ?? false,
    })
  }

  // Add any older days with captures (time travel mechanic)
  for (const d of historicalDates) {
    const info = dayMap.get(d)!
    calendarDays.unshift({
      date:      d,
      count:     info.count,
      maxRarity: info.maxRarity,
      hasLegend: info.hasLegend,
      hasMythic: info.hasMythic,
    })
  }

  // Global stats
  const totalCaptured = relics.length
  const uniqueDays     = dayMap.size
  const uniqueMinutes  = new Set(relics.map((r) => r.minute)).size

  const byRarityTotal = { COMMUNE: 0, RARE: 0, EPIQUE: 0, LEGENDAIRE: 0, MYTHIQUE: 0 } as Record<string, number>
  for (const r of relics) byRarityTotal[r.rarity] = (byRarityTotal[r.rarity] ?? 0) + 1

  return NextResponse.json({
    mode: "calendar",
    calendarDays,
    stats: {
      totalCaptured,
      uniqueDays,
      uniqueMinutes,
      totalPossible: 1440 * 365,
      byRarity: byRarityTotal,
    },
  })
}
