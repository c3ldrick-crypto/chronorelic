"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { Rarity, RARITY_CONFIG } from "@/types"
import { RarityBadge } from "@/components/game/RarityBadge"
import { cn } from "@/lib/utils"
import { BookOpen, Calendar, ChevronLeft } from "lucide-react"

interface CalendarDay {
  date:      string
  count:     number
  maxRarity: string | null
  hasLegend: boolean
  hasMythic: boolean
}

interface CalendarStats {
  totalCaptured: number
  uniqueDays:    number
  uniqueMinutes: number
  totalPossible: number
  byRarity:      Record<string, number>
}

interface GridCell {
  minute:   string
  captured: boolean
  rarity:   Rarity | null
  hasEvent: boolean
}

interface DayStats {
  total:      number
  percentage: number
  byRarity:   Record<string, number>
}

// Colors for heatmap cells by rarity
const RARITY_HEATMAP: Record<string, string> = {
  COMMUNE:    "bg-slate-600/70",
  RARE:       "bg-blue-600/80",
  EPIQUE:     "bg-violet-600/90",
  LEGENDAIRE: "bg-amber-500",
  MYTHIQUE:   "bg-pink-500",
}

const RARITY_GRID: Record<string, string> = {
  COMMUNE:    "bg-slate-600/60",
  RARE:       "bg-blue-600/60",
  EPIQUE:     "bg-violet-600/70",
  LEGENDAIRE: "bg-amber-500/70",
  MYTHIQUE:   "bg-pink-500/80",
}

const MONTHS_FR = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Aoû", "Sep", "Oct", "Nov", "Déc"]

function getIntensity(count: number): string {
  if (count === 0) return "bg-[#1e1e42]/60"
  if (count <= 2)  return "bg-violet-900/70"
  if (count <= 5)  return "bg-violet-700/80"
  if (count <= 10) return "bg-violet-600/90"
  return "bg-violet-500"
}

