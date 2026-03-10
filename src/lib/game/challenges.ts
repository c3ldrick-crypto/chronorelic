// ─────────────────────────────────────────────
// Défis Quotidiens — ChronoRelic
// 3 défis par jour (facile / moyen / difficile), sélection déterministe par date
// ─────────────────────────────────────────────

export interface ChallengeReward {
  xp?: number
}

export interface ChallengeDefinition {
  id:           string
  label:        string
  description:  string
  icon:         string
  difficulty:   "easy" | "medium" | "hard"
  target:       number
  reward:       ChallengeReward
  rewardLabel:  string
  type:         "captures" | "rarity" | "ability" | "risky" | "event" | "analyze" | "harvest" | "morning"
  rarityTarget?: string   // min rarity to count (for "rarity" type)
  hint:         string    // où aller pour accomplir ce défi
}

const POOL: ChallengeDefinition[] = [
  // ─── FACILE ────────────────────────────────────────────────────────────────
  {
    id: "cap2", label: "Chasseur de Reliques",
    description: "Capturez 2 reliques aujourd'hui",
    icon: "⏳", difficulty: "easy", target: 2, type: "captures",
    reward: { xp: 50 }, rewardLabel: "+50 XP",
    hint: "Page Capturer",
  },
  {
    id: "cap3", label: "Assidu du Temps",
    description: "Capturez 3 reliques aujourd'hui",
    icon: "📦", difficulty: "easy", target: 3, type: "captures",
    reward: { xp: 80 }, rewardLabel: "+80 XP",
    hint: "Page Capturer",
  },
  {
    id: "morning", label: "Gardien Matinal",
    description: "Capturez une relique avant 10h00",
    icon: "🌅", difficulty: "easy", target: 1, type: "morning",
    reward: { xp: 60 }, rewardLabel: "+60 XP",
    hint: "Page Capturer — avant 10h",
  },
  {
    id: "harvest", label: "Veilleur du Passé",
    description: "Capturez 1 relique aujourd'hui",
    icon: "🏛️", difficulty: "easy", target: 1, type: "captures",
    reward: { xp: 40 }, rewardLabel: "+40 XP",
    hint: "Page Capturer",
  },
  {
    id: "analyze", label: "Archéologue",
    description: "Capturez une relique avec un événement historique",
    icon: "🔬", difficulty: "easy", target: 1, type: "event",
    reward: { xp: 50 }, rewardLabel: "+50 XP",
    hint: "Page Capturer — certaines minutes ont des événements",
  },

  // ─── MOYEN ─────────────────────────────────────────────────────────────────
  {
    id: "rare1", label: "Qualité avant Quantité",
    description: "Obtenez 1 relique RARE ou supérieure",
    icon: "💎", difficulty: "medium", target: 1, type: "rarity",
    reward: { xp: 150 }, rewardLabel: "+150 XP",
    rarityTarget: "RARE",
    hint: "Page Capturer — la chance aide !",
  },
  {
    id: "epique1", label: "Chasseur d'Épiques",
    description: "Obtenez 1 relique ÉPIQUE ou supérieure",
    icon: "🟣", difficulty: "medium", target: 1, type: "rarity",
    reward: { xp: 300 }, rewardLabel: "+300 XP",
    rarityTarget: "EPIQUE",
    hint: "Page Capturer — niveaux élevés conseillés",
  },
  {
    id: "event2", label: "Témoin de l'Histoire",
    description: "Capturez 2 minutes liées à des événements historiques",
    icon: "📜", difficulty: "medium", target: 2, type: "event",
    reward: { xp: 120 }, rewardLabel: "+120 XP",
    hint: "Certaines minutes cachent des événements historiques",
  },
  {
    id: "cap5", label: "Marathon Temporel",
    description: "Capturez 5 reliques aujourd'hui",
    icon: "🔥", difficulty: "medium", target: 5, type: "captures",
    reward: { xp: 200 }, rewardLabel: "+200 XP",
    hint: "Page Capturer — utilisez toutes vos charges",
  },
  {
    id: "rare3", label: "Collectionneur",
    description: "Obtenez 3 reliques RARE ou supérieures",
    icon: "👑", difficulty: "medium", target: 3, type: "rarity",
    reward: { xp: 250 }, rewardLabel: "+250 XP",
    rarityTarget: "RARE",
    hint: "Page Capturer",
  },

  // ─── DIFFICILE ──────────────────────────────────────────────────────────────
  {
    id: "legen1", label: "Vision du Légendaire",
    description: "Obtenez 1 relique LÉGENDAIRE",
    icon: "🟡", difficulty: "hard", target: 1, type: "rarity",
    reward: { xp: 750 }, rewardLabel: "+750 XP",
    rarityTarget: "LEGENDAIRE",
    hint: "Niveau 30+ requis pour les Légendaires",
  },
  {
    id: "event5", label: "Historien du Temps",
    description: "Capturez 5 minutes avec des événements historiques",
    icon: "🏛️", difficulty: "hard", target: 5, type: "event",
    reward: { xp: 500 }, rewardLabel: "+500 XP",
    hint: "Certaines minutes cachent des événements historiques",
  },
  {
    id: "epique3", label: "Épique Chasseur",
    description: "Obtenez 3 reliques ÉPIQUE ou supérieures",
    icon: "💜", difficulty: "hard", target: 3, type: "rarity",
    reward: { xp: 600 }, rewardLabel: "+600 XP",
    rarityTarget: "EPIQUE",
    hint: "Niveau 20+ requis pour les Épiques",
  },
]

// Générateur pseudo-aléatoire déterministe (LCG)
function seededIndex(seed: number, max: number): number {
  return ((seed * 1664525 + 1013904223) & 0x7fffffff) % max
}

export function getDailyChallenges(
  date: Date
): [ChallengeDefinition, ChallengeDefinition, ChallengeDefinition] {
  const dateStr = date.toISOString().slice(0, 10) // "2026-03-08"
  let seed = 0
  for (let i = 0; i < dateStr.length; i++) {
    seed = ((seed * 31 + dateStr.charCodeAt(i)) & 0x7fffffff)
  }

  const easy   = POOL.filter(c => c.difficulty === "easy")
  const medium = POOL.filter(c => c.difficulty === "medium")
  const hard   = POOL.filter(c => c.difficulty === "hard")

  return [
    easy[seededIndex(seed, easy.length)],
    medium[seededIndex(seed + 1, medium.length)],
    hard[seededIndex(seed + 2, hard.length)],
  ]
}
