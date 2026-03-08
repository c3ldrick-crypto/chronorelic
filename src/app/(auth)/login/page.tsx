"use client"

import { useState, Suspense } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Mail, Lock, Eye, EyeOff } from "lucide-react"

function LoginForm() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const redirect     = searchParams.get("redirect") ?? "/play"
  const errorParam   = searchParams.get("error")

  const [form, setForm]         = useState({ email: "", password: "" })
  const [showPwd, setShowPwd]   = useState(false)
  const [loading, setLoading]   = useState(false)
  const [errors, setErrors]     = useState<Record<string, string>>({})

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    const result = await signIn("credentials", {
      email:    form.email.toLowerCase().trim(),
      password: form.password,
      redirect: false,
    })

    if (result?.error) {
      setErrors({ form: "Email ou mot de passe incorrect." })
      toast.error("Connexion impossible", { description: "Vérifiez vos identifiants." })
    } else {
      toast.success("Bienvenue !")
      router.push(redirect)
      router.refresh()
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {(errors.form || errorParam === "unauthorized") && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-sm text-red-400">
          {errors.form ?? "Accès non autorisé."}
        </div>
      )}

      <Input
        label="Email"
        type="email"
        placeholder="gardien@chronorelic.fr"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        icon={<Mail className="h-4 w-4" />}
        error={errors.email}
        required
        autoComplete="email"
      />

      <div>
        <Input
          label="Mot de passe"
          type={showPwd ? "text" : "password"}
          placeholder="••••••••"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          icon={<Lock className="h-4 w-4" />}
          error={errors.password}
          required
          autoComplete="current-password"
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

      <Button type="submit" className="w-full" size="lg" loading={loading}>
        Se connecter
      </Button>

      <p className="text-center text-sm text-[#475569]">
        Pas encore de compte ?{" "}
        <Link href="/register" className="text-violet-400 hover:text-violet-300 font-semibold">
          Créer un compte
        </Link>
      </p>
    </form>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6 group">
            <motion.span
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="text-4xl"
            >
              ⏳
            </motion.span>
            <span className="font-display text-2xl font-black text-gradient-violet">ChronoRelic</span>
          </Link>
          <h1 className="font-display text-3xl font-black text-[#e2e8f0] mb-2">Bienvenue</h1>
          <p className="text-[#94a3b8] text-sm">Connectez-vous pour capturer le temps</p>
        </div>

        <div className="card-cosmic p-8">
          <Suspense fallback={<div className="h-40" />}>
            <LoginForm />
          </Suspense>
        </div>
      </motion.div>
    </div>
  )
}
