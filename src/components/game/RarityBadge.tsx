import { Rarity, RARITY_CONFIG } from "@/types"
import { cn } from "@/lib/utils"

interface RarityBadgeProps {
  rarity:     Rarity
  size?:      "sm" | "md" | "lg"
  showEmoji?: boolean
  className?: string
  animated?:  boolean
}

const SIZE_CLASSES = {
  sm: "text-xs px-2 py-0.5",
  md: "text-sm px-3 py-1",
  lg: "text-base px-4 py-1.5",
}

const RARITY_STYLES: Record<Rarity, string> = {
  COMMUNE:    "bg-slate-700/30 text-slate-300 border-slate-600/40",
  RARE:       "bg-blue-500/20 text-blue-300 border-blue-500/40",
  EPIQUE:     "bg-violet-500/20 text-violet-300 border-violet-500/40",
  LEGENDAIRE: "bg-amber-500/20 text-amber-300 border-amber-500/40",
  MYTHIQUE:   "bg-pink-500/20 border-pink-500/50",
}

export function RarityBadge({ rarity, size = "md", showEmoji = true, className, animated = false }: RarityBadgeProps) {
  const config = RARITY_CONFIG[rarity]
  const isMythique = rarity === "MYTHIQUE"

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border font-semibold tracking-wide",
        SIZE_CLASSES[size],
        RARITY_STYLES[rarity],
        isMythique && "rarity-mythique",
        animated && isMythique && "animate-pulse-slow",
        className
      )}
      style={isMythique ? {} : {}}
    >
      {showEmoji && <span>{config.emoji}</span>}
      {isMythique ? (
        <span className="rarity-mythique">{config.label}</span>
      ) : (
        <span>{config.label}</span>
      )}
    </span>
  )
}
