import { MAX_LEVEL, LEVEL_MILESTONES } from "@/types"

// XP total cumulatif pour atteindre un niveau
// Courbe: xpForLevel(n) = floor(30 * (n-1)^1.5)
// Level 10 ≈ 810 XP, Level 20 ≈ 2484, Level 30 ≈ 4680, Level 50 ≈ 10290
export function xpForLevel(level: number): number {
  if (level <= 1) return 0
  const n = level - 1
  return Math.floor(30 * Math.pow(n, 1.5))
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

// Toujours 1 point "de progression" par niveau (simplifié — no talent system)
export function talentPointsForLevel(_level: number): number {
  return 0
}
