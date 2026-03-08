"use client"

import { motion } from "framer-motion"
import { Rarity, RARITY_CONFIG } from "@/types"
import { RarityBadge } from "./RarityBadge"
import { cn, getRarityGlowStyle, formatXP, formatRelativeTime } from "@/lib/utils"
import { Clock, Sparkles, BookOpen } from "lucide-react"

export interface RelicData {
  id:         string
  minute:     string
  rarity:     Rarity
  xpGained:   number
  capturedAt: Date | string
  historicalEvent?: {
    title: string
    year:  number
  } | null
  isFused?: boolean
}

interface RelicCardProps {
  relic:     RelicData
  onClick?:  (relic: RelicData) => void
  selected?: boolean
  compact?:  boolean
  index?:    number
}

const RARITY_GRADIENTS: Record<Rarity, string> = {
  COMMUNE:    "from-slate-800 to-slate-900",
  RARE:       "from-blue-900/40 to-slate-900",
  EPIQUE:     "from-violet-900/40 to-slate-900",
  LEGENDAIRE: "from-amber-900/40 to-slate-900",
  MYTHIQUE:   "from-pink-900/40 via-violet-900/40 to-slate-900",
}

export function RelicCard({ relic, onClick, selected = false, compact = false, index = 0 }: RelicCardProps) {
  const glowStyle = getRarityGlowStyle(relic.rarity)
  const config    = RARITY_CONFIG[relic.rarity]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay: index * 0.05, type: "spring", stiffness: 200 }}
      whileHover={{ scale: 1.03, y: -4 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => onClick?.(relic)}
      className={cn(
        "relative rounded-2xl border cursor-pointer transition-all duration-300 overflow-hidden",
        "bg-gradient-to-b",
        RARITY_GRADIENTS[relic.rarity],
        selected
          ? "border-violet-400 ring-2 ring-violet-400/30"
          : "border-[#1e1e42] hover:border-violet-500/50",
        compact ? "p-3" : "p-4",
        onClick && "cursor-pointer"
      )}
      style={selected || relic.rarity !== "COMMUNE" ? glowStyle : undefined}
    >
      {/* Effet de brillance */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.02] to-transparent pointer-events-none" />

      {/* Badge Mythique spécial */}
      {relic.rarity === "MYTHIQUE" && (
        <div className="absolute inset-0 rounded-2xl pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 via-violet-500/5 to-transparent animate-pulse-slow" />
        </div>
      )}

      {/* Fusionné */}
      {relic.isFused && (
        <div className="absolute top-2 right-2">
          <Sparkles className="h-3.5 w-3.5 text-violet-400" />
        </div>
      )}

      {/* Heure */}
      <div className="flex items-center gap-2 mb-3">
        <Clock className="h-4 w-4 text-[#475569] shrink-0" />
        <span className="font-display text-2xl font-bold text-[#e2e8f0] tracking-widest">
          {relic.minute}
        </span>
      </div>

      {/* Rareté */}
      <div className="mb-3">
        <RarityBadge rarity={relic.rarity} size="sm" animated />
      </div>

      {/* Événement historique */}
      {relic.historicalEvent && !compact && (
        <div className="flex items-start gap-2 mb-3 p-2 rounded-lg bg-[#0e0e24]/60 border border-[#1e1e42]">
          <BookOpen className="h-3.5 w-3.5 text-amber-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-amber-300 line-clamp-1">{relic.historicalEvent.title}</p>
            <p className="text-xs text-[#475569]">{relic.historicalEvent.year}</p>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto">
        <span className="text-xs font-bold text-emerald-400">+{formatXP(relic.xpGained)}</span>
        {!compact && (
          <span className="text-xs text-[#475569]">{formatRelativeTime(relic.capturedAt)}</span>
        )}
      </div>
    </motion.div>
  )
}
