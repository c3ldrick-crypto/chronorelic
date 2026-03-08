// Arbre de Recherche — débloqué avec la Connaissance Temporelle

export type ResearchBranch = "temporal" | "essence" | "combat" | "exploration"

export interface ResearchNode {
  id: string
  label: string
  description: string
  icon: string
  branch: ResearchBranch
  maxLevel: number
  costPerLevel: number[]   // Connaissance cost per level
  prerequisite?: string    // nodeId
  effect: {
    type: string
    value: number[]        // value[0]=0 (unlocked), value[N]=effect at level N
    description: string
  }
}

export const RESEARCH_TREE: ResearchNode[] = [
  // ── TEMPORAL ─────────────────────────────────────────────────────────────────
  {
    id: "cartographie_temporelle",
    label: "Cartographie Temporelle",
    description: "Maîtrisez les flux du temps pour naviguer plus efficacement dans le passé.",
    icon: "🗺",
    branch: "temporal",
    maxLevel: 5,
    costPerLevel: [20, 40, 70, 110, 160],
    effect: { type: "machine_cost_reduction", value: [0, 10, 20, 30, 40, 50], description: "-X% coût Chrono-Essence Machine" },
  },
  {
    id: "stabilisation_flux",
    label: "Stabilisation du Flux",
    description: "Réduire l'instabilité des voyages temporels pour augmenter leur succès.",
    icon: "⚖",
    branch: "temporal",
    maxLevel: 3,
    costPerLevel: [50, 100, 180],
    prerequisite: "cartographie_temporelle",
    effect: { type: "instability_reduction", value: [0, 8, 15, 22], description: "-X% instabilité Machine" },
  },
  {
    id: "resonance_epoques",
    label: "Résonance des Époques",
    description: "Chaque époque visitée génère des essences bonus supplémentaires.",
    icon: "🎵",
    branch: "temporal",
    maxLevel: 3,
    costPerLevel: [80, 160, 280],
    prerequisite: "stabilisation_flux",
    effect: { type: "machine_essence_bonus", value: [0, 15, 30, 50], description: "+X% essences des voyages" },
  },
  {
    id: "maitrise_paradoxe",
    label: "Maîtrise du Paradoxe",
    description: "Les contradictions temporelles vous enrichissent plutôt que de vous blesser.",
    icon: "♾",
    branch: "temporal",
    maxLevel: 2,
    costPerLevel: [150, 300],
    prerequisite: "resonance_epoques",
    effect: { type: "paradox_crystal_bonus", value: [0, 10, 25], description: "+X% chance Cristal Paradoxal" },
  },
  // ── ESSENCE ──────────────────────────────────────────────────────────────────
  {
    id: "extraction_profonde",
    label: "Extraction Profonde",
    description: "Mieux extraire les essences de chaque minute capturée.",
    icon: "⚗",
    branch: "essence",
    maxLevel: 5,
    costPerLevel: [15, 30, 55, 90, 140],
    effect: { type: "essence_yield_bonus", value: [0, 10, 20, 32, 46, 62], description: "+X% quantité d'essences" },
  },
  {
    id: "alchimie_temporelle",
    label: "Alchimie Temporelle",
    description: "Synthétisez des essences hybrides avec moins de matériaux à l'Atelier.",
    icon: "🧪",
    branch: "essence",
    maxLevel: 3,
    costPerLevel: [40, 80, 140],
    prerequisite: "extraction_profonde",
    effect: { type: "synthesis_discount", value: [0, 15, 28, 40], description: "-X% coût de synthèse hybrides" },
  },
  {
    id: "resonance_ancestrale",
    label: "Résonance Ancestrale",
    description: "Les essences des ères anciennes sont deux fois plus puissantes.",
    icon: "🏺",
    branch: "essence",
    maxLevel: 3,
    costPerLevel: [60, 120, 210],
    prerequisite: "alchimie_temporelle",
    effect: { type: "ancestral_bonus", value: [0, 20, 40, 65], description: "+X% Résidu Ancestral obtenu" },
  },
  {
    id: "bibliotheque_infinie",
    label: "Bibliothèque Infinie",
    description: "Vos Archives génèrent passivement de la Connaissance Temporelle.",
    icon: "📖",
    branch: "essence",
    maxLevel: 4,
    costPerLevel: [100, 200, 350, 550],
    prerequisite: "resonance_ancestrale",
    effect: { type: "connaissance_passive", value: [0, 2, 5, 9, 14], description: "+X Connaissance/heure passive" },
  },
  // ── COMBAT ───────────────────────────────────────────────────────────────────
  {
    id: "endurance_temporelle",
    label: "Endurance Temporelle",
    description: "Le flux temporel vous résiste de moins en moins.",
    icon: "💪",
    branch: "combat",
    maxLevel: 5,
    costPerLevel: [20, 40, 70, 110, 160],
    effect: { type: "success_chance_bonus", value: [0, 2, 4, 7, 10, 14], description: "+X% chance de succès de base" },
  },
  {
    id: "instinct_survie",
    label: "Instinct de Survie",
    description: "Réduire les chances de mort lors d'un échec en mise risquée.",
    icon: "🛡",
    branch: "combat",
    maxLevel: 3,
    costPerLevel: [50, 100, 180],
    prerequisite: "endurance_temporelle",
    effect: { type: "death_risk_reduction", value: [0, 10, 20, 30], description: "-X% risque de mort" },
  },
  {
    id: "resilience_echec",
    label: "Résilience à l'Échec",
    description: "Les échecs produisent parfois des Larmes Temporelles en consolation.",
    icon: "💧",
    branch: "combat",
    maxLevel: 3,
    costPerLevel: [40, 80, 140],
    prerequisite: "endurance_temporelle",
    effect: { type: "failure_consolation", value: [0, 8, 15, 25], description: "+X% chance Larme à l'échec" },
  },
  {
    id: "furie_temporelle",
    label: "Furie Temporelle",
    description: "Les succès consécutifs donnent un bonus multiplicateur croissant.",
    icon: "🔥",
    branch: "combat",
    maxLevel: 2,
    costPerLevel: [120, 240],
    prerequisite: "instinct_survie",
    effect: { type: "consecutive_bonus", value: [0, 5, 12], description: "+X% gains par succès consécutif (max 5 stacks)" },
  },
  // ── EXPLORATION ───────────────────────────────────────────────────────────────
  {
    id: "cartographie_minutes",
    label: "Cartographie des Minutes",
    description: "Révèle plus d'informations sur les fenêtres temporelles proposées.",
    icon: "🔭",
    branch: "exploration",
    maxLevel: 4,
    costPerLevel: [15, 30, 55, 90],
    effect: { type: "window_info_bonus", value: [0, 1, 2, 3, 4], description: "+X détails par fenêtre temporelle" },
  },
  {
    id: "sixieme_sens",
    label: "Sixième Sens Temporel",
    description: "Détecter les minutes à haute probabilité de rareté avant capture.",
    icon: "🌡",
    branch: "exploration",
    maxLevel: 3,
    costPerLevel: [40, 80, 140],
    prerequisite: "cartographie_minutes",
    effect: { type: "rarity_detection", value: [0, 1, 2, 3], description: "Voir X minutes RARE+ disponibles" },
  },
  {
    id: "eclaireur_temporel",
    label: "Éclaireur Temporel",
    description: "Les expéditions rapportent des essences supplémentaires.",
    icon: "🧭",
    branch: "exploration",
    maxLevel: 3,
    costPerLevel: [60, 120, 210],
    prerequisite: "sixieme_sens",
    effect: { type: "expedition_essence_bonus", value: [0, 15, 30, 50], description: "+X% essences des expéditions" },
  },
  {
    id: "oracle_cartographie",
    label: "Oracle de Cartographie",
    description: "Révèle la cible optimale pour la Machine Temporelle chaque jour.",
    icon: "🎯",
    branch: "exploration",
    maxLevel: 1,
    costPerLevel: [350],
    prerequisite: "eclaireur_temporel",
    effect: { type: "daily_machine_target", value: [0, 1], description: "Révèle 1 cible ÉPIQUE+ par jour" },
  },
]

export function getResearchValue(
  nodeId: string,
  level: number,
  tree: ResearchNode[] = RESEARCH_TREE
): number {
  const node = tree.find(n => n.id === nodeId)
  if (!node || level <= 0) return 0
  return node.effect.value[Math.min(level, node.maxLevel)] ?? 0
}

export function isNodeUnlocked(
  nodeId: string,
  userLevels: Record<string, number>,
  tree: ResearchNode[] = RESEARCH_TREE
): boolean {
  const node = tree.find(n => n.id === nodeId)
  if (!node) return false
  if (!node.prerequisite) return true
  return (userLevels[node.prerequisite] ?? 0) >= 1
}
