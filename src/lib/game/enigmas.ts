// ─────────────────────────────────────────────────────────────────────────────
// ChronoRelic — Jeux de Piste / Énigmes Temporelles
//
// ATTENTION : targetMinute ne doit JAMAIS être exposé au client.
// L'API /api/game/enigmas l'omit avant envoi.
// ─────────────────────────────────────────────────────────────────────────────

export type EnigmaDifficulty = "FACILE" | "MOYEN" | "DIFFICILE" | "LEGENDAIRE"

export interface EnigmaDefinition {
  id:           string
  targetMinute: string          // !! SERVER ONLY — never sent to client !!
  title:        string
  lore:         string          // texte d'ambiance, pas d'indice
  clues:        [string, string, string]  // du plus cryptique au plus explicite
  difficulty:   EnigmaDifficulty
  category:     string          // "histoire" | "science" | "exploration" | "catastrophe" | "culture"
  reward: {
    xp:        number
    eclats:    number
    chronite?: number
    essences?: number
    label:     string
  }
}

export interface PublicEnigma extends Omit<EnigmaDefinition, "targetMinute"> {
  isSolved:     boolean
  solvedMinute?: string         // révélé uniquement après résolution
}

// ─────────────────────────────────────────────────────────────────────────────
// Définitions des énigmes
// ─────────────────────────────────────────────────────────────────────────────

