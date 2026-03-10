"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { Zap, Clock, Sparkles } from "lucide-react"
import { ChronolitheReveal } from "@/components/game/ChronolitheReveal"
import type { ChronolitheDropResult } from "@/lib/game/chronolithe"
import { getRandomQuote, type TimeQuote } from "@/lib/game/quotes"

export interface CaptureResult {
  success:            boolean
  relicId?:           string
  minute?:            string
  rarity?:            string
  xpGained?:          number
  narration?:         string
  eventTitle?:        string
  eventYear?:         number
  eventDescription?:  string
  eventCuriosity?:    string
  eventCategory?:     string
  didLevelUp?:        boolean
  newLevel?:          number
  message?:           string
  completedEnigmas?:  Array<{ id: string; title: string; difficulty: string; reward: { xp: number; label: string } }>
  chronolitheSegment?: ChronolitheDropResult
  newlyCompletedChains?: Array<{ chainId: string; label: string }>
}

interface CaptureFlowProps {
  capturesLeft:     number | null
  isPremium:        boolean
  playerLevel:      number
  onCaptureDone:    (result: CaptureResult) => void
  onRefreshPlayer:  () => void
}

// ── Rarity config ──────────────────────────────────────────────────────────────
const RARITY_DISPLAY: Record<string, { label: string; color: string; glow: string; bg: string; emoji: string }> = {
  COMMUNE:    { label: "Commune",    color: "#94a3b8", glow: "rgba(148,163,184,0.4)",  bg: "rgba(148,163,184,0.08)", emoji: "⚪" },
  RARE:       { label: "Rare",       color: "#60a5fa", glow: "rgba(96,165,250,0.5)",   bg: "rgba(96,165,250,0.1)",   emoji: "🔵" },
  EPIQUE:     { label: "Épique",     color: "#a78bfa", glow: "rgba(167,139,250,0.5)",  bg: "rgba(167,139,250,0.1)",  emoji: "🟣" },
  LEGENDAIRE: { label: "Légendaire", color: "#fbbf24", glow: "rgba(251,191,36,0.6)",   bg: "rgba(251,191,36,0.1)",   emoji: "🟡" },
  MYTHIQUE:   { label: "Mythique",   color: "#f472b6", glow: "rgba(244,114,182,0.7)",  bg: "rgba(244,114,182,0.12)", emoji: "🔮" },
}

// ── Neon colors ────────────────────────────────────────────────────────────────
const BLUE   = "#00c8ff"
const ORANGE = "#ff6500"

