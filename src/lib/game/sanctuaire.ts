// ─────────────────────────────────────────────
// Sanctuaire — Base building (OGame-inspired)
// ─────────────────────────────────────────────

export type SanctuaireModuleId =
  | "extracteur"        // éclats/h passive
  | "generateur"        // chronite/h passive
  | "archives"          // essences/h + XP bonus
  | "observatoire"      // +% legendary/mythic chance
  | "forge"             // craft cost reduction
  | "resonance"         // equip bonus amplifier
  | "laboratoire"       // analyze cooldown reduction
  | "nexus"             // global amplifier (all modules ×%)
  | "machineTemporelle" // Machine Temporelle — voyages dans le passé

export interface SanctuaireModuleConfig {
  id:          SanctuaireModuleId
  label:       string
  description: string
  icon:        string
  maxLevel:    number
  // Per-level cost (cumulative, level 0→1 = costs[0], 1→2 = costs[1], ...)
  costs: Array<{
    eclatsTemporels:     number
    chronite:            number
    essencesHistoriques: number
    fragmentsAnomalie:   number
  }>
  // Per-level effect values (index = level, value at level N)
  effects: {
    eclatsPerHour?:       number[]  // extracteur
    chronitePerHour?:     number[]  // generateur
    essencesPerHour?:     number[]  // archives
    xpBonusPct?:          number[]  // archives (%)
    legendaireChancePct?: number[]  // observatoire (%)
    mythiqueChancePct?:   number[]  // observatoire (%)
    craftDiscountPct?:    number[]  // forge (%)
    equipAmplifyPct?:     number[]  // resonance (%)
    analyzeDiscountPct?:  number[]  // laboratoire (%)
    globalAmplifyPct?:    number[]  // nexus (%)
  }
}

// ──── MODULE DEFINITIONS ────────────────────────────────────────────────────

