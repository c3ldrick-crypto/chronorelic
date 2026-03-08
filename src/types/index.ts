// ─────────────────────────────────────────────
// Types globaux ChronoRelic
// ─────────────────────────────────────────────

export type Role = "GUEST" | "FREE" | "PREMIUM" | "ADMIN"

export type CharacterClass = "CHRONOMANCER" | "ARCHIVISTE" | "CHASSEUR" | "ORACLE"

export type Rarity = "COMMUNE" | "RARE" | "EPIQUE" | "LEGENDAIRE" | "MYTHIQUE"

// ─────────────────────────────────────────────
// CONFIG DE RARETÉ
// ─────────────────────────────────────────────

export interface RarityConfig {
  label: string
  chance: number      // Probabilité en %
  xp: number          // XP de base
  color: string       // Couleur Tailwind
  glow: string        // Couleur de glow CSS
  emoji: string
}

export const RARITY_CONFIG: Record<Rarity, RarityConfig> = {
  COMMUNE: {
    label: "Commune",
    chance: 48,
    xp: 18,
    color: "text-slate-400",
    glow: "#6b7280",
    emoji: "⚪",
  },
  RARE: {
    label: "Rare",
    chance: 32,
    xp: 55,
    color: "text-blue-400",
    glow: "#3b82f6",
    emoji: "🔵",
  },
  EPIQUE: {
    label: "Épique",
    chance: 14,
    xp: 165,
    color: "text-violet-400",
    glow: "#8b5cf6",
    emoji: "🟣",
  },
  LEGENDAIRE: {
    label: "Légendaire",
    chance: 5,
    xp: 420,
    color: "text-amber-400",
    glow: "#f59e0b",
    emoji: "🟡",
  },
  MYTHIQUE: {
    label: "Mythique",
    chance: 1,
    xp: 1100,
    color: "text-pink-400",
    glow: "#ec4899",
    emoji: "🔮",
  },
}

// ─────────────────────────────────────────────
// CLASSES DE PERSONNAGE
// ─────────────────────────────────────────────

export interface ActiveAbilityConfig {
  id:          string
  label:       string
  description: string
  icon:        string
  usesPerDay:  number
  effect:      string   // machine-readable key for the ability route
}

export interface ClassConfig {
  label:          string
  description:    string
  lore:           string
  icon:           string
  playstyle:      string   // one-liner: how this class plays
  bonuses:        string[]
  color:          string
  gradient:       string
  rarityBonus:    Partial<Record<Rarity, number>>  // multiplicateur XP
  captureBonus:   number   // captures bonus/jour (FREE)
  rerollBonus:    boolean
  activeAbility:  ActiveAbilityConfig
  // Unique passive mechanics — used in UI + route descriptions
  passiveLabel:   string
  passiveDesc:    string
  // Sanctuaire multiplier — CHASSEUR gets +25% production
  sanctuaireBonus?: number
}

