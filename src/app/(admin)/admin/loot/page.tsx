"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  FlaskConical, RotateCcw, Save, CheckCircle2, AlertTriangle,
  ChevronDown, Zap, BookOpen, Star, ToggleLeft, ToggleRight,
  Sword, RefreshCw,
} from "lucide-react"
import type { TestConfig } from "@/lib/testConfig"
import { DEFAULT_TEST_CONFIG } from "@/lib/testConfig"

// ── Rarités disponibles ────────────────────────────────────────────────────────
const RARITIES = [
  { value: null,         label: "Tirage normal (aléatoire)", color: "#64748b" },
  { value: "COMMUNE",    label: "Commune",                   color: "#94a3b8" },
  { value: "RARE",       label: "Rare",                      color: "#60a5fa" },
  { value: "EPIQUE",     label: "Épique",                    color: "#a78bfa" },
  { value: "LEGENDAIRE", label: "Légendaire",                color: "#fbbf24" },
  { value: "MYTHIQUE",   label: "Mythique",                  color: "#f472b6" },
] as const

// ── Liste des 5 histoires Kairos ──────────────────────────────────────────────
const KAIROS_STORIES = [
  { id: "hero_01", icon: "🔫", title: "L'Erreur du Chauffeur",  year: "1914", difficulty: "STANDARD"  },
  { id: "hero_02", icon: "🧱", title: "La Nuit du Mur",         year: "1989", difficulty: "STANDARD"  },
  { id: "hero_03", icon: "🌕", title: "Tranquility Base",       year: "1969", difficulty: "STANDARD"  },
  { id: "hero_04", icon: "🗡️", title: "Les Ides de Mars",       year: "44 av. J.-C.", difficulty: "COMPLEXE"  },
  { id: "hero_05", icon: "💼", title: "La Valise",              year: "1944", difficulty: "COMPLEXE"  },
]

// ── Liste des 20 histoires Chronolithe ────────────────────────────────────────
const STORIES = [
  { id: "chrono_01", icon: "⌛", title: "Le Sablier Brisé" },
  { id: "chrono_02", icon: "🧊", title: "La Mémoire du Glacier" },
  { id: "chrono_03", icon: "🌋", title: "L'Heure Immobile de Pompéi" },
  { id: "chrono_04", icon: "🧭", title: "Le Dernier Méridien" },
  { id: "chrono_05", icon: "🪖", title: "L'Horloge de la Tranchée" },
  { id: "chrono_06", icon: "🌑", title: "L'Éclipse Qui Arrêta une Guerre" },
  { id: "chrono_07", icon: "📜", title: "La Bibliothèque Sans Fin" },
  { id: "chrono_08", icon: "🦬", title: "Vingt Mille Ans de Nuit" },
  { id: "chrono_09", icon: "⭐", title: "Le Navigateur des Étoiles Mortes" },
  { id: "chrono_10", icon: "🔔", title: "La Cloche de Minuit" },
  { id: "chrono_11", icon: "🚂", title: "Le Train de 3h17" },
  { id: "chrono_12", icon: "🔬", title: "La Seconde Perdue de 1972" },
  { id: "chrono_13", icon: "📡", title: "Le Signal de Wow!" },
  { id: "chrono_14", icon: "🏛️", title: "Les Heures Volées de la Révolution" },
  { id: "chrono_15", icon: "🌐", title: "L'Instant Zéro d'Internet" },
  { id: "chrono_16", icon: "🎭", title: "Le Théâtre du Temps Suspendu" },
  { id: "chrono_17", icon: "🧬", title: "L'ADN du Temps" },
  { id: "chrono_18", icon: "🌊", title: "Le Raz-de-marée Silencieux" },
  { id: "chrono_19", icon: "🎵", title: "La Partition Inachevée" },
  { id: "chrono_20", icon: "💫", title: "L'Étoile Que Nous N'Avons Pas Vue Mourir" },
]

// ── Composants UI ─────────────────────────────────────────────────────────────

