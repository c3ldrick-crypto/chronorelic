"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Clock, Plus, Trash2, Star, Shield, Zap } from "lucide-react"

interface Profile {
  name:           string
  class:          string
  level:          number
  xpTotal:        number
  blessedMinutes: string[]
}

const CLASS_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  CHRONOMANCER: { label: "Chronomancien",  icon: "⏰", color: "violet" },
  ARCHIVISTE:   { label: "Archiviste",     icon: "📚", color: "amber"  },
  CHASSEUR:     { label: "Chasseur",       icon: "⚡", color: "cyan"   },
  ORACLE:       { label: "Oracle Temporel",icon: "🔮", color: "pink"   },
}

const BLESSED_EXAMPLES = ["11:11", "22:22", "07:07", "13:37", "00:00"]

export default function ProfilePage() {
  const [profile, setProfile]   = useState<Profile | null>(null)
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [newMinute, setNewMinute] = useState("")
  const [minuteError, setMinuteError] = useState("")

  useEffect(() => {
    fetch("/api/game/profile")
      .then((r) => r.json())
      .then(setProfile)
      .catch(() => toast.error("Impossible de charger le profil"))
      .finally(() => setLoading(false))
  }, [])

  async function saveMinutes(minutes: string[]) {
    setSaving(true)
    const res  = await fetch("/api/game/profile", {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ blessedMinutes: minutes }),
    })
    const data = await res.json()
    if (!res.ok) {
      toast.error(data.error ?? "Erreur de sauvegarde")
    } else {
      setProfile((p) => p ? { ...p, blessedMinutes: data.blessedMinutes } : null)
      toast.success("Minutes bénies sauvegardées !")
    }
    setSaving(false)
  }

  function addMinute() {
    setMinuteError("")
    const trimmed = newMinute.trim()

    if (!/^\d{2}:\d{2}$/.test(trimmed)) {
      setMinuteError("Format HH:MM requis (ex : 11:11)")
      return
    }
    const [h, m] = trimmed.split(":").map(Number)
    if (h > 23 || m > 59) {
      setMinuteError("Heure invalide (00:00 → 23:59)")
      return
    }
    if (!profile) return
    if (profile.blessedMinutes.includes(trimmed)) {
      setMinuteError("Cette minute est déjà bénie")
      return
    }
    if (profile.blessedMinutes.length >= 5) {
      setMinuteError("Maximum 5 minutes bénies")
      return
    }

    const updated = [...profile.blessedMinutes, trimmed]
    setProfile({ ...profile, blessedMinutes: updated })
    saveMinutes(updated)
    setNewMinute("")
  }

  function removeMinute(minute: string) {
    if (!profile) return
    const updated = profile.blessedMinutes.filter((m) => m !== minute)
    setProfile({ ...profile, blessedMinutes: updated })
    saveMinutes(updated)
  }

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="text-4xl"
        >
          ⏳
        </motion.div>
      </div>
    )
  }

  const cls = CLASS_LABELS[profile.class] ?? { label: profile.class, icon: "🧙", color: "violet" }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="font-display text-3xl font-black text-gradient-violet mb-8">Profil du Gardien</h1>

      <div className="grid md:grid-cols-2 gap-6">
        {/* ─── Infos personnage ─── */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className="card-cosmic p-6"
        >
          <h2 className="font-bold text-[#e2e8f0] text-lg mb-5 flex items-center gap-2">
            <Shield className="h-5 w-5 text-violet-400" />
            Informations
          </h2>

          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-violet-500/20 border-2 border-violet-500/40 flex items-center justify-center text-3xl shrink-0">
              {cls.icon}
            </div>
            <div>
              <div className="font-display text-xl font-black text-[#e2e8f0]">{profile.name}</div>
              <div className={`text-sm font-semibold text-${cls.color}-400`}>{cls.label}</div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-[#1e1e42]">
              <span className="text-sm text-[#94a3b8] flex items-center gap-2">
                <Star className="h-4 w-4" /> Niveau
              </span>
              <span className="font-bold text-violet-300 text-lg">{profile.level}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[#1e1e42]">
              <span className="text-sm text-[#94a3b8] flex items-center gap-2">
                <Zap className="h-4 w-4" /> XP Total
              </span>
              <span className="font-bold text-[#e2e8f0]">{profile.xpTotal.toLocaleString("fr-FR")}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-[#94a3b8] flex items-center gap-2">
                <Clock className="h-4 w-4" /> Minutes bénies
              </span>
              <span className="font-bold text-amber-300">{profile.blessedMinutes.length}/5</span>
            </div>
          </div>
        </motion.div>

        {/* ─── Minutes bénies ─── */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          className="card-cosmic p-6"
        >
          <h2 className="font-bold text-[#e2e8f0] text-lg mb-2 flex items-center gap-2">
            ✨ Minutes Bénies
          </h2>
          <p className="text-sm text-[#94a3b8] mb-5">
            Ces minutes vous accordent <span className="text-amber-300 font-semibold">+200% XP</span> et une probabilité légendaire accrue lors d&apos;une capture.
          </p>

          {/* Liste des minutes actuelles */}
          <div className="space-y-2 mb-5 min-h-[80px]">
            <AnimatePresence>
              {profile.blessedMinutes.length === 0 ? (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-[#475569] italic"
                >
                  Aucune minute bénie configurée.
                </motion.p>
              ) : (
                profile.blessedMinutes.map((m) => (
                  <motion.div
                    key={m}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-2.5"
                  >
                    <span className="text-amber-300 text-lg shrink-0">✨</span>
                    <span className="font-mono font-black text-[#e2e8f0] text-lg tracking-widest flex-1">
                      {m}
                    </span>
                    <button
                      onClick={() => removeMinute(m)}
                      disabled={saving}
                      className="text-[#475569] hover:text-red-400 transition-colors p-1 rounded hover:bg-red-500/10"
                      title="Supprimer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>

          {/* Ajouter une minute */}
          {profile.blessedMinutes.length < 5 && (
            <div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    placeholder="HH:MM (ex : 11:11)"
                    value={newMinute}
                    onChange={(e) => {
                      setNewMinute(e.target.value)
                      setMinuteError("")
                    }}
                    onKeyDown={(e) => e.key === "Enter" && addMinute()}
                    icon={<Clock className="h-4 w-4" />}
                    error={minuteError}
                  />
                </div>
                <Button
                  onClick={addMinute}
                  disabled={saving || !newMinute}
                  loading={saving}
                  className="shrink-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Suggestions */}
              <div className="mt-3">
                <p className="text-xs text-[#475569] mb-2">Suggestions populaires :</p>
                <div className="flex flex-wrap gap-2">
                  {BLESSED_EXAMPLES
                    .filter((m) => !profile.blessedMinutes.includes(m))
                    .map((m) => (
                      <button
                        key={m}
                        onClick={() => setNewMinute(m)}
                        className="text-xs font-mono bg-[#1e1e42] text-[#94a3b8] hover:bg-amber-500/10 hover:text-amber-300 border border-[#1e1e42] hover:border-amber-500/30 rounded-lg px-3 py-1.5 transition-all"
                      >
                        {m}
                      </button>
                    ))}
                </div>
              </div>
            </div>
          )}

          {profile.blessedMinutes.length >= 5 && (
            <p className="text-xs text-amber-400/70 text-center py-2">
              Maximum atteint (5/5). Supprimez une minute pour en ajouter une autre.
            </p>
          )}
        </motion.div>
      </div>

      {/* ─── Explication ─── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-6 card-cosmic p-5"
      >
        <h3 className="font-bold text-[#e2e8f0] mb-3 flex items-center gap-2">
          <Clock className="h-4 w-4 text-violet-400" />
          Comment fonctionnent les Minutes Bénies ?
        </h3>
        <div className="grid sm:grid-cols-3 gap-4 text-sm text-[#94a3b8]">
          <div>
            <div className="text-amber-300 font-semibold mb-1">+200% XP</div>
            Multipliez par 3 vos gains d&apos;expérience lors d&apos;une capture à votre minute bénie.
          </div>
          <div>
            <div className="text-violet-300 font-semibold mb-1">Rareté accrue</div>
            Les minutes bénies augmentent la probabilité d&apos;obtenir Légendaire ou Mythique.
          </div>
          <div>
            <div className="text-pink-300 font-semibold mb-1">Alertes futures</div>
            Recevez une notification quand votre minute bénie approche (fonctionnalité à venir).
          </div>
        </div>
      </motion.div>
    </div>
  )
}
