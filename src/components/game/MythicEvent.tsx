"use client"

import { useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Rarity, RARITY_CONFIG } from "@/types"

interface MythicEventProps {
  rarity:   Rarity
  minute:   string
  visible:  boolean
  onClose:  () => void
  narration?: string
  eventTitle?: string
}

const RARITY_SCREENS: Record<Rarity, {
  bg:      string
  text:    string
  title:   string
  subtitle: string
  particles: string
}> = {
  COMMUNE: {
    bg:        "from-slate-900 to-slate-800",
    text:      "text-slate-300",
    title:     "INSTANT CAPTURÉ",
    subtitle:  "Une relique ordinaire.",
    particles: "#6b7280",
  },
  RARE: {
    bg:        "from-blue-950 to-slate-900",
    text:      "text-blue-300",
    title:     "RELIQUE RARE",
    subtitle:  "Le temps chuchote...",
    particles: "#3b82f6",
  },
  EPIQUE: {
    bg:        "from-violet-950 to-slate-900",
    text:      "text-violet-300",
    title:     "RELIQUE ÉPIQUE",
    subtitle:  "Le tissu du temps frémit.",
    particles: "#8b5cf6",
  },
  LEGENDAIRE: {
    bg:        "from-amber-950 to-slate-900",
    text:      "text-amber-300",
    title:     "RELIQUE LÉGENDAIRE",
    subtitle:  "Un éclat de destin entre vos mains.",
    particles: "#f59e0b",
  },
  MYTHIQUE: {
    bg:        "from-pink-950 via-violet-950 to-slate-900",
    text:      "text-pink-300",
    title:     "ANOMALIE TEMPORELLE",
    subtitle:  "Les dimensions convergent.",
    particles: "#ec4899",
  },
}

export function MythicEvent({ rarity, minute, visible, onClose, narration, eventTitle }: MythicEventProps) {
  const config = RARITY_CONFIG[rarity]
  const screen = RARITY_SCREENS[rarity]
  const isMythique = rarity === "MYTHIQUE"
  const isLegendaire = rarity === "LEGENDAIRE" || isMythique
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (visible && isLegendaire) {
      // Fermeture automatique après 8s pour les légendaires, 12s pour mythiques
      const timer = setTimeout(onClose, isMythique ? 12000 : 8000)
      return () => clearTimeout(timer)
    }
  }, [visible, isMythique, isLegendaire, onClose])

  // Particules flottantes
  const particles = Array.from({ length: isMythique ? 40 : isLegendaire ? 24 : 12 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 2,
    duration: Math.random() * 3 + 2,
    size: Math.random() * 6 + 2,
  }))

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={!isMythique ? onClose : undefined}
        >
          {/* Fond */}
          <motion.div
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`absolute inset-0 bg-gradient-to-br ${screen.bg}`}
          />

          {/* Particules */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {particles.map((p) => (
              <motion.div
                key={p.id}
                className="absolute rounded-full"
                style={{
                  left:            `${p.x}%`,
                  bottom:          "-20px",
                  width:           `${p.size}px`,
                  height:          `${p.size}px`,
                  backgroundColor: screen.particles,
                  opacity:         0.7,
                }}
                animate={{
                  y:       [0, -(window?.innerHeight ?? 800) - 40],
                  x:       [0, (Math.random() - 0.5) * 200],
                  opacity: [0, 0.8, 0],
                  scale:   [0, 1, 0.5],
                }}
                transition={{
                  duration: p.duration,
                  delay:    p.delay,
                  repeat:   Infinity,
                  ease:     "easeOut",
                }}
              />
            ))}
          </div>

          {/* Anneau lumineux (Mythique) */}
          {isMythique && (
            <>
              <motion.div
                className="absolute rounded-full border-2 border-pink-400/30"
                style={{ width: "600px", height: "600px" }}
                animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                transition={{ rotate: { duration: 8, repeat: Infinity, ease: "linear" }, scale: { duration: 2, repeat: Infinity } }}
              />
              <motion.div
                className="absolute rounded-full border border-violet-400/20"
                style={{ width: "800px", height: "800px" }}
                animate={{ rotate: -360 }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
              />
            </>
          )}

          {/* Contenu */}
          <motion.div
            initial={{ scale: 0.5, y: 40, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 20 }}
            className="relative z-10 text-center px-8 max-w-2xl"
          >
            {/* Emoji rareté */}
            <motion.div
              animate={isMythique ? {
                scale:   [1, 1.2, 1],
                rotate:  [0, 5, -5, 0],
              } : {}}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-8xl mb-6"
            >
              {config.emoji}
            </motion.div>

            {/* Titre détecté */}
            {isMythique && (
              <motion.p
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-xs font-bold tracking-[0.4em] text-pink-400 uppercase mb-2"
              >
                ⚠ ANOMALIE TEMPORELLE DÉTECTÉE ⚠
              </motion.p>
            )}

            {/* Minute */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
              className="font-display text-7xl font-black text-white tracking-widest mb-4"
              style={isMythique ? {
                textShadow: `0 0 40px rgba(236, 72, 153, 0.8), 0 0 80px rgba(139, 92, 246, 0.4)`,
              } : isLegendaire ? {
                textShadow: `0 0 30px rgba(245, 158, 11, 0.7)`,
              } : undefined}
            >
              {minute}
            </motion.div>

            {/* Titre de rareté */}
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className={`text-2xl font-bold tracking-wider mb-2 ${screen.text}`}
            >
              {screen.title}
            </motion.h2>

            {/* Événement historique */}
            {eventTitle && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-sm text-amber-300 font-semibold mb-4"
              >
                {eventTitle}
              </motion.p>
            )}

            {/* Narration IA */}
            {narration && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
                className="glass rounded-2xl p-4 mb-6 text-sm text-[#94a3b8] leading-relaxed italic max-h-40 overflow-y-auto"
              >
                &quot;{narration}&quot;
              </motion.div>
            )}

            {/* XP et rareté */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="flex items-center justify-center gap-4 mb-8"
            >
              <span className={`text-lg font-bold ${screen.text}`}>
                {config.emoji} {config.label}
              </span>
              <span className="text-emerald-400 font-bold text-lg">+{config.xp} XP</span>
            </motion.div>

            {/* Bouton fermer */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              onClick={onClose}
              className="btn-primary px-8 py-3 rounded-full text-sm font-bold"
            >
              {isMythique ? "Contempler la Relique" : "Continuer"}
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