export const CLASS_CONFIG: Record<CharacterClass, ClassConfig> = {
  CHRONOMANCER: {
    label:       "Chronomancien",
    description: "Maître du temps. Manipule les probabilités, rejoue les instants, gèle les minutes précieuses.",
    lore:        "Les Chronomanciens ont appris à lire les fils du temps comme d'autres lisent les étoiles. Ils ne subissent pas le hasard — ils le plient à leur volonté. Un instant raté n'est jamais perdu pour eux.",
    icon:        "⏰",
    playstyle:   "Stratège et perfectionniste. Jouez peu, mais chaque capture est optimisée.",
    bonuses: [
      "Relance Temporelle (1×/jour) — rejoue la minute en cours avec +30% rareté",
      "+20% XP sur toutes les raretés",
      "Peut geler jusqu'à 3 minutes pour les capturer plus tard",
      "+3 captures gratuites/jour",
      "-10% échec Mode Risqué par talent Maîtrise",
    ],
    color:    "text-violet-400",
    gradient: "from-violet-600 to-indigo-600",
    rarityBonus: { COMMUNE: 1.2, RARE: 1.2, EPIQUE: 1.2, LEGENDAIRE: 1.2, MYTHIQUE: 1.2 },
    captureBonus: 3,
    rerollBonus:  true,
    activeAbility: {
      id:          "relance_temporelle",
      label:       "Relance Temporelle",
      description: "Rejoue la capture de la minute actuelle avec +30% de bonus de rareté. Usage: 1×/jour.",
      icon:        "🔄",
      usesPerDay:  1,
      effect:      "CHRONOMANCER_REROLL",
    },
    passiveLabel: "Gel Temporel",
    passiveDesc:  "Vous pouvez mémoriser jusqu'à 3 minutes pour les capturer plus tard dans la journée.",
  },

  ARCHIVISTE: {
    label:       "Archiviste",
    description: "Savant du passé. Transforme chaque relique en source de connaissance — et de ressources.",
    lore:        "Les Archivistes gardent la mémoire du monde. Chaque minute capturée devient pour eux une page d'histoire vivante. Là où les autres voient des reliques, ils voient des bibliothèques entières prêtes à être déchiffrées.",
    icon:        "📚",
    playstyle:   "Accumulation et efficacité. Votre valeur s'amplifie avec le temps.",
    bonuses: [
      "Synthèse des Savoirs (1×/jour) — analyse instantanée de TOUTES les reliques disponibles",
      "+50% XP sur les reliques avec événement historique",
      "RARE × 1.3, ÉPIQUE × 1.5, LÉGENDAIRE × 1.5, MYTHIQUE × 2.0 XP",
      "Voit toujours les événements historiques même sur COMMUNE",
      "Narrations IA enrichies (talent Chroniqueur)",
    ],
    color:    "text-amber-400",
    gradient: "from-amber-600 to-orange-600",
    rarityBonus: { RARE: 1.3, EPIQUE: 1.5, LEGENDAIRE: 1.5, MYTHIQUE: 2.0 },
    captureBonus: 2,
    rerollBonus:  false,
    activeAbility: {
      id:          "synthese_savoirs",
      label:       "Synthèse des Savoirs",
      description: "Analyse instantanément TOUTES vos reliques dont le cooldown est expiré. Récupère toutes les ressources d'analyse en un clic. Usage: 1×/jour.",
      icon:        "📖",
      usesPerDay:  1,
      effect:      "ARCHIVISTE_BATCH_ANALYZE",
    },
    passiveLabel: "Mémoire Historique",
    passiveDesc:  "Chaque capture sur une minute historique génère automatiquement un bonus de lore et de ressources amplifiées.",
  },

  CHASSEUR: {
    label:       "Chasseur d'Instants",
    description: "Prédateur d'instants. Volume, vitesse et Sanctuaire surpuissant — la quantité fait sa force.",
    lore:        "Le Chasseur ne dort jamais vraiment. Il guette chaque instant, prêt à bondir sur une relique avant qu'elle ne s'échappe dans l'éther. Son Sanctuaire tourne à plein régime pendant qu'il joue.",
    icon:        "⚡",
    playstyle:   "Joueur actif. Plus vous capturez, plus vous êtes puissant. Idéal pour les sessions longues.",
    bonuses: [
      "Instinct de Chasse (3×/jour) — prochaine capture garantie RARE+",
      "+5 captures gratuites/jour",
      "+30% chance ÉPIQUE & LÉGENDAIRE",
      "+25% production du Sanctuaire (éclats, chronite, essences)",
      "+2 captures gratuites/jour par niveau de talent Sprint",
    ],
    color:    "text-cyan-400",
    gradient: "from-cyan-600 to-blue-600",
    rarityBonus: { EPIQUE: 1.3, LEGENDAIRE: 1.3 },
    captureBonus:    5,
    rerollBonus:     false,
    sanctuaireBonus: 0.25,
    activeAbility: {
      id:          "instinct_chasse",
      label:       "Instinct de Chasse",
      description: "Active un mode de chasse : votre prochaine capture est garantie RARE ou supérieur. Usage: 3×/jour.",
      icon:        "🎯",
      usesPerDay:  3,
      effect:      "CHASSEUR_GUARANTEED_RARE",
    },
    passiveLabel: "Prédateur du Sanctuaire",
    passiveDesc:  "Votre Sanctuaire produit 25% de ressources supplémentaires sur tous les modules.",
  },

  ORACLE: {
    label:       "Oracle Temporel",
    description: "Prophète de l'éternité. Rare, très rare, mais quand ça frappe — c'est légendaire.",
    lore:        "L'Oracle entend les murmures du futur. Là où les autres voient le hasard, il voit un destin tissé de fils dorés. Il rate souvent le commun — mais n'est jamais surpris quand l'impossible se produit.",
    icon:        "🔮",
    playstyle:   "Chasseur de rares. Haute variance — longues périodes de COMMUNE puis un coup légendaire inoubliable.",
    bonuses: [
      "Vision Prophétique (2×/jour) — révèle les 5 minutes les plus puissantes du jour",
      "LÉGENDAIRE × 2.5, MYTHIQUE × 3.5 XP",
      "LÉGENDAIRE+ compte comme minute bénie (bonus XP automatique)",
      "Anomalie Mythique plus fréquente",
      "5% de chance par talent de monter la rareté d'un cran",
    ],
    color:    "text-pink-400",
    gradient: "from-pink-600 to-rose-600",
    rarityBonus: { LEGENDAIRE: 2.5, MYTHIQUE: 3.5 },
    captureBonus: 2,
    rerollBonus:  false,
    activeAbility: {
      id:          "vision_prophetique",
      label:       "Vision Prophétique",
      description: "Révèle les 5 minutes du jour les plus chargées en énergie historique (les meilleures à capturer). Usage: 2×/jour.",
      icon:        "👁️",
      usesPerDay:  2,
      effect:      "ORACLE_VISION",
    },
    passiveLabel: "Présence Légendaire",
    passiveDesc:  "Toutes vos reliques LÉGENDAIRE et MYTHIQUE sont automatiquement traitées comme des minutes bénies.",
  },
}

// ─────────────────────────────────────────────
// SYSTÈME DE NIVEAUX
// ─────────────────────────────────────────────

export const MAX_LEVEL = 100

export function xpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(level, 1.5))
}

export function xpForNextLevel(level: number): number {
  return xpForLevel(level + 1) - xpForLevel(level)
}

// ─────────────────────────────────────────────
// TALENTS — spécifiques par classe
// ─────────────────────────────────────────────

export interface TalentConfig {
  id: string
  tree: "CHRONO" | "ARCHIVISTE" | "CHASSEUR" | "ORACLE"
  label: string
  description: string
  maxLevel: number
  cost: number  // talent points
  icon: string
  classes: CharacterClass[]  // classes pouvant débloquer ce talent
}

