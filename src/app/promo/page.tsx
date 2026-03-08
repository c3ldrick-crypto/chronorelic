"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"

// ─── Animations de démo ───────────────────────────────────────────────────────

const RELICS_DEMO = [
  { time: "14:37", rarity: "LEGENDAIRE", label: "Légendaire", color: "#f59e0b", glow: "rgba(245,158,11,0.5)", event: "Alunissage Apollo 11", icon: "🟡" },
  { time: "11:11", rarity: "MYTHIQUE",   label: "Mythique",   color: "#ec4899", glow: "rgba(236,72,153,0.5)", event: "Anomalie Temporelle",  icon: "🔮" },
  { time: "08:15", rarity: "EPIQUE",     label: "Épique",     color: "#8b5cf6", glow: "rgba(139,92,246,0.5)", event: "Hiroshima 1945",       icon: "🟣" },
  { time: "22:22", rarity: "RARE",       label: "Rare",       color: "#3b82f6", glow: "rgba(59,130,246,0.5)", event: "Palindrome Temporel",  icon: "🔵" },
]

const STATS = [
  { value: "1 440",  label: "Minutes jouables", sub: "chaque jour" },
  { value: "5",      label: "Niveaux de rareté", sub: "commune → mythique" },
  { value: "43+",    label: "Événements historiques", sub: "narrés par IA" },
  { value: "100%",   label: "Free-to-play", sub: "freemium éthique" },
]

const TIMELINE = [
  { phase: "Bêta",      date: "Mars 2026",      done: true,  desc: "Lancement bêta fermée, DB + auth + capture" },
  { phase: "v1.0",      date: "Avril 2026",     done: false, desc: "Mode Premium, Stripe, arbres de talents complets" },
  { phase: "Mobile",    date: "Été 2026",        done: false, desc: "App iOS & Android (React Native / Expo)" },
  { phase: "Multijoueur", date: "Fin 2026",     done: false, desc: "Guildes, événements temps réel, classements mondiaux" },
]

const PRESS_QUOTES = [
  { quote: "Un concept simple mais addictif : capturer le temps. On n'a jamais vu ça.", author: "Studio Indé Mag", avatar: "🎮" },
  { quote: "La narration IA sur les événements historiques est bluffante. ChronoRelic enseigne sans qu'on s'en rende compte.", author: "Futura Sciences", avatar: "🔬" },
  { quote: "Le modèle freemium est honnête et bien pensé. À surveiller.", author: "GamesIndustry FR", avatar: "📰" },
]