export const ENIGMAS: EnigmaDefinition[] = [

  // ── FACILES ──────────────────────────────────────────────────────────────

  {
    id:           "armistice",
    targetMinute: "11:11",
    title:        "Le Silence des Tranchées",
    lore:         "Après quatre années de carnage, une minute changea le cours de l'Histoire. Les armes se turent. Les hommes pleurèrent.",
    clues: [
      "La Grande Guerre s'éteignit à l'heure où le monde retenait son souffle — une heure écrite trois fois de suite.",
      "Onze novembre, onzième heure. Les tranchées de l'Argonne se taisent enfin.",
      "L'Armistice de 1918 prit effet à la onzième heure du onzième jour du onzième mois. L'heure miroir.",
    ],
    difficulty: "FACILE",
    category:   "histoire",
    reward: { xp: 120, eclats: 25, label: "+120 XP · +25 Éclats" },
  },

  {
    id:           "minuit_zero",
    targetMinute: "00:00",
    title:        "L'Aube de Tout",
    lore:         "Certaines minutes ne marquent pas la fin, mais le commencement absolu. La première seconde de toutes les histoires.",
    clues: [
      "L'heure où rien ne précède et tout commence. Le point de départ de chaque cadran.",
      "Minuit moins une seconde, puis le néant — et soudain, tout recommence.",
      "00:00 — la minute zéro, l'origine absolue de chaque nouveau jour.",
    ],
    difficulty: "FACILE",
    category:   "culture",
    reward: { xp: 80, eclats: 15, label: "+80 XP · +15 Éclats" },
  },

  {
    id:           "derniere_minute",
    targetMinute: "23:59",
    title:        "Le Souffle Final",
    lore:         "Il existe une minute au bord du précipice du temps, là où chaque journée murmure ses dernières confessions avant de s'effacer.",
    clues: [
      "L'ultime battement du cœur d'un jour. Après elle, tout recommence ou tout s'arrête.",
      "Soixante secondes avant la métamorphose en passé irrévocable.",
      "La toute dernière minute d'un jour — avant que minuit frappe et efface tout.",
    ],
    difficulty: "FACILE",
    category:   "culture",
    reward: { xp: 80, eclats: 15, label: "+80 XP · +15 Éclats" },
  },

  // ── MOYENS ───────────────────────────────────────────────────────────────

  {
    id:           "apollo_lune",
    targetMinute: "20:17",
    title:        "Le Grand Bond",
    lore:         "Un homme en combinaison blanche posa le pied là où aucun être vivant n'avait jamais mis les pieds. L'humanité ne fut plus jamais pareille.",
    clues: [
      "Un géant bondit, et l'espèce humaine décolla avec lui, portée par quelques millions de kilos de carburant et une foi infinie.",
      "Apollo portait le nombre onze. La minute de l'alunissage porte un nombre très proche.",
      "Le module lunaire Eagle se posa à 20h17 UTC, le 20 juillet 1969. Neil Armstrong était arrivé.",
    ],
    difficulty: "MOYEN",
    category:   "exploration",
    reward: { xp: 280, eclats: 55, chronite: 12, label: "+280 XP · +55 Éclats · +12 Chronite" },
  },

  {
    id:           "titanic",
    targetMinute: "02:20",
    title:        "Le Dernier Soupir",
    lore:         "Le plus grand paquebot que l'humanité eût jamais construit rencontra une montagne de glace dans l'obscurité de l'Atlantique. La suite appartient à l'abîme.",
    clues: [
      "Un palais flottant, une nuit glacée d'avril, 1 500 âmes englouties. La poupe disparut en dernier.",
      "RMS. Quatre lettres. 1912. Deux heures et quarante minutes de naufrage. La fin tomba à l'aube.",
      "Le Titanic sombra définitivement à 02h20 le 15 avril 1912. La proue toucha le fond à 3 700 mètres.",
    ],
    difficulty: "MOYEN",
    category:   "catastrophe",
    reward: { xp: 280, eclats: 55, chronite: 12, label: "+280 XP · +55 Éclats · +12 Chronite" },
  },

  {
    id:           "hackers",
    targetMinute: "13:37",
    title:        "L'Heure des Élites",
    lore:         "Dans les profondeurs du réseau, certains initiés écrivent différemment. Lettres et chiffres s'échangent, et une heure en particulier porte leur marque.",
    clues: [
      "1 peut être un I. 3 peut être un E. 7 peut être un T. Assemblez les lettres que ces chiffres cachent.",
      "En 'leet speak', les hackers remplacent les lettres par des chiffres qui leur ressemblent. 1337 = ?",
      "1337 = LEET = ELITE en alphabet hacker. L'heure des élites du numérique est donc 13:37.",
    ],
    difficulty: "MOYEN",
    category:   "culture",
    reward: { xp: 280, eclats: 55, chronite: 12, label: "+280 XP · +55 Éclats · +12 Chronite" },
  },

  {
    id:           "heure_loup",
    targetMinute: "03:00",
    title:        "L'Heure du Loup",
    lore:         "Les médecins, les psychologues et les anciens la connaissent. Une heure entre chien et loup, entre deux nuits, où l'âme est la plus vulnérable.",
    clues: [
      "Ni veille ni sommeil. L'heure où les défenses tombent et où les démons viennent frapper.",
      "Dans le folklore scandinave, c'est le 'Vargtimmen' — l'heure du loup, avant l'aube.",
      "3 heures du matin — trois coups à la porte du subconscient. L'heure du loup.",
    ],
    difficulty: "MOYEN",
    category:   "culture",
    reward: { xp: 280, eclats: 55, chronite: 12, label: "+280 XP · +55 Éclats · +12 Chronite" },
  },

  {
    id:           "wright",
    targetMinute: "10:35",
    title:        "L'Envol de Kitty Hawk",
    lore:         "Deux frères mécaniciens du Ohio rêvaient de ce que personne n'avait encore accompli. Un matin d'hiver froid et venteux, l'impossible devint banal.",
    clues: [
      "Le vent de Caroline du Nord portait ce matin-là quelque chose d'historique : le premier vol motorisé et contrôlé de l'histoire.",
      "Orville et Wilbur. Un biplan en toile et en bois. Décembre 1903. Douze secondes qui changèrent tout.",
      "Le Flyer I décolla pour la première fois à 10h35 le 17 décembre 1903 à Kitty Hawk — vol de 12 secondes, 36 mètres.",
    ],
    difficulty: "MOYEN",
    category:   "exploration",
    reward: { xp: 280, eclats: 55, chronite: 12, label: "+280 XP · +55 Éclats · +12 Chronite" },
  },

  // ── DIFFICILES ────────────────────────────────────────────────────────────

  {
    id:           "gagarine",
    targetMinute: "09:07",
    title:        "Poyekhali !",
    lore:         "Un seul mot russe, plein de joie et de défi. Un sourire radieux, une combinaison orange, et l'humanité franchit pour la première fois la frontière du cosmos.",
    clues: [
      "Il dit 'Allons-y !' et le monde entier retint son souffle pendant 108 minutes.",
      "Vostok 1. Baïkonour. Kazakhstan. 12 avril 1961. Un fils d'ébéniste soviétique devint le premier habitant de l'espace.",
      "Youri Gagarine quitta la Terre à 9h07 heure de Moscou (06h07 UTC) — le premier être humain dans l'espace.",
    ],
    difficulty: "DIFFICILE",
    category:   "exploration",
    reward: { xp: 550, eclats: 110, chronite: 28, label: "+550 XP · +110 Éclats · +28 Chronite" },
  },

  {
    id:           "hiroshima",
    targetMinute: "08:15",
    title:        "L'Éclair d'Hiroshima",
    lore:         "Ce matin-là, le soleil se leva deux fois sur la ville. La seconde lumière, plus aveuglante que la première, réécrivit les règles de la guerre — et de la paix.",
    clues: [
      "Un B-29 baptisé du nom de la mère du pilote traversa le ciel, portant dans ses soutes l'équivalent de vingt mille tonnes de TNT.",
      "Enola Gay. Hiroshima. Little Boy. Août 1945. Une ville entière disparut en une seconde par un matin d'été clair.",
      "La bombe atomique 'Little Boy' explosa à 8h15 heure locale, à 600 mètres d'altitude au-dessus d'Hiroshima, le 6 août 1945.",
    ],
    difficulty: "DIFFICILE",
    category:   "catastrophe",
    reward: { xp: 550, eclats: 110, chronite: 28, label: "+550 XP · +110 Éclats · +28 Chronite" },
  },

  {
    id:           "sputnik",
    targetMinute: "19:28",
    title:        "Le Bip des Étoiles",
    lore:         "Un bip. Régulier. Froid. Mécanique. Et pourtant, ce son traversant le ciel nocturne était le son le plus révolutionnaire de la Guerre Froide.",
    clues: [
      "Une sphère de métal polie, 83 kilogrammes, émettant un signal radio simple. Et l'Ouest comprit qu'il avait perdu une bataille.",
      "URSS. Octobre 1957. Le premier satellite artificiel de l'histoire emporta dans l'orbite les rêves d'une superpuissance.",
      "Sputnik 1 fut lancé à 19h28 UTC le 4 octobre 1957 depuis Baïkonour. Il orbita 1 440 fois avant de se désintégrer.",
    ],
    difficulty: "DIFFICILE",
    category:   "exploration",
    reward: { xp: 550, eclats: 110, chronite: 28, label: "+550 XP · +110 Éclats · +28 Chronite" },
  },

  {
    id:           "mur_berlin",
    targetMinute: "18:57",
    title:        "La Conférence qui Renversa un Mur",
    lore:         "Un homme fatigué, lisant une note mal préparée, prononça des mots qu'il ne comprenait peut-être pas lui-même. Et une ville se mit à courir vers le béton.",
    clues: [
      "Günter, porte-parole du SED, annonça en direct que les frontières seraient ouvertes — sans date ni délai.",
      "Berlin. 9 novembre 1989. Une conférence de presse télévisée déclencha l'effondrement d'un empire de quarante ans.",
      "À 18h57 heure locale, Schabowski annonça la libre circulation. Des milliers d'Allemands de l'Est convergèrent vers les points de passage.",
    ],
    difficulty: "DIFFICILE",
    category:   "histoire",
    reward: { xp: 550, eclats: 110, chronite: 28, label: "+550 XP · +110 Éclats · +28 Chronite" },
  },

  {
    id:           "premier_pas",
    targetMinute: "02:56",
    title:        "Un Pas, un Bond",
    lore:         "L'alunissage avait eu lieu. Mais personne n'avait encore touché le sol. Il restait une échelle à descendre, et six heures d'attente interminable avant le moment absolu.",
    clues: [
      "Neil avait posé le module. Mais poser le pied était autre chose. Six heures et demie après l'alunissage, il descendit l'échelle.",
      "Apollo 11. Juillet 1969. La Lune attendait en silence depuis 4,5 milliards d'années.",
      "Neil Armstrong fit son premier pas sur la Lune à 02h56 UTC le 21 juillet 1969 — distinct de l'alunissage (20h17 UTC le 20 juillet).",
    ],
    difficulty: "DIFFICILE",
    category:   "exploration",
    reward: { xp: 550, eclats: 110, chronite: 28, label: "+550 XP · +110 Éclats · +28 Chronite" },
  },

  {
    id:           "challenger",
    targetMinute: "11:39",
    title:        "Les Sept Étoiles",
    lore:         "Sept hommes et femmes regardaient le ciel s'ouvrir sous eux. La Terre les regarda s'envoler, puis s'enflammer. Soixante-treize secondes. Une éternité.",
    clues: [
      "Space Shuttle. Floride. Janvier 1986. Un joint torique. Soixante-treize secondes après le décollage.",
      "Challenger. STS-51-L. Christa McAuliffe, la première enseignante dans l'espace, était à bord.",
      "La navette Challenger explosa à T+73 secondes après son décollage à 11h38 le 28 janvier 1986 — soit à 11h39.",
    ],
    difficulty: "DIFFICILE",
    category:   "catastrophe",
    reward: { xp: 550, eclats: 110, chronite: 28, label: "+550 XP · +110 Éclats · +28 Chronite" },
  },

  // ── LÉGENDAIRES ───────────────────────────────────────────────────────────

  {
    id:           "trinity",
    targetMinute: "05:29",
    title:        "Le Soleil Artificiel",
    lore:         "Dans le désert de Jornada del Muerto — le 'Chemin de l'Homme Mort' — une équipe de physiciens regardèrent l'horizon s'embraser. Oppenheimer murmura une phrase de la Bhagavad-Gita.",
    clues: [
      "Il dit : 'Je suis devenu la Mort, le destructeur des mondes.' Le désert du Nouveau-Mexique fut illuminé comme mille soleils.",
      "Projet Manhattan. Trinity Site. 16 juillet 1945. Le premier test atomique de l'histoire. L'humanité franchit un seuil sans retour.",
      "À 05h29 heure locale MDT, la bombe Gadget explosa à 30 mètres de hauteur dans le désert de Socorro. Le Projet Manhattan culminait.",
    ],
    difficulty: "LEGENDAIRE",
    category:   "science",
    reward: { xp: 1200, eclats: 250, chronite: 60, essences: 8, label: "+1200 XP · +250 Éclats · +60 Chronite · +8 Essences" },
  },

  {
    id:           "chernobyl",
    targetMinute: "01:23",
    title:        "La Nuit de Pripyat",
    lore:         "Un test de sécurité routinier. Des techniciens fatigués. Des procédures court-circuitées. Et soudain, le réacteur n°4 décida de s'exprimer.",
    clues: [
      "Le réacteur promit la paix de l'atome, puis cracha le feu de l'enfer dans la nuit ukrainienne. Pripyat dormait encore.",
      "Ukraine soviétique. 26 avril 1986. RBMK-1000. Le plus grave accident nucléaire de l'histoire humaine.",
      "Le réacteur n°4 de la centrale Lénine de Tchernobyl explosa à 01h23 heure locale dans la nuit du 25 au 26 avril 1986.",
    ],
    difficulty: "LEGENDAIRE",
    category:   "catastrophe",
    reward: { xp: 1200, eclats: 250, chronite: 60, essences: 8, label: "+1200 XP · +250 Éclats · +60 Chronite · +8 Essences" },
  },

]

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Retire targetMinute avant envoi client. */
export function toPublicEnigma(enigma: EnigmaDefinition, solvedIds: Set<string>): PublicEnigma {
  const { targetMinute, ...rest } = enigma
  const isSolved = solvedIds.has(enigma.id)
  return {
    ...rest,
    isSolved,
    solvedMinute: isSolved ? targetMinute : undefined,
  }
}

const DIFF_ORDER: Record<EnigmaDifficulty, number> = { FACILE: 0, MOYEN: 1, DIFFICILE: 2, LEGENDAIRE: 3 }

export function sortedEnigmas(enigmas: PublicEnigma[]): PublicEnigma[] {
  return [...enigmas].sort((a, b) => {
    if (a.isSolved !== b.isSolved) return a.isSolved ? 1 : -1
    return DIFF_ORDER[a.difficulty] - DIFF_ORDER[b.difficulty]
  })
}
