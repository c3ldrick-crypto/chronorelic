// Essence types & drop tables for ChronoRelic

export type EssenceType =
  | "chronoEssence"
  | "connaissanceTemp"
  | "energieResiduelle"
  | "residuAncestral"
  | "fluxHistorique"
  | "eclatMemoire"
  | "cristalParadoxal"
  | "larmeTemporelle"
  | "fluxAnomique"
  | "quintessence"
  | "memoireVive"
  | "fluxStabilise"
  | "essenceHeritage"
  | "quintessenceAbsolue"

export interface EssenceMeta {
  id: EssenceType
  label: string
  icon: string
  color: string
  description: string
  tier: "primary" | "secondary" | "hybrid"
}

export const ESSENCES: Record<EssenceType, EssenceMeta> = {
  chronoEssence:       { id: "chronoEssence",       label: "Chrono-Essence",      icon: "⧗", color: "text-violet-400",  description: "Carburant pur de la Machine Temporelle",          tier: "primary"   },
  connaissanceTemp:    { id: "connaissanceTemp",    label: "Connaissance",         icon: "📜", color: "text-amber-300",   description: "Fragments de savoir pour l'Arbre de Recherche",  tier: "primary"   },
  energieResiduelle:   { id: "energieResiduelle",   label: "Énergie Résiduelle",   icon: "⚡", color: "text-cyan-400",    description: "Énergie brute des événements technologiques",     tier: "primary"   },
  residuAncestral:     { id: "residuAncestral",     label: "Résidu Ancestral",     icon: "🏺", color: "text-orange-400",  description: "Poussière des ères les plus anciennes",           tier: "primary"   },
  fluxHistorique:      { id: "fluxHistorique",      label: "Flux Historique",      icon: "🌊", color: "text-blue-400",    description: "Courants d'énergie des événements majeurs",       tier: "primary"   },
  eclatMemoire:        { id: "eclatMemoire",        label: "Éclat de Mémoire",     icon: "💎", color: "text-pink-400",    description: "Cristaux rares des instants célèbres",            tier: "secondary" },
  cristalParadoxal:    { id: "cristalParadoxal",    label: "Cristal Paradoxal",    icon: "🔮", color: "text-purple-400",  description: "Né de la contradiction temporelle",               tier: "secondary" },
  larmeTemporelle:     { id: "larmeTemporelle",     label: "Larme Temporelle",     icon: "💧", color: "text-indigo-400",  description: "Consolation de l'échec transformée en force",    tier: "secondary" },
  fluxAnomique:        { id: "fluxAnomique",        label: "Flux Anomique",        icon: "🌀", color: "text-red-400",     description: "Énergie chaotique des anomalies temporelles",     tier: "secondary" },
  quintessence:        { id: "quintessence",        label: "Quintessence",         icon: "✦",  color: "text-yellow-300",  description: "Alliage pur pour les voyages profonds",           tier: "hybrid"    },
  memoireVive:         { id: "memoireVive",         label: "Mémoire Vive",         icon: "🧬", color: "text-emerald-400", description: "Connaissance cristallisée, double la recherche",  tier: "hybrid"    },
  fluxStabilise:       { id: "fluxStabilise",       label: "Flux Stabilisé",       icon: "🫧",  color: "text-sky-400",    description: "Anomalie domptée — capture anomalique sécurisée", tier: "hybrid"    },
  essenceHeritage:     { id: "essenceHeritage",     label: "Essence d'Héritage",   icon: "👁", color: "text-amber-500",   description: "Âme d'un ancêtre — enrichit les bonus d'héritage",tier: "hybrid"    },
  quintessenceAbsolue: { id: "quintessenceAbsolue", label: "Quintessence Absolue", icon: "☯",  color: "text-white",       description: "La forme ultime — accès aux millénaires oubliés", tier: "hybrid"    },
}

// Which essence drops based on event category (mode ESSENCE / HYBRIDE)
export const ESSENCE_BY_CATEGORY: Record<string, {
  primary: EssenceType
  secondary?: EssenceType
  secondaryChance: number
}> = {
  science:      { primary: "energieResiduelle",  secondary: "eclatMemoire",     secondaryChance: 0.12 },
  technology:   { primary: "energieResiduelle",  secondary: "cristalParadoxal", secondaryChance: 0.08 },
  politique:    { primary: "fluxHistorique",     secondary: "eclatMemoire",     secondaryChance: 0.10 },
  guerre:       { primary: "fluxHistorique",     secondary: "fluxAnomique",     secondaryChance: 0.15 },
  art:          { primary: "connaissanceTemp",   secondary: "eclatMemoire",     secondaryChance: 0.18 },
  exploration:  { primary: "connaissanceTemp",   secondary: "residuAncestral",  secondaryChance: 0.10 },
  philosophie:  { primary: "connaissanceTemp",   secondary: "larmeTemporelle",  secondaryChance: 0.08 },
  religion:     { primary: "residuAncestral",    secondary: "eclatMemoire",     secondaryChance: 0.12 },
  economie:     { primary: "fluxHistorique",     secondary: "cristalParadoxal", secondaryChance: 0.07 },
  default:      { primary: "chronoEssence",                                     secondaryChance: 0    },
}

