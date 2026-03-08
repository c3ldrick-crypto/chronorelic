"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { RARITY_CONFIG, type Resources } from "@/types"
import { CheckCircle, Circle, ChevronDown, ChevronUp, Gift } from "lucide-react"

interface QuestProgress {
  id:        string
  order:     number
  title:     string
  subtitle:  string
  lore:      string
  objective: { type: string; count: number; rarityMin?: string }
  rewards:   {
    xp?:           number
    resources?:    Partial<Resources>
    items?:        { itemId: string; quantity: number }[]
    talentPoints?: number
  }
  progress:  number
  target:    number
  done:      boolean
  claimed:   boolean
  available: boolean
}

const ITEM_LABELS: Record<string, string> = {
  eclat_passe:       "✨ Éclat du Passé",
  pierre_resonance:  "🪨 Pierre de Résonance",
  cle_ages:          "🗝️ Clé des Âges",
  artefact_chrono:   "⌛ Artefact Chrono",
  sceau_eternite:    "🔱 Sceau d'Éternité",
}

const OBJ_LABELS: Record<string, string> = {
  capture:         "Capture",
  capture_rarity:  "Relique",
  reach_level:     "Niveau",
  use_risky:       "Mode Risqué",
}

function RewardBadge({ quest }: { quest: QuestProgress }) {
  const { rewards } = quest
  return (
    <div className="flex flex-wrap gap-1.5 mt-3">
      {rewards.xp && (
        <span className="text-xs bg-violet-500/20 border border-violet-500/30 text-violet-300 rounded-full px-2.5 py-0.5 font-semibold">
          +{rewards.xp.toLocaleString()} XP
        </span>
      )}
      {rewards.talentPoints && (
        <span className="text-xs bg-amber-500/20 border border-amber-500/30 text-amber-300 rounded-full px-2.5 py-0.5 font-semibold">
          ★ {rewards.talentPoints} talent{rewards.talentPoints > 1 ? "s" : ""}
        </span>
      )}
      {rewards.resources?.eclatsTemporels && (
        <span className="text-xs bg-amber-500/10 border border-amber-500/20 text-amber-200 rounded-full px-2.5 py-0.5">
          ✨ {rewards.resources.eclatsTemporels}
        </span>
      )}
      {rewards.resources?.chronite && (
        <span className="text-xs bg-cyan-500/10 border border-cyan-500/20 text-cyan-200 rounded-full px-2.5 py-0.5">
          🔩 {rewards.resources.chronite}
        </span>
      )}
      {rewards.resources?.essencesHistoriques && (
        <span className="text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 rounded-full px-2.5 py-0.5">
          📜 {rewards.resources.essencesHistoriques}
        </span>
      )}
      {rewards.resources?.fragmentsAnomalie && (
        <span className="text-xs bg-pink-500/10 border border-pink-500/20 text-pink-200 rounded-full px-2.5 py-0.5">
          🔮 {rewards.resources.fragmentsAnomalie}
        </span>
      )}
      {rewards.items?.map((item) => (
        <span key={item.itemId} className="text-xs bg-indigo-500/10 border border-indigo-500/20 text-indigo-200 rounded-full px-2.5 py-0.5">
          {ITEM_LABELS[item.itemId] ?? item.itemId} ×{item.quantity}
        </span>
      ))}
    </div>
  )
}

