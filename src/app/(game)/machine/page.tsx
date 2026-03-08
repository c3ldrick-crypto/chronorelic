"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Cog, Lock, Clock, Zap, AlertTriangle, CheckCircle } from "lucide-react"
import { MACHINE_ERAS, MACHINE_LEVEL_LABELS } from "@/lib/game/machine"

interface EraStatus { locked: boolean; rechargeEndsAt: number | null }
interface Essences  {
  chronoEssence: number; energieResiduelle: number; cristalParadoxal: number
  residuAncestral: number; quintessence: number; quintessenceAbsolue: number
}
interface MachineState {
  machineLevel:      number
  machineLevelLabel: string
  eraStatuses:       Record<string, EraStatus>
  essences:          Essences
}
interface TravelResult {
  success?:    boolean
  failed?:     boolean
  targetMinute?: string
  era?:        { id: string; label: string; icon: string; minRarity: string }
  eventHint?:  { title: string; year: number | null; category: string | null } | null
  rechargeEndsAt?: number
  message?:    string
  instability?: boolean
}

function EssenceCost({ label, icon, amount, has }: { label: string; icon: string; amount: number; has: number }) {
  const ok = has >= amount
  return (
    <div className={`flex items-center gap-1 text-xs ${ok ? "text-slate-300" : "text-red-400"}`}>
      <span>{icon}</span>
      <span className="font-mono">{amount}</span>
      {!ok && <span className="text-red-400">({has})</span>}
    </div>
  )
}

function Countdown({ endsAt }: { endsAt: number }) {
  const [left, setLeft] = useState(Math.max(0, endsAt - Date.now()))
  useEffect(() => {
    const iv = setInterval(() => setLeft(Math.max(0, endsAt - Date.now())), 1000)
    return () => clearInterval(iv)
  }, [endsAt])
  const m = Math.floor(left / 60000)
  const s = Math.floor((left % 60000) / 1000)
  return <span className="font-mono text-amber-400">{m}:{String(s).padStart(2, "0")}</span>
}