export function CaptureFlow({ capturesLeft, isPremium, playerLevel, onCaptureDone, onRefreshPlayer }: CaptureFlowProps) {
  const [phase, setPhase]         = useState<"idle" | "capturing" | "result">("idle")
  const [clock, setClock]         = useState("")
  const [currentMinute, setCurrentMinute] = useState("")
  const [result, setResult]       = useState<CaptureResult | null>(null)
  const [quote, setQuote]         = useState<TimeQuote | null>(null)
  const [showChronolithe, setShowChronolithe] = useState(false)
  const [chronolitheSegment, setChronolitheSegment] = useState<ChronolitheDropResult | null>(null)
  const [pulseHour, setPulseHour]   = useState(false)
  const [pulseMinute, setPulseMinute] = useState(false)
  const lastMinuteRef = useRef("")
  const colonRef = useRef(true)

  // ── Clock tick ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const update = () => {
      const n    = new Date()
      const hh   = String(n.getHours()).padStart(2, "0")
      const mm   = String(n.getMinutes()).padStart(2, "0")
      const ss   = String(n.getSeconds()).padStart(2, "0")
      const min  = `${hh}:${mm}`
      colonRef.current = !colonRef.current
      setClock(ss)
      setCurrentMinute(`${hh}:${mm}`)

      if (min !== lastMinuteRef.current) {
        lastMinuteRef.current = min
        // Pulse both on minute change
        setPulseHour(true)
        setPulseMinute(true)
        setTimeout(() => { setPulseHour(false); setPulseMinute(false) }, 600)
      }
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])

  // ── Random quote on idle ────────────────────────────────────────────────────
  useEffect(() => {
    setQuote(getRandomQuote())
    const id = setInterval(() => setQuote(getRandomQuote()), 30000)
    return () => clearInterval(id)
  }, [])

  const canCapture = isPremium || (capturesLeft === null) || (capturesLeft > 0)

  // ── Capture handler ─────────────────────────────────────────────────────────
  const handleCapture = useCallback(async () => {
    if (phase !== "idle" || !canCapture) return
    setPhase("capturing")

    try {
      const n  = new Date()
      const hh = String(n.getHours()).padStart(2, "0")
      const mm = String(n.getMinutes()).padStart(2, "0")

      const res  = await fetch("/api/game/capture", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ minute: `${hh}:${mm}` }),
      })
      const data = await res.json()

      if (!res.ok) {
        setPhase("idle")
        toast.error(data.error ?? "Erreur de capture")
        return
      }

      const captureResult: CaptureResult = { success: true, ...data }
      setResult(captureResult)
      setPhase("result")

      // Chronolithe reveal
      if (data.chronolitheSegment) {
        setChronolitheSegment(data.chronolitheSegment)
        setTimeout(() => setShowChronolithe(true), 800)
      }

      onCaptureDone(captureResult)

      // Level up toast
      if (data.didLevelUp) {
        toast(`Niveau ${data.newLevel} atteint !`, {
          description: "Votre collection s'enrichit de nouvelles raretés.",
          duration: 6000,
          icon: "⬆️",
        })
      }

      // Chain completions
      if (data.newlyCompletedChains?.length > 0) {
        data.newlyCompletedChains.forEach((c: { chainId: string; label: string }) => {
          toast(`Chaîne complétée : ${c.label}`, { icon: "🔗", duration: 8000 })
        })
      }

      // Enigma completions
      if (data.completedEnigmas?.length > 0) {
        data.completedEnigmas.forEach((e: { title: string }) => {
          toast(`🗺️ Énigme résolue : ${e.title}`, { duration: 8000 })
        })
      }

    } catch {
      setPhase("idle")
      toast.error("Erreur réseau. Réessayez.")
    }
  }, [phase, canCapture, onCaptureDone])

  const handleReset = useCallback(() => {
    setPhase("idle")
    setResult(null)
    setShowChronolithe(false)
    setChronolitheSegment(null)
    onRefreshPlayer()
  }, [onRefreshPlayer])

  const rarity = result?.rarity ? RARITY_DISPLAY[result.rarity] ?? RARITY_DISPLAY.COMMUNE : null
  const [hh = "00", mm = "00"] = currentMinute.split(":")
  void clock // used in the clock display effect

  return (
    <>
      {/* ── Chronolithe overlay ────────────────────────────────────────────── */}
      <AnimatePresence>
        {showChronolithe && chronolitheSegment && (
          <ChronolitheReveal
            drop={chronolitheSegment}
            onDone={() => setShowChronolithe(false)}
          />
        )}
      </AnimatePresence>

      <div className="flex flex-col items-center gap-5">

        {/* ── Status bar ─────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-4 text-xs">
          {!isPremium && capturesLeft !== null && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
              style={{ background: "rgba(0,200,255,0.08)", border: "1px solid rgba(0,200,255,0.2)" }}>
              <Zap className="h-3 w-3" style={{ color: BLUE }} />
              <span style={{ color: "#94a3b8" }}>
                <span style={{ color: BLUE, fontWeight: 700 }}>{capturesLeft}</span> capture{capturesLeft !== 1 ? "s" : ""} restante{capturesLeft !== 1 ? "s" : ""}
              </span>
            </div>
          )}
          {isPremium && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
              style={{ background: "rgba(255,101,0,0.08)", border: "1px solid rgba(255,101,0,0.2)" }}>
              <Sparkles className="h-3 w-3" style={{ color: ORANGE }} />
              <span className="font-bold" style={{ color: ORANGE }}>Premium</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <Clock className="h-3 w-3" style={{ color: "#64748b" }} />
            <span style={{ color: "#64748b" }}>Niv. {playerLevel}</span>
          </div>
        </div>

        {/* ── WOW Clock ──────────────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {phase !== "result" && (
            <motion.div
              key="clock"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ duration: 0.4 }}
              className="relative flex flex-col items-center gap-4"
            >
              {/* Outer glow ring */}
              <div className="absolute inset-0 -m-16 pointer-events-none" aria-hidden>
                <div className="w-full h-full rounded-full opacity-20"
                  style={{
                    background: `radial-gradient(ellipse at 50% 50%, ${BLUE} 0%, ${ORANGE} 40%, transparent 70%)`,
                    filter: "blur(40px)",
                  }} />
              </div>

              {/* Clock digits */}
              <div className="relative flex items-center gap-1 select-none"
                style={{ fontFamily: "'SF Mono', 'Fira Code', monospace" }}>

                {/* Hours */}
                <motion.div
                  animate={pulseHour ? { scale: [1, 1.08, 1], opacity: [1, 0.7, 1] } : {}}
                  transition={{ duration: 0.5 }}
                  className="flex gap-1"
                >
                  {hh.split("").map((d, i) => (
                    <Digit key={`h${i}`} digit={d} color={BLUE} />
                  ))}
                </motion.div>

                {/* Colon */}
                <motion.div
                  animate={{ opacity: [1, 0.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                  className="text-5xl sm:text-7xl font-black mx-1"
                  style={{ color: "#e2e8f0", textShadow: "0 0 20px rgba(255,255,255,0.4)" }}
                >
                  :
                </motion.div>

                {/* Minutes */}
                <motion.div
                  animate={pulseMinute ? { scale: [1, 1.08, 1], opacity: [1, 0.7, 1] } : {}}
                  transition={{ duration: 0.5 }}
                  className="flex gap-1"
                >
                  {mm.split("").map((d, i) => (
                    <Digit key={`m${i}`} digit={d} color={ORANGE} />
                  ))}
                </motion.div>
              </div>

              {/* Subtitle */}
              <p className="text-xs tracking-[0.3em] uppercase font-medium"
                style={{ color: "#475569" }}>
                L'instant attend d'être capturé
              </p>

              {/* CAPTURE button */}
              <motion.button
                onClick={handleCapture}
                disabled={phase === "capturing" || !canCapture}
                whileHover={canCapture ? { scale: 1.04 } : {}}
                whileTap={canCapture ? { scale: 0.97 } : {}}
                className="relative overflow-hidden px-12 py-4 rounded-2xl text-base font-black tracking-widest uppercase disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: canCapture
                    ? `linear-gradient(135deg, rgba(0,200,255,0.12) 0%, rgba(255,101,0,0.12) 100%)`
                    : "rgba(255,255,255,0.04)",
                  border: canCapture
                    ? `1px solid transparent`
                    : "1px solid rgba(255,255,255,0.08)",
                  backgroundClip: "padding-box",
                  boxShadow: canCapture
                    ? `0 0 30px rgba(0,200,255,0.15), 0 0 60px rgba(255,101,0,0.08), inset 0 1px 0 rgba(255,255,255,0.08)`
                    : "none",
                  color: canCapture ? "#e2e8f0" : "#475569",
                }}
              >
                {/* Gradient border */}
                {canCapture && (
                  <span className="absolute inset-0 rounded-2xl pointer-events-none"
                    style={{
                      padding: 1,
                      background: `linear-gradient(135deg, ${BLUE}, ${ORANGE})`,
                      WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                      WebkitMaskComposite: "xor",
                      maskComposite: "exclude",
                    }} />
                )}

                {phase === "capturing" ? (
                  <span className="flex items-center gap-3">
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                      className="inline-block">⏳</motion.span>
                    Capture en cours…
                  </span>
                ) : !canCapture ? (
                  "Limite atteinte"
                ) : (
                  <span className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Capturer cet instant
                  </span>
                )}
              </motion.button>

              {/* Quote */}
              {quote && (
                <motion.div
                  key={quote.text}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center max-w-xs px-4"
                >
                  <p className="text-xs italic" style={{ color: "#475569", lineHeight: 1.6 }}>
                    "{quote.text}"
                  </p>
                  {quote.author && (
                    <p className="text-xs mt-1" style={{ color: "#374151" }}>— {quote.author}</p>
                  )}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Result ─────────────────────────────────────────────────────────── */}
        <AnimatePresence>
          {phase === "result" && result && rarity && (
            <ResultDisplay
              result={result}
              rarity={rarity}
              onCapureAgain={handleReset}
              canCapture={canCapture}
            />
          )}
        </AnimatePresence>

      </div>
    </>
  )
}

// ── Single digit with neon glow ───────────────────────────────────────────────
function Digit({ digit, color }: { digit: string; color: string }) {
  return (
    <motion.span
      key={digit}
      initial={{ y: -8, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="text-5xl sm:text-7xl font-black tabular-nums w-[0.62em] text-center"
      style={{
        color,
        textShadow: `0 0 20px ${color}cc, 0 0 40px ${color}66, 0 0 80px ${color}33`,
        fontFamily: "'SF Mono', 'Fira Code', monospace",
      }}
    >
      {digit}
    </motion.span>
  )
}

// ── Result display ────────────────────────────────────────────────────────────
function ResultDisplay({
  result,
  rarity,
  onCapureAgain,
  canCapture,
}: {
  result:       CaptureResult
  rarity:       { label: string; color: string; glow: string; bg: string; emoji: string }
  onCapureAgain: () => void
  canCapture:   boolean
}) {
  const isMythique   = result.rarity === "MYTHIQUE"
  const isLegendaire = result.rarity === "LEGENDAIRE"
  const isEpique     = result.rarity === "EPIQUE"

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.95 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-sm space-y-4"
    >
      {/* Rarity header */}
      <motion.div
        className="relative rounded-2xl p-5 text-center overflow-hidden"
        style={{
          background: rarity.bg,
          border:     `1px solid ${rarity.color}44`,
          boxShadow:  `0 0 40px ${rarity.glow}, inset 0 1px 0 rgba(255,255,255,0.06)`,
        }}
      >
        {/* Particle burst for rare+ */}
        {(isMythique || isLegendaire || isEpique) && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {Array.from({ length: isMythique ? 12 : isLegendaire ? 8 : 5 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full"
                style={{
                  background: rarity.color,
                  left:       `${15 + Math.random() * 70}%`,
                  top:        `${15 + Math.random() * 70}%`,
                }}
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: [0, 1, 0], opacity: [1, 1, 0], y: [-20, -60] }}
                transition={{ duration: 1.2, delay: i * 0.08, ease: "easeOut" }}
              />
            ))}
          </div>
        )}

        <motion.div
          className="text-4xl mb-2"
          initial={{ scale: 0.4, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          {rarity.emoji}
        </motion.div>

        <div className="space-y-1">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black tracking-widest uppercase"
            style={{ background: `${rarity.color}18`, border: `1px solid ${rarity.color}44`, color: rarity.color }}>
            Relique {rarity.label}
          </span>

          <div className="flex items-center justify-center gap-3 pt-2">
            <span className="text-2xl font-black tabular-nums"
              style={{ color: "#e2e8f0", fontFamily: "'SF Mono', monospace" }}>
              {result.minute}
            </span>
          </div>

          <p className="text-xs" style={{ color: "#64748b" }}>
            +{result.xpGained} XP
          </p>
        </div>
      </motion.div>

      {/* Historical event */}
      {result.eventTitle && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl p-4 space-y-2"
          style={{ background: "rgba(0,200,255,0.04)", border: "1px solid rgba(0,200,255,0.15)" }}
        >
          <div className="flex items-baseline gap-2">
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: BLUE }}>
              Événement historique
            </span>
            {result.eventYear && (
              <span className="text-xs" style={{ color: "#475569" }}>{result.eventYear}</span>
            )}
          </div>
          <p className="text-sm font-bold" style={{ color: "#e2e8f0" }}>{result.eventTitle}</p>
          {result.eventDescription && (
            <p className="text-xs leading-relaxed" style={{ color: "#94a3b8" }}>
              {result.eventDescription}
            </p>
          )}
          {result.eventCuriosity && (
            <p className="text-xs italic" style={{ color: "#475569" }}>
              {result.eventCuriosity}
            </p>
          )}
        </motion.div>
      )}

      {/* AI Narration */}
      {result.narration && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="rounded-xl p-4"
          style={{ background: "rgba(255,101,0,0.04)", border: "1px solid rgba(255,101,0,0.15)" }}
        >
          <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: ORANGE }}>
            Écho temporel
          </p>
          <p className="text-sm leading-relaxed italic"
            style={{ color: "#94a3b8", fontFamily: "Georgia, serif" }}>
            {result.narration}
          </p>
        </motion.div>
      )}

      {/* Level up */}
      {result.didLevelUp && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", delay: 0.1 }}
          className="rounded-xl p-4 text-center"
          style={{
            background: "linear-gradient(135deg, rgba(0,200,255,0.08), rgba(255,101,0,0.08))",
            border: `1px solid rgba(0,200,255,0.3)`,
            boxShadow: `0 0 30px rgba(0,200,255,0.1)`,
          }}
        >
          <p className="text-lg font-black" style={{ color: "#e2e8f0" }}>
            ⬆️ Niveau {result.newLevel} !
          </p>
          <p className="text-xs mt-1" style={{ color: "#64748b" }}>
            Nouvelles raretés débloquées
          </p>
        </motion.div>
      )}

      {/* Capture again */}
      <motion.button
        onClick={onCapureAgain}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full py-3 rounded-xl text-sm font-bold transition-colors"
        style={{
          background: canCapture
            ? "rgba(0,200,255,0.08)"
            : "rgba(255,255,255,0.04)",
          border: canCapture
            ? `1px solid rgba(0,200,255,0.3)`
            : "1px solid rgba(255,255,255,0.08)",
          color: canCapture ? BLUE : "#475569",
        }}
      >
        {canCapture ? "Capturer un autre instant →" : "Limite atteinte — revenez demain"}
      </motion.button>
    </motion.div>
  )
}
