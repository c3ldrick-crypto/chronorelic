"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { Lock, Hammer, Clock, CheckCircle, ChevronRight, X, Zap } from "lucide-react"
import { CraftItem } from "@/types"

interface Resources {
  eclatsTemporels:     number
  chronite:            number
  essencesHistoriques: number
  fragmentsAnomalie:   number
}

interface CraftableItem extends CraftItem {
  unlocked: boolean
  owned:    number
  canCraft: boolean
}

interface AtelierData {
  resources:     Resources
  inventory:     Record<string, number>
  craftableItems: CraftableItem[]
  charLevel:     number
}

const RESOURCE_CONFIG = [
  { key: "eclatsTemporels",     label: "Éclats Temporels",      icon: "✨", color: "text-amber-300",  bg: "bg-amber-500/10"  },
  { key: "chronite",            label: "Chronite",               icon: "🔩", color: "text-cyan-300",   bg: "bg-cyan-500/10"   },
  { key: "essencesHistoriques", label: "Essences Historiques",   icon: "📜", color: "text-emerald-300", bg: "bg-emerald-500/10" },
  { key: "fragmentsAnomalie",   label: "Fragments d'Anomalie",   icon: "🔮", color: "text-pink-300",   bg: "bg-pink-500/10"   },
] as const

const EFFECT_LABELS: Record<string, string> = {
  TIME_TRAVEL_RANDOM: "Minute aléatoire (1h)",
  TIME_TRAVEL_1H:     "Choix précis — 1 heure",
  TIME_TRAVEL_24H:    "Choix précis — 24 heures",
  TIME_TRAVEL_7D:     "Choix précis — 7 jours",
  DUPLICATE_CAPTURE:  "Re-capturer une minute",
}

const EFFECT_NEEDS_INPUT: Record<string, boolean> = {
  TIME_TRAVEL_RANDOM: false,
  TIME_TRAVEL_1H:     true,
  TIME_TRAVEL_24H:    true,
  TIME_TRAVEL_7D:     true,
  DUPLICATE_CAPTURE:  true,
}

function ResourceCost({ cost, resources }: { cost: Resources; resources: Resources }) {
  const items = [
    { key: "eclatsTemporels",     label: "Éclats",   icon: "✨" },
    { key: "chronite",            label: "Chronite", icon: "🔩" },
    { key: "essencesHistoriques", label: "Essences", icon: "📜" },
    { key: "fragmentsAnomalie",   label: "Fragments",icon: "🔮" },
  ] as const

  return (
    <div className="flex flex-wrap gap-2">
      {items.filter(({ key }) => cost[key] > 0).map(({ key, icon }) => {
        const hasEnough = resources[key] >= cost[key]
        return (
          <span key={key} className={`text-xs font-bold px-2 py-0.5 rounded-full ${
            hasEnough ? "bg-[#1e1e42] text-[#94a3b8]" : "bg-red-500/15 text-red-400"
          }`}>
            {icon} {cost[key]}
          </span>
        )
      })}
    </div>
  )
}

