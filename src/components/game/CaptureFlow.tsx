"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { Eye, Coins, Swords, Skull, Zap, Clock, RefreshCw, ChevronLeft, Sparkles, Atom } from "lucide-react"
import { STAKE_TIERS, type StakeTier } from "@/lib/game/essences"
import type { TimeWindow } from "@/lib/game/windows"

type CaptureIntent = "RELIQUE" | "ESSENCE" | "HYBRIDE"
type CapturePhase  = "idle" | "scan" | "ancrage" | "extraction" | "resultat"

export interface CaptureResult {
  success:       boolean
  relicId?:      string
  minute?:       string
  rarity?:       string
  xpGained?:     number
  drops?:        Record<string, number>
  essenceDrops?: Record<string, number>
  narration?:    string
  eventTitle?:   string
  eventYear?:    number
  didLevelUp?:   boolean
  newLevel?:     number
  captureIntent: CaptureIntent
  stakeTier:     StakeTier
  lostCost?:     Record<string, number>
  deathPending?: boolean
  heritageOptions?: unknown[]
  message?:      string
  consolation?:  Record<string, number>
}

interface CaptureFlowProps {
  windows:         TimeWindow[]
  windowsLoading:  boolean
  playerLevel:     number
  playerResources: { eclatsTemporels: number; chronite: number; chronoEssence: number }
  machineTarget?:  { minute: string; eraLabel: string; eraIcon: string } | null
  onCaptureDone:   (result: CaptureResult) => void
  onRefreshWindows: () => void
  windowsExpiresAt?: number | null
}

const RARITY_COLORS: Record<string, string> = {
  COMMUNE:    "from-slate-500 to-slate-600",
  RARE:       "from-blue-500 to-blue-700",
  EPIQUE:     "from-purple-500 to-purple-700",
  LEGENDAIRE: "from-amber-400 to-orange-600",
  MYTHIQUE:   "from-pink-400 via-red-500 to-orange-500",
}

const RARITY_GLOW: Record<string, string> = {
  COMMUNE:    "shadow-slate-500/30",
  RARE:       "shadow-blue-500/50",
  EPIQUE:     "shadow-purple-500/60",
  LEGENDAIRE: "shadow-amber-400/70",
  MYTHIQUE:   "shadow-pink-500/80",
}

const STAKE_ICONS: Record<StakeTier, typeof Eye> = {
  OBSERVATION:    Eye,
  INVESTISSEMENT: Coins,
  ENGAGEMENT:     Swords,
  RITUEL:         Skull,
}

const INTENT_CONFIG: Record<CaptureIntent, { label: string; icon: string; description: string; color: string }> = {
  RELIQUE: {
    label:       "Mode Relique",
    icon:        "🗿",
    description: "Extraire l'objet matériel de cette minute — Relique + Ressources",
    color:       "border-amber-500/50 bg-amber-950/30",
  },
  ESSENCE: {
    label:       "Mode Essence",
    icon:        "⧗",
    description: "Distiller l'énergie pure — Essences multiples + Connaissance",
    color:       "border-violet-500/50 bg-violet-950/30",
  },
  HYBRIDE: {
    label:       "Mode Hybride",
    icon:        "⚗",
    description: "Relique ET Essences — chaque gain réduit de 30%",
    color:       "border-cyan-500/50 bg-cyan-950/30",
  },
}

// ── Scan phase animation ──────────────────────────────────────────────────────
function ScanAnimation({ successChance }: { successChance: number }) {
  const [displayedChance, setDisplayedChance] = useState(0)
  useEffect(() => {
    let val = 0
    const interval = setInterval(() => {
      val += 3
      if (val >= successChance) { val = successChance; clearInterval(interval) }
      setDisplayedChance(val)
    }, 30)
    return () => clearInterval(interval)
  }, [successChance])

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative w-32 h-32">
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-full border border-violet-500/40"
            animate={{ scale: [1, 1.5 + i * 0.3, 1], opacity: [0.8, 0, 0.8] }}
            transition={{ duration: 2, delay: i * 0.5, repeat: Infinity }}
          />
        ))}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-2 border-t-violet-400 border-r-cyan-400 border-b-transparent border-l-transparent rounded-full"
          />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-violet-300 font-mono text-sm font-bold">{displayedChance}%</span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-slate-300 text-sm">Analyse de la fréquence temporelle...</p>
        <p className="text-violet-400 text-xs mt-1 font-mono">Probabilité de succès: {successChance}%</p>
      </div>
    </div>
  )
}

