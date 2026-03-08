"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { formatTime } from "@/lib/utils"

interface CaptureButtonProps {
  onCapture:     () => Promise<void>
  isCapturing:   boolean
  capturesLeft:  number | null   // null = illimité (premium)
  comboCount:    number
  hasReroll?:    boolean
  onReroll?:     () => void
}

export function CaptureButton({
  onCapture,
  isCapturing,
  capturesLeft,
  comboCount,
  hasReroll = false,
  onReroll,
}: CaptureButtonProps) {
  const [currentTime, setCurrentTime] = useState<string>("--:--:--")
  const [currentMinute, setCurrentMinute] = useState<string>("--:--")
  const [pulse, setPulse] = useState(false)

  useEffect(() => {
    const tick = () => {
      const now = new Date()
      setCurrentTime(formatTime(now))
      const min = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`
      setCurrentMinute(min)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  // Pulse toutes les 30 secondes pour inciter à capturer
  useEffect(() => {
    const id = setInterval(() => {
      setPulse(true)
      setTimeout(() => setPulse(false), 1500)
    }, 30000)
    return () => clearInterval(id)
  }, [])

  const isDisabled = isCapturing || (capturesLeft !== null && capturesLeft <= 0)
  const isOutOfCaptures = capturesLeft !== null && capturesLeft <= 0

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Horloge */}
      <div className="text-center">
        <div className="font-mono text-5xl font-black text-[#e2e8f0] tracking-widest tabular-nums">
          {currentTime}
        </div>
        <div className="text-[#475569] text-sm mt-1 font-mono">Heure actuelle</div>
      </div>

      {/* Combo indicator */}
      <AnimatePresence>
        {comboCount > 1 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: -20 }}
            className="flex items-center gap-2 bg-amber-500/20 border border-amber-500/30 rounded-full px-4 py-1.5"
          >
            <span className="text-amber-400 font-bold text-sm">COMBO</span>
            <span className="text-white font-black text-lg">x{comboCount}</span>
            <span className="text-emerald-400 text-xs font-semibold">
              +{Math.min(comboCount * 10, 50)}% XP
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bouton de capture */}
      <div className="relative flex items-center justify-center">
        {/* Anneaux rotatifs */}
        <motion.div
          className="absolute rounded-full border border-violet-500/20"
          style={{ width: "180px", height: "180px" }}
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-violet-500" />
        </motion.div>

        <motion.div
          className="absolute rounded-full border border-violet-500/10"
          style={{ width: "220px", height: "220px" }}
          animate={{ rotate: -360 }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        >
          <div className="absolute bottom-0 right-0 w-1.5 h-1.5 rounded-full bg-violet-400/60" />
        </motion.div>

        {/* Pulsation quand disponible */}
        {!isDisabled && (
          <motion.div
            className="absolute rounded-full bg-violet-500/10"
            style={{ width: "140px", height: "140px" }}
            animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}

        {/* Bouton principal */}
        <motion.button
          onClick={isDisabled ? undefined : onCapture}
          className={`relative w-32 h-32 rounded-full flex flex-col items-center justify-center gap-1 transition-all duration-300 border-2 font-bold select-none ${
            isDisabled
              ? "border-slate-700 bg-slate-800/50 text-slate-600 cursor-not-allowed"
              : "border-violet-500 bg-violet-500/20 text-white cursor-pointer hover:bg-violet-500/30 hover:border-violet-400"
          }`}
          whileTap={!isDisabled ? { scale: 0.92 } : {}}
          animate={pulse && !isDisabled ? { scale: [1, 1.05, 1] } : {}}
          style={!isDisabled ? {
            boxShadow: "0 0 30px rgba(139, 92, 246, 0.4), 0 0 60px rgba(139, 92, 246, 0.15)",
          } : {}}
        >
          {isCapturing ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="text-3xl"
            >
              ⏳
            </motion.div>
          ) : isOutOfCaptures ? (
            <>
              <span className="text-3xl">🔒</span>
              <span className="text-[10px] text-slate-500 text-center px-2">Limite atteinte</span>
            </>
          ) : (
            <>
              <span className="text-4xl">⏰</span>
              <span className="text-xs font-bold tracking-wider">CAPTURER</span>
              <span className="font-mono text-xs text-violet-300 font-black">{currentMinute}</span>
            </>
          )}
        </motion.button>
      </div>

      {/* Compteur de captures */}
      {capturesLeft !== null && (
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {Array.from({ length: Math.max(capturesLeft, 0) + (capturesLeft === 0 ? 0 : 0) }, (_, i) => (
              <div key={i} className={`w-2 h-2 rounded-full ${i < capturesLeft ? "bg-violet-500" : "bg-slate-700"}`} />
            ))}
            {Array.from({ length: Math.max(0, 5 - Math.max(capturesLeft, 0)) }, (_, i) => (
              <div key={`empty-${i}`} className="w-2 h-2 rounded-full bg-slate-700" />
            ))}
          </div>
          <span className="text-xs text-[#94a3b8]">
            {capturesLeft > 0
              ? `${capturesLeft} capture${capturesLeft > 1 ? "s" : ""} restante${capturesLeft > 1 ? "s" : ""}`
              : "Passez en Premium pour capturer sans limite"}
          </span>
        </div>
      )}

      {/* Bouton de relance (Chronomancien) */}
      {hasReroll && onReroll && (
        <motion.button
          onClick={onReroll}
          className="flex items-center gap-2 text-xs text-violet-400 hover:text-violet-300 transition-colors border border-violet-500/30 rounded-full px-4 py-1.5 hover:border-violet-400/60"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span>🔄</span>
          <span>Relancer la minute</span>
        </motion.button>
      )}
    </div>
  )
}