export default function AtelierPage() {
  const [data, setData]             = useState<AtelierData | null>(null)
  const [loading, setLoading]       = useState(true)
  const [crafting, setCrafting]     = useState<string | null>(null)
  const [using, setUsing]           = useState<string | null>(null)
  const [targetMinute, setTarget]   = useState("")
  const [traveling, setTraveling]   = useState(false)
  const [activeTab, setActiveTab]   = useState<"craft" | "inventory">("craft")

  useEffect(() => {
    fetch("/api/game/resources")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false) })
      .catch(() => { toast.error("Erreur de chargement"); setLoading(false) })
  }, [])

  async function handleCraft(itemId: string) {
    if (crafting) return
    setCrafting(itemId)
    try {
      const res  = await fetch("/api/game/craft", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ itemId }),
      })
      const json = await res.json()
      if (!res.ok) {
        toast.error(json.error ?? "Fabrication impossible")
        return
      }
      toast.success(`${json.label} fabriqué !`, { description: "Consultez votre inventaire pour l'utiliser." })
      // Recharger
      const fresh = await fetch("/api/game/resources").then((r) => r.json())
      setData(fresh)
    } catch {
      toast.error("Erreur réseau")
    }
    setCrafting(null)
  }

  async function handleTimeTravel(itemId: string) {
    if (traveling) return
    const item = data?.craftableItems.find((i) => i.id === itemId)
    if (!item) return

    const needsInput = EFFECT_NEEDS_INPUT[item.effect]
    if (needsInput && !targetMinute.match(/^\d{2}:\d{2}$/)) {
      toast.error("Format de minute invalide. Utilisez HH:MM (ex: 14:30)")
      return
    }

    setTraveling(true)
    try {
      const body: Record<string, string> = { itemId }
      if (needsInput) body.targetMinute = targetMinute

      const res  = await fetch("/api/game/timetravel", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(body),
      })
      const json = await res.json()

      if (!res.ok) {
        if (res.status === 409 && json.alreadyCaptured) {
          toast("Cette minute est déjà dans ta collection.", { description: "Utilise le Sceau d'Éternité pour la recapturer." })
        } else {
          toast.error(json.error ?? "Voyage temporel échoué")
        }
        return
      }

      if (!json.success) {
        toast("Voyage raté !", {
          description: "Le flux temporel a rejeté ta tentative. Ressources perdues.",
          duration: 5000,
        })
      } else {
        const rarityEmoji = {
          COMMUNE: "⚪", RARE: "🔵", EPIQUE: "🟣", LEGENDAIRE: "🟡", MYTHIQUE: "🔮"
        }[json.rarity as string] ?? ""
        toast.success(`${rarityEmoji} ${json.minute} capturée !`, {
          description: `${json.rarity} — +${json.xpGained} XP${json.eventTitle ? ` — ${json.eventTitle}` : ""}`,
          duration: 6000,
        })
      }

      setUsing(null)
      setTarget("")
      const fresh = await fetch("/api/game/resources").then((r) => r.json())
      setData(fresh)
    } catch {
      toast.error("Erreur réseau")
    }
    setTraveling(false)
  }

  if (loading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="text-4xl">
          ⏳
        </motion.div>
      </div>
    )
  }

  const ownedItems = data.craftableItems.filter((i) => (data.inventory[i.id] ?? 0) > 0)

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-black text-gradient-violet mb-1 flex items-center gap-3">
          <Hammer className="h-8 w-8 text-violet-400" />
          Atelier Temporel
        </h1>
        <p className="text-[#94a3b8]">Fabriquez des objets de voyage dans le temps et récupérez des minutes passées.</p>
      </div>

      {/* Ressources */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {RESOURCE_CONFIG.map(({ key, label, icon, color, bg }) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${bg} border border-[#1e1e42] rounded-xl p-4 text-center`}
          >
            <div className="text-2xl mb-1">{icon}</div>
            <div className={`text-xl font-black ${color}`}>{data.resources[key].toLocaleString()}</div>
            <div className="text-xs text-[#475569] mt-0.5">{label}</div>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab("craft")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeTab === "craft"
              ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
              : "bg-[#1e1e42] text-[#94a3b8] hover:text-[#e2e8f0]"
          }`}
        >
          <Hammer className="h-4 w-4 inline mr-1.5" />
          Fabriquer
        </button>
        <button
          onClick={() => setActiveTab("inventory")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all relative ${
            activeTab === "inventory"
              ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
              : "bg-[#1e1e42] text-[#94a3b8] hover:text-[#e2e8f0]"
          }`}
        >
          <Clock className="h-4 w-4 inline mr-1.5" />
          Voyager
          {ownedItems.length > 0 && (
            <span className="ml-2 bg-violet-500 text-white text-xs font-black rounded-full px-1.5 py-0.5">
              {ownedItems.reduce((sum, i) => sum + (data.inventory[i.id] ?? 0), 0)}
            </span>
          )}
        </button>
      </div>

      {/* Tab: Fabriquer */}
      <AnimatePresence mode="wait">
        {activeTab === "craft" && (
          <motion.div
            key="craft"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {data.craftableItems.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`card-cosmic p-5 ${!item.unlocked ? "opacity-60" : ""}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-3xl shrink-0 ${
                    item.unlocked ? "bg-violet-500/15 border border-violet-500/30" : "bg-[#1e1e42] border border-[#2e2e52]"
                  }`}>
                    {item.unlocked ? item.icon : <Lock className="h-6 w-6 text-[#475569]" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-bold text-[#e2e8f0]">{item.label}</h3>
                      {!item.unlocked && (
                        <span className="text-xs bg-[#1e1e42] text-[#475569] px-2 py-0.5 rounded-full">
                          Niveau {item.levelRequired} requis
                        </span>
                      )}
                      {item.owned > 0 && (
                        <span className="text-xs bg-violet-500/15 text-violet-300 border border-violet-500/20 px-2 py-0.5 rounded-full">
                          {item.owned} possédé{item.owned > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#94a3b8] mb-2">{item.description}</p>

                    <div className="flex items-center gap-3 flex-wrap">
                      <ResourceCost cost={item.cost} resources={data.resources} />
                      <span className="text-xs text-[#475569]">
                        {EFFECT_LABELS[item.effect]}
                      </span>
                      {item.successRate < 100 && (
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          item.successRate >= 90 ? "text-amber-300 bg-amber-500/10" :
                          item.successRate >= 70 ? "text-orange-300 bg-orange-500/10" :
                          "text-red-300 bg-red-500/10"
                        }`}>
                          {item.successRate}% succès
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleCraft(item.id)}
                    disabled={!item.canCraft || crafting === item.id}
                    className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                      item.canCraft
                        ? "bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-500/20"
                        : "bg-[#1e1e42] text-[#475569] cursor-not-allowed"
                    }`}
                  >
                    {crafting === item.id ? (
                      <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                        ⏳
                      </motion.span>
                    ) : (
                      <>
                        <Hammer className="h-4 w-4" />
                        Fabriquer
                      </>
                    )}
                  </button>
                </div>

                {item.riskFail && item.unlocked && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-red-400/70 bg-red-500/5 rounded-lg px-3 py-2">
                    <Zap className="h-3 w-3 shrink-0" />
                    Échec : perte de ✨{item.riskFail.eclatsTemporels}
                    {item.riskFail.chronite > 0 && ` + 🔩${item.riskFail.chronite}`}
                    {item.riskFail.essencesHistoriques > 0 && ` + 📜${item.riskFail.essencesHistoriques}`}
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Tab: Voyager */}
        {activeTab === "inventory" && (
          <motion.div
            key="inventory"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {ownedItems.length === 0 ? (
              <div className="card-cosmic p-12 text-center">
                <div className="text-5xl mb-4">⏳</div>
                <h3 className="font-bold text-[#e2e8f0] mb-2">Aucun objet de voyage</h3>
                <p className="text-sm text-[#475569] mb-4">
                  Fabriquez des objets dans l&apos;onglet &quot;Fabriquer&quot; pour voyager dans le temps.
                </p>
                <button
                  onClick={() => setActiveTab("craft")}
                  className="text-sm text-violet-400 hover:text-violet-300 flex items-center gap-1 mx-auto"
                >
                  Aller à l&apos;atelier <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {ownedItems.map((item, i) => {
                  const qty = data.inventory[item.id] ?? 0
                  const isUsing = using === item.id

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="card-cosmic p-5"
                    >
                      <div className="flex items-center gap-4 mb-0">
                        <div className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl bg-violet-500/15 border border-violet-500/30 shrink-0">
                          {item.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-[#e2e8f0]">{item.label}</h3>
                            <span className="text-xs bg-violet-500/20 text-violet-300 border border-violet-500/30 px-2 py-0.5 rounded-full font-bold">
                              ×{qty}
                            </span>
                          </div>
                          <p className="text-xs text-[#94a3b8]">{item.description}</p>
                          <p className="text-xs text-violet-400 mt-1">{EFFECT_LABELS[item.effect]}</p>
                        </div>
                        <button
                          onClick={() => { setUsing(isUsing ? null : item.id); setTarget("") }}
                          className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                            isUsing
                              ? "bg-[#1e1e42] text-[#94a3b8]"
                              : "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/20 hover:opacity-90"
                          }`}
                        >
                          {isUsing ? <><X className="h-4 w-4" /> Annuler</> : <><Clock className="h-4 w-4" /> Utiliser</>}
                        </button>
                      </div>

                      {/* Panel de voyage */}
                      <AnimatePresence>
                        {isUsing && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-4 pt-4 border-t border-[#1e1e42]">
                              {EFFECT_NEEDS_INPUT[item.effect] ? (
                                <div className="space-y-3">
                                  <div>
                                    <label className="text-xs font-bold text-[#94a3b8] uppercase tracking-wider block mb-1.5">
                                      Minute cible (HH:MM)
                                    </label>
                                    <input
                                      type="text"
                                      value={targetMinute}
                                      onChange={(e) => setTarget(e.target.value)}
                                      placeholder="ex: 14:30"
                                      pattern="\d{2}:\d{2}"
                                      maxLength={5}
                                      className="w-full bg-[#0e0e24] border border-[#2e2e52] rounded-xl px-4 py-3 font-mono text-lg text-[#e2e8f0] focus:outline-none focus:border-violet-500/60 text-center tracking-widest"
                                    />
                                    {item.timeRange && (
                                      <p className="text-xs text-[#475569] mt-1 text-center">
                                        Jusqu&apos;à {item.timeRange >= 1440 ? `${Math.floor(item.timeRange / 1440)}j` : `${item.timeRange}min`} dans le passé
                                      </p>
                                    )}
                                  </div>
                                  <button
                                    onClick={() => handleTimeTravel(item.id)}
                                    disabled={traveling || !targetMinute.match(/^\d{2}:\d{2}$/)}
                                    className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                                      targetMinute.match(/^\d{2}:\d{2}$/) && !traveling
                                        ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/20 hover:opacity-90"
                                        : "bg-[#1e1e42] text-[#475569] cursor-not-allowed"
                                    }`}
                                  >
                                    {traveling ? (
                                      <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                                        ⏳
                                      </motion.span>
                                    ) : (
                                      <>
                                        <Clock className="h-4 w-4" />
                                        Voyager vers {targetMinute || "??:??"}
                                        {item.successRate < 100 && ` (${item.successRate}% de succès)`}
                                      </>
                                    )}
                                  </button>
                                </div>
                              ) : (
                                // TIME_TRAVEL_RANDOM — pas de saisie
                                <div className="space-y-3">
                                  <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-3 text-center">
                                    <p className="text-sm text-violet-300 font-semibold">Minute aléatoire</p>
                                    <p className="text-xs text-[#94a3b8] mt-1">
                                      Une minute passée des {item.timeRange} dernières minutes sera sélectionnée.
                                    </p>
                                  </div>
                                  <button
                                    onClick={() => handleTimeTravel(item.id)}
                                    disabled={traveling}
                                    className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/20 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                  >
                                    {traveling ? (
                                      <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                                        ⏳
                                      </motion.span>
                                    ) : (
                                      <>
                                        <CheckCircle className="h-4 w-4" />
                                        Lancer le voyage
                                      </>
                                    )}
                                  </button>
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
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
