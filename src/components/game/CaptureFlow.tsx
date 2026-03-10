"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { Eye, Coins, Swords, Skull, Zap, Clock, RefreshCw, ChevronLeft, Sparkles, Atom, Quote } from "lucide-react"
import { STAKE_TIERS, type StakeTier } from "@/lib/game/essences"
import type { TimeWindow } from "@/lib/game/windows"
import { getRandomQuote, type TimeQuote } from "@/lib/game/quotes"

type CaptureIntent = "RELIQUE" | "ESSENCE" | "HYBRIDE"
type CapturePhase  = "idle" | "scan" | "ancrage" | "extraction" | "resultat"
type TimingZone    = "COMMUNE" | "RARE" | "EPIQUE" | "LEGENDAIRE"

export interface CaptureResult {
  success:          boolean
  relicId?:         string
  minute?:          string
  rarity?:          string
  xpGained?:        number
  drops?:           Record<string, number>
  essenceDrops?:    Record<string, number>
  narration?:       string
  eventTitle?:      string
  eventYear?:       number
  eventDescription?: string
  eventCuriosity?:  string
  eventCategory?:   string
  didLevelUp?:      boolean
  newLevel?:        number
  captureIntent:    CaptureIntent
  stakeTier:        StakeTier
  lostCost?:        Record<string, number>
  deathPending?:    boolean
  heritageOptions?: unknown[]
  message?:         string
  consolation?:     Record<string, number>
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

// ── Anchor mini-game configuration ───────────────────────────────────────────
interface AnchorZoneConfig {
  id:           TimingZone
  from:         number
  to:           number
  bgClass:      string
  textClass:    string
  borderClass:  string
  bgHintClass:  string
  label:        string
  shortLabel:   string
  bonus:        string
}

const ANCHOR_ZONES: AnchorZoneConfig[] = [
  { id: "COMMUNE",    from: 0,  to: 15,  bgClass: "bg-slate-700",  textClass: "text-slate-400",  borderClass: "border-slate-700/40",  bgHintClass: "bg-slate-800/60",  label: "Ordinaire",  shortLabel: "",  bonus: "" },
  { id: "RARE",       from: 15, to: 35,  bgClass: "bg-blue-800",   textClass: "text-blue-300",   borderClass: "border-blue-600/40",   bgHintClass: "bg-blue-950/60",   label: "RARE",       shortLabel: "R", bonus: "+10% Rare" },
  { id: "EPIQUE",     from: 35, to: 45,  bgClass: "bg-purple-800", textClass: "text-purple-300", borderClass: "border-purple-600/40", bgHintClass: "bg-purple-950/60", label: "ÉPIQUE",     shortLabel: "É", bonus: "+15% Épique" },
  { id: "LEGENDAIRE", from: 45, to: 55,  bgClass: "bg-amber-700",  textClass: "text-amber-300",  borderClass: "border-amber-600/40",  bgHintClass: "bg-amber-950/60",  label: "LÉGENDAIRE", shortLabel: "★", bonus: "+25% Légendaire" },
  { id: "EPIQUE",     from: 55, to: 65,  bgClass: "bg-purple-800", textClass: "text-purple-300", borderClass: "border-purple-600/40", bgHintClass: "bg-purple-950/60", label: "ÉPIQUE",     shortLabel: "É", bonus: "+15% Épique" },
  { id: "RARE",       from: 65, to: 85,  bgClass: "bg-blue-800",   textClass: "text-blue-300",   borderClass: "border-blue-600/40",   bgHintClass: "bg-blue-950/60",   label: "RARE",       shortLabel: "R", bonus: "+10% Rare" },
  { id: "COMMUNE",    from: 85, to: 100, bgClass: "bg-slate-700",  textClass: "text-slate-400",  borderClass: "border-slate-700/40",  bgHintClass: "bg-slate-800/60",  label: "Ordinaire",  shortLabel: "",  bonus: "" },
]

function detectAnchorZone(pos: number): AnchorZoneConfig {
  return ANCHOR_ZONES.find(z => pos >= z.from && pos < z.to) ?? ANCHOR_ZONES[0]
}

const RARITY_RESET_DELAY: Record<string, number> = {
  COMMUNE:    6000,
  RARE:       9000,
  EPIQUE:     12000,
  LEGENDAIRE: 16000,
  MYTHIQUE:   20000,
}

// ── Risk meter config ─────────────────────────────────────────────────────────
const RISK_CONFIG: Record<StakeTier, {
  level:       number  // 0-100
  label:       string
  color:       string
  barClass:    string
  description: string
}> = {
  OBSERVATION:    { level:  8, label: "Minimal",  color: "text-emerald-400", barClass: "from-emerald-600 to-emerald-400", description: "Aucun risque — observation pure" },
  INVESTISSEMENT: { level: 32, label: "Modéré",   color: "text-amber-300",   barClass: "from-yellow-600 to-amber-400",   description: "Ressources mises en jeu — aucun danger vital" },
  ENGAGEMENT:     { level: 68, label: "Élevé",    color: "text-orange-400",  barClass: "from-orange-700 to-orange-400",  description: "Mort possible (15%) si niveau > 10" },
  RITUEL:         { level: 95, label: "Critique",  color: "text-red-400",     barClass: "from-red-800 to-red-500",        description: "Danger extrême — mort probable (45%) si niveau > 10" },
}

function RiskMeter({ stakeTier }: { stakeTier: StakeTier }) {
  const cfg = RISK_CONFIG[stakeTier]
  return (
    <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Instabilité Temporelle</span>
        <span className={`text-xs font-bold ${cfg.color}`}>{cfg.label}</span>
      </div>
      {/* Bar */}
      <div className="h-2.5 bg-slate-700/60 rounded-full overflow-hidden border border-slate-600/40">
        <motion.div
          className={`h-full rounded-full bg-gradient-to-r ${cfg.barClass}`}
          initial={{ width: "0%" }}
          animate={{ width: `${cfg.level}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
      {/* Stats row */}
      <div className="flex items-center justify-between text-[10px]">
        <span className={cfg.color}>{cfg.level}% instabilité</span>
        {STAKE_TIERS[stakeTier].deathRiskPct > 0 ? (
          <span className="text-red-400 font-bold flex items-center gap-1">
            💀 {STAKE_TIERS[stakeTier].deathRiskPct}% de mort
          </span>
        ) : (
          <span className="text-emerald-500">✓ Aucun risque vital</span>
        )}
        <span className="text-slate-400">×{STAKE_TIERS[stakeTier].multiplier} gains</span>
      </div>
      <p className="text-[10px] text-slate-500 leading-tight">{cfg.description}</p>
    </div>
  )
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

// ── Anchor mini-game ──────────────────────────────────────────────────────────
function AnchorMiniGame({ onLock }: { onLock: (zone: TimingZone) => void }) {
  const [cursorPos, setCursorPos]       = useState(50)
  const [locked, setLocked]             = useState(false)
  const [lockedZone, setLockedZone]     = useState<AnchorZoneConfig | null>(null)
  const startRef   = useRef(Date.now())
  const posRef     = useRef(50)
  const lockedRef  = useRef(false)

  useEffect(() => {
    const interval = setInterval(() => {
      if (lockedRef.current) return
      const elapsed = (Date.now() - startRef.current) / 1000
      // Oscillation period starts at 2.5s and gradually speeds up
      const period  = Math.max(0.9, 2.5 - elapsed * 0.07)
      const newPos  = 50 + 49 * Math.sin(2 * Math.PI * elapsed / period)
      posRef.current = newPos
      setCursorPos(newPos)
    }, 16)
    return () => clearInterval(interval)
  }, [])

  const doLock = useCallback(() => {
    if (lockedRef.current) return
    lockedRef.current = true
    setLocked(true)
    const zone = detectAnchorZone(posRef.current)
    setLockedZone(zone)
    setTimeout(() => onLock(zone.id), 500)
  }, [onLock])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "Enter") { e.preventDefault(); doLock() }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [doLock])

  const currentZone = locked ? lockedZone : detectAnchorZone(cursorPos)

  // Cursor glow color when locked
  const cursorClass = locked
    ? lockedZone?.id === "LEGENDAIRE"
      ? "bg-amber-300 shadow-[0_0_14px_5px_rgba(251,191,36,0.9)]"
      : lockedZone?.id === "EPIQUE"
        ? "bg-purple-300 shadow-[0_0_12px_4px_rgba(168,85,247,0.9)]"
        : lockedZone?.id === "RARE"
          ? "bg-blue-300 shadow-[0_0_10px_3px_rgba(59,130,246,0.9)]"
          : "bg-white shadow-[0_0_6px_2px_rgba(255,255,255,0.6)]"
    : "bg-white shadow-[0_0_10px_4px_rgba(255,255,255,0.95)]"

  return (
    <div className="w-full max-w-sm space-y-3">
      <div className="text-center">
        <p className="text-slate-200 text-sm font-semibold">⧗ Ancrage Temporel</p>
        <p className="text-slate-500 text-xs mt-0.5">
          {locked ? "Zone verrouillée !" : "Cliquez ou appuyez sur Espace pour ancrer"}
        </p>
      </div>

      {/* Zone bar */}
      <div
        className="relative h-14 w-full rounded-lg overflow-hidden border border-slate-600 cursor-pointer select-none"
        onClick={doLock}
      >
        {/* Zone segments */}
        <div className="absolute inset-0 flex">
          {ANCHOR_ZONES.map((zone, i) => (
            <div
              key={i}
              style={{ width: `${zone.to - zone.from}%` }}
              className={`${zone.bgClass} h-full flex items-center justify-center transition-all duration-150 ${
                locked
                  ? lockedZone?.from === zone.from ? "opacity-100 brightness-125" : "opacity-40"
                  : "opacity-70"
              }`}
            >
              <span className={`text-[10px] font-bold ${zone.textClass} opacity-90`}>
                {zone.shortLabel}
              </span>
            </div>
          ))}
        </div>

        {/* Zone dividers */}
        {[15, 35, 45, 55, 65, 85].map(pos => (
          <div
            key={pos}
            className="absolute top-0 bottom-0 w-px bg-slate-950/70"
            style={{ left: `${pos}%` }}
          />
        ))}

        {/* Cursor line */}
        <div
          className={`absolute top-1 bottom-1 w-1.5 rounded-full transition-colors duration-100 ${cursorClass}`}
          style={{ left: `calc(${cursorPos}% - 3px)` }}
        />

        {/* Lock flash */}
        <AnimatePresence>
          {locked && lockedZone && (
            <motion.div
              key="flash"
              className={`absolute inset-0 pointer-events-none ${
                lockedZone.id === "LEGENDAIRE" ? "bg-amber-400/30"
                : lockedZone.id === "EPIQUE"   ? "bg-purple-400/25"
                : lockedZone.id === "RARE"     ? "bg-blue-400/20"
                : "bg-slate-400/10"
              }`}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 0.4 }}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Zone legend */}
      <div className="flex text-[10px] leading-none">
        <span style={{ width: "15%" }} className="text-slate-500 text-center">Ord.</span>
        <span style={{ width: "20%" }} className="text-blue-400 text-center">RARE</span>
        <span style={{ width: "10%" }} className="text-purple-400 text-center">ÉP.</span>
        <span style={{ width: "10%" }} className="text-amber-400 font-bold text-center">LÉG.</span>
        <span style={{ width: "10%" }} className="text-purple-400 text-center">ÉP.</span>
        <span style={{ width: "20%" }} className="text-blue-400 text-center">RARE</span>
        <span style={{ width: "15%" }} className="text-slate-500 text-center">Ord.</span>
      </div>

      {/* Zone indicator */}
      {!locked ? (
        <div className={`text-center py-1.5 rounded-lg text-xs font-medium border transition-all duration-100 ${
          currentZone?.id === "LEGENDAIRE" ? "bg-amber-950/60 text-amber-300 border-amber-600/40"
          : currentZone?.id === "EPIQUE"   ? "bg-purple-950/60 text-purple-300 border-purple-600/40"
          : currentZone?.id === "RARE"     ? "bg-blue-950/60 text-blue-300 border-blue-600/40"
          : "bg-slate-800/60 text-slate-500 border-slate-700/40"
        }`}>
          {currentZone?.bonus || "Aucun bonus — visez le centre !"}
        </div>
      ) : lockedZone && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-center py-2 rounded-lg text-sm font-bold border ${
            lockedZone.id === "LEGENDAIRE" ? "bg-amber-950/60 text-amber-300 border-amber-500/60"
            : lockedZone.id === "EPIQUE"   ? "bg-purple-950/60 text-purple-300 border-purple-500/60"
            : lockedZone.id === "RARE"     ? "bg-blue-950/60 text-blue-300 border-blue-500/60"
            : "bg-slate-800/60 text-slate-400 border-slate-700/40"
          }`}
        >
          {lockedZone.id === "COMMUNE"
            ? "Zone Ordinaire — aucun bonus"
            : `Zone ${lockedZone.label} ! ${lockedZone.bonus}`
          }
        </motion.div>
      )}

      {!locked && (
        <button
          onClick={doLock}
          className="w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 transition-all active:scale-95 text-sm"
        >
          ⚡ Ancrer !{" "}
          <span className="text-xs font-normal opacity-50 ml-1">[Espace]</span>
        </button>
      )}
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

// ── Graduated cinematic reveal ────────────────────────────────────────────────
function GradualRevealCard({
  success,
  rarity,
  timingZone,
  narration,
  eventTitle,
  eventYear,
  eventDescription,
  eventCuriosity,
  quote,
}: {
  success:          boolean
  rarity?:          string
  timingZone:       TimingZone | null
  narration?:       string
  eventTitle?:      string
  eventYear?:       number
  eventDescription?: string
  eventCuriosity?:  string
  quote?:           TimeQuote
}) {
  const isRare     = rarity === "RARE"
  const isEpique   = rarity === "EPIQUE"
  const isLegen    = rarity === "LEGENDAIRE"
  const isMythique = rarity === "MYTHIQUE"

  const needsFlash = success && (isRare || isEpique || isLegen || isMythique)
  const flashMs    = isMythique ? 1500 : isLegen ? 1000 : isEpique ? 650 : 350

  const [revealed,      setRevealed]      = useState(!needsFlash)
  const [showEvent,     setShowEvent]     = useState(false)
  const [showQuote,     setShowQuote]     = useState(false)
  const [showNarration, setShowNarration] = useState(false)

  useEffect(() => {
    if (!needsFlash) {
      // Commune / RARE without flash — cascade immediately
      const t1 = setTimeout(() => setShowEvent(true),     300)
      const t2 = setTimeout(() => setShowQuote(true),     800)
      const t3 = setTimeout(() => setShowNarration(true), 1400)
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
    }
    const t0 = setTimeout(() => setRevealed(true),      flashMs)
    const t1 = setTimeout(() => setShowEvent(true),     flashMs + 400)
    const t2 = setTimeout(() => setShowQuote(true),     flashMs + 1100)
    const t3 = setTimeout(() => setShowNarration(true), flashMs + 2000)
    return () => { clearTimeout(t0); clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Failure
  if (!success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center p-4 rounded-xl border bg-red-950/30 border-red-800/50"
      >
        <span className="text-4xl">💔</span>
        <p className="text-red-300 font-bold mt-2">Capture échouée</p>
        <p className="text-red-400/70 text-xs mt-1">Ressources perdues</p>
      </motion.div>
    )
  }

  const rarityColor = RARITY_COLORS[rarity ?? "COMMUNE"] ?? RARITY_COLORS["COMMUNE"]
  const rarityGlow  = RARITY_GLOW[rarity  ?? "COMMUNE"] ?? RARITY_GLOW["COMMUNE"]

  // Flash phase — mystery reveal animation
  if (!revealed) {
    const flashGrad = isMythique
      ? "from-white via-pink-200 to-white"
      : isLegen
        ? "from-amber-300 via-yellow-100 to-amber-300"
        : isEpique
          ? "from-purple-300 via-fuchsia-100 to-purple-300"
          : "from-blue-300 via-sky-100 to-blue-300"

    const flashIcon = isMythique ? "🌟" : isLegen ? "👑" : isEpique ? "💜" : "💎"

    return (
      <div className="flex flex-col items-center gap-4">
        <motion.div
          className={`w-24 h-24 rounded-full bg-gradient-to-br ${flashGrad} flex items-center justify-center shadow-2xl`}
          animate={{ scale: [0.3, 1.2, 1, 1.1, 1], opacity: [0, 1, 0.9, 1, 0.7] }}
          transition={{ duration: flashMs / 1000, ease: "easeInOut" }}
        >
          <span className="text-3xl">{flashIcon}</span>
        </motion.div>
        <motion.p
          className="text-slate-300 text-sm font-mono"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 0.7, repeat: Infinity }}
        >
          {isMythique ? "IDENTIFICATION EN COURS..." : "Analyse de la relique..."}
        </motion.p>
      </div>
    )
  }

  // Particles for EPIQUE+
  const particleCount = isMythique ? 14 : isLegen ? 10 : isEpique ? 6 : 0
  const particleClass = isMythique ? "bg-pink-300" : isLegen ? "bg-amber-300" : "bg-purple-300"

  return (
    <div className="relative w-full space-y-3">
      {/* Particles */}
      {particleCount > 0 && (
        <>
          {Array.from({ length: particleCount }).map((_, i) => {
            const angle  = (i / particleCount) * Math.PI * 2
            const radius = 50 + (i % 4) * 12
            return (
              <motion.div
                key={i}
                className={`absolute w-1.5 h-1.5 rounded-full ${particleClass} pointer-events-none`}
                style={{ top: "50%", left: "50%", marginTop: -3, marginLeft: -3 }}
                initial={{ x: 0, y: 0, opacity: 1 }}
                animate={{ x: Math.cos(angle) * radius, y: Math.sin(angle) * radius, opacity: 0 }}
                transition={{ duration: 0.7, delay: 0.05 }}
              />
            )
          })}
        </>
      )}

      {/* ── Rarity badge ─────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, scale: isLegen || isMythique ? 0.5 : 0.8, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 22 }}
        className={`text-center p-3 rounded-xl border shadow-2xl bg-gradient-to-br ${rarityColor} ${rarityGlow}`}
      >
        {isMythique && (
          <motion.div animate={{ rotate: [0, 8, -8, 5, -5, 0] }} transition={{ duration: 0.6 }} className="text-2xl mb-1">🌟</motion.div>
        )}
        {isLegen && (
          <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 300, damping: 15 }} className="text-2xl mb-1">👑</motion.div>
        )}
        <Zap className="h-6 w-6 text-white mx-auto mb-1" />
        <p className="text-white font-bold">Capture réussie !</p>
        <p className="text-white/80 text-xs font-mono">{rarity}</p>
        {timingZone && timingZone !== "COMMUNE" && (
          <p className="text-white/50 text-[10px] mt-0.5">Ancrage {timingZone}</p>
        )}
      </motion.div>

      {/* ── Historical event card ─────────────────────────────────── */}
      <AnimatePresence>
        {showEvent && eventTitle && (
          <motion.div
            key="event"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="rounded-xl border p-3 space-y-1"
            style={{
              background: "linear-gradient(145deg, rgba(196,150,10,0.06), rgba(20,16,40,0.9))",
              borderColor: "rgba(196,150,10,0.25)",
            }}
          >
            <div className="flex items-center gap-2">
              <span className="text-base">📜</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold truncate" style={{ color: "#e8b84b" }}>
                  {eventTitle}
                  {eventYear != null && <span className="font-normal opacity-70 ml-1">({eventYear > 0 ? eventYear : `${Math.abs(eventYear)} av. J.-C.`})</span>}
                </p>
              </div>
            </div>
            {eventDescription && (
              <p className="text-[11px] leading-relaxed" style={{ color: "#9b8d7a" }}>
                {eventDescription}
              </p>
            )}
            {eventCuriosity && (
              <div className="flex items-start gap-1.5 mt-1 pt-1 border-t border-amber-400/10">
                <span className="text-xs shrink-0">💡</span>
                <p className="text-[11px] italic" style={{ color: "#c4960a" }}>
                  {eventCuriosity}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Famous quote ─────────────────────────────────────────── */}
      <AnimatePresence>
        {showQuote && quote && (
          <motion.div
            key="quote"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="rounded-xl border p-3"
            style={{
              background: "rgba(107,40,200,0.06)",
              borderColor: "rgba(107,40,200,0.2)",
            }}
          >
            <div className="flex items-start gap-2">
              <Quote className="h-3.5 w-3.5 mt-0.5 shrink-0 text-violet-400 opacity-70" />
              <div>
                <p className="text-[11px] italic leading-relaxed" style={{ color: "#c4b5fd" }}>
                  {quote.text}
                </p>
                <p className="text-[10px] mt-1 text-right" style={{ color: "#6b5a8e" }}>
                  — {quote.author}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── AI Narration ─────────────────────────────────────────── */}
      <AnimatePresence>
        {showNarration && narration && (
          <motion.div
            key="narration"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="rounded-xl border p-3"
            style={{
              background: "rgba(6,182,212,0.04)",
              borderColor: "rgba(6,182,212,0.15)",
            }}
          >
            <div className="flex items-start gap-2">
              <span className="text-sm shrink-0">✨</span>
              <p className="text-[11px] leading-relaxed italic" style={{ color: "#7dd3fc" }}>
                {narration}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
  const [captureSuccess, setCaptureSuccess]           = useState<boolean | null>(null)
  const [captureRarity, setCaptureRarity]             = useState<string | undefined>()
  const [timingZone, setTimingZone]                   = useState<TimingZone | null>(null)
  const [captureNarration, setCaptureNarration]       = useState<string | undefined>()
  const [captureEventTitle, setCaptureEventTitle]     = useState<string | undefined>()
  const [captureEventYear, setCaptureEventYear]       = useState<number | undefined>()
  const [captureEventDesc, setCaptureEventDesc]       = useState<string | undefined>()
  const [captureEventCurio, setCaptureEventCurio]     = useState<string | undefined>()
  const [captureQuote, setCaptureQuote]               = useState<TimeQuote | undefined>()
  const [isSubmitting, setIsSubmitting]               = useState(false)
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

  // Starts the flow — scan phase only, waits for anchor mini-game
  const runCapture = useCallback(() => {
    if (isSubmitting) return
    setIsSubmitting(true)
    setTimingZone(null)
    setStep(4)
    setPhase("scan")

    timerRef.current = setTimeout(() => {
      setPhase("ancrage")
      // Flow continues when player locks the anchor mini-game → handleAnchorLock
    }, 1500)
  }, [isSubmitting])

  // Called by AnchorMiniGame when player clicks
  const handleAnchorLock = useCallback(async (zone: TimingZone) => {
    setTimingZone(zone)
    setPhase("extraction")

    // Send client-side minute to avoid server locale/timezone issues
    const now          = new Date()
    const clientMinute = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`

    const body: Record<string, unknown> = {
      captureIntent: intent,
      stakeTier,
      timingZone: zone,
      minute: clientMinute,
    }
    if (selectedWindow) body.windowId = selectedWindow
    if (machineTarget && usesMachine) body.preselectedMinute = machineTarget.minute

    try {
      const r    = await fetch("/api/game/capture", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(body),
      })
      const data = await r.json()

      // Hard HTTP error (auth, rate limit, server crash) — not a game failure
      if (!r.ok && !data.failed) {
        toast.error(data.error ?? "Erreur de capture. Réessayez.")
        setStep(1)
        setPhase("idle")
        setIsSubmitting(false)
        setTimingZone(null)
        return
      }

      const ok   = !data.failed
      setCaptureSuccess(ok)
      setCaptureRarity(data.rarity)
      if (ok) {
        setCaptureNarration(data.narration)
        setCaptureEventTitle(data.eventTitle)
        setCaptureEventYear(data.eventYear)
        setCaptureEventDesc(data.eventDescription)
        setCaptureEventCurio(data.eventCuriosity)
        setCaptureQuote(getRandomQuote())
      }

      timerRef.current = setTimeout(() => {
        setPhase("resultat")

        const result: CaptureResult = {
          success:          ok,
          relicId:          data.relicId,
          minute:           data.minute,
          rarity:           data.rarity,
          xpGained:         data.xpGained,
          drops:            data.drops,
          essenceDrops:     data.essenceDrops,
          narration:        data.narration,
          eventTitle:       data.eventTitle,
          eventYear:        data.eventYear,
          eventDescription: data.eventDescription,
          eventCuriosity:   data.eventCuriosity,
          eventCategory:    data.eventCategory,
          didLevelUp:       data.didLevelUp,
          newLevel:         data.newLevel,
          captureIntent:    intent,
          stakeTier,
          lostCost:         data.lostCost,
          deathPending:     data.deathPending,
          heritageOptions:  data.heritageOptions,
          message:          data.message,
          consolation:      data.consolation,
        }

        onCaptureDone(result)

        const resetDelay = RARITY_RESET_DELAY[data.rarity ?? "COMMUNE"] ?? 3000
        timerRef.current = setTimeout(() => {
          setStep(1)
          setPhase("idle")
          setCaptureSuccess(null)
          setCaptureRarity(undefined)
          setCaptureNarration(undefined)
          setCaptureEventTitle(undefined)
          setCaptureEventYear(undefined)
          setCaptureEventDesc(undefined)
          setCaptureEventCurio(undefined)
          setCaptureQuote(undefined)
          setIsSubmitting(false)
          setWindow(null)
          setUsesMachine(false)
          setTimingZone(null)
        }, resetDelay)
      }, 1500)
    } catch {
      toast.error("Erreur réseau. Réessayez.")
      setStep(1)
      setPhase("idle")
      setIsSubmitting(false)
      setTimingZone(null)
    }
  }, [intent, stakeTier, selectedWindow, machineTarget, usesMachine, onCaptureDone])

  useEffect(() => () => clearTimer(), [])

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

            {/* Risk meter */}
            <RiskMeter stakeTier={stakeTier} />

            <button
              onClick={runCapture}
              disabled={isSubmitting || !canAffordStake(stakeTier)}
              className="w-full mt-1 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 disabled:opacity-40 transition-all active:scale-95 flex items-center justify-center gap-2"
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
            className="flex flex-col items-center justify-start min-h-[280px] gap-4 relative overflow-y-auto max-h-[520px] pr-1"
          >
            <AnimatePresence mode="wait">
              {phase === "scan" && (
                <motion.div key="scan" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <ScanAnimation successChance={successChanceDisplay} />
                </motion.div>
              )}
              {phase === "ancrage" && (
                <motion.div key="ancrage" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <AnchorMiniGame onLock={handleAnchorLock} />
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
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="w-full"
                >
                  <GradualRevealCard
                    success={captureSuccess}
                    rarity={captureRarity}
                    timingZone={timingZone}
                    narration={captureNarration}
                    eventTitle={captureEventTitle}
                    eventYear={captureEventYear}
                    eventDescription={captureEventDesc}
                    eventCuriosity={captureEventCurio}
                    quote={captureQuote}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}