export default function CollectionPage() {
  const [loading, setLoading] = useState(true)
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([])
  const [stats, setStats] = useState<CalendarStats | null>(null)

  // Drill-down state
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [dayGrid, setDayGrid] = useState<GridCell[]>([])
  const [dayStats, setDayStats] = useState<DayStats | null>(null)
  const [dayLoading, setDayLoading] = useState(false)
  const [hoveredDay, setHoveredDay] = useState<CalendarDay | null>(null)
  const [hoveredCell, setHoveredCell] = useState<GridCell | null>(null)
  const [filter, setFilter] = useState<Rarity | "ALL" | "EVENTS">("ALL")

  useEffect(() => {
    fetch("/api/game/collection")
      .then((r) => r.json())
      .then((d) => {
        setCalendarDays(d.calendarDays)
        setStats(d.stats)
        setLoading(false)
      })
      .catch(() => {
        toast.error("Impossible de charger la collection")
        setLoading(false)
      })
  }, [])

  const openDay = useCallback((date: string) => {
    setSelectedDate(date)
    setDayLoading(true)
    setFilter("ALL")
    fetch(`/api/game/collection?date=${date}`)
      .then((r) => r.json())
      .then((d) => {
        setDayGrid(d.grid)
        setDayStats(d.stats)
        setDayLoading(false)
      })
      .catch(() => {
        toast.error("Erreur de chargement")
        setDayLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="text-4xl">⏳</motion.div>
      </div>
    )
  }

  // ── Vue calendrier ────────────────────────────────────────────────────────
  if (!selectedDate) {
    // Group days into weeks for GitHub-style grid
    const weeks: CalendarDay[][] = []
    let week: CalendarDay[] = []

    // Pad the beginning to start on Monday
    if (calendarDays.length > 0) {
      const firstDate = new Date(calendarDays[0].date + "T12:00:00")
      const dow = (firstDate.getDay() + 6) % 7 // 0=Mon
      for (let i = 0; i < dow; i++) week.push({ date: "", count: 0, maxRarity: null, hasLegend: false, hasMythic: false })
    }

    for (const day of calendarDays) {
      week.push(day)
      if (week.length === 7) { weeks.push(week); week = [] }
    }
    if (week.length > 0) weeks.push(week)

    // Month labels
    const monthLabels: { label: string; col: number }[] = []
    let lastMonth = -1
    weeks.forEach((w, wi) => {
      for (const d of w) {
        if (d.date) {
          const m = new Date(d.date + "T12:00:00").getMonth()
          if (m !== lastMonth) {
            monthLabels.push({ label: MONTHS_FR[m], col: wi })
            lastMonth = m
          }
          break
        }
      }
    })

    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-display text-3xl font-black text-gradient-violet mb-2">
            Collection Temporelle
          </h1>
          <p className="text-[#94a3b8]">
            Capturez les 525 600 minutes de l'année — chaque minute est unique dans le temps
          </p>
        </motion.div>

        {/* Stats globales */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          >
            <div className="card-cosmic p-4 text-center">
              <div className="text-2xl font-black text-violet-300">{stats.totalCaptured.toLocaleString()}</div>
              <div className="text-xs text-[#94a3b8] mt-1">Reliques totales</div>
            </div>
            <div className="card-cosmic p-4 text-center">
              <div className="text-2xl font-black text-cyan-300">{stats.uniqueDays}</div>
              <div className="text-xs text-[#94a3b8] mt-1">Jours actifs</div>
            </div>
            <div className="card-cosmic p-4 text-center">
              <div className="text-2xl font-black text-amber-300">{stats.uniqueMinutes}</div>
              <div className="text-xs text-[#94a3b8] mt-1">Minutes uniques</div>
            </div>
            <div className="card-cosmic p-4 text-center">
              <div className="text-2xl font-black text-pink-300">
                {((stats.totalCaptured / stats.totalPossible) * 100).toFixed(3)}%
              </div>
              <div className="text-xs text-[#94a3b8] mt-1">sur 525 600</div>
            </div>
          </motion.div>
        )}

        {/* Heatmap calendrier */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="card-cosmic p-6 mb-6 overflow-x-auto"
        >
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-4 w-4 text-violet-400" />
            <span className="text-sm font-semibold text-[#e2e8f0]">365 derniers jours</span>
            <span className="text-xs text-[#475569]">— cliquez sur un jour pour explorer</span>
          </div>

          {/* Month labels */}
          <div className="flex gap-1 mb-1" style={{ paddingLeft: "20px" }}>
            {weeks.map((_, wi) => {
              const label = monthLabels.find((m) => m.col === wi)
              return (
                <div key={wi} className="w-3 text-[9px] text-[#475569] text-center shrink-0">
                  {label?.label ?? ""}
                </div>
              )
            })}
          </div>

          <div className="flex gap-1">
            {/* Day-of-week labels */}
            <div className="flex flex-col gap-1 mr-1">
              {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
                <div key={i} className="h-3 w-3 text-[9px] text-[#475569] flex items-center justify-center">
                  {i % 2 === 0 ? d : ""}
                </div>
              ))}
            </div>

            {/* Calendar weeks */}
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-1">
                {week.map((day, di) => {
                  if (!day.date) return <div key={di} className="w-3 h-3" />
                  const bg = day.maxRarity ? RARITY_HEATMAP[day.maxRarity] : getIntensity(day.count)
                  return (
                    <motion.button
                      key={day.date}
                      whileHover={{ scale: 1.5, zIndex: 10 }}
                      onClick={() => openDay(day.date)}
                      onMouseEnter={() => setHoveredDay(day)}
                      onMouseLeave={() => setHoveredDay(null)}
                      className={cn(
                        "w-3 h-3 rounded-[2px] transition-colors border-0",
                        bg,
                        day.hasMythic && "ring-1 ring-pink-400/60",
                        day.hasLegend && !day.hasMythic && "ring-1 ring-amber-400/40",
                      )}
                      title={`${day.date} — ${day.count} relique${day.count > 1 ? "s" : ""}`}
                    />
                  )
                })}
              </div>
            ))}
          </div>

          {/* Légende */}
          <div className="flex items-center gap-3 mt-4 text-xs text-[#475569] flex-wrap">
            <span>Moins</span>
            <div className="flex gap-1">
              {["bg-[#1e1e42]/60", "bg-violet-900/70", "bg-violet-700/80", "bg-violet-600/90", "bg-violet-500"].map((cls, i) => (
                <div key={i} className={cn("w-3 h-3 rounded-[2px]", cls)} />
              ))}
            </div>
            <span>Plus</span>
            <span className="ml-4">|</span>
            {["LEGENDAIRE", "MYTHIQUE"].map((r) => (
              <div key={r} className="flex items-center gap-1">
                <div className={cn("w-3 h-3 rounded-[2px]", RARITY_HEATMAP[r])} />
                <span>{RARITY_CONFIG[r as Rarity].label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Tooltip */}
        <AnimatePresence>
          {hoveredDay && hoveredDay.date && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 glass rounded-xl px-4 py-2 text-sm pointer-events-none border border-[#1e1e42]"
            >
              <span className="font-mono font-bold text-white">{hoveredDay.date}</span>
              {hoveredDay.count > 0 ? (
                <>
                  <span className="ml-2 text-violet-300">{hoveredDay.count} relique{hoveredDay.count > 1 ? "s" : ""}</span>
                  {hoveredDay.maxRarity && (
                    <span className={`ml-2 text-xs font-bold rarity-${hoveredDay.maxRarity.toLowerCase()}`}>
                      {RARITY_CONFIG[hoveredDay.maxRarity as Rarity]?.emoji} {RARITY_CONFIG[hoveredDay.maxRarity as Rarity]?.label}
                    </span>
                  )}
                </>
              ) : (
                <span className="ml-2 text-[#475569]">Aucune capture</span>
              )}
              <span className="ml-2 text-xs text-amber-400">Clic pour explorer</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Rarités globales */}
        {stats && (
          <div className="grid grid-cols-5 gap-3">
            {(["COMMUNE", "RARE", "EPIQUE", "LEGENDAIRE", "MYTHIQUE"] as Rarity[]).map((r) => (
              <div key={r} className="card-cosmic p-3 text-center">
                <div className="text-xl mb-1">{RARITY_CONFIG[r].emoji}</div>
                <div className={`text-lg font-black rarity-${r.toLowerCase()}`}>{stats.byRarity[r] ?? 0}</div>
                <div className="text-[10px] text-[#475569] mt-0.5">{RARITY_CONFIG[r].label}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // ── Vue détail d'un jour ──────────────────────────────────────────────────
  const filteredGrid = dayGrid.filter((cell) => {
    if (filter === "ALL")    return true
    if (filter === "EVENTS") return cell.hasEvent
    return cell.rarity === filter
  })

  const displayDate = new Date(selectedDate + "T12:00:00").toLocaleDateString("fr-FR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  })

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-6">
        <button
          onClick={() => setSelectedDate(null)}
          className="flex items-center gap-2 text-sm text-[#94a3b8] hover:text-violet-300 mb-3 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" /> Retour au calendrier
        </button>
        <h1 className="font-display text-2xl font-black text-gradient-violet capitalize">{displayDate}</h1>
        <p className="text-[#94a3b8] text-sm mt-1">1440 minutes — chaque case représente une minute de la journée</p>
      </motion.div>

      {dayLoading ? (
        <div className="flex items-center justify-center py-20">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="text-4xl">⏳</motion.div>
        </div>
      ) : (
        <>
          {/* Stats du jour */}
          {dayStats && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 gap-4 mb-6">
              <div className="card-cosmic p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-[#94a3b8]">Progression du jour</span>
                  <span className="font-bold text-[#e2e8f0]">{dayStats.total}/1440</span>
                </div>
                <div className="bg-[#1e1e42] rounded-full h-2">
                  <motion.div
                    className="bg-gradient-to-r from-violet-500 to-pink-500 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${dayStats.percentage}%` }}
                    transition={{ duration: 0.8 }}
                  />
                </div>
                <div className="text-xs text-[#475569] mt-1">{dayStats.percentage}% complété</div>
              </div>
              <div className="card-cosmic p-4 flex items-center gap-4 flex-wrap">
                {(["COMMUNE", "RARE", "EPIQUE", "LEGENDAIRE", "MYTHIQUE"] as Rarity[]).map((r) => {
                  const count = dayStats.byRarity[r] ?? 0
                  if (count === 0) return null
                  return (
                    <div key={r} className="text-center">
                      <div className={`text-lg font-black rarity-${r.toLowerCase()}`}>{count}</div>
                      <div className="text-[10px] text-[#475569]">{RARITY_CONFIG[r].emoji}</div>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* Filtres */}
          <div className="flex flex-wrap gap-2 mb-4">
            {(["ALL", "EVENTS", "COMMUNE", "RARE", "EPIQUE", "LEGENDAIRE", "MYTHIQUE"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as typeof filter)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-semibold transition-all",
                  filter === f ? "bg-violet-500/30 text-violet-300 border border-violet-500/40" : "bg-[#1e1e42] text-[#94a3b8] hover:bg-[#2e2e52]"
                )}
              >
                {f === "ALL" ? `Tout (${dayStats?.total ?? 0})` :
                 f === "EVENTS" ? "📚 Événements" :
                 `${RARITY_CONFIG[f as Rarity].emoji} ${RARITY_CONFIG[f as Rarity].label}`}
              </button>
            ))}
          </div>

          {/* Tooltip */}
          <AnimatePresence>
            {hoveredCell && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 glass rounded-xl px-4 py-2 text-sm pointer-events-none border border-[#1e1e42]"
              >
                <span className="font-mono font-bold text-white">{hoveredCell.minute}</span>
                {hoveredCell.captured && hoveredCell.rarity && (
                  <span className="ml-2"><RarityBadge rarity={hoveredCell.rarity} size="sm" /></span>
                )}
                {hoveredCell.hasEvent && <span className="ml-2 text-amber-300">📚 Événement</span>}
                {!hoveredCell.captured && <span className="ml-2 text-[#475569]">Non capturée</span>}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Grille 1440 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="grid gap-0.5"
            style={{ gridTemplateColumns: "repeat(auto-fill, minmax(32px, 1fr))" }}
          >
            {(filter === "ALL" ? dayGrid : filteredGrid).map((cell) => {
              const isCapt = cell.captured
              return (
                <motion.div
                  key={cell.minute}
                  whileHover={{ scale: 1.5, zIndex: 10 }}
                  onMouseEnter={() => setHoveredCell(cell)}
                  onMouseLeave={() => setHoveredCell(null)}
                  className={cn(
                    "relative aspect-square rounded-sm cursor-pointer transition-all duration-150 border",
                    isCapt && cell.rarity ? `${RARITY_GRID[cell.rarity]} border-transparent` : "bg-[#1e1e42]/40 border-[#1e1e42]",
                    cell.hasEvent && !isCapt && "border-amber-500/30",
                  )}
                  style={
                    isCapt && cell.rarity === "MYTHIQUE" ? { boxShadow: "0 0 8px rgba(236,72,153,0.6)" } :
                    isCapt && cell.rarity === "LEGENDAIRE" ? { boxShadow: "0 0 6px rgba(245,158,11,0.4)" } :
                    undefined
                  }
                  title={cell.minute}
                >
                  {cell.hasEvent && !isCapt && (
                    <div className="absolute inset-0 flex items-center justify-center text-[6px] text-amber-500/60">●</div>
                  )}
                </motion.div>
              )
            })}
          </motion.div>

          {/* Légende */}
          <div className="flex flex-wrap gap-4 mt-4 text-xs text-[#475569]">
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-[#1e1e42]" /> Non capturée</div>
            {(["COMMUNE", "RARE", "EPIQUE", "LEGENDAIRE", "MYTHIQUE"] as Rarity[]).map((r) => (
              <div key={r} className="flex items-center gap-1.5">
                <div className={`w-3 h-3 rounded-sm ${RARITY_GRID[r]}`} />
                {RARITY_CONFIG[r].label}
              </div>
            ))}
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm border border-amber-500/40 bg-transparent" />
              Événement historique
            </div>
          </div>
        </>
      )}
    </div>
  )
}
