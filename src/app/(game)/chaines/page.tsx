"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { toast } from "sonner"
import type { ChainDefinition, ChainProgress } from "@/lib/game/chains"

interface ChainWithProgress extends ChainDefinition {
  progress: ChainProgress | undefined
}

interface ChainsResponse {
  chains: ChainWithProgress[]
}

const RESOURCE_ICONS: Record<string, string> = {
  eclatsTemporels:     "✨",
  chronite:            "🔩",
  essencesHistoriques: "📜",
  fragmentsAnomalie:   "🔮",
}

export default function ChainesPage() {
  const [chains, setChains]   = useState<ChainWithProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [claiming, setClaiming] = useState<string | null>(null)

  const fetchChains = useCallback(async () => {
    try {
      const res  = await fetch("/api/game/chains")
      const data = await res.json() as ChainsResponse
      if (res.ok) setChains(data.chains)
      else toast.error("Impossible de charger les chaînes")
    } catch {
      toast.error("Erreur réseau")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchChains()
  }, [fetchChains])

  const handleClaim = useCallback(async (chainId: string, label: string) => {
    if (claiming) return
    setClaiming(chainId)
    try {
      const res  = await fetch("/api/game/chains", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ chainId }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success(`Récompenses de "${label}" réclamées !`)
        await fetchChains()
      } else {
        toast.error(data.error ?? "Erreur lors du claim")
      }
    } catch {
      toast.error("Erreur réseau")
    } finally {
      setClaiming(null)
    }
  }, [claiming, fetchChains])

  const completedCount = chains.filter(c => c.progress?.completed).length
  const claimedCount   = chains.filter(c => c.progress?.claimed).length

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="text-4xl"
        >
          ⏳
        </motion.div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">🔗</span>
          <h1 className="font-display text-3xl font-black text-gradient-violet">
            Chaînes Historiques
          </h1>
        </div>
        <p className="text-[#94a3b8] text-sm mb-4">
          Complétez des collections thématiques pour débloquer des récompenses exclusives.
        </p>
        <div className="flex gap-4 text-sm">
          <div className="bg-[#1e1e42] rounded-lg px-4 py-2">
            <span className="text-violet-400 font-bold">{completedCount}</span>
            <span className="text-[#475569]">/{chains.length} complétées</span>
          </div>
          <div className="bg-[#1e1e42] rounded-lg px-4 py-2">
            <span className="text-emerald-400 font-bold">{claimedCount}</span>
            <span className="text-[#475569]"> réclamées</span>
          </div>
        </div>
      </motion.div>

      {/* Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {chains.map((chain, i) => {
          const prog    = chain.progress
          const pct     = prog ? Math.round((prog.captured / prog.required) * 100) : 0
          const done    = prog?.completed ?? false
          const claimed = prog?.claimed ?? false

          return (
            <motion.div
              key={chain.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`card-cosmic p-5 flex flex-col gap-4 ${
                done && !claimed ? "border border-violet-500/40" : ""
              } ${claimed ? "opacity-70" : ""}`}
            >
              {/* Icon + Title */}
              <div className="flex items-start gap-3">
                <div className="text-3xl shrink-0">{chain.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-[#e2e8f0] truncate">{chain.label}</div>
                  <div className="text-xs text-[#475569] mt-0.5 line-clamp-2">{chain.description}</div>
                </div>
                {claimed && (
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2 py-0.5 shrink-0">
                    ✓ Réclamée
                  </span>
                )}
              </div>

              {/* Progress bar */}
              <div>
                <div className="flex justify-between text-xs text-[#475569] mb-1.5">
                  <span>Progression</span>
                  <span className={done ? "text-violet-400 font-bold" : ""}>
                    {prog?.captured ?? 0}/{prog?.required ?? chain.requirement.count}
                  </span>
                </div>
                <div className="h-2 bg-[#1e1e42] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, delay: i * 0.04 + 0.2 }}
                    className={`h-full rounded-full ${
                      done ? "bg-violet-500" : "bg-[#2e2e52]"
                    }`}
                  />
                </div>
              </div>

              {/* Lore */}
              <p className="text-[10px] text-[#475569] italic leading-relaxed">{chain.loreText}</p>

              {/* Rewards */}
              <div>
                <div className="text-xs text-[#475569] mb-2">Récompenses :</div>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs font-bold text-amber-300">+{chain.reward.xp} XP</span>
                </div>
              </div>

              {/* Claim button */}
              <button
                onClick={() => { if (done && !claimed) void handleClaim(chain.id, chain.label) }}
                disabled={!done || claimed || claiming === chain.id}
                className={`mt-auto w-full py-2.5 rounded-xl text-sm font-bold transition-all ${
                  done && !claimed
                    ? "bg-violet-600 hover:bg-violet-500 text-white cursor-pointer"
                    : claimed
                    ? "bg-emerald-500/10 text-emerald-500 cursor-not-allowed border border-emerald-500/20"
                    : "bg-[#1e1e42] text-[#475569] cursor-not-allowed"
                }`}
              >
                {claiming === chain.id
                  ? "Réclamation..."
                  : claimed
                  ? "Réclamée"
                  : done
                  ? "Réclamer"
                  : "En cours"}
              </button>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
