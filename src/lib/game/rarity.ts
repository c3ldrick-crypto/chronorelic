import { Rarity, CharacterClass, CLASS_CONFIG, RARITY_CONFIG } from "@/types"

// ─────────────────────────────────────────────
// RARETÉ MAXIMUM PAR NIVEAU
// Tous les 10 niveaux, une nouvelle rareté se débloque
// ─────────────────────────────────────────────

export function getMaxRarityForLevel(level: number): Rarity {
  if (level >= 40) return "MYTHIQUE"
  if (level >= 30) return "LEGENDAIRE"
  if (level >= 20) return "EPIQUE"
  if (level >= 10) return "RARE"
  return "COMMUNE"
}

const RARITY_ORDER: Rarity[] = ["COMMUNE", "RARE", "EPIQUE", "LEGENDAIRE", "MYTHIQUE"]

export function rarityIndex(rarity: Rarity): number {
  return RARITY_ORDER.indexOf(rarity)
}

// ─────────────────────────────────────────────
// MOTEUR DE RARETÉ
// Tirage pondéré avec gating par niveau
// ─────────────────────────────────────────────

interface RarityDrawOptions {
  characterClass?: CharacterClass
  boostActive?:    boolean
  playerLevel?:    number
}

export function drawRarity(opts: RarityDrawOptions = {}): Rarity {
  const { characterClass, boostActive = false, playerLevel = 1 } = opts

  const maxRarity  = getMaxRarityForLevel(playerLevel)
  const maxIndex   = rarityIndex(maxRarity)
  const available  = RARITY_ORDER.slice(0, maxIndex + 1)

  // Probabilités de base
  const base: Record<Rarity, number> = {
    COMMUNE:    60,
    RARE:       28,
    EPIQUE:     9,
    LEGENDAIRE: 2.5,
    MYTHIQUE:   0.5,
  }

  // Bonus de classe
  if (characterClass) {
    if (characterClass === "ORACLE") {
      base.LEGENDAIRE *= 2
      base.MYTHIQUE   *= 2
    }
    if (characterClass === "CHASSEUR") {
      base.EPIQUE     *= 1.3
      base.LEGENDAIRE *= 1.3
    }
  }

  // Boost actif (+50% rareté)
  if (boostActive) {
    base.COMMUNE    *= 0.6
    base.RARE       *= 1.2
    base.EPIQUE     *= 1.4
    base.LEGENDAIRE *= 1.5
    base.MYTHIQUE   *= 1.6
  }

  // Ne conserver que les raretés disponibles pour ce niveau
  const filtered = available.map(r => ({ rarity: r, weight: base[r] }))
  const total    = filtered.reduce((acc, f) => acc + f.weight, 0)
  const roll     = Math.random() * total

  let cumulative = 0
  for (const { rarity, weight } of filtered) {
    cumulative += weight
    if (roll <= cumulative) return rarity
  }

  return available[0] // fallback to lowest available
}

// ─────────────────────────────────────────────
// CALCUL D'XP
// ─────────────────────────────────────────────

interface XPOptions {
  rarity:              Rarity
  characterClass?:     CharacterClass
  hasHistoricalEvent?: boolean
  comboCount?:         number
}

export function calculateXP(opts: XPOptions): number {
  const { rarity, characterClass, hasHistoricalEvent = false, comboCount = 0 } = opts

  let xp = RARITY_CONFIG[rarity].xp

  // Bonus de classe
  if (characterClass) {
    const bonus = CLASS_CONFIG[characterClass].rarityBonus[rarity]
    if (bonus) xp = Math.floor(xp * bonus)
  }

  // Événement historique (+50%)
  if (hasHistoricalEvent) {
    xp = Math.floor(xp * 1.5)
  }

  // Combo bonus (max +50%)
  if (comboCount > 0) {
    const comboBonus = Math.min(comboCount * 0.1, 0.5)
    xp = Math.floor(xp * (1 + comboBonus))
  }

  return Math.max(xp, 1)
}

// ─────────────────────────────────────────────
// DÉTECTION MINUTE SECRÈTE
// ─────────────────────────────────────────────

export function isSecretMinute(minute: string): boolean {
  const secretMinutes = ["00:00", "11:11", "12:21", "12:34", "13:31", "22:22", "23:23"]
  return secretMinutes.includes(minute)
}

// ─────────────────────────────────────────────
// DÉTECTION MINUTE BÉNIE (personnelle)
// ─────────────────────────────────────────────

export function isBlessedMinute(_minute: string, _blessedMinutes: string[]): boolean {
  return false // Simplified — no blessed minutes in v2
}
