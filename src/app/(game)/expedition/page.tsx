"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { getRoomLabel, getRoomIcon, type ActiveExpedition, type ExpeditionRoom } from "@/lib/game/expedition"
import type { ExpeditionEra } from "@/lib/game/expedition"

interface EraWithStatus extends ExpeditionEra {
  cooldownUntil: number | null
  onCooldown:    boolean
  canAfford:     boolean
  levelOk:       boolean
}

interface Resources {
  eclatsTemporels:     number
  chronite:            number
  essencesHistoriques: number
  fragmentsAnomalie:   number
}

interface ExpeditionData {
  active:    ActiveExpedition | null
  eras:      EraWithStatus[]
  resources: Resources
  level:     number
}

interface RoomResult {
  failed?:         boolean
  relicObtained?: { relicId: string; rarity: string; minute: string; xpGained: number }
  treasureAwarded?: Partial<Resources>
  anomalyId?:      string
}

const RARITY_COLORS: Record<string, string> = {
  COMMUNE:    "text-slate-400 border-slate-600",
  RARE:       "text-blue-400 border-blue-500",
  EPIQUE:     "text-violet-400 border-violet-500",
  LEGENDAIRE: "text-amber-400 border-amber-500",
  MYTHIQUE:   "text-pink-400 border-pink-500",
}

const RARITY_LABELS: Record<string, string> = {
  COMMUNE:    "Commune",
  RARE:       "Rare",
  EPIQUE:     "Épique",
  LEGENDAIRE: "Légendaire",
  MYTHIQUE:   "Mythique",
}

function useCooldownTimer(cooldownUntil: number | null) {
  const [remaining, setRemaining] = useState<string>("")
  useEffect(() => {
    if (!cooldownUntil) { setRemaining(""); return }
    const update = () => {
      const diff = cooldownUntil - Date.now()
      if (diff <= 0) { setRemaining(""); return }
      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      setRemaining(`${h}h ${m}m`)
    }
    update()
    const id = setInterval(update, 30000)
    return () => clearInterval(id)
  }, [cooldownUntil])
  return remaining
}

function EraCard({ era, loading, onStart }: { era: EraWithStatus; loading: boolean; onStart: (id: string) => void }) {
  const cdRemain = useCooldownTimer(era.cooldownUntil)
  const disabled = era.onCooldown || !era.canAfford || !era.levelOk || loading

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`card-cosmic p-5 flex flex-col gap-3 ${
        !disabled ? "hover:border-violet-500/30 transition-colors" : "opacity-60"
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="text-3xl shrink-0">{era.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-[#e2e8f0]">{era.label}</div>
          <div className="text-xs text-[#475569] mt-0.5">{era.description}</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        <span className="bg-amber-500/10 text-amber-300 rounded px-2 py-0.5">
          ✨ {era.entryCost.eclatsTemporels}
        </span>
        <span className="bg-cyan-500/10 text-cyan-300 rounded px-2 py-0.5">
          🔩 {era.entryCost.chronite}
        </span>
        {era.rarityBonus > 0 && (
          <span className="bg-violet-500/10 text-violet-300 rounded px-2 py-0.5">
            +{era.rarityBonus}% Légendaire
          </span>
        )}
        <span className="bg-[#1e1e42] text-[#94a3b8] rounded px-2 py-0.5">
          Niv. {era.requiredLevel}+
        </span>
      </div>

      {era.onCooldown && cdRemain && (
        <div className="text-xs text-red-400">Cooldown : {cdRemain}</div>
      )}
      {!era.levelOk && (
        <div className="text-xs text-red-400">Niveau insuffisant</div>
      )}
      {!era.canAfford && !era.onCooldown && era.levelOk && (
        <div className="text-xs text-amber-400">Ressources insuffisantes</div>
      )}

      <button
        disabled={disabled}
        onClick={() => onStart(era.id)}
        className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all ${
          disabled
            ? "bg-[#1e1e42] text-[#475569] cursor-not-allowed"
            : "bg-violet-600 hover:bg-violet-500 text-white cursor-pointer"
        }`}
      >
        {loading ? "Chargement..." : era.onCooldown ? "En cooldown" : "Entrer"}
      </button>
    </motion.div>
  )
}

