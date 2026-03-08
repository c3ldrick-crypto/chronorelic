"use client"

import { useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { SHARD_PACKS, SHARD_SHOP } from "@/types"
import { Coins, Zap, Star, CheckCircle, ShoppingCart } from "lucide-react"
import { cn } from "@/lib/utils"

function ShopContent() {
  const searchParams = useSearchParams()
  const success      = searchParams.get("success")
  const canceled     = searchParams.get("canceled")

  const [loading, setLoading] = useState<string | null>(null)

  async function handlePurchase(productKey: string) {
    setLoading(productKey)
    try {
      const res  = await fetch("/api/stripe/checkout", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ productKey }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        toast.error("Erreur lors du paiement")
      }
    } catch {
      toast.error("Erreur réseau")
    }
    setLoading(null)
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {success && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-4 mb-8 border border-emerald-500/30 flex items-center gap-3"
        >
          <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />
          <div>
            <p className="text-sm font-bold text-emerald-300">Paiement réussi !</p>
            <p className="text-xs text-emerald-400">Votre achat a été traité. Rechargez la page pour voir vos éclats.</p>
          </div>
        </motion.div>
      )}

      <div className="mb-10">
        <h1 className="font-display text-3xl font-black text-gradient-gold mb-2">Boutique Temporelle</h1>
        <p className="text-[#94a3b8]">Améliorez votre expérience de Gardien du Temps</p>
      </div>

      {/* Premium */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-3xl p-8 mb-10 border border-amber-500/30 relative overflow-hidden"
        style={{ boxShadow: "0 0 40px rgba(245, 158, 11, 0.15)" }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-6 w-6 text-amber-400" />
                <h2 className="font-display text-2xl font-black text-amber-300">Premium</h2>
                <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full px-2 py-0.5 font-bold">ACCÈS ILLIMITÉ</span>
              </div>
              <p className="text-[#94a3b8] mb-4 max-w-xl">
                Débloquez tout le potentiel de ChronoRelic. Captures illimitées, toutes les classes, fusion de reliques, portails temporels et plus encore.
              </p>
              <ul className="space-y-2 text-sm">
                {[
                  "Captures illimitées par jour",
                  "Toutes les classes (dont Archiviste et Oracle)",
                  "Fusion de reliques avancée",
                  "Portails temporels et mini-jeux",
                  "Progression jusqu'au niveau 100",
                  "Priorité sur les événements rares",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-amber-200">
                    <Star className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <div className="text-center shrink-0">
              <div className="text-4xl font-black font-display text-amber-300 mb-1">9,99 €</div>
              <div className="text-xs text-[#475569] mb-4">Achat unique — à vie</div>
              <Button
                variant="gold"
                size="lg"
                loading={loading === "PREMIUM"}
                onClick={() => handlePurchase("PREMIUM")}
                className="px-8"
              >
                <Zap className="h-5 w-5" />
                Devenir Premium
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Éclats temporels */}
      <h2 className="font-display text-xl font-black text-[#e2e8f0] mb-4 flex items-center gap-2">
        <Coins className="h-5 w-5 text-amber-400" />
        Éclats Temporels
      </h2>
      <p className="text-[#94a3b8] text-sm mb-6">
        Les Éclats Temporels permettent d&apos;acheter des boosts, des relances et des améliorations dans la boutique in-game.
      </p>

      <div className="grid sm:grid-cols-3 gap-4 mb-10">
        {SHARD_PACKS.map((pack, i) => (
          <motion.div
            key={pack.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={cn(
              "card-cosmic p-6 text-center relative",
              pack.popular && "border-violet-500/50 ring-1 ring-violet-500/20"
            )}
          >
            {pack.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-violet-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                Populaire
              </div>
            )}
            <div className="text-3xl mb-3">💎</div>
            <div className="font-bold text-[#e2e8f0] mb-1">{pack.label}</div>
            <div className="text-3xl font-black font-display text-amber-300 mb-1">{pack.shards}</div>
            {pack.bonus && <div className="text-xs text-emerald-400 font-semibold mb-3">{pack.bonus}</div>}
            <div className="text-sm text-[#94a3b8] mb-4">{pack.priceEur.toFixed(2).replace(".", ",")} €</div>
            <Button
              variant={pack.popular ? "default" : "outline"}
              size="sm"
              className="w-full"
              loading={loading === `SHARDS_${pack.id.toUpperCase()}`}
              onClick={() => handlePurchase(`SHARDS_${pack.id.toUpperCase()}`)}
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              Acheter
            </Button>
          </motion.div>
        ))}
      </div>

      {/* Boutique in-game */}
      <h2 className="font-display text-xl font-black text-[#e2e8f0] mb-4">Boutique In-Game</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        {SHARD_SHOP.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.05 }}
            className="card-cosmic p-4 flex items-center gap-4"
          >
            <div className="text-3xl shrink-0">{item.icon}</div>
            <div className="flex-1">
              <div className="font-semibold text-[#e2e8f0] text-sm">{item.label}</div>
              <div className="text-xs text-[#94a3b8]">{item.description}</div>
            </div>
            <div className="text-right shrink-0">
              <div className="flex items-center gap-1 text-amber-300 font-bold text-sm">
                <Coins className="h-3.5 w-3.5" />
                {item.cost}
              </div>
              <button className="text-xs text-violet-400 hover:text-violet-300 transition-colors mt-1">Acheter</button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-4xl animate-spin">⏳</div></div>}>
      <ShopContent />
    </Suspense>
  )
}