// Essence quantities by rarity
export const ESSENCE_BY_RARITY: Record<string, {
  primaryQty: number
  chronoBase: number
  connaissanceBase: number
}> = {
  COMMUNE:    { primaryQty: 3,   chronoBase: 5,   connaissanceBase: 1  },
  RARE:       { primaryQty: 8,   chronoBase: 12,  connaissanceBase: 3  },
  EPIQUE:     { primaryQty: 18,  chronoBase: 28,  connaissanceBase: 8  },
  LEGENDAIRE: { primaryQty: 40,  chronoBase: 65,  connaissanceBase: 20 },
  MYTHIQUE:   { primaryQty: 100, chronoBase: 160, connaissanceBase: 50 },
}

// ── STAKE TIERS ──────────────────────────────────────────────────────────────

export type StakeTier = "OBSERVATION" | "INVESTISSEMENT" | "ENGAGEMENT" | "RITUEL"

export interface StakeConfig {
  id: StakeTier
  label: string
  description: string
  color: string
  icon: string
  multiplier: number
  successChanceBase: number
  deathRiskPct: number
  cost: {
    eclatsTemporels: number
    chronite?: number
    chronoEssence?: number
  }
  minLevel: number
}

export const STAKE_TIERS: Record<StakeTier, StakeConfig> = {
  OBSERVATION: {
    id: "OBSERVATION",
    label: "Observation",
    description: "Gratuit, sans risque. Rareté standard. Idéal pour débuter.",
    color: "text-slate-300",
    icon: "👁",
    multiplier: 1,
    successChanceBase: 0.92,
    deathRiskPct: 0,
    cost: { eclatsTemporels: 0 },
    minLevel: 1,
  },
  INVESTISSEMENT: {
    id: "INVESTISSEMENT",
    label: "Investissement",
    description: "×2.2 gains + bonus RARE garanti. Perte totale si échec. Sans risque de mort.",
    color: "text-amber-300",
    icon: "🪙",
    multiplier: 2.2,
    successChanceBase: 0.75,
    deathRiskPct: 0,
    cost: { eclatsTemporels: 50, chronite: 10 },
    minLevel: 1,
  },
  ENGAGEMENT: {
    id: "ENGAGEMENT",
    label: "Engagement",
    description: "×4 gains — RARE garantie minimum + boost ÉPIQUE. Risque de mort (niv. 11+).",
    color: "text-orange-400",
    icon: "⚔",
    multiplier: 4,
    successChanceBase: 0.52,
    deathRiskPct: 15,
    cost: { eclatsTemporels: 200, chronite: 50, chronoEssence: 5 },
    minLevel: 1,
  },
  RITUEL: {
    id: "RITUEL",
    label: "Rituel de Sang",
    description: "×8 gains — RARE garantie + ÉPIQUE et LÉGENDAIRE fortement boostés. Mort probable en échec.",
    color: "text-red-400",
    icon: "💀",
    multiplier: 8,
    successChanceBase: 0.28,
    deathRiskPct: 45,
    cost: { eclatsTemporels: 600, chronite: 150, chronoEssence: 20 },
    minLevel: 1,
  },
}

export function computeSuccessChance(
  base: number,
  modifiers: {
    talentBonus?: number
    windowBonus?: number
    amplifierBonus?: number
    anomalyMod?: number
    researchBonus?: number
  }
): number {
  let chance = base
  chance += (modifiers.talentBonus   ?? 0)
  chance += (modifiers.windowBonus   ?? 0)
  chance += (modifiers.amplifierBonus ?? 0)
  chance += (modifiers.researchBonus ?? 0)
  if (modifiers.anomalyMod) chance *= modifiers.anomalyMod
  return Math.min(0.97, Math.max(0.03, chance))
}

/** Returns true if the character dies. Protected under level 11. */
export function rollDeath(deathRiskPct: number, level: number): boolean {
  if (level <= 10) return false
  let risk = deathRiskPct
  if (level <= 15) risk = Math.floor(risk * 0.4) // softer at levels 11-15
  return Math.random() * 100 < risk
}
