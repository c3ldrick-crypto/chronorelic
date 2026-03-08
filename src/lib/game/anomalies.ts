// ─────────────────────────────────────────────
// Anomalies Quotidiennes — Roguelike Modifiers
// 2 anomalies per day, drawn from seeded RNG
// ─────────────────────────────────────────────

export type AnomalyTag =
  | "xp"
  | "resources"
  | "capture"
  | "risky"
  | "rarity"
  | "mythic"
  | "harvest"

export interface AnomalyEffect {
  xpMultiplier?:           number   // multiplies XP gained (e.g. 1.75 = +75%)
  resourceMultiplier?:     number   // multiplies resource drops
  eventResourceMultiplier?: number  // multiplies event bonus resources
  extraCaptures?:          number   // bonus free captures for the day
  legendaireChanceBonus?:  number   // flat % added to legendary chance
  mythiqueChanceBonus?:    number   // flat % added to mythic chance
  rareChanceBonus?:        number   // flat % added to RARE+ chances
  failChanceAdd?:          number   // flat % added to risky fail chance
  riskyBetMultiplier?:     number   // multiplies risky bet cost
  doubleCapChance?:        number   // % chance to capture 2 relics at once
  fragmentsPerCapture?:    number   // bonus fragments per capture
  chroniteMultiplier?:     number   // multiplies chronite drops
  sanctuaireMultiplier?:   number   // multiplies sanctuaire harvest pending
  hiddenRarity?:           boolean  // rarity hidden until after capture
}

export interface AnomalyDefinition {
  id:          string
  label:       string
  description: string
  icon:        string
  tags:        AnomalyTag[]
  effects:     AnomalyEffect
  flavor:      string   // immersive lore text
  positive:    boolean  // used to ensure 1 positive + 1 mixed/negative
}

// ──── 14 ANOMALIES ──────────────────────────────────────────────────────────

