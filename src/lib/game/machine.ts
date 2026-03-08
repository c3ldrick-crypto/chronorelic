// Machine Temporelle — ères accessibles et logique de voyage

import type { EssenceType } from "./essences"

export interface MachineEra {
  id: string
  label: string
  description: string
  icon: string
  minMachineLevel: number
  cost: Partial<Record<EssenceType, number>> & { eclatsTemporels?: number }
  instabilityPct: number
  minRarity: "RARE" | "EPIQUE" | "LEGENDAIRE"
  rechargeMinutes: number
  dateRange: string
}

export const MACHINE_ERAS: MachineEra[] = [
  {
    id: "hier",
    label: "Hier",
    description: "La journée d'hier. Le temps est encore frais, la traversée facile.",
    icon: "🌙",
    minMachineLevel: 1,
    cost: { chronoEssence: 20 },
    instabilityPct: 0,
    minRarity: "RARE",
    rechargeMinutes: 30,
    dateRange: "Hier",
  },
  {
    id: "semaine",
    label: "Semaine Passée",
    description: "La semaine écoulée. Les événements récents sont encore palpables.",
    icon: "📅",
    minMachineLevel: 1,
    cost: { chronoEssence: 50, energieResiduelle: 10 },
    instabilityPct: 5,
    minRarity: "RARE",
    rechargeMinutes: 60,
    dateRange: "7 derniers jours",
  },
  {
    id: "mois",
    label: "Mois Passé",
    description: "Le mois précédent. Le flux temporel montre des interférences mineures.",
    icon: "🗓",
    minMachineLevel: 2,
    cost: { chronoEssence: 150, cristalParadoxal: 1 },
    instabilityPct: 12,
    minRarity: "RARE",
    rechargeMinutes: 120,
    dateRange: "30 derniers jours",
  },
  {
    id: "annees",
    label: "Années Passées",
    description: "Plusieurs années en arrière. Le passé résiste à votre présence.",
    icon: "📆",
    minMachineLevel: 3,
    cost: { chronoEssence: 400, cristalParadoxal: 2 },
    instabilityPct: 20,
    minRarity: "EPIQUE",
    rechargeMinutes: 240,
    dateRange: "1–10 ans",
  },
  {
    id: "decennies",
    label: "Décennies",
    description: "Des décennies dans le passé. L'instabilité est sérieuse.",
    icon: "🏛",
    minMachineLevel: 3,
    cost: { quintessence: 2, chronoEssence: 100 },
    instabilityPct: 32,
    minRarity: "EPIQUE",
    rechargeMinutes: 360,
    dateRange: "10–100 ans",
  },
  {
    id: "siecles",
    label: "Siècles",
    description: "Des siècles effacés. Seule une Machine puissante peut franchir cette barrière.",
    icon: "⚔",
    minMachineLevel: 4,
    cost: { quintessence: 5, residuAncestral: 3 },
    instabilityPct: 42,
    minRarity: "LEGENDAIRE",
    rechargeMinutes: 720,
    dateRange: "100–1000 ans",
  },
  {
    id: "millenaires",
    label: "Millénaires",
    description: "L'ère des anciens. La Machine doit être parfaite pour atteindre ces profondeurs.",
    icon: "🌌",
    minMachineLevel: 5,
    cost: { quintessenceAbsolue: 1, residuAncestral: 10 },
    instabilityPct: 55,
    minRarity: "LEGENDAIRE",
    rechargeMinutes: 1440,
    dateRange: "1000+ ans",
  },
]

export const MACHINE_LEVEL_LABELS = [
  "Non construite",
  "Prototype",
  "Opérationnelle",
  "Avancée",
  "Puissante",
  "Transcendante",
]

export function getAccessibleEras(machineLevel: number): MachineEra[] {
  return MACHINE_ERAS.filter(e => e.minMachineLevel <= machineLevel)
}

/** Generate a random HH:mm target minute (00:00–23:59) */
export function generateTargetMinute(): string {
  const h = Math.floor(Math.random() * 24)
  const m = Math.floor(Math.random() * 60)
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
}
