import { Rarity, CharacterClass, CLASS_CONFIG, RARITY_CONFIG } from "@/types"

// ─────────────────────────────────────────────
// MOTEUR DE RARETÉ
// Système de tirage pondéré avec bonus de classe
// ─────────────────────────────────────────────

interface RarityDrawOptions {
  characterClass?: CharacterClass
  boostActive?: boolean     // Boost de rareté acheté
  isBlessedMinute?: boolean // Minute personnelle
  guaranteedRare?: boolean  // Chasseur Instinct de Chasse — guaranteed RARE+
  comboMultiplier?: number  // Multiplicateur de combo
  talentBonuses?: {
    chanceRare?:       number  // % additionnel RARE (Chasseur: radar_reliques)
    chanceEpique?:     number  // % additionnel ÉPIQUE
    chanceLegendaire?: number  // % additionnel LÉGENDAIRE (Oracle)
    chanceMythique?:   number  // % additionnel MYTHIQUE
  }
}

export function drawRarity(opts: RarityDrawOptions = {}): Rarity {
  const {
    characterClass,
    boostActive = false,
    isBlessedMinute = false,
    guaranteedRare = false,
    talentBonuses = {},
  } = opts

  // CHASSEUR Instinct de Chasse: guaranteed RARE+ — COMMUNE impossible
  if (guaranteedRare) {
    const chances: Record<Rarity, number> = {
      COMMUNE:     0,
      RARE:       52,
      EPIQUE:     characterClass === "CHASSEUR" ? 32 : 28,
      LEGENDAIRE: characterClass === "CHASSEUR" ? 13 : 15,
      MYTHIQUE:    5,
    }
    if (talentBonuses.chanceEpique)     chances.EPIQUE     += talentBonuses.chanceEpique
    if (talentBonuses.chanceLegendaire) chances.LEGENDAIRE += talentBonuses.chanceLegendaire
    if (talentBonuses.chanceMythique)   chances.MYTHIQUE   += talentBonuses.chanceMythique
    const total = Object.values(chances).reduce((a, b) => a + b, 0)
    const roll  = Math.random() * total
    let cumulative = 0
    // Skip COMMUNE (chance=0), iterate RARE→MYTHIQUE
    for (const [rarity, chance] of Object.entries(chances) as [Rarity, number][]) {
      if (rarity === "COMMUNE") continue
      cumulative += chance
      if (roll < cumulative) return rarity
    }
    return "RARE" // safety fallback — never COMMUNE
  }

  // Probabilités de base — équilibrées pour rendre le jeu plus satisfaisant
  let chances: Record<Rarity, number> = {
    COMMUNE:    48,
    RARE:       32,
    EPIQUE:     14,
    LEGENDAIRE:  5,
    MYTHIQUE:    1,
  }

  // Bonus de classe
  if (characterClass) {
    if (characterClass === "ORACLE") {
      chances.LEGENDAIRE *= 2
      chances.MYTHIQUE   *= 2
    }
    if (characterClass === "CHASSEUR") {
      chances.EPIQUE     *= 1.3
      chances.LEGENDAIRE *= 1.3
    }
  }

  // Boost actif (+50% rareté → réduction Commune)
  if (boostActive) {
    chances.COMMUNE    *= 0.6
    chances.RARE       *= 1.2
    chances.EPIQUE     *= 1.4
    chances.LEGENDAIRE *= 1.5
    chances.MYTHIQUE   *= 1.6
  }

  // Minute bénie (+200% — forte réduction du Commune)
  if (isBlessedMinute) {
    chances.COMMUNE    *= 0.3
    chances.RARE       *= 1.5
    chances.EPIQUE     *= 2.0
    chances.LEGENDAIRE *= 2.0
    chances.MYTHIQUE   *= 2.0
  }

  // Bonus talents additifs
  if (talentBonuses.chanceRare)       chances.RARE       += talentBonuses.chanceRare
  if (talentBonuses.chanceEpique)     chances.EPIQUE     += talentBonuses.chanceEpique
  if (talentBonuses.chanceLegendaire) chances.LEGENDAIRE += talentBonuses.chanceLegendaire
  if (talentBonuses.chanceMythique)   chances.MYTHIQUE   += talentBonuses.chanceMythique

  // Normaliser pour que le total = 100
  const total = Object.values(chances).reduce((a, b) => a + b, 0)
  const normalized = (Object.entries(chances) as [Rarity, number][]).map(
    ([r, c]) => [r, (c / total) * 100] as [Rarity, number]
  )

  // Tirage aléatoire pondéré
  const roll = Math.random() * 100
  let cumulative = 0
  for (const [rarity, chance] of normalized) {
    cumulative += chance
    if (roll <= cumulative) return rarity
  }

  return "COMMUNE"
}

