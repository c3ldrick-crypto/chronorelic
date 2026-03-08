"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { getTalentsForClass, TalentConfig, CharacterClass, CLASS_CONFIG } from "@/types"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Star, Lock } from "lucide-react"

interface TalentState {
  talentPoints:    number
  characterClass:  CharacterClass
  unlockedTalents: Record<string, number>
}

const CLASS_COLORS: Record<CharacterClass, string> = {
  CHRONOMANCER: "violet",
  ARCHIVISTE:   "amber",
  CHASSEUR:     "cyan",
  ORACLE:       "pink",
}

const CLASS_BORDER: Record<CharacterClass, string> = {
  CHRONOMANCER: "border-violet-500/40 bg-violet-500/5",
  ARCHIVISTE:   "border-amber-500/40 bg-amber-500/5",
  CHASSEUR:     "border-cyan-500/40 bg-cyan-500/5",
  ORACLE:       "border-pink-500/40 bg-pink-500/5",
}

const CLASS_HEADER_COLOR: Record<CharacterClass, string> = {
  CHRONOMANCER: "text-violet-300",
  ARCHIVISTE:   "text-amber-300",
  CHASSEUR:     "text-cyan-300",
  ORACLE:       "text-pink-300",
}

export default function TalentsPage() {
  const [state, setState]     = useState<TalentState | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/game/talents")
      .then((r) => r.json())
      .then(setState)
      .catch(() => toast.error("Impossible de charger les talents"))
      .finally(() => setLoading(false))
  }, [])

  async function handleUnlock(talent: TalentConfig) {
    if (!state) return
    if (state.talentPoints < talent.cost) {
      toast.error("Points de talent insuffisants")
      return
    }
    const currentLevel = state.unlockedTalents[talent.id] ?? 0
    if (currentLevel >= talent.maxLevel) {
      toast.error("Talent au niveau maximum")
      return
    }

    setSaving(talent.id)
    const res  = await fetch("/api/game/talents", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ talentId: talent.id }),
    })
    const data = await res.json()
    if (!res.ok) {
      toast.error(data.error)
    } else {
      setState((s) => s ? {
        ...s,
        talentPoints:    s.talentPoints - talent.cost,
        unlockedTalents: { ...s.unlockedTalents, [talent.id]: (s.unlockedTalents[talent.id] ?? 0) + 1 },
      } : null)
      toast.success(`${talent.label} amélioré !`)
    }
    setSaving(null)
  }

  if (loading || !state) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="text-4xl">⏳</motion.div>
      </div>
    )
  }

  const charClass   = state.characterClass
  const classConfig = CLASS_CONFIG[charClass]
  const classTalents = getTalentsForClass(charClass)
  const color = CLASS_COLORS[charClass]
  const borderCls = CLASS_BORDER[charClass]
  const headerColor = CLASS_HEADER_COLOR[charClass]

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl font-black text-gradient-violet mb-1">Arbre de Talents</h1>
          <p className={`text-sm font-medium ${headerColor}`}>
            {classConfig.icon} {classConfig.label} — {classConfig.description}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-full px-4 py-2">
          <Star className="h-4 w-4 text-amber-400" />
          <span className="font-bold text-amber-300">
            {state.talentPoints} point{state.talentPoints > 1 ? "s" : ""} disponible{state.talentPoints > 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Bonus de classe */}
      <div className={`card-cosmic p-4 mb-6 border ${borderCls}`}>
        <h2 className={`font-bold text-sm mb-2 ${headerColor}`}>Bonus de classe innés</h2>
        <div className="flex flex-wrap gap-2">
          {classConfig.bonuses.map((bonus, i) => (
            <span key={i} className="text-xs bg-white/5 border border-white/10 rounded-full px-3 py-1 text-[#94a3b8]">
              {bonus}
            </span>
          ))}
        </div>
        <p className="text-xs text-[#475569] mt-2 italic">{classConfig.lore}</p>
      </div>

      {/* Grille de talents */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {classTalents.map((talent, idx) => {
          const currentLevel = state.unlockedTalents[talent.id] ?? 0
          const isMax        = currentLevel >= talent.maxLevel
          const canAfford    = state.talentPoints >= talent.cost
          const isLocked     = !canAfford && currentLevel === 0

          return (
            <motion.div
              key={talent.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={cn(
                "p-4 rounded-xl border transition-all",
                isMax
                  ? "border-amber-500/40 bg-amber-500/5"
                  : currentLevel > 0
                    ? `border-${color}-500/30 bg-${color}-500/5`
                    : "border-[#1e1e42] bg-[#0e0e24]"
              )}
            >
              <div className="flex items-start gap-3">
                <div className="text-2xl shrink-0">{talent.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-[#e2e8f0] text-sm">{talent.label}</span>
                    {isMax && <span className="text-xs text-amber-400 font-bold">MAX</span>}
                    {isLocked && <Lock className="h-3 w-3 text-[#475569]" />}
                  </div>
                  <p className="text-xs text-[#94a3b8] mb-2">{talent.description}</p>

                  {/* Barre de niveaux */}
                  {talent.maxLevel > 1 && (
                    <div className="flex gap-1 mb-2">
                      {Array.from({ length: talent.maxLevel }, (_, i) => (
                        <div
                          key={i}
                          className={cn(
                            "h-1.5 flex-1 rounded-full",
                            i < currentLevel ? `bg-${color}-500` : "bg-[#1e1e42]"
                          )}
                        />
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#475569]">
                      {currentLevel}/{talent.maxLevel} · {talent.cost} pt{talent.cost > 1 ? "s" : ""}
                    </span>
                    {!isMax && (
                      <Button
                        size="sm"
                        variant={canAfford ? "default" : "outline"}
                        disabled={!canAfford || saving === talent.id}
                        loading={saving === talent.id}
                        onClick={() => handleUnlock(talent)}
                        className="h-7 px-3 text-xs"
                      >
                        {currentLevel > 0 ? "Améliorer" : "Débloquer"}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
