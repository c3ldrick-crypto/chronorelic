"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Clock, Sword, CheckCircle2, Skull, BookOpen } from "lucide-react"
import Link from "next/link"
import { HeroRelicReveal } from "@/components/game/HeroRelicReveal"
import { getHeroStory, type HeroStory } from "@/lib/game/heroRelic"

interface HeroStoryProgress {
  storyId:        string
  storyTitle:     string
  storyIcon:      string
  storyTheme:     string
  difficulty:     "STANDARD" | "COMPLEXE"
  era:            string
  year:           string
  status:         "IN_PROGRESS" | "COMPLETED" | "DEAD"
  endType:        "HISTORICAL" | "ALTERNATE" | null
  currentSegment: string
  choicesPath:    string[]
  startedAt:      string
  completedAt:    string | null
}

interface HeroStats {
  totalStories:        number
  discovered:          number
  inProgress:          number
  completedHistorical: number
  completedAlternate:  number
  dead:                number
}

export default function HerolithesPage() {
  const [stories, setStories]           = useState<HeroStoryProgress[]>([])
  const [stats, setStats]               = useState<HeroStats | null>(null)
  const [loading, setLoading]           = useState(true)
  const [activeStory, setActiveStory]   = useState<{
    story: HeroStory
    progress: {
      currentSegment: string
      choicesPath: string[]
      status: string
      endType?: string | null
    }
  } | null>(null)

  const fetchStories = useCallback(async () => {
    try {
      const res  = await fetch("/api/game/hero-relic")
      const data = await res.json()
      setStories(data.stories ?? [])
      setStats(data.stats   ?? null)
    } catch { /* ignore */ } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchStories() }, [fetchStories])

  function handleOpen(progress: HeroStoryProgress) {
    const story = getHeroStory(progress.storyId)
    if (!story) return
    setActiveStory({ story, progress })
  }

  function handleClose() {
    setActiveStory(null)
    fetchStories()
  }

  const inProgressStories  = stories.filter(s => s.status === "IN_PROGRESS")
  const completedStories   = stories.filter(s => s.status === "COMPLETED")
  const deadStories        = stories.filter(s => s.status === "DEAD")

  return (
    <>
      {/* ── Hero Reveal overlay ─────────────────────────────────────────────── */}
      {activeStory && (
        <HeroRelicReveal
          story={activeStory.story}
          onClose={handleClose}
          existingProgress={activeStory.progress}
        />
      )}

      <div className="min-h-screen pt-4 pb-8 px-4">
        <div className="max-w-2xl mx-auto space-y-8">

          {/* ── Header ────────────────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-2"
          >
            <motion.div
              className="text-5xl mx-auto"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}>
              ⚔️
            </motion.div>
            <h1 className="text-2xl font-black tracking-wide"
              style={{ color: "#e2e8f0", textShadow: "0 0 30px rgba(212,160,23,0.3)" }}>
              Reliques Kairos
            </h1>
            <p className="text-sm" style={{ color: "#64748b" }}>
              L&apos;Histoire entre vos mains — aventures branchées interactives
            </p>

            {stats && (
              <div className="flex items-center justify-center gap-5 pt-2 flex-wrap">
                <Stat label="Découvertes"   value={`${stats.discovered}/${stats.totalStories}`} />
                <Stat label="En cours"      value={stats.inProgress}          color="#d4a017" />
                <Stat label="Historique"    value={stats.completedHistorical} color="#e8c96a" />
                <Stat label="Alternatif"    value={stats.completedAlternate}  color="#a78bfa" />
                <Stat label="Paradoxes"     value={stats.dead}                color="#ff6666" />
              </div>
            )}
          </motion.div>

          {/* ── Loading ─────────────────────────────────────────────────────── */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <motion.div
                className="w-8 h-8 rounded-full border-2"
                style={{ borderColor: "rgba(212,160,23,0.3)", borderTopColor: "#d4a017" }}
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            </div>
          )}

          {/* ── Empty state ─────────────────────────────────────────────────── */}
          {!loading && stories.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 space-y-4"
            >
              <p className="text-4xl">⚔️</p>
              <p className="text-base font-bold" style={{ color: "#94a3b8" }}>
                Aucune Relique Kairos découverte
              </p>
              <p className="text-sm" style={{ color: "#64748b" }}>
                Continuez à capturer des reliques — des aventures historiques branchées apparaissent lors de vos captures.
              </p>
              <Link href="/play"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold"
                style={{ background: "rgba(212,160,23,0.1)", border: "1px solid rgba(212,160,23,0.3)", color: "#d4a017" }}>
                <Clock className="h-4 w-4" /> Aller capturer
              </Link>
            </motion.div>
          )}

          {/* ── In Progress ─────────────────────────────────────────────────── */}
          {!loading && inProgressStories.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2" style={{ color: "#d4a017" }}>
                <Sword className="h-3 w-3" />
                En cours · {inProgressStories.length}
              </h2>
              {inProgressStories.map((story, i) => (
                <HeroCard
                  key={story.storyId}
                  story={story}
                  index={i}
                  onOpen={() => handleOpen(story)}
                  glowColor="rgba(212,160,23,0.2)"
                  borderColor="rgba(212,160,23,0.4)"
                />
              ))}
            </section>
          )}

          {/* ── Completed ───────────────────────────────────────────────────── */}
          {!loading && completedStories.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2" style={{ color: "#a78bfa" }}>
                <CheckCircle2 className="h-3 w-3" />
                Terminées · {completedStories.length}
              </h2>
              {completedStories.map((story, i) => (
                <HeroCard
                  key={story.storyId}
                  story={story}
                  index={i}
                  onOpen={() => handleOpen(story)}
                  glowColor={story.endType === "HISTORICAL" ? "rgba(212,160,23,0.12)" : "rgba(124,58,237,0.15)"}
                  borderColor={story.endType === "HISTORICAL" ? "rgba(212,160,23,0.35)" : "rgba(124,58,237,0.4)"}
                />
              ))}
            </section>
          )}

          {/* ── Dead / Paradox ──────────────────────────────────────────────── */}
          {!loading && deadStories.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2" style={{ color: "#ff6666" }}>
                <Skull className="h-3 w-3" />
                Paradoxes Temporels · {deadStories.length}
              </h2>
              {deadStories.map((story, i) => (
                <HeroCard
                  key={story.storyId}
                  story={story}
                  index={i}
                  onOpen={() => handleOpen(story)}
                  glowColor="rgba(255,68,68,0.1)"
                  borderColor="rgba(255,68,68,0.3)"
                />
              ))}
            </section>
          )}

        </div>
      </div>
    </>
  )
}