export const TALENTS: TalentConfig[] = [
  // ── CHRONOMANCIEN ────────────────────────────────────────────────────────
  {
    id: "relance_minute", tree: "CHRONO", classes: ["CHRONOMANCER"],
    label: "Relance de Minute",
    description: "+1 relance de minute par jour. Rejoue la loterie du temps.",
    maxLevel: 3, cost: 1, icon: "🔄",
  },
  {
    id: "distorsion", tree: "CHRONO", classes: ["CHRONOMANCER"],
    label: "Distorsion Temporelle",
    description: "+10% XP sur toutes les captures par niveau.",
    maxLevel: 5, cost: 1, icon: "🌀",
  },
  {
    id: "maitrise_risque", tree: "CHRONO", classes: ["CHRONOMANCER"],
    label: "Maîtrise du Risque",
    description: "-10% de chance d'échec en Mode Risqué par niveau.",
    maxLevel: 2, cost: 2, icon: "🛡️",
  },
  {
    id: "double_capture", tree: "CHRONO", classes: ["CHRONOMANCER"],
    label: "Double Capture",
    description: "Capture deux reliques en une seule action.",
    maxLevel: 1, cost: 3, icon: "⏱️",
  },
  {
    id: "fissure_temporelle", tree: "CHRONO", classes: ["CHRONOMANCER"],
    label: "Fissure Temporelle",
    description: "10% de chance par niveau d'obtenir une 2ème relique de rareté inférieure.",
    maxLevel: 2, cost: 2, icon: "💥",
  },

  // ── ARCHIVISTE ────────────────────────────────────────────────────────────
  {
    id: "bonus_xp_events", tree: "ARCHIVISTE", classes: ["ARCHIVISTE"],
    label: "Érudit",
    description: "+50% XP sur les minutes avec un événement historique.",
    maxLevel: 3, cost: 1, icon: "📖",
  },
  {
    id: "events_rares", tree: "ARCHIVISTE", classes: ["ARCHIVISTE"],
    label: "Historien",
    description: "+20% de chance que la minute ait un événement historique rare.",
    maxLevel: 2, cost: 2, icon: "🏛️",
  },
  {
    id: "lore_enrichi", tree: "ARCHIVISTE", classes: ["ARCHIVISTE"],
    label: "Chroniqueur",
    description: "Les narrations IA sont plus longues, précises et immersives.",
    maxLevel: 1, cost: 3, icon: "✍️",
  },
  {
    id: "memoire_vive", tree: "ARCHIVISTE", classes: ["ARCHIVISTE"],
    label: "Mémoire Vive",
    description: "+20% XP sur toutes les reliques RARE et supérieur, par niveau.",
    maxLevel: 3, cost: 1, icon: "🧠",
  },
  {
    id: "erudit_supreme", tree: "ARCHIVISTE", classes: ["ARCHIVISTE"],
    label: "Érudit Suprême",
    description: "Double l'XP gagné sur toutes les reliques ÉPIQUE et supérieur.",
    maxLevel: 1, cost: 4, icon: "📜",
  },

  // ── CHASSEUR ─────────────────────────────────────────────────────────────
  {
    id: "chance_epique", tree: "CHASSEUR", classes: ["CHASSEUR"],
    label: "Œil Acéré",
    description: "+5% de chance Épique par niveau.",
    maxLevel: 4, cost: 1, icon: "👁️",
  },
  {
    id: "jackpot_xp", tree: "CHASSEUR", classes: ["CHASSEUR"],
    label: "Jackpot",
    description: "5% de chance par niveau de tripler l'XP d'une capture.",
    maxLevel: 2, cost: 2, icon: "💰",
  },
  {
    id: "drop_mythique", tree: "CHASSEUR", classes: ["CHASSEUR"],
    label: "Touché par les Dieux",
    description: "+0.5% de chance Mythique (base 1%).",
    maxLevel: 1, cost: 5, icon: "✨",
  },
  {
    id: "sprint_temporel", tree: "CHASSEUR", classes: ["CHASSEUR"],
    label: "Sprint Temporel",
    description: "+2 captures gratuites par jour et par niveau.",
    maxLevel: 3, cost: 1, icon: "💨",
  },
  {
    id: "radar_reliques", tree: "CHASSEUR", classes: ["CHASSEUR"],
    label: "Radar à Reliques",
    description: "+10% de chance RARE et supérieur par niveau.",
    maxLevel: 2, cost: 2, icon: "📡",
  },

  // ── ORACLE ────────────────────────────────────────────────────────────────
  {
    id: "oracle_legendaire", tree: "ORACLE", classes: ["ORACLE"],
    label: "Vision Légendaire",
    description: "+10% de chance Légendaire par niveau.",
    maxLevel: 3, cost: 2, icon: "👁️",
  },
  {
    id: "anomalie_pressentie", tree: "ORACLE", classes: ["ORACLE"],
    label: "Anomalie Pressentie",
    description: "+1% de chance Mythique par niveau (base 1%, ×2 ORACLE).",
    maxLevel: 2, cost: 2, icon: "🔮",
  },
  {
    id: "flux_divin", tree: "ORACLE", classes: ["ORACLE"],
    label: "Flux Divin",
    description: "+50% XP sur les reliques LÉGENDAIRE et MYTHIQUE par niveau.",
    maxLevel: 2, cost: 2, icon: "⚡",
  },
  {
    id: "prophetie", tree: "ORACLE", classes: ["ORACLE"],
    label: "Prophétie",
    description: "5% de chance par niveau d'élever la rareté d'un cran (jusqu'à Légendaire).",
    maxLevel: 2, cost: 3, icon: "🌟",
  },
  {
    id: "oeil_eternite", tree: "ORACLE", classes: ["ORACLE"],
    label: "Œil de l'Éternité",
    description: "Aperçois la rareté approximative avant de confirmer la capture.",
    maxLevel: 1, cost: 3, icon: "🌌",
  },

  // ── CHRONOMANCIEN — AVANCÉS ──────────────────────────────────────────────
  {
    id: "resonance_chrono", tree: "CHRONO", classes: ["CHRONOMANCER"],
    label: "Résonance Chronique",
    description: "Réduit le cooldown d'analyse de vos reliques de 30 min par niveau (max −2h).",
    maxLevel: 2, cost: 3, icon: "⏳",
  },
  {
    id: "distorsion_supreme", tree: "CHRONO", classes: ["CHRONOMANCER"],
    label: "Distorsion Suprême",
    description: "+30% XP supplémentaire sur les reliques ÉPIQUE et supérieur par niveau.",
    maxLevel: 2, cost: 3, icon: "🌌",
  },
  {
    id: "gel_temporel", tree: "CHRONO", classes: ["CHRONOMANCER"],
    label: "Gel Temporel",
    description: "Mémorisez jusqu'à 3 minutes supplémentaires pour les capturer plus tard dans la journée.",
    maxLevel: 3, cost: 3, icon: "❄️",
  },
  {
    id: "boucle_parfaite", tree: "CHRONO", classes: ["CHRONOMANCER"],
    label: "Boucle Parfaite",
    description: "Chaque capture MYTHIQUE restaure automatiquement une Relance Temporelle.",
    maxLevel: 1, cost: 5, icon: "♾️",
  },
  {
    id: "maelstrom_temporel", tree: "CHRONO", classes: ["CHRONOMANCER"],
    label: "Maëlstrom Temporel",
    description: "Mode Risqué réussi : votre prochaine capture bénéficie d'un bonus rareté +20%.",
    maxLevel: 1, cost: 4, icon: "🌪️",
  },

  // ── ARCHIVISTE — AVANCÉS ─────────────────────────────────────────────────
  {
    id: "analyse_profonde", tree: "ARCHIVISTE", classes: ["ARCHIVISTE"],
    label: "Analyse Approfondie",
    description: "Réduit le cooldown d'analyse de toutes vos reliques de 30 min par niveau.",
    maxLevel: 3, cost: 2, icon: "🔬",
  },
  {
    id: "bibliotheque", tree: "ARCHIVISTE", classes: ["ARCHIVISTE"],
    label: "Bibliothèque Vivante",
    description: "+15% de ressources reçues à chaque analyse de relique par niveau.",
    maxLevel: 2, cost: 3, icon: "📚",
  },
  {
    id: "resonance_historique", tree: "ARCHIVISTE", classes: ["ARCHIVISTE"],
    label: "Résonance Historique",
    description: "+5% de probabilité supplémentaire de trouver un événement historique par niveau.",
    maxLevel: 3, cost: 2, icon: "🏛️",
  },
  {
    id: "chroniqueur_supreme", tree: "ARCHIVISTE", classes: ["ARCHIVISTE"],
    label: "Chroniqueur Suprême",
    description: "Narrations IA encore plus riches. +10% XP sur chaque relique avec narration générée.",
    maxLevel: 1, cost: 5, icon: "📜",
  },
  {
    id: "savoir_universel", tree: "ARCHIVISTE", classes: ["ARCHIVISTE"],
    label: "Savoir Universel",
    description: "Même les reliques COMMUNE génèrent des Essences Historiques lors de l'analyse.",
    maxLevel: 1, cost: 5, icon: "🌍",
  },

  // ── CHASSEUR — AVANCÉS ───────────────────────────────────────────────────
  {
    id: "predateur_elite", tree: "CHASSEUR", classes: ["CHASSEUR"],
    label: "Prédateur Élite",
    description: "+10% de ressources sur chaque capture par niveau.",
    maxLevel: 3, cost: 2, icon: "🦅",
  },
  {
    id: "sanctuaire_amp", tree: "CHASSEUR", classes: ["CHASSEUR"],
    label: "Sanctuaire Amplifié",
    description: "+10% de production du Sanctuaire par niveau (cumulable avec le bonus de classe).",
    maxLevel: 2, cost: 3, icon: "🏰",
  },
  {
    id: "chasse_intensive", tree: "CHASSEUR", classes: ["CHASSEUR"],
    label: "Chasse Intensive",
    description: "+1 utilisation d'Instinct de Chasse par jour par niveau.",
    maxLevel: 2, cost: 3, icon: "🎯",
  },
  {
    id: "sixieme_sens", tree: "CHASSEUR", classes: ["CHASSEUR"],
    label: "Sixième Sens",
    description: "Révèle la rareté approximative avant de confirmer chaque capture.",
    maxLevel: 1, cost: 5, icon: "🌠",
  },
  {
    id: "furie_de_chasse", tree: "CHASSEUR", classes: ["CHASSEUR"],
    label: "Furie de Chasse",
    description: "Capturer une relique MYTHIQUE active automatiquement un Instinct de Chasse.",
    maxLevel: 1, cost: 5, icon: "⚔️",
  },

  // ── ORACLE — AVANCÉS ─────────────────────────────────────────────────────
  {
    id: "oracle_mythique", tree: "ORACLE", classes: ["ORACLE"],
    label: "Oracle Mythique",
    description: "+2% de chance Mythique par niveau (amplifié ×2 par votre classe).",
    maxLevel: 2, cost: 3, icon: "💫",
  },
  {
    id: "prescience", tree: "ORACLE", classes: ["ORACLE"],
    label: "Prescience",
    description: "+1 utilisation de Vision Prophétique par jour par niveau.",
    maxLevel: 2, cost: 2, icon: "🌟",
  },
  {
    id: "benediction_temporelle", tree: "ORACLE", classes: ["ORACLE"],
    label: "Bénédiction Temporelle",
    description: "Toutes vos reliques RARE et supérieur comptent automatiquement comme minutes bénies.",
    maxLevel: 1, cost: 4, icon: "✨",
  },
  {
    id: "nexus_prophetique", tree: "ORACLE", classes: ["ORACLE"],
    label: "Nexus Prophétique",
    description: "Reliques MYTHIQUE : ×2 Essences Historiques et ×2 Fragments d'Anomalie, par niveau.",
    maxLevel: 2, cost: 3, icon: "🔮",
  },
  {
    id: "vision_eternelle", tree: "ORACLE", classes: ["ORACLE"],
    label: "Vision Éternelle",
    description: "Vision Prophétique révèle 10 minutes au lieu de 5.",
    maxLevel: 1, cost: 5, icon: "🌌",
  },
]

