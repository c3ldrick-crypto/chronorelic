"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Radio, Waves } from "lucide-react"

interface EchoStoryProgress {
  storyId:    string
  storyTitle: string
  storyIcon:  string
  fragmentsA: number
  fragmentsB: number
  status:     string
  createdAt:  string
}

interface EchoStats {
  total:       number
  revealed:    number
  inProgress:  number
  totalFrags:  number
}

const ECHO_META: Record<string, { voiceA: string; voiceAColor: string; voiceB: string; voiceBColor: string }> = {
  echo_01: { voiceA: "Frère Anselmo · Florence 1347",   voiceAColor: "#3b82f6", voiceB: "Sarah Okonkwo · Lagos 2020",    voiceBColor: "#f59e0b" },
  echo_02: { voiceA: "Henri Dupont · Verdun 1916",       voiceAColor: "#3b82f6", voiceB: "Carlos Reyes · Vietnam 1968",   voiceBColor: "#f59e0b" },
  echo_03: { voiceA: "Michel-Ange · Rome 1512",          voiceAColor: "#3b82f6", voiceB: "Mark Rothko · New York 1969",   voiceBColor: "#f59e0b" },
  echo_04: { voiceA: "Léonard de Vinci · Amboise 1519",  voiceAColor: "#3b82f6", voiceB: "Pablo Picasso · Mougins 1972",  voiceBColor: "#f59e0b" },
  echo_05: { voiceA: "Livia · Rome 79 ap. J.-C.",        voiceAColor: "#3b82f6", voiceB: "Hana Novak · Prague 1944",      voiceBColor: "#f59e0b" },
}

function FragmentDots({ filled, total, color }: { filled: number; total: number; color: string }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: total }).map((_, i) => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full"
          animate={{
            backgroundColor: i < filled ? color : "rgba(255,255,255,0.08)",
            boxShadow:        i < filled ? `0 0 6px ${color}88` : "none",
          }}
          transition={{ duration: 0.3, delay: i * 0.05 }}
        />
      ))}
    </div>
  )
}

export default function EcholiteCollectionPage() {
  const [stories,  setStories]  = useState<EchoStoryProgress[]>([])
  const [stats,    setStats]    = useState<EchoStats | null>(null)
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    fetch("/api/game/echo-relic")
      .then(r => r.json())
      .then((data: { stories: EchoStoryProgress[]; stats: EchoStats }) => {
        setStories(data.stories ?? [])
        setStats(data.stats ?? null)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          className="w-10 h-10 rounded-full border-2"
          style={{ borderColor: "rgba(139,92,246,0.3)", borderTopColor: "#8b5cf6" }}
          animate={{ rotate: 360 }}
          transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
        />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">

      {/* ── En-tête ── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-3">
        <div className="flex items-center justify-center gap-3">
          <Radio className="h-7 w-7" style={{ color: "#8b5cf6" }} />
          <h1 className="text-3xl font-black tracking-wide" style={{ color: "#e2e8f0" }}>
            Reliques Écho
          </h1>
        </div>
        <p className="text-sm" style={{ color: "#64748b" }}>
          Deux voix. Deux époques. Une vérité partagée à travers les siècles.
        </p>
      </motion.div>

      {/* ── Stats ── */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-3">
          {[
            { label: "Histoires actives",   value: stats.inProgress, color: "#3b82f6" },
            { label: "Convergences",         value: stats.revealed,   color: "#f59e0b" },
            { label: "Fragments collectés",  value: stats.totalFrags, color: "#8b5cf6" },
          ].map(({ label, value, color }) => (
            <div key={label}
              className="rounded-2xl p-4 text-center"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <p className="text-2xl font-black" style={{ color }}>{value}</p>
              <p className="text-xs mt-1" style={{ color: "#475569" }}>{label}</p>
            </div>
          ))}
        </motion.div>
      )}

      {/* ── Liste des histoires ── */}
      {stories.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl p-10 text-center space-y-4"
          style={{ background: "rgba(139,92,246,0.04)", border: "1px dashed rgba(139,92,246,0.2)" }}>
          <Waves className="h-10 w-10 mx-auto" style={{ color: "rgba(139,92,246,0.3)" }} />
          <div>
            <p className="font-bold" style={{ color: "#64748b" }}>Aucun écho capturé</p>
            <p className="text-sm mt-1" style={{ color: "#334155" }}>
              Continuez à capturer des Reliques — les fragments Écho apparaissent par surprise.
            </p>
          </div>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {stories.map((story, i) => {
            const meta       = ECHO_META[story.storyId]
            const totalFrags = story.fragmentsA + story.fragmentsB
            const isRevealed = story.status === "REVEALED"

            return (
              <motion.div
                key={story.storyId}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="rounded-2xl p-5 space-y-4"
                style={{
                  background: isRevealed
                    ? "linear-gradient(135deg, rgba(59,130,246,0.06), rgba(245,158,11,0.06))"
                    : "rgba(255,255,255,0.02)",
                  border: isRevealed
                    ? "1px solid rgba(139,92,246,0.3)"
                    : "1px solid rgba(255,255,255,0.06)",
                }}>

                {/* Titre + badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{story.storyIcon}</span>
                    <div>
                      <p className="font-bold text-sm" style={{ color: "#e2e8f0" }}>{story.storyTitle}</p>
                      <p className="text-xs mt-0.5" style={{ color: "#475569" }}>
                        {totalFrags} / 8 fragments
                      </p>
                    </div>
                  </div>
                  {isRevealed && (
                    <div className="px-2.5 py-1 rounded-full text-xs font-bold"
                      style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)", color: "#a78bfa" }}>
                      Convergence
                    </div>
                  )}
                </div>

                {/* Voix */}
                {meta && (
                  <div className="grid grid-cols-2 gap-3">
                    {/* Voice A */}
                    <div className="rounded-xl p-3 space-y-2"
                      style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.15)" }}>
                      <p className="text-xs font-bold" style={{ color: "#3b82f6" }}>VOIX A</p>
                      <p className="text-xs" style={{ color: "#64748b" }}>{meta.voiceA}</p>
                      <FragmentDots filled={story.fragmentsA} total={4} color="#3b82f6" />
                    </div>
                    {/* Voice B */}
                    <div className="rounded-xl p-3 space-y-2"
                      style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)" }}>
                      <p className="text-xs font-bold" style={{ color: "#f59e0b" }}>VOIX B</p>
                      <p className="text-xs" style={{ color: "#64748b" }}>{meta.voiceB}</p>
                      <FragmentDots filled={story.fragmentsB} total={4} color="#f59e0b" />
                    </div>
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
