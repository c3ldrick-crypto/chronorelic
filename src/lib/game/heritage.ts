// Heritage bonus system — transmis après la mort du personnage

export interface HeritageBonusDefinition {
  id: string
  label: string
  description: string
  icon: string
  effect: string
  tags: string[]
  minLevel?: number
}

export const HERITAGE_BONUSES: HeritageBonusDefinition[] = [
  // ── General ──────────────────────────────────────────────────────────────────
  {
    id: "souvenir_fort",
    label: "Souvenir Marquant",
    description: "Le souvenir du prédécesseur booste les débuts du nouveau personnage.",
    icon: "🌟",
    effect: "Démarre au niveau 3 avec 200 éclats bonus",
    tags: ["general"],
  },
  {
    id: "echo_temporel",
    label: "Écho Temporel",
    description: "Une relique RARE du passé accompagne le nouveau personnage.",
    icon: "🔮",
    effect: "+1 relique RARE dans l'inventaire au démarrage",
    tags: ["general"],
    minLevel: 5,
  },
  {
    id: "legs_mystique",
    label: "Legs Mystique",
    description: "Une relique LÉGENDAIRE transmise au-delà de la mort.",
    icon: "💎",
    effect: "+1 relique LÉGENDAIRE dans l'inventaire au démarrage",
    tags: ["general"],
    minLevel: 20,
  },
  {
    id: "resilience",
    label: "Résilience",
    description: "Les morts enseignent la prudence. Le flux obéit davantage.",
    icon: "🛡",
    effect: "+10% chance de succès sur toutes les captures (permanent)",
    tags: ["general"],
  },
  {
    id: "connaissance_off",
    label: "Connaissance Transmise",
    description: "Les savoirs ne meurent jamais vraiment.",
    icon: "📚",
    effect: "+50 Connaissance Temporelle de départ",
    tags: ["general", "archiviste"],
  },
  // ── Machine / Chronomancien ───────────────────────────────────────────────────
  {
    id: "machine_head_start",
    label: "Résidu de Machine",
    description: "La Machine Temporelle démarre avec du carburant résiduel.",
    icon: "⚙",
    effect: "Machine démarre avec 25 Chrono-Essences bonus",
    tags: ["chronomancer", "machine"],
  },
  {
    id: "voyage_discount",
    label: "Mémoire du Voyageur",
    description: "Les routes du temps sont déjà connues. Les voyages coûtent moins.",
    icon: "⧗",
    effect: "-20% coût Chrono-Essence sur tous les voyages (permanent)",
    tags: ["chronomancer", "machine"],
    minLevel: 10,
  },
  {
    id: "machine_charge",
    label: "Écho de Machine",
    description: "L'énergie résiduelle des voyages passés persiste.",
    icon: "⚡",
    effect: "Machine Temporelle commence rechargée à 50%",
    tags: ["chronomancer", "machine"],
    minLevel: 15,
  },
  // ── Essence / Archiviste ──────────────────────────────────────────────────────
  {
    id: "essence_stock",
    label: "Réserve d'Essences",
    description: "Un stock initial pour démarrer fort dans la voie des essences.",
    icon: "📜",
    effect: "+30 Chrono-Essences + 20 Connaissance de départ",
    tags: ["archiviste", "essence"],
  },
  {
    id: "distil_bonus",
    label: "Art de la Distillation",
    description: "L'alchimie du temps s'améliore avec chaque vie vécue.",
    icon: "⚗",
    effect: "Essences secondaires ont +15% chance d'apparaître",
    tags: ["archiviste", "essence"],
    minLevel: 12,
  },
  // ── Risk / Chasseur ───────────────────────────────────────────────────────────
  {
    id: "mise_discount",
    label: "Instinct Forgé",
    description: "L'expérience du risque reste gravée dans les gènes.",
    icon: "🎯",
    effect: "Mise Engagement coûte 30% moins cher (permanent)",
    tags: ["chasseur", "general"],
  },
  {
    id: "dernier_souffle",
    label: "Dernier Souffle",
    description: "Une seule deuxième chance par vie — mais elle compte.",
    icon: "💨",
    effect: "1× par vie : transforme une mort en perte de 5 niveaux",
    tags: ["chasseur"],
    minLevel: 8,
  },
  {
    id: "adrenalline_start",
    label: "Adrénaline Résiduelle",
    description: "Le corps garde la mémoire du danger et s'y adapte.",
    icon: "🔥",
    effect: "Les 5 premières captures de chaque session ont +10% succès",
    tags: ["chasseur"],
  },
  // ── Oracle ────────────────────────────────────────────────────────────────────
  {
    id: "prescience_gift",
    label: "Don de Prescience",
    description: "Les visions persistent après la mort de leur porteur.",
    icon: "👁",
    effect: "+1 révélation gratuite par jour (voir résultat avant capture)",
    tags: ["oracle"],
    minLevel: 8,
  },
  {
    id: "flair_ancestral",
    label: "Flair Ancestral",
    description: "Le nez de l'Oracle détecte les minutes à haute valeur.",
    icon: "🌡",
    effect: "Voir les 3 meilleures minutes disponibles chaque jour",
    tags: ["oracle", "general"],
    minLevel: 10,
  },
]

export function generateHeritageOptions(
  deadCharClass: string,
  deadCharLevel: number,
  existingBonusIds: string[]
): HeritageBonusDefinition[] {
  const classTag = deadCharClass.toLowerCase()

  const eligible = HERITAGE_BONUSES.filter(b => {
    if (existingBonusIds.includes(b.id)) return false
    if (b.minLevel && deadCharLevel < b.minLevel) return false
    return true
  })

  const classSpecific = eligible.filter(b => b.tags.includes(classTag) && !b.tags.includes("general"))
  const general       = eligible.filter(b => b.tags.includes("general"))
  const other         = eligible.filter(b => !b.tags.includes(classTag) && !b.tags.includes("general"))

  const pick = (arr: HeritageBonusDefinition[]): HeritageBonusDefinition =>
    arr[Math.floor(Math.random() * arr.length)]

  const result: HeritageBonusDefinition[] = []

  if (classSpecific.length > 0) result.push(pick(classSpecific))

  const g2 = general.filter(b => !result.find(r => r.id === b.id))
  if (g2.length > 0) result.push(pick(g2))

  const pool3 = [...classSpecific, ...general, ...other].filter(b => !result.find(r => r.id === b.id))
  if (result.length < 3 && pool3.length > 0) result.push(pick(pool3))

  // Fallback fill
  while (result.length < 3) {
    const fallback = HERITAGE_BONUSES.find(b => !result.find(r => r.id === b.id))
    if (fallback) result.push(fallback)
    else break
  }

  return result.slice(0, 3)
}