// Helpers
export function getTalentsForClass(characterClass: CharacterClass): TalentConfig[] {
  return TALENTS.filter((t) => t.classes.includes(characterClass))
}

// ─────────────────────────────────────────────
// QUÊTES PRINCIPALES (chaîne narrative niveau 1→20)
// ─────────────────────────────────────────────

export type QuestObjectiveType = "capture" | "capture_rarity" | "reach_level" | "use_risky"

export interface QuestObjective {
  type: QuestObjectiveType
  count: number
  rarityMin?: Rarity  // pour capture_rarity : compte rarity >= rarityMin
}

export interface QuestReward {
  xp?:           number
  resources?:    Partial<Resources>
  items?:        { itemId: string; quantity: number }[]
  talentPoints?: number
}

export interface QuestDefinition {
  id:        string
  order:     number
  title:     string
  subtitle:  string   // accroche courte
  lore:      string   // texte narratif immersif
  objective: QuestObjective
  rewards:   QuestReward
}

export const MAIN_QUESTS: QuestDefinition[] = [
  {
    id: "q01_eveil",
    order: 1,
    title: "L'Éveil du Gardien",
    subtitle: "Tout commence par un battement.",
    lore: "Le temps résonne autour de toi comme un tambour à l'aube du monde. Une minute attend, suspendue dans l'éther. Tends la main... et capture-la.",
    objective: { type: "capture", count: 1 },
    rewards: { xp: 50, resources: { eclatsTemporels: 20 } },
  },
  {
    id: "q02_fondations",
    order: 2,
    title: "Les Fondations du Temps",
    subtitle: "Cinq instants gravés dans l'éternité.",
    lore: "Chaque minute capturée grave ton nom dans les Annales du Temps. Les anciens Gardiens ont commencé ainsi — un instant après l'autre, jusqu'à ce que leur collection brille comme une constellation.",
    objective: { type: "capture", count: 5 },
    rewards: { xp: 100, resources: { eclatsTemporels: 50, chronite: 2 } },
  },
  {
    id: "q03_appel_passe",
    order: 3,
    title: "L'Appel du Passé",
    subtitle: "Le pouvoir vient de l'expérience.",
    lore: "La maîtrise du temps ne s'acquiert pas en un jour. Les Gardiens anciens t'observent. Ils attendent de voir si tu seras digne de porter leur héritage. Prouve-le.",
    objective: { type: "reach_level", count: 3 },
    rewards: { xp: 200, talentPoints: 1 },
  },
  {
    id: "q04_rarete",
    order: 4,
    title: "La Rareté Dévoilée",
    subtitle: "Le temps réserve ses trésors aux patients.",
    lore: "Au-delà des minutes ordinaires se cachent des instants chargés d'histoire. Un frémissement dans le tissu du temps... une relique rare vient de te révéler ses secrets.",
    objective: { type: "capture_rarity", count: 1, rarityMin: "RARE" },
    rewards: { xp: 300, resources: { eclatsTemporels: 80, chronite: 3 } },
  },
  {
    id: "q05_apprenti",
    order: 5,
    title: "L'Apprenti Confirmé",
    subtitle: "Dix instants, une vie de Gardien.",
    lore: "Dix instants gravés dans l'éternité. Dix battements de cœur du Temps lui-même. Tu n'es plus un simple mortel — tu es un Gardien, reconnu par les Chronos comme l'un des leurs.",
    objective: { type: "capture", count: 10 },
    rewards: { xp: 500, items: [{ itemId: "eclat_passe", quantity: 1 }] },
  },
  {
    id: "q06_seuil",
    order: 6,
    title: "La Traversée du Seuil",
    subtitle: "Niveau 5 — le Conseil des Chronos t'a remarqué.",
    lore: "Niveau 5. La première frontière est franchie. Dans les salles souterraines du Conseil des Chronos, ton nom circule. Des portes scellées depuis des siècles commencent à s'entrouvrir.",
    objective: { type: "reach_level", count: 5 },
    rewards: { xp: 800, resources: { eclatsTemporels: 100, chronite: 5 }, talentPoints: 1 },
  },
  {
    id: "q07_epique",
    order: 7,
    title: "La Quête de l'Épique",
    subtitle: "Une vibration différente dans le flux temporel.",
    lore: "L'Épique... une vibration différente, plus profonde. Le passé te montre ses moments les plus intenses — des instants où le monde a retenu son souffle. Tu en as capturé un.",
    objective: { type: "capture_rarity", count: 1, rarityMin: "EPIQUE" },
    rewards: { xp: 1200, resources: { essencesHistoriques: 2 }, talentPoints: 1 },
  },
  {
    id: "q08_carrefour",
    order: 8,
    title: "Le Carrefour Temporel",
    subtitle: "Au seuil du dixième niveau, tout change.",
    lore: "Dix niveaux. Le Mode Risqué s'éveille en toi. La Pierre de Résonance vibre dans ta main. Au-delà de ce seuil, des pouvoirs que peu de Gardiens ont jamais maîtrisés t'attendent.",
    objective: { type: "reach_level", count: 10 },
    rewards: { xp: 2000, items: [{ itemId: "pierre_resonance", quantity: 1 }], talentPoints: 2 },
  },
  {
    id: "q09_bapteme_risque",
    order: 9,
    title: "Le Baptême du Risque",
    subtitle: "Le risque est la mesure d'un vrai Gardien.",
    lore: "Le Mode Risqué n'est pas une folie — c'est une danse avec le temps lui-même. Mise tes ressources. Plonge dans les eaux troubles du flux temporel. Trois fois. Prouve que tu maîtrises la peur.",
    objective: { type: "use_risky", count: 3 },
    rewards: { xp: 2500, resources: { eclatsTemporels: 300, chronite: 20 } },
  },
  {
    id: "q10_legende",
    order: 10,
    title: "La Légende Surgit",
    subtitle: "Le temps lui-même retient son souffle.",
    lore: "Une relique légendaire... Le monde entier s'est arrêté pendant cet instant. Les Annales du Temps s'embraseront de ton nom. Tu es entré dans la légende.",
    objective: { type: "capture_rarity", count: 1, rarityMin: "LEGENDAIRE" },
    rewards: { xp: 3000, resources: { essencesHistoriques: 3, fragmentsAnomalie: 1 } },
  },
  {
    id: "q11_collection",
    order: 11,
    title: "L'Ère des Collections",
    subtitle: "30 instants — la Timeline porte ta marque.",
    lore: "Trente minutes capturées. Ta collection commence à rayonner d'une lumière propre. Les autres Gardiens murmurent ton nom. La Timeline elle-même se souvient de chacun de tes passages.",
    objective: { type: "capture", count: 30 },
    rewards: { xp: 5000, resources: { eclatsTemporels: 500, chronite: 30, essencesHistoriques: 2 }, talentPoints: 2 },
  },
  {
    id: "q12_maitrise",
    order: 12,
    title: "Le Seuil de Maîtrise",
    subtitle: "Niveau 15 — les portes du Voyageur s'ouvrent.",
    lore: "Niveau 15. Un rang que peu de Gardiens atteignent. Les portes du Voyageur Temporel s'ouvrent. Le passé n'est plus une frontière pour toi — c'est un territoire à explorer.",
    objective: { type: "reach_level", count: 15 },
    rewards: { xp: 7000, resources: { essencesHistoriques: 2, fragmentsAnomalie: 1 }, talentPoints: 2 },
  },
  {
    id: "q13_souffle_legendaire",
    order: 13,
    title: "Le Souffle du Légendaire",
    subtitle: "Trois fois, le temps s'est arrêté pour toi.",
    lore: "Trois reliques légendaires. Trois moments où la réalité a tremblé. La légende dit que les vrais Gardiens voient en or — maintenant tu comprends ce que cela signifie.",
    objective: { type: "capture_rarity", count: 3, rarityMin: "LEGENDAIRE" },
    rewards: { xp: 8000, resources: { eclatsTemporels: 800, essencesHistoriques: 5 } },
  },
  {
    id: "q14_grand_collectionneur",
    order: 14,
    title: "Le Grand Collectionneur",
    subtitle: "50 reliques — tu rejoins les Anciens.",
    lore: "Cinquante instants. Cinquante battements de l'univers que tu as capturés et préservés. Les Anciens t'accueillent dans leur cercle. Leur sagesse millénaire t'appartient désormais.",
    objective: { type: "capture", count: 50 },
    rewards: { xp: 10000, resources: { eclatsTemporels: 1000, chronite: 50, essencesHistoriques: 3, fragmentsAnomalie: 2 }, talentPoints: 3 },
  },
  {
    id: "q15_eveil_voyageur",
    order: 15,
    title: "L'Éveil du Voyageur",
    subtitle: "Niveau 20 — ton voyage ne fait que commencer.",
    lore: "Niveau 20. Tu es maintenant un Voyageur Temporel à part entière. Les Chronos t'offrent la Clé des Âges — passage vers les 24 dernières heures. Ton voyage dans l'infini du temps ne fait que commencer.",
    objective: { type: "reach_level", count: 20 },
    rewards: {
      xp: 15000,
      items: [{ itemId: "cle_ages", quantity: 1 }],
      resources: { fragmentsAnomalie: 5, essencesHistoriques: 5 },
      talentPoints: 3,
    },
  },
]

