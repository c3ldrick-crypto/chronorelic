"use client"

import { useState, useEffect } from "react"
import { HeroStory, HeroSegment } from "@/lib/game/heroRelic"

interface HeroRelicRevealProps {
  story: HeroStory
  onClose: () => void
  existingProgress?: {
    currentSegment: string
    choicesPath: string[]
    status: string
    endType?: string | null
  } | null
}

type Phase = "rift" | "era" | "narrative" | "death" | "end_historical" | "end_alternate"

export function HeroRelicReveal({ story, onClose, existingProgress }: HeroRelicRevealProps) {
  const startSegId = existingProgress?.status === "IN_PROGRESS"
    ? (existingProgress.currentSegment || story.startId)
    : story.startId

  const [phase, setPhase] = useState<Phase>("rift")
  const [currentSegId, setCurrentSegId] = useState(startSegId)
  const [choicesPath, setChoicesPath] = useState<string[]>(
    Array.isArray(existingProgress?.choicesPath) ? existingProgress.choicesPath : []
  )
  const [saving, setSaving] = useState(false)

  const currentSeg: HeroSegment | undefined = story.segments[currentSegId]

  // Auto-advance rift → era → narrative
  useEffect(() => {
    if (phase === "rift") {
      const t = setTimeout(() => setPhase("era"), 1500)
      return () => clearTimeout(t)
    }
    if (phase === "era") {
      const t = setTimeout(() => setPhase("narrative"), 2000)
      return () => clearTimeout(t)
    }
  }, [phase])

  // Sync phase with segment type when currentSeg changes
  useEffect(() => {
    if (!currentSeg) return
    if (phase === "rift" || phase === "era") return
    if (currentSeg.type === "death") setPhase("death")
    else if (currentSeg.type === "end_historical") setPhase("end_historical")
    else if (currentSeg.type === "end_alternate") setPhase("end_alternate")
    else setPhase("narrative")
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSegId])

  async function saveProgress(segId: string, choices: string[], status: string, endType?: string) {
    setSaving(true)
    try {
      await fetch("/api/game/hero-relic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storyId: story.id,
          currentSegment: segId,
          choicesPath: choices,
          status,
          endType: endType ?? null,
        }),
      })
    } catch { /* silently ignore */ } finally {
      setSaving(false)
    }
  }

  function handleChoice(choiceId: string, nextId: string) {
    const newChoices = [...choicesPath, choiceId]
    setChoicesPath(newChoices)
    const nextSeg = story.segments[nextId]
    if (!nextSeg) return

    setCurrentSegId(nextId)

    if (nextSeg.type === "death") {
      setPhase("death")
      saveProgress(nextId, newChoices, "DEAD")
    } else if (nextSeg.type === "end_historical") {
      setPhase("end_historical")
      saveProgress(nextId, newChoices, "COMPLETED", "HISTORICAL")
    } else if (nextSeg.type === "end_alternate") {
      setPhase("end_alternate")
      saveProgress(nextId, newChoices, "COMPLETED", "ALTERNATE")
    } else {
      setPhase("narrative")
      saveProgress(nextId, newChoices, "IN_PROGRESS")
    }
  }

  // ── PHASE RIFT ──────────────────────────────────────────────────
  if (phase === "rift") {
    return (
      <div style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "#000", display: "flex", alignItems: "center", justifyContent: "center",
        flexDirection: "column", gap: 16,
      }}>
        <div style={{
          width: "60vw", height: 2, background: "linear-gradient(90deg, transparent, #d4a017, #fff, #d4a017, transparent)",
          animation: "rift-expand 1.5s ease-out forwards",
          boxShadow: "0 0 30px rgba(212,160,23,0.8)",
        }} />
        <style>{`
          @keyframes rift-expand {
            0%   { width: 0; opacity: 0 }
            50%  { width: 60vw; opacity: 1 }
            100% { width: 80vw; opacity: 1 }
          }
        `}</style>
      </div>
    )
  }

  // ── PHASE ERA ───────────────────────────────────────────────────
  if (phase === "era") {
    return (
      <div style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "radial-gradient(ellipse at center, #2a1a00 0%, #0a0800 100%)",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexDirection: "column", gap: 24, animation: "fade-in 0.5s ease",
      }}>
        <style>{`@keyframes fade-in { from { opacity:0 } to { opacity:1 } }`}</style>
        <div style={{
          fontFamily: "monospace", fontSize: "clamp(1.5rem, 4vw, 3rem)",
          fontWeight: 900, color: "#d4a017", letterSpacing: "0.2em",
          textShadow: "0 0 30px rgba(212,160,23,0.6)",
          animation: "fade-in 1s ease 0.3s both",
        }}>{story.year}</div>
        <div style={{
          fontFamily: "monospace", fontSize: "clamp(0.9rem, 2vw, 1.3rem)",
          color: "#a07830", letterSpacing: "0.1em", textAlign: "center",
          animation: "fade-in 1s ease 0.8s both",
        }}>{story.era}</div>
        <div style={{
          fontSize: "3rem", animation: "fade-in 1s ease 1.2s both",
        }}>{story.icon}</div>
      </div>
    )
  }

  // ── PHASE NARRATIVE ─────────────────────────────────────────────
  if (phase === "narrative" && currentSeg) {
    return (
      <div style={{
        position: "fixed", inset: 0, zIndex: 200, overflowY: "auto",
        background: "#0d0b07",
        backgroundImage: "radial-gradient(ellipse at top left, rgba(40,25,0,0.8) 0%, transparent 60%), radial-gradient(ellipse at bottom right, rgba(30,15,5,0.6) 0%, transparent 60%)",
      }}>
        {/* Header */}
        <div style={{
          position: "sticky", top: 0, zIndex: 10,
          background: "rgba(13,11,7,0.95)", backdropFilter: "blur(8px)",
          borderBottom: "1px solid rgba(212,160,23,0.2)",
          padding: "12px 20px", display: "flex", alignItems: "center", gap: 12,
        }}>
          <span style={{ fontSize: "1.2rem" }}>{story.icon}</span>
          <div>
            <div style={{ color: "#d4a017", fontSize: "0.75rem", letterSpacing: "0.1em", fontFamily: "monospace" }}>
              {story.year} — {story.difficulty}
            </div>
            <div style={{ color: "#e8d5a0", fontSize: "0.9rem", fontWeight: 600 }}>
              {story.title}
            </div>
          </div>
          <button onClick={onClose} style={{
            marginLeft: "auto", background: "transparent", border: "none",
            color: "#6b5a3a", cursor: "pointer", fontSize: "1.2rem", padding: "4px 8px",
          }}>✕</button>
        </div>

        {/* Content */}
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "32px 20px 40px" }}>
          {/* Segment title */}
          <div style={{
            color: "#d4a017", fontSize: "0.7rem", letterSpacing: "0.2em",
            fontFamily: "monospace", textTransform: "uppercase", marginBottom: 8,
            opacity: 0.8,
          }}>— {currentSeg.title} —</div>

          {/* Separator */}
          <div style={{
            height: 1, background: "linear-gradient(90deg, transparent, rgba(212,160,23,0.4), transparent)",
            marginBottom: 24,
          }} />

          {/* Narrative text */}
          <div style={{
            color: "#d4c49a", fontSize: "1rem", lineHeight: 1.8,
            fontFamily: "Georgia, serif", whiteSpace: "pre-line", marginBottom: 40,
          }}>
            {currentSeg.text}
          </div>

          {/* Choices */}
          {currentSeg.choices && currentSeg.choices.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{
                color: "#8a7050", fontSize: "0.7rem", letterSpacing: "0.15em",
                fontFamily: "monospace", textTransform: "uppercase", marginBottom: 4,
              }}>— Vous décidez de... —</div>
              {currentSeg.choices.map((choice) => (
                <button
                  key={choice.id}
                  onClick={() => handleChoice(choice.id, choice.nextId)}
                  disabled={saving}
                  style={{
                    background: choice.isHistorical
                      ? "rgba(212,160,23,0.06)"
                      : "rgba(124,58,237,0.06)",
                    border: `1px solid ${choice.isHistorical ? "rgba(212,160,23,0.35)" : "rgba(124,58,237,0.35)"}`,
                    borderRadius: 8, padding: "16px 20px", textAlign: "left", cursor: "pointer",
                    transition: "all 0.2s", color: "#e8d5a0",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = choice.isHistorical
                      ? "rgba(212,160,23,0.12)" : "rgba(124,58,237,0.12)"
                    ;(e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)"
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = choice.isHistorical
                      ? "rgba(212,160,23,0.06)" : "rgba(124,58,237,0.06)"
                    ;(e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <span style={{ fontSize: "1rem" }}>
                      {choice.isHistorical ? "⚖️" : "🌀"}
                    </span>
                    <span style={{
                      fontWeight: 700, fontSize: "0.9rem",
                      color: choice.isHistorical ? "#d4a017" : "#a78bfa",
                    }}>
                      {choice.label}
                    </span>
                    {choice.isHistorical && (
                      <span style={{
                        marginLeft: "auto", fontSize: "0.6rem", color: "#8a7050",
                        border: "1px solid rgba(212,160,23,0.3)", borderRadius: 4,
                        padding: "2px 6px", letterSpacing: "0.1em",
                      }}>RÉEL</span>
                    )}
                  </div>
                  <div style={{ color: "#a09070", fontSize: "0.8rem", lineHeight: 1.5 }}>
                    {choice.text}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // ── PHASE DEATH ─────────────────────────────────────────────────
  if (phase === "death" && currentSeg) {
    return (
      <div style={{
        position: "fixed", inset: 0, zIndex: 200, overflowY: "auto",
        background: "radial-gradient(ellipse at center, #1a0000 0%, #050000 100%)",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexDirection: "column", padding: "40px 20px", gap: 24,
      }}>
        <div style={{
          fontSize: "1.1rem", letterSpacing: "0.4em", color: "#ff4444",
          fontFamily: "monospace", animation: "death-blink 1.5s ease-in-out infinite",
        }}>⚠ PARADOXE TEMPOREL ⚠</div>
        <style>{`@keyframes death-blink { 0%,100% { opacity:1 } 50% { opacity:0.4 } }`}</style>

        <div style={{
          color: "#cc2222", fontSize: "clamp(1.2rem, 3vw, 1.8rem)",
          fontWeight: 900, textAlign: "center", fontFamily: "monospace",
          maxWidth: 480, lineHeight: 1.4,
        }}>{currentSeg.title}</div>

        <div style={{
          maxWidth: 560, background: "rgba(180,0,0,0.08)",
          border: "1px solid rgba(255,68,68,0.2)", borderRadius: 12,
          padding: "24px", color: "#e88888", fontSize: "0.95rem",
          lineHeight: 1.8, fontFamily: "Georgia, serif", textAlign: "center",
          whiteSpace: "pre-line",
        }}>{currentSeg.text}</div>

        {currentSeg.note && (
          <div style={{
            maxWidth: 480, color: "#884444", fontSize: "0.8rem",
            lineHeight: 1.6, textAlign: "center", fontStyle: "italic",
          }}>{currentSeg.note}</div>
        )}

        <button onClick={onClose} style={{
          marginTop: 16, background: "rgba(180,0,0,0.2)",
          border: "1px solid rgba(255,68,68,0.4)", borderRadius: 8,
          padding: "12px 32px", color: "#ff6666", cursor: "pointer",
          fontSize: "0.9rem", letterSpacing: "0.1em", fontFamily: "monospace",
        }}>Revenir à la ligne temporelle</button>
      </div>
    )
  }

  // ── PHASE END HISTORICAL ────────────────────────────────────────
  if (phase === "end_historical" && currentSeg) {
    return (
      <div style={{
        position: "fixed", inset: 0, zIndex: 200, overflowY: "auto",
        background: "radial-gradient(ellipse at center, #1a1400 0%, #080600 100%)",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexDirection: "column", padding: "40px 20px", gap: 24,
      }}>
        <div style={{
          fontSize: "2.5rem", animation: "seal-spin 2s ease-out",
        }}>🏛️</div>
        <style>{`@keyframes seal-spin { 0% { transform: rotate(-180deg) scale(0); opacity:0 } 100% { transform: rotate(0) scale(1); opacity:1 } }`}</style>

        <div style={{
          color: "#d4a017", fontSize: "0.7rem", letterSpacing: "0.4em",
          fontFamily: "monospace", textTransform: "uppercase",
        }}>Gardien du Temps</div>

        <div style={{
          color: "#e8c96a", fontSize: "clamp(1.1rem, 2.5vw, 1.5rem)",
          fontWeight: 900, textAlign: "center", fontFamily: "monospace",
          maxWidth: 480, lineHeight: 1.4,
        }}>{currentSeg.title}</div>

        <div style={{
          maxWidth: 560, background: "rgba(212,160,23,0.05)",
          border: "1px solid rgba(212,160,23,0.25)", borderRadius: 12,
          padding: "24px", color: "#c8a85a", fontSize: "0.95rem",
          lineHeight: 1.8, fontFamily: "Georgia, serif", textAlign: "center",
          whiteSpace: "pre-line",
        }}>{currentSeg.text}</div>

        {currentSeg.note && (
          <div style={{
            maxWidth: 480, color: "#8a7030", fontSize: "0.8rem",
            lineHeight: 1.6, textAlign: "center", fontStyle: "italic",
            padding: "12px 16px", borderLeft: "2px solid rgba(212,160,23,0.3)",
          }}>{currentSeg.note}</div>
        )}

        <div style={{
          color: "#6a5020", fontSize: "0.75rem", letterSpacing: "0.1em",
          fontFamily: "monospace",
        }}>Vous avez préservé la ligne temporelle réelle</div>

        <button onClick={onClose} style={{
          marginTop: 16, background: "rgba(212,160,23,0.15)",
          border: "1px solid rgba(212,160,23,0.4)", borderRadius: 8,
          padding: "12px 32px", color: "#d4a017", cursor: "pointer",
          fontSize: "0.9rem", letterSpacing: "0.1em", fontFamily: "monospace",
        }}>Fermer le parchemin</button>
      </div>
    )
  }

  // ── PHASE END ALTERNATE ─────────────────────────────────────────
  if (phase === "end_alternate" && currentSeg) {
    return (
      <div style={{
        position: "fixed", inset: 0, zIndex: 200, overflowY: "auto",
        background: "radial-gradient(ellipse at center, #0f0a1a 0%, #030108 100%)",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexDirection: "column", padding: "40px 20px", gap: 24,
      }}>
        <div style={{
          fontSize: "2.5rem", animation: "aurora-appear 1.5s ease-out",
        }}>🌀</div>
        <style>{`@keyframes aurora-appear { 0% { transform: scale(0) rotate(180deg); opacity:0 } 100% { transform: scale(1) rotate(0); opacity:1 } }`}</style>

        <div style={{
          color: "#a78bfa", fontSize: "0.7rem", letterSpacing: "0.4em",
          fontFamily: "monospace", textTransform: "uppercase",
        }}>Maître du Temps</div>

        <div style={{
          color: "#c4b5fd", fontSize: "clamp(1.1rem, 2.5vw, 1.5rem)",
          fontWeight: 900, textAlign: "center", fontFamily: "monospace",
          maxWidth: 480, lineHeight: 1.4,
        }}>{currentSeg.title}</div>

        <div style={{
          maxWidth: 560, background: "rgba(124,58,237,0.06)",
          border: "1px solid rgba(124,58,237,0.25)", borderRadius: 12,
          padding: "24px", color: "#c4b5fd", fontSize: "0.95rem",
          lineHeight: 1.8, fontFamily: "Georgia, serif", textAlign: "center",
          whiteSpace: "pre-line",
        }}>{currentSeg.text}</div>

        {currentSeg.note && (
          <div style={{
            maxWidth: 480, color: "#7c6aaa", fontSize: "0.8rem",
            lineHeight: 1.6, textAlign: "center", fontStyle: "italic",
            padding: "12px 16px", borderLeft: "2px solid rgba(124,58,237,0.3)",
          }}>{currentSeg.note}</div>
        )}

        <div style={{
          color: "#5a4a8a", fontSize: "0.75rem", letterSpacing: "0.1em",
          fontFamily: "monospace",
        }}>Vous avez réécrit le cours de l&apos;Histoire</div>

        <button onClick={onClose} style={{
          marginTop: 16, background: "rgba(124,58,237,0.15)",
          border: "1px solid rgba(124,58,237,0.4)", borderRadius: 8,
          padding: "12px 32px", color: "#a78bfa", cursor: "pointer",
          fontSize: "0.9rem", letterSpacing: "0.1em", fontFamily: "monospace",
        }}>Fermer le parchemin</button>
      </div>
    )
  }

  return null
}
