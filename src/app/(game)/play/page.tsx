"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { MythicEvent } from "@/components/game/MythicEvent"
import { RelicCard, RelicData } from "@/components/game/RelicCard"
import { XPBar } from "@/components/game/XPBar"
import { useGameStore } from "@/hooks/useGameStore"
import { CaptureFlow, type CaptureResult } from "@/components/game/CaptureFlow"
import { Flame } from "lucide-react"

interface PlayerData {
  userName?:    string | null
  character: {
    name:    string
    class:   string
    level:   number
    xpTotal: number
  } | null
  isPremium:      boolean
  temporalShards: number
  capturesLeft:   number | null
  recentRelics:   RelicData[]
  streakCount:    number
}

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
  const [player, setPlayer]     = useState<PlayerData | null>(null)
  const [showEvent, setShowEvent] = useState(false)

  const { pendingResult, setPendingResult, incrementCapture } = useGameStore()

  useEffect(() => {
    fetch("/api/game/player")
      .then(async r => { const d = await r.json(); if (!r.ok) throw new Error(d.error); return d })
      .then(setPlayer)
      .catch((e: unknown) => toast.error(`Impossible de charger le profil: ${e instanceof Error ? e.message : "Erreur"}`))
  }, [])

  const refreshPlayer = useCallback(() => {
    fetch("/api/game/player")
      .then(async r => { if (r.ok) setPlayer(await r.json()) })
      .catch(() => {})
  }, [])

  const handleCaptureFlowDone = useCallback((result: CaptureResult) => {
    if (!result.success) return
    incrementCapture()

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
      if (!prev || !prev.character) return prev
      const xpAfter = prev.character.xpTotal + (result.xpGained ?? 0)
      const newRelic: RelicData = {
        id:         result.relicId ?? "",
        minute:     result.minute ?? "",
        rarity:     result.rarity as RelicData["rarity"],
        xpGained:   result.xpGained ?? 0,
        capturedAt: new Date().toISOString(),
        historicalEvent: result.eventTitle
          ? { title: result.eventTitle, year: result.eventYear ?? 0 }
          : null,
      }
      return {
        ...prev,
        capturesLeft: prev.capturesLeft !== null ? Math.max(0, prev.capturesLeft - 1) : null,
        character: { ...prev.character, xpTotal: xpAfter },
        recentRelics: result.relicId
          ? [newRelic, ...prev.recentRelics.slice(0, 7)]
          : prev.recentRelics,
      }
    })
  }, [incrementCapture, setPendingResult])

  if (!player) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: "calc(100vh - 64px)" }}>
        <motion.div
          className="w-8 h-8 rounded-full border-2"
          style={{ borderColor: "rgba(0,200,255,0.3)", borderTopColor: "#00c8ff" }}
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
        />
      </div>
    )
  }

  return (
    <>
      <AnimatePresence>
        {showEvent && pendingResult && (
          <MythicEvent
            rarity={pendingResult.rarity}
            minute={pendingResult.minute}
            visible={showEvent}
            onClose={() => { setShowEvent(false); setPendingResult(null) }}
            narration={pendingResult.narration}
            eventTitle={pendingResult.eventTitle}
          />
        )}
      </AnimatePresence>

      <div className="pt-4 pb-4 px-4">
        <div className="relative max-w-lg mx-auto space-y-5">

          {player.character && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="text-2xl">{CLASS_ICONS[player.character.class] ?? "⏳"}</div>
                <div>
                  <p className="text-sm font-bold" style={{ color: "#e2e8f0" }}>
                    {player.character.name}
                  </p>
                  <p className="text-xs" style={{ color: "#475569" }}>
                    {CLASS_LABELS[player.character.class] ?? player.character.class}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {player.streakCount > 1 && (
                  <div className="flex items-center gap-1 px-2 py-1 rounded-lg"
                    style={{ background: "rgba(255,101,0,0.08)", border: "1px solid rgba(255,101,0,0.2)" }}>
                    <Flame className="h-3 w-3" style={{ color: "#ff6500" }} />
                    <span className="text-xs font-bold" style={{ color: "#ff6500" }}>
                      {player.streakCount}j
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-center w-10 h-10 rounded-xl font-black text-sm"
                  style={{
                    background: "linear-gradient(135deg, rgba(0,200,255,0.12), rgba(255,101,0,0.12))",
                    border:     "1px solid rgba(0,200,255,0.25)",
                    color:      "#e2e8f0",
                  }}>
                  {player.character.level}
                </div>
              </div>
            </motion.div>
          )}

          {player.character && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
              <XPBar xpTotal={player.character.xpTotal} />
            </motion.div>
          )}

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <CaptureFlow
              capturesLeft={player.capturesLeft}
              isPremium={player.isPremium}
              playerLevel={player.character?.level ?? 1}
              onCaptureDone={handleCaptureFlowDone}
              onRefreshPlayer={refreshPlayer}
            />
          </motion.div>

          {player.recentRelics.length > 0 && (
            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="space-y-3"
            >
              <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: "#475569" }}>
                Captures récentes
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {player.recentRelics.map((relic, i) => (
                  <RelicCard key={relic.id} relic={relic} index={i} compact />
                ))}
              </div>
            </motion.section>
          )}

        </div>
      </div>
    </>
  )
}
