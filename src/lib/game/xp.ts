import { MAX_LEVEL, LEVEL_MILESTONES } from "@/types"

// XP requis pour atteindre un niveau (cumulatif)
// Courbe progressive : plus raide aux niveaux élevés, paliers tous les 10 niveaux
export function xpForLevel(level: number): number {
  if (level <= 1) return 0
  const n = level - 1
  // Courbe exponentielle avec accélération : lv1→10 rapide, lv10→30 moyen, lv30+ difficile
  if (n <= 9)  return Math.floor(80 * Math.pow(n, 1.4))             // ~80 → ~500 XP
  if (n <= 29) return Math.floor(120 * Math.pow(n, 1.6))            // ~700 → ~12k XP
  if (n <= 59) return Math.floor(160 * Math.pow(n, 1.85))           // ~15k → ~200k XP
  return Math.floor(200 * Math.pow(n, 2.1))                         // lv60+ : très difficile
}

// XP nécessaire pour passer du niveau `level` au `level+1`
export function xpToNextLevel(level: number): number {
  return xpForLevel(level + 1) - xpForLevel(level)
}

// Calcule le niveau à partir de l'XP total
export function levelFromXP(xpTotal: number): number {
  let level = 1
  while (level < MAX_LEVEL && xpForLevel(level + 1) <= xpTotal) {
    level++
  }
  return level
}

// Progression en % dans le niveau actuel
export function levelProgress(xpTotal: number): { level: number; progress: number; current: number; needed: number } {
  const level = levelFromXP(xpTotal)
  if (level >= MAX_LEVEL) {
    return { level: MAX_LEVEL, progress: 100, current: 0, needed: 0 }
  }
  const currentLevelXP = xpForLevel(level)
  const nextLevelXP    = xpForLevel(level + 1)
  const current        = xpTotal - currentLevelXP
  const needed         = nextLevelXP - currentLevelXP
  const progress       = Math.min((current / needed) * 100, 100)
  return { level, progress, current, needed }
}

// Points de talent gagnés : 1 par niveau + 1 bonus tous les 5 niveaux
export function talentPointsForLevel(level: number): number {
  return (level - 1) + Math.floor((level - 1) / 5)
}

// Titre selon le niveau (aligné avec LEVEL_MILESTONES)
export function titleForLevel(level: number): string {
  const milestones = [...LEVEL_MILESTONES].reverse()
  for (const m of milestones) {
    if (level >= m.level) return m.title
  }
  return "Éveillé"
}

// Retourne le prochain palier de déblocage
export function nextMilestone(level: number): { level: number; title: string; unlocks: string[] } | null {
  return LEVEL_MILESTONES.find(m => m.level > level) ?? null
}

// Vérifie si un niveau est un palier clé
export function isMilestoneLevel(level: number): boolean {
  return LEVEL_MILESTONES.some(m => m.level === level)
}
