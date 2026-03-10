"use client"

import { motion } from "framer-motion"
import { Hammer, Clock } from "lucide-react"
import Link from "next/link"

export default function CraftPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-20 pb-16">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative text-center max-w-sm space-y-8"
      >
        {/* Icon */}
        <motion.div
          className="mx-auto w-20 h-20 rounded-2xl flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, rgba(0,200,255,0.1), rgba(255,101,0,0.1))",
            border:     "1px solid rgba(0,200,255,0.2)",
            boxShadow:  "0 0 40px rgba(0,200,255,0.1)",
          }}
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          <Hammer className="h-9 w-9" style={{ color: "#00c8ff" }} />
        </motion.div>

        {/* Title */}
        <div className="space-y-3">
          <h1 className="text-3xl font-black tracking-wide" style={{ color: "#e2e8f0" }}>
            Atelier Temporel
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: "#64748b" }}>
            L'atelier de craft arrive bientôt. Forgez des artefacts temporels, 
            fusionnez des reliques et voyagez dans le passé.
          </p>
        </div>

        {/* Coming soon badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider"
          style={{
            background: "rgba(255,101,0,0.08)",
            border:     "1px solid rgba(255,101,0,0.3)",
            color:      "#ff6500",
          }}>
          <Clock className="h-3.5 w-3.5" />
          Bientôt disponible
        </div>

        {/* CTA */}
        <Link href="/play"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all"
          style={{
            background: "rgba(0,200,255,0.08)",
            border:     "1px solid rgba(0,200,255,0.25)",
            color:      "#00c8ff",
          }}>
          <Clock className="h-4 w-4" />
          Continuer à capturer
        </Link>
      </motion.div>
    </div>
  )
}
