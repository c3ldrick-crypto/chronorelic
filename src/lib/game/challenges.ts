// ─────────────────────────────────────────────
// Défis Quotidiens — ChronoRelic
// 3 défis par jour (facile / moyen / difficile), sélection déterministe par date
// ─────────────────────────────────────────────

export interface ChallengeReward {
  eclatsTemporels?:     number
  chronite?:            number
  essencesHistoriques?: number
  fragmentsAnomalie?:   number
  talentPoints?:        number
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
    reward: { eclatsTemporels: 200 }, rewardLabel: "200 ✨ Éclats",
    hint: "Page Capturer",
  },
  {
    id: "cap3", label: "Assidu du Temps",
    description: "Capturez 3 reliques aujourd'hui",
    icon: "📦", difficulty: "easy", target: 3, type: "captures",
    reward: { eclatsTemporels: 300, chronite: 20 }, rewardLabel: "300 ✨ + 20 🔩",
    hint: "Page Capturer",
  },
  {
    id: "morning", label: "Gardien Matinal",
    description: "Capturez une relique avant 10h00",
    icon: "🌅", difficulty: "easy", target: 1, type: "morning",
    reward: { chronite: 80 }, rewardLabel: "80 🔩 Chronite",
    hint: "Page Capturer — avant 10h",
  },
  {
    id: "harvest", label: "Récolte du Sanctuaire",
    description: "Récoltez les ressources de votre Sanctuaire",
    icon: "🏛️", difficulty: "easy", target: 1, type: "harvest",
    reward: { eclatsTemporels: 150, chronite: 40 }, rewardLabel: "150 ✨ + 40 🔩",
    hint: "Page Sanctuaire → Récolter",
  },
  {
    id: "analyze", label: "Archéologue",
    description: "Analysez une relique dans l'Inventaire",
    icon: "🔬", difficulty: "easy", target: 1, type: "analyze",
    reward: { essencesHistoriques: 10 }, rewardLabel: "10 📜 Essences",
    hint: "Page Inventaire → Analyser",
  },

  // ─── MOYEN ─────────────────────────────────────────────────────────────────
  {
    id: "rare1", label: "Qualité avant Quantité",
    description: "Obtenez 1 relique RARE ou supérieure",
    icon: "💎", difficulty: "medium", target: 1, type: "rarity",
    reward: { talentPoints: 1 }, rewardLabel: "1 point de talent",
    rarityTarget: "RARE",
    hint: "Page Capturer — la chance aide !",
  },
  {
    id: "epique1", label: "Chasseur d'Épiques",
    description: "Obtenez 1 relique ÉPIQUE ou supérieure",
    icon: "🟣", difficulty: "medium", target: 1, type: "rarity",
    reward: { talentPoints: 1, eclatsTemporels: 200 }, rewardLabel: "1 talent + 200 ✨",
    rarityTarget: "EPIQUE",
    hint: "Page Capturer — modes risqués conseillés",
  },
  {
    id: "event2", label: "Témoin de l'Histoire",
    description: "Capturez 2 minutes liées à des événements historiques",
    icon: "📜", difficulty: "medium", target: 2, type: "event",
    reward: { essencesHistoriques: 12 }, rewardLabel: "12 📜 Essences",
    hint: "Regardez les Fenêtres Temporelles sur Capturer",
  },
  {
    id: "risky1", label: "Prise de Risque",
    description: "Réalisez 1 capture en Mode Risqué (niveau 10+)",
    icon: "⚔️", difficulty: "medium", target: 1, type: "risky",
    reward: { eclatsTemporels: 450 }, rewardLabel: "450 ✨ Éclats",
    hint: "Page Capturer → activer Mode Risqué",
  },
  {
    id: "cap5", label: "Marathon Temporel",
    description: "Capturez 5 reliques aujourd'hui",
    icon: "🔥", difficulty: "medium", target: 5, type: "captures",
    reward: { eclatsTemporels: 300, essencesHistoriques: 5 }, rewardLabel: "300 ✨ + 5 📜",
    hint: "Page Capturer — utilisez toutes vos charges",
  },
  {
    id: "rare3", label: "Collectionneur",
    description: "Obtenez 3 reliques RARE ou supérieures",
    icon: "👑", difficulty: "medium", target: 3, type: "rarity",
    reward: { talentPoints: 1, eclatsTemporels: 350 }, rewardLabel: "1 talent + 350 ✨",
    rarityTarget: "RARE",
    hint: "Page Capturer — mode sécurisé conseillé",
  },

  // ─── DIFFICILE ──────────────────────────────────────────────────────────────
  {
    id: "ability", label: "Maître de Classe",
    description: "Utilisez votre capacité de classe",
    icon: "⚡", difficulty: "hard", target: 1, type: "ability",
    reward: { talentPoints: 1, eclatsTemporels: 400 }, rewardLabel: "1 talent + 400 ✨",
    hint: "Page Capturer → bouton capacité de classe",
  },
  {
    id: "legen1", label: "Vision du Légendaire",
    description: "Obtenez 1 relique LÉGENDAIRE",
    icon: "🟡", difficulty: "hard", target: 1, type: "rarity",
    reward: { talentPoints: 3, essencesHistoriques: 20 }, rewardLabel: "3 talents + 20 📜",
    rarityTarget: "LEGENDAIRE",
    hint: "Observatoire du Sanctuaire + Mode Risqué",
  },
  {
    id: "risky2", label: "Téméraire",
    description: "Réussissez 2 captures en Mode Risqué",
    icon: "🎲", difficulty: "hard", target: 2, type: "risky",
    reward: { eclatsTemporels: 700, chronite: 100 }, rewardLabel: "700 ✨ + 100 🔩",
    hint: "Page Capturer → Mode Risqué × 2",
  },
  {
    id: "event5", label: "Historien du Temps",
    description: "Capturez 5 minutes avec des événements historiques",
    icon: "🏛️", difficulty: "hard", target: 5, type: "event",
    reward: { essencesHistoriques: 25, fragmentsAnomalie: 2 }, rewardLabel: "25 📜 + 2 🔮",
    hint: "Utilisez Vision Prophétique (Oracle) ou les Fenêtres",
  },
  {
    id: "epique3", label: "Épique Chasseur",
    description: "Obtenez 3 reliques ÉPIQUE ou supérieures",
    icon: "💜", difficulty: "hard", target: 3, type: "rarity",
    reward: { talentPoints: 2, eclatsTemporels: 500 }, rewardLabel: "2 talents + 500 ✨",
    rarityTarget: "EPIQUE",
    hint: "Instinct de Chasse (Chasseur) × 3 ou Mode Risqué",
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
