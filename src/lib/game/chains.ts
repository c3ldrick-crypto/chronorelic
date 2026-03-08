import type { Resources } from "@/types"

export interface ChainDefinition {
  id: string
  label: string
  description: string
  icon: string
  loreText: string
  requirement: {
    type: "category" | "era_range"
    categories?: string[]
    eraMinYear?: number
    eraMaxYear?: number
    count: number
  }
  reward: Resources & { xp: number }
}

export const CHAIN_DEFINITIONS: ChainDefinition[] = [
  {
    id: "chain_sciences",
    label: "L'Éveil Scientifique",
    description: "Capturez des reliques liées aux grandes découvertes scientifiques.",
    icon: "🔬",
    loreText: "Chaque avancée de la science humaine a laissé une empreinte temporelle ineffaçable.",
    requirement: { type: "category", categories: ["Science"], count: 5 },
    reward: { eclatsTemporels: 80, chronite: 20, essencesHistoriques: 15, fragmentsAnomalie: 5, xp: 200 },
  },
  {
    id: "chain_politique",
    label: "Le Grand Échiquier",
    description: "Capturez des reliques des grands moments politiques de l'Histoire.",
    icon: "⚖️",
    loreText: "Les décisions des puissants ont façonné le cours du temps pour toujours.",
    requirement: { type: "category", categories: ["Politique"], count: 8 },
    reward: { eclatsTemporels: 120, chronite: 30, essencesHistoriques: 25, fragmentsAnomalie: 8, xp: 300 },
  },
  {
    id: "chain_culture",
    label: "Mémoire du Peuple",
    description: "Capturez des reliques des instants culturels marquants.",
    icon: "🎭",
    loreText: "La culture est l'âme d'une civilisation, gravée à jamais dans le flux temporel.",
    requirement: { type: "category", categories: ["Culture"], count: 5 },
    reward: { eclatsTemporels: 70, chronite: 15, essencesHistoriques: 30, fragmentsAnomalie: 5, xp: 180 },
  },
  {
    id: "chain_tragedies",
    label: "Les Larmes du Temps",
    description: "Capturez des reliques des grandes tragédies de l'humanité.",
    icon: "💀",
    loreText: "Dans chaque catastrophe se cache une leçon que le temps tente de préserver.",
    requirement: { type: "category", categories: ["Tragédie"], count: 4 },
    reward: { eclatsTemporels: 100, chronite: 40, essencesHistoriques: 20, fragmentsAnomalie: 15, xp: 250 },
  },
  {
    id: "chain_exploration",
    label: "Les Pionniers de l'Infini",
    description: "Capturez des reliques des grandes explorations humaines.",
    icon: "🧭",
    loreText: "Chaque pas vers l'inconnu a ouvert une nouvelle brèche dans le tissu du temps.",
    requirement: { type: "category", categories: ["Exploration"], count: 5 },
    reward: { eclatsTemporels: 90, chronite: 25, essencesHistoriques: 20, fragmentsAnomalie: 8, xp: 220 },
  },
  {
    id: "chain_technologie",
    label: "L'Âge des Machines",
    description: "Capturez des reliques des grandes innovations technologiques.",
    icon: "⚙️",
    loreText: "L'ingéniosité humaine a transformé le monde à une vitesse que le temps peine à suivre.",
    requirement: { type: "category", categories: ["Technologie"], count: 6 },
    reward: { eclatsTemporels: 110, chronite: 50, essencesHistoriques: 15, fragmentsAnomalie: 10, xp: 280 },
  },
  {
    id: "chain_art",
    label: "Le Souffle du Créateur",
    description: "Capturez des reliques des œuvres d'art qui ont défié leur époque.",
    icon: "🎨",
    loreText: "L'art transcende le temps, et ceux qui le créent laissent une trace éternelle.",
    requirement: { type: "category", categories: ["Art"], count: 3 },
    reward: { eclatsTemporels: 60, chronite: 10, essencesHistoriques: 40, fragmentsAnomalie: 5, xp: 150 },
  },
  {
    id: "chain_sport",
    label: "Les Héros du Stade",
    description: "Capturez des reliques des instants sportifs légendaires.",
    icon: "🏆",
    loreText: "Les records brisés et les victoires épiques résonnent à travers les époques.",
    requirement: { type: "category", categories: ["Sport"], count: 2 },
    reward: { eclatsTemporels: 50, chronite: 15, essencesHistoriques: 10, fragmentsAnomalie: 5, xp: 120 },
  },
  {
    id: "chain_antiquite",
    label: "Voix de l'Antiquité",
    description: "Capturez des reliques appartenant à l'Antiquité (avant 500 après J.-C.).",
    icon: "🏛️",
    loreText: "Les civilisations les plus anciennes murmurent encore dans le flux temporel.",
    requirement: { type: "era_range", eraMinYear: -3000, eraMaxYear: 500, count: 3 },
    reward: { eclatsTemporels: 80, chronite: 20, essencesHistoriques: 35, fragmentsAnomalie: 8, xp: 200 },
  },
  {
    id: "chain_moderne",
    label: "L'Ère de la Raison",
    description: "Capturez des reliques de l'Époque Moderne (1701-1850).",
    icon: "💡",
    loreText: "Les Lumières ont changé la façon dont l'humanité perçoit l'espace et le temps.",
    requirement: { type: "era_range", eraMinYear: 1701, eraMaxYear: 1850, count: 4 },
    reward: { eclatsTemporels: 90, chronite: 25, essencesHistoriques: 25, fragmentsAnomalie: 6, xp: 230 },
  },
  {
    id: "chain_xxeme",
    label: "Le Siècle des Extrêmes",
    description: "Capturez des reliques du XXème siècle (1900-1999).",
    icon: "🌍",
    loreText: "Le XXème siècle a vu l'humanité atteindre ses sommets et ses abysses les plus profonds.",
    requirement: { type: "era_range", eraMinYear: 1900, eraMaxYear: 1999, count: 10 },
    reward: { eclatsTemporels: 200, chronite: 60, essencesHistoriques: 40, fragmentsAnomalie: 20, xp: 500 },
  },
  {
    id: "chain_multicat",
    label: "L'Encyclopédiste",
    description: "Capturez des reliques de Science ET de Politique.",
    icon: "📚",
    loreText: "Le savoir et le pouvoir sont les deux faces d'une même pièce temporelle.",
    requirement: { type: "category", categories: ["Science", "Politique"], count: 6 },
    reward: { eclatsTemporels: 150, chronite: 45, essencesHistoriques: 35, fragmentsAnomalie: 12, xp: 380 },
  },
]

export interface ChainProgress {
  chainId: string
  captured: number
  required: number
  completed: boolean
  claimed: boolean
}

export function computeChainProgress(
  userRelics: Array<{
    minute: string
    historicalEvent: { category: string | null; year: number | null } | null
  }>,
  claimedIds: Set<string>
): ChainProgress[] {
  return CHAIN_DEFINITIONS.map(chain => {
    let count = 0
    for (const relic of userRelics) {
      if (!relic.historicalEvent) continue
      const { category, year } = relic.historicalEvent
      if (chain.requirement.type === "category") {
        if (category && chain.requirement.categories?.includes(category)) count++
      } else if (chain.requirement.type === "era_range") {
        if (
          year !== null &&
          year >= (chain.requirement.eraMinYear ?? -9999) &&
          year <= (chain.requirement.eraMaxYear ?? 9999)
        ) {
          count++
        }
      }
    }
    return {
      chainId: chain.id,
      captured: Math.min(count, chain.requirement.count),
      required: chain.requirement.count,
      completed: count >= chain.requirement.count,
      claimed: claimedIds.has(chain.id),
    }
  })
}