export const ANOMALIES: AnomalyDefinition[] = [
  {
    id: "tempete_chronique",
    label: "Tempête Chronique",
    icon: "⛈️",
    tags: ["xp", "risky"],
    positive: false,
    description: "+75% XP gagné sur toutes les captures, mais le Mode Risqué a 15% d'échec en plus.",
    flavor: "Le flux temporel se déchaîne. Chaque instant capturé vibre d'une énergie amplifiée — mais les courants adverses brûlent deux fois plus fort.",
    effects: { xpMultiplier: 1.75, failChanceAdd: 0.15 },
  },
  {
    id: "rift_temporel",
    label: "Rift Temporel",
    icon: "🌀",
    tags: ["resources"],
    positive: true,
    description: "Les événements historiques génèrent ×3 ressources.",
    flavor: "Une fissure s'ouvre dans le tissu du passé. Les minutes liées à l'Histoire débordent d'énergie — leurs échos résonnent jusqu'à aujourd'hui.",
    effects: { eventResourceMultiplier: 3 },
  },
  {
    id: "eclipse_mythique",
    label: "Éclipse Mythique",
    icon: "🌑",
    tags: ["mythic", "risky"],
    positive: false,
    description: "Chance Mythique ×4, mais le Mode Risqué coûte ×2 et a 20% d'échec en plus.",
    flavor: "L'alignement des astres ouvre un corridor vers l'Absolu. Les plus rares des instants deviennent accessibles — pour ceux qui osent payer le prix.",
    effects: { mythiqueChanceBonus: 3.0, riskyBetMultiplier: 2, failChanceAdd: 0.20 },
  },
  {
    id: "harmonie_temporelle",
    label: "Harmonie Temporelle",
    icon: "🌟",
    tags: ["resources", "xp"],
    positive: true,
    description: "+60% à toutes les ressources et à l'XP.",
    flavor: "Le flux temporel s'écoule sans résistance aujourd'hui. La réalité elle-même semble vous tendre la main — capturez autant que possible.",
    effects: { resourceMultiplier: 1.6, xpMultiplier: 1.6 },
  },
  {
    id: "convergence_stellaire",
    label: "Convergence Stellaire",
    icon: "⭐",
    tags: ["capture"],
    positive: true,
    description: "+3 captures gratuites pour aujourd'hui.",
    flavor: "Les étoiles s'alignent sur une configuration rare. Trois instants supplémentaires vous sont offerts par le destin lui-même.",
    effects: { extraCaptures: 3 },
  },
  {
    id: "onde_de_choc",
    label: "Onde de Choc Temporel",
    icon: "💥",
    tags: ["rarity"],
    positive: true,
    description: "+50% de chance d'obtenir RARE ou supérieur.",
    flavor: "Une déflagration silencieuse a parcouru le flux. Les instants ordinaires ont été éjectés — ne restent que les précieux.",
    effects: { rareChanceBonus: 15 },
  },
  {
    id: "brouillard_du_passe",
    label: "Brouillard du Passé",
    icon: "🌫️",
    tags: ["rarity"],
    positive: false,
    description: "La rareté de chaque relique est cachée jusqu'après la capture.",
    flavor: "Un épais brouillard enveloppe le flux temporel. Vous ne saurez ce que vous avez capturé qu'une fois la minute scellée.",
    effects: { hiddenRarity: true },
  },
  {
    id: "memoire_vive",
    label: "Mémoire Vive",
    icon: "🧠",
    tags: ["xp", "rarity"],
    positive: true,
    description: "+100% XP sur les reliques RARE et supérieur.",
    flavor: "Les instants rares résonnent avec une clarté extraordinaire. Votre mémoire temporelle absorbe chaque détail — le savoir se décuple.",
    effects: { xpMultiplier: 2.0 },  // Applied only to RARE+ in the capture route
  },
  {
    id: "pluie_de_fragments",
    label: "Pluie de Fragments",
    icon: "🔮",
    tags: ["resources"],
    positive: true,
    description: "+3 fragments d'anomalie par capture.",
    flavor: "Des éclats de réalité tombent comme de la pluie. Chaque capture les collecte automatiquement — une manne d'énergie pure.",
    effects: { fragmentsPerCapture: 3 },
  },
  {
    id: "fissure_dimensionnelle",
    label: "Fissure Dimensionnelle",
    icon: "🌌",
    tags: ["capture"],
    positive: true,
    description: "20% de chance de capturer 2 reliques simultanément.",
    flavor: "Une fissure dans l'espace-temps crée un doublon. Parfois, deux minutes fusionnent en un seul instant collectible.",
    effects: { doubleCapChance: 0.20 },
  },
  {
    id: "vortex_chronite",
    label: "Vortex de Chronite",
    icon: "🔩",
    tags: ["resources"],
    positive: true,
    description: "+200% chronite de toutes les sources.",
    flavor: "Un vortex de chronite brute tourbillonne au cœur du flux. La matière temporelle se condense — les forges du Sanctuaire exultent.",
    effects: { chroniteMultiplier: 3.0 },
  },
  {
    id: "resonance_legendaire",
    label: "Résonance Légendaire",
    icon: "🟡",
    tags: ["rarity"],
    positive: true,
    description: "+2% de chance légendaire.",
    flavor: "Le passé murmure ses secrets les plus gardés. Des instants qui ont changé l'histoire émergent plus facilement à la surface du temps.",
    effects: { legendaireChanceBonus: 2.0 },
  },
  {
    id: "temps_mort",
    label: "Temps Mort",
    icon: "⏸️",
    tags: ["capture", "xp"],
    positive: false,
    description: "-2 captures gratuites, mais +50% XP sur les captures restantes.",
    flavor: "Le flux ralentit. Chaque capture est plus coûteuse en énergie, mais les instants que vous saisissez sont d'autant plus précieux.",
    effects: { extraCaptures: -2, xpMultiplier: 1.5 },
  },
  {
    id: "abondance_du_sanctuaire",
    label: "Abondance du Sanctuaire",
    icon: "🏰",
    tags: ["harvest"],
    positive: true,
    description: "La production du Sanctuaire ×2 pour les ressources en attente.",
    flavor: "Vos modules travaillent avec une efficacité décuplée. Le Sanctuaire déborde — récoltez avant la limite de 24h.",
    effects: { sanctuaireMultiplier: 2.0 },
  },
]

