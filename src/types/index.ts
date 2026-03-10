// ─────────────────────────────────────────────
// Types globaux ChronoRelic v2
// ─────────────────────────────────────────────

export type Role = "GUEST" | "FREE" | "PREMIUM" | "ADMIN"

export type CharacterClass = "CHRONOMANCER" | "ARCHIVISTE" | "CHASSEUR" | "ORACLE"

export type Rarity = "COMMUNE" | "RARE" | "EPIQUE" | "LEGENDAIRE" | "MYTHIQUE"

// ─────────────────────────────────────────────
// CONFIG DE RARETÉ
// ─────────────────────────────────────────────

export interface RarityConfig {
  label: string
  chance: number        // Probabilité de base en %
  xp: number            // XP de base
  color: string         // Couleur Tailwind
  glow: string          // Couleur de glow CSS
  emoji: string
  levelRequired: number // Niveau minimum pour obtenir cette rareté
}

export const RARITY_CONFIG: Record<Rarity, RarityConfig> = {
  COMMUNE: {
    label: "Commune",
    chance: 60,
    xp: 10,
    color: "text-slate-400",
    glow: "#6b7280",
    emoji: "⚪",
    levelRequired: 1,
  },
  RARE: {
    label: "Rare",
    chance: 28,
    xp: 25,
    color: "text-blue-400",
    glow: "#3b82f6",
    emoji: "🔵",
    levelRequired: 10,
  },
  EPIQUE: {
    label: "Épique",
    chance: 9,
    xp: 75,
    color: "text-violet-400",
    glow: "#8b5cf6",
    emoji: "🟣",
    levelRequired: 20,
  },
  LEGENDAIRE: {
    label: "Légendaire",
    chance: 2.5,
    xp: 200,
    color: "text-amber-400",
    glow: "#f59e0b",
    emoji: "🟡",
    levelRequired: 30,
  },
  MYTHIQUE: {
    label: "Mythique",
    chance: 0.5,
    xp: 600,
    color: "text-pink-400",
    glow: "#ec4899",
    emoji: "🔮",
    levelRequired: 40,
  },
}

// ─────────────────────────────────────────────
// SYSTÈME DE NIVEAUX
// ─────────────────────────────────────────────

export const MAX_LEVEL = 50

// XP total cumulatif pour atteindre un niveau
export function xpForLevel(level: number): number {
  if (level <= 1) return 0
  const n = level - 1
  return Math.floor(30 * Math.pow(n, 1.5))
}

export function xpForNextLevel(level: number): number {
  return xpForLevel(level + 1) - xpForLevel(level)
}

// ─────────────────────────────────────────────
// PALIERS DE DÉBLOCAGE (tous les 10 niveaux)
// ─────────────────────────────────────────────

export const LEVEL_MILESTONES: { level: number; title: string; unlocks: string[] }[] = [
  { level: 1,  title: "Éveillé",               unlocks: ["Capture de base", "Collection", "Reliques Communes"] },
  { level: 10, title: "Apprenti Temporel",     unlocks: ["Reliques Rares débloquées"] },
  { level: 20, title: "Voyageur Temporel",     unlocks: ["Reliques Épiques débloquées"] },
  { level: 30, title: "Gardien du Temps",      unlocks: ["Reliques Légendaires débloquées"] },
  { level: 40, title: "Maître Temporel",       unlocks: ["Reliques Mythiques débloquées"] },
  { level: 50, title: "Gardien de l'Éternité", unlocks: ["Niveau maximum atteint", "Statut Éternel"] },
]

// ─────────────────────────────────────────────
// CLASSES DE PERSONNAGE
// ─────────────────────────────────────────────

export interface ClassConfig {
  label:        string
  description:  string
  lore:         string
  icon:         string
  color:        string
  gradient:     string
  rarityBonus:  Partial<Record<Rarity, number>>  // multiplicateur XP
  captureBonus: number   // captures bonus/jour (FREE)
}