// ─────────────────────────────────────────────
// COLLECTIONS SECRETES
// ─────────────────────────────────────────────

export interface SecretCollection {
  id: string
  label: string
  description: string
  minutes: string[]
  reward: string
  xpBonus: number
}

export const SECRET_COLLECTIONS: SecretCollection[] = [
  {
    id: "miroir",
    label: "L'Heure du Miroir",
    description: "Capturez les heures miroirs du temps.",
    minutes: ["00:00", "01:01", "02:02", "03:03", "04:04", "05:05", "06:06", "07:07", "08:08", "09:09", "10:10", "11:11", "12:12", "13:13", "14:14", "15:15", "16:16", "17:17", "18:18", "19:19", "20:20", "21:21", "22:22", "23:23"],
    reward: "Titre : Gardien des Miroirs",
    xpBonus: 2000,
  },
  {
    id: "palindrome",
    label: "Palindromes Temporels",
    description: "Capturez les minutes palindromes célèbres.",
    minutes: ["11:11", "12:21", "13:31", "22:22"],
    reward: "Titre : Maître du Palindrome",
    xpBonus: 500,
  },
  {
    id: "minuit",
    label: "L'Instant Zéro",
    description: "Capturez l'instant exact de minuit.",
    minutes: ["00:00"],
    reward: "Relique Légendaire Garantie",
    xpBonus: 1000,
  },
]

