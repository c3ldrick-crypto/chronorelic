"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"

// ─── Couleurs thématiques KAIROS ──────────────────────────────────────────────
const C = {
  gold:   "#d4a017",
  goldDim: "#d4a01755",
  goldGlow: "rgba(212,160,23,0.35)",
  violet: "#a78bfa",
  violetDim: "#a78bfa55",
  red:    "#ff4444",
  redDim: "#ff444455",
  redGlow: "rgba(255,68,68,0.35)",
  bg:     "#08080f",
  card:   "rgba(12,10,20,0.95)",
  border: "#1a1520",
  muted:  "#94a3b8",
  faint:  "#475569",
}

// ─── Données ──────────────────────────────────────────────────────────────────

const ADVENTURES = [
  {
    icon: "🔫",
    title: "L'Erreur du Chauffeur",
    era: "Sarajevo",
    country: "Bosnie",
    year: "1914",
    type: "STANDARD" as const,
    synopsis: "Le mauvais virage d'un chauffeur impérial offre une seconde chance à l'assassin de l'archiduc François-Ferdinand. Chaque seconde compte.",
    endings: "4 fins possibles",
    paradox: false,
  },
  {
    icon: "🧱",
    title: "La Nuit du Mur",
    era: "Berlin",
    country: "Allemagne",
    year: "1989",
    type: "STANDARD" as const,
    synopsis: "Schabowski vient d'annoncer par erreur l'ouverture immédiate du Mur. Vous êtes agent au checkpoint Bornholmer Strasse.",
    endings: "4 fins possibles",
    paradox: false,
  },
  {
    icon: "🌕",
    title: "Tranquility Base",
    era: "Lune",
    country: "NASA, Houston",
    year: "1969",
    type: "STANDARD" as const,
    synopsis: "L'Eagle a atterri. Vous êtes contrôleur de vol à Houston. L'alarme 1202 a failli tout annuler — et la mission n'est pas terminée.",
    endings: "4 fins possibles",
    paradox: false,
  },
  {
    icon: "🗡️",
    title: "Les Ides de Mars",
    era: "Rome",
    country: "République Romaine",
    year: "44 av. J.-C.",
    type: "COMPLEXE" as const,
    synopsis: "César se rend au Sénat. Vous êtes Marcus, centurion de sa garde. Vous avez entendu des rumeurs de complot — et vous devez décider.",
    endings: "5 fins · 2 paradoxes",
    paradox: true,
  },
  {
    icon: "💼",
    title: "La Valise",
    era: "Wolf's Lair",
    country: "Prusse-Orientale",
    year: "1944",
    type: "COMPLEXE" as const,
    synopsis: "Une valise piégée est posée à deux mètres de Hitler. Vous êtes le deuxième officier de liaison dans la salle — et vous savez ce qu'elle contient.",
    endings: "5 fins · 2 paradoxes",
    paradox: true,
  },
]

const ENDINGS = [
  {
    icon: "🏛️",
    label: "Gardien du Temps",
    badge: "HISTORIQUE",
    color: C.gold,
    bg: "rgba(212,160,23,0.08)",
    border: C.goldDim,
    desc: "Vous avez suivi l'Histoire réelle. Chaque détail est authentique. Des notes historiques accompagnent votre dénouement.",
    blink: false,
  },
  {
    icon: "🌀",
    label: "Maître du Temps",
    badge: "ALTERNATIF",
    color: C.violet,
    bg: "rgba(167,139,250,0.08)",
    border: C.violetDim,
    desc: "Vous avez dévié la ligne temporelle. Une nouvelle chronologie prend forme — plausible, fascinante, et uniquement la vôtre.",
    blink: false,
  },
  {
    icon: "⚠️",
    label: "Paradoxe Temporel",
    badge: "COMPLEXE UNIQUEMENT",
    color: C.red,
    bg: "rgba(255,68,68,0.08)",
    border: C.redDim,
    desc: "Votre choix a brisé le tissu du temps. Certaines décisions ont des conséquences irréversibles. L'Histoire se referme sur elle-même.",
    blink: true,
  },
]

