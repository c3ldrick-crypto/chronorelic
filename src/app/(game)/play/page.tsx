"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { MythicEvent } from "@/components/game/MythicEvent"
import { RelicCard, RelicData } from "@/components/game/RelicCard"
import { XPBar } from "@/components/game/XPBar"
import { useGameStore } from "@/hooks/useGameStore"
import { Flame, Zap, CheckCircle2 } from "lucide-react"
import { getTodayAnomalies, AnomalyDefinition } from "@/lib/game/anomalies"
import type { TimeWindow } from "@/lib/game/windows"
import { CaptureFlow, type CaptureResult } from "@/components/game/CaptureFlow"
import { EnigmaPanel } from "@/components/game/EnigmaPanel"
import type { HeritageBonusDefinition } from "@/lib/game/heritage"
import { levelProgress } from "@/lib/game/xp"
import type { ChallengeDefinition } from "@/lib/game/challenges"

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface Resources {
  eclatsTemporels:     number
  chronite:            number
  essencesHistoriques: number
  fragmentsAnomalie:   number
  chronoEssence:       number
}

interface PlayerData {
  userName?:    string | null
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

interface ChallengeWithProgress extends ChallengeDefinition {
  progress:  number
  completed: boolean
  claimed:   boolean
}

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

const RESOURCE_LABELS = [
  { key: "eclatsTemporels",     label: "Éclats",    icon: "✨", color: "text-amber-300"   },
  { key: "chronite",            label: "Chronite",  icon: "🔩", color: "text-cyan-300"    },
  { key: "essencesHistoriques", label: "Essences",  icon: "📜", color: "text-emerald-300" },
  { key: "fragmentsAnomalie",   label: "Fragments", icon: "🔮", color: "text-pink-300"    },
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
const DIFF_COLORS = {
  easy:   { bg: "rgba(16,185,129,0.06)",  border: "rgba(16,185,129,0.25)",  text: "#6ee7b7", label: "Facile"    },
  medium: { bg: "rgba(234,179,8,0.06)",   border: "rgba(234,179,8,0.25)",   text: "#fde047", label: "Moyen"     },
  hard:   { bg: "rgba(239,68,68,0.06)",   border: "rgba(239,68,68,0.25)",   text: "#fca5a5", label: "Difficile" },
}

// ─────────────────────────────────────────────
// Composant principal
// ─────────────────────────────────────────────

export default function PlayPage() {
  const [player, setPlayer]               = useState<PlayerData | null>(null)
  const [showEvent, setShowEvent]         = useState(false)
  const [lastDrops, setLastDrops]         = useState<Resources | null>(null)
  const [abilityData, setAbilityData]     = useState<AbilityData | null>(null)
  const [usingAbility, setUsingAbility]   = useState(false)
  const [abilityResult, setAbilityResult] = useState<{ visions?: Array<{minute: string; title: string; year?: number}> } | null>(null)
  const [abilityActive, setAbilityActive] = useState<string | null>(null)
  const [challenges, setChallenges]       = useState<ChallengeWithProgress[]>([])
  const [claimingId, setClaimingId]       = useState<string | null>(null)
  const [activeTab, setActiveTab]         = useState<"defis" | "enigmes">("defis")
  const [enigmaRefresh, setEnigmaRefresh] = useState(0)

  const [clock, setClock] = useState(() => {
    const n = new Date()
    return `${String(n.getHours()).padStart(2,"0")}:${String(n.getMinutes()).padStart(2,"0")}:${String(n.getSeconds()).padStart(2,"0")}`
  })
  const [windows, setWindows]                   = useState<TimeWindow[]>([])
  const [windowsLoading, setWindowsLoading]     = useState(false)
  const [windowsExpiresAt, setWindowsExpiresAt] = useState<number | null>(null)
  const [machineTarget, setMachineTarget]       = useState<{ minute: string; eraLabel: string; eraIcon: string } | null>(null)
  const [deathModal, setDeathModal]             = useState<{ options: HeritageBonusDefinition[]; charClass: string } | null>(null)
  const [choosingHeritage, setChoosingHeritage] = useState(false)
  const [liveEvent, setLiveEvent]               = useState<{ title: string; year: number; category: string; description: string } | null>(null)
  const prevMinuteRef = useRef<string>("")

  const todayAnomalies: [AnomalyDefinition, AnomalyDefinition] = getTodayAnomalies()
  const { comboCount, pendingResult, setPendingResult, incrementCapture } = useGameStore()
  void comboCount

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
    } catch { /* silent */ }
    finally  { setWindowsLoading(false) }
  }, [])

  const fetchChallenges = useCallback(async () => {
    try {
      const res  = await fetch("/api/game/challenges")
      const data = await res.json()
      if (res.ok) setChallenges(data.challenges ?? [])
    } catch { /* silent */ }
  }, [])

  useEffect(() => {
    fetch("/api/game/player")
      .then(async r => { const d = await r.json(); if (!r.ok) throw new Error(d.error); return d })
      .then(setPlayer)
      .catch((e: unknown) => toast.error(`Impossible de charger le profil: ${e instanceof Error ? e.message : "Erreur"}`))

    fetch("/api/game/ability")
      .then(async r => { if (r.ok) setAbilityData(await r.json()) })
      .catch(() => {})

    void fetchWindows()
    void fetchChallenges()

    try {
      const stored = sessionStorage.getItem("machineTarget")
      if (stored) {
        setMachineTarget(JSON.parse(stored) as { minute: string; eraLabel: string; eraIcon: string })
        sessionStorage.removeItem("machineTarget")
      }
    } catch { /* ignore */ }
  }, [fetchWindows, fetchChallenges])

  // Horloge + détection événement historique
  useEffect(() => {
    const checkLiveEvent = (minute: string) => {
      fetch(`/api/game/live-event?minute=${minute}`)
        .then(r => r.ok ? r.json() : null)
        .then(data => { if (data) setLiveEvent(data.event ?? null) })
        .catch(() => {})
    }
    const id = setInterval(() => {
      const n = new Date()
      const minute  = `${String(n.getHours()).padStart(2,"0")}:${String(n.getMinutes()).padStart(2,"0")}`
      const timeStr = `${minute}:${String(n.getSeconds()).padStart(2,"0")}`
      setClock(timeStr)
      if (minute !== prevMinuteRef.current) {
        prevMinuteRef.current = minute
        checkLiveEvent(minute)
      }
    }, 1000)
    const n = new Date()
    const initMinute = `${String(n.getHours()).padStart(2,"0")}:${String(n.getMinutes()).padStart(2,"0")}`
    prevMinuteRef.current = initMinute
    checkLiveEvent(initMinute)
    return () => clearInterval(id)
  }, [])

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const handleClaimChallenge = useCallback(async (challengeId: string) => {
    if (claimingId) return
    setClaimingId(challengeId)
    try {
      const res  = await fetch("/api/game/challenges", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ challengeId }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success("Récompense réclamée !")
        setChallenges(prev => prev.map(c => c.id === challengeId ? { ...c, claimed: true } : c))
        fetch("/api/game/player").then(async r => { if (r.ok) setPlayer(await r.json()) }).catch(() => {})
      } else {
        toast.error(data.error ?? "Erreur")
      }
    } catch { toast.error("Erreur réseau") }
    setClaimingId(null)
  }, [claimingId])

  const handleUseAbility = useCallback(async () => {
    if (!abilityData || usingAbility) return
    setUsingAbility(true)
    try {
      const res  = await fetch("/api/game/ability", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body:   JSON.stringify({ action: abilityData.ability.effect }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success(data.message ?? "Capacité utilisée !")
        setAbilityData(prev => prev ? { ability: { ...prev.ability, usesLeft: data.usesLeft ?? prev.ability.usesLeft - 1 } } : prev)
        if (data.effect === "CHASSEUR_GUARANTEED_RARE") setAbilityActive("CHASSEUR_GUARANTEED_RARE")
        if (data.effect === "CHRONOMANCER_REROLL")      setAbilityActive("CHRONOMANCER_REROLL")
        if (data.visions)     setAbilityResult({ visions: data.visions })
        if (data.totalRewards) {
          const r = data.totalRewards
          toast.info(`Analyse : ✨${r.eclatsTemporels} 🔩${r.chronite} 📜${r.essencesHistoriques}`)
        }
        void fetchChallenges()
      } else { toast.error(data.error ?? "Erreur") }
    } catch { toast.error("Erreur réseau") }
    setUsingAbility(false)
  }, [abilityData, usingAbility, fetchChallenges])

  const handleCaptureFlowDone = useCallback((result: CaptureResult) => {
    if (result.deathPending && result.heritageOptions) {
      setDeathModal({ options: result.heritageOptions as HeritageBonusDefinition[], charClass: player?.character?.class ?? "CHRONOMANCER" })
      return
    }
    if (!result.success) {
      const msg = result.consolation?.larmeTemporelle
        ? "Échec — mais une Larme Temporelle a été récupérée..."
        : result.message ?? "Capture échouée."
      toast(msg, { duration: 4000 })
      return
    }

    incrementCapture()
    const dropsObj = result.drops as Record<string, number> | undefined
    if (dropsObj) setLastDrops({
      eclatsTemporels:     dropsObj.eclatsTemporels     ?? 0,
      chronite:            dropsObj.chronite            ?? 0,
      essencesHistoriques: dropsObj.essencesHistoriques ?? 0,
      fragmentsAnomalie:   dropsObj.fragmentsAnomalie   ?? 0,
    })
    setMachineTarget(null)
    setAbilityActive(null)
    void fetchWindows(true)
    void fetchChallenges()

    if (result.completedEnigmas && result.completedEnigmas.length > 0) {
      setEnigmaRefresh(n => n + 1)
      result.completedEnigmas.forEach(e => {
        toast(`🗺️ Énigme résolue : ${e.title}`, { description: e.reward.label, duration: 8000 })
      })
    }

    const rarity = result.rarity
    if (rarity === "LEGENDAIRE" || rarity === "MYTHIQUE") {
      setPendingResult({
        rarity:     rarity as import("@/types").Rarity,
        minute:     result.minute ?? "",
        xpGained:   result.xpGained ?? 0,
        relicId:    result.relicId ?? "",
        narration:  result.narration,
        eventTitle: result.eventTitle,
        eventYear:  result.eventYear,
      })
      setShowEvent(true)
    }

    setPlayer(prev => {
      if (!prev) return prev
      return {
        ...prev,
        capturesLeft: prev.capturesLeft !== null ? Math.max(0, prev.capturesLeft - 1) : null,
        recentRelics: result.relicId
          ? [{ id: result.relicId, minute: result.minute ?? "", rarity: (result.rarity ?? "COMMUNE") as import("@/types").Rarity, capturedAt: new Date().toISOString(), xpGained: result.xpGained ?? 0, isFused: false, historicalEvent: result.eventTitle ? { title: result.eventTitle, year: result.eventYear ?? 0 } : null } as RelicData, ...prev.recentRelics.slice(0, 7)]
          : prev.recentRelics,
        character: result.didLevelUp
          ? prev.character ? { ...prev.character, xpTotal: prev.character.xpTotal + (result.xpGained ?? 0), level: result.newLevel ?? prev.character.level } : null
          : prev.character ? { ...prev.character, xpTotal: prev.character.xpTotal + (result.xpGained ?? 0) } : null,
        resources: result.drops ? {
          eclatsTemporels:     prev.resources.eclatsTemporels     + ((result.drops as Record<string, number>).eclatsTemporels ?? 0),
          chronite:            prev.resources.chronite            + ((result.drops as Record<string, number>).chronite ?? 0),
          essencesHistoriques: prev.resources.essencesHistoriques + ((result.drops as Record<string, number>).essencesHistoriques ?? 0),
          fragmentsAnomalie:   prev.resources.fragmentsAnomalie   + ((result.drops as Record<string, number>).fragmentsAnomalie ?? 0),
        } : prev.resources,
      }
    })

    if (rarity === "MYTHIQUE")        toast("🔮 ANOMALIE TEMPORELLE !", { description: "Une relique mythique !", duration: 8000 })
    else if (rarity === "LEGENDAIRE") toast("🟡 Relique Légendaire !", { description: `+${result.xpGained} XP`, duration: 5000 })
    else if (rarity === "EPIQUE")     toast("🟣 Relique Épique !", { description: `+${result.xpGained} XP` })
  }, [player, incrementCapture, setPendingResult, fetchWindows, fetchChallenges])

  const handleChooseHeritage = useCallback(async (bonusId: string) => {
    if (choosingHeritage) return
    setChoosingHeritage(true)
    try {
      const res  = await fetch("/api/game/heritage", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body:   JSON.stringify({ action: "choose", bonusId }),
      })
      const data = await res.json() as { message?: string; error?: string }
      if (!res.ok) { toast.error(data.error ?? "Erreur"); return }
      toast.success(data.message ?? "Héritage choisi !")
      setDeathModal(null)
      window.location.reload()
    } catch { toast.error("Erreur réseau") }
    finally  { setChoosingHeritage(false) }
  }, [choosingHeritage])

  const handleCloseEvent = useCallback(() => {
    setShowEvent(false)
    setPendingResult(null)
    setLastDrops(null)
  }, [setPendingResult])

  // ─── États de chargement ───────────────────────────────────────────────────

  if (!player) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="text-4xl">⏳</motion.div>
      </div>
    )
  }

  if (!player.character) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="card-cosmic p-8 text-center max-w-md">
          <div className="text-5xl mb-4">🧙</div>
          <h2 className="font-display text-2xl font-bold text-[#e2e8f0] mb-3">Créez votre Personnage</h2>
          <p className="text-[#94a3b8] mb-6">Avant de capturer le temps, choisissez votre classe de Gardien.</p>
          <a href="/character" className="btn-primary px-6 py-3 rounded-xl inline-block font-semibold">Créer mon Personnage</a>
        </div>
      </div>
    )
  }

  const xpInfo = levelProgress(player.character.xpTotal)
  const char    = player.character

  // ─── Rendu ────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Overlay LÉGENDAIRE / MYTHIQUE */}
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

      {/* Particules hautes raretés */}
      <AnimatePresence>
        {showEvent && pendingResult && (pendingResult.rarity === "MYTHIQUE" || pendingResult.rarity === "LEGENDAIRE") && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 pointer-events-none z-10">
            {Array.from({ length: pendingResult.rarity === "MYTHIQUE" ? 20 : 12 }).map((_, i) => (
              <motion.div key={i}
                className={`absolute w-2 h-2 rounded-full ${pendingResult.rarity === "MYTHIQUE" ? "bg-pink-400" : "bg-amber-400"}`}
                style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
                animate={{ y: [0, -150 - Math.random() * 100], opacity: [1, 0], scale: [1, 0] }}
                transition={{ duration: 1.5 + Math.random() * 1.5, delay: Math.random() * 0.5, ease: "easeOut" }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-3xl mx-auto px-4 py-4 space-y-3">

        {/* ═══ HUD IDENTITÉ ══════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 px-4 py-2.5 rounded-2xl"
          style={{ background: "rgba(107,40,200,0.06)", border: "1px solid rgba(107,40,200,0.18)" }}
        >
          <span className="text-2xl shrink-0">{CLASS_ICONS[char.class] ?? "🧙"}</span>

          <div className="shrink-0">
            <div className="font-bold text-sm leading-tight" style={{ color: "#f0e6c8" }}>
              {player.userName ?? char.name}
            </div>
            <div className="text-[11px]" style={{ color: "#c084fc" }}>
              {CLASS_LABELS[char.class] ?? char.class} · Niv.{char.level}
            </div>
          </div>

          <div className="flex-1 min-w-0 hidden sm:block">
            <XPBar xpTotal={char.xpTotal} />
            <div className="flex justify-between mt-0.5">
              <span className="text-[10px]" style={{ color: "#3a3254" }}>
                {xpInfo.current.toLocaleString()} / {xpInfo.needed.toLocaleString()} XP
              </span>
              <span className="text-[10px]" style={{ color: "#3a3254" }}>{Math.round(xpInfo.progress)}%</span>
            </div>
          </div>

          {/* Horloge */}
          <div className="shrink-0 font-mono font-black tabular-nums text-xl"
            style={{ color: "#e8b84b", textShadow: "0 0 16px rgba(232,184,75,0.5)" }}>
            {clock.substring(0, 5)}
          </div>

          {player.isPremium && (
            <div className="shrink-0 flex items-center gap-1 rounded px-2 py-0.5"
              style={{ background: "rgba(196,150,10,0.15)", border: "1px solid rgba(196,150,10,0.4)" }}>
              <Zap className="h-3 w-3" style={{ color: "#e8b84b" }} />
              <span className="text-xs font-bold" style={{ color: "#f5d678" }}>PRO</span>
            </div>
          )}

          {char.talentPoints > 0 && (
            <a href="/talents" className="shrink-0 flex items-center gap-1 rounded px-2 py-0.5"
              style={{ background: "rgba(234,179,8,0.1)", border: "1px solid rgba(234,179,8,0.4)", color: "#fde047" }}>
              <span className="text-xs">⭐</span>
              <span className="text-xs font-bold">{char.talentPoints}</span>
            </a>
          )}
        </motion.div>

        {/* ═══ BARRE DE CONTEXTE : tout ce dont le joueur a besoin en un coup d'œil ═══ */}
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-xl px-4 py-2.5 flex flex-wrap items-center gap-x-5 gap-y-2"
          style={{ background: "rgba(17,14,30,0.6)", border: "1px solid rgba(107,40,200,0.15)" }}
        >
          {/* Captures restantes */}
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" style={{ color: player.capturesLeft === 0 ? "#f87171" : "#6ee7b7" }} />
            <span className="text-xs font-bold tabular-nums" style={{ color: player.capturesLeft === 0 ? "#f87171" : "#f0e6c8" }}>
              {player.capturesLeft !== null
                ? `${player.capturesLeft} capture${player.capturesLeft !== 1 ? "s" : ""}`
                : <span style={{ color: "#c084fc" }}>∞</span>
              }
            </span>
          </div>

          {/* Streak */}
          {player.streakCount > 0 && (
            <div className="flex items-center gap-1">
              <Flame className="h-3.5 w-3.5 shrink-0" style={{ color: "#fb923c" }} />
              <span className="text-xs font-bold" style={{ color: player.streakCount >= 7 ? "#fb923c" : "#9b8d7a" }}>
                {player.streakCount}j{player.streakCount >= 7 ? " 🔥" : ""}
              </span>
            </div>
          )}

          {/* Anomalies */}
          <div className="flex gap-1.5">
            {todayAnomalies.map((a, i) => (
              <span key={a.id} title={a.description}
                className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full cursor-default"
                style={{
                  background: i === 0 ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
                  border: `1px solid ${i === 0 ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`,
                  color: i === 0 ? "#6ee7b7" : "#fca5a5",
                }}>
                {a.icon} <span className="hidden sm:inline">{a.label}</span>
              </span>
            ))}
          </div>

          {/* Ressources */}
          <div className="flex gap-3 ml-auto">
            {RESOURCE_LABELS.map(({ key, icon, color }) => (
              <span key={key} className="flex items-center gap-1">
                <span className="text-sm leading-none">{icon}</span>
                <span className={`text-xs font-bold tabular-nums ${color}`}>
                  {player.resources[key].toLocaleString()}
                </span>
              </span>
            ))}
          </div>

          {/* Gain dernier drop */}
          <AnimatePresence>
            {lastDrops && RESOURCE_LABELS.some(({ key }) => lastDrops[key] > 0) && (
              <motion.div initial={{ opacity: 0, x: 6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 6 }}
                className="flex gap-2">
                {RESOURCE_LABELS.filter(({ key }) => lastDrops[key] > 0).map(({ key, icon }) => (
                  <span key={key} className="text-xs font-bold" style={{ color: "#e8b84b" }}>+{lastDrops[key]}{icon}</span>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ═══ ALERTE ÉVÉNEMENT EN DIRECT ════════════════════════════════════ */}
        <AnimatePresence>
          {liveEvent && (
            <motion.div
              key="live-event"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="rounded-xl overflow-hidden"
              style={{
                background: "linear-gradient(135deg, rgba(196,150,10,0.10) 0%, rgba(107,40,200,0.08) 100%)",
                border: "1px solid rgba(196,150,10,0.4)",
              }}
            >
              <div className="flex items-center gap-3 px-4 py-2.5">
                <motion.div className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0"
                  animate={{ scale: [1, 1.5, 1], opacity: [1, 0.4, 1] }} transition={{ duration: 1.4, repeat: Infinity }} />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#e8b84b" }}>⚡ En Direct · </span>
                  <span className="text-sm font-bold" style={{ color: "#f0e6c8" }}>{liveEvent.title}</span>
                  <span className="text-[11px] ml-2" style={{ color: "#5a5046" }}>
                    {liveEvent.year > 0 ? liveEvent.year : `${Math.abs(liveEvent.year)} av. J.-C.`}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ═══ INDICATEURS CAPACITÉ ACTIVE ═══════════════════════════════════ */}
        <AnimatePresence>
          {abilityActive === "CHASSEUR_GUARANTEED_RARE" && (
            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
              className="flex items-center gap-2 rounded-xl px-3 py-2"
              style={{ border: "1px solid rgba(6,182,212,0.5)", background: "rgba(6,182,212,0.08)" }}>
              <span>🎯</span>
              <span className="text-xs font-bold" style={{ color: "#67e8f9" }}>Instinct de Chasse actif</span>
              <span className="text-[10px] ml-1" style={{ color: "#5a5046" }}>— prochaine capture RARE minimum</span>
              <div className="ml-auto w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            </motion.div>
          )}
          {abilityActive === "CHRONOMANCER_REROLL" && (
            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
              className="flex items-center gap-2 rounded-xl px-3 py-2"
              style={{ border: "1px solid rgba(155,93,229,0.5)", background: "rgba(155,93,229,0.08)" }}>
              <span>🔄</span>
              <span className="text-xs font-bold" style={{ color: "#c084fc" }}>Relance Temporelle active</span>
              <span className="text-[10px] ml-1" style={{ color: "#5a5046" }}>— +30% rareté</span>
              <div className="ml-auto w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ═══ CAPTURE — élément central ══════════════════════════════════════ */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <CaptureFlow
            windows={windows}
            windowsLoading={windowsLoading}
            windowsExpiresAt={windowsExpiresAt}
            playerLevel={char.level ?? 1}
            playerResources={{ eclatsTemporels: player.resources.eclatsTemporels, chronite: player.resources.chronite, chronoEssence: player.resources.chronoEssence ?? 0 }}
            machineTarget={machineTarget}
            onCaptureDone={handleCaptureFlowDone}
            onRefreshWindows={() => void fetchWindows(true)}
          />
        </motion.div>

        {/* ═══ CAPACITÉ DE CLASSE ══════════════════════════════════════════════ */}
        {abilityData && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <button onClick={handleUseAbility} disabled={usingAbility || abilityData.ability.usesLeft <= 0}
              className="w-full rounded-xl px-4 py-3 transition-all text-left"
              style={{
                border:     abilityData.ability.usesLeft > 0 ? "1px solid rgba(155,93,229,0.4)" : "1px solid rgba(58,50,96,0.25)",
                background: abilityData.ability.usesLeft > 0 ? "rgba(107,40,200,0.08)" : "rgba(17,14,30,0.4)",
                opacity:    abilityData.ability.usesLeft <= 0 ? 0.6 : 1,
              }}>
              <div className="flex items-center gap-3">
                <span className="text-xl">{abilityData.ability.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold" style={{ color: abilityData.ability.usesLeft > 0 ? "#c084fc" : "#5a5046" }}>
                    {abilityData.ability.label}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: "#5a5046" }}>
                    {abilityData.ability.usesLeft > 0
                      ? abilityData.ability.description
                      : "Épuisée — recharge à minuit"}
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  {Array.from({ length: abilityData.ability.usesPerDay }).map((_, i) => (
                    <div key={i} className="w-2 h-2 rounded-full"
                      style={{ background: i < abilityData.ability.usesLeft ? "#c084fc" : "#26213d" }} />
                  ))}
                </div>
              </div>
            </button>
            {abilityResult?.visions && (
              <div className="mt-2 p-3 rounded-xl" style={{ border: "1px solid rgba(244,63,94,0.3)", background: "rgba(244,63,94,0.05)" }}>
                <p className="text-xs font-bold mb-2" style={{ color: "#fb7185" }}>Vision — Minutes révélées</p>
                <div className="space-y-1.5">
                  {abilityResult.visions.map(v => (
                    <div key={v.minute} className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold" style={{ color: "#f0e6c8" }}>{v.minute}</span>
                      <span className="text-[11px] truncate" style={{ color: "#9b8d7a" }}>{v.title}{v.year ? ` (${v.year})` : ""}</span>
                    </div>
                  ))}
                </div>
                <button onClick={() => setAbilityResult(null)} className="mt-2 text-[10px]" style={{ color: "#5a5046" }}>Fermer</button>
              </div>
            )}
          </motion.div>
        )}

        {/* ═══ DERNIÈRES RELIQUES ══════════════════════════════════════════════ */}
        {player.recentRelics.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "#9b8d7a" }}>Dernières reliques</span>
              <a href="/collection" className="text-[10px]" style={{ color: "#5a5046" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#e8b84b")}
                onMouseLeave={e => (e.currentTarget.style.color = "#5a5046")}>
                Voir tout →
              </a>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {player.recentRelics.slice(0, 5).map((relic, i) => (
                <div key={relic.id} className="shrink-0" style={{ width: 160 }}>
                  <RelicCard relic={relic} index={i} compact />
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ═══ NAVIGATION RAPIDE ══════════════════════════════════════════════ */}
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="flex flex-wrap gap-2">
          {[
            { href: "/sanctuaire", icon: "🏛️", label: "Sanctuaire" },
            { href: "/collection", icon: "📦", label: "Collection" },
            { href: "/atelier",    icon: "🔬", label: "Atelier"    },
            { href: "/atlas",      icon: "🗺️", label: "Atlas"      },
          ].map(({ href, icon, label }) => (
            <a key={href} href={href}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{ background: "rgba(107,40,200,0.05)", border: "1px solid rgba(107,40,200,0.15)", color: "#6b5a8e" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(107,40,200,0.12)"; e.currentTarget.style.color = "#c084fc" }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(107,40,200,0.05)"; e.currentTarget.style.color = "#6b5a8e" }}>
              {icon} {label}
            </a>
          ))}
          {!player.isPremium && (
            <a href="/shop"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ml-auto transition-all"
              style={{ background: "rgba(196,150,10,0.05)", border: "1px solid rgba(196,150,10,0.2)", color: "#9b8d7a" }}
              onMouseEnter={e => { e.currentTarget.style.color = "#e8b84b" }}
              onMouseLeave={e => { e.currentTarget.style.color = "#9b8d7a" }}>
              <Zap className="h-3 w-3" /> Premium
            </a>
          )}
        </motion.div>

        {/* ═══ DÉFIS & JEUX DE PISTE (section secondaire) ═══════════════════ */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="rounded-2xl overflow-hidden"
          style={{ background: "rgba(107,40,200,0.03)", border: "1px solid rgba(107,40,200,0.12)" }}>

          {/* Tabs */}
          <div className="flex items-center gap-1 px-4 py-3" style={{ borderBottom: "1px solid rgba(107,40,200,0.1)" }}>
            <button
              onClick={() => setActiveTab("defis")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
              style={{
                background: activeTab === "defis" ? "rgba(192,132,252,0.12)" : "transparent",
                border:     activeTab === "defis" ? "1px solid rgba(192,132,252,0.35)" : "1px solid transparent",
                color:      activeTab === "defis" ? "#c084fc" : "#3a3254",
              }}>
              🎯 Défis du Jour
            </button>
            <button
              onClick={() => setActiveTab("enigmes")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
              style={{
                background: activeTab === "enigmes" ? "rgba(196,150,10,0.10)" : "transparent",
                border:     activeTab === "enigmes" ? "1px solid rgba(196,150,10,0.35)" : "1px solid transparent",
                color:      activeTab === "enigmes" ? "#e8b84b" : "#3a3254",
              }}>
              🗺️ Jeux de Piste
            </button>
            {activeTab === "defis" && (
              <span className="text-[10px] ml-auto" style={{ color: "#3a3254" }}>Se renouvellent à minuit</span>
            )}
          </div>

          <div className="p-4">
            <AnimatePresence mode="wait">

              {/* Défis */}
              {activeTab === "defis" && (
                <motion.div key="defis" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {challenges.length === 0
                      ? [0,1,2].map(i => (
                          <div key={i} className="h-20 rounded-xl animate-pulse"
                            style={{ background: "rgba(107,40,200,0.06)", border: "1px solid rgba(107,40,200,0.1)" }} />
                        ))
                      : challenges.map(c => {
                          const dc  = DIFF_COLORS[c.difficulty]
                          const pct = Math.min((c.progress / c.target) * 100, 100)
                          return (
                            <div key={c.id} className="rounded-xl px-3 py-2.5 flex flex-col gap-2"
                              style={{ background: c.claimed ? "rgba(16,185,129,0.04)" : dc.bg, border: `1px solid ${c.claimed ? "rgba(16,185,129,0.2)" : dc.border}` }}>
                              <div className="flex items-start gap-2">
                                <span className="text-lg leading-none mt-0.5 shrink-0">{c.icon}</span>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-xs font-bold truncate" style={{ color: c.claimed ? "#6ee7b7" : dc.text }}>{c.label}</span>
                                    <span className="text-[9px] px-1 py-0.5 rounded font-bold uppercase shrink-0"
                                      style={{ background: dc.bg, border: `1px solid ${dc.border}`, color: dc.text }}>
                                      {dc.label}
                                    </span>
                                  </div>
                                  <p className="text-[10px] leading-relaxed mt-0.5" style={{ color: "#5a5046" }}>{c.description}</p>
                                </div>
                              </div>
                              <div className="space-y-1">
                                <div className="flex justify-between">
                                  <span className="text-[10px]" style={{ color: "#5a5046" }}>{c.progress}/{c.target}</span>
                                  <span className="text-[10px] font-medium" style={{ color: "#e8b84b" }}>{c.rewardLabel}</span>
                                </div>
                                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                                  <motion.div className="h-full rounded-full"
                                    style={{ background: c.claimed ? "#6ee7b7" : pct >= 100 ? "#e8b84b" : dc.text, width: `${pct}%` }}
                                    initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.5 }}
                                  />
                                </div>
                              </div>
                              {c.completed && !c.claimed && (
                                <button
                                  onClick={() => void handleClaimChallenge(c.id)}
                                  disabled={!!claimingId}
                                  className="w-full py-1 rounded text-[11px] font-bold transition-all"
                                  style={{ background: "rgba(234,179,8,0.15)", border: "1px solid rgba(234,179,8,0.4)", color: "#fde047" }}>
                                  {claimingId === c.id ? "..." : "Réclamer →"}
                                </button>
                              )}
                              {c.claimed && (
                                <div className="flex items-center gap-1 justify-center">
                                  <CheckCircle2 className="h-3.5 w-3.5" style={{ color: "#6ee7b7" }} />
                                  <span className="text-[11px] font-bold" style={{ color: "#6ee7b7" }}>Réclamé</span>
                                </div>
                              )}
                              {!c.completed && !c.claimed && (
                                <p className="text-[10px] text-center" style={{ color: "#3a3254" }}>{c.hint}</p>
                              )}
                            </div>
                          )
                        })}
                  </div>
                </motion.div>
              )}

              {/* Énigmes */}
              {activeTab === "enigmes" && (
                <motion.div key="enigmes" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                  <div className="flex items-start gap-3 mb-4 p-3 rounded-xl"
                    style={{ background: "rgba(107,40,200,0.06)", border: "1px solid rgba(107,40,200,0.15)" }}>
                    <span className="text-xl shrink-0">🗺️</span>
                    <p className="text-[11px] leading-relaxed" style={{ color: "#5a5046" }}>
                      Chaque énigme cache une minute précise liée à l&apos;Histoire. Déchiffrez les indices, trouvez la minute, capturez-la. La Machine Temporelle du Sanctuaire peut vous aider à cibler n&apos;importe quelle minute.
                    </p>
                  </div>
                  <EnigmaPanel refreshTrigger={enigmaRefresh} />
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </motion.div>

      </div>

      {/* ═══ MODAL MORT ══════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {deathModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
              className="w-full max-w-md bg-slate-900 border border-red-900/50 rounded-2xl p-6 shadow-2xl">
              <div className="text-center mb-6">
                <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }} className="text-5xl mb-3">💀</motion.div>
                <h2 className="text-2xl font-bold text-red-300">Le Temps vous a consumé</h2>
                <p className="text-slate-400 text-sm mt-2">Votre personnage est mort. Mais son héritage demeure. Choisissez le don à transmettre.</p>
              </div>
              <div className="space-y-3">
                {deathModal.options.map(opt => (
                  <button key={opt.id} onClick={() => void handleChooseHeritage(opt.id)} disabled={choosingHeritage}
                    className="w-full p-4 rounded-xl border border-slate-700/60 bg-slate-800/40 hover:border-violet-500/50 hover:bg-violet-950/20 transition-all text-left disabled:opacity-50">
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