// ──── SEEDED RNG ─────────────────────────────────────────────────────────────

/** Simple seeded pseudo-random number generator (mulberry32) */
function mulberry32(seed: number): () => number {
  return function () {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed)
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t
    return ((t ^ t >>> 14) >>> 0) / 4294967296
  }
}

/** Deterministic hash of a YYYY-MM-DD string */
function hashDate(dateStr: string): number {
  let hash = 0
  for (let i = 0; i < dateStr.length; i++) {
    hash = ((hash << 5) - hash + dateStr.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

/**
 * Returns 2 anomalies for the given date (YYYY-MM-DD).
 * Same inputs always yield the same results (deterministic).
 * Guarantees: index 0 is positive, index 1 is the "twist" (mixed or negative).
 */
export function getDailyAnomalies(dateStr: string): [AnomalyDefinition, AnomalyDefinition] {
  const seed = hashDate(dateStr)
  const rng  = mulberry32(seed)

  const positives = ANOMALIES.filter((a) => a.positive)
  const mixed     = ANOMALIES.filter((a) => !a.positive)

  const idx0  = Math.floor(rng() * positives.length)
  const idx1  = Math.floor(rng() * mixed.length)

  return [positives[idx0], mixed[idx1]]
}

/** Returns today's anomalies (server-side: uses UTC date) */
export function getTodayAnomalies(): [AnomalyDefinition, AnomalyDefinition] {
  const today = new Date().toISOString().slice(0, 10)
  return getDailyAnomalies(today)
}

/** Merges effects of multiple anomalies (additive) */
export function mergeAnomalyEffects(anomalies: AnomalyDefinition[]): AnomalyEffect {
  return anomalies.reduce<AnomalyEffect>((acc, a) => {
    const e = a.effects
    return {
      xpMultiplier:            (acc.xpMultiplier            ?? 1) * (e.xpMultiplier            ?? 1),
      resourceMultiplier:      (acc.resourceMultiplier      ?? 1) * (e.resourceMultiplier      ?? 1),
      eventResourceMultiplier: (acc.eventResourceMultiplier ?? 1) * (e.eventResourceMultiplier ?? 1),
      extraCaptures:           (acc.extraCaptures           ?? 0) + (e.extraCaptures           ?? 0),
      legendaireChanceBonus:   (acc.legendaireChanceBonus   ?? 0) + (e.legendaireChanceBonus   ?? 0),
      mythiqueChanceBonus:     (acc.mythiqueChanceBonus     ?? 0) + (e.mythiqueChanceBonus     ?? 0),
      rareChanceBonus:         (acc.rareChanceBonus         ?? 0) + (e.rareChanceBonus         ?? 0),
      failChanceAdd:           (acc.failChanceAdd           ?? 0) + (e.failChanceAdd           ?? 0),
      riskyBetMultiplier:      (acc.riskyBetMultiplier      ?? 1) * (e.riskyBetMultiplier      ?? 1),
      doubleCapChance:         (acc.doubleCapChance         ?? 0) + (e.doubleCapChance         ?? 0),
      fragmentsPerCapture:     (acc.fragmentsPerCapture     ?? 0) + (e.fragmentsPerCapture     ?? 0),
      chroniteMultiplier:      (acc.chroniteMultiplier      ?? 1) * (e.chroniteMultiplier      ?? 1),
      sanctuaireMultiplier:    (acc.sanctuaireMultiplier    ?? 1) * (e.sanctuaireMultiplier    ?? 1),
      hiddenRarity:            acc.hiddenRarity || e.hiddenRarity,
    }
  }, {})
}
