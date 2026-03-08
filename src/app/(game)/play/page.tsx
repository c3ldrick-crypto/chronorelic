"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { MythicEvent } from "@/components/game/MythicEvent"
import { RelicCard, RelicData } from "@/components/game/RelicCard"
import { XPBar } from "@/components/game/XPBar"
import { useGameStore } from "@/hooks/useGameStore"
import { FREE_LIMITS, RISKY_CAPTURE } from "@/types"
import { Flame, Zap, Swords, ShieldCheck, Hammer } from "lucide-react"
import { getTodayAnomalies, AnomalyDefinition } from "@/lib/game/anomalies"
import type { TimeWindow } from "@/lib/game/windows"
import { CaptureFlow, type CaptureResult } from "@/components/game/CaptureFlow"
import type { HeritageBonusDefinition } from "@/lib/game/heritage"

interface Resources {
  eclatsTemporels:     number
  chronite:            number
  essencesHistoriques: number
  fragmentsAnomalie:   number
}

interface PlayerData {
  character: {
    name:         string
    class:        string
    level:        number
    xpTotal:      number
    talentPoints: number
  } | null
  isPremium:    boolean
  capturesLeft: number | null
  recentRelics: RelicData[]
  streakCount:  number
  hasReroll:    boolean
  resources:    Resources
}

interface AbilityData {
  ability: {
    id:          string
    label:       string
    description: string
    icon:        string
    usesPerDay:  number
    usesLeft:    number
    usedToday:   number
    effect:      string
  }
}

const RESOURCE_LABELS = [
  { key: "eclatsTemporels",     label: "Éclats",    icon: "✨", color: "text-amber-300" },
  { key: "chronite",            label: "Chronite",  icon: "🔩", color: "text-cyan-300" },
  { key: "essencesHistoriques", label: "Essences",  icon: "📜", color: "text-emerald-300" },
  { key: "fragmentsAnomalie",   label: "Fragments", icon: "🔮", color: "text-pink-300" },
] as const

const CLASS_ICONS: Record<string, string> = {
  CHRONOMANCER: "⏰",
  ARCHIVISTE:   "📚",
  CHASSEUR:     "⚡",
  ORACLE:       "🔮",
}
const CLASS_LABELS: Record<string, string> = {
  CHRONOMANCER: "Chronomancien",
  ARCHIVISTE:   "Archiviste",
  CHASSEUR:     "Chasseur",
  ORACLE:       "Oracle Temporel",
}

