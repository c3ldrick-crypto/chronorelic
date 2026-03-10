"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, useScroll, useTransform } from "framer-motion"
import { RARITY_CONFIG } from "@/types"
import { Button } from "@/components/ui/button"
import { ChevronDown, ArrowRight, Zap, Mail } from "lucide-react"

const DEMO_RELICS = [
  { minute: "20:17", rarity: "LEGENDAIRE" as const, event: "Apollo 11" },
  { minute: "11:11", rarity: "MYTHIQUE"   as const, event: "Miroir Temporel" },
  { minute: "09:11", rarity: "EPIQUE"     as const, event: "11 Septembre" },
  { minute: "14:37", rarity: "RARE"       as const, event: "Mission Apollo" },
  { minute: "00:00", rarity: "LEGENDAIRE" as const, event: "An 2000" },
  { minute: "08:15", rarity: "EPIQUE"     as const, event: "Hiroshima 1945" },
]

const FEATURES = [
  { icon: "⏰", title: "1440 Minutes à Capturer",   desc: "Chaque minute du jour est une relique potentielle. Capturez le temps lui-même." },
  { icon: "📚", title: "Découverte Historique",      desc: "Certaines minutes cachent des événements majeurs, narrés par l'IA." },
  { icon: "🔮", title: "5 Niveaux de Rareté",        desc: "Commune, Rare, Épique, Légendaire ou Mythique. Chaque capture est unique." },
  { icon: "🧙", title: "4 Classes de Personnage",    desc: "Chronomancien, Archiviste, Chasseur d'Instants ou Oracle Temporel." },
  { icon: "🌳", title: "Arbres de Talents",          desc: "Personnalisez votre style de jeu avec 10+ talents répartis en 3 arbres." },
  { icon: "🔗", title: "Fusion de Reliques",         desc: "Fusionnez trois reliques consécutives pour créer un artefact unique." },
]

const RARITIES_SHOWCASE = [
  { rarity: "COMMUNE"    as const, label: "Commune",    chance: "60%" },
  { rarity: "RARE"       as const, label: "Rare",       chance: "25%" },
  { rarity: "EPIQUE"     as const, label: "Épique",     chance: "10%" },
  { rarity: "LEGENDAIRE" as const, label: "Légendaire", chance: "4%"  },
  { rarity: "MYTHIQUE"   as const, label: "Mythique",   chance: "1%"  },
]

