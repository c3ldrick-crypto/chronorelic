"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { SANCTUAIRE_MODULES, MODULE_IDS, SanctuaireModuleId } from "@/lib/game/sanctuaire"

interface ModuleState {
  id:           SanctuaireModuleId
  currentLevel: number
  upgradeCost:  {
    eclatsTemporels: number; chronite: number
    essencesHistoriques: number; fragmentsAnomalie: number
  } | null
}

interface SanctuaireData {
  modules:        Record<SanctuaireModuleId, number>
  production:     { eclatsPerHour: number; chronitePerHour: number; essencesPerHour: number }
  bonuses: {
    legendaireChancePct: number; mythiqueChancePct: number; xpBonusPct: number
    equipAmplifyPct: number; analyzeDiscountPct: number; craftDiscountPct: number
  }
  pendingHarvest: { eclats: number; chronite: number; essences: number; hoursElapsed: number }
  lastHarvestedAt: string
  moduleDetails:  ModuleState[]
}

const RESOURCE_ICONS: Record<string, string> = {
  eclatsTemporels:     "✨",
  chronite:            "🔩",
  essencesHistoriques: "📜",
  fragmentsAnomalie:   "🔮",
}

function formatRate(val: number): string {
  if (val === 0) return "—"
  if (val < 1) return `${(val * 60).toFixed(1)}/h`
  return `${val.toFixed(1)}/h`
}

const MODULE_COLORS: Record<SanctuaireModuleId, string> = {
  extracteur:        "from-amber-600 to-yellow-700",
  generateur:        "from-cyan-600 to-blue-700",
  archives:          "from-emerald-600 to-green-700",
  observatoire:      "from-violet-600 to-purple-700",
  forge:             "from-orange-600 to-red-700",
  resonance:         "from-pink-600 to-rose-700",
  laboratoire:       "from-sky-600 to-indigo-700",
  nexus:             "from-indigo-600 to-violet-900",
  machineTemporelle: "from-slate-600 to-slate-800",
}

const MODULE_BORDER: Record<SanctuaireModuleId, string> = {
  extracteur:        "border-amber-500/30",
  generateur:        "border-cyan-500/30",
  archives:          "border-emerald-500/30",
  observatoire:      "border-violet-500/30",
  forge:             "border-orange-500/30",
  resonance:         "border-pink-500/30",
  laboratoire:       "border-sky-500/30",
  nexus:             "border-indigo-500/50",
  machineTemporelle: "border-slate-500/40",
}