function Section({ title, icon: Icon, children, accent = "#00c8ff" }: {
  title: string
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>
  children: React.ReactNode
  accent?: string
}) {
  return (
    <div className="rounded-2xl p-6 space-y-4"
      style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}>
      <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest"
        style={{ color: accent }}>
        <Icon className="h-4 w-4" style={{ color: accent }} />
        {title}
      </h2>
      {children}
    </div>
  )
}

function Toggle({ checked, onChange, label, description }: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
  description?: string
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="flex items-center justify-between w-full group"
    >
      <div className="text-left">
        <p className="text-sm font-semibold" style={{ color: "#e2e8f0" }}>{label}</p>
        {description && <p className="text-xs mt-0.5" style={{ color: "#475569" }}>{description}</p>}
      </div>
      <motion.div
        animate={{ backgroundColor: checked ? "rgba(0,200,255,0.2)" : "rgba(255,255,255,0.05)" }}
        className="ml-4 shrink-0 rounded-full p-0.5"
        style={{ border: `1px solid ${checked ? "rgba(0,200,255,0.4)" : "rgba(255,255,255,0.1)"}` }}>
        {checked
          ? <ToggleRight className="h-6 w-6" style={{ color: "#00c8ff" }} />
          : <ToggleLeft  className="h-6 w-6" style={{ color: "#475569" }} />
        }
      </motion.div>
    </button>
  )
}