export const SANCTUAIRE_MODULES: Record<SanctuaireModuleId, SanctuaireModuleConfig> = {
  extracteur: {
    id:          "extracteur",
    label:       "Extracteur Temporel",
    description: "Extrait des Éclats Temporels du flux passé. Génère des éclats/heure passivement, même hors connexion.",
    icon:        "⚡",
    maxLevel:    10,
    costs: [
      { eclatsTemporels: 100,   chronite: 0,   essencesHistoriques: 0, fragmentsAnomalie: 0 },
      { eclatsTemporels: 250,   chronite: 5,   essencesHistoriques: 0, fragmentsAnomalie: 0 },
      { eclatsTemporels: 500,   chronite: 15,  essencesHistoriques: 0, fragmentsAnomalie: 0 },
      { eclatsTemporels: 1000,  chronite: 30,  essencesHistoriques: 1, fragmentsAnomalie: 0 },
      { eclatsTemporels: 2000,  chronite: 60,  essencesHistoriques: 2, fragmentsAnomalie: 0 },
      { eclatsTemporels: 4000,  chronite: 120, essencesHistoriques: 3, fragmentsAnomalie: 1 },
      { eclatsTemporels: 8000,  chronite: 240, essencesHistoriques: 5, fragmentsAnomalie: 1 },
      { eclatsTemporels: 16000, chronite: 480, essencesHistoriques: 8, fragmentsAnomalie: 2 },
      { eclatsTemporels: 32000, chronite: 900, essencesHistoriques: 12, fragmentsAnomalie: 3 },
      { eclatsTemporels: 64000, chronite: 1800, essencesHistoriques: 20, fragmentsAnomalie: 5 },
    ],
    effects: {
      eclatsPerHour: [0, 8, 18, 32, 50, 75, 110, 160, 220, 300, 400],
    },
  },

  generateur: {
    id:          "generateur",
    label:       "Générateur de Flux",
    description: "Canalise le flux temporel en chronite brute. Production hors-ligne jusqu'à 24h de stockage.",
    icon:        "🔩",
    maxLevel:    10,
    costs: [
      { eclatsTemporels: 150,   chronite: 0,  essencesHistoriques: 0, fragmentsAnomalie: 0 },
      { eclatsTemporels: 400,   chronite: 10, essencesHistoriques: 0, fragmentsAnomalie: 0 },
      { eclatsTemporels: 800,   chronite: 25, essencesHistoriques: 0, fragmentsAnomalie: 0 },
      { eclatsTemporels: 1500,  chronite: 50, essencesHistoriques: 1, fragmentsAnomalie: 0 },
      { eclatsTemporels: 3000,  chronite: 100, essencesHistoriques: 2, fragmentsAnomalie: 0 },
      { eclatsTemporels: 6000,  chronite: 200, essencesHistoriques: 3, fragmentsAnomalie: 1 },
      { eclatsTemporels: 12000, chronite: 400, essencesHistoriques: 5, fragmentsAnomalie: 1 },
      { eclatsTemporels: 24000, chronite: 750, essencesHistoriques: 8, fragmentsAnomalie: 2 },
      { eclatsTemporels: 48000, chronite: 1400, essencesHistoriques: 12, fragmentsAnomalie: 3 },
      { eclatsTemporels: 96000, chronite: 2500, essencesHistoriques: 20, fragmentsAnomalie: 5 },
    ],
    effects: {
      chronitePerHour: [0, 2, 4, 7, 11, 17, 25, 36, 50, 70, 100],
    },
  },

  archives: {
    id:          "archives",
    label:       "Archives Vivantes",
    description: "Bibliothèque temporelle auto-organisée. Génère des essences historiques et amplifie le gain d'XP.",
    icon:        "📚",
    maxLevel:    10,
    costs: [
      { eclatsTemporels: 200,   chronite: 5,   essencesHistoriques: 0, fragmentsAnomalie: 0 },
      { eclatsTemporels: 500,   chronite: 15,  essencesHistoriques: 0, fragmentsAnomalie: 0 },
      { eclatsTemporels: 1000,  chronite: 35,  essencesHistoriques: 1, fragmentsAnomalie: 0 },
      { eclatsTemporels: 2000,  chronite: 70,  essencesHistoriques: 2, fragmentsAnomalie: 0 },
      { eclatsTemporels: 4000,  chronite: 140, essencesHistoriques: 3, fragmentsAnomalie: 0 },
      { eclatsTemporels: 8000,  chronite: 280, essencesHistoriques: 5, fragmentsAnomalie: 1 },
      { eclatsTemporels: 16000, chronite: 550, essencesHistoriques: 8, fragmentsAnomalie: 2 },
      { eclatsTemporels: 32000, chronite: 1000, essencesHistoriques: 12, fragmentsAnomalie: 3 },
      { eclatsTemporels: 64000, chronite: 2000, essencesHistoriques: 18, fragmentsAnomalie: 4 },
      { eclatsTemporels: 128000, chronite: 3500, essencesHistoriques: 28, fragmentsAnomalie: 7 },
    ],
    effects: {
      essencesPerHour: [0, 0.1, 0.2, 0.4, 0.7, 1.1, 1.6, 2.3, 3.2, 4.5, 6],
      xpBonusPct:      [0, 3,   6,   10,  15,  21,  28,  36,  45,  55,  66],
    },
  },

  observatoire: {
    id:          "observatoire",
    label:       "Observatoire des Astres",
    description: "Scrute les fils du destin pour identifier les instants les plus précieux. Augmente la chance légendaire et mythique.",
    icon:        "🔭",
    maxLevel:    10,
    costs: [
      { eclatsTemporels: 300,    chronite: 20,  essencesHistoriques: 1, fragmentsAnomalie: 0 },
      { eclatsTemporels: 700,    chronite: 50,  essencesHistoriques: 2, fragmentsAnomalie: 0 },
      { eclatsTemporels: 1500,   chronite: 100, essencesHistoriques: 4, fragmentsAnomalie: 1 },
      { eclatsTemporels: 3000,   chronite: 200, essencesHistoriques: 7, fragmentsAnomalie: 1 },
      { eclatsTemporels: 6000,   chronite: 400, essencesHistoriques: 10, fragmentsAnomalie: 2 },
      { eclatsTemporels: 12000,  chronite: 800, essencesHistoriques: 15, fragmentsAnomalie: 3 },
      { eclatsTemporels: 24000,  chronite: 1500, essencesHistoriques: 22, fragmentsAnomalie: 4 },
      { eclatsTemporels: 50000,  chronite: 3000, essencesHistoriques: 32, fragmentsAnomalie: 6 },
      { eclatsTemporels: 100000, chronite: 5500, essencesHistoriques: 45, fragmentsAnomalie: 8 },
      { eclatsTemporels: 200000, chronite: 10000, essencesHistoriques: 65, fragmentsAnomalie: 12 },
    ],
    effects: {
      legendaireChancePct: [0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0],
      mythiqueChancePct:   [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
    },
  },

  forge: {
    id:          "forge",
    label:       "Forge Chronique",
    description: "Réduit les coûts de fabrication des objets temporels. Chaque niveau abaisse le coût de toutes les recettes.",
    icon:        "⚒️",
    maxLevel:    10,
    costs: [
      { eclatsTemporels: 200,   chronite: 10,  essencesHistoriques: 0, fragmentsAnomalie: 0 },
      { eclatsTemporels: 500,   chronite: 25,  essencesHistoriques: 1, fragmentsAnomalie: 0 },
      { eclatsTemporels: 1000,  chronite: 55,  essencesHistoriques: 2, fragmentsAnomalie: 0 },
      { eclatsTemporels: 2000,  chronite: 110, essencesHistoriques: 3, fragmentsAnomalie: 1 },
      { eclatsTemporels: 4000,  chronite: 220, essencesHistoriques: 5, fragmentsAnomalie: 1 },
      { eclatsTemporels: 8000,  chronite: 440, essencesHistoriques: 8, fragmentsAnomalie: 2 },
      { eclatsTemporels: 16000, chronite: 880, essencesHistoriques: 12, fragmentsAnomalie: 3 },
      { eclatsTemporels: 32000, chronite: 1700, essencesHistoriques: 18, fragmentsAnomalie: 4 },
      { eclatsTemporels: 64000, chronite: 3200, essencesHistoriques: 26, fragmentsAnomalie: 6 },
      { eclatsTemporels: 128000, chronite: 6000, essencesHistoriques: 38, fragmentsAnomalie: 9 },
    ],
    effects: {
      craftDiscountPct: [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50],
    },
  },

  resonance: {
    id:          "resonance",
    label:       "Chambre de Résonance",
    description: "Amplifie les effets des reliques équipées. Vos 3 slots passifs deviennent de plus en plus puissants.",
    icon:        "💎",
    maxLevel:    10,
    costs: [
      { eclatsTemporels: 250,   chronite: 15,  essencesHistoriques: 1, fragmentsAnomalie: 0 },
      { eclatsTemporels: 600,   chronite: 35,  essencesHistoriques: 2, fragmentsAnomalie: 0 },
      { eclatsTemporels: 1200,  chronite: 70,  essencesHistoriques: 3, fragmentsAnomalie: 0 },
      { eclatsTemporels: 2500,  chronite: 150, essencesHistoriques: 5, fragmentsAnomalie: 1 },
      { eclatsTemporels: 5000,  chronite: 300, essencesHistoriques: 8, fragmentsAnomalie: 2 },
      { eclatsTemporels: 10000, chronite: 600, essencesHistoriques: 12, fragmentsAnomalie: 3 },
      { eclatsTemporels: 20000, chronite: 1200, essencesHistoriques: 18, fragmentsAnomalie: 4 },
      { eclatsTemporels: 40000, chronite: 2200, essencesHistoriques: 26, fragmentsAnomalie: 6 },
      { eclatsTemporels: 80000, chronite: 4000, essencesHistoriques: 38, fragmentsAnomalie: 8 },
      { eclatsTemporels: 160000, chronite: 7500, essencesHistoriques: 55, fragmentsAnomalie: 12 },
    ],
    effects: {
      equipAmplifyPct: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
    },
  },

  laboratoire: {
    id:          "laboratoire",
    label:       "Laboratoire d'Analyse",
    description: "Accélère l'analyse des reliques en réduisant le cooldown. Niveau 10 = cooldown réduit à 30 minutes.",
    icon:        "🔬",
    maxLevel:    10,
    costs: [
      { eclatsTemporels: 150,  chronite: 8,   essencesHistoriques: 0, fragmentsAnomalie: 0 },
      { eclatsTemporels: 400,  chronite: 20,  essencesHistoriques: 1, fragmentsAnomalie: 0 },
      { eclatsTemporels: 800,  chronite: 45,  essencesHistoriques: 2, fragmentsAnomalie: 0 },
      { eclatsTemporels: 1600, chronite: 90,  essencesHistoriques: 3, fragmentsAnomalie: 0 },
      { eclatsTemporels: 3200, chronite: 180, essencesHistoriques: 5, fragmentsAnomalie: 1 },
      { eclatsTemporels: 6400, chronite: 360, essencesHistoriques: 7, fragmentsAnomalie: 1 },
      { eclatsTemporels: 12800, chronite: 720, essencesHistoriques: 10, fragmentsAnomalie: 2 },
      { eclatsTemporels: 25600, chronite: 1400, essencesHistoriques: 15, fragmentsAnomalie: 3 },
      { eclatsTemporels: 51200, chronite: 2700, essencesHistoriques: 22, fragmentsAnomalie: 5 },
      { eclatsTemporels: 102400, chronite: 5000, essencesHistoriques: 32, fragmentsAnomalie: 7 },
    ],
    // Cooldown 4h = 240min → réduit par %. Min 30min.
    effects: {
      analyzeDiscountPct: [0, 8, 16, 24, 32, 40, 48, 56, 64, 72, 80],
    },
  },

  nexus: {
    id:          "nexus",
    label:       "Nexus Temporel",
    description: "Cœur du Sanctuaire. Amplifie l'efficacité de TOUS les autres modules. L'investissement le plus stratégique.",
    icon:        "🌀",
    maxLevel:    10,
    costs: [
      { eclatsTemporels: 500,    chronite: 30,   essencesHistoriques: 2,  fragmentsAnomalie: 1 },
      { eclatsTemporels: 1200,   chronite: 75,   essencesHistoriques: 4,  fragmentsAnomalie: 1 },
      { eclatsTemporels: 2500,   chronite: 160,  essencesHistoriques: 7,  fragmentsAnomalie: 2 },
      { eclatsTemporels: 5000,   chronite: 320,  essencesHistoriques: 12, fragmentsAnomalie: 3 },
      { eclatsTemporels: 10000,  chronite: 650,  essencesHistoriques: 18, fragmentsAnomalie: 4 },
      { eclatsTemporels: 20000,  chronite: 1300, essencesHistoriques: 26, fragmentsAnomalie: 6 },
      { eclatsTemporels: 40000,  chronite: 2600, essencesHistoriques: 38, fragmentsAnomalie: 9 },
      { eclatsTemporels: 80000,  chronite: 5000, essencesHistoriques: 55, fragmentsAnomalie: 13 },
      { eclatsTemporels: 160000, chronite: 9500, essencesHistoriques: 80, fragmentsAnomalie: 18 },
      { eclatsTemporels: 320000, chronite: 18000, essencesHistoriques: 120, fragmentsAnomalie: 25 },
    ],
    effects: {
      globalAmplifyPct: [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50],
    },
  },

  machineTemporelle: {
    id:          "machineTemporelle",
    label:       "Machine Temporelle",
    description: "Le cœur du voyage dans le temps. Chaque niveau débloque des ères plus profondes — du passé récent aux millénaires oubliés.",
    icon:        "⚙️",
    maxLevel:    5,
    costs: [
      { eclatsTemporels: 1000,  chronite: 50,   essencesHistoriques: 5,   fragmentsAnomalie: 2  },
      { eclatsTemporels: 3000,  chronite: 150,  essencesHistoriques: 15,  fragmentsAnomalie: 5  },
      { eclatsTemporels: 8000,  chronite: 400,  essencesHistoriques: 40,  fragmentsAnomalie: 12 },
      { eclatsTemporels: 20000, chronite: 1000, essencesHistoriques: 100, fragmentsAnomalie: 30 },
      { eclatsTemporels: 50000, chronite: 2500, essencesHistoriques: 250, fragmentsAnomalie: 75 },
    ],
    effects: {
      // level → max machine level (1=hier+semaine, 2=mois, 3=années+décennies, 4=siècles, 5=millénaires)
    },
  },
}

// ──── COMPUTED HELPERS ───────────────────────────────────────────────────────

export interface SanctuaireState {
  modules: Partial<Record<SanctuaireModuleId, number>>  // moduleId → level
  lastHarvestedAt: Date | null
}

export interface SanctuaireProduction {
  eclatsPerHour:   number
  chronitePerHour: number
  essencesPerHour: number
}

const MODULE_IDS: SanctuaireModuleId[] = [
  "extracteur", "generateur", "archives", "observatoire",
  "forge", "resonance", "laboratoire", "nexus", "machineTemporelle",
]

export function computeProduction(modules: Partial<Record<SanctuaireModuleId, number>>): SanctuaireProduction {
  const nexusLevel  = modules["nexus"] ?? 0
  const nexusBonus  = 1 + (SANCTUAIRE_MODULES.nexus.effects.globalAmplifyPct![nexusLevel] ?? 0) / 100

  const extractLevel = modules["extracteur"] ?? 0
  const genLevel     = modules["generateur"] ?? 0
  const archLevel    = modules["archives"]   ?? 0

  return {
    eclatsPerHour:   (SANCTUAIRE_MODULES.extracteur.effects.eclatsPerHour![extractLevel] ?? 0) * nexusBonus,
    chronitePerHour: (SANCTUAIRE_MODULES.generateur.effects.chronitePerHour![genLevel]    ?? 0) * nexusBonus,
    essencesPerHour: (SANCTUAIRE_MODULES.archives.effects.essencesPerHour![archLevel]     ?? 0) * nexusBonus,
  }
}

export function computeBonuses(modules: Partial<Record<SanctuaireModuleId, number>>) {
  const nexusLevel = modules["nexus"] ?? 0
  const nexusBonus = 1 + (SANCTUAIRE_MODULES.nexus.effects.globalAmplifyPct![nexusLevel] ?? 0) / 100

  const obsLevel   = modules["observatoire"] ?? 0
  const resLevel   = modules["resonance"]    ?? 0
  const labLevel   = modules["laboratoire"]  ?? 0
  const forgeLevel = modules["forge"]        ?? 0
  const archLevel  = modules["archives"]     ?? 0

  return {
    legendaireChancePct: (SANCTUAIRE_MODULES.observatoire.effects.legendaireChancePct![obsLevel]   ?? 0) * nexusBonus,
    mythiqueChancePct:   (SANCTUAIRE_MODULES.observatoire.effects.mythiqueChancePct![obsLevel]     ?? 0) * nexusBonus,
    xpBonusPct:          (SANCTUAIRE_MODULES.archives.effects.xpBonusPct![archLevel]               ?? 0) * nexusBonus,
    equipAmplifyPct:     (SANCTUAIRE_MODULES.resonance.effects.equipAmplifyPct![resLevel]          ?? 0) * nexusBonus,
    analyzeDiscountPct:  (SANCTUAIRE_MODULES.laboratoire.effects.analyzeDiscountPct![labLevel]     ?? 0) * nexusBonus,
    craftDiscountPct:    (SANCTUAIRE_MODULES.forge.effects.craftDiscountPct![forgeLevel]           ?? 0) * nexusBonus,
  }
}

/** Max 24h of offline generation */
export function computePendingHarvest(
  modules: Partial<Record<SanctuaireModuleId, number>>,
  lastHarvestedAt: Date | null
): { eclats: number; chronite: number; essences: number; hoursElapsed: number } {
  if (!lastHarvestedAt) {
    return { eclats: 0, chronite: 0, essences: 0, hoursElapsed: 0 }
  }
  const maxMs      = 24 * 60 * 60 * 1000
  const elapsed    = Math.min(Date.now() - lastHarvestedAt.getTime(), maxMs)
  const hours      = elapsed / 3600000
  const prod       = computeProduction(modules)
  return {
    eclats:       Math.floor(prod.eclatsPerHour   * hours),
    chronite:     Math.floor(prod.chronitePerHour * hours),
    essences:     Math.floor(prod.essencesPerHour * hours),
    hoursElapsed: Math.round(hours * 10) / 10,
  }
}

export function getUpgradeCost(moduleId: SanctuaireModuleId, currentLevel: number) {
  const module = SANCTUAIRE_MODULES[moduleId]
  if (currentLevel >= module.maxLevel) return null
  return module.costs[currentLevel]
}

export { MODULE_IDS }
