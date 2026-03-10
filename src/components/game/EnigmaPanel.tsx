"use client"

import { useEffect, useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, ChevronUp, Trophy, Lock, CheckCircle2, RefreshCw } from "lucide-react"
import type { PublicEnigma, EnigmaDifficulty } from "@/lib/game/enigmas"

const DIFF_CONFIG: Record<EnigmaDifficulty, { label: string; color: string; bg: string; border: string; icon: string }> = {
  FACILE:    { label: "Facile",    color: "#6ee7b7", bg: "rgba(16,185,129,0.06)",  border: "rgba(16,185,129,0.25)",  icon: "🟢" },
  MOYEN:     { label: "Moyen",     color: "#fde047", bg: "rgba(234,179,8,0.06)",   border: "rgba(234,179,8,0.25)",   icon: "🟡" },
  DIFFICILE: { label: "Difficile", color: "#fca5a5", bg: "rgba(239,68,68,0.06)",   border: "rgba(239,68,68,0.25)",   icon: "🔴" },
  LEGENDAIRE:{ label: "Légendaire",color: "#c4b5fd", bg: "rgba(107,40,200,0.08)",  border: "rgba(107,40,200,0.35)",  icon: "👑" },
}

function EnigmaCard({ enigma }: { enigma: PublicEnigma }) {
  const [expanded, setExpanded] = useState(false)
  const diff = DIFF_CONFIG[enigma.difficulty]

  return (
    <motion.div
      layout
      className="rounded-xl overflow-hidden"
      style={{
        background: enigma.isSolved
          ? "linear-gradient(145deg, rgba(16,185,129,0.06), rgba(20,16,40,0.9))"
          : diff.bg,
        border: `1px solid ${enigma.isSolved ? "rgba(16,185,129,0.3)" : diff.border}`,
        opacity: enigma.isSolved ? 0.8 : 1,
      }}
    >
      {/* Header */}
      <button
        className="w-full px-3 py-2.5 flex items-center gap-2 text-left"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="text-base shrink-0">{enigma.isSolved ? "✅" : "🗺️"}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className="text-xs font-bold truncate"
              style={{ color: enigma.isSolved ? "#6ee7b7" : diff.color }}
            >
              {enigma.title}
            </span>
            <span
              className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase shrink-0"
              style={{ background: diff.bg, border: `1px solid ${diff.border}`, color: diff.color }}
            >
              {diff.label}
            </span>
          </div>
          {enigma.isSolved && enigma.solvedMinute && (
            <div className="flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="h-2.5 w-2.5" style={{ color: "#6ee7b7" }} />
              <span className="text-[10px] font-mono font-bold" style={{ color: "#6ee7b7" }}>
                Résolue — {enigma.solvedMinute}
              </span>
            </div>
          )}
          {!enigma.isSolved && (
            <span className="text-[10px]" style={{ color: "#3a3254" }}>{enigma.category}</span>
          )}
        </div>
        {expanded
          ? <ChevronUp className="h-3.5 w-3.5 shrink-0" style={{ color: diff.color }} />
          : <ChevronDown className="h-3.5 w-3.5 shrink-0" style={{ color: "#3a3254" }} />
        }
      </button>

      {/* Expanded content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 space-y-2.5 border-t" style={{ borderColor: `${diff.border}` }}>
              {/* Lore */}
              <p className="text-[11px] leading-relaxed italic pt-2.5" style={{ color: "#9b8d7a" }}>
                {enigma.lore}
              </p>

              {/* Clues */}
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: diff.color }}>
                  Indices ({enigma.clues.length})
                </p>
                {enigma.clues.map((clue, i) => (
                  <div key={i} className="flex gap-2 items-start">
                    <span
                      className="text-[10px] font-bold shrink-0 w-4 h-4 rounded flex items-center justify-center mt-0.5"
                      style={{ background: `${diff.bg}`, border: `1px solid ${diff.border}`, color: diff.color }}
                    >
                      {i + 1}
                    </span>
                    <p className="text-[11px] leading-relaxed" style={{ color: i === 0 ? "#5a5046" : i === 1 ? "#7a6a58" : "#9b8d7a" }}>
                      {clue}
                    </p>
                  </div>
                ))}
              </div>

              {/* Reward */}
              <div
                className="rounded-lg px-2.5 py-2 flex items-center gap-2"
                style={{ background: "rgba(196,150,10,0.06)", border: "1px solid rgba(196,150,10,0.2)" }}
              >
                <Trophy className="h-3.5 w-3.5 shrink-0" style={{ color: "#e8b84b" }} />
                <span className="text-[11px] font-semibold" style={{ color: "#e8b84b" }}>
                  {enigma.reward.label}
                </span>
              </div>

              {/* Hint when unsolved */}
              {!enigma.isSolved && (
                <div
                  className="rounded-lg px-2.5 py-2 flex items-start gap-2"
                  style={{ background: "rgba(107,40,200,0.04)", border: "1px solid rgba(107,40,200,0.15)" }}
                >
                  <Lock className="h-3 w-3 mt-0.5 shrink-0" style={{ color: "#6b5a8e" }} />
                  <p className="text-[10px]" style={{ color: "#6b5a8e" }}>
                    Trouvez et capturez la minute qui correspond à ces indices. La Machine Temporelle peut vous aider à cibler des minutes précises.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

interface EnigmaPanelProps {
  refreshTrigger?: number  // increment to force refresh after capture
}

export function EnigmaPanel({ refreshTrigger }: EnigmaPanelProps) {
  const [enigmas, setEnigmas] = useState<PublicEnigma[]>([])
  const [total,   setTotal]   = useState(0)
  const [solved,  setSolved]  = useState(0)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/game/enigmas")
      if (r.ok) {
        const d = await r.json()
        setEnigmas(d.enigmas ?? [])
        setTotal(d.total ?? 0)
        setSolved(d.solved ?? 0)
      }
    } catch { /* silent */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { void load() }, [load, refreshTrigger])

  if (loading) {
    return (
      <div className="space-y-2">
        {[0, 1, 2].map(i => (
          <div key={i} className="h-12 rounded-xl animate-pulse" style={{ background: "rgba(107,40,200,0.06)", border: "1px solid rgba(107,40,200,0.1)" }} />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {/* Progress bar */}
      <div className="flex items-center gap-2 mb-1">
        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg, #7c3aed, #c4b5fd)", width: `${total > 0 ? (solved / total) * 100 : 0}%` }}
            initial={{ width: 0 }}
            animate={{ width: `${total > 0 ? (solved / total) * 100 : 0}%` }}
            transition={{ duration: 0.6 }}
          />
        </div>
        <span className="text-[10px] font-mono shrink-0" style={{ color: "#6b5a8e" }}>
          {solved}/{total}
        </span>
        <button onClick={load} className="shrink-0 opacity-40 hover:opacity-70 transition-opacity">
          <RefreshCw className="h-3 w-3" style={{ color: "#c084fc" }} />
        </button>
      </div>

      {enigmas.length === 0 ? (
        <div className="text-center py-4 text-[10px]" style={{ color: "#3a3254" }}>
          Aucune énigme disponible
        </div>
      ) : (
        enigmas.map(e => <EnigmaCard key={e.id} enigma={e} />)
      )}
    </div>
  )
}