export default function PlayPage() {
  const [player, setPlayer]           = useState<PlayerData | null>(null)
  const [isCapturing, setCapturing]   = useState(false)
  const [showEvent, setShowEvent]     = useState(false)
  const [riskyMode, setRiskyMode]     = useState(false)
  const [lastDrops, setLastDrops]     = useState<Resources | null>(null)
  const [abilityData, setAbilityData] = useState<AbilityData | null>(null)
  const [usingAbility, setUsingAbility] = useState(false)
  const [abilityResult, setAbilityResult] = useState<{ visions?: Array<{minute: string; title: string; year?: number}> } | null>(null)
  const [abilityActive, setAbilityActive] = useState<string | null>(null) // active effect key
  // Real-time clock
  const [clock, setClock] = useState(() => {
    const n = new Date(); return `${String(n.getHours()).padStart(2,"0")}:${String(n.getMinutes()).padStart(2,"0")}:${String(n.getSeconds()).padStart(2,"0")}`
  })
  // Time windows
  const [windows, setWindows]                   = useState<TimeWindow[]>([])
  const [windowsLoading, setWindowsLoading]     = useState(false)
  const [windowsExpiresAt, setWindowsExpiresAt] = useState<number | null>(null)
  // Machine Temporelle target
  const [machineTarget, setMachineTarget] = useState<{ minute: string; eraLabel: string; eraIcon: string } | null>(null)
  // Death modal
  const [deathModal, setDeathModal] = useState<{ options: HeritageBonusDefinition[]; charClass: string } | null>(null)
  const [choosingHeritage, setChoosingHeritage] = useState(false)

  const todayAnomalies: [AnomalyDefinition, AnomalyDefinition] = getTodayAnomalies()

  const {
    comboCount,
    pendingResult,
    setPendingResult,
    incrementCapture,
  } = useGameStore()

  const fetchWindows = useCallback(async (refresh = false) => {
    setWindowsLoading(true)
    try {
      const res  = refresh
        ? await fetch("/api/game/windows/refresh", { method: "POST" })
        : await fetch("/api/game/windows")
      const data = await res.json()
      if (res.ok) {
        setWindows(data.windows ?? [])
        setWindowsExpiresAt(data.expiresAt ?? null)
      }
    } catch {
      // silently fail — windows are optional
    } finally {
      setWindowsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetch("/api/game/player")
      .then(async (r) => {
        const data = await r.json()
        if (!r.ok) throw new Error(data.error ?? `HTTP ${r.status}`)
        return data
      })
      .then(setPlayer)
      .catch((e: unknown) => {
        const msg = e instanceof Error ? e.message : "Erreur inconnue"
        toast.error(`Impossible de charger le profil: ${msg}`)
      })

    fetch("/api/game/ability")
      .then(async (r) => { if (r.ok) setAbilityData(await r.json()) })
      .catch(() => {})

    void fetchWindows()

    // Check for machine target from Machine Temporelle page
    try {
      const stored = sessionStorage.getItem("machineTarget")
      if (stored) {
        setMachineTarget(JSON.parse(stored) as { minute: string; eraLabel: string; eraIcon: string })
        sessionStorage.removeItem("machineTarget")
      }
    } catch { /* ignore */ }
  }, [fetchWindows])

  // Real-time clock — ticks every second
  useEffect(() => {
    const tick = () => {
      const n = new Date()
      setClock(`${String(n.getHours()).padStart(2,"0")}:${String(n.getMinutes()).padStart(2,"0")}:${String(n.getSeconds()).padStart(2,"0")}`)
    }
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  const handleUseAbility = useCallback(async () => {
    if (!abilityData || usingAbility) return
    setUsingAbility(true)
    const effect = abilityData.ability.effect
    try {
      const res  = await fetch("/api/game/ability", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: effect }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success(data.message ?? "Capacité utilisée !")
        setAbilityData((prev) => prev ? {
          ability: { ...prev.ability, usesLeft: data.usesLeft ?? prev.ability.usesLeft - 1 }
        } : prev)
        if (data.effect === "CHASSEUR_GUARANTEED_RARE") setAbilityActive("CHASSEUR_GUARANTEED_RARE")
        if (data.effect === "CHRONOMANCER_REROLL")      setAbilityActive("CHRONOMANCER_REROLL")
        if (data.visions) setAbilityResult({ visions: data.visions })
        if (data.totalRewards) {
          const r = data.totalRewards
          toast.info(`Analyse : ✨${r.eclatsTemporels} 🔩${r.chronite} 📜${r.essencesHistoriques}`)
        }
      } else {
        toast.error(data.error ?? "Erreur")
      }
    } catch {
      toast.error("Erreur réseau")
    }
    setUsingAbility(false)
  }, [abilityData, usingAbility])

  const handleCapture = useCallback(async () => {
    if (isCapturing) return
    setCapturing(true)

    try {
      const res  = await fetch("/api/game/capture", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          mode: riskyMode ? "RISKY" : "SAFE",
        }),
      })
      const data = await res.json()

      // Échec RISKY : le serveur retourne 200 avec failed: true
      if (data.failed && data.mode === "RISKY") {
        toast("Capture risquée ratée !", {
          description: "Le flux temporel a absorbé ta mise.",
          duration: 5000,
        })
        const bet = data.lostBet
        setPlayer((prev) => {
          if (!prev || !bet) return prev
          return {
            ...prev,
            resources: {
              ...prev.resources,
              eclatsTemporels: Math.max(0, prev.resources.eclatsTemporels - (bet.eclatsTemporels ?? 0)),
              chronite:        Math.max(0, prev.resources.chronite        - (bet.chronite ?? 0)),
            },
          }
        })
        setCapturing(false)
        return
      }

      if (!res.ok) {
        if (res.status === 409 && data.alreadyCaptured) {
          toast("Déjà dans ta collection !", {
            description: `La minute est déjà dans tes reliques.`,
            duration: 4000,
          })
        } else {
          toast.error(data.error ?? "Capture impossible")
        }
        setCapturing(false)
        return
      }

      incrementCapture()
      setPendingResult(data)
      setShowEvent(true)
      if (data.drops) setLastDrops(data.drops)
      void fetchWindows(true)

      setPlayer((prev) => {
        if (!prev) return prev
        const newResources = data.drops
          ? {
              eclatsTemporels:     prev.resources.eclatsTemporels     + data.drops.eclatsTemporels,
              chronite:            prev.resources.chronite            + data.drops.chronite,
              essencesHistoriques: prev.resources.essencesHistoriques + data.drops.essencesHistoriques,
              fragmentsAnomalie:   prev.resources.fragmentsAnomalie   + data.drops.fragmentsAnomalie,
            }
          : prev.resources
        return {
          ...prev,
          capturesLeft: prev.capturesLeft !== null ? Math.max(0, prev.capturesLeft - 1) : null,
          recentRelics: [data.relic, ...prev.recentRelics.slice(0, 7)],
          resources:    newResources,
          character:    prev.character
            ? { ...prev.character, xpTotal: prev.character.xpTotal + (data.xpGained ?? 0) }
            : null,
        }
      })

      const rarity = data.rarity
      if (rarity === "MYTHIQUE") {
        toast("🔮 ANOMALIE TEMPORELLE !", {
          description: "Une relique mythique vient d'apparaître !",
          duration: 8000,
        })
      } else if (rarity === "LEGENDAIRE") {
        toast("🟡 Relique Légendaire !", { description: `+${data.xpGained} XP`, duration: 5000 })
      } else if (rarity === "EPIQUE") {
        toast("🟣 Relique Épique !", { description: `+${data.xpGained} XP` })
      }
    } catch {
      toast.error("Erreur réseau")
    }

    setCapturing(false)
  }, [isCapturing, riskyMode, incrementCapture, setPendingResult])

  const handleCloseEvent = useCallback(() => {
    setShowEvent(false)
    setPendingResult(null)
    setLastDrops(null)
  }, [setPendingResult])

  // Handler for the new CaptureFlow component
  const handleCaptureFlowDone = useCallback((result: CaptureResult) => {
    if (result.deathPending && result.heritageOptions) {
      setDeathModal({
        options:   result.heritageOptions as HeritageBonusDefinition[],
        charClass: player?.character?.class ?? "CHRONOMANCER",
      })
      return
    }

    if (!result.success) {
      const msg = result.consolation?.larmeTemporelle
        ? "Échec — mais une Larme Temporelle a été récupérée..."
        : result.message ?? "Capture échouée."
      toast(msg, { duration: 4000 })
      return
    }

    // Success
    incrementCapture()
    const dropsObj = result.drops as Record<string, number> | undefined
    if (dropsObj) setLastDrops({
      eclatsTemporels:     dropsObj.eclatsTemporels     ?? 0,
      chronite:            dropsObj.chronite            ?? 0,
      essencesHistoriques: dropsObj.essencesHistoriques ?? 0,
      fragmentsAnomalie:   dropsObj.fragmentsAnomalie   ?? 0,
    })
    setMachineTarget(null)
    setAbilityActive(null) // consume visual indicator after capture
    void fetchWindows(true)

    setPendingResult({
      rarity:     (result.rarity ?? "COMMUNE") as import("@/types").Rarity,
      minute:     result.minute ?? "",
      xpGained:   result.xpGained ?? 0,
      relicId:    result.relicId ?? "",
      narration:  result.narration,
      eventTitle: result.eventTitle,
      eventYear:  result.eventYear,
    })
    setShowEvent(true)

    setPlayer(prev => {
      if (!prev) return prev
      return {
        ...prev,
        capturesLeft: prev.capturesLeft !== null ? Math.max(0, prev.capturesLeft - 1) : null,
        recentRelics: result.relicId
          ? [{ id: result.relicId, minute: result.minute ?? "", rarity: result.rarity ?? "COMMUNE", capturedAt: new Date().toISOString(), xpGained: result.xpGained ?? 0, isFused: false, historicalEvent: result.eventTitle ? { title: result.eventTitle, year: result.eventYear ?? null, description: null, curiosity: null, category: null } : null } as import("@/components/game/RelicCard").RelicData, ...prev.recentRelics.slice(0, 7)]
          : prev.recentRelics,
        character:    result.didLevelUp
          ? prev.character ? { ...prev.character, xpTotal: prev.character.xpTotal + (result.xpGained ?? 0), level: result.newLevel ?? prev.character.level } : null
          : prev.character
          ? { ...prev.character, xpTotal: prev.character.xpTotal + (result.xpGained ?? 0) }
          : null,
        resources:    result.drops
          ? {
              eclatsTemporels:     prev.resources.eclatsTemporels     + ((result.drops as Record<string, number>).eclatsTemporels ?? 0),
              chronite:            prev.resources.chronite            + ((result.drops as Record<string, number>).chronite ?? 0),
              essencesHistoriques: prev.resources.essencesHistoriques + ((result.drops as Record<string, number>).essencesHistoriques ?? 0),
              fragmentsAnomalie:   prev.resources.fragmentsAnomalie   + ((result.drops as Record<string, number>).fragmentsAnomalie ?? 0),
            }
          : prev.resources,
      }
    })

    const rarity = result.rarity
    if (rarity === "MYTHIQUE") {
      toast("🔮 ANOMALIE TEMPORELLE !", { description: "Une relique mythique !", duration: 8000 })
    } else if (rarity === "LEGENDAIRE") {
      toast("🟡 Relique Légendaire !", { description: `+${result.xpGained} XP`, duration: 5000 })
    } else if (rarity === "EPIQUE") {
      toast("🟣 Relique Épique !", { description: `+${result.xpGained} XP` })
    }
  }, [player, incrementCapture, setPendingResult, fetchWindows])

  const handleChooseHeritage = useCallback(async (bonusId: string) => {
    if (choosingHeritage) return
    setChoosingHeritage(true)
    try {
      const res = await fetch("/api/game/heritage", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ action: "choose", bonusId }),
      })
      const data = await res.json() as { message?: string; error?: string }
      if (!res.ok) { toast.error(data.error ?? "Erreur"); return }
      toast.success(data.message ?? "Héritage choisi !")
      setDeathModal(null)
      // Reload page to pick up new character
      window.location.reload()
    } catch {
      toast.error("Erreur réseau")
    } finally {
      setChoosingHeritage(false)
    }
  }, [choosingHeritage])

  const handleReroll = useCallback(async () => {
    if (isCapturing) return
    setCapturing(true)
    try {
      const res  = await fetch("/api/game/reroll", { method: "POST" })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? "Relance impossible")
        setCapturing(false)
        return
      }
      incrementCapture()
      setPendingResult(data)
      setShowEvent(true)
      setPlayer((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          recentRelics: [data.relic, ...prev.recentRelics.slice(0, 7)],
          character: prev.character
            ? { ...prev.character, xpTotal: prev.character.xpTotal + (data.xpGained ?? 0) }
            : null,
        }
      })
      if (data.shardsSpent > 0) {
        toast.info(`${data.shardsSpent} Éclats dépensés pour la relance.`)
      }
    } catch {
      toast.error("Erreur réseau")
    }
    setCapturing(false)
  }, [isCapturing, incrementCapture, setPendingResult])

  if (!player) {
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

  if (!player.character) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="card-cosmic p-8 text-center max-w-md">
          <div className="text-5xl mb-4">🧙</div>
          <h2 className="font-display text-2xl font-bold text-[#e2e8f0] mb-3">
            Créez votre Personnage
          </h2>
          <p className="text-[#94a3b8] mb-6">
            Avant de capturer le temps, choisissez votre classe de Gardien.
          </p>
          <a href="/character" className="btn-primary px-6 py-3 rounded-xl inline-block font-semibold">
            Créer mon Personnage
          </a>
        </div>
      </div>
    )
  }

  const xpTotal = player.character.xpTotal
  const canRisky = player.character.level >= 10

  return (
    <>
      {/* Overlay événement de capture */}
      {pendingResult && (
        <MythicEvent
          rarity={pendingResult.rarity}
          minute={pendingResult.minute}
          visible={showEvent}
          onClose={handleCloseEvent}
          narration={pendingResult.narration}
          eventTitle={pendingResult.eventTitle}
        />
      )}

      {/* Particules WOW pour les hautes raretés */}
      <AnimatePresence>
        {showEvent && pendingResult && (pendingResult.rarity === "MYTHIQUE" || pendingResult.rarity === "LEGENDAIRE") && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none z-10"
          >
            {Array.from({ length: pendingResult.rarity === "MYTHIQUE" ? 20 : 12 }).map((_, i) => (
              <motion.div
                key={i}
                className={`absolute w-2 h-2 rounded-full ${
                  pendingResult.rarity === "MYTHIQUE" ? "bg-pink-400" : "bg-amber-400"
                }`}
                style={{
                  left: `${Math.random() * 100}%`,
                  top:  `${Math.random() * 100}%`,
                }}
                animate={{
                  y:       [0, -150 - Math.random() * 100],
                  opacity: [1, 0],
                  scale:   [1, 0],
                }}
                transition={{
                  duration: 1.5 + Math.random() * 1.5,
                  delay:    Math.random() * 0.5,
                  ease:     "easeOut",
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Layout principal centré ─── */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-[260px_1fr_260px] gap-5">

          {/* ─── Colonne gauche ─── */}
          <div className="flex flex-col gap-4">

            {/* ── Panneau Personnage ── */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="card-cosmic overflow-hidden"
            >
              <div
                className="flex items-center gap-4 p-4"
                style={{ borderBottom: "1px solid rgba(196,150,10,0.15)", background: "rgba(107,40,200,0.06)" }}
              >
                <span className="text-4xl">{CLASS_ICONS[player.character.class] ?? "🧙"}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-display text-sm font-bold truncate" style={{ color: "#f0e6c8" }}>
                    {player.character.name}
                  </div>
                  <div className="text-xs" style={{ color: "#c084fc" }}>
                    {CLASS_LABELS[player.character.class]} — Niv.{player.character.level}
                  </div>
                </div>
                {player.isPremium && (
                  <div className="flex items-center gap-1 rounded px-2 py-0.5"
                    style={{ background: "rgba(196,150,10,0.15)", border: "1px solid rgba(196,150,10,0.4)" }}>
                    <Zap className="h-3 w-3" style={{ color: "#e8b84b" }} />
                    <span className="text-xs font-bold" style={{ color: "#f5d678" }}>PRO</span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <XPBar xpTotal={xpTotal} />
                {player.character.talentPoints > 0 && (
                  <motion.a
                    href="/talents"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-3 flex items-center gap-2 rounded p-2 transition-colors"
                    style={{ background: "rgba(196,150,10,0.08)", border: "1px solid rgba(196,150,10,0.25)" }}
                  >
                    <Star className="h-3.5 w-3.5 shrink-0" style={{ color: "#e8b84b" }} />
                    <span className="text-xs font-medium" style={{ color: "#f5d678" }}>
                      {player.character.talentPoints} point{player.character.talentPoints > 1 ? "s" : ""} de talent disponible{player.character.talentPoints > 1 ? "s" : ""}
                    </span>
                  </motion.a>
                )}
              </div>
            </motion.div>

            {/* ── Ressources ── */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 }}
              className="card-cosmic overflow-hidden"
            >
              <div
                className="flex items-center justify-between px-4 py-2.5"
                style={{ borderBottom: "1px solid rgba(196,150,10,0.15)", background: "rgba(196,150,10,0.05)" }}
              >
                <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: "#e8b84b" }}>Ressources</h3>
                <a href="/atelier" className="flex items-center gap-1 text-xs transition-colors"
                  style={{ color: "#5a5046" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#e8b84b")}
                  onMouseLeave={e => (e.currentTarget.style.color = "#5a5046")}
                >
                  <Hammer className="h-3 w-3" /> Atelier
                </a>
              </div>
              <div className="grid grid-cols-2 gap-px" style={{ background: "rgba(196,150,10,0.08)" }}>
                {RESOURCE_LABELS.map(({ key, label, icon }) => (
                  <div key={key} className="flex flex-col items-center py-3 gap-1"
                    style={{ background: "linear-gradient(145deg, #131022, #0c0a18)" }}>
                    <span className="text-2xl leading-none">{icon}</span>
                    <div className="text-sm font-bold tabular-nums" style={{ color: "#f0e6c8" }}>
                      {player.resources[key].toLocaleString()}
                    </div>
                    <div className="text-[9px] uppercase tracking-wider" style={{ color: "#5a5046" }}>{label}</div>
                  </div>
                ))}
              </div>
              <AnimatePresence>
                {lastDrops && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="px-4 py-2"
                    style={{ borderTop: "1px solid rgba(196,150,10,0.12)" }}
                  >
                    <div className="text-[10px] mb-1 uppercase tracking-wider" style={{ color: "#5a5046" }}>Dernière récompense :</div>
                    <div className="flex flex-wrap gap-2">
                      {RESOURCE_LABELS.filter(({ key }) => lastDrops[key] > 0).map(({ key, icon }) => (
                        <span key={key} className="text-xs font-bold" style={{ color: "#e8b84b" }}>
                          {icon} +{lastDrops[key]}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* ── Streak ── */}
            {player.streakCount > 0 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-center gap-3 px-4 py-3 rounded"
                style={{ background: "linear-gradient(145deg, #1a1020, #0e0b1c)", border: "1px solid rgba(249,115,22,0.25)" }}
              >
                <Flame className="h-5 w-5 shrink-0" style={{ color: "#fb923c" }} />
                <div>
                  <div className="text-sm font-bold" style={{ color: "#f0e6c8" }}>
                    {player.streakCount} jour{player.streakCount > 1 ? "s" : ""} de suite
                  </div>
                  <div className="text-[10px]" style={{ color: "#5a5046" }}>
                    {player.streakCount >= 7 ? "Bonus de rareté actif !" : `Encore ${7 - player.streakCount} jour${7 - player.streakCount > 1 ? "s" : ""} pour le bonus`}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── Anomalies du Jour ── */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="card-cosmic overflow-hidden"
            >
              <div className="px-4 py-2.5 flex items-center gap-2"
                style={{ borderBottom: "1px solid rgba(107,40,200,0.15)", background: "rgba(107,40,200,0.06)" }}>
                <span className="text-sm">🌀</span>
                <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: "#c084fc" }}>Anomalies du Jour</h3>
              </div>
              <div className="p-3 space-y-2">
                {todayAnomalies.map((anomaly, i) => (
                  <div key={anomaly.id} className="rounded p-2.5"
                    style={{
                      background: i === 0 ? "rgba(16,185,129,0.06)" : "rgba(239,68,68,0.06)",
                      border: `1px solid ${i === 0 ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}`,
                    }}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm leading-none">{anomaly.icon}</span>
                      <span className="text-xs font-bold" style={{ color: i === 0 ? "#6ee7b7" : "#fca5a5" }}>
                        {anomaly.label}
                      </span>
                      <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded font-bold uppercase"
                        style={{
                          background: i === 0 ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)",
                          color:      i === 0 ? "#6ee7b7" : "#fca5a5",
                        }}>
                        {i === 0 ? "Bonus" : "Twist"}
                      </span>
                    </div>
                    <p className="text-[10px] leading-relaxed" style={{ color: "#5a5046" }}>{anomaly.description}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* ─── Colonne principale ─── */}
          <div className="flex flex-col gap-4">

            {/* Titre */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center py-2">
              <h1 className="font-display font-black tracking-widest uppercase text-2xl"
                style={{ color: "#f0e6c8", textShadow: "0 0 20px rgba(232,184,75,0.4)" }}>
                Capturez l&apos;Éternité
              </h1>
              <p className="text-xs mt-1 uppercase tracking-[0.2em]" style={{ color: "#5a5046" }}>
                Chaque minute est une relique temporelle unique
              </p>
            </motion.div>

            {/* Indicateurs de capacité active */}
            <AnimatePresence>
              {abilityActive === "CHASSEUR_GUARANTEED_RARE" && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  className="flex items-center gap-2 rounded px-3 py-2"
                  style={{ border: "1px solid rgba(6,182,212,0.5)", background: "rgba(6,182,212,0.08)" }}
                >
                  <span>🎯</span>
                  <div>
                    <div className="text-xs font-bold" style={{ color: "#67e8f9" }}>INSTINCT DE CHASSE ACTIF</div>
                    <div className="text-[10px]" style={{ color: "#5a5046" }}>Prochaine capture garantie RARE ou supérieur</div>
                  </div>
                  <div className="ml-auto w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                </motion.div>
              )}
              {abilityActive === "CHRONOMANCER_REROLL" && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  className="flex items-center gap-2 rounded px-3 py-2"
                  style={{ border: "1px solid rgba(155,93,229,0.5)", background: "rgba(155,93,229,0.08)" }}
                >
                  <span>🔄</span>
                  <div>
                    <div className="text-xs font-bold" style={{ color: "#c084fc" }}>RELANCE TEMPORELLE ACTIVE</div>
                    <div className="text-[10px]" style={{ color: "#5a5046" }}>+30% bonus de rareté sur la prochaine capture</div>
                  </div>
                  <div className="ml-auto w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Mode Risqué */}
            {canRisky && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
                className="cursor-pointer rounded px-4 py-3 transition-all"
                style={{
                  border: riskyMode ? "1px solid rgba(239,68,68,0.5)" : "1px solid rgba(196,150,10,0.2)",
                  background: riskyMode ? "rgba(239,68,68,0.08)" : "rgba(196,150,10,0.04)",
                }}
                onClick={() => setRiskyMode(!riskyMode)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded flex items-center justify-center"
                    style={{ background: riskyMode ? "rgba(239,68,68,0.2)" : "rgba(196,150,10,0.1)" }}>
                    {riskyMode
                      ? <Swords className="h-4 w-4" style={{ color: "#f87171" }} />
                      : <ShieldCheck className="h-4 w-4" style={{ color: "#e8b84b" }} />}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-bold" style={{ color: riskyMode ? "#fca5a5" : "#f0e6c8" }}>
                      {riskyMode ? "Mode Risqué ACTIVÉ" : "Mode Sécurisé"}
                    </div>
                    <div className="text-[10px]" style={{ color: "#5a5046" }}>
                      {riskyMode
                        ? `Mise : ✨${RISKY_CAPTURE.bet.eclatsTemporels} + 🔩${RISKY_CAPTURE.bet.chronite} — ×${RISKY_CAPTURE.successBonus} si succès`
                        : "Cliquer pour activer le mode risqué (Niv. 10+)"}
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded"
                    style={{
                      background: riskyMode ? "rgba(239,68,68,0.2)" : "rgba(196,150,10,0.1)",
                      color: riskyMode ? "#f87171" : "#9b8d7a",
                    }}>
                    {riskyMode ? "30% échec" : "OFF"}
                  </span>
                </div>
              </motion.div>
            )}

            {/* Capacité de classe */}
            {abilityData && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }}>
                <button
                  onClick={handleUseAbility}
                  disabled={usingAbility || abilityData.ability.usesLeft <= 0}
                  className="w-full rounded px-4 py-3 transition-all text-left"
                  style={{
                    border: abilityData.ability.usesLeft > 0 ? "1px solid rgba(155,93,229,0.4)" : "1px solid rgba(58,50,96,0.5)",
                    background: abilityData.ability.usesLeft > 0 ? "rgba(107,40,200,0.1)" : "rgba(17,14,30,0.5)",
                    opacity: abilityData.ability.usesLeft <= 0 ? 0.6 : 1,
                    cursor: abilityData.ability.usesLeft <= 0 ? "not-allowed" : "pointer",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{abilityData.ability.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold truncate" style={{ color: abilityData.ability.usesLeft > 0 ? "#c084fc" : "#9b8d7a" }}>
                        {abilityData.ability.label}
                      </div>
                      <div className="text-[10px]" style={{ color: "#5a5046" }}>
                        {abilityData.ability.usesLeft > 0
                          ? `${abilityData.ability.usesLeft}/${abilityData.ability.usesPerDay} utilisations`
                          : "Épuisée — revient demain"}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {Array.from({ length: abilityData.ability.usesPerDay }).map((_, i) => (
                        <div key={i} className="w-1.5 h-1.5 rounded-full"
                          style={{ background: i < abilityData.ability.usesLeft ? "#c084fc" : "#26213d" }} />
                      ))}
                    </div>
                  </div>
                </button>
                {abilityResult?.visions && (
                  <div className="mt-2 p-3 rounded" style={{ border: "1px solid rgba(244,63,94,0.3)", background: "rgba(244,63,94,0.05)" }}>
                    <p className="text-xs font-bold mb-2" style={{ color: "#fb7185" }}>Vision Prophétique — Minutes Révélées</p>
                    <div className="space-y-1">
                      {abilityResult.visions.map((v) => (
                        <div key={v.minute} className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold" style={{ color: "#f0e6c8" }}>{v.minute}</span>
                          <span className="text-xs truncate" style={{ color: "#9b8d7a" }}>{v.title}{v.year ? ` (${v.year})` : ""}</span>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => setAbilityResult(null)} className="mt-2 text-[10px]" style={{ color: "#5a5046" }}>Fermer</button>
                  </div>
                )}
              </motion.div>
            )}

            {/* CaptureFlow — interface principale */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <CaptureFlow
                windows={windows}
                windowsLoading={windowsLoading}
                windowsExpiresAt={windowsExpiresAt}
                playerLevel={player.character?.level ?? 1}
                playerResources={{
                  eclatsTemporels: player.resources.eclatsTemporels,
                  chronite:        player.resources.chronite,
                  chronoEssence:   0,
                }}
                machineTarget={machineTarget}
                onCaptureDone={handleCaptureFlowDone}
                onRefreshWindows={() => void fetchWindows(true)}
              />
            </motion.div>

          </div>

          {/* ─── Colonne droite : Dernières Reliques ─── */}
          <div className="flex flex-col gap-4">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="card-cosmic overflow-hidden">
              <div className="px-4 py-2.5" style={{ borderBottom: "1px solid rgba(196,150,10,0.15)", background: "rgba(196,150,10,0.05)" }}>
                <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: "#e8b84b" }}>Dernières Reliques</h3>
              </div>
              {player.recentRelics.length > 0 ? (
                <div className="p-3 flex flex-col gap-2">
                  {player.recentRelics.slice(0, 8).map((relic, i) => (
                    <RelicCard key={relic.id} relic={relic} index={i} compact />
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center">
                  <div className="text-3xl mb-2">⏳</div>
                  <p className="text-xs" style={{ color: "#5a5046" }}>Aucune relique capturée</p>
                </div>
              )}
            </motion.div>

            {!player.isPremium && (
              <div className="text-center">
                <a href="/shop" className="inline-flex items-center gap-1.5 text-xs transition-colors"
                  style={{ color: "#9b8d7a" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#e8b84b")}
                  onMouseLeave={e => (e.currentTarget.style.color = "#9b8d7a")}
                >
                  <Zap className="h-3 w-3" /> Passer Premium — captures illimitées
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Death Modal ─── */}
      <AnimatePresence>
        {deathModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="w-full max-w-md bg-slate-900 border border-red-900/50 rounded-2xl p-6 shadow-2xl"
            >
              <div className="text-center mb-6">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-5xl mb-3"
                >
                  💀
                </motion.div>
                <h2 className="text-2xl font-bold text-red-300">Le Temps vous a consumé</h2>
                <p className="text-slate-400 text-sm mt-2">
                  Votre personnage est mort. Mais son héritage demeure.
                  Choisissez le don à transmettre à votre successeur.
                </p>
              </div>
              <div className="space-y-3">
                {deathModal.options.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => void handleChooseHeritage(opt.id)}
                    disabled={choosingHeritage}
                    className="w-full p-4 rounded-xl border border-slate-700/60 bg-slate-800/40 hover:border-violet-500/50 hover:bg-violet-950/20 transition-all text-left disabled:opacity-50"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl mt-0.5">{opt.icon}</span>
                      <div>
                        <p className="font-bold text-slate-100">{opt.label}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{opt.description}</p>
                        <p className="text-xs text-violet-400 mt-1 font-medium">{opt.effect}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function Star(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  )
}
