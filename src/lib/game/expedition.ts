export type ExpeditionRoomType = "SAFE_CAPTURE" | "RISKY_CAPTURE" | "TREASURE" | "ANOMALY" | "BOSS"
export type ExpeditionStatus = "active" | "completed" | "failed" | "abandoned"

export interface ExpeditionRoom {
  index: number
  type: ExpeditionRoomType
  cleared: boolean
  relicObtained?: { relicId: string; rarity: string; minute: string; xpGained: number }
  anomalyId?: string
}

export interface ActiveExpedition {
  userId: string
  eraId: string
  status: ExpeditionStatus
  currentRoomIndex: number
  rooms: ExpeditionRoom[]
  startedAt: number
  rarityBonus: number
}

export interface ExpeditionEra {
  id: string
  label: string
  description: string
  icon: string
  eraMinYear: number
  eraMaxYear: number
  entryCost: { eclatsTemporels: number; chronite: number }
  rarityBonus: number   // added to legendaire chance %
  requiredLevel: number
}

export const EXPEDITION_ERAS: ExpeditionEra[] = [
  {
    id: "antiquite",
    label: "Antiquité",
    description: "Les dieux et les héros de l'âge d'or.",
    icon: "🏛️",
    eraMinYear: -3000,
    eraMaxYear: 500,
    entryCost: { eclatsTemporels: 20, chronite: 5 },
    rarityBonus: 0,
    requiredLevel: 1,
  },
  {
    id: "moyen_age",
    label: "Moyen Âge",
    description: "Chevaliers, cathédrales et épidémies.",
    icon: "⚔️",
    eraMinYear: 501,
    eraMaxYear: 1400,
    entryCost: { eclatsTemporels: 35, chronite: 8 },
    rarityBonus: 3,
    requiredLevel: 5,
  },
  {
    id: "renaissance",
    label: "Renaissance",
    description: "L'art et la science renaissent.",
    icon: "🎨",
    eraMinYear: 1401,
    eraMaxYear: 1700,
    entryCost: { eclatsTemporels: 55, chronite: 15 },
    rarityBonus: 6,
    requiredLevel: 10,
  },
  {
    id: "ere_moderne",
    label: "Ère Moderne",
    description: "Révolutions et lumières.",
    icon: "⚡",
    eraMinYear: 1701,
    eraMaxYear: 1850,
    entryCost: { eclatsTemporels: 80, chronite: 22 },
    rarityBonus: 9,
    requiredLevel: 15,
  },
  {
    id: "industrielle",
    label: "Révolution Industrielle",
    description: "Machines, progrès et fractures sociales.",
    icon: "🏭",
    eraMinYear: 1851,
    eraMaxYear: 1914,
    entryCost: { eclatsTemporels: 110, chronite: 32 },
    rarityBonus: 12,
    requiredLevel: 20,
  },
  {
    id: "guerres",
    label: "Siècle des Guerres",
    description: "Les deux grands conflits mondiaux.",
    icon: "💀",
    eraMinYear: 1914,
    eraMaxYear: 1950,
    entryCost: { eclatsTemporels: 150, chronite: 45 },
    rarityBonus: 15,
    requiredLevel: 25,
  },
  {
    id: "spatiale",
    label: "Conquête Spatiale",
    description: "L'humanité touche les étoiles.",
    icon: "🚀",
    eraMinYear: 1951,
    eraMaxYear: 2000,
    entryCost: { eclatsTemporels: 200, chronite: 60 },
    rarityBonus: 18,
    requiredLevel: 30,
  },
  {
    id: "numerique",
    label: "Ère Numérique",
    description: "Internet, IA et tournant civilisationnel.",
    icon: "💻",
    eraMinYear: 2001,
    eraMaxYear: 2025,
    entryCost: { eclatsTemporels: 250, chronite: 80 },
    rarityBonus: 22,
    requiredLevel: 40,
  },
]

export function generateRooms(): ExpeditionRoom[] {
  const pool: ExpeditionRoomType[] = ["SAFE_CAPTURE", "SAFE_CAPTURE", "RISKY_CAPTURE", "TREASURE", "ANOMALY"]
  const shuffled = pool.sort(() => Math.random() - 0.5)
  const rooms: ExpeditionRoom[] = shuffled.map((type, i) => ({ index: i, type, cleared: false }))
  rooms.push({ index: 5, type: "BOSS", cleared: false })
  return rooms
}

export function getRoomLabel(type: ExpeditionRoomType): string {
  const labels: Record<ExpeditionRoomType, string> = {
    SAFE_CAPTURE:  "Capture Sûre",
    RISKY_CAPTURE: "Capture Risquée",
    TREASURE:      "Trésor Temporel",
    ANOMALY:       "Anomalie",
    BOSS:          "Gardien de l'Ère",
  }
  return labels[type]
}

export function getRoomIcon(type: ExpeditionRoomType): string {
  const icons: Record<ExpeditionRoomType, string> = {
    SAFE_CAPTURE:  "⏱️",
    RISKY_CAPTURE: "🎲",
    TREASURE:      "💎",
    ANOMALY:       "🌀",
    BOSS:          "👁️",
  }
  return icons[type]
}
