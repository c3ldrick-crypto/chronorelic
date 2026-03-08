"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { signIn } from "next-auth/react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { CLASS_CONFIG, CharacterClass } from "@/types"
import { Mail, Lock, User, Eye, EyeOff, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"

const CLASSES: CharacterClass[] = ["CHRONOMANCER", "ARCHIVISTE", "CHASSEUR", "ORACLE"]

export default function RegisterPage() {
  const router = useRouter()

  const [step, setStep]   = useState<1 | 2>(1)
  const [form, setForm]   = useState({
    name:      "",
    email:     "",
    password:  "",
    class:     "" as CharacterClass | "",
  })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors]   = useState<Record<string, string>>({})

  function validateStep1() {
    const e: Record<string, string> = {}
    if (!form.name.trim())             e.name     = "Nom requis"
    if (!form.email.includes("@"))     e.email    = "Email invalide"
    if (form.password.length < 8)      e.password = "Minimum 8 caractères"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleNextStep(e: React.FormEvent) {
    e.preventDefault()
    if (validateStep1()) setStep(2)
  }

  async function handleSubmit() {
    if (!form.class) {
      toast.error("Choisissez une classe")
      return
    }
    setLoading(true)
    setErrors({})

    try {
      const res = await fetch("/api/auth/register", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          name:          form.name.trim(),
          email:         form.email.toLowerCase().trim(),
          password:      form.password,
          characterClass: form.class,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setErrors({ form: data.error ?? "Erreur lors de la création du compte." })
        toast.error("Création impossible", { description: data.error })
        setLoading(false)
        return
      }

      // Auto-login
      await signIn("credentials", {
        email:    form.email.toLowerCase().trim(),
        password: form.password,
        redirect: false,
      })

      toast.success("Bienvenue, " + form.name + " !", {
        description: "Votre aventure temporelle commence maintenant.",
      })

      router.push("/play")
      router.refresh()
    } catch {
      toast.error("Erreur réseau")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <span className="text-4xl">⏳</span>
            <span className="font-display text-2xl font-black text-gradient-violet">ChronoRelic</span>
          </Link>
          <h1 className="font-display text-3xl font-black text-[#e2e8f0] mb-2">
            {step === 1 ? "Créer un Compte" : "Choisir votre Classe"}
          </h1>
          <p className="text-[#94a3b8] text-sm">
            {step === 1 ? "Rejoignez les Gardiens du Temps" : "Votre classe définit votre style de jeu"}
          </p>
        </div>

        {/* Indicateur d'étape */}
        <div className="flex items-center gap-3 mb-6 justify-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step >= 1 ? "bg-violet-500 text-white" : "bg-[#1e1e42] text-[#475569]"}`}>
            {step > 1 ? <CheckCircle className="h-4 w-4" /> : "1"}
          </div>
          <div className="flex-1 max-w-16 h-px bg-[#1e1e42]" />
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step >= 2 ? "bg-violet-500 text-white" : "bg-[#1e1e42] text-[#475569]"}`}>
            2
          </div>
        </div>

        <div className="card-cosmic p-8">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.form
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleNextStep}
                className="space-y-5"
              >
                {errors.form && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-sm text-red-400">
                    {errors.form}
                  </div>
                )}

                <Input
                  label="Nom du Gardien"
                  placeholder="Votre nom d'explorateur"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  icon={<User className="h-4 w-4" />}
                  error={errors.name}
                  required
                />

                <Input
                  label="Email"
                  type="email"
                  placeholder="gardien@chronorelic.fr"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  icon={<Mail className="h-4 w-4" />}
                  error={errors.email}
                  required
                />

                <div>
                  <Input
                    label="Mot de passe"
                    type={showPwd ? "text" : "password"}
                    placeholder="Minimum 8 caractères"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    icon={<Lock className="h-4 w-4" />}
                    error={errors.password}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    className="flex items-center gap-1.5 mt-2 text-xs text-[#475569] hover:text-[#94a3b8] transition-colors"
                  >
                    {showPwd ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    {showPwd ? "Masquer" : "Afficher"}
                  </button>
                </div>

                <Button type="submit" className="w-full" size="lg">
                  Continuer →
                </Button>

                <p className="text-center text-sm text-[#475569]">
                  Déjà un compte ?{" "}
                  <Link href="/login" className="text-violet-400 hover:text-violet-300 font-semibold">
                    Se connecter
                  </Link>
                </p>
              </motion.form>
            ) : (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="grid gap-3">
                  {CLASSES.map((cls) => {
                    const config  = CLASS_CONFIG[cls]
                    const selected = form.class === cls
                    return (
                      <motion.button
                        key={cls}
                        type="button"
                        onClick={() => setForm({ ...form, class: cls })}
                        className={cn(
                          "relative w-full p-4 rounded-2xl border text-left transition-all duration-200",
                          selected
                            ? "border-violet-500 bg-violet-500/10 ring-2 ring-violet-500/20"
                            : "border-[#1e1e42] bg-[#0e0e24] hover:border-[#2e2e52] hover:bg-[#12122e]"
                        )}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-3xl">{config.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`font-bold text-sm ${selected ? "text-violet-300" : "text-[#e2e8f0]"}`}>
                                {config.label}
                              </span>
                            </div>
                            <p className="text-xs text-[#94a3b8] leading-relaxed">{config.description}</p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {config.bonuses.slice(0, 2).map((b) => (
                                <span key={b} className="text-[10px] bg-[#1e1e42] text-[#475569] px-2 py-0.5 rounded-full">
                                  {b}
                                </span>
                              ))}
                            </div>
                          </div>
                          {selected && (
                            <CheckCircle className="h-5 w-5 text-violet-400 shrink-0" />
                          )}
                        </div>
                      </motion.button>
                    )
                  })}
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="flex-1"
                  >
                    ← Retour
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    loading={loading}
                    disabled={!form.class}
                    className="flex-1"
                  >
                    Commencer !
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}