export default function SanctuairePage() {
  const [data, setData]           = useState<SanctuaireData | null>(null)
  const [loading, setLoading]     = useState(true)
  const [harvesting, setHarvest]  = useState(false)
  const [upgrading, setUpgrading] = useState<string | null>(null)
  const [selected, setSelected]   = useState<SanctuaireModuleId | null>(null)

  const load = useCallback(async () => {
    const res  = await fetch("/api/game/sanctuaire")
    const json = await res.json()
    if (res.ok) setData(json)
    else toast.error(json.error ?? "Erreur de chargement")
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const harvest = async () => {
    if (harvesting) return
    setHarvest(true)
    const res  = await fetch("/api/game/sanctuaire", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "harvest" }) })
    const json = await res.json()
    if (res.ok) {
      toast.success(`Récolte : ✨ ${json.harvested.eclats} | 🔩 ${json.harvested.chronite} | 📜 ${json.harvested.essences}`)
      await load()
    } else {
      toast.error(json.error ?? "Erreur de récolte")
    }
    setHarvest(false)
  }

  const upgrade = async (moduleId: SanctuaireModuleId) => {
    if (upgrading) return
    setUpgrading(moduleId)
    const res  = await fetch("/api/game/sanctuaire", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "upgrade", moduleId }),
    })
    const json = await res.json()
    if (res.ok) {
      toast.success(`${SANCTUAIRE_MODULES[moduleId].label} → Niveau ${json.newLevel} !`)
      await load()
    } else {
      toast.error(json.error ?? "Erreur")
    }
    setUpgrading(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[#94a3b8]">Chargement du Sanctuaire...</div>
      </div>
    )
  }

  if (!data) return null

  const selectedModule = selected ? data.moduleDetails.find((m) => m.id === selected) : null
  const selectedConfig = selected ? SANCTUAIRE_MODULES[selected] : null

  const hasPending = data.pendingHarvest.eclats > 0 || data.pendingHarvest.chronite > 0 || data.pendingHarvest.essences > 0

  return (
    <div className="min-h-screen px-4 py-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-black text-gradient-violet mb-1">Sanctuaire</h1>
        <p className="text-[#94a3b8] text-sm">
          Base de production temporelle — upgradez vos modules pour générer des ressources même hors connexion.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT — Production & Harvest */}
        <div className="space-y-4">
          {/* Production stats */}
          <div className="card p-4">
            <h2 className="text-[#e2e8f0] font-bold mb-3 text-sm uppercase tracking-wider">Production horaire</h2>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-amber-300 text-sm flex items-center gap-1.5">✨ Éclats</span>
                <span className="font-mono text-sm text-[#e2e8f0]">{formatRate(data.production.eclatsPerHour)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-cyan-300 text-sm flex items-center gap-1.5">🔩 Chronite</span>
                <span className="font-mono text-sm text-[#e2e8f0]">{formatRate(data.production.chronitePerHour)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-emerald-300 text-sm flex items-center gap-1.5">📜 Essences</span>
                <span className="font-mono text-sm text-[#e2e8f0]">{formatRate(data.production.essencesPerHour)}</span>
              </div>
            </div>
            <p className="text-xs text-[#475569] mt-3">Stockage max: 24h de production</p>
          </div>

          {/* Pending harvest */}
          <div className={`card p-4 border ${hasPending ? "border-amber-500/40 bg-amber-500/5" : "border-[#1e1e42]"}`}>
            <h2 className="text-[#e2e8f0] font-bold mb-1 text-sm uppercase tracking-wider">En attente de récolte</h2>
            <p className="text-xs text-[#475569] mb-3">
              {data.pendingHarvest.hoursElapsed}h accumulées
            </p>
            <div className="space-y-1.5 mb-4">
              {data.pendingHarvest.eclats > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-amber-300">✨ Éclats</span>
                  <span className="font-bold text-amber-200">+{data.pendingHarvest.eclats}</span>
                </div>
              )}
              {data.pendingHarvest.chronite > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-cyan-300">🔩 Chronite</span>
                  <span className="font-bold text-cyan-200">+{data.pendingHarvest.chronite}</span>
                </div>
              )}
              {data.pendingHarvest.essences > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-emerald-300">📜 Essences</span>
                  <span className="font-bold text-emerald-200">+{data.pendingHarvest.essences}</span>
                </div>
              )}
              {!hasPending && (
                <p className="text-[#475569] text-sm text-center py-2">Rien à récolter</p>
              )}
            </div>
            <button
              onClick={harvest}
              disabled={!hasPending || harvesting}
              className="w-full py-2 rounded-lg text-sm font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-amber-500 hover:bg-amber-400 text-black"
            >
              {harvesting ? "Récolte en cours..." : "Récolter"}
            </button>
          </div>

          {/* Active bonuses */}
          <div className="card p-4">
            <h2 className="text-[#e2e8f0] font-bold mb-3 text-sm uppercase tracking-wider">Bonus Actifs</h2>
            <div className="space-y-1.5 text-xs">
              {data.bonuses.xpBonusPct > 0 && (
                <div className="flex justify-between">
                  <span className="text-[#94a3b8]">Bonus XP</span>
                  <span className="text-violet-300 font-bold">+{data.bonuses.xpBonusPct.toFixed(0)}%</span>
                </div>
              )}
              {data.bonuses.legendaireChancePct > 0 && (
                <div className="flex justify-between">
                  <span className="text-[#94a3b8]">Chance Légendaire</span>
                  <span className="text-amber-300 font-bold">+{data.bonuses.legendaireChancePct.toFixed(1)}%</span>
                </div>
              )}
              {data.bonuses.mythiqueChancePct > 0 && (
                <div className="flex justify-between">
                  <span className="text-[#94a3b8]">Chance Mythique</span>
                  <span className="text-pink-300 font-bold">+{data.bonuses.mythiqueChancePct.toFixed(2)}%</span>
                </div>
              )}
              {data.bonuses.equipAmplifyPct > 0 && (
                <div className="flex justify-between">
                  <span className="text-[#94a3b8]">Bonus Équipement</span>
                  <span className="text-emerald-300 font-bold">+{data.bonuses.equipAmplifyPct.toFixed(0)}%</span>
                </div>
              )}
              {data.bonuses.analyzeDiscountPct > 0 && (
                <div className="flex justify-between">
                  <span className="text-[#94a3b8]">Réduction Analyse</span>
                  <span className="text-sky-300 font-bold">-{data.bonuses.analyzeDiscountPct.toFixed(0)}%</span>
                </div>
              )}
              {data.bonuses.craftDiscountPct > 0 && (
                <div className="flex justify-between">
                  <span className="text-[#94a3b8]">Réduction Craft</span>
                  <span className="text-orange-300 font-bold">-{data.bonuses.craftDiscountPct.toFixed(0)}%</span>
                </div>
              )}
              {Object.values(data.bonuses).every((v) => v === 0) && (
                <p className="text-[#475569] text-center py-1">Aucun bonus actif — améliorez vos modules.</p>
              )}
            </div>
          </div>
        </div>

        {/* CENTER + RIGHT — Module grid */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-3 mb-6">
            {data.moduleDetails.map((mod) => {
              const cfg      = SANCTUAIRE_MODULES[mod.id]
              const isMax    = mod.currentLevel >= cfg.maxLevel
              const isNexus  = mod.id === "nexus"
              return (
                <motion.button
                  key={mod.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelected(selected === mod.id ? null : mod.id)}
                  className={`relative text-left p-4 rounded-xl border transition-all ${
                    selected === mod.id
                      ? `border-violet-500/60 bg-violet-500/10`
                      : `${MODULE_BORDER[mod.id]} bg-[#0f0f23] hover:bg-[#1a1a3e]`
                  } ${isNexus ? "col-span-2 sm:col-span-1 md:col-span-1 lg:col-span-2 xl:col-span-1" : ""}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-2xl">{cfg.icon}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isMax ? "bg-amber-500/20 text-amber-300" : "bg-[#1e1e42] text-[#94a3b8]"}`}>
                      {isMax ? "MAX" : `Niv. ${mod.currentLevel}`}
                    </span>
                  </div>
                  <p className="text-[#e2e8f0] font-bold text-sm mb-1">{cfg.label}</p>
                  {/* Level bar */}
                  <div className="w-full h-1.5 bg-[#1e1e42] rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${MODULE_COLORS[mod.id]} transition-all`}
                      style={{ width: `${(mod.currentLevel / cfg.maxLevel) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-[#475569] mt-1">{mod.currentLevel}/{cfg.maxLevel}</p>
                </motion.button>
              )
            })}
          </div>

          {/* Module detail panel */}
          <AnimatePresence>
            {selected && selectedModule && selectedConfig && (
              <motion.div
                key={selected}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className={`card p-5 border ${MODULE_BORDER[selected]}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{selectedConfig.icon}</span>
                    <div>
                      <h3 className="text-[#e2e8f0] font-bold text-lg">{selectedConfig.label}</h3>
                      <p className="text-xs text-[#475569]">
                        Niveau {selectedModule.currentLevel} / {selectedConfig.maxLevel}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => setSelected(null)} className="text-[#475569] hover:text-[#94a3b8] text-sm">✕</button>
                </div>

                <p className="text-sm text-[#94a3b8] mb-4">{selectedConfig.description}</p>

                {/* Effects table */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {selectedConfig.effects.eclatsPerHour && (
                    <div className="bg-[#0f0f23] rounded-lg p-2 text-center">
                      <p className="text-xs text-[#475569]">Actuel</p>
                      <p className="text-amber-300 font-bold text-sm">
                        ✨ {selectedConfig.effects.eclatsPerHour[selectedModule.currentLevel]}/h
                      </p>
                    </div>
                  )}
                  {selectedConfig.effects.eclatsPerHour && selectedModule.currentLevel < selectedConfig.maxLevel && (
                    <div className="bg-[#0f0f23] rounded-lg p-2 text-center">
                      <p className="text-xs text-[#475569]">Prochain niveau</p>
                      <p className="text-amber-200 font-bold text-sm">
                        ✨ {selectedConfig.effects.eclatsPerHour[selectedModule.currentLevel + 1]}/h
                      </p>
                    </div>
                  )}
                  {selectedConfig.effects.chronitePerHour && (
                    <div className="bg-[#0f0f23] rounded-lg p-2 text-center">
                      <p className="text-xs text-[#475569]">Actuel</p>
                      <p className="text-cyan-300 font-bold text-sm">
                        🔩 {selectedConfig.effects.chronitePerHour[selectedModule.currentLevel]}/h
                      </p>
                    </div>
                  )}
                  {selectedConfig.effects.xpBonusPct && selectedModule.currentLevel > 0 && (
                    <div className="bg-[#0f0f23] rounded-lg p-2 text-center">
                      <p className="text-xs text-[#475569]">Bonus XP</p>
                      <p className="text-violet-300 font-bold text-sm">
                        +{selectedConfig.effects.xpBonusPct[selectedModule.currentLevel]}%
                      </p>
                    </div>
                  )}
                  {selectedConfig.effects.legendaireChancePct && selectedModule.currentLevel > 0 && (
                    <div className="bg-[#0f0f23] rounded-lg p-2 text-center">
                      <p className="text-xs text-[#475569]">Légendaire</p>
                      <p className="text-amber-300 font-bold text-sm">
                        +{selectedConfig.effects.legendaireChancePct[selectedModule.currentLevel]}%
                      </p>
                    </div>
                  )}
                  {selectedConfig.effects.craftDiscountPct && selectedModule.currentLevel > 0 && (
                    <div className="bg-[#0f0f23] rounded-lg p-2 text-center">
                      <p className="text-xs text-[#475569]">Réduction craft</p>
                      <p className="text-orange-300 font-bold text-sm">
                        -{selectedConfig.effects.craftDiscountPct[selectedModule.currentLevel]}%
                      </p>
                    </div>
                  )}
                  {selectedConfig.effects.globalAmplifyPct && selectedModule.currentLevel > 0 && (
                    <div className="bg-[#0f0f23] rounded-lg p-2 text-center">
                      <p className="text-xs text-[#475569]">Amplification globale</p>
                      <p className="text-indigo-300 font-bold text-sm">
                        +{selectedConfig.effects.globalAmplifyPct[selectedModule.currentLevel]}%
                      </p>
                    </div>
                  )}
                </div>

                {/* Upgrade cost + button */}
                {selectedModule.upgradeCost && (
                  <div>
                    <p className="text-xs text-[#475569] mb-2 uppercase tracking-wider">Coût de l'amélioration</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {selectedModule.upgradeCost.eclatsTemporels > 0 && (
                        <span className="text-xs bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2 py-1 rounded-full">
                          ✨ {selectedModule.upgradeCost.eclatsTemporels.toLocaleString()}
                        </span>
                      )}
                      {selectedModule.upgradeCost.chronite > 0 && (
                        <span className="text-xs bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 px-2 py-1 rounded-full">
                          🔩 {selectedModule.upgradeCost.chronite.toLocaleString()}
                        </span>
                      )}
                      {selectedModule.upgradeCost.essencesHistoriques > 0 && (
                        <span className="text-xs bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-2 py-1 rounded-full">
                          📜 {selectedModule.upgradeCost.essencesHistoriques}
                        </span>
                      )}
                      {selectedModule.upgradeCost.fragmentsAnomalie > 0 && (
                        <span className="text-xs bg-pink-500/10 text-pink-300 border border-pink-500/20 px-2 py-1 rounded-full">
                          🔮 {selectedModule.upgradeCost.fragmentsAnomalie}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => upgrade(selected)}
                      disabled={upgrading === selected}
                      className={`w-full py-2.5 rounded-lg text-sm font-bold transition-all bg-gradient-to-r ${MODULE_COLORS[selected]} hover:opacity-90 disabled:opacity-50 disabled:cursor-wait text-white`}
                    >
                      {upgrading === selected
                        ? "Amélioration en cours..."
                        : `Améliorer → Niveau ${selectedModule.currentLevel + 1}`}
                    </button>
                  </div>
                )}

                {!selectedModule.upgradeCost && (
                  <div className="text-center py-2">
                    <span className="text-amber-300 font-bold">Niveau Maximum atteint !</span>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