function Select<T extends string | null>({ value, onChange, options, placeholder }: {
  value: T
  onChange: (v: T) => void
  options: { value: T; label: string; color?: string }[]
  placeholder?: string
}) {
  const [open, setOpen] = useState(false)
  const current = options.find(o => o.value === value)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm transition-all"
        style={{
          background: "rgba(255,255,255,0.04)",
          border:     "1px solid rgba(255,255,255,0.1)",
          color:      current?.color ?? "#e2e8f0",
        }}>
        <span className="font-semibold">{current?.label ?? placeholder ?? "Choisir…"}</span>
        <ChevronDown className="h-4 w-4 shrink-0 ml-2" style={{ color: "#475569" }} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            className="absolute left-0 right-0 top-full mt-1 rounded-xl overflow-hidden z-10"
            style={{
              background:  "linear-gradient(180deg, #0d1b2a 0%, #0b1520 100%)",
              border:      "1px solid rgba(255,255,255,0.1)",
              boxShadow:   "0 8px 32px rgba(0,0,0,0.6)",
              maxHeight:   "240px",
              overflowY:   "auto",
            }}>
            {options.map((opt) => (
              <button
                key={String(opt.value)}
                onClick={() => { onChange(opt.value); setOpen(false) }}
                className="w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-white/5"
                style={{ color: opt.color ?? "#e2e8f0" }}>
                {opt.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Input({ value, onChange, placeholder, type = "text" }: {
  value: string | number
  onChange: (v: string) => void
  placeholder?: string
  type?: string
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
      style={{
        background:  "rgba(255,255,255,0.04)",
        border:      "1px solid rgba(255,255,255,0.1)",
        color:       "#e2e8f0",
      }}
    />
  )
}

// ── Page principale ────────────────────────────────────────────────────────────

export default function LootLabPage() {
  const [cfg, setCfg]         = useState<TestConfig>({ ...DEFAULT_TEST_CONFIG })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [saved, setSaved]     = useState(false)
  const [error, setError]     = useState<string | null>(null)

  // Chargement initial
  useEffect(() => {
    fetch("/api/admin/test-config")
      .then(r => r.json())
      .then((data: TestConfig) => { setCfg(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const patch = useCallback((partial: Partial<TestConfig>) => {
    setCfg(prev => ({ ...prev, ...partial }))
    setSaved(false)
  }, [])

  const handleSave = useCallback(async () => {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch("/api/admin/test-config", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(cfg),
      })
      if (!res.ok) throw new Error("Erreur serveur")
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erreur inconnue")
    } finally {
      setSaving(false)
    }
  }, [cfg])

  const handleReset = useCallback(async () => {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch("/api/admin/test-config", { method: "DELETE" })
      if (!res.ok) throw new Error("Erreur serveur")
      const data = await res.json() as TestConfig
      setCfg(data)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erreur inconnue")
    } finally {
      setSaving(false)
    }
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div
          className="w-8 h-8 rounded-full border-2"
          style={{ borderColor: "rgba(0,200,255,0.3)", borderTopColor: "#00c8ff" }}
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
        />
      </div>
    )
  }

  const isTestActive = cfg.active
  const raritySelected = RARITIES.find(r => r.value === cfg.forceRarity)

  return (
    <div className="p-8 max-w-3xl">

      {/* ── En-tête ── */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-black tracking-wide" style={{ color: "#e2e8f0" }}>
            <FlaskConical className="h-7 w-7" style={{ color: "#00c8ff" }} />
            Loot Lab
          </h1>
          <p className="text-sm mt-1" style={{ color: "#475569" }}>
            Configurez le comportement des captures sans modifier le code
          </p>
        </div>

        {/* Statut actif */}
        <motion.div
          animate={{
            background:  isTestActive ? "rgba(0,200,255,0.1)"   : "rgba(255,255,255,0.04)",
            borderColor: isTestActive ? "rgba(0,200,255,0.35)"  : "rgba(255,255,255,0.1)",
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-bold"
          style={{ color: isTestActive ? "#00c8ff" : "#475569" }}>
          <motion.div
            className="w-2 h-2 rounded-full"
            animate={{ backgroundColor: isTestActive ? "#00c8ff" : "#475569" }}
            style={isTestActive ? { boxShadow: "0 0 8px #00c8ff" } : {}}
          />
          {isTestActive ? "MODE TEST ACTIF" : "Mode normal"}
        </motion.div>
      </div>

      <div className="space-y-4">

        {/* ── Activation globale ── */}
        <Section title="Activation" icon={Zap} accent="#00c8ff">
          <Toggle
            checked={cfg.active}
            onChange={v => patch({ active: v })}
            label="Activer le mode test"
            description="Quand activé, les paramètres ci-dessous remplacent la logique normale de capture."
          />
        </Section>

        {/* ── Rareté ── */}
        <Section title="Rareté forcée" icon={Star} accent="#fbbf24">
          <p className="text-xs" style={{ color: "#475569" }}>
            Remplace le tirage aléatoire par une rareté fixe. Sans effet si le mode test est désactivé.
          </p>
          <Select<string | null>
            value={cfg.forceRarity}
            onChange={v => patch({ forceRarity: v as TestConfig["forceRarity"] })}
            options={RARITIES.map(r => ({ value: r.value, label: r.label, color: r.color }))}
          />
          {raritySelected && raritySelected.value !== null && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="text-xs rounded-lg px-3 py-2"
              style={{
                background: `${raritySelected.color}12`,
                border:     `1px solid ${raritySelected.color}33`,
                color:      raritySelected.color,
              }}>
              Toutes les captures seront forcées en <strong>{raritySelected.label}</strong>
            </motion.div>
          )}
        </Section>

        {/* ── Événement historique ── */}
        <Section title="Événement historique" icon={BookOpen} accent="#a78bfa">
          <Toggle
            checked={cfg.forceEvent}
            onChange={v => patch({ forceEvent: v })}
            label="Forcer un événement historique"
            description="Injecte un événement fictif ou réel dans chaque capture."
          />
          <AnimatePresence>
            {cfg.forceEvent && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3 overflow-hidden">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider" style={{ color: "#64748b" }}>
                    Titre
                  </label>
                  <Input
                    value={cfg.eventTitle}
                    onChange={v => patch({ eventTitle: v })}
                    placeholder="Ex : Netflix révolutionne le streaming"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider" style={{ color: "#64748b" }}>
                    Année
                  </label>
                  <Input
                    type="number"
                    value={cfg.eventYear}
                    onChange={v => patch({ eventYear: parseInt(v) || 2000 })}
                    placeholder="2007"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider" style={{ color: "#64748b" }}>
                    Description
                  </label>
                  <Input
                    value={cfg.eventDescription}
                    onChange={v => patch({ eventDescription: v })}
                    placeholder="Description courte de l'événement…"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider" style={{ color: "#64748b" }}>
                    Curiosité (anecdote)
                  </label>
                  <Input
                    value={cfg.eventCuriosity}
                    onChange={v => patch({ eventCuriosity: v })}
                    placeholder="Fait peu connu sur cet événement…"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Section>

        {/* ── Chronolithe ── */}
        <Section title="Chronolithe forcé" icon={FlaskConical} accent="#67e8f9">
          <Toggle
            checked={cfg.forceChronolithe}
            onChange={v => patch({ forceChronolithe: v })}
            label="Forcer un drop Chronolithe"
            description="Déclenche systématiquement l'animation de révélation (Partie I, sans écriture DB)."
          />
          <AnimatePresence>
            {cfg.forceChronolithe && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2 overflow-hidden">
                <label className="text-xs font-bold uppercase tracking-wider" style={{ color: "#64748b" }}>
                  Histoire à révéler
                </label>
                <Select<string | null>
                  value={cfg.chronolitheStoryId}
                  onChange={v => patch({ chronolitheStoryId: v })}
                  options={[
                    { value: null, label: "Aléatoire (chrono_01 par défaut)", color: "#64748b" },
                    ...STORIES.map(s => ({ value: s.id, label: `${s.icon}  ${s.title}`, color: "#67e8f9" })),
                  ]}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </Section>

        {/* ── Kairos ── */}
        <Section title="Relique Kairos forcée" icon={Sword} accent="#d4a017">
          <Toggle
            checked={cfg.forceKairos ?? false}
            onChange={v => patch({ forceKairos: v })}
            label="Forcer un drop Kairos"
            description="Déclenche systématiquement la révélation d'une Relique Kairos (sans écriture DB — test uniquement)."
          />
          <AnimatePresence>
            {cfg.forceKairos && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2 overflow-hidden">
                <label className="text-xs font-bold uppercase tracking-wider" style={{ color: "#64748b" }}>
                  Histoire à révéler
                </label>
                <Select<string | null>
                  value={cfg.kairosStoryId ?? null}
                  onChange={v => patch({ kairosStoryId: v })}
                  options={[
                    { value: null, label: "Aléatoire", color: "#64748b" },
                    ...KAIROS_STORIES.map(s => ({
                      value: s.id,
                      label: `${s.icon}  ${s.title} (${s.year}) — ${s.difficulty}`,
                      color: s.difficulty === "COMPLEXE" ? "#f59e0b" : "#d4a017",
                    })),
                  ]}
                />
                <p className="text-xs" style={{ color: "#4a3a20" }}>
                  COMPLEXE = mort possible (PARADOXE TEMPOREL) · STANDARD = fins multiples uniquement
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </Section>

        {/* ── Capture — bypass minute ── */}
        <Section title="Paramètres de capture" icon={RefreshCw} accent="#94a3b8">
          <Toggle
            checked={cfg.bypassMinuteUniqueness ?? false}
            onChange={v => patch({ bypassMinuteUniqueness: v })}
            label="Capturer la même minute plusieurs fois"
            description="Désactive la contrainte d'unicité par minute. Permet de rejouer la même minute indéfiniment pour tester."
          />
          {cfg.bypassMinuteUniqueness && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs rounded-lg px-3 py-2"
              style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}>
              ⚠️ Mode bypass actif — chaque capture crée une nouvelle relique même si la minute est déjà prise. À désactiver après vos tests.
            </motion.div>
          )}
        </Section>

        {/* ── Récap actif ── */}
        {isTestActive && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-5 space-y-2"
            style={{ background: "rgba(0,200,255,0.05)", border: "1px solid rgba(0,200,255,0.2)" }}>
            <p className="text-xs font-black uppercase tracking-widest" style={{ color: "#00c8ff" }}>
              ⚡ Config active — résumé
            </p>
            <ul className="space-y-1 text-xs" style={{ color: "#94a3b8" }}>
              <li>
                <span style={{ color: "#64748b" }}>Rareté :</span>{" "}
                <span style={{ color: raritySelected?.color ?? "#e2e8f0", fontWeight: 700 }}>
                  {raritySelected?.label ?? "Tirage normal"}
                </span>
              </li>
              <li>
                <span style={{ color: "#64748b" }}>Événement :</span>{" "}
                {cfg.forceEvent
                  ? <span style={{ color: "#a78bfa", fontWeight: 700 }}>{cfg.eventTitle || "(sans titre)"} ({cfg.eventYear})</span>
                  : <span style={{ color: "#475569" }}>Désactivé</span>
                }
              </li>
              <li>
                <span style={{ color: "#64748b" }}>Chronolithe :</span>{" "}
                {cfg.forceChronolithe
                  ? <span style={{ color: "#67e8f9", fontWeight: 700 }}>
                      {STORIES.find(s => s.id === cfg.chronolitheStoryId)?.title ?? "Aléatoire"}
                    </span>
                  : <span style={{ color: "#475569" }}>Désactivé</span>
                }
              </li>
              <li>
                <span style={{ color: "#64748b" }}>Relique Kairos :</span>{" "}
                {cfg.forceKairos
                  ? <span style={{ color: "#d4a017", fontWeight: 700 }}>
                      {KAIROS_STORIES.find(s => s.id === cfg.kairosStoryId)?.title ?? "Aléatoire"}
                    </span>
                  : <span style={{ color: "#475569" }}>Désactivé</span>
                }
              </li>
              <li>
                <span style={{ color: "#64748b" }}>Unicité minute :</span>{" "}
                {cfg.bypassMinuteUniqueness
                  ? <span style={{ color: "#f87171", fontWeight: 700 }}>BYPASS ACTIF ⚠️</span>
                  : <span style={{ color: "#475569" }}>Normale</span>
                }
              </li>
            </ul>
          </motion.div>
        )}

        {/* ── Actions ── */}
        <div className="flex items-center gap-3 pt-2">

          {/* Reset */}
          <button
            onClick={handleReset}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-40"
            style={{
              background: "rgba(239,68,68,0.08)",
              border:     "1px solid rgba(239,68,68,0.25)",
              color:      "#ef4444",
            }}>
            <RotateCcw className="h-4 w-4" />
            Réinitialiser
          </button>

          {/* Save */}
          <motion.button
            onClick={handleSave}
            disabled={saving}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-black transition-all disabled:opacity-40"
            style={{
              background: saved
                ? "rgba(34,197,94,0.1)"
                : "linear-gradient(135deg, rgba(0,200,255,0.12), rgba(255,101,0,0.12))",
              border: saved
                ? "1px solid rgba(34,197,94,0.4)"
                : "1px solid rgba(0,200,255,0.3)",
              color: saved ? "#22c55e" : "#e2e8f0",
            }}>
            {saved
              ? <><CheckCircle2 className="h-4 w-4" /> Enregistré</>
              : saving
                ? <motion.span
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}>
                    Enregistrement…
                  </motion.span>
                : <><Save className="h-4 w-4" /> Appliquer la configuration</>
            }
          </motion.button>
        </div>

        {/* Erreur */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm"
            style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444" }}>
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {error}
          </motion.div>
        )}

        {/* Note info */}
        <p className="text-xs text-center" style={{ color: "#334155" }}>
          La configuration est stockée dans Redis avec un TTL de 24h. Elle se réinitialise automatiquement le lendemain.
        </p>

      </div>
    </div>
  )
}
