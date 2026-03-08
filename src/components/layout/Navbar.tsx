"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { signOut } from "next-auth/react"
import { cn, formatShards } from "@/lib/utils"
import {
  Clock, Grid3X3, Package, Star, Castle, User, LayoutDashboard,
  LogOut, Menu, X, Coins, Zap, Trophy, Hammer, ScrollText,
  Compass, Link2, Cog, FlaskConical
} from "lucide-react"

interface NavbarProps {
  user: {
    name:          string
    email:         string
    role:          string
    isPremium:     boolean
    temporalShards?: number
    level?:        number
  }
}

const NAV_LINKS = [
  { href: "/play",        label: "Capturer",   icon: Clock },
  { href: "/collection",  label: "Collection", icon: Grid3X3 },
  { href: "/inventory",   label: "Inventaire", icon: Package },
  { href: "/sanctuaire",  label: "Sanctuaire", icon: Castle },
  { href: "/atelier",     label: "Atelier",    icon: Hammer },
  { href: "/machine",     label: "Machine",    icon: Cog },
  { href: "/research",    label: "Recherche",  icon: FlaskConical },
  { href: "/expedition",  label: "Expédition", icon: Compass },
  { href: "/chaines",     label: "Chaînes",    icon: Link2 },
  { href: "/talents",     label: "Talents",    icon: Star },
  { href: "/quetes",      label: "Quêtes",     icon: ScrollText },
  { href: "/leaderboard", label: "Classement", icon: Trophy },
  { href: "/profile",     label: "Profil",     icon: User },
]

export function Navbar({ user }: NavbarProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const isAdmin = user.role === "ADMIN"

  return (
    <>
      {/* ── Barre principale ── */}
      <nav className="fixed top-0 left-0 right-0 z-40 h-16 navbar-fantasy">
        <div className="h-full flex items-center justify-between px-3 lg:px-5 max-w-screen-2xl mx-auto">

          {/* Logo */}
          <Link href="/play" className="flex items-center gap-2 shrink-0 group">
            <motion.span
              className="text-xl"
              animate={{ rotate: [0, 8, -8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            >
              ⏳
            </motion.span>
            <span
              className="font-display font-black text-base tracking-wider hidden sm:block"
              style={{ color: "#c084fc", textShadow: "0 0 12px rgba(155,93,229,0.5)" }}
            >
              ChronoRelic
            </span>
          </Link>

          {/* Séparateur vertical */}
          <div className="hidden md:block h-7 w-px bg-gradient-to-b from-transparent via-[rgba(107,40,200,0.3)] to-transparent mx-2 shrink-0" />

          {/* Nav desktop — scrollable */}
          <div className="hidden md:flex items-center gap-0.5 overflow-x-auto flex-1 min-w-0 scrollbar-none">
            {NAV_LINKS.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href || pathname.startsWith(href + "/")
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "nav-link-fantasy flex items-center gap-1",
                    isActive && "active"
                  )}
                >
                  <Icon className="h-3 w-3 shrink-0" />
                  <span>{label}</span>
                </Link>
              )
            })}

            {isAdmin && (
              <Link
                href="/admin"
                className={cn(
                  "nav-link-fantasy flex items-center gap-1",
                  pathname.startsWith("/admin") && "active"
                )}
                style={{ color: pathname.startsWith("/admin") ? "#f5d678" : "#9b8d7a" }}
              >
                <LayoutDashboard className="h-3 w-3 shrink-0" />
                <span>Admin</span>
              </Link>
            )}
          </div>

          {/* Séparateur vertical */}
          <div className="hidden md:block h-7 w-px bg-gradient-to-b from-transparent via-[rgba(107,40,200,0.3)] to-transparent mx-2 shrink-0" />

          {/* Droite — ressources + user */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Éclats temporels */}
            <Link
              href="/shop"
              className="hidden sm:flex items-center gap-1.5 rounded px-2 py-1 transition-colors"
              style={{ background: "rgba(107,40,200,0.08)", border: "1px solid rgba(107,40,200,0.2)" }}
            >
              <Coins className="h-3.5 w-3.5" style={{ color: "#c084fc" }} />
              <span className="text-xs font-bold" style={{ color: "#e2e8f0" }}>
                {formatShards(user.temporalShards ?? 0)}
              </span>
            </Link>

            {/* Badge premium */}
            {user.isPremium && (
              <div
                className="hidden sm:flex items-center gap-1 rounded px-2 py-1"
                style={{ background: "rgba(107,40,200,0.12)", border: "1px solid rgba(155,93,229,0.35)" }}
              >
                <Zap className="h-3 w-3" style={{ color: "#c084fc" }} />
                <span className="text-xs font-bold" style={{ color: "#e2e8f0" }}>Premium</span>
              </div>
            )}

            {/* Niveau */}
            {user.level !== undefined && (
              <div
                className="hidden sm:flex items-center justify-center w-7 h-7 rounded"
                style={{
                  background: "rgba(107,40,200,0.15)",
                  border: "1px solid rgba(155,93,229,0.35)",
                }}
              >
                <span className="text-xs font-black" style={{ color: "#c084fc" }}>{user.level}</span>
              </div>
            )}

            {/* Déconnexion */}
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="p-1.5 rounded transition-colors"
              style={{ color: "#64748b" }}
              title="Se déconnecter"
              onMouseEnter={e => (e.currentTarget.style.color = "#ef4444")}
              onMouseLeave={e => (e.currentTarget.style.color = "#64748b")}
            >
              <LogOut className="h-4 w-4" />
            </button>

            {/* Menu mobile */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-1.5 rounded transition-colors"
              style={{ color: "#64748b" }}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* ── Menu mobile ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-16 left-0 right-0 z-30 md:hidden"
            style={{
              background: "linear-gradient(180deg, #0f0c1d 0%, #0b0917 100%)",
              borderBottom: "1px solid rgba(196,150,10,0.3)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.7)",
            }}
          >
            <div className="grid grid-cols-3 gap-1 p-3">
              {NAV_LINKS.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded text-xs font-medium transition-colors"
                    style={{
                      color: isActive ? "#c084fc" : "#64748b",
                      background: isActive ? "rgba(107,40,200,0.12)" : "transparent",
                      border: `1px solid ${isActive ? "rgba(155,93,229,0.3)" : "transparent"}`,
                    }}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {label}
                  </Link>
                )
              })}
            </div>

            {/* Footer mobile */}
            <div
              className="flex items-center justify-between px-4 py-3"
              style={{ borderTop: "1px solid rgba(107,40,200,0.2)" }}
            >
              <div className="flex items-center gap-2">
                <Coins className="h-4 w-4" style={{ color: "#c084fc" }} />
                <span className="text-sm font-bold" style={{ color: "#e2e8f0" }}>
                  {formatShards(user.temporalShards ?? 0)} éclats
                </span>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex items-center gap-1.5 text-xs transition-colors"
                style={{ color: "#64748b" }}
              >
                <LogOut className="h-4 w-4" />
                Déconnexion
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
