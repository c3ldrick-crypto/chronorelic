import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Rarity } from "@/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatMinute(date: Date = new Date()): string {
  // Use direct math — avoids locale-dependent separators (e.g. "14 h 37" on some Node.js builds)
  const h = String(date.getHours()).padStart(2, "0")
  const m = String(date.getMinutes()).padStart(2, "0")
  return `${h}:${m}`
}

export function formatCaptureDate(date: Date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

export function formatTime(date: Date = new Date()): string {
  return date.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })
}

export function minuteToIndex(minute: string): number {
  const [h, m] = minute.split(":").map(Number)
  return h * 60 + m
}

export function indexToMinute(index: number): string {
  const h = Math.floor(index / 60)
  const m = index % 60
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
}

export function getRarityBorderClass(rarity: Rarity): string {
  switch (rarity) {
    case "COMMUNE":    return "border-slate-600"
    case "RARE":       return "border-blue-500"
    case "EPIQUE":     return "border-violet-500"
    case "LEGENDAIRE": return "border-amber-500"
    case "MYTHIQUE":   return "border-pink-500"
  }
}

export function getRarityGlowStyle(rarity: Rarity): React.CSSProperties {
  const glows: Record<Rarity, string> = {
    COMMUNE:    "none",
    RARE:       "0 0 12px rgba(59, 130, 246, 0.4)",
    EPIQUE:     "0 0 16px rgba(139, 92, 246, 0.5)",
    LEGENDAIRE: "0 0 20px rgba(245, 158, 11, 0.6)",
    MYTHIQUE:   "0 0 30px rgba(236, 72, 153, 0.7), 0 0 60px rgba(236, 72, 153, 0.3)",
  }
  return { boxShadow: glows[rarity] }
}

export function getRarityLabel(rarity: Rarity): string {
  const labels: Record<Rarity, string> = {
    COMMUNE:    "Commune",
    RARE:       "Rare",
    EPIQUE:     "Épique",
    LEGENDAIRE: "Légendaire",
    MYTHIQUE:   "Mythique",
  }
  return labels[rarity]
}

export function formatXP(xp: number): string {
  if (xp >= 1000000) return `${(xp / 1000000).toFixed(1)}M XP`
  if (xp >= 1000)    return `${(xp / 1000).toFixed(1)}k XP`
  return `${xp} XP`
}

export function formatShards(shards: number): string {
  if (shards >= 1000) return `${(shards / 1000).toFixed(1)}k`
  return String(shards)
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export function formatRelativeTime(date: Date | string): string {
  const now = new Date()
  const d = new Date(date)
  const diff = now.getTime() - d.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return "à l'instant"
  if (minutes < 60) return `il y a ${minutes}min`
  if (hours < 24) return `il y a ${hours}h`
  if (days < 7) return `il y a ${days}j`
  return formatDate(d)
}

export function generateStars(count: number): { x: number; y: number; size: number; delay: number; duration: number }[] {
  return Array.from({ length: count }, () => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 0.5,
    delay: Math.random() * 5,
    duration: Math.random() * 3 + 2,
  }))
}

// Import React type for CSSProperties usage
import type React from "react"
