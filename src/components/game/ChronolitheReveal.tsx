"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import type { ChronolitheDropResult } from "@/lib/game/chronolithe"

interface ChronolitheRevealProps {
  drop:    ChronolitheDropResult
  onDone?: () => void
}

export function ChronolitheReveal({ drop, onDone }: ChronolitheRevealProps) {
  const [phase, setPhase] = useState<"stone" | "rune" | "story" | "hook">("stone")
  const [displayedText, setDisplayedText] = useState("")
  const [showHook, setShowHook] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("rune"),  800)
    const t2 = setTimeout(() => setPhase("story"), 1800)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  // Typewriter effect for the segment text
  useEffect(() => {
    if (phase !== "story") return
    let i = 0
    setDisplayedText("")
    const interval = setInterval(() => {
      setDisplayedText(drop.segmentText.slice(0, i + 1))
      i++
      if (i >= drop.segmentText.length) {
        clearInterval(interval)
        setTimeout(() => {
          setPhase("hook")
          setShowHook(true)
        }, 600)
      }
    }, 12)
    return () => clearInterval(interval)
  }, [phase, drop.segmentText])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}
      onClick={phase === "hook" ? onDone : undefined}
    >
      {/* Stone slab */}
      <motion.div
        initial={{ scale: 0.6, opacity: 0, rotate: -3 }}
        animate={{ scale: 1,   opacity: 1, rotate: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative max-w-lg w-full rounded-2xl overflow-hidden"
        style={{
          background:   "linear-gradient(135deg, #0d1b2a 0%, #1a2744 50%, #0f1e35 100%)",
          border:       "1px solid rgba(103,232,249,0.25)",
          boxShadow:    "0 0 60px rgba(103,232,249,0.15), inset 0 1px 0 rgba(255,255,255,0.06)",
        }}
      >
        {/* Glow aura */}
        <div className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at 50% 0%, rgba(103,232,249,0.08) 0%, transparent 70%)",
          }} />

        {/* Crack texture lines */}
        <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none" viewBox="0 0 400 500">
          <path d="M180 0 L200 120 L160 200 L220 300 L190 500" stroke="rgba(103,232,249,0.6)" strokeWidth="0.5" fill="none"/>
          <path d="M300 0 L280 80 L310 150 L270 250" stroke="rgba(103,232,249,0.4)" strokeWidth="0.5" fill="none"/>
          <path d="M60 100 L100 150 L80 220" stroke="rgba(103,232,249,0.3)" strokeWidth="0.5" fill="none"/>
        </svg>

        <div className="relative p-6 space-y-4">

          {/* ── PHASE: Stone → Rune header ───────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: phase !== "stone" ? 1 : 0, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-1"
          >
            {/* Icon */}
            <motion.div
              className="text-4xl mx-auto mb-2"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              {drop.storyIcon}
            </motion.div>

            {/* CHRONOLITHE badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase"
              style={{
                background: "rgba(103,232,249,0.1)",
                border:     "1px solid rgba(103,232,249,0.35)",
                color:      "#67e8f9",
                textShadow: "0 0 8px rgba(103,232,249,0.5)",
              }}>
              🪨 Chronolithe
            </div>

            {/* New story or continuation */}
            {drop.isNewStory ? (
              <p className="text-xs" style={{ color: "#94a3b8" }}>
                Nouvelle histoire découverte
              </p>
            ) : (
              <p className="text-xs" style={{ color: "#94a3b8" }}>
                Suite de l'histoire — Partie {drop.segmentIndex}/{drop.totalSegments}
              </p>
            )}

            {/* Story title */}
            <h2 className="text-lg font-black tracking-wide"
              style={{ color: "#e2e8f0", textShadow: "0 0 20px rgba(103,232,249,0.3)" }}>
              {drop.storyTitle}
            </h2>

            {/* Theme pill */}
            <span className="text-xs italic" style={{ color: "#67e8f9" }}>
              {drop.theme}
            </span>

            {/* Progress bar */}
            <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: "linear-gradient(90deg, #0891b2, #67e8f9)" }}
                initial={{ width: `${((drop.segmentIndex - 1) / drop.totalSegments) * 100}%` }}
                animate={{ width: `${(drop.segmentIndex / drop.totalSegments) * 100}%` }}
                transition={{ duration: 0.8, delay: 0.3 }}
              />
            </div>
          </motion.div>

          {/* ── PHASE: Story text (typewriter) ─────────────────── */}
          <AnimatePresence>
            {phase === "story" || phase === "hook" ? (
              <motion.div
                key="text"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                {/* Segment title */}
                <p className="text-xs font-bold uppercase tracking-widest mb-3 pb-2"
                  style={{
                    color:        "#67e8f9",
                    borderBottom: "1px solid rgba(103,232,249,0.15)",
                  }}>
                  {drop.segmentTitle}
                </p>

                {/* Segment text */}
                <p className="text-sm leading-relaxed whitespace-pre-wrap"
                  style={{ color: "#cbd5e1", fontFamily: "Georgia, serif" }}>
                  {displayedText}
                  {phase === "story" && (
                    <motion.span
                      animate={{ opacity: [1, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity }}
                      style={{ color: "#67e8f9" }}>
                      |
                    </motion.span>
                  )}
                </p>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {/* ── PHASE: Hook + CTA ─────────────────────────────── */}
          <AnimatePresence>
            {showHook && (
              <motion.div
                key="hook"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-3"
              >
                {/* Story completed badge */}
                {drop.isCompleted && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="text-center py-2 rounded-lg"
                    style={{
                      background: "rgba(234,179,8,0.1)",
                      border:     "1px solid rgba(234,179,8,0.3)",
                    }}>
                    <p className="text-sm font-black" style={{ color: "#fbbf24" }}>
                      ✨ Histoire complète !
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>
                      Lisez-la dans vos Chronolithes
                    </p>
                  </motion.div>
                )}

                {/* Hook line */}
                {drop.segmentHook && !drop.isCompleted && (
                  <p className="text-xs italic text-center px-4"
                    style={{ color: "#94a3b8", fontFamily: "Georgia, serif" }}>
                    {drop.segmentHook}
                  </p>
                )}

                {/* CTA */}
                <div className="pt-1 border-t" style={{ borderColor: "rgba(103,232,249,0.1)" }}>
                  {!drop.isCompleted && drop.segmentHook && (
                    <p className="text-xs text-center mb-2" style={{ color: "#64748b" }}>
                      Continuez à capturer pour découvrir la suite…
                    </p>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onDone}
                    className="w-full py-2 rounded-lg text-sm font-bold transition-colors"
                    style={{
                      background: "rgba(103,232,249,0.1)",
                      border:     "1px solid rgba(103,232,249,0.3)",
                      color:      "#67e8f9",
                    }}>
                    Continuer →
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </motion.div>
    </motion.div>
  )
}
