"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { RelicCard, RelicData } from "@/components/game/RelicCard"
import { RarityBadge } from "@/components/game/RarityBadge"
import { Rarity, RARITY_CONFIG } from "@/types"
import { cn, formatXP } from "@/lib/utils"
import { Package, Sparkles, BookOpen, X, Zap, Shield, FlaskConical, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"

interface RelicDetail extends RelicData {
  equippedSlot?: number | null
  analyzeReady?: boolean
  historicalEvent?: {
    title:       string
    year:        number
    description: string
    curiosity?:  string
    category?:   string
  } | null
}

interface EquipSlot {
  slot:  number
  relic: { id: string; minute: string; rarity: string; captureDate: string } | null
  bonus: { xpBonus: number; resourceBonus: number } | null
}

interface TotalBonus {
  xpBonus:       number
  resourceBonus: number
}

export default function InventoryPage() {
  const [relics, setRelics]         = useState<RelicDetail[]>([])
  const [equipSlots, setEquipSlots] = useState<EquipSlot[]>([{ slot: 1, relic: null, bonus: null }, { slot: 2, relic: null, bonus: null }, { slot: 3, relic: null, bonus: null }])
  const [totalBonus, setTotalBonus] = useState<TotalBonus>({ xpBonus: 0, resourceBonus: 0 })
  const [loading, setLoading]       = useState(true)
  const [filter, setFilter]         = useState<Rarity | "ALL">("ALL")
  const [selected, setSelected]     = useState<RelicDetail | null>(null)
  const [fuseMode, setFuseMode]     = useState(false)
  const [fuseSelection, setFuseSelection] = useState<string[]>([])
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [equipSlotChoice, setEquipSlotChoice] = useState(false)

  const load = useCallback(() => {
    fetch("/api/game/inventory")
      .then((r) => r.json())
      .then((data) => {
        setRelics(data.relics)
        setEquipSlots(data.equippedSlots)
        setTotalBonus(data.totalBonus)
        setLoading(false)
      })
      .catch(() => { toast.error("Erreur de chargement"); setLoading(false) })
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = filter === "ALL" ? relics : relics.filter((r) => r.rarity === filter)

  function handleSelect(relic: RelicData) {
    if (fuseMode) {
      const full = relic as RelicDetail
      if (fuseSelection.includes(full.id)) {
        setFuseSelection((s) => s.filter((id) => id !== full.id))
      } else if (fuseSelection.length < 3) {
        setFuseSelection((s) => [...s, full.id])
      }
    } else {
      setSelected(relics.find((r) => r.id === relic.id) ?? null)
      setEquipSlotChoice(false)
    }
  }

  async function handleFuse() {
    if (fuseSelection.length !== 3) {
      toast.error("Sélectionnez exactement 3 reliques pour fusionner")
      return
    }
    setActionLoading("fuse")
    const res  = await fetch("/api/game/fuse", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ relicIds: fuseSelection }),
    })
    const data = await res.json()
    setActionLoading(null)
    if (!res.ok) {
      toast.error(data.error)
      return
    }
    toast.success("Fusion réussie !", { description: `Nouvelle relique : ${data.minute} — ${data.rarity}` })
    setFuseMode(false)
    setFuseSelection([])
    load()
  }

  async function handleAnalyze(relic: RelicDetail) {
    setActionLoading(`analyze-${relic.id}`)
    const res  = await fetch(`/api/game/relic/${relic.id}`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ action: "analyze" }),
    })
    const data = await res.json()
    setActionLoading(null)
    if (!res.ok) {
      toast.error(data.error)
      return
    }
    const r = data.rewards
    toast.success("Analyse temporelle !", {
      description: `+${r.eclatsTemporels} éclats, +${r.chronite} chronite${r.essencesHistoriques ? `, +${r.essencesHistoriques} essences` : ""}${r.fragmentsAnomalie ? `, +${r.fragmentsAnomalie} fragments` : ""}`,
    })
    load()
  }

  async function handleEquip(relic: RelicDetail, slot: number) {
    setActionLoading(`equip-${relic.id}`)
    setEquipSlotChoice(false)
    const res  = await fetch(`/api/game/relic/${relic.id}`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ action: "equip", slot }),
    })
    const data = await res.json()
    setActionLoading(null)
    if (!res.ok) {
      toast.error(data.error)
      return
    }
    toast.success(`Relique équipée dans le slot ${slot} !`, {
      description: `+${Math.round(data.bonus.xpBonus * 100)}% XP · +${Math.round(data.bonus.resourceBonus * 100)}% ressources`,
    })
    setSelected(null)
    load()
  }

  async function handleUnequip(relic: RelicDetail) {
    setActionLoading(`unequip-${relic.id}`)
    const res  = await fetch(`/api/game/relic/${relic.id}`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ action: "unequip" }),
    })
    const data = await res.json()
    setActionLoading(null)
    if (!res.ok) {
      toast.error(data.error)
      return
    }
    toast.success("Relique déséquipée.")
    setSelected(null)
    load()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="text-4xl">⏳</motion.div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl font-black text-gradient-violet mb-1">Inventaire</h1>
          <p className="text-[#94a3b8]">{relics.length} relique{relics.length > 1 ? "s" : ""} collectée{relics.length > 1 ? "s" : ""}</p>
        </div>
        <Button
          variant={fuseMode ? "destructive" : "outline"}
          onClick={() => { setFuseMode(!fuseMode); setFuseSelection([]) }}
          className="flex items-center gap-2"
        >
          <Sparkles className="h-4 w-4" />
          {fuseMode ? "Annuler la fusion" : "Fusionner des reliques"}
        </Button>
      </div>

      {/* Slots d'équipement */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-cosmic p-4 mb-6 border border-violet-500/20"
      >
        <div className="flex items-center gap-2 mb-3">
          <Shield className="h-4 w-4 text-violet-400" />
          <span className="text-sm font-semibold text-[#e2e8f0]">Reliques Équipées</span>
          {(totalBonus.xpBonus > 0 || totalBonus.resourceBonus > 0) && (
            <div className="ml-auto flex gap-2 text-xs">
              <span className="bg-violet-500/20 text-violet-300 rounded-full px-2 py-0.5 font-semibold">
                +{Math.round(totalBonus.xpBonus * 100)}% XP
              </span>
              <span className="bg-amber-500/20 text-amber-300 rounded-full px-2 py-0.5 font-semibold">
                +{Math.round(totalBonus.resourceBonus * 100)}% Ressources
              </span>
            </div>
          )}
        </div>
        <div className="grid grid-cols-3 gap-3">
          {equipSlots.map((slot) => (
            <div
              key={slot.slot}
              className={cn(
                "rounded-xl border p-3 min-h-[80px] flex flex-col items-center justify-center text-center transition-all",
                slot.relic ? "border-violet-500/40 bg-violet-500/5" : "border-[#1e1e42] bg-[#0e0e24]"
              )}
            >
              {slot.relic ? (
                <>
                  <div className="font-mono font-black text-white text-sm">{slot.relic.minute}</div>
                  <RarityBadge rarity={slot.relic.rarity as Rarity} size="sm" className="mt-1" />
                  {slot.bonus && (
                    <div className="text-[10px] text-violet-300 mt-1">
                      +{Math.round(slot.bonus.xpBonus * 100)}% XP
                    </div>
                  )}
                </>
              ) : (
                <div className="text-[#475569] text-xs">
                  <Shield className="h-5 w-5 mx-auto mb-1 opacity-30" />
                  Slot {slot.slot} vide
                </div>
              )}
            </div>
          ))}
        </div>
        <p className="text-xs text-[#475569] mt-2">
          Les reliques équipées accordent des bonus passifs permanents à chaque capture.
        </p>
      </motion.div>

      {/* Mode fusion */}
      <AnimatePresence>
        {fuseMode && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass rounded-2xl p-4 mb-6 border border-violet-500/30 flex items-center gap-4 flex-wrap"
          >
            <Sparkles className="h-5 w-5 text-violet-400 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#e2e8f0]">
                Sélectionnez 3 reliques de même rareté ({fuseSelection.length}/3)
              </p>
              <p className="text-xs text-[#94a3b8]">
                3 reliques identiques → relique de rareté supérieure garantie !
              </p>
            </div>
            <Button
              size="sm"
              disabled={fuseSelection.length !== 3 || actionLoading === "fuse"}
              loading={actionLoading === "fuse"}
              onClick={handleFuse}
              className="flex items-center gap-2"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Fusionner !
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filtres */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFilter("ALL")}
          className={cn("px-3 py-1.5 rounded-full text-xs font-semibold transition-all", filter === "ALL" ? "bg-violet-500/30 text-violet-300 border border-violet-500/40" : "bg-[#1e1e42] text-[#94a3b8]")}
        >
          Tout ({relics.length})
        </button>
        {(["MYTHIQUE", "LEGENDAIRE", "EPIQUE", "RARE", "COMMUNE"] as Rarity[]).map((r) => {
          const count = relics.filter((rel) => rel.rarity === r).length
          if (count === 0) return null
          return (
            <button
              key={r}
              onClick={() => setFilter(r)}
              className={cn("px-3 py-1.5 rounded-full text-xs font-semibold transition-all", filter === r ? "bg-violet-500/30 text-violet-300 border border-violet-500/40" : "bg-[#1e1e42] text-[#94a3b8]")}
            >
              {RARITY_CONFIG[r].emoji} {RARITY_CONFIG[r].label} ({count})
            </button>
          )
        })}
      </div>

      {/* Grille de reliques */}
      {filtered.length === 0 ? (
        <div className="card-cosmic p-12 text-center">
          <Package className="h-16 w-16 text-[#1e1e42] mx-auto mb-4" />
          <p className="text-[#475569]">Aucune relique dans cette catégorie</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map((relic, i) => (
            <div key={relic.id} className="relative">
              <RelicCard
                relic={relic}
                onClick={handleSelect}
                selected={fuseMode ? fuseSelection.includes(relic.id) : selected?.id === relic.id}
                index={i}
              />
              {/* Indicateurs */}
              <div className="absolute top-1 right-1 flex gap-1">
                {relic.equippedSlot && (
                  <div className="bg-violet-500/80 rounded-full p-0.5" title={`Slot ${relic.equippedSlot}`}>
                    <Shield className="h-3 w-3 text-white" />
                  </div>
                )}
                {relic.analyzeReady && (
                  <div className="bg-amber-500/80 rounded-full p-0.5" title="Analyse disponible">
                    <FlaskConical className="h-3 w-3 text-white" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Panel de détail */}
      <AnimatePresence>
        {selected && !fuseMode && (
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 60 }}
            className="fixed right-4 top-20 bottom-4 w-80 z-30 glass rounded-2xl border border-[#1e1e42] overflow-y-auto p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[#e2e8f0]">Relique</h3>
              <button onClick={() => setSelected(null)} className="text-[#475569] hover:text-[#e2e8f0]">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="text-center mb-4">
              <div className="font-display text-5xl font-black text-white tracking-widest mb-2">
                {selected.minute}
              </div>
              <RarityBadge rarity={selected.rarity} size="lg" animated />
              <div className="text-emerald-400 font-bold mt-2">+{formatXP(selected.xpGained)}</div>
              {selected.equippedSlot && (
                <div className="inline-flex items-center gap-1 bg-violet-500/20 rounded-full px-2 py-0.5 text-xs text-violet-300 mt-2">
                  <Shield className="h-3 w-3" /> Slot {selected.equippedSlot}
                </div>
              )}
            </div>

            {/* Événement historique */}
            {selected.historicalEvent && (
              <div className="bg-[#0e0e24] rounded-xl p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="h-4 w-4 text-amber-400" />
                  <span className="text-sm font-bold text-amber-300">{selected.historicalEvent.title}</span>
                </div>
                <p className="text-xs text-amber-400 mb-2">{selected.historicalEvent.year}</p>
                <p className="text-xs text-[#94a3b8] leading-relaxed">{selected.historicalEvent.description}</p>
                {selected.historicalEvent.curiosity && (
                  <p className="text-xs text-[#475569] mt-2 italic">💡 {selected.historicalEvent.curiosity}</p>
                )}
              </div>
            )}

            {selected.isFused && (
              <div className="flex items-center gap-2 text-xs text-violet-400 bg-violet-500/10 rounded-lg p-2 mb-4">
                <Sparkles className="h-3.5 w-3.5" /> Relique fusionnée
              </div>
            )}

            {/* Actions */}
            <div className="space-y-2">
              {/* Analyser */}
              <Button
                className="w-full flex items-center justify-center gap-2"
                size="sm"
                variant={selected.analyzeReady ? "default" : "outline"}
                disabled={!selected.analyzeReady || actionLoading === `analyze-${selected.id}`}
                loading={actionLoading === `analyze-${selected.id}`}
                onClick={() => handleAnalyze(selected)}
              >
                <FlaskConical className="h-4 w-4" />
                {selected.analyzeReady ? "Analyser (ressources)" : "Analyse en cooldown"}
              </Button>

              {/* Équiper / Déséquiper */}
              {selected.equippedSlot ? (
                <Button
                  className="w-full flex items-center justify-center gap-2"
                  size="sm"
                  variant="outline"
                  disabled={!!actionLoading}
                  loading={actionLoading === `unequip-${selected.id}`}
                  onClick={() => handleUnequip(selected)}
                >
                  <Shield className="h-4 w-4" />
                  Déséquiper (slot {selected.equippedSlot})
                </Button>
              ) : (
                <div>
                  <Button
                    className="w-full flex items-center justify-center gap-2"
                    size="sm"
                    variant="outline"
                    disabled={!!actionLoading}
                    onClick={() => setEquipSlotChoice(!equipSlotChoice)}
                  >
                    <Shield className="h-4 w-4" />
                    Équiper
                    <ChevronDown className={cn("h-3 w-3 transition-transform", equipSlotChoice && "rotate-180")} />
                  </Button>
                  <AnimatePresence>
                    {equipSlotChoice && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="grid grid-cols-3 gap-2 mt-2">
                          {[1, 2, 3].map((slot) => {
                            const occupied = equipSlots.find((s) => s.slot === slot && s.relic)
                            return (
                              <button
                                key={slot}
                                onClick={() => handleEquip(selected, slot)}
                                disabled={!!actionLoading}
                                className={cn(
                                  "py-2 rounded-lg text-xs font-semibold border transition-all",
                                  occupied
                                    ? "border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20"
                                    : "border-violet-500/40 bg-violet-500/10 text-violet-300 hover:bg-violet-500/20"
                                )}
                              >
                                Slot {slot}
                                {occupied && <div className="text-[10px] mt-0.5 text-amber-400/70">(remplacer)</div>}
                              </button>
                            )
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Bonus info */}
              <div className="bg-[#0e0e24] rounded-lg p-3 text-xs">
                <div className="flex items-center gap-1 text-[#94a3b8] mb-2 font-semibold">
                  <Zap className="h-3 w-3 text-amber-400" />
                  Bonus passif si équipée :
                </div>
                <div className="flex gap-3">
                  <span className="text-violet-300">+{Math.round((selected.rarity === "COMMUNE" ? 0.01 : selected.rarity === "RARE" ? 0.03 : selected.rarity === "EPIQUE" ? 0.06 : selected.rarity === "LEGENDAIRE" ? 0.12 : 0.25) * 100)}% XP</span>
                  <span className="text-amber-300">+{Math.round((selected.rarity === "COMMUNE" ? 0.01 : selected.rarity === "RARE" ? 0.02 : selected.rarity === "EPIQUE" ? 0.04 : selected.rarity === "LEGENDAIRE" ? 0.08 : 0.15) * 100)}% Ressources</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