function AnimatedClock() {
  const [time, setTime] = useState("")
  useEffect(() => {
    const tick = () => {
      const now = new Date()
      setTime(now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }))
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <motion.div
      className="font-display text-5xl sm:text-7xl lg:text-8xl font-black tracking-widest tabular-nums"
      style={{ color: "#f5d678", textShadow: "0 0 40px rgba(232,184,75,0.5), 0 0 80px rgba(196,150,10,0.25)" }}
      animate={{ opacity: [0.85, 1, 0.85] }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      {time || "00:00:00"}
    </motion.div>
  )
}

function FloatingRelic({ minute, rarity, event, delay, x, y }: {
  minute: string; rarity: typeof DEMO_RELICS[0]["rarity"]; event: string; delay: number; x: number; y: number
}) {
  const config = RARITY_CONFIG[rarity]
  return (
    <motion.div
      className="absolute rounded p-3 min-w-[120px] cursor-default pointer-events-none"
      style={{
        left:      `${x}%`,
        top:       `${y}%`,
        background: "linear-gradient(145deg, #1a1530, #141028)",
        border:     `1px solid ${config.glow.replace("0.4", "0.45")}`,
        boxShadow:  `0 0 20px ${config.glow}, 0 4px 12px rgba(0,0,0,0.5)`,
      }}
      animate={{ y: [0, -14, 0], opacity: [0.7, 1, 0.7] }}
      transition={{ duration: 4 + delay, repeat: Infinity, delay, ease: "easeInOut" }}
    >
      <div className="font-display text-lg font-black tracking-widest mb-0.5" style={{ color: "#f5d678" }}>{minute}</div>
      <div className="text-xs font-semibold" style={{ color: config.glow.replace("rgba(", "rgb(").replace(", 0.4)", ")").replace(", 0.45)", ")") }}>
        {config.emoji} {config.label}
      </div>
      {event && <div className="text-[10px] mt-0.5 truncate max-w-[100px]" style={{ color: "#5a5046" }}>{event}</div>}
    </motion.div>
  )
}

function BetaSection() {
  const [email, setEmail]   = useState("")
  const [name,  setName]    = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle")
  const [msg,   setMsg]     = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setStatus("loading")
    try {
      const r = await fetch("/api/beta", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email: email.trim(), name: name.trim(), source: "landing" }),
      })
      const data = await r.json().catch(() => ({}))
      if (r.ok) {
        setStatus("ok")
        setMsg(data.message ?? "Inscription enregistrée !")
      } else {
        setStatus("error")
        setMsg(data.error ?? "Une erreur est survenue.")
      }
    } catch {
      setStatus("error")
      setMsg("Erreur réseau. Réessayez.")
    }
  }

  return (
    <section className="py-24 px-4" style={{ background: "linear-gradient(180deg, transparent, rgba(107,40,200,0.04), transparent)" }}>
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl p-8 sm:p-12 text-center"
          style={{
            background: "linear-gradient(145deg, rgba(107,40,200,0.08), rgba(20,16,40,0.9))",
            border: "1px solid rgba(107,40,200,0.25)",
            boxShadow: "0 0 60px rgba(107,40,200,0.08)",
          }}
        >
          <div className="text-4xl mb-4">🔮</div>
          <h2 className="font-display text-3xl sm:text-4xl font-black mb-3">
            <span className="text-gradient-violet">Accès Bêta Fermée</span>
          </h2>
          <p className="text-sm sm:text-base mb-8" style={{ color: "#9b8d7a" }}>
            ChronoRelic est en développement actif. Rejoignez la liste d&apos;attente pour être parmi les premiers à y accéder.
          </p>

          {status === "ok" ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-xl p-6"
              style={{ background: "rgba(110,231,183,0.08)", border: "1px solid rgba(110,231,183,0.25)" }}
            >
              <div className="text-3xl mb-2">✓</div>
              <p className="font-semibold" style={{ color: "#6ee7b7" }}>{msg}</p>
              <p className="text-xs mt-2" style={{ color: "#5a5046" }}>Nous vous contacterons dès que les accès seront disponibles.</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Votre prénom (optionnel)"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(107,40,200,0.2)",
                  color: "#f0e6c8",
                }}
              />
              <div className="flex gap-3">
                <input
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="flex-1 rounded-xl px-4 py-3 text-sm outline-none transition-all"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(107,40,200,0.2)",
                    color: "#f0e6c8",
                  }}
                />
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold transition-all shrink-0"
                  style={{
                    background: "linear-gradient(135deg, #5b21b6, #7c3aed)",
                    color: "#fff",
                    opacity: status === "loading" ? 0.6 : 1,
                  }}
                >
                  <Mail className="h-4 w-4" />
                  {status === "loading" ? "..." : "M'inscrire"}
                </button>
              </div>
              {status === "error" && (
                <p className="text-xs" style={{ color: "#f43f5e" }}>{msg}</p>
              )}
              <p className="text-xs" style={{ color: "#5a5046" }}>
                Aucun spam · Désabonnement possible à tout moment
              </p>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  )
}

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: containerRef })
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0])
  const heroY       = useTransform(scrollYProgress, [0, 0.3], [0, -60])

  return (
    <div ref={containerRef} className="relative overflow-x-hidden">

      {/* ──────────── HERO ──────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden">
        {/* Cercles animés de fond */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.div
            className="absolute rounded-full"
            style={{ width: "800px", height: "800px", border: "1px solid rgba(196,150,10,0.08)" }}
            animate={{ rotate: 360, scale: [1, 1.02, 1] }}
            transition={{ rotate: { duration: 60, repeat: Infinity, ease: "linear" }, scale: { duration: 8, repeat: Infinity } }}
          />
          <motion.div
            className="absolute rounded-full"
            style={{ width: "580px", height: "580px", border: "1px solid rgba(107,40,200,0.06)" }}
            animate={{ rotate: -360 }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          />
          <div className="absolute w-72 h-72 rounded-full blur-3xl" style={{ background: "rgba(107,40,200,0.08)" }} />
          <div className="absolute w-48 h-48 rounded-full blur-3xl" style={{ background: "rgba(196,150,10,0.06)", transform: "translate(80px, 40px)" }} />
        </div>

        {/* Reliques flottantes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none hidden lg:block">
          {DEMO_RELICS.map((r, i) => (
            <FloatingRelic key={r.minute} {...r} delay={i * 0.7}
              x={i % 2 === 0 ? 4 + i * 1.5 : 74 - i * 1.5}
              y={12 + i * 12}
            />
          ))}
        </div>

        <motion.div style={{ opacity: heroOpacity, y: heroY }} className="relative z-10 flex flex-col items-center text-center max-w-4xl">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-2 rounded px-4 py-2 mb-8"
            style={{ background: "rgba(196,150,10,0.1)", border: "1px solid rgba(196,150,10,0.3)" }}
          >
            <span className="text-sm">⏳</span>
            <span className="text-sm font-semibold" style={{ color: "#e8b84b" }}>RPG de Collection Temporelle</span>
            <span className="text-xs rounded px-2 py-0.5 font-bold" style={{ background: "rgba(196,150,10,0.2)", color: "#f5d678" }}>BÊTA</span>
          </motion.div>

          {/* Titre principal */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-display font-black mb-4 leading-none tracking-wide"
            style={{ fontSize: "clamp(3rem, 10vw, 7rem)" }}
          >
            <span className="text-gradient-gold">CHRONO</span>
            <br />
            <span className="text-gradient-violet">RELIC</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-lg sm:text-xl max-w-2xl mb-6 leading-relaxed"
            style={{ color: "#9b8d7a" }}
          >
            Chaque minute du monde peut devenir une relique à capturer.
            Explorez l&apos;histoire, progressez, et devenez le{" "}
            <span className="font-semibold" style={{ color: "#e8b84b" }}>Gardien du Temps</span>.
          </motion.p>

          {/* Horloge en direct */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4, type: "spring" }}
            className="mb-8"
          >
            <AnimatedClock />
            <p className="text-xs mt-2 tracking-[0.25em] uppercase font-mono" style={{ color: "#5a5046" }}>
              Cette minute est disponible à la capture
            </p>
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 mb-12"
          >
            <Link href="/register">
              <button
                className="group flex items-center gap-3 rounded px-10 py-4 text-base font-bold tracking-wide transition-all duration-250"
                style={{
                  background: "linear-gradient(135deg, #7a5c0a, #c4960a)",
                  border: "1px solid rgba(232,184,75,0.5)",
                  color: "#fff8e1",
                  boxShadow: "0 4px 20px rgba(196,150,10,0.3)",
                }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 0 32px rgba(232,184,75,0.5), 0 4px 20px rgba(0,0,0,0.4)"; e.currentTarget.style.transform = "translateY(-2px)" }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 4px 20px rgba(196,150,10,0.3)"; e.currentTarget.style.transform = "translateY(0)" }}
              >
                Commencer l&apos;Aventure
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            <Link href="/login">
              <button
                className="rounded px-10 py-4 text-base font-bold tracking-wide transition-all duration-250"
                style={{
                  background: "rgba(23,20,40,0.8)",
                  border: "1px solid rgba(58,50,96,0.8)",
                  color: "#9b8d7a",
                }}
                onMouseEnter={e => { e.currentTarget.style.color = "#f0e6c8"; e.currentTarget.style.borderColor = "rgba(196,150,10,0.4)" }}
                onMouseLeave={e => { e.currentTarget.style.color = "#9b8d7a"; e.currentTarget.style.borderColor = "rgba(58,50,96,0.8)" }}
              >
                Se connecter
              </button>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="grid grid-cols-3 gap-8 text-center"
          >
            {[
              { value: "1 440", label: "Minutes à collecter" },
              { value: "5",     label: "Niveaux de rareté" },
              { value: "∞",     label: "Possibilités" },
            ].map(({ value, label }) => (
              <div key={label}>
                <div className="text-2xl font-black font-display text-gradient-gold">{value}</div>
                <div className="text-xs mt-1" style={{ color: "#5a5046" }}>{label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2" animate={{ y: [0, 8, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
          <ChevronDown className="h-6 w-6" style={{ color: "#5a5046" }} />
        </motion.div>
      </section>

      {/* ──────────── RARETÉ ──────────── */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl sm:text-5xl font-black mb-4">
              <span className="text-gradient-gold">Système de Rareté</span>
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: "#9b8d7a" }}>
              Chaque capture tire une rareté. Plus elle est rare, plus la récompense est grande.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {RARITIES_SHOWCASE.map(({ rarity, label, chance }, i) => {
              const config = RARITY_CONFIG[rarity]
              return (
                <motion.div
                  key={rarity}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  whileHover={{ scale: 1.05, y: -4 }}
                  className="card-cosmic p-4 text-center"
                  style={{ boxShadow: rarity !== "COMMUNE" ? `0 0 20px ${config.glow}` : undefined }}
                >
                  <div className="text-4xl mb-3">{config.emoji}</div>
                  {rarity === "MYTHIQUE"
                    ? <div className="rarity-mythique font-bold text-sm mb-1">{label}</div>
                    : <div className={`font-bold text-sm mb-1 rarity-${rarity.toLowerCase()}`}>{label}</div>
                  }
                  <div className="text-xs" style={{ color: "#5a5046" }}>{chance}</div>
                  <div className="text-xs font-semibold mt-2" style={{ color: "#6ee7b7" }}>+{config.xp} XP</div>
                </motion.div>
              )
            })}
          </div>

          {/* Encart Mythique */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-12 rounded p-8 text-center"
            style={{
              background: "linear-gradient(145deg, #1a1530, #160f28)",
              border: "1px solid rgba(244,63,94,0.3)",
              boxShadow: "0 0 40px rgba(244,63,94,0.15)",
            }}
          >
            <motion.p className="text-xs font-bold tracking-[0.3em] uppercase mb-3" style={{ color: "#f43f5e" }}
              animate={{ opacity: [0.7, 1, 0.7] }} transition={{ duration: 2, repeat: Infinity }}>
              ⚠ Événement Rare ⚠
            </motion.p>
            <div className="font-display text-5xl font-black tracking-widest mb-2"
              style={{ color: "#fff", textShadow: "0 0 30px rgba(244,63,94,0.8), 0 0 60px rgba(155,93,229,0.4)" }}>
              11:11
            </div>
            <div className="rarity-mythique text-xl font-bold mb-3">ANOMALIE TEMPORELLE DÉTECTÉE</div>
            <p className="text-sm max-w-md mx-auto" style={{ color: "#9b8d7a" }}>
              Certaines minutes déclenchent des événements spéciaux avec narration IA, particules et sons uniques.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ──────────── FEATURES ──────────── */}
      <section className="py-24 px-4" style={{ background: "linear-gradient(180deg, transparent, rgba(17,16,31,0.4), transparent)" }}>
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl sm:text-5xl font-black mb-4">
              <span className="text-gradient-violet">Un RPG Unique</span>
            </h2>
            <p className="text-lg" style={{ color: "#9b8d7a" }}>Le temps réel devient votre ressource de jeu.</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="panel-relic p-6"
              >
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="font-bold text-lg mb-2" style={{ color: "#f0e6c8" }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#9b8d7a" }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────── CLASSES ──────────── */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl sm:text-5xl font-black mb-4">
              <span className="text-gradient-gold">Choisissez votre Classe</span>
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-5">
            {[
              { icon: "⏰", name: "Chronomancien",    desc: "Maître du temps. Relance les minutes et manipule la temporalité.", accent: "rgba(155,93,229,0.2)", border: "rgba(155,93,229,0.35)" },
              { icon: "📚", name: "Archiviste",        desc: "Expert en histoire. Déboque les événements rares et analyse en lot.", accent: "rgba(196,150,10,0.15)", border: "rgba(196,150,10,0.35)" },
              { icon: "⚡", name: "Chasseur d'Instants", desc: "Vitesse et captures multiples. Triples les chances de RARE+.",    accent: "rgba(59,130,246,0.15)", border: "rgba(59,130,246,0.35)" },
              { icon: "🔮", name: "Oracle Temporel",   desc: "Voit l'avenir. Chance légendaire et révèle les anomalies.",        accent: "rgba(244,63,94,0.12)",  border: "rgba(244,63,94,0.3)" },
            ].map((c, i) => (
              <motion.div
                key={c.name}
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="panel-relic p-6 flex items-start gap-4"
                style={{ background: `linear-gradient(145deg, ${c.accent}, rgba(20,16,40,0.8))`, borderColor: c.border }}
              >
                <div className="text-4xl shrink-0">{c.icon}</div>
                <div>
                  <h3 className="font-bold text-lg mb-1" style={{ color: "#f0e6c8" }}>{c.name}</h3>
                  <p className="text-sm" style={{ color: "#9b8d7a" }}>{c.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────── BETA WAITLIST ──────────── */}
      <BetaSection />

      {/* ──────────── CTA FINAL ──────────── */}
      <section className="py-32 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-96 h-96 rounded-full blur-3xl" style={{ background: "rgba(107,40,200,0.08)" }} />
          <div className="w-64 h-64 rounded-full blur-3xl absolute" style={{ background: "rgba(196,150,10,0.06)", transform: "translate(80px,40px)" }} />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative z-10 max-w-2xl mx-auto"
        >
          <div className="text-6xl mb-6 animate-float inline-block">⏳</div>
          <h2 className="font-display text-4xl sm:text-6xl font-black mb-6 leading-tight">
            <span className="text-gradient-gold">Chaque Minute</span>
            <br />
            <span className="text-gradient-violet">est une Aventure</span>
          </h2>
          <p className="text-lg mb-10 max-w-xl mx-auto" style={{ color: "#9b8d7a" }}>
            Rejoignez les Gardiens du Temps. Gratuit pour commencer, premium pour aller plus loin.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <button
                className="group flex items-center gap-3 rounded px-12 py-4 text-base font-bold tracking-wide transition-all duration-250"
                style={{
                  background: "linear-gradient(135deg, #7a5c0a, #c4960a)",
                  border: "1px solid rgba(232,184,75,0.5)",
                  color: "#fff8e1",
                  boxShadow: "0 4px 20px rgba(196,150,10,0.3)",
                }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 0 32px rgba(232,184,75,0.5)"; e.currentTarget.style.transform = "translateY(-2px)" }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 4px 20px rgba(196,150,10,0.3)"; e.currentTarget.style.transform = "translateY(0)" }}
              >
                Rejoindre Gratuitement
                <Zap className="h-5 w-5 group-hover:scale-110 transition-transform" />
              </button>
            </Link>
          </div>
          <p className="text-sm mt-6" style={{ color: "#5a5046" }}>
            Aucune carte bancaire requise · 5 captures gratuites par jour
          </p>
        </motion.div>
      </section>

      {/* ──────────── FOOTER ──────────── */}
      <footer className="py-8 px-4" style={{ borderTop: "1px solid rgba(196,150,10,0.15)" }}>
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <span className="text-2xl">⏳</span>
            <span className="font-display font-black text-lg text-gradient-gold">ChronoRelic</span>
          </div>

          {/* Copyright */}
          <p className="text-xs text-center" style={{ color: "#5a5046" }}>
            © 2026 ChronoRelic · Le temps comme vous ne l&apos;avez jamais vécu
          </p>

          {/* Binary Anvil logo — discret */}
          <a
            href="https://binaryanvil.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 opacity-40 hover:opacity-70 transition-opacity"
            title="Binary Anvil"
          >
            <Image src="/logo2.png" alt="Binary Anvil" width={24} height={24} className="rounded-sm" />
            <span className="text-xs font-medium" style={{ color: "#9b8d7a" }}>Binary Anvil</span>
          </a>
        </div>
      </footer>
    </div>
  )
}
