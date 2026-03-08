"use client"

import { motion } from "framer-motion"
import { Progress } from "@/components/ui/progress"
import { levelProgress, titleForLevel } from "@/lib/game/xp"
import { formatXP } from "@/lib/utils"
import { cn } from "@/lib/utils"

interface XPBarProps {
  xpTotal:  number
  compact?: boolean
  className?: string
}

export function XPBar({ xpTotal, compact = false, className }: XPBarProps) {
  const { level, progress, current, needed } = levelProgress(xpTotal)
  const title = titleForLevel(level)

  if (compact) {
    return (
      <div className={cn("flex items-center gap-3", className)}>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-xs text-[#94a3b8]">Niv.</span>
          <span className="text-sm font-bold text-violet-300">{level}</span>
        </div>
        <div className="flex-1 min-w-0">
          <Progress value={progress} variant="xp" className="h-1.5" />
        </div>
        <span className="text-xs text-[#475569] shrink-0 tabular-nums">
          {Math.round(progress)}%
        </span>
      </div>
    )
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <motion.div
            className="w-8 h-8 rounded-full bg-violet-500/20 border border-violet-500/40 flex items-center justify-center text-xs font-black text-violet-300"
            animate={{ boxShadow: ["0 0 8px rgba(139,92,246,0.3)", "0 0 16px rgba(139,92,246,0.5)", "0 0 8px rgba(139,92,246,0.3)"] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {level}
          </motion.div>
          <div>
            <div className="text-sm font-bold text-[#e2e8f0]">Niveau {level}</div>
            <div className="text-xs text-violet-400">{title}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-[#94a3b8]">{formatXP(current)} / {formatXP(needed)}</div>
          <div className="text-xs text-[#475569]">{formatXP(xpTotal)} total</div>
        </div>
      </div>

      <div className="relative">
        <Progress value={progress} variant="xp" className="h-3" />
        {progress > 5 && (
          <div
            className="absolute inset-y-0 flex items-center text-[9px] font-bold text-white/70 pointer-events-none pl-2"
            style={{ left: `${Math.min(progress, 90)}%` }}
          >
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-[#475569]">
        <span>Prochain niveau : {Math.round(needed - current)} XP restants</span>
        <span>{Math.round(progress)}%</span>
      </div>
    </div>
  )
}