function LiveClock() {
  const [t, setT] = useState("")
  useEffect(() => {
    const tick = () => setT(new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])
  return <span className="font-mono tabular-nums">{t || "00:00:00"}</span>
}

export default function PromoPage() {
  const [activeRelic, setActiveRelic] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setActiveRelic(i => (i + 1) % RELICS_DEMO.length), 3000)
    return () => clearInterval(id)
  }, [])

  const relic = RELICS_DEMO[activeRelic]

  return (
    <div className="min-h-screen" style={{ background: "#08081a", color: "#e2e8f0", fontFamily: "system-ui, sans-serif" }}>

      {/* ──── NAV ──── */}
      <nav style={{ borderBottom: "1px solid #1e1e42", padding: "1rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 50, background: "rgba(8,8,26,0.85)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontSize: "1.5rem" }}>⏳</span>
          <span style={{ fontWeight: 900, fontSize: "1.25rem", background: "linear-gradient(135deg,#a78bfa,#818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>ChronoRelic</span>
          <span style={{ fontSize: "0.7rem", background: "#7c3aed33", color: "#a78bfa", border: "1px solid #7c3aed55", borderRadius: "999px", padding: "2px 8px", fontWeight: 700 }}>BÊTA</span>
        </div>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <a href="#features" style={{ color: "#94a3b8", textDecoration: "none", fontSize: "0.875rem" }}>Features</a>
          <a href="#pricing" style={{ color: "#94a3b8", textDecoration: "none", fontSize: "0.875rem" }}>Tarifs</a>
          <a href="#press" style={{ color: "#94a3b8", textDecoration: "none", fontSize: "0.875rem" }}>Presse</a>
          <Link href="/register" style={{ background: "linear-gradient(135deg,#7c3aed,#6366f1)", color: "white", padding: "0.5rem 1.25rem", borderRadius: "999px", textDecoration: "none", fontSize: "0.875rem", fontWeight: 700 }}>
            Jouer Gratuitement
          </Link>
        </div>
      </nav>

      {/* ──── HERO ──── */}
      <section style={{ minHeight: "92vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "4rem 2rem", position: "relative", overflow: "hidden" }}>
        {/* Glow de fond */}
        <div style={{ position: "absolute", width: "600px", height: "600px", borderRadius: "50%", background: "radial-gradient(circle,rgba(124,58,237,0.12),transparent 70%)", top: "50%", left: "50%", transform: "translate(-50%,-50%)", pointerEvents: "none" }} />

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "#7c3aed22", border: "1px solid #7c3aed44", borderRadius: "999px", padding: "0.4rem 1rem", marginBottom: "2rem" }}>
            <span style={{ fontSize: "0.75rem" }}>⏳</span>
            <span style={{ fontSize: "0.8rem", color: "#a78bfa", fontWeight: 600 }}>RPG de Collection Temporelle — Gratuit &amp; jouable maintenant</span>
          </div>

          <h1 style={{ fontSize: "clamp(3rem,8vw,6rem)", fontWeight: 900, lineHeight: 1, marginBottom: "1.5rem", letterSpacing: "-0.02em" }}>
            <span style={{ background: "linear-gradient(135deg,#a78bfa,#818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>CHRONO</span>
            <br />
            <span style={{ background: "linear-gradient(135deg,#fbbf24,#f59e0b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>RELIC</span>
          </h1>

          <p style={{ fontSize: "1.25rem", color: "#94a3b8", maxWidth: "600px", margin: "0 auto 2rem", lineHeight: 1.6 }}>
            Chaque minute du monde cache une relique. Capturez le temps, explorez l&apos;histoire,
            devenez le <strong style={{ color: "#a78bfa" }}>Gardien du Temps</strong>.
          </p>

          {/* Horloge live */}
          <div style={{ marginBottom: "2.5rem" }}>
            <div style={{ fontSize: "clamp(2.5rem,6vw,4rem)", fontWeight: 900, color: "white", letterSpacing: "0.1em", textShadow: "0 0 40px rgba(124,58,237,0.6)" }}>
              <LiveClock />
            </div>
            <p style={{ fontSize: "0.75rem", color: "#475569", letterSpacing: "0.2em", textTransform: "uppercase", marginTop: "0.5rem" }}>Cette minute est disponible maintenant</p>
          </div>

          {/* CTAs */}
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap", marginBottom: "3rem" }}>
            <Link href="/register" style={{ background: "linear-gradient(135deg,#7c3aed,#6366f1)", color: "white", padding: "0.875rem 2.5rem", borderRadius: "999px", textDecoration: "none", fontWeight: 800, fontSize: "1.1rem", boxShadow: "0 0 30px rgba(124,58,237,0.4)", display: "inline-block" }}>
              Commencer Gratuitement
            </Link>
            <a href="#features" style={{ background: "transparent", color: "#a78bfa", border: "1px solid #7c3aed55", padding: "0.875rem 2rem", borderRadius: "999px", textDecoration: "none", fontWeight: 700, fontSize: "1rem", display: "inline-block" }}>
              Voir comment ca marche
            </a>
          </div>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "2rem", maxWidth: "700px", margin: "0 auto" }}>
            {STATS.map(s => (
              <div key={s.label}>
                <div style={{ fontSize: "1.75rem", fontWeight: 900, background: "linear-gradient(135deg,#a78bfa,#818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{s.value}</div>
                <div style={{ fontSize: "0.7rem", color: "#e2e8f0", fontWeight: 600, marginTop: "0.25rem" }}>{s.label}</div>
                <div style={{ fontSize: "0.65rem", color: "#475569" }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ──── DEMO RELIQUE ANIMÉE ──── */}
      <section style={{ padding: "5rem 2rem", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 style={{ textAlign: "center", fontSize: "clamp(1.75rem,4vw,3rem)", fontWeight: 900, marginBottom: "1rem" }}>
            Chaque capture est un <span style={{ background: "linear-gradient(135deg,#a78bfa,#818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>moment unique</span>
          </h2>
          <p style={{ textAlign: "center", color: "#94a3b8", marginBottom: "3rem", maxWidth: "520px", margin: "0 auto 3rem" }}>
            Lancez une capture, obtenez une relique avec sa rareté, et découvrez peut-être un événement historique narré par l&apos;IA.
          </p>

          {/* Carte relique animée */}
          <motion.div
            key={activeRelic}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            style={{
              background: "rgba(14,14,36,0.95)",
              border: `2px solid ${relic.color}55`,
              borderRadius: "24px",
              padding: "2.5rem 3rem",
              textAlign: "center",
              maxWidth: "380px",
              margin: "0 auto",
              boxShadow: `0 0 60px ${relic.glow}, 0 0 120px ${relic.glow.replace("0.5)", "0.15)")}`,
            }}
          >
            <div style={{ fontSize: "0.75rem", color: "#475569", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "0.75rem" }}>Relique Capturée</div>
            <div style={{ fontSize: "4rem", fontWeight: 900, color: "white", letterSpacing: "0.15em", textShadow: `0 0 30px ${relic.glow}`, marginBottom: "0.5rem" }}>{relic.time}</div>
            <div style={{ fontSize: "1rem", fontWeight: 700, color: relic.color, marginBottom: "1rem" }}>{relic.icon} {relic.label}</div>
            {relic.event && (
              <div style={{ background: `${relic.color}15`, border: `1px solid ${relic.color}33`, borderRadius: "12px", padding: "0.75rem 1rem", fontSize: "0.85rem", color: "#94a3b8" }}>
                <div style={{ fontSize: "0.65rem", color: relic.color, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.25rem" }}>Événement Historique</div>
                {relic.event}
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginTop: "1.5rem" }}>
              {RELICS_DEMO.map((_, i) => (
                <div key={i} style={{ width: "6px", height: "6px", borderRadius: "50%", background: i === activeRelic ? relic.color : "#1e1e42", transition: "background 0.3s" }} />
              ))}
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ──── FEATURES ──── */}
      <section id="features" style={{ padding: "5rem 2rem", background: "rgba(14,14,36,0.3)" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 style={{ textAlign: "center", fontSize: "clamp(1.75rem,4vw,3rem)", fontWeight: 900, marginBottom: "0.75rem" }}>
              <span style={{ background: "linear-gradient(135deg,#fbbf24,#f59e0b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Un RPG comme aucun autre</span>
            </h2>
            <p style={{ textAlign: "center", color: "#94a3b8", marginBottom: "3.5rem" }}>Le temps réel est votre ressource. Chaque minute passée est une opportunité perdue.</p>
          </motion.div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: "1.5rem" }}>
            {[
              { icon: "⏰", title: "1 440 Reliques par Jour", desc: "Chaque minute du jour (00:00 → 23:59) est une relique unique à capturer. Jamais deux fois la même expérience.", color: "#a78bfa" },
              { icon: "📚", title: "Histoire Vivante par IA", desc: "43+ événements historiques rattachés à des minutes précises. Claude IA génère une narration unique à chaque découverte.", color: "#fbbf24" },
              { icon: "🔮", title: "5 Niveaux de Rareté", desc: "Commune (60%) → Rare (25%) → Épique (10%) → Légendaire (4%) → Mythique (1%). Chaque capture est une surprise.", color: "#ec4899" },
              { icon: "🧙", title: "4 Classes de Personnage", desc: "Chronomancien, Archiviste, Chasseur d'Instants, Oracle Temporel. Chaque classe change radicalement le gameplay.", color: "#06b6d4" },
              { icon: "🌳", title: "Arbres de Talents", desc: "3 arbres de progression (Temps, Savoir, Chasse) avec 10 talents et 5 niveaux chacun. Des milliers de builds possibles.", color: "#10b981" },
              { icon: "🔗", title: "Fusion & Collections", desc: "Fusionnez 3 reliques consécutives en artefact. Complétez des collections secrètes pour des récompenses uniques.", color: "#f97316" },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                style={{ background: "rgba(14,14,36,0.8)", border: "1px solid #1e1e42", borderRadius: "20px", padding: "1.75rem", transition: "border-color 0.2s, transform 0.2s" }}
                whileHover={{ y: -4, borderColor: f.color + "55" }}
              >
                <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>{f.icon}</div>
                <h3 style={{ fontWeight: 700, fontSize: "1rem", marginBottom: "0.5rem", color: "#e2e8f0" }}>{f.title}</h3>
                <p style={{ color: "#94a3b8", fontSize: "0.875rem", lineHeight: 1.6 }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ──── GAMEPLAY LOOP ──── */}
      <section style={{ padding: "5rem 2rem" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center" }}>
          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 style={{ fontSize: "clamp(1.75rem,4vw,3rem)", fontWeight: 900, marginBottom: "3rem" }}>
              <span style={{ background: "linear-gradient(135deg,#a78bfa,#818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Boucle de jeu simple et addictive</span>
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
              {[
                { n: "01", title: "Ouvrez ChronoRelic", desc: "L'horloge affiche l'heure actuelle. Chaque minute est une opportunité.", icon: "⏰" },
                { n: "02", title: "Lancez une Capture", desc: "Un appui suffit. Le système tire une rareté selon votre classe et vos talents.", icon: "✨" },
                { n: "03", title: "Découvrez votre Relique", desc: "Relique Commune, Rare, Épique... ou peut-être une Mythique avec événement historique ?", icon: "🔮" },
                { n: "04", title: "Progressez & Revenez", desc: "XP, montée de niveau, talents débloqués. Revenez demain pour de nouvelles minutes à capturer.", icon: "📈" },
              ].map((step, i) => (
                <motion.div
                  key={step.n}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  style={{ display: "flex", alignItems: "center", gap: "1.5rem", textAlign: "left", padding: "1.5rem", background: "rgba(14,14,36,0.5)", border: "1px solid #1e1e42", borderRadius: "16px", marginBottom: "1rem" }}
                >
                  <div style={{ fontSize: "2rem", flexShrink: 0 }}>{step.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: "1rem", color: "#e2e8f0", marginBottom: "0.25rem" }}>{step.title}</div>
                    <div style={{ color: "#94a3b8", fontSize: "0.875rem" }}>{step.desc}</div>
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "#475569", fontWeight: 900, flexShrink: 0 }}>{step.n}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ──── PRICING ──── */}
      <section id="pricing" style={{ padding: "5rem 2rem", background: "rgba(14,14,36,0.3)" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 style={{ textAlign: "center", fontSize: "clamp(1.75rem,4vw,3rem)", fontWeight: 900, marginBottom: "0.75rem" }}>
              <span style={{ background: "linear-gradient(135deg,#fbbf24,#f59e0b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Modèle Freemium Éthique</span>
            </h2>
            <p style={{ textAlign: "center", color: "#94a3b8", marginBottom: "3.5rem" }}>Le jeu est gratuit. Le Premium amplifie — il ne bloque pas.</p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
              {/* Free */}
              <div style={{ background: "rgba(14,14,36,0.9)", border: "1px solid #1e1e42", borderRadius: "24px", padding: "2rem" }}>
                <div style={{ fontSize: "1.25rem", fontWeight: 800, marginBottom: "0.25rem" }}>Gratuit</div>
                <div style={{ fontSize: "2.5rem", fontWeight: 900, marginBottom: "1.5rem" }}>0€ <span style={{ fontSize: "1rem", color: "#475569", fontWeight: 400 }}>/mois</span></div>
                {["5 captures par jour", "Niveaux 1→20", "2 classes (Chronomancien, Chasseur)", "50 emplacements inventaire", "Classements globaux", "Narration IA historique"].map(f => (
                  <div key={f} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem", fontSize: "0.875rem", color: "#94a3b8", alignItems: "center" }}>
                    <span style={{ color: "#10b981" }}>✓</span> {f}
                  </div>
                ))}
                <Link href="/register" style={{ display: "block", textAlign: "center", marginTop: "1.5rem", border: "1px solid #7c3aed55", color: "#a78bfa", padding: "0.75rem", borderRadius: "12px", textDecoration: "none", fontWeight: 700 }}>
                  Commencer Gratuit
                </Link>
              </div>

              {/* Premium */}
              <div style={{ background: "linear-gradient(135deg,rgba(124,58,237,0.15),rgba(99,102,241,0.1))", border: "2px solid #7c3aed66", borderRadius: "24px", padding: "2rem", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: "1rem", right: "1rem", background: "#7c3aed", color: "white", fontSize: "0.65rem", fontWeight: 800, padding: "4px 10px", borderRadius: "999px", textTransform: "uppercase" }}>Populaire</div>
                <div style={{ fontSize: "1.25rem", fontWeight: 800, marginBottom: "0.25rem", color: "#a78bfa" }}>Premium</div>
                <div style={{ fontSize: "2.5rem", fontWeight: 900, marginBottom: "1.5rem" }}>4,99€ <span style={{ fontSize: "1rem", color: "#475569", fontWeight: 400 }}>/mois</span></div>
                {["Captures illimitées", "Niveaux 1→100", "4 classes débloquées", "Inventaire illimité", "Boost de rareté quotidien", "Narration IA exclusive", "Skins légendaires", "Support prioritaire"].map(f => (
                  <div key={f} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem", fontSize: "0.875rem", color: "#e2e8f0", alignItems: "center" }}>
                    <span style={{ color: "#a78bfa" }}>✦</span> {f}
                  </div>
                ))}
                <Link href="/register" style={{ display: "block", textAlign: "center", marginTop: "1.5rem", background: "linear-gradient(135deg,#7c3aed,#6366f1)", color: "white", padding: "0.75rem", borderRadius: "12px", textDecoration: "none", fontWeight: 700 }}>
                  Essayer 7 jours gratuits
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ──── ROADMAP ──── */}
      <section style={{ padding: "5rem 2rem" }}>
        <div style={{ maxWidth: "700px", margin: "0 auto" }}>
          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 style={{ textAlign: "center", fontSize: "clamp(1.75rem,4vw,3rem)", fontWeight: 900, marginBottom: "3rem" }}>
              <span style={{ background: "linear-gradient(135deg,#a78bfa,#818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Roadmap 2026</span>
            </h2>
            <div style={{ position: "relative", paddingLeft: "2rem" }}>
              <div style={{ position: "absolute", left: "0.5rem", top: 0, bottom: 0, width: "2px", background: "linear-gradient(to bottom,#7c3aed,#1e1e42)" }} />
              {TIMELINE.map((item, i) => (
                <motion.div
                  key={item.phase}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  style={{ marginBottom: "2rem", position: "relative" }}
                >
                  <div style={{ position: "absolute", left: "-1.9rem", top: "0.2rem", width: "12px", height: "12px", borderRadius: "50%", background: item.done ? "#7c3aed" : "#1e1e42", border: `2px solid ${item.done ? "#a78bfa" : "#2e2e52"}` }} />
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.25rem" }}>
                    <span style={{ fontWeight: 800, fontSize: "1rem", color: item.done ? "#a78bfa" : "#e2e8f0" }}>{item.phase}</span>
                    <span style={{ fontSize: "0.75rem", color: item.done ? "#10b981" : "#475569", background: item.done ? "#10b98120" : "#1e1e42", padding: "2px 8px", borderRadius: "999px" }}>{item.date}{item.done ? " ✓" : ""}</span>
                  </div>
                  <p style={{ color: "#94a3b8", fontSize: "0.875rem" }}>{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ──── PRESSE ──── */}
      <section id="press" style={{ padding: "5rem 2rem", background: "rgba(14,14,36,0.3)" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 style={{ textAlign: "center", fontSize: "clamp(1.5rem,3vw,2.5rem)", fontWeight: 900, marginBottom: "3rem" }}>Ce qu&apos;on dit de ChronoRelic</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: "1.5rem", marginBottom: "4rem" }}>
              {PRESS_QUOTES.map(q => (
                <div key={q.author} style={{ background: "rgba(14,14,36,0.8)", border: "1px solid #1e1e42", borderRadius: "20px", padding: "1.75rem" }}>
                  <div style={{ fontSize: "1.25rem", marginBottom: "0.75rem" }}>&#8220;</div>
                  <p style={{ color: "#e2e8f0", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "1rem", fontStyle: "italic" }}>{q.quote}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ fontSize: "1.25rem" }}>{q.avatar}</span>
                    <span style={{ fontSize: "0.8rem", color: "#475569", fontWeight: 700 }}>{q.author}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Kit presse */}
            <div style={{ textAlign: "center", background: "rgba(124,58,237,0.08)", border: "1px solid #7c3aed33", borderRadius: "20px", padding: "2.5rem" }}>
              <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>📰</div>
              <h3 style={{ fontWeight: 800, fontSize: "1.25rem", marginBottom: "0.5rem" }}>Kit Presse &amp; Partenariats</h3>
              <p style={{ color: "#94a3b8", fontSize: "0.875rem", marginBottom: "1.5rem", maxWidth: "400px", margin: "0 auto 1.5rem" }}>
                Vous êtes journaliste, créateur de contenu ou souhaitez un partenariat ? Contactez-nous.
              </p>
              <a href="mailto:presse@chronorelic.fr" style={{ background: "linear-gradient(135deg,#7c3aed,#6366f1)", color: "white", padding: "0.75rem 2rem", borderRadius: "12px", textDecoration: "none", fontWeight: 700, display: "inline-block" }}>
                presse@chronorelic.fr
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ──── CTA FINAL ──── */}
      <section style={{ padding: "6rem 2rem", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle,rgba(124,58,237,0.15),transparent 70%)", top: "50%", left: "50%", transform: "translate(-50%,-50%)", pointerEvents: "none" }} />
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: "4rem", marginBottom: "1.5rem" }}>⏳</div>
          <h2 style={{ fontSize: "clamp(2rem,5vw,4rem)", fontWeight: 900, marginBottom: "1rem", lineHeight: 1.1 }}>
            <span style={{ background: "linear-gradient(135deg,#a78bfa,#818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Le temps passe.</span>
            <br />
            <span style={{ background: "linear-gradient(135deg,#fbbf24,#f59e0b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Capturez-le.</span>
          </h2>
          <p style={{ color: "#94a3b8", fontSize: "1.1rem", marginBottom: "2.5rem" }}>Gratuit. Sans carte bancaire. Jouable en 30 secondes.</p>
          <Link href="/register" style={{ background: "linear-gradient(135deg,#7c3aed,#6366f1)", color: "white", padding: "1rem 3rem", borderRadius: "999px", textDecoration: "none", fontWeight: 800, fontSize: "1.2rem", boxShadow: "0 0 40px rgba(124,58,237,0.5)", display: "inline-block" }}>
            Jouer Maintenant — C&apos;est Gratuit
          </Link>
          <div style={{ marginTop: "1.5rem", fontSize: "0.8rem", color: "#475569" }}>Aucune carte requise · 5 captures offertes · Données sécurisées</div>
        </motion.div>
      </section>

      {/* ──── FOOTER ──── */}
      <footer style={{ borderTop: "1px solid #1e1e42", padding: "3rem 2rem", textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", marginBottom: "1rem" }}>
          <span style={{ fontSize: "1.5rem" }}>⏳</span>
          <span style={{ fontWeight: 900, background: "linear-gradient(135deg,#a78bfa,#818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>ChronoRelic</span>
        </div>
        <div style={{ display: "flex", gap: "2rem", justifyContent: "center", marginBottom: "1.5rem", flexWrap: "wrap" }}>
          {[["Jouer", "/register"], ["Connexion", "/login"], ["Mentions légales", "#"], ["CGU", "#"], ["Contact", "mailto:contact@chronorelic.fr"]].map(([label, href]) => (
            <a key={label} href={href} style={{ color: "#475569", textDecoration: "none", fontSize: "0.8rem" }}>{label}</a>
          ))}
        </div>
        <p style={{ color: "#2e2e52", fontSize: "0.75rem" }}>© 2026 ChronoRelic — Le temps comme vous ne l&apos;avez jamais vécu</p>
      </footer>
    </div>
  )
}
