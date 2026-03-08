import { type Rarity } from "@/types"

// Bonus passifs des reliques équipées par rareté (3 slots actifs)
export const EQUIP_BONUSES: Record<Rarity, { xpBonus: number; resourceBonus: number }> = {
  COMMUNE:    { xpBonus: 0.01, resourceBonus: 0.01 },
  RARE:       { xpBonus: 0.03, resourceBonus: 0.02 },
  EPIQUE:     { xpBonus: 0.06, resourceBonus: 0.04 },
  LEGENDAIRE: { xpBonus: 0.12, resourceBonus: 0.08 },
  MYTHIQUE:   { xpBonus: 0.25, resourceBonus: 0.15 },
}

// Récompenses d'analyse par rareté (cooldown 4h)
export const ANALYZE_REWARDS: Record<Rarity, { eclatsTemporels: number; chronite: number; essencesHistoriques: number; fragmentsAnomalie: number }> = {
  COMMUNE:    { eclatsTemporels: 2,  chronite: 1,  essencesHistoriques: 0, fragmentsAnomalie: 0 },
  RARE:       { eclatsTemporels: 5,  chronite: 3,  essencesHistoriques: 1, fragmentsAnomalie: 0 },
  EPIQUE:     { eclatsTemporels: 12, chronite: 7,  essencesHistoriques: 3, fragmentsAnomalie: 1 },
  LEGENDAIRE: { eclatsTemporels: 25, chronite: 15, essencesHistoriques: 8, fragmentsAnomalie: 3 },
  MYTHIQUE:   { eclatsTemporels: 60, chronite: 35, essencesHistoriques: 20, fragmentsAnomalie: 10 },
}

export const ANALYZE_COOLDOWN_MS = 4 * 60 * 60 * 1000 // 4 heures