// ─────────────────────────────────────────────
// RESSOURCES DE CRAFT
// ─────────────────────────────────────────────

export interface Resources {
  eclatsTemporels:     number
  chronite:            number
  essencesHistoriques: number
  fragmentsAnomalie:   number
}

export const RESOURCE_DROPS: Record<Rarity, Resources> = {
  COMMUNE:    { eclatsTemporels: 12,  chronite: 1,  essencesHistoriques: 0, fragmentsAnomalie: 0 },
  RARE:       { eclatsTemporels: 30,  chronite: 3,  essencesHistoriques: 1, fragmentsAnomalie: 0 },
  EPIQUE:     { eclatsTemporels: 75,  chronite: 10, essencesHistoriques: 3, fragmentsAnomalie: 0 },
  LEGENDAIRE: { eclatsTemporels: 180, chronite: 25, essencesHistoriques: 6, fragmentsAnomalie: 1 },
  MYTHIQUE:   { eclatsTemporels: 500, chronite: 75, essencesHistoriques: 12, fragmentsAnomalie: 3 },
}

export const RESOURCE_EVENT_BONUS: Resources = {
  eclatsTemporels: 25, chronite: 4, essencesHistoriques: 3, fragmentsAnomalie: 0,
}

// ─────────────────────────────────────────────
// OBJETS CRAFTÉS (Voyage Temporel)
// ─────────────────────────────────────────────