// ─── Composant ligne de temps pulsée ─────────────────────────────────────────

function GoldenTimeline() {
  return (
    <div style={{ width: "100%", maxWidth: "420px", margin: "0 auto 2rem", position: "relative", height: "32px" }}>
      {/* Ligne de base */}
      <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: "2px", background: `linear-gradient(90deg,transparent,${C.gold},transparent)`, transform: "translateY(-50%)" }} />
      {/* Points nodaux */}
      {[0, 25, 50, 75, 100].map((pct, i) => (
        <motion.div
          key={i}
          animate={{ scale: [1, 1.6, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2.5, delay: i * 0.4, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            top: "50%",
            left: `${pct}%`,
            transform: "translate(-50%,-50%)",
            width: i === 2 ? "12px" : "7px",
            height: i === 2 ? "12px" : "7px",
            borderRadius: "50%",
            background: C.gold,
            boxShadow: `0 0 ${i === 2 ? "16px" : "8px"} ${C.gold}`,
          }}
        />
      ))}
      {/* Pulse qui voyage */}
      <motion.div
        animate={{ left: ["0%", "100%"] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "linear", repeatDelay: 0.5 }}
        style={{
          position: "absolute",
          top: "50%",
          transform: "translateY(-50%)",
          width: "24px",
          height: "4px",
          borderRadius: "2px",
          background: `linear-gradient(90deg,transparent,${C.gold},white,${C.gold},transparent)`,
          filter: `blur(1px)`,
        }}
      />
    </div>
  )
}

// ─── Composant clignotant pour les paradoxes ─────────────────────────────────