// ─────────────────────────────────────────────
// CALCUL D'XP
// ─────────────────────────────────────────────

interface XPOptions {
  rarity: Rarity
  characterClass?: CharacterClass
  hasHistoricalEvent?: boolean
  comboCount?: number
  isBlessedMinute?: boolean
  talentDistorsion?:    number  // +10% XP/niveau (CHRONOMANCER)
  talentErudit?:        number  // +50% XP events/niveau (ARCHIVISTE)
  talentMemoireVive?:   number  // +20% XP RARE+/niveau (ARCHIVISTE)
  talentEruditSupreme?: number  // ×2 XP ÉPIQUE+ (ARCHIVISTE)
  talentFluxDivin?:     number  // +50% XP LÉGENDAIRE+/niveau (ORACLE)
  jackpotRoll?: boolean         // Talent jackpot_xp (CHASSEUR)
}

export function calculateXP(opts: XPOptions): number {
  const {
    rarity,
    characterClass,
    hasHistoricalEvent = false,
    comboCount = 0,
    isBlessedMinute = false,
    talentDistorsion    = 0,
    talentErudit        = 0,
    talentMemoireVive   = 0,
    talentEruditSupreme = 0,
    talentFluxDivin     = 0,
    jackpotRoll = false,
  } = opts

  let xp = RARITY_CONFIG[rarity].xp

  // Bonus de classe
  if (characterClass) {
    const bonus = CLASS_CONFIG[characterClass].rarityBonus[rarity]
    if (bonus) xp = Math.floor(xp * bonus)
  }

  // Événement historique (+50% + talent Érudit)
  if (hasHistoricalEvent) {
    const eventMultiplier = 1.5 + (talentErudit * 0.2)
    xp = Math.floor(xp * eventMultiplier)
  }

  // Minute bénie (+200%)
  if (isBlessedMinute) {
    xp = Math.floor(xp * 3)
  }

  // Combo bonus (max +50%)
  if (comboCount > 0) {
    const comboBonus = Math.min(comboCount * 0.1, 0.5)
    xp = Math.floor(xp * (1 + comboBonus))
  }

  // Talent Distorsion (+10%/niveau — CHRONOMANCIEN)
  if (talentDistorsion > 0) {
    xp = Math.floor(xp * (1 + talentDistorsion * 0.1))
  }

  // Talent Mémoire Vive (+20% RARE+ par niveau — ARCHIVISTE)
  const isRarePlus = rarity !== "COMMUNE"
  if (talentMemoireVive > 0 && isRarePlus) {
    xp = Math.floor(xp * (1 + talentMemoireVive * 0.2))
  }

  // Talent Érudit Suprême (×2 ÉPIQUE+ — ARCHIVISTE)
  const isEpicPlus = ["EPIQUE", "LEGENDAIRE", "MYTHIQUE"].includes(rarity)
  if (talentEruditSupreme > 0 && isEpicPlus) {
    xp = Math.floor(xp * 2)
  }

  // Talent Flux Divin (+50% LÉGENDAIRE+/niveau — ORACLE)
  const isLegPlus = rarity === "LEGENDAIRE" || rarity === "MYTHIQUE"
  if (talentFluxDivin > 0 && isLegPlus) {
    xp = Math.floor(xp * (1 + talentFluxDivin * 0.5))
  }

  // Jackpot (×3 — CHASSEUR)
  if (jackpotRoll) {
    xp = Math.floor(xp * 3)
  }

  return Math.max(xp, 1)
}

// ─────────────────────────────────────────────
// DÉTECTION MINUTE BÉNIE
// ─────────────────────────────────────────────

export function isBlessedMinute(minute: string, blessedMinutes: string[]): boolean {
  return blessedMinutes.includes(minute)
}

// ─────────────────────────────────────────────
// DÉTECTION COLLECTION SECRÈTE
// ─────────────────────────────────────────────

export function isSecretMinute(minute: string): boolean {
  const secretMinutes = ["00:00", "11:11", "12:21", "12:34", "13:31", "22:22", "23:23"]
  return secretMinutes.includes(minute)
}

// ─────────────────────────────────────────────
// TIRAGE JACKPOT
// ─────────────────────────────────────────────

export function rollJackpot(talentLevel: number): boolean {
  const chance = talentLevel > 0 ? 0.05 * talentLevel : 0
  return Math.random() < chance
}
