"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { BookOpen, ChevronDown, ChevronUp, Clock, CheckCircle2 } from "lucide-react"
import Link from "next/link"

interface StorySegment {
  index: number
  title: string
  text:  string
  hook?: string
}

interface StoryProgress {
  storyId:          string
  storyTitle:       string
  storyIcon:        string
  theme:            string
  status:           "IN_PROGRESS" | "COMPLETED"
  unlockedSegments: number
  totalSegments:    number
  startedAt:        string
  completedAt:      string | null
  segments:         StorySegment[]
}

interface Stats {
  totalStories:  number
  discovered:    number
  inProgress:    number
  completed:     number
  totalSegments: number
}

export default function ChronolithesPage() {
  const [stories, setStories]           = useState<StoryProgress[]>([])
  const [stats, setStats]               = useState<Stats | null>(null)
  const [loading, setLoading]           = useState(true)
  const [expandedStory, setExpandedStory] = useState<string | null>(null)

  const fetchStories = useCallback(async () => {
    try {
      const res  = await fetch("/api/game/chronolithe")
      const data = await res.json()
      setStories(data.stories ?? [])
      setStats(data.stats   ?? null)
    } catch { /* ignore */ } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchStories() }, [fetchStories])

  const activeStories    = stories.filter((s) => s.status === "IN_PROGRESS")
  const completedStories = stories.filter((s) => s.status === "COMPLETED")

  return (
    <div className="min-h-screen pt-20 pb-16 px-4" style={{ background: "linear-gradient(180deg, #0a0613 0%, #0f0c1d 100%)" }}>
      <div className="max-w-2xl mx-auto space-y-8">

        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <motion.div
            className="text-5xl mx-auto"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
            🪨
          </motion.div>
          <h1 className="text-2xl font-black tracking-wide"
            style={{ color: "#e2e8f0", textShadow: "0 0 30px rgba(103,232,249,0.3)" }}>
            Chronolithes
          </h1>
          <p className="text-sm" style={{ color: "#64748b" }}>
            Les échos du passé gravés dans vos reliques
          </p>

          {stats && (
            <div className="flex items-center justify-center gap-6 pt-2">
              <Stat label="Découvertes"   value={`${stats.discovered}/${stats.totalStories}`} />
              <Stat label="En cours"      value={stats.inProgress}  color="#67e8f9" />
              <Stat label="Complètes"     value={stats.completed}   color="#fbbf24" />
              <Stat label="Segments lus"  value={stats.totalSegments} />
            </div>
          )}
        </motion.div>

        {/* ── Loading ──────────────────────────────────────────────────────── */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <motion.div
              className="w-8 h-8 rounded-full border-2"
              style={{ borderColor: "rgba(103,232,249,0.3)", borderTopColor: "#67e8f9" }}
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </div>
        )}

        {/* ── Empty state ──────────────────────────────────────────────────── */}
        {!loading && stories.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 space-y-4"
          >
            <p className="text-4xl">🪨</p>
            <p className="text-base font-bold" style={{ color: "#94a3b8" }}>
              Aucun Chronolithe découvert
            </p>
            <p className="text-sm" style={{ color: "#64748b" }}>
              Continuez à capturer des reliques — les pierres-mémoires apparaissent parfois lors de vos captures.
            </p>
            <Link href="/play"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold"
              style={{ background: "rgba(103,232,249,0.1)", border: "1px solid rgba(103,232,249,0.3)", color: "#67e8f9" }}>
              <Clock className="h-4 w-4" /> Aller capturer
            </Link>
          </motion.div>
        )}

        {/* ── Active stories ───────────────────────────────────────────────── */}
        {!loading && activeStories.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: "#67e8f9" }}>
              Histoires en cours · {activeStories.length}/3
            </h2>
            {activeStories.map((story, i) => (
              <StoryCard
                key={story.storyId}
                story={story}
                index={i}
                expanded={expandedStory === story.storyId}
                onToggle={() => setExpandedStory(expandedStory === story.storyId ? null : story.storyId)}
                glowColor="rgba(103,232,249,0.25)"
                borderColor="rgba(103,232,249,0.35)"
              />
            ))}
          </section>
        )}

        {/* ── Completed stories ────────────────────────────────────────────── */}
        {!loading && completedStories.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: "#fbbf24" }}>
              Histoires complètes · {completedStories.length}
            </h2>
            {completedStories.map((story, i) => (
              <StoryCard
                key={story.storyId}
                story={story}
                index={i}
                expanded={expandedStory === story.storyId}
                onToggle={() => setExpandedStory(expandedStory === story.storyId ? null : story.storyId)}
                glowColor="rgba(234,179,8,0.15)"
                borderColor="rgba(234,179,8,0.35)"
              />
            ))}
          </section>
        )}

      </div>
    </div>
  )
}

