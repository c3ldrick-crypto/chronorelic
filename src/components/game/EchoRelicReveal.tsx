"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface EchoRelicRevealProps {
  echoReveal: {
    storyId: string
    storyTitle: string
    storyIcon: string
    voice: "A" | "B"
    fragmentIndex: number
    fragmentText: string
    fragmentHint: string
    voiceAName: string
    voiceAPeriod: string
    voiceBName: string
    voiceBPeriod: string
    fragmentsA: number
    fragmentsB: number
    isFirstFragment: boolean
    isConvergence: boolean
    convergenceTitle?: string
    convergenceText?: string
  }
  onClose: () => void
}

const BLUE   = "#3b82f6"
const AMBER  = "#f59e0b"
const BLUE_D  = "rgba(59,130,246,0.15)"
const AMBER_D = "rgba(245,158,11,0.15)"
const BLUE_B  = "rgba(59,130,246,0.3)"
const AMBER_B = "rgba(245,158,11,0.3)"

export default function EchoRelicReveal({ echoReveal, onClose }: EchoRelicRevealProps) {
  const [phase, setPhase] = useState<"detected" | "fragment" | "convergence">("detected")
  const [displayedText, setDisplayedText] = useState("")
  const [typingDone, setTypingDone] = useState(false)

  const isA       = echoReveal.voice === "A"
  const accent    = isA ? BLUE : AMBER
  const accentD   = isA ? BLUE_D : AMBER_D
  const accentB   = isA ? BLUE_B : AMBER_B
  const voiceName = isA ? echoReveal.voiceAName   : echoReveal.voiceBName
  const voicePer  = isA ? echoReveal.voiceAPeriod : echoReveal.voiceBPeriod

  // Save progress on mount
  useEffect(() => {
    fetch("/api/game/echo-relic", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storyId: echoReveal.storyId, voice: echoReveal.voice }),
    }).catch(() => {})
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Phase transitions
  useEffect(() => {
    const t = setTimeout(() => setPhase("fragment"), 1500)
    return () => clearTimeout(t)
  }, [])

  // Typewriter for fragment text
  useEffect(() => {
    if (phase !== "fragment") return
    let i = 0
    setDisplayedText("")
    setTypingDone(false)
    const iv = setInterval(() => {
      setDisplayedText(echoReveal.fragmentText.slice(0, i + 1))
      i++
      if (i >= echoReveal.fragmentText.length) {
        clearInterval(iv)
        setTypingDone(true)
        if (echoReveal.isConvergence) {
          setTimeout(() => setPhase("convergence"), 900)
        }
      }
    }, 14)
    return () => clearInterval(iv)
  }, [phase]) // eslint-disable-line react-hooks/exhaustive-deps

  // Progress dots: 4 A (blue) + 4 B (amber)
  const dots = Array.from({ length: 8 }, (_, i) => {
    const isVoiceA  = i < 4
    const dotIndex  = isVoiceA ? i : i - 4
    const collected = isVoiceA
      ? dotIndex < echoReveal.fragmentsA
      : dotIndex < echoReveal.fragmentsB
    const isCurrent = isVoiceA
      ? (isA  && dotIndex === echoReveal.fragmentIndex - 1)
      : (!isA && dotIndex === echoReveal.fragmentIndex - 1)
    const color = isVoiceA ? BLUE : AMBER
    const borderColor = isVoiceA ? BLUE_B : AMBER_B
    return { color, collected, isCurrent, borderColor }
  })

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.92)", backdropFilter: "blur(10px)" }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="relative max-w-lg w-full rounded-2xl overflow-hidden"
        style={{
          background:  `linear-gradient(145deg, #080f1a 0%, #0d1729 60%, #0a1220 100%)`,
          border:      `1px solid ${accentB}`,
          boxShadow:   `0 0 60px ${accentD}, inset 0 1px 0 rgba(255,255,255,0.05)`,
        }}
      >
        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: `radial-gradient(ellipse at 50% 0%, ${accentD} 0%, transparent 65%)`,
        }} />

        <AnimatePresence mode="wait">

          {/* ── PHASE: detected ─────────────────────────────────── */}
          {phase === "detected" && (
            <motion.div
              key="detected"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4 }}
              className="relative p-8 text-center space-y-4"
            >
              <motion.div
                className="text-5xl mx-auto"
                animate={{ scale: [1, 1.12, 1] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
              >
                {echoReveal.storyIcon}
              </motion.div>

              <motion.p
                className="text-xs tracking-widest uppercase font-bold"
                style={{ color: "#64748b" }}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              >
                {echoReveal.storyTitle}
              </motion.p>

              <motion.div
                animate={{ opacity: [0.7, 1, 0.7], scale: [0.98, 1.02, 0.98] }}
                transition={{ duration: 1.1, repeat: Infinity }}
                className="inline-block px-4 py-2 rounded-full text-sm font-black tracking-widest uppercase"
                style={{
                  background:  accentD,
                  border:      `1px solid ${accentB}`,
                  color:       accent,
                  textShadow:  `0 0 12px ${accent}`,
                  boxShadow:   `0 0 20px ${accentD}`,
                }}
              >
                Relique Écho Détectée
              </motion.div>

              <p className="text-xs" style={{ color: "#475569" }}>
                {isA ? `Voix A · ${voiceName}` : `Voix B · ${voiceName}`}
              </p>
            </motion.div>
          )}

          {/* ── PHASE: fragment ─────────────────────────────────── */}
          {phase === "fragment" && (
            <motion.div
              key="fragment"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="relative p-6 space-y-4"
            >
              {/* Header */}
              <div className="flex items-center gap-2">
                <span className="text-xl">{echoReveal.storyIcon}</span>
                <span className="text-xs font-bold tracking-wide" style={{ color: "#64748b" }}>
                  {echoReveal.storyTitle}
                </span>
              </div>

              {/* Voice badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide"
                style={{
                  background:  accentD,
                  border:      `1px solid ${accentB}`,
                  color:       accent,
                }}>
                {isA ? "VOIX A" : "VOIX B"} — {voiceName} · {voicePer}
              </div>

              {/* New story banner */}
              {echoReveal.isFirstFragment && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 280, damping: 22 }}
                  className="text-center text-xs font-bold py-1.5 rounded-lg"
                  style={{
                    background: "rgba(168,85,247,0.1)",
                    border:     "1px solid rgba(168,85,247,0.3)",
                    color:      "#c084fc",
                  }}
                >
                  ✦ Nouvelle histoire découverte !
                </motion.div>
              )}

              {/* Fragment text */}
              <div className="rounded-xl p-4" style={{
                background:  "rgba(255,255,255,0.03)",
                border:      `1px solid rgba(255,255,255,0.06)`,
                borderLeft:  `3px solid ${accent}`,
              }}>
                <p className="text-sm leading-relaxed italic"
                  style={{ color: "#cbd5e1", fontFamily: "Georgia, serif" }}>
                  {displayedText}
                  {!typingDone && (
                    <motion.span
                      animate={{ opacity: [1, 0] }}
                      transition={{ duration: 0.55, repeat: Infinity }}
                      style={{ color: accent }}
                    >|</motion.span>
                  )}
                </p>
              </div>

              {/* Fragment hint */}
              {typingDone && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="text-xs text-center italic px-2"
                  style={{ color: "#475569" }}
                >
                  {echoReveal.fragmentHint}
                </motion.p>
              )}

              {/* Progress dots */}
              <div className="flex items-center justify-center gap-2 pt-1">
                {dots.map((dot, i) => (
                  <motion.div
                    key={i}
                    animate={dot.isCurrent ? { scale: [1, 1.4, 1], opacity: [0.8, 1, 0.8] } : {}}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="rounded-full"
                    style={{
                      width:       dot.collected || dot.isCurrent ? 10 : 8,
                      height:      dot.collected || dot.isCurrent ? 10 : 8,
                      background:  dot.collected || dot.isCurrent ? dot.color : "transparent",
                      border:      `1.5px solid ${dot.collected || dot.isCurrent ? dot.color : dot.borderColor}`,
                      opacity:     dot.collected || dot.isCurrent ? 1 : 0.35,
                    }}
                  />
                ))}
              </div>
              <p className="text-center text-xs" style={{ color: "#374151" }}>
                {echoReveal.fragmentsA}/4 <span style={{ color: BLUE }}>A</span>
                &nbsp;·&nbsp;
                {echoReveal.fragmentsB}/4 <span style={{ color: AMBER }}>B</span>
              </p>

              {/* Close button */}
              {typingDone && !echoReveal.isConvergence && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={onClose}
                  className="w-full py-2 rounded-lg text-sm font-bold"
                  style={{
                    background: accentD,
                    border:     `1px solid ${accentB}`,
                    color:      accent,
                  }}
                >
                  Continuer →
                </motion.button>
              )}
            </motion.div>
          )}

          {/* ── PHASE: convergence ──────────────────────────────── */}
          {phase === "convergence" && (
            <motion.div
              key="convergence"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="relative p-6 space-y-4"
            >
              {/* Shimmer overlay */}
              <motion.div
                className="absolute inset-0 pointer-events-none rounded-2xl"
                animate={{ opacity: [0, 0.18, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                style={{
                  background: "linear-gradient(135deg, rgba(59,130,246,0.2) 0%, rgba(245,158,11,0.2) 100%)",
                }}
              />

              {/* Header */}
              <div className="text-center">
                <motion.p
                  className="text-xs tracking-widest uppercase font-bold mb-1"
                  style={{ color: "#f0b429", textShadow: "0 0 10px rgba(240,180,41,0.5)" }}
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  ✦ Convergence Temporelle ✦
                </motion.p>
                <p className="text-xs" style={{ color: "#475569" }}>
                  Les deux voix se rejoignent à travers les siècles
                </p>
              </div>

              {/* Split voices */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl p-3 space-y-1" style={{
                  background: BLUE_D,
                  border:     `1px solid ${BLUE_B}`,
                }}>
                  <p className="text-xs font-bold" style={{ color: BLUE }}>
                    VOIX A · {echoReveal.voiceAName}
                  </p>
                  <p className="text-xs italic" style={{ color: "#94a3b8", fontFamily: "Georgia, serif" }}>
                    {echoReveal.voiceAPeriod}
                  </p>
                </div>
                <div className="rounded-xl p-3 space-y-1" style={{
                  background: AMBER_D,
                  border:     `1px solid ${AMBER_B}`,
                }}>
                  <p className="text-xs font-bold" style={{ color: AMBER }}>
                    VOIX B · {echoReveal.voiceBName}
                  </p>
                  <p className="text-xs italic" style={{ color: "#94a3b8", fontFamily: "Georgia, serif" }}>
                    {echoReveal.voiceBPeriod}
                  </p>
                </div>
              </div>

              {/* Convergence title */}
              {echoReveal.convergenceTitle && (
                <motion.h2
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="text-center text-lg font-black"
                  style={{
                    color:      "#f8fafc",
                    textShadow: "0 0 24px rgba(240,180,41,0.4)",
                  }}
                >
                  {echoReveal.convergenceTitle}
                </motion.h2>
              )}

              {/* Convergence text */}
              {echoReveal.convergenceText && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.55, duration: 0.5 }}
                  className="text-sm text-center leading-relaxed italic px-2"
                  style={{ color: "#cbd5e1", fontFamily: "Georgia, serif" }}
                >
                  {echoReveal.convergenceText}
                </motion.p>
              )}

              {/* Progress dots (all filled) */}
              <div className="flex items-center justify-center gap-2">
                {dots.map((dot, i) => (
                  <motion.div
                    key={i}
                    animate={{ scale: [1, 1.25, 1], opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.07 }}
                    className="rounded-full"
                    style={{ width: 10, height: 10, background: dot.color }}
                  />
                ))}
              </div>

              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={onClose}
                className="w-full py-2 rounded-lg text-sm font-bold"
                style={{
                  background: "linear-gradient(90deg, rgba(59,130,246,0.15) 0%, rgba(245,158,11,0.15) 100%)",
                  border:     "1px solid rgba(255,255,255,0.12)",
                  color:      "#f8fafc",
                }}
              >
                Fermer ✦
              </motion.button>
            </motion.div>
          )}

        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}