// ── Stat badge ───────────────────────────────────────────────────────────────
function Stat({ label, value, color = "#94a3b8" }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="text-center">
      <p className="text-base font-black" style={{ color }}>{value}</p>
      <p className="text-xs" style={{ color: "#64748b" }}>{label}</p>
    </div>
  )
}

// ── Hero story card ──────────────────────────────────────────────────────────
function HeroCard({
  story, index, onOpen, glowColor, borderColor,
}: {
  story: HeroStoryProgress
  index: number
  onOpen: () => void
  glowColor: string
  borderColor: string
}) {
  const statusLabel = story.status === "IN_PROGRESS"
    ? "EN COURS"
    : story.status === "DEAD"
      ? "PARADOXE"
      : story.endType === "HISTORICAL"
        ? "HISTORIQUE"
        : "ALTERNATIF"

  const statusColor = story.status === "IN_PROGRESS"
    ? "#d4a017"
    : story.status === "DEAD"
      ? "#ff6666"
      : story.endType === "HISTORICAL"
        ? "#e8c96a"
        : "#a78bfa"

  const difficultyColor = story.difficulty === "COMPLEXE" ? "#f87171" : "#6ee7b7"

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="rounded-xl overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #100d07 0%, #1a1408 100%)",
        border:     `1px solid ${borderColor}`,
        boxShadow:  `0 0 20px ${glowColor}`,
      }}
    >
      <div className="flex items-center gap-3 p-4">
        <span className="text-2xl shrink-0">{story.storyIcon}</span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <p className="font-bold text-sm truncate" style={{ color: "#e8d5a0" }}>
              {story.storyTitle}
            </p>
            {/* Status badge */}
            <span style={{
              fontSize: "0.6rem", letterSpacing: "0.1em", fontFamily: "monospace",
              border: `1px solid ${statusColor}40`,
              borderRadius: 4, padding: "2px 6px", color: statusColor,
              background: `${statusColor}10`,
            }}>{statusLabel}</span>
            {/* Difficulty badge */}
            <span style={{
              fontSize: "0.6rem", letterSpacing: "0.1em", fontFamily: "monospace",
              border: `1px solid ${difficultyColor}30`,
              borderRadius: 4, padding: "2px 6px", color: difficultyColor,
              background: `${difficultyColor}08`,
            }}>{story.difficulty}</span>
          </div>
          <p className="text-xs" style={{ color: "#64748b" }}>
            {story.year} · {story.era}
          </p>
          <p className="text-xs mt-0.5" style={{ color: "#5a5040" }}>{story.storyTheme}</p>
        </div>

        <button
          onClick={onOpen}
          className="shrink-0 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all"
          style={{
            background: `${statusColor}12`,
            border:     `1px solid ${statusColor}35`,
            color:      statusColor,
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.background = `${statusColor}20`
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.background = `${statusColor}12`
          }}
        >
          <BookOpen className="h-3 w-3" />
          {story.status === "IN_PROGRESS" ? "Continuer" : "Relire"}
        </button>
      </div>
    </motion.div>
  )
}