export type CraftEffect = "TIME_TRAVEL_1H" | "TIME_TRAVEL_24H" | "TIME_TRAVEL_7D" | "TIME_TRAVEL_RANDOM" | "DUPLICATE_CAPTURE"

export interface CraftItem {
  id:            string
  label:         string
  description:   string
  icon:          string
  levelRequired: number
  cost:          Resources
  effect:        CraftEffect
  timeRange?:    number       // Minutes accessibles dans le passé
  successRate:   number       // % de succès
  riskFail?:     Resources    // Ressources perdues si échec
}

export const CRAFT_ITEMS: CraftItem[] = [
  {
    id: "eclat_passe", label: "Éclat du Passé", icon: "✨", levelRequired: 5,
    description:  "Capture une minute aléatoire écoulée dans la dernière heure.",
    cost:         { eclatsTemporels: 30, chronite: 2, essencesHistoriques: 0, fragmentsAnomalie: 0 },
    effect:       "TIME_TRAVEL_RANDOM", timeRange: 60, successRate: 100,
  },
  {
    id: "pierre_resonance", label: "Pierre de Résonance", icon: "🪨", levelRequired: 10,
    description:  "Remonte jusqu'à 1 heure en arrière. Choisissez la minute précise.",
    cost:         { eclatsTemporels: 60, chronite: 5, essencesHistoriques: 0, fragmentsAnomalie: 0 },
    effect:       "TIME_TRAVEL_1H", timeRange: 60, successRate: 90,
    riskFail:     { eclatsTemporels: 20, chronite: 2, essencesHistoriques: 0, fragmentsAnomalie: 0 },
  },
  {
    id: "cle_ages", label: "Clé des Âges", icon: "🗝️", levelRequired: 20,
    description:  "Accédez aux 24 dernières heures. Risque d'échec — ressources perdues.",
    cost:         { eclatsTemporels: 180, chronite: 20, essencesHistoriques: 1, fragmentsAnomalie: 0 },
    effect:       "TIME_TRAVEL_24H", timeRange: 1440, successRate: 75,
    riskFail:     { eclatsTemporels: 80, chronite: 10, essencesHistoriques: 0, fragmentsAnomalie: 0 },
  },
  {
    id: "artefact_chrono", label: "Artefact Chrono", icon: "⌛", levelRequired: 40,
    description:  "Remontez jusqu'à 7 jours. Succès incertain — récompense exceptionnelle.",
    cost:         { eclatsTemporels: 500, chronite: 80, essencesHistoriques: 4, fragmentsAnomalie: 1 },
    effect:       "TIME_TRAVEL_7D", timeRange: 10080, successRate: 50,
    riskFail:     { eclatsTemporels: 200, chronite: 40, essencesHistoriques: 2, fragmentsAnomalie: 0 },
  },
  {
    id: "sceau_eternite", label: "Sceau d'Éternité", icon: "🔱", levelRequired: 60,
    description:  "Capture une 2ème fois une minute déjà dans votre collection. Usage unique.",
    cost:         { eclatsTemporels: 400, chronite: 60, essencesHistoriques: 5, fragmentsAnomalie: 2 },
    effect:       "DUPLICATE_CAPTURE", successRate: 100,
  },
]