export default function QuestsPage() {
  const [quests, setQuests]         = useState<QuestProgress[]>([])
  const [level, setLevel]           = useState(0)
  const [loading, setLoading]       = useState(true)
  const [expanded, setExpanded]     = useState<string | null>(null)
  const [claiming, setClaiming]     = useState<string | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    fetch("/api/game/quests")
      .then((r) => r.json())
      .then((d) => { setQuests(d.quests); setLevel(d.characterLevel) })
      .catch(() => toast.error("Impossible de charger les quêtes"))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  async function handleClaim(questId: string) {
    setClaiming(questId)
    try {
      const res  = await fetch("/api/game/quests", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ questId }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? "Erreur")
      } else {
        toast.success("Récompenses réclamées !")
        load()
      }
    } catch {
      toast.error("Erreur réseau")
    }
    setClaiming(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="text-4xl">⏳</motion.div>
      </div>
    )
  }

  const claimed   = quests.filter((q) => q.claimed).length
  const completed = quests.filter((q) => q.done && !q.claimed).length

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-black text-gradient-violet mb-1">Quêtes Principales</h1>
        <p className="text-[#94a3b8] text-sm">Suivez votre progression de Gardien jusqu'au niveau 20</p>

        {/* Barre de progression globale */}
        <div className="mt-4 flex items-center gap-4">
          <div className="flex-1 bg-[#1e1e42] rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-violet-500 to-pink-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(claimed / quests.length) * 100}%` }}
              transition={{ duration: 0.8 }}
            />
          </div>
          <span className="text-sm font-bold text-[#94a3b8] shrink-0">
            {claimed}/{quests.length} terminées
          </span>
        </div>

        {completed > 0 && (
          <p className="text-xs text-amber-400 mt-2 font-semibold">
            ⚡ {completed} récompense{completed > 1 ? "s" : ""} à récupérer !
          </p>
        )}
      </div>

      {/* Liste des quêtes */}
      <div className="space-y-3">
        {quests.map((quest) => {
          const isExpanded = expanded === quest.id
          const pct = quest.target > 0 ? Math.min((quest.progress / quest.target) * 100, 100) : 0

          return (
            <motion.div
              key={quest.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`card-cosmic rounded-xl overflow-hidden border transition-all ${
                quest.claimed
                  ? "border-emerald-500/30 bg-emerald-500/5 opacity-70"
                  : quest.done
                    ? "border-amber-500/50 bg-amber-500/5 shadow-lg shadow-amber-500/10"
                    : "border-violet-500/30"
              }`}
            >
              {/* Header de la quête */}
              <button
                className="w-full text-left p-4"
                onClick={() => setExpanded(isExpanded ? null : quest.id)}
              >
                <div className="flex items-start gap-3">
                  {/* Icône état */}
                  <div className="shrink-0 mt-0.5">
                    {quest.claimed ? (
                      <CheckCircle className="h-5 w-5 text-emerald-400" />
                    ) : (
                      <Circle className={`h-5 w-5 ${quest.done ? "text-amber-400" : "text-violet-400"}`} />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#475569]">#{quest.order}</span>
                          <h3 className={`font-bold text-sm ${quest.claimed ? "text-[#475569]" : "text-[#e2e8f0]"}`}>
                            {quest.title}
                          </h3>
                          {quest.done && !quest.claimed && quest.available && (
                            <span className="text-xs bg-amber-500/20 text-amber-300 rounded-full px-2 py-0.5 font-bold animate-pulse">
                              À réclamer !
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#94a3b8] mt-0.5">{quest.subtitle}</p>
                      </div>
                      <div className="shrink-0 text-[#475569]">
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </div>
                    </div>

                    {/* Barre de progression */}
                    {!quest.claimed && (
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-[#475569] mb-1">
                          <span>{OBJ_LABELS[quest.objective.type] ?? quest.objective.type}</span>
                          <span className="font-mono">{quest.progress}/{quest.target}</span>
                        </div>
                        <div className="bg-[#1e1e42] rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full transition-all ${quest.done ? "bg-amber-400" : "bg-violet-500"}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </button>

              {/* Détails expansibles */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 border-t border-white/5 pt-3">
                      {/* Lore */}
                      <p className="text-sm text-[#94a3b8] italic mb-3 leading-relaxed">
                        "{quest.lore}"
                      </p>

                      {/* Objectif */}
                      <div className="text-xs text-[#475569] mb-3">
                        <span className="font-semibold text-[#94a3b8]">Objectif : </span>
                        {quest.objective.type === "capture" && `Capturer ${quest.target} reliques`}
                        {quest.objective.type === "capture_rarity" && (
                          `Capturer ${quest.target} relique${quest.target > 1 ? "s" : ""} ${
                            quest.objective.rarityMin ? RARITY_CONFIG[quest.objective.rarityMin as keyof typeof RARITY_CONFIG]?.label : ""
                          } ou supérieure`
                        )}
                        {quest.objective.type === "reach_level" && `Atteindre le niveau ${quest.target}`}
                        {quest.objective.type === "use_risky" && `Utiliser le Mode Risqué ${quest.target} fois`}
                      </div>

                      {/* Récompenses */}
                      <div className="mb-3">
                        <span className="text-xs font-semibold text-[#94a3b8]">Récompenses :</span>
                        <RewardBadge quest={quest} />
                      </div>

                      {/* Bouton réclamer */}
                      {quest.done && !quest.claimed && (
                        <button
                          onClick={() => handleClaim(quest.id)}
                          disabled={claiming === quest.id}
                          className="w-full btn-primary py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          <Gift className="h-4 w-4" />
                          {claiming === quest.id ? "Réclamation..." : "Réclamer les récompenses"}
                        </button>
                      )}

                      {quest.claimed && (
                        <div className="text-center text-xs text-emerald-400 font-semibold py-1">
                          ✓ Récompenses réclamées
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>

      {/* Footer narratif */}
      <div className="mt-8 text-center">
        <p className="text-xs text-[#475569] italic">
          Niveau actuel : {level} · Chaque quête terminée ouvre de nouveaux horizons temporels.
        </p>
      </div>
    </div>
  )
}