// ── Ancrage phase animation ───────────────────────────────────────────────────
function AnchorAnimation() {
  const [progress, setProgress] = useState(0)
  const [glitch, setGlitch]     = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => {
        const next = p + Math.random() * 8
        if (Math.random() < 0.15) {
          setGlitch(true)
          setTimeout(() => setGlitch(false), 200)
          return Math.max(0, next - Math.random() * 15)
        }
        return Math.min(95, next)
      })
    }, 80)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-sm">
      <motion.div
        animate={glitch ? { x: [-4, 4, -2, 2, 0], skewX: [-3, 3, 0] } : {}}
        className="text-3xl"
      >
        ⧗
      </motion.div>
      <div className="w-full">
        <div className="flex justify-between text-xs text-slate-400 mb-2">
          <span className="font-mono">ANCRAGE TEMPOREL</span>
          <span className="font-mono text-cyan-400">{Math.floor(progress)}%</span>
        </div>
        <div className="h-3 bg-slate-800 rounded-full border border-slate-700 overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${glitch ? "bg-red-500" : "bg-gradient-to-r from-violet-500 to-cyan-400"}`}
            style={{ width: `${progress}%` }}
            animate={glitch ? { opacity: [1, 0, 1] } : {}}
          />
        </div>
        {glitch && (
          <p className="text-red-400 text-xs font-mono mt-1 animate-pulse">⚠ INTERFÉRENCE DÉTECTÉE</p>
        )}
      </div>
      <div className="grid grid-cols-3 gap-2 text-center w-full">
        {["FLUX", "SYNC", "LOCK"].map((label, i) => (
          <div key={label} className="bg-slate-800/50 rounded p-2 border border-slate-700">
            <div className={`text-xs font-mono ${progress > (i + 1) * 25 ? "text-green-400" : "text-slate-500"}`}>
              {progress > (i + 1) * 25 ? "✓" : "…"}
            </div>
            <div className="text-xs text-slate-400">{label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Extraction phase animation ────────────────────────────────────────────────
function ExtractionAnimation({ success, rarity }: { success: boolean; rarity?: string }) {
  const gradClass = rarity ? RARITY_COLORS[rarity] ?? RARITY_COLORS["COMMUNE"] : "from-violet-500 to-cyan-400"

  return (
    <div className="flex flex-col items-center gap-6">
      {success ? (
        <>
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.3, 1], opacity: 1 }}
            transition={{ duration: 0.6, times: [0, 0.5, 1] }}
            className={`w-24 h-24 rounded-full bg-gradient-to-br ${gradClass} flex items-center justify-center shadow-2xl`}
          >
            <span className="text-4xl">✦</span>
          </motion.div>
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className={`absolute w-2 h-2 rounded-full bg-gradient-to-r ${gradClass}`}
              initial={{ x: 0, y: 0, opacity: 1 }}
              animate={{
                x: Math.cos((i / 8) * Math.PI * 2) * 80,
                y: Math.sin((i / 8) * Math.PI * 2) * 80,
                opacity: 0,
              }}
              transition={{ duration: 0.8, delay: 0.2 }}
            />
          ))}
          <p className="text-green-400 font-bold text-lg">EXTRACTION RÉUSSIE</p>
        </>
      ) : (
        <>
          <motion.div
            animate={{ scale: [1, 1.2, 0.8, 1], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 0.5 }}
            className="w-24 h-24 rounded-full bg-gradient-to-br from-red-800 to-red-950 flex items-center justify-center border-2 border-red-500/50"
          >
            <span className="text-4xl">💥</span>
          </motion.div>
          <motion.div
            className="absolute inset-0 bg-red-900/30 rounded-2xl"
            animate={{ opacity: [0, 0.5, 0] }}
            transition={{ duration: 0.5 }}
          />
          <p className="text-red-400 font-bold text-lg">RUPTURE TEMPORELLE</p>
        </>
      )}
    </div>
  )
}