export default function MachinePage() {
  const router = useRouter()
  const [state, setState]           = useState<MachineState | null>(null)
  const [loading, setLoading]       = useState(true)
  const [selectedEra, setSelectedEra] = useState<string | null>(null)
  const [traveling, setTraveling]   = useState(false)
  const [result, setResult]         = useState<TravelResult | null>(null)

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/game/machine")
      if (!res.ok) throw new Error()
      const data = await res.json() as MachineState
      setState(data)
    } catch {
      toast.error("Erreur de chargement de la Machine.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const travel = async (eraId: string) => {
    if (traveling) return
    setTraveling(true)
    try {
      const res  = await fetch("/api/game/machine", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ eraId }),
      })
      const data = await res.json() as TravelResult
      if (!res.ok) {
        toast.error((data as { error?: string }).error ?? "Erreur")
        return
      }
      setResult(data)
      await load()
    } catch {
      toast.error("Erreur réseau.")
    } finally {
      setTraveling(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
          <Cog className="h-12 w-12 text-violet-400" />
        </motion.div>
      </div>
    )
  }

  if (!state) return null

  const ml = state.machineLevel

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-4 max-w-2xl mx-auto">
      {/* Machine header */}
      <div className="text-center mb-8">
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="inline-block mb-3"
        >
          <span className="text-6xl">⚙️</span>
        </motion.div>
        <h1 className="text-3xl font-bold text-slate-100">Machine Temporelle</h1>
        <div className={`inline-flex items-center gap-2 mt-2 px-4 py-1.5 rounded-full border text-sm font-medium ${
          ml === 0 ? "border-red-800 text-red-400 bg-red-950/20"
          : ml < 3  ? "border-amber-700 text-amber-400 bg-amber-950/20"
          : ml < 5  ? "border-blue-700 text-blue-300 bg-blue-950/20"
          : "border-emerald-600 text-emerald-300 bg-emerald-950/20"
        }`}>
          <Cog className="h-4 w-4" />
          Niveau {ml} — {MACHINE_LEVEL_LABELS[ml]}
        </div>

        {ml === 0 && (
          <p className="text-slate-400 text-sm mt-3">
            Construisez la Machine Temporelle dans votre Sanctuaire pour voyager dans le passé.
          </p>
        )}
      </div>

      {/* Essences balance */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        {[
          { key: "chronoEssence",       icon: "⧗", label: "Chrono"    },
          { key: "energieResiduelle",   icon: "⚡", label: "Énergie"   },
          { key: "cristalParadoxal",    icon: "🔮", label: "Paradoxal" },
          { key: "residuAncestral",     icon: "🏺", label: "Ancestral" },
          { key: "quintessence",        icon: "✦",  label: "Quintes."  },
          { key: "quintessenceAbsolue", icon: "☯",  label: "Absolue"   },
        ].map(e => (
          <div key={e.key} className="bg-slate-800/40 rounded-lg p-2 text-center border border-slate-700/40">
            <div className="text-lg">{e.icon}</div>
            <div className="text-sm font-mono text-slate-200">{state.essences[e.key as keyof Essences]}</div>
            <div className="text-xs text-slate-500">{e.label}</div>
          </div>
        ))}
      </div>

      {/* Travel result */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`mb-6 p-4 rounded-xl border ${
              result.success
                ? "border-cyan-500/50 bg-cyan-950/20"
                : "border-red-700/50 bg-red-950/20"
            }`}
          >
            {result.success ? (
              <div>
                <div className="flex items-center gap-2 text-cyan-300 font-bold mb-2">
                  <CheckCircle className="h-5 w-5" />
                  Connexion établie — {result.era?.icon} {result.era?.label}
                </div>
                <p className="text-slate-300 text-sm mb-3">{result.message}</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400">Minute cible</p>
                    <p className="text-2xl font-mono text-cyan-400 font-bold">{result.targetMinute}</p>
                    {result.eventHint && (
                      <p className="text-xs text-slate-400 mt-0.5">
                        {result.eventHint.year && `${result.eventHint.year} — `}{result.eventHint.title}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      if (result.targetMinute && result.era) {
                        sessionStorage.setItem("machineTarget", JSON.stringify({
                          minute: result.targetMinute,
                          eraLabel: result.era.label,
                          eraIcon:  result.era.icon,
                        }))
                        router.push("/play")
                      }
                    }}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold transition-colors"
                  >
                    Capturer →
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-red-300 font-bold">Voyage avorté</p>
                  <p className="text-slate-400 text-sm mt-1">{result.message}</p>
                </div>
              </div>
            )}
            <button
              onClick={() => setResult(null)}
              className="mt-3 text-xs text-slate-500 hover:text-slate-300"
            >
              Fermer
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Era grid */}
      {ml > 0 ? (
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Ères accessibles</h2>
          {MACHINE_ERAS.map(era => {
            const status       = state.eraStatuses[era.id] ?? { locked: true, rechargeEndsAt: null }
            const isLocked     = status.locked
            const isRecharging = !isLocked && status.rechargeEndsAt && status.rechargeEndsAt > Date.now()
            const isSelected   = selectedEra === era.id

            return (
              <motion.div
                key={era.id}
                whileHover={!isLocked && !isRecharging ? { scale: 1.01 } : {}}
                className={`rounded-xl border p-4 transition-all ${
                  isLocked
                    ? "border-slate-800 bg-slate-900/30 opacity-50"
                    : isRecharging
                      ? "border-amber-800/40 bg-amber-950/10"
                      : isSelected
                        ? "border-violet-500/60 bg-violet-950/20 cursor-pointer"
                        : "border-slate-700/40 bg-slate-800/30 hover:border-slate-600 cursor-pointer"
                }`}
                onClick={() => {
                  if (!isLocked && !isRecharging) setSelectedEra(isSelected ? null : era.id)
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{isLocked ? "🔒" : era.icon}</span>
                    <div>
                      <p className={`font-semibold ${isLocked ? "text-slate-500" : "text-slate-100"}`}>
                        {era.label}
                      </p>
                      <p className="text-xs text-slate-400">{era.dateRange}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {isLocked && (
                      <div className="flex items-center gap-1 text-slate-500 text-xs">
                        <Lock className="h-3 w-3" />
                        Niv. Machine {era.minMachineLevel}
                      </div>
                    )}
                    {isRecharging && status.rechargeEndsAt && (
                      <div className="flex items-center gap-1 text-amber-400 text-xs">
                        <Clock className="h-3 w-3" />
                        <Countdown endsAt={status.rechargeEndsAt} />
                      </div>
                    )}
                    {!isLocked && !isRecharging && (
                      <div className="text-xs text-slate-400">
                        {era.instabilityPct > 0 && (
                          <span className="text-orange-400">{era.instabilityPct}% instab.</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Expanded details */}
                <AnimatePresence>
                  {isSelected && !isLocked && !isRecharging && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-4 border-t border-slate-700/40 mt-4">
                        <p className="text-xs text-slate-400 mb-3">{era.description}</p>
                        <div className="flex flex-wrap gap-3 mb-3">
                          {era.cost.chronoEssence && (
                            <EssenceCost label="Chrono" icon="⧗" amount={era.cost.chronoEssence} has={state.essences.chronoEssence} />
                          )}
                          {era.cost.energieResiduelle && (
                            <EssenceCost label="Énergie" icon="⚡" amount={era.cost.energieResiduelle} has={state.essences.energieResiduelle} />
                          )}
                          {era.cost.cristalParadoxal && (
                            <EssenceCost label="Paradoxal" icon="🔮" amount={era.cost.cristalParadoxal} has={state.essences.cristalParadoxal} />
                          )}
                          {era.cost.residuAncestral && (
                            <EssenceCost label="Ancestral" icon="🏺" amount={era.cost.residuAncestral} has={state.essences.residuAncestral} />
                          )}
                          {era.cost.quintessence && (
                            <EssenceCost label="Quintes." icon="✦" amount={era.cost.quintessence} has={state.essences.quintessence} />
                          )}
                          {era.cost.quintessenceAbsolue && (
                            <EssenceCost label="Absolue" icon="☯" amount={era.cost.quintessenceAbsolue} has={state.essences.quintessenceAbsolue} />
                          )}
                        </div>
                        <div className="flex gap-2 text-xs text-slate-500 mb-4">
                          <span>Min. {era.minRarity}</span>
                          <span>·</span>
                          <span>{era.rechargeMinutes}min recharge</span>
                        </div>
                        <button
                          onClick={() => travel(era.id)}
                          disabled={traveling}
                          className="w-full py-2.5 rounded-lg bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white font-bold text-sm disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                        >
                          {traveling ? (
                            <><Cog className="h-4 w-4 animate-spin" /> Initialisation...</>
                          ) : (
                            <><Zap className="h-4 w-4" /> Voyager dans {era.label}</>
                          )}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-12 text-slate-500">
          <Cog className="h-16 w-16 mx-auto mb-4 opacity-20" />
          <p>Construisez la Machine Temporelle dans le Sanctuaire (niveau 1)</p>
          <button
            onClick={() => router.push("/sanctuaire")}
            className="mt-4 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm transition-colors"
          >
            Aller au Sanctuaire →
          </button>
        </div>
      )}
    </div>
  )
}