export const CLASS_CONFIG: Record<CharacterClass, ClassConfig> = {
  CHRONOMANCER: {
    label:       "Chronomancien",
    description: "Maître du temps. Manipule les probabilités pour maximiser chaque capture.",
    lore:        "Les Chronomanciens ont appris à lire les fils du temps comme d'autres lisent les étoiles. Un instant raté n'est jamais perdu pour eux.",
    icon:        "⏰",
    color:       "text-violet-400",
    gradient:    "from-violet-600 to-indigo-600",
    rarityBonus: { COMMUNE: 1.2, RARE: 1.2, EPIQUE: 1.2, LEGENDAIRE: 1.2, MYTHIQUE: 1.2 },
    captureBonus: 3,
  },
  ARCHIVISTE: {
    label:       "Archiviste",
    description: "Savant du passé. Transforme chaque relique en source de connaissance.",
    lore:        "Les Archivistes gardent la mémoire du monde. Chaque minute capturée devient une page d'histoire vivante.",
    icon:        "📚",
    color:       "text-amber-400",
    gradient:    "from-amber-600 to-orange-600",
    rarityBonus: { RARE: 1.3, EPIQUE: 1.5, LEGENDAIRE: 1.5, MYTHIQUE: 2.0 },
    captureBonus: 2,
  },
  CHASSEUR: {
    label:       "Chasseur d'Instants",
    description: "Prédateur d'instants. Volume et vitesse — la quantité fait sa force.",
    lore:        "Le Chasseur ne dort jamais vraiment. Il guette chaque instant, prêt à bondir sur une relique avant qu'elle ne s'échappe.",
    icon:        "⚡",
    color:       "text-cyan-400",
    gradient:    "from-cyan-600 to-blue-600",
    rarityBonus: { EPIQUE: 1.3, LEGENDAIRE: 1.3 },
    captureBonus: 5,
  },
  ORACLE: {
    label:       "Oracle Temporel",
    description: "Prophète de l'éternité. Rare mais légendaire quand ça frappe.",
    lore:        "L'Oracle entend les murmures du futur. Là où les autres voient le hasard, il voit un destin tissé de fils dorés.",
    icon:        "🔮",
    color:       "text-pink-400",
    gradient:    "from-pink-600 to-rose-600",
    rarityBonus: { LEGENDAIRE: 2.5, MYTHIQUE: 3.5 },
    captureBonus: 2,
  },
}

// ─────────────────────────────────────────────
// MONÉTISATION
// ─────────────────────────────────────────────

export interface ShardPack {
  id:       string
  label:    string
  shards:   number
  priceEur: number
  bonus?:   string
  popular?: boolean
  priceId:  string
}

export const SHARD_PACKS: ShardPack[] = [
  { id: "starter",    label: "Pack Temporel",   shards: 100, priceEur: 1.99, priceId: "STRIPE_PRICE_SHARDS_STARTER" },
  { id: "aventurier", label: "Pack Aventurier", shards: 300, priceEur: 4.99, bonus: "+50 bonus", popular: true, priceId: "STRIPE_PRICE_SHARDS_AVENTURIER" },
  { id: "legendaire", label: "Pack Légendaire", shards: 750, priceEur: 9.99, bonus: "+200 bonus", priceId: "STRIPE_PRICE_SHARDS_LEGENDAIRE" },
]

export const SHARD_SHOP = [
  { id: "boost_rarete", label: "Boost de Rareté",   description: "+50% de rareté pendant 1h",  cost: 50, icon: "⬆️" },
  { id: "relance",      label: "Relance de Minute", description: "Relancez la minute actuelle", cost: 20, icon: "🔄" },
]

// ─────────────────────────────────────────────
// LIMITES (Freemium)
// ─────────────────────────────────────────────

export const FREE_LIMITS = {
  capturesPerDay: 5,
  maxLevel:       50,
  classes: ["CHRONOMANCER", "CHASSEUR"] as CharacterClass[],
}

export const PREMIUM_LIMITS = {
  capturesPerDay: Infinity,
  maxLevel:       50,
  classes: ["CHRONOMANCER", "ARCHIVISTE", "CHASSEUR", "ORACLE"] as CharacterClass[],
}

// ─────────────────────────────────────────────
// COLLECTIONS SECRETES
// ─────────────────────────────────────────────

export interface SecretCollection {
  id:          string
  label:       string
  description: string
  minutes:     string[]
  reward:      string
  xpBonus:     number
}

export const SECRET_COLLECTIONS: SecretCollection[] = [
  {
    id: "miroir",
    label: "L'Heure du Miroir",
    description: "Capturez les heures miroirs du temps.",
    minutes: ["00:00","01:01","02:02","03:03","04:04","05:05","06:06","07:07","08:08","09:09","10:10","11:11","12:12","13:13","14:14","15:15","16:16","17:17","18:18","19:19","20:20","21:21","22:22","23:23"],
    reward: "Titre : Gardien des Miroirs",
    xpBonus: 500,
  },
  {
    id: "palindrome",
    label: "Palindromes Temporels",
    description: "Capturez les minutes palindromes célèbres.",
    minutes: ["11:11", "12:21", "13:31", "22:22"],
    reward: "Titre : Maître du Palindrome",
    xpBonus: 200,
  },
  {
    id: "minuit",
    label: "L'Instant Zéro",
    description: "Capturez l'instant exact de minuit.",
    minutes: ["00:00"],
    reward: "Relique Légendaire Garantie",
    xpBonus: 300,
  },
]