// ── Main CaptureFlow component ────────────────────────────────────────────────
export function CaptureFlow({
  windows,
  windowsLoading,
  playerLevel,
  playerResources,
  machineTarget,
  onCaptureDone,
  onRefreshWindows,
  windowsExpiresAt,
}: CaptureFlowProps) {
  const [step, setStep]             = useState<1 | 2 | 3 | 4>(1)
  const [intent, setIntent]         = useState<CaptureIntent>("RELIQUE")
  const [stakeTier, setStakeTier]   = useState<StakeTier>("OBSERVATION")
  const [selectedWindow, setWindow] = useState<string | null>(null)
  const [usesMachine, setUsesMachine] = useState(false)
  const [phase, setPhase]           = useState<CapturePhase>("idle")
  const [captureSuccess, setCaptureSuccess] = useState<boolean | null>(null)
  const [captureRarity, setCaptureRarity]   = useState<string | undefined>()
  const [isSubmitting, setIsSubmitting]     = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearTimer = () => { if (timerRef.current) clearTimeout(timerRef.current) }

  const availableStakes = Object.values(STAKE_TIERS).filter(s => playerLevel >= s.minLevel)

  const canAffordStake = useCallback((tier: StakeTier) => {
    const cost = STAKE_TIERS[tier].cost
    return (
      playerResources.eclatsTemporels >= (cost.eclatsTemporels ?? 0) &&
      playerResources.chronite        >= (cost.chronite        ?? 0) &&
      playerResources.chronoEssence   >= (cost.chronoEssence   ?? 0)
    )
  }, [playerResources])

  const successChanceDisplay = Math.round(STAKE_TIERS[stakeTier].successChanceBase * 100)

  const runCapture = useCallback(async () => {
    if (isSubmitting) return
    setIsSubmitting(true)
    setStep(4)
    setPhase("scan")

    // Phase: scan (1.5s)
    timerRef.current = setTimeout(() => {
      setPhase("ancrage")

      // Phase: ancrage (2s)
      timerRef.current = setTimeout(() => {
        setPhase("extraction")

        // Execute actual capture during extraction animation
        const body: Record<string, unknown> = {
          captureIntent: intent,
          stakeTier,
        }
        if (selectedWindow) body.windowId = selectedWindow
        if (machineTarget && usesMachine) body.preselectedMinute = machineTarget.minute

        fetch("/api/game/capture", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify(body),
        })
          .then(r => r.json())
          .then(data => {
            const ok = !data.failed
            setCaptureSuccess(ok)
            setCaptureRarity(data.rarity)

            // Phase: extraction reveal (1.5s)
            timerRef.current = setTimeout(() => {
              setPhase("resultat")

              const result: CaptureResult = {
                success:        ok,
                relicId:        data.relicId,
                minute:         data.minute,
                rarity:         data.rarity,
                xpGained:       data.xpGained,
                drops:          data.drops,
                essenceDrops:   data.essenceDrops,
                narration:      data.narration,
                eventTitle:     data.eventTitle,
                eventYear:      data.eventYear,
                didLevelUp:     data.didLevelUp,
                newLevel:       data.newLevel,
                captureIntent:  intent,
                stakeTier,
                lostCost:       data.lostCost,
                deathPending:   data.deathPending,
                heritageOptions: data.heritageOptions,
                message:        data.message,
                consolation:    data.consolation,
              }

              onCaptureDone(result)

              // Auto-reset after result display
              timerRef.current = setTimeout(() => {
                setStep(1)
                setPhase("idle")
                setCaptureSuccess(null)
                setCaptureRarity(undefined)
                setIsSubmitting(false)
                setWindow(null)
                setUsesMachine(false)
              }, 3000)
            }, 1500)
          })
          .catch(() => {
            toast.error("Erreur réseau. Réessayez.")
            setStep(1)
            setPhase("idle")
            setIsSubmitting(false)
          })
      }, 2000)
    }, 1500)
  }, [intent, stakeTier, selectedWindow, machineTarget, usesMachine, isSubmitting, onCaptureDone])

  useEffect(() => () => clearTimer(), [])

  // ── Step indicators ─────────────────────────────────────────────────────────
  const STEP_LABELS = ["Cible", "Mode", "Mise", "Exécution"]

  return (
    <div className="relative bg-slate-900/80 border border-slate-700/60 rounded-2xl p-6 backdrop-blur-md">
      {/* Header with step indicator */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Atom className="h-5 w-5 text-violet-400" />
          Capture Temporelle
        </h2>
        <div className="flex items-center gap-1">
          {STEP_LABELS.map((label, i) => (
            <div key={label} className="flex items-center gap-1">
              <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold border transition-all ${
                step === i + 1
                  ? "bg-violet-500 border-violet-400 text-white"
                  : step > i + 1
                    ? "bg-green-500/20 border-green-500/50 text-green-400"
                    : "bg-slate-800 border-slate-700 text-slate-500"
              }`}>
                {step > i + 1 ? "✓" : i + 1}
              </div>
              {i < 3 && <div className={`w-4 h-px ${step > i + 1 ? "bg-green-500/50" : "bg-slate-700"}`} />}
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">

        {/* ── STEP 1: Cible ─────────────────────────────────────────────────── */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-4"
          >
            <p className="text-slate-400 text-sm">Choisissez votre cible temporelle</p>

            {/* Present */}
            <button
              onClick={() => { setWindow(null); setUsesMachine(false); setStep(2) }}
              className="w-full p-4 rounded-xl border border-slate-600/50 bg-slate-800/40 hover:border-violet-500/50 hover:bg-violet-950/20 transition-all text-left group"
            >
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-slate-400 group-hover:text-violet-400 transition-colors" />
                <div>
                  <p className="font-medium text-slate-200">Présent</p>
                  <p className="text-xs text-slate-400">Capturer la minute actuelle</p>
                </div>
              </div>
            </button>

            {/* Machine target */}
            {machineTarget && (
              <button
                onClick={() => { setWindow(null); setUsesMachine(true); setStep(2) }}
                className="w-full p-4 rounded-xl border border-cyan-500/50 bg-cyan-950/20 hover:border-cyan-400/70 hover:bg-cyan-950/30 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{machineTarget.eraIcon}</span>
                  <div>
                    <p className="font-medium text-cyan-300">Machine Temporelle — {machineTarget.eraLabel}</p>
                    <p className="text-xs text-cyan-400/70 font-mono">Cible: {machineTarget.minute}</p>
                  </div>
                </div>
              </button>
            )}

            {/* Time windows */}
            {windows.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-slate-400 uppercase tracking-wider">Fenêtres Temporelles</p>
                  <div className="flex items-center gap-2">
                    {windowsExpiresAt && (
                      <span className="text-xs text-slate-500 font-mono">
                        {Math.max(0, Math.floor((windowsExpiresAt - Date.now()) / 60000))}min
                      </span>
                    )}
                    <button onClick={onRefreshWindows} disabled={windowsLoading} className="text-slate-500 hover:text-slate-300 transition-colors">
                      <RefreshCw className={`h-3.5 w-3.5 ${windowsLoading ? "animate-spin" : ""}`} />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {windows.map(win => (
                    <button
                      key={win.id}
                      onClick={() => { setWindow(win.id); setUsesMachine(false); setStep(2) }}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        win.energyLevel === "high"
                          ? "border-amber-500/40 bg-amber-950/20 hover:border-amber-400/60"
                          : win.energyLevel === "medium"
                            ? "border-blue-500/30 bg-blue-950/20 hover:border-blue-400/50"
                            : "border-slate-600/40 bg-slate-800/30 hover:border-slate-500/60"
                      }`}
                    >
                      <p className="text-xs font-mono text-slate-300">{win.minute}</p>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">{win.eraHint}</p>
                      <div className={`text-xs mt-1 ${
                        win.energyLevel === "high" ? "text-amber-400" : win.energyLevel === "medium" ? "text-blue-400" : "text-slate-400"
                      }`}>
                        {win.energyLevel === "high" ? "⚡ Haute" : win.energyLevel === "medium" ? "⚡ Moy." : "· Basse"}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ── STEP 2: Mode ──────────────────────────────────────────────────── */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-3"
          >
            <button onClick={() => setStep(1)} className="flex items-center gap-1 text-slate-400 hover:text-slate-200 text-sm transition-colors mb-4">
              <ChevronLeft className="h-4 w-4" /> Retour
            </button>
            <p className="text-slate-400 text-sm">Que voulez-vous extraire de cette minute ?</p>

            {(["RELIQUE", "ESSENCE", "HYBRIDE"] as CaptureIntent[]).map(i => {
              const cfg = INTENT_CONFIG[i]
              return (
                <button
                  key={i}
                  onClick={() => { setIntent(i); setStep(3) }}
                  className={`w-full p-4 rounded-xl border ${cfg.color} hover:brightness-110 transition-all text-left`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{cfg.icon}</span>
                    <div>
                      <p className="font-semibold text-slate-100">{cfg.label}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{cfg.description}</p>
                    </div>
                  </div>
                </button>
              )
            })}
          </motion.div>
        )}

        {/* ── STEP 3: Mise ──────────────────────────────────────────────────── */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-3"
          >
            <button onClick={() => setStep(2)} className="flex items-center gap-1 text-slate-400 hover:text-slate-200 text-sm transition-colors mb-4">
              <ChevronLeft className="h-4 w-4" /> Retour
            </button>
            <p className="text-slate-400 text-sm">Choisissez votre niveau d&apos;investissement</p>

            {availableStakes.map(s => {
              const Icon       = STAKE_ICONS[s.id]
              const affordable = canAffordStake(s.id)
              const isSelected = stakeTier === s.id

              return (
                <button
                  key={s.id}
                  onClick={() => { if (affordable) setStakeTier(s.id) }}
                  disabled={!affordable}
                  className={`w-full p-4 rounded-xl border transition-all text-left ${
                    isSelected
                      ? "border-violet-500 bg-violet-950/30 ring-1 ring-violet-500/50"
                      : affordable
                        ? "border-slate-600/50 bg-slate-800/30 hover:border-slate-500"
                        : "border-slate-800 bg-slate-900/30 opacity-40 cursor-not-allowed"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon className={`h-5 w-5 ${s.color}`} />
                      <div>
                        <p className={`font-semibold ${s.color}`}>{s.label}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{s.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-emerald-400">×{s.multiplier}</p>
                      <p className="text-xs text-slate-400">{Math.round(s.successChanceBase * 100)}% succès</p>
                    </div>
                  </div>
                  {s.cost.eclatsTemporels > 0 && (
                    <div className="flex gap-3 mt-2 text-xs text-slate-400">
                      {s.cost.eclatsTemporels > 0 && <span>✨ {s.cost.eclatsTemporels}</span>}
                      {s.cost.chronite        && <span>🔩 {s.cost.chronite}</span>}
                      {s.cost.chronoEssence   && <span>⧗ {s.cost.chronoEssence}</span>}
                    </div>
                  )}
                </button>
              )
            })}

            <button
              onClick={runCapture}
              disabled={isSubmitting || !canAffordStake(stakeTier)}
              className="w-full mt-2 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 disabled:opacity-40 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Lancer la Capture
            </button>
          </motion.div>
        )}

        {/* ── STEP 4: Animation + Résultat ──────────────────────────────────── */}
        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center min-h-[240px] gap-4 relative"
          >
            <AnimatePresence mode="wait">
              {phase === "scan" && (
                <motion.div key="scan" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <ScanAnimation successChance={successChanceDisplay} />
                </motion.div>
              )}
              {phase === "ancrage" && (
                <motion.div key="ancrage" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <AnchorAnimation />
                </motion.div>
              )}
              {phase === "extraction" && (
                <motion.div key="extraction" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <ExtractionAnimation success={captureSuccess ?? true} rarity={captureRarity} />
                </motion.div>
              )}
              {phase === "resultat" && captureSuccess !== null && (
                <motion.div
                  key="resultat"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`text-center p-4 rounded-xl border shadow-2xl ${
                    captureSuccess
                      ? `bg-gradient-to-br ${RARITY_COLORS[captureRarity ?? "COMMUNE"]} ${RARITY_GLOW[captureRarity ?? "COMMUNE"]}`
                      : "bg-red-950/30 border-red-800/50"
                  }`}
                >
                  {captureSuccess ? (
                    <>
                      <Zap className="h-8 w-8 text-white mx-auto mb-2" />
                      <p className="text-white font-bold text-lg">Capture réussie !</p>
                      <p className="text-white/70 text-sm">{captureRarity}</p>
                    </>
                  ) : (
                    <>
                      <span className="text-4xl">💔</span>
                      <p className="text-red-300 font-bold mt-2">Capture échouée</p>
                      <p className="text-red-400/70 text-xs mt-1">Ressources perdues</p>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}
