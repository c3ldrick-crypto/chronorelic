import { getEventForMinute } from "./events"

export interface TimeWindow {
  id: string           // "w_HH:MM"
  minute: string       // "HH:MM"
  eraHint: string      // derived era label
  energyLevel: "low" | "medium" | "high"
  riskIndicator: "safe" | "moderate" | "volatile"
}

export interface TimeWindowSet {
  windows: TimeWindow[]
  generatedAt: number
  usedWindowId: string | null
}

const ERA_LABELS: Array<{ min: number; max: number; label: string }> = [
  { min: -3000, max: 500,  label: "Antiquité" },
  { min: 501,   max: 1400, label: "Moyen Âge" },
  { min: 1401,  max: 1700, label: "Renaissance" },
  { min: 1701,  max: 1850, label: "Époque Moderne" },
  { min: 1851,  max: 1950, label: "Ère Industrielle" },
  { min: 1951,  max: 2000, label: "Ère Contemporaine" },
  { min: 2001,  max: 9999, label: "Ère Numérique" },
]

function getEraLabel(year: number | null | undefined): string {
  if (!year) return "Mystère Temporel"
  return ERA_LABELS.find(e => year >= e.min && year <= e.max)?.label ?? "Époque Inconnue"
}

// Secret minutes — for riskIndicator
const SECRET_MINUTES = new Set(["03:14", "11:11", "23:59", "00:01", "13:37", "07:07", "22:22"])

export function generateWindowsFromMinutes(
  allMinutes: string[],
  capturedTodaySet: Set<string>
): TimeWindowSet {
  const now = new Date()
  const currentH = now.getHours().toString().padStart(2, "0")
  const currentM = now.getMinutes().toString().padStart(2, "0")
  const currentMinute = `${currentH}:${currentM}`

  // Build pool: past 60 minutes (not current, not captured)
  const pool: string[] = []
  for (let i = 1; i <= 60; i++) {
    const t = new Date(now.getTime() - i * 60000)
    const hh = t.getHours().toString().padStart(2, "0")
    const mm = t.getMinutes().toString().padStart(2, "0")
    const m = `${hh}:${mm}`
    if (!capturedTodaySet.has(m) && m !== currentMinute) {
      pool.push(m)
    }
  }

  // If pool < 3, expand to uncaptured minutes from earlier today
  if (pool.length < 3) {
    for (const m of allMinutes) {
      if (!pool.includes(m) && !capturedTodaySet.has(m) && m !== currentMinute) {
        pool.push(m)
        if (pool.length >= 20) break
      }
    }
  }

  // Shuffle and pick 3
  const shuffled = pool.sort(() => Math.random() - 0.5).slice(0, 3)
  // Pad to 3 if needed
  while (shuffled.length < 3) {
    shuffled.push(currentMinute) // fallback
  }

  const windows: TimeWindow[] = shuffled.map(minute => {
    const event = getEventForMinute(minute)
    const eraHint = event ? getEraLabel(event.year) : "Époque Inconnue"
    const energyLevel: TimeWindow["energyLevel"] = event
      ? "high"
      : SECRET_MINUTES.has(minute) ? "medium" : "low"
    const riskIndicator: TimeWindow["riskIndicator"] = SECRET_MINUTES.has(minute)
      ? "volatile"
      : event ? "moderate" : "safe"
    return {
      id: `w_${minute}`,
      minute,
      eraHint,
      energyLevel,
      riskIndicator,
    }
  })

  return {
    windows,
    generatedAt: Date.now(),
    usedWindowId: null,
  }
}

// All 1440 minutes "HH:MM"
export const ALL_MINUTES: string[] = Array.from({ length: 1440 }, (_, i) => {
  const h = Math.floor(i / 60).toString().padStart(2, "0")
  const m = (i % 60).toString().padStart(2, "0")
  return `${h}:${m}`
})
