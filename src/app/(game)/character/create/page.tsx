"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

const CLASSES = [
  {
    id:    "CHRONOMANCER",
    label: "Chronomancien",
    icon:  "⏰",
    desc:  "Maître du temps. Peut relancer les minutes pour de meilleures reliques.",
  },
  {
    id:    "ARCHIVISTE",
    label: "Archiviste",
    icon:  "📚",
    desc:  "Expert en histoire. Gagne 30% de XP supplémentaire sur toutes les captures.",
  },
  {
    id:    "CHASSEUR",
    label: "Chasseur",
    icon:  "⚡",
    desc:  "Traqueur de reliques. Probabilités de rareté élevée augmentées.",
  },
  {
    id:    "ORACLE",
    label: "Oracle Temporel",
    icon:  "🔮",
    desc:  "Voyant du futur. Accès aux anomalies temporelles et visions mythiques.",
  },
]

export default function CreateCharacterPage() {
  const router = useRouter()
  const [name,      setName]      = useState("")
  const [charClass, setCharClass] = useState("")
  const [loading,   setLoading]   = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !charClass) {
      toast.error("Remplis tous les champs.")
      return
    }
    setLoading(true)
    try {
      const res  = await fetch("/api/game/character", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ name: name.trim(), class: charClass }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? "Erreur lors de la création")
        return
      }
      toast.success("Personnage créé ! Bon voyage dans le temps.")
      router.push("/play")
    } catch {
      toast.error("Erreur réseau")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="card-cosmic p-8 w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🧙</div>
          <h1 className="font-display text-3xl font-black text-gradient-violet">
            Créer votre Gardien
          </h1>
          <p className="text-[#94a3b8] mt-2">Choisissez votre identité de Gardien du Temps</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-[#e2e8f0] mb-2">
              Nom du Gardien
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Votre nom d'explorateur"
              minLength={2}
              maxLength={50}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[#e2e8f0] placeholder-[#475569] focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#e2e8f0] mb-3">
              Classe
            </label>
            <div className="grid grid-cols-2 gap-3">
              {CLASSES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCharClass(c.id)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    charClass === c.id
                      ? "border-violet-500 bg-violet-500/20"
                      : "border-white/10 bg-white/5 hover:border-white/20"
                  }`}
                >
                  <div className="text-2xl mb-1">{c.icon}</div>
                  <div className="font-semibold text-[#e2e8f0] text-sm">{c.label}</div>
                  <div className="text-[#475569] text-xs mt-1">{c.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !name.trim() || !charClass}
            className="btn-primary w-full py-3 rounded-xl font-bold text-lg disabled:opacity-50"
          >
            {loading ? "Création..." : "Commencer l'aventure →"}
          </button>
        </form>
      </div>
    </div>
  )
}