// ── Stat badge ──────────────────────────────────────────────────────────────
function Stat({ label, value, color = "#94a3b8" }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="text-center">
      <p className="text-base font-black" style={{ color }}>{value}</p>
      <p className="text-xs" style={{ color: "#64748b" }}>{label}</p>
    </div>
  )
}

// ── Story card ──────────────────────────────────────────────────────────────
function StoryCard({
  story, index, expanded, onToggle, glowColor, borderColor,
}: {
  story: StoryProgress
  index: number
  expanded: boolean
  onToggle: () => void
  glowColor: string
  borderColor: string
}) {
  const progressPct = (story.unlockedSegments / story.totalSegments) * 100

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="rounded-xl overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #0d1b2a 0%, #1a2744 100%)",
        border:     `1px solid ${borderColor}`,
        boxShadow:  `0 0 20px ${glowColor}`,
      }}
    >
      {/* Card header — always visible */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-white/5 transition-colors"
      >
        <span className="text-2xl shrink-0">{story.storyIcon}</span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-bold text-sm truncate" style={{ color: "#e2e8f0" }}>
              {story.storyTitle}
            </p>
            {story.status === "COMPLETED" && (
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" style={{ color: "#fbbf24" }} />
            )}
          </div>
          <p className="text-xs" style={{ color: "#64748b" }}>{story.theme}</p>

          {/* Progress bar */}
          <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width:      `${progressPct}%`,
                background: story.status === "COMPLETED"
                  ? "linear-gradient(90deg, #d97706, #fbbf24)"
                  : "linear-gradient(90deg, #0891b2, #67e8f9)",
              }}
            />
          </div>
          <p className="text-xs mt-1" style={{ color: "#64748b" }}>
            {story.unlockedSegments}/{story.totalSegments} parties
          </p>
        </div>

        <div className="shrink-0" style={{ color: "#64748b" }}>
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>

      {/* Expanded reader */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            key="reader"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-6 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              <div className="pt-4 flex items-center gap-2">
                <BookOpen className="h-3.5 w-3.5" style={{ color: "#67e8f9" }} />
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "#67e8f9" }}>
                  Lecture
                </span>
              </div>

              {story.segments.map((seg, i) => (
                <SegmentBlock
                  key={seg.index}
                  segment={seg}
                  index={i}
                  isLast={i === story.segments.length - 1}
                  isLastUnlocked={seg.index === story.unlockedSegments}
                  storyCompleted={story.status === "COMPLETED"}
                />
              ))}

              {story.status === "IN_PROGRESS" && (
                <div className="text-center py-3 rounded-lg"
                  style={{ background: "rgba(103,232,249,0.05)", border: "1px dashed rgba(103,232,249,0.2)" }}>
                  <p className="text-xs" style={{ color: "#64748b" }}>
                    🪨 Continuez à capturer pour débloquer la suite…
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── Segment block ──────────────────────────────────────────────────────────
function SegmentBlock({
  segment, index, isLast, isLastUnlocked, storyCompleted,
}: {
  segment: StorySegment
  index: number
  isLast: boolean
  isLastUnlocked: boolean
  storyCompleted: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="space-y-3"
    >
      {/* Segment divider */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1" style={{ background: "rgba(103,232,249,0.12)" }} />
        <span className="text-xs font-bold px-2 py-0.5 rounded-full"
          style={{ background: "rgba(103,232,249,0.08)", color: "#67e8f9", border: "1px solid rgba(103,232,249,0.2)" }}>
          {segment.title}
        </span>
        <div className="h-px flex-1" style={{ background: "rgba(103,232,249,0.12)" }} />
      </div>

      {/* Segment text */}
      <p className="text-sm leading-7 whitespace-pre-wrap"
        style={{ color: "#cbd5e1", fontFamily: "Georgia, 'Times New Roman', serif", lineHeight: "1.9" }}>
        {segment.text.replace(/\*(.*?)\*/g, "$1")}
      </p>

      {/* Hook teaser */}
      {segment.hook && !isLast && (
        <p className="text-xs italic text-right pt-1"
          style={{ color: "#94a3b8", fontFamily: "Georgia, serif" }}>
          {segment.hook}
          {isLastUnlocked && !storyCompleted && (
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.8, repeat: Infinity }}>
              {" "}▌
            </motion.span>
          )}
        </p>
      )}
    </motion.div>
  )
}