function BlinkBadge({ children, color }: { children: React.ReactNode; color: string }) {
  const [visible, setVisible] = useState(true)
  useEffect(() => {
    const id = setInterval(() => setVisible(v => !v), 800)
    return () => clearInterval(id)
  }, [])
  return (
    <span style={{
      opacity: visible ? 1 : 0.3,
      transition: "opacity 0.15s",
      color,
      fontWeight: 800,
      fontSize: "0.65rem",
      textTransform: "uppercase" as const,
      letterSpacing: "0.12em",
    }}>
      {children}
    </span>
  )
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function KairosPromoPage() {
  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: "#e2e8f0", fontFamily: "system-ui, sans-serif" }}>

      {/* Fond global radial doré */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(212,160,23,0.06) 0%, transparent 70%)",
      }} />

      {/* ──── NAV ──── */}
      <nav style={{
        borderBottom: `1px solid ${C.border}`,
        padding: "1rem 2rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        backdropFilter: "blur(12px)",
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(8,8,15,0.88)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <Link href="/promo" style={{ display: "flex", alignItems: "center", gap: "0.5rem", textDecoration: "none" }}>
            <span style={{ fontSize: "1.4rem" }}>⏳</span>
            <span style={{ fontWeight: 900, fontSize: "1.15rem", background: `linear-gradient(135deg,#a78bfa,#818cf8)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>ChronoRelic</span>
          </Link>
          <span style={{ color: C.faint, fontSize: "0.75rem" }}>/</span>
          <span style={{ fontWeight: 800, fontSize: "0.9rem", color: C.gold }}>Relique Kairos</span>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <Link href="/promo" style={{ color: C.faint, textDecoration: "none", fontSize: "0.8rem" }}>← Retour promo</Link>
          <Link href="/play" style={{
            background: `linear-gradient(135deg,${C.gold},#b8860b)`,
            color: "#08080f",
            padding: "0.45rem 1.1rem",
            borderRadius: "999px",
            textDecoration: "none",
            fontSize: "0.8rem",
            fontWeight: 800,
          }}>
            Jouer
          </Link>
        </div>
      </nav>

      {/* ──── HERO ──── */}
      <section style={{
        minHeight: "88vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "5rem 2rem",
        position: "relative",
        overflow: "hidden",
        zIndex: 1,
      }}>
        {/* Halo hero */}
        <div style={{
          position: "absolute",
          width: "700px",
          height: "700px",
          borderRadius: "50%",
          background: `radial-gradient(circle,${C.goldGlow},transparent 65%)`,
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
          pointerEvents: "none",
          opacity: 0.55,
        }} />

        <motion.div initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.75 }} style={{ position: "relative", zIndex: 1 }}>

          {/* Badge drop rate */}
          <motion.div
            animate={{ boxShadow: [`0 0 0px ${C.gold}00`, `0 0 20px ${C.gold}55`, `0 0 0px ${C.gold}00`] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              background: "rgba(212,160,23,0.1)",
              border: `1px solid ${C.goldDim}`,
              borderRadius: "999px",
              padding: "0.4rem 1.1rem",
              marginBottom: "2.25rem",
            }}
          >
            <span style={{ fontSize: "0.75rem" }}>✦</span>
            <span style={{ fontSize: "0.8rem", color: C.gold, fontWeight: 700 }}>10% de chance par capture · Drop aléatoire</span>
          </motion.div>

          {/* Titre principal */}
          <h1 style={{ fontSize: "clamp(3.5rem,9vw,7rem)", fontWeight: 900, lineHeight: 0.9, marginBottom: "1.75rem", letterSpacing: "-0.02em" }}>
            <span style={{ display: "block", fontSize: "0.28em", fontWeight: 700, letterSpacing: "0.35em", color: C.muted, textTransform: "uppercase", marginBottom: "0.6em" }}>
              RELIQUE
            </span>
            <span style={{
              background: `linear-gradient(135deg,${C.gold},#f0c040,${C.gold})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textShadow: "none",
              filter: `drop-shadow(0 0 24px ${C.gold}66)`,
            }}>
              KAIROS
            </span>
          </h1>

          {/* Sous-titre */}
          <p style={{ fontSize: "clamp(1rem,2.5vw,1.35rem)", color: "#cbd5e1", maxWidth: "560px", margin: "0 auto 1.25rem", lineHeight: 1.55, fontWeight: 500 }}>
            Vous êtes l&apos;acteur du passé.<br />
            <strong style={{ color: "#f0f0f0" }}>Chaque choix réécrit l&apos;Histoire.</strong>
          </p>

          {/* Description étymologique */}
          <p style={{ fontSize: "0.925rem", color: C.faint, maxWidth: "520px", margin: "0 auto 2.5rem", lineHeight: 1.65 }}>
            <em style={{ color: C.muted }}>Kairos (καιρός)</em> désigne en grec le moment décisif, l&apos;instant pivot où tout bascule.
            La Relique Kairos vous place au cœur de ces instants — avec le pouvoir de les changer.
          </p>

          {/* Ligne de temps dorée animée */}
          <GoldenTimeline />

          {/* CTA hero */}
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap", marginTop: "0.5rem" }}>
            <Link href="/play" style={{
              background: `linear-gradient(135deg,${C.gold},#b8860b)`,
              color: "#08080f",
              padding: "0.875rem 2.5rem",
              borderRadius: "999px",
              textDecoration: "none",
              fontWeight: 800,
              fontSize: "1.05rem",
              boxShadow: `0 0 32px ${C.goldGlow}`,
              display: "inline-block",
            }}>
              Jouer à ChronoRelic →
            </Link>
            <a href="#aventures" style={{
              background: "transparent",
              color: C.gold,
              border: `1px solid ${C.goldDim}`,
              padding: "0.875rem 2rem",
              borderRadius: "999px",
              textDecoration: "none",
              fontWeight: 700,
              fontSize: "0.95rem",
              display: "inline-block",
            }}>
              Voir les aventures
            </a>
          </div>

        </motion.div>
      </section>

      {/* ──── MÉCANIQUE ──── */}
      <section style={{ padding: "5rem 2rem", background: "rgba(12,10,20,0.5)", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <motion.div initial={{ opacity: 0, y: 36 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 style={{ textAlign: "center", fontSize: "clamp(1.6rem,4vw,2.75rem)", fontWeight: 900, marginBottom: "0.75rem" }}>
              <span style={{ background: `linear-gradient(135deg,${C.gold},#f0c040)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Comment ça marche</span>
            </h2>
            <p style={{ textAlign: "center", color: C.muted, marginBottom: "3.5rem", maxWidth: "480px", margin: "0 auto 3.5rem" }}>
              Une mécanique simple, des conséquences profondes.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: "1.5rem" }}>
              {[
                {
                  icon: "🎲",
                  title: "Capturez",
                  desc: "Une capture sur dix déclenche une Relique Kairos. L'Histoire choisit son moment — vous ne pouvez pas forcer son apparition.",
                  color: C.gold,
                },
                {
                  icon: "⚔️",
                  title: "Décidez",
                  desc: "À chaque segment, deux voies s'offrent à vous : suivre l'Histoire réelle, ou la dévier. Votre instinct est votre seul guide.",
                  color: C.violet,
                },
                {
                  icon: "🌀",
                  title: "Transformez",
                  desc: "Vos choix créent de nouvelles chronologies — ou provoquent un Paradoxe Temporel. Certaines décisions sont irréversibles.",
                  color: C.red,
                },
              ].map((col, i) => (
                <motion.div
                  key={col.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12 }}
                  whileHover={{ y: -5, borderColor: col.color + "66" }}
                  style={{
                    background: C.card,
                    border: `1px solid ${C.border}`,
                    borderRadius: "20px",
                    padding: "2rem 1.75rem",
                    transition: "border-color 0.25s, transform 0.25s",
                  }}
                >
                  <div style={{ fontSize: "2.75rem", marginBottom: "1.25rem" }}>{col.icon}</div>
                  <h3 style={{ fontWeight: 800, fontSize: "1.1rem", color: col.color, marginBottom: "0.6rem" }}>{col.title}</h3>
                  <p style={{ color: C.muted, fontSize: "0.875rem", lineHeight: 1.65 }}>{col.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ──── DEUX TYPES DE RELIQUES ──── */}
      <section style={{ padding: "5rem 2rem", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <motion.div initial={{ opacity: 0, y: 36 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 style={{ textAlign: "center", fontSize: "clamp(1.6rem,4vw,2.75rem)", fontWeight: 900, marginBottom: "0.75rem" }}>
              Deux niveaux d&apos;intensité
            </h2>
            <p style={{ textAlign: "center", color: C.muted, marginBottom: "3.5rem" }}>
              Choisissez votre rapport au risque temporel.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: "1.75rem" }}>

              {/* STANDARD */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.05 }}
                style={{
                  background: `linear-gradient(160deg,rgba(212,160,23,0.07),rgba(8,8,15,0.97))`,
                  border: `1.5px solid ${C.goldDim}`,
                  borderRadius: "24px",
                  padding: "2.25rem",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div style={{ position: "absolute", top: "1.25rem", right: "1.25rem", background: "rgba(212,160,23,0.15)", border: `1px solid ${C.goldDim}`, color: C.gold, fontSize: "0.65rem", fontWeight: 800, padding: "3px 10px", borderRadius: "999px", letterSpacing: "0.12em" }}>
                  STANDARD
                </div>
                <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>⚖️</div>
                <h3 style={{ fontWeight: 900, fontSize: "1.3rem", color: C.gold, marginBottom: "0.75rem" }}>Standard</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", marginBottom: "1.5rem" }}>
                  {["2–3 points de décision", "Fins multiples (Historique ou Alternatif)", "Aucune mort possible", "Idéal pour découvrir la mécanique"].map(feat => (
                    <div key={feat} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", color: "#e2e8f0" }}>
                      <span style={{ color: C.gold, fontSize: "0.7rem" }}>✦</span> {feat}
                    </div>
                  ))}
                </div>
                <div style={{ borderTop: `1px solid ${C.goldDim}`, paddingTop: "1rem" }}>
                  <div style={{ fontSize: "0.7rem", color: C.faint, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>Aventures incluses</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                    {["🔫 Sarajevo, 1914", "🧱 Berlin, 1989", "🌕 Lune, 1969"].map(a => (
                      <span key={a} style={{ fontSize: "0.85rem", color: C.muted }}>{a}</span>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* COMPLEXE */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                style={{
                  background: `linear-gradient(160deg,rgba(255,68,68,0.06),rgba(167,139,250,0.05),rgba(8,8,15,0.97))`,
                  border: `1.5px solid rgba(255,68,68,0.35)`,
                  borderRadius: "24px",
                  padding: "2.25rem",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div style={{ position: "absolute", top: "1.25rem", right: "1.25rem", background: "rgba(255,68,68,0.12)", border: "1px solid rgba(255,68,68,0.35)", color: C.red, fontSize: "0.65rem", fontWeight: 800, padding: "3px 10px", borderRadius: "999px", letterSpacing: "0.12em" }}>
                  COMPLEXE
                </div>
                <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>☠️</div>
                <h3 style={{ fontWeight: 900, fontSize: "1.3rem", color: C.red, marginBottom: "0.75rem" }}>Complexe</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", marginBottom: "1.5rem" }}>
                  {["3–4 points de décision", "Morts possibles (Paradoxe Temporel)", "Fins plus rares, plus significatives", "Pour les joueurs avertis"].map(feat => (
                    <div key={feat} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", color: "#e2e8f0" }}>
                      <span style={{ color: C.red, fontSize: "0.7rem" }}>⚠</span> {feat}
                    </div>
                  ))}
                </div>
                <div style={{ borderTop: "1px solid rgba(255,68,68,0.2)", paddingTop: "1rem" }}>
                  <div style={{ fontSize: "0.7rem", color: C.faint, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>Aventures incluses</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                    {["🗡️ Rome, 44 av. J.-C.", "💼 Wolf's Lair, 1944"].map(a => (
                      <span key={a} style={{ fontSize: "0.85rem", color: C.muted }}>{a}</span>
                    ))}
                  </div>
                </div>
              </motion.div>

            </div>
          </motion.div>
        </div>
      </section>

      {/* ──── LES 5 AVENTURES ──── */}
      <section id="aventures" style={{ padding: "5rem 2rem", background: "rgba(12,10,20,0.5)", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <motion.div initial={{ opacity: 0, y: 36 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 style={{ textAlign: "center", fontSize: "clamp(1.6rem,4vw,2.75rem)", fontWeight: 900, marginBottom: "0.75rem" }}>
              <span style={{ background: `linear-gradient(135deg,${C.gold},#f0c040)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Les 5 aventures disponibles</span>
            </h2>
            <p style={{ textAlign: "center", color: C.muted, marginBottom: "3.5rem" }}>
              Cinq instants où l&apos;Histoire a tenu à un fil.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: "1.5rem" }}>
              {ADVENTURES.map((adv, i) => {
                const isComplex = adv.type === "COMPLEXE"
                const accentColor = isComplex ? C.red : C.gold
                const accentDim = isComplex ? "rgba(255,68,68,0.3)" : C.goldDim
                const accentBg = isComplex ? "rgba(255,68,68,0.07)" : "rgba(212,160,23,0.07)"
                return (
                  <motion.div
                    key={adv.title}
                    initial={{ opacity: 0, y: 28 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.09 }}
                    whileHover={{ y: -6, boxShadow: `0 12px 40px ${isComplex ? C.redGlow : C.goldGlow}` }}
                    style={{
                      background: `linear-gradient(160deg,${accentBg},${C.card})`,
                      border: `1.5px solid ${accentDim}`,
                      borderRadius: "22px",
                      padding: "1.75rem",
                      cursor: "default",
                      transition: "box-shadow 0.3s, transform 0.25s",
                    }}
                  >
                    {/* Header carte */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                      <span style={{ fontSize: "2.25rem" }}>{adv.icon}</span>
                      <span style={{
                        background: isComplex ? "rgba(255,68,68,0.12)" : "rgba(212,160,23,0.12)",
                        border: `1px solid ${accentDim}`,
                        color: accentColor,
                        fontSize: "0.6rem",
                        fontWeight: 800,
                        padding: "3px 9px",
                        borderRadius: "999px",
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                      }}>
                        {adv.type}{isComplex ? " ☠" : ""}
                      </span>
                    </div>

                    {/* Année en grand */}
                    <div style={{
                      fontSize: "2.25rem",
                      fontWeight: 900,
                      color: accentColor,
                      lineHeight: 1,
                      marginBottom: "0.3rem",
                      filter: `drop-shadow(0 0 10px ${accentColor}55)`,
                    }}>
                      {adv.year}
                    </div>

                    {/* Lieu */}
                    <div style={{ fontSize: "0.72rem", color: C.faint, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "0.65rem" }}>
                      {adv.era} · {adv.country}
                    </div>

                    {/* Titre */}
                    <h3 style={{ fontWeight: 800, fontSize: "1rem", color: "#f0f0f0", marginBottom: "0.65rem" }}>
                      {adv.title}
                    </h3>

                    {/* Synopsis */}
                    <p style={{ fontSize: "0.85rem", color: C.muted, lineHeight: 1.6, marginBottom: "1.25rem" }}>
                      {adv.synopsis}
                    </p>

                    {/* Footer endings */}
                    <div style={{
                      borderTop: `1px solid ${accentDim}`,
                      paddingTop: "0.85rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.4rem",
                    }}>
                      <span style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.1em", color: accentColor, fontWeight: 700 }}>
                        {adv.endings}
                      </span>
                      {adv.paradox && (
                        <BlinkBadge color={C.red}> · ⚠ PARADOXE POSSIBLE</BlinkBadge>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ──── LES TROIS TYPES DE FINS ──── */}
      <section style={{ padding: "5rem 2rem", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <motion.div initial={{ opacity: 0, y: 36 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 style={{ textAlign: "center", fontSize: "clamp(1.6rem,4vw,2.75rem)", fontWeight: 900, marginBottom: "0.75rem" }}>
              Trois façons de terminer
            </h2>
            <p style={{ textAlign: "center", color: C.muted, marginBottom: "3.5rem" }}>
              Chaque fin est une récompense. Chaque paradoxe, un avertissement.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(270px,1fr))", gap: "1.5rem" }}>
              {ENDINGS.map((end, i) => (
                <motion.div
                  key={end.label}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -5 }}
                  style={{
                    background: end.bg,
                    border: `1.5px solid ${end.border}`,
                    borderRadius: "22px",
                    padding: "2rem 1.75rem",
                    textAlign: "center",
                    position: "relative",
                    overflow: "hidden",
                    transition: "transform 0.25s",
                  }}
                >
                  {/* Halo intérieur */}
                  <div style={{
                    position: "absolute",
                    top: 0, left: "50%",
                    transform: "translateX(-50%)",
                    width: "200px",
                    height: "80px",
                    background: `radial-gradient(ellipse,${end.color}22,transparent 70%)`,
                    pointerEvents: "none",
                  }} />

                  <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>{end.icon}</div>

                  <div style={{
                    display: "inline-block",
                    background: `${end.color}18`,
                    border: `1px solid ${end.border}`,
                    color: end.color,
                    fontSize: "0.62rem",
                    fontWeight: 800,
                    padding: "3px 10px",
                    borderRadius: "999px",
                    letterSpacing: "0.13em",
                    textTransform: "uppercase",
                    marginBottom: "0.75rem",
                  }}>
                    {end.badge}
                  </div>

                  <h3 style={{ fontWeight: 900, fontSize: "1.15rem", color: end.color, marginBottom: "0.75rem" }}>
                    {end.label}
                  </h3>

                  <p style={{ fontSize: "0.875rem", color: C.muted, lineHeight: 1.65 }}>
                    {end.desc}
                  </p>

                  {end.blink && (
                    <div style={{ marginTop: "1rem" }}>
                      <BlinkBadge color={C.red}>⚠ MORT NARRATIVE — COMPLEXE UNIQUEMENT</BlinkBadge>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ──── CTA FINAL ──── */}
      <section style={{ padding: "7rem 2rem", textAlign: "center", position: "relative", overflow: "hidden", zIndex: 1 }}>
        {/* Halos CTA */}
        <div style={{ position: "absolute", width: "600px", height: "400px", borderRadius: "50%", background: `radial-gradient(ellipse,${C.goldGlow},transparent 65%)`, top: "50%", left: "50%", transform: "translate(-50%,-50%)", pointerEvents: "none", opacity: 0.6 }} />
        <div style={{ position: "absolute", width: "300px", height: "300px", borderRadius: "50%", background: `radial-gradient(circle,rgba(167,139,250,0.1),transparent 70%)`, top: "20%", left: "10%", pointerEvents: "none" }} />
        <div style={{ position: "absolute", width: "200px", height: "200px", borderRadius: "50%", background: `radial-gradient(circle,${C.redGlow},transparent 70%)`, bottom: "15%", right: "12%", pointerEvents: "none", opacity: 0.5 }} />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ position: "relative", zIndex: 1 }}
        >
          <div style={{ fontSize: "4.5rem", marginBottom: "1.5rem", filter: `drop-shadow(0 0 24px ${C.gold}88)` }}>⚡</div>

          <h2 style={{ fontSize: "clamp(2rem,5vw,4rem)", fontWeight: 900, marginBottom: "1rem", lineHeight: 1.1 }}>
            <span style={{ background: `linear-gradient(135deg,${C.gold},#f0c040)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Capturez le temps.
            </span>
            <br />
            <span style={{ color: "#f0f0f0" }}>
              Réécrivez l&apos;Histoire.
            </span>
          </h2>

          <p style={{ color: C.muted, fontSize: "1.05rem", marginBottom: "2.75rem", maxWidth: "440px", margin: "0 auto 2.75rem" }}>
            La Relique Kairos n&apos;attend pas. Chaque capture est une chance de traverser le temps.
          </p>

          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap", marginBottom: "2.5rem" }}>
            <Link href="/play" style={{
              background: `linear-gradient(135deg,${C.gold},#b8860b)`,
              color: "#08080f",
              padding: "1rem 2.75rem",
              borderRadius: "999px",
              textDecoration: "none",
              fontWeight: 900,
              fontSize: "1.15rem",
              boxShadow: `0 0 40px ${C.goldGlow}`,
              display: "inline-block",
            }}>
              Jouer à ChronoRelic →
            </Link>
          </div>

          {/* Liens secondaires */}
          <div style={{ display: "flex", gap: "2rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/play" style={{ color: C.faint, textDecoration: "none", fontSize: "0.875rem", fontWeight: 600 }}>
              ← Retour au jeu
            </Link>
            <Link href="/promo" style={{ color: C.faint, textDecoration: "none", fontSize: "0.875rem", fontWeight: 600 }}>
              ← Voir la page ChronoRelic
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ──── FOOTER ──── */}
      <footer style={{ borderTop: `1px solid ${C.border}`, padding: "3rem 2rem", textAlign: "center", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem", marginBottom: "1rem" }}>
          <span style={{ fontSize: "1.4rem" }}>⏳</span>
          <span style={{ fontWeight: 900, background: `linear-gradient(135deg,${C.gold},#f0c040)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            ChronoRelic
          </span>
          <span style={{ color: C.faint, fontSize: "0.8rem" }}>— Relique Kairos</span>
        </div>
        <div style={{ display: "flex", gap: "2rem", justifyContent: "center", marginBottom: "1.5rem", flexWrap: "wrap" }}>
          {([
            ["Jouer", "/play"],
            ["Connexion", "/login"],
            ["Présentation", "/promo"],
          ] as [string, string][]).map(([label, href]) => (
            <Link key={label} href={href} style={{ color: C.faint, textDecoration: "none", fontSize: "0.8rem" }}>{label}</Link>
          ))}
        </div>
        <p style={{ color: "#1e1a2e", fontSize: "0.75rem" }}>
          © 2026 ChronoRelic — Kairos : l&apos;instant où tout bascule
        </p>
      </footer>

    </div>
  )
}