// ─────────────────────────────────────────────
// RISQUE / RÉCOMPENSE
// ─────────────────────────────────────────────

export const RISKY_CAPTURE = {
  bet:          { eclatsTemporels: 15, chronite: 1, essencesHistoriques: 0, fragmentsAnomalie: 0 } as Resources,
  successBonus: 2.0,   // ×2 XP et ressources si succès
  failChance:   0.30,  // 30% d'échec — pas de relique, mise perdue
}

// ─────────────────────────────────────────────
// PALIERS DE DÉBLOCAGE
// ─────────────────────────────────────────────

export const LEVEL_MILESTONES: { level: number; title: string; unlocks: string[] }[] = [
  { level: 1,   title: "Éveillé",              unlocks: ["Capture de base", "Collection"] },
  { level: 5,   title: "Novice Chronique",     unlocks: ["Ressources de craft", "Éclat du Passé"] },
  { level: 10,  title: "Apprenti Temporel",    unlocks: ["Talents avancés", "Pierre de Résonance", "Mode Risqué"] },
  { level: 15,  title: "Capteur d'Instants",   unlocks: ["Boosts Premium", "Collections Secrètes"] },
  { level: 20,  title: "Voyageur Temporel",    unlocks: ["Clé des Âges", "Fusion Améliorée"] },
  { level: 30,  title: "Gardien du Temps",     unlocks: ["Minutes Gelées (Chronomancien)", "Combos x3"] },
  { level: 40,  title: "Archiviste Temporel",  unlocks: ["Artefact Chrono", "Événements cachés"] },
  { level: 60,  title: "Maître Temporel",      unlocks: ["Sceau d'Éternité", "Classement Légendaire"] },
  { level: 80,  title: "Seigneur du Temps",    unlocks: ["Titres exclusifs", "Reliques Ancestrales"] },
  { level: 100, title: "Gardien de l'Éternité", unlocks: ["Statut Éternel", "Hall of Fame"] },
]

// ─────────────────────────────────────────────
// MONÉTISATION
// ─────────────────────────────────────────────

export interface ShardPack {
  id: string
  label: string
  shards: number
  priceEur: number
  bonus?: string
  popular?: boolean
  priceId: string  // Stripe Price ID env key
}

export const SHARD_PACKS: ShardPack[] = [
  { id: "starter", label: "Pack Temporel", shards: 100, priceEur: 1.99, priceId: "STRIPE_PRICE_SHARDS_STARTER" },
  { id: "aventurier", label: "Pack Aventurier", shards: 300, priceEur: 4.99, bonus: "+50 bonus", popular: true, priceId: "STRIPE_PRICE_SHARDS_AVENTURIER" },
  { id: "legendaire", label: "Pack Légendaire", shards: 750, priceEur: 9.99, bonus: "+200 bonus", priceId: "STRIPE_PRICE_SHARDS_LEGENDAIRE" },
]

export const SHARD_SHOP = [
  { id: "boost_rarete", label: "Boost de Rareté", description: "+50% de rareté pendant 1h", cost: 50, icon: "⬆️" },
  { id: "relance", label: "Relance de Minute", description: "Relancez la minute actuelle", cost: 20, icon: "🔄" },
  { id: "slot_inventaire", label: "Slot d'Inventaire", description: "+10 emplacements dans l'inventaire", cost: 100, icon: "🎒" },
  { id: "skin_legendaire", label: "Skin Légendaire", description: "Skin visuel pour vos reliques", cost: 200, icon: "✨" },
]

// ─────────────────────────────────────────────
// LIMITES (Freemium)
// ─────────────────────────────────────────────

export const FREE_LIMITS = {
  capturesPerDay: 5,
  maxLevel: 20,
  inventorySlots: 50,
  classes: ["CHRONOMANCER", "CHASSEUR"] as CharacterClass[],
}

export const PREMIUM_LIMITS = {
  capturesPerDay: Infinity,
  maxLevel: 100,
  inventorySlots: Infinity,
  classes: ["CHRONOMANCER", "ARCHIVISTE", "CHASSEUR", "ORACLE"] as CharacterClass[],
}