export default function ExpeditionPage() {
  const [data, setData]               = useState<ExpeditionData | null>(null)
  const [loading, setLoading]         = useState(true)
  const [advancing, setAdvancing]     = useState(false)
  const [lastResult, setLastResult]   = useState<RoomResult | null>(null)
  const [showResult, setShowResult]   = useState(false)
  const [completionBonus, setCompletionBonus] = useState<{ xp: number; eclats: number } | null>(null)
  const [abandonConfirm, setAbandonConfirm]   = useState(false)
  const [starting, setStarting]       = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const res  = await fetch("/api/game/expedition")
      const json = await res.json() as ExpeditionData
      if (res.ok) setData(json)
      else toast.error("Impossible de charger les expéditions")
    } catch {
      toast.error("Erreur réseau")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchData()
  }, [fetchData])

  const handleStart = useCallback(async (eraId: string) => {
    if (starting) return
    setStarting(true)
    try {
      const res  = await fetch("/api/game/expedition", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ action: "start", eraId }),
      })
      const json = await res.json()
      if (res.ok) {
        toast.success("Expédition lancée !")
        await fetchData()
      } else {
        toast.error(json.error ?? "Impossible de démarrer")
      }
    } catch {
      toast.error("Erreur réseau")
    } finally {
      setStarting(false)
    }
  }, [starting, fetchData])

  const handleAdvance = useCallback(async () => {
    if (advancing) return
    setAdvancing(true)
    setLastResult(null)
    setShowResult(false)
    try {
      const res  = await fetch("/api/game/expedition", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ action: "advance" }),
      })
      const json = await res.json()
      if (res.ok) {
        setLastResult(json.roomResult as RoomResult)
        setShowResult(true)
        if (json.completionBonus) setCompletionBonus(json.completionBonus as { xp: number; eclats: number })
        await fetchData()
      } else {
        toast.error(json.error ?? "Impossible d'avancer")
      }
    } catch {
      toast.error("Erreur réseau")
    } finally {
      setAdvancing(false)
    }
  }, [advancing, fetchData])

  const handleDismiss = useCallback(async () => {
    await fetch("/api/game/expedition", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ action: "dismiss" }),
    }).catch(() => {})
    setCompletionBonus(null)
    setLastResult(null)
    setShowResult(false)
    await fetchData()
  }, [fetchData])

  const handleAbandon = useCallback(async () => {
    try {
      const res  = await fetch("/api/game/expedition", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ action: "abandon" }),
      })
      const json = await res.json()
      if (res.ok) {
        toast("Expédition abandonnée", { description: "Vos ressources d'entrée sont perdues." })
        setAbandonConfirm(false)
        setLastResult(null)
        setShowResult(false)
        setCompletionBonus(null)
        await fetchData()
      } else {
        toast.error(json.error ?? "Erreur")
      }
    } catch {
      toast.error("Erreur réseau")
    }
  }, [fetchData])

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

  const active = data?.active

  // ── Completed view ─────────────────────────────────────────────────────────
  if (active && active.status === "completed") {
    const obtainedRelics = active.rooms
      .filter(r => r.relicObtained)
      .map(r => r.relicObtained!)

    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card-cosmic p-8"
        >
          <div className="text-5xl mb-4">🏆</div>
          <h1 className="font-display text-3xl font-black text-gradient-violet mb-2">
            Expédition Terminée !
          </h1>
          <p className="text-[#94a3b8] mb-6">
            Vous avez conquis l&apos;ère et ramené des reliques précieuses.
          </p>

          {completionBonus && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6">
              <div className="text-sm font-bold text-amber-300 mb-2">Bonus de complétion</div>
              <div className="flex justify-center gap-4 text-sm">
                <span className="text-amber-300">+{completionBonus.xp} XP</span>
                <span className="text-amber-300">✨ +{completionBonus.eclats} Éclats</span>
              </div>
            </div>
          )}

          {obtainedRelics.length > 0 && (
            <div className="mb-6">
              <div className="text-sm text-[#475569] mb-3">Reliques obtenues :</div>
              <div className="space-y-2">
                {obtainedRelics.map((r, i) => (
                  <div key={i} className={`flex items-center justify-between rounded-lg px-4 py-2 border ${RARITY_COLORS[r.rarity] ?? "border-slate-600 text-slate-400"}`}>
                    <span className="font-mono text-sm font-bold">{r.minute}</span>
                    <span className="text-sm font-bold">{RARITY_LABELS[r.rarity] ?? r.rarity}</span>
                    <span className="text-xs text-[#94a3b8]">+{r.xpGained} XP</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => void handleDismiss()}
            className="btn-primary px-8 py-3 rounded-xl font-bold"
          >
            Retourner à l&apos;exploration
          </button>
        </motion.div>
      </div>
    )
  }

  // ── Active expedition view ─────────────────────────────────────────────────
  if (active && active.status === "active") {
    const era       = data?.eras.find(e => e.id === active.eraId)
    const roomIdx   = active.currentRoomIndex
    const totalRooms = active.rooms.length
    const currentRoom: ExpeditionRoom | undefined = active.rooms[roomIdx]

    const roomActionLabel = (type: string) => {
      switch (type) {
        case "SAFE_CAPTURE":  return "Capturer la Relique"
        case "RISKY_CAPTURE": return "Tenter la Capture Risquée"
        case "TREASURE":      return "Ouvrir le Coffre"
        case "ANOMALY":       return "Traverser l'Anomalie"
        case "BOSS":          return "Affronter le Gardien"
        default:              return "Continuer"
      }
    }

    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">{era?.icon ?? "🗺️"}</span>
            <div>
              <h1 className="font-display text-xl font-black text-[#e2e8f0]">
                {era?.label ?? active.eraId}
              </h1>
              <p className="text-xs text-[#475569]">Expédition en cours</p>
            </div>
          </div>

          {/* Room progress dots */}
          <div className="flex gap-2 items-center">
            {active.rooms.map((room, i) => (
              <div
                key={i}
                title={getRoomLabel(room.type)}
                className={`relative flex items-center justify-center w-8 h-8 rounded-full border text-sm transition-all ${
                  room.cleared
                    ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300"
                    : i === roomIdx
                    ? "bg-violet-500/30 border-violet-500/70 text-violet-300 ring-2 ring-violet-500/50"
                    : "bg-[#1e1e42] border-[#2e2e52] text-[#475569]"
                }`}
              >
                {getRoomIcon(room.type)}
              </div>
            ))}
            <span className="text-xs text-[#475569] ml-2">
              {roomIdx}/{totalRooms}
            </span>
          </div>
        </motion.div>

        {/* Result display */}
        <AnimatePresence>
          {showResult && lastResult && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4"
            >
              <div className="card-cosmic p-4 border border-violet-500/20">
                {lastResult.failed && (
                  <div className="text-red-400 font-bold text-sm">
                    💀 La capture a échoué — le flux temporel a résisté.
                  </div>
                )}
                {lastResult.relicObtained && (
                  <div className="space-y-2">
                    <div className="text-sm text-[#94a3b8] font-bold">Relique obtenue :</div>
                    <div className={`flex items-center justify-between rounded-lg px-4 py-2.5 border ${RARITY_COLORS[lastResult.relicObtained.rarity] ?? "border-slate-600"}`}>
                      <span className="font-mono font-bold">{lastResult.relicObtained.minute}</span>
                      <span className="font-bold">{RARITY_LABELS[lastResult.relicObtained.rarity] ?? lastResult.relicObtained.rarity}</span>
                      <span className="text-xs text-[#94a3b8]">+{lastResult.relicObtained.xpGained} XP</span>
                    </div>
                  </div>
                )}
                {lastResult.treasureAwarded && (
                  <div className="space-y-2">
                    <div className="text-sm text-amber-300 font-bold">💎 Trésor temporel !</div>
                    <div className="flex gap-3 text-sm">
                      {lastResult.treasureAwarded.eclatsTemporels ? (
                        <span className="text-amber-300">✨ +{lastResult.treasureAwarded.eclatsTemporels}</span>
                      ) : null}
                      {lastResult.treasureAwarded.chronite ? (
                        <span className="text-cyan-300">🔩 +{lastResult.treasureAwarded.chronite}</span>
                      ) : null}
                    </div>
                  </div>
                )}
                {lastResult.anomalyId && (
                  <div className="text-violet-400 text-sm">
                    🌀 Anomalie traversée : <span className="font-bold">{lastResult.anomalyId}</span>
                  </div>
                )}
                <button
                  onClick={() => setShowResult(false)}
                  className="mt-3 text-xs text-[#475569] hover:text-[#94a3b8]"
                >
                  Fermer
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Current room */}
        {currentRoom ? (
          <motion.div
            key={roomIdx}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card-cosmic p-8 text-center mb-6"
          >
            <div className="text-5xl mb-3">{getRoomIcon(currentRoom.type)}</div>
            <h2 className="font-display text-2xl font-bold text-[#e2e8f0] mb-2">
              {getRoomLabel(currentRoom.type)}
            </h2>
            <p className="text-sm text-[#475569] mb-6">
              {currentRoom.type === "SAFE_CAPTURE" && "Capturez une relique de cette ère temporelle."}
              {currentRoom.type === "RISKY_CAPTURE" && "Tentez une capture risquée — 30% de chance d'échec, mais des récompenses doublées si succès."}
              {currentRoom.type === "TREASURE" && "Un coffre temporel vous attend, rempli de ressources précieuses."}
              {currentRoom.type === "ANOMALY" && "Une anomalie temporelle perturbe le flux. Traversez-la."}
              {currentRoom.type === "BOSS" && "Le Gardien de l'Ère vous affronte. Victorieux, vous obtiendrez une relique LÉGENDAIRE garantie."}
            </p>

            <button
              onClick={() => void handleAdvance()}
              disabled={advancing}
              className={`w-full max-w-xs mx-auto py-3 rounded-xl font-bold text-sm transition-all ${
                advancing
                  ? "bg-[#1e1e42] text-[#475569] cursor-not-allowed"
                  : currentRoom.type === "BOSS"
                  ? "bg-amber-600 hover:bg-amber-500 text-white"
                  : currentRoom.type === "RISKY_CAPTURE"
                  ? "bg-red-600 hover:bg-red-500 text-white"
                  : "bg-violet-600 hover:bg-violet-500 text-white"
              }`}
            >
              {advancing ? "En cours..." : roomActionLabel(currentRoom.type)}
            </button>
          </motion.div>
        ) : (
          <div className="card-cosmic p-8 text-center text-[#475569]">
            Toutes les salles ont été complétées.
          </div>
        )}

        {/* Abandon */}
        {!abandonConfirm ? (
          <button
            onClick={() => setAbandonConfirm(true)}
            className="w-full text-xs text-[#475569] hover:text-red-400 transition-colors py-2"
          >
            Abandonner l&apos;expédition
          </button>
        ) : (
          <div className="card-cosmic p-4 border border-red-500/30 text-center">
            <p className="text-sm text-red-300 mb-3">
              Abandonner l&apos;expédition ? Vos ressources d&apos;entrée sont perdues.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => void handleAbandon()}
                className="px-4 py-2 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 text-sm font-bold"
              >
                Confirmer
              </button>
              <button
                onClick={() => setAbandonConfirm(false)}
                className="px-4 py-2 rounded-lg bg-[#1e1e42] text-[#94a3b8] hover:bg-[#2e2e52] text-sm"
              >
                Annuler
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ── Era selection view ─────────────────────────────────────────────────────
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">🗺️</span>
          <h1 className="font-display text-3xl font-black text-gradient-violet">
            Expéditions Temporelles
          </h1>
        </div>
        <p className="text-[#94a3b8] text-sm">
          Plongez dans une ère historique et traversez 6 salles pour ramener des reliques rares. Chaque ère a un cooldown de 24h après votre expédition.
        </p>
      </motion.div>

      {/* Resources */}
      {data?.resources && (
        <div className="flex flex-wrap gap-3 mb-6 text-sm">
          <span className="bg-[#1e1e42] rounded-lg px-3 py-1.5 text-amber-300">
            ✨ {data.resources.eclatsTemporels}
          </span>
          <span className="bg-[#1e1e42] rounded-lg px-3 py-1.5 text-cyan-300">
            🔩 {data.resources.chronite}
          </span>
          <span className="bg-[#1e1e42] rounded-lg px-3 py-1.5 text-[#94a3b8]">
            Niveau {data.level}
          </span>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {(data?.eras ?? []).map((era, i) => (
          <motion.div
            key={era.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <EraCard era={era} loading={starting} onStart={(id) => void handleStart(id)} />
          </motion.div>
        ))}
      </div>
    </div>
  )
}
