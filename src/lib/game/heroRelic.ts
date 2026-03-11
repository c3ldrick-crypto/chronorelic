// ═══════════════════════════════════════════════════════════════
// RELIQUE HERO — Système de récits historiques branchés
// Inspiré des "livres dont vous êtes le héros"
// ═══════════════════════════════════════════════════════════════

export type HeroSegmentType =
  | "narrative"
  | "death"
  | "end_historical"
  | "end_alternate"

export interface HeroChoice {
  id: string
  label: string         // Texte court du bouton
  text: string          // Description du choix
  isHistorical: boolean // Ce choix = ce qui s'est vraiment passé
  nextId: string        // ID du prochain segment
}

export interface HeroSegment {
  id: string
  type: HeroSegmentType
  title: string
  text: string
  note?: string         // Fait historique / note de mort / épilogue
  choices?: HeroChoice[]
}

export interface HeroStory {
  id: string
  title: string
  era: string           // Lieu et empire/période
  year: string          // Date affichée
  icon: string          // Emoji
  theme: string         // Sous-titre thématique
  difficulty: "STANDARD" | "COMPLEXE"
  synopsis: string      // Accroche initiale
  startId: string
  segments: Record<string, HeroSegment>
}

// ═══════════════════════════════════════════════════════════════
// LES 5 HISTOIRES — PHASE 1
// ═══════════════════════════════════════════════════════════════

export const HERO_STORIES: HeroStory[] = [

  // ────────────────────────────────────────────────────────────
  // STORY 01 — L'Erreur du Chauffeur  [STANDARD]
  // ────────────────────────────────────────────────────────────
  {
    id: "hero_01",
    title: "L'Erreur du Chauffeur",
    era: "Sarajevo, Empire austro-hongrois",
    year: "28 juin 1914",
    icon: "🔫",
    theme: "L'attentat qui changea le monde",
    difficulty: "STANDARD",
    synopsis: "Le chauffeur de François-Ferdinand prend le mauvais tournant. Gavrilo Princip se retrouve à moins de deux mètres de l'archiduc.",
    startId: "h01_start",
    segments: {

      h01_start: {
        id: "h01_start",
        type: "narrative",
        title: "Le Mauvais Tournant",
        text: "Sarajevo, 28 juin 1914. Le cortège impérial s'est perdu dans les ruelles après l'explosion d'une première bombe. Le chauffeur s'arrête pour faire demi-tour, moteur au ralenti.\n\nDevant vous : Gavrilo Princip, 19 ans, revolver en poche, incrédule d'avoir une seconde chance. Il lève les yeux et croise le regard de François-Ferdinand.",
        note: "Fait réel : Princip avait renoncé à l'attentat après l'échec du matin. Le mauvais virage du chauffeur lui offrit une occasion imprévue.",
        choices: [
          {
            id: "c01_hist",
            label: "Laisser l'Histoire suivre son cours",
            text: "Vous restez immobile. Princip dégaine et tire deux coups fatals.",
            isHistorical: true,
            nextId: "h01_s2_hist",
          },
          {
            id: "c01_alt",
            label: "Crier pour alerter la garde",
            text: "Vous hurlant en allemand — la garde se retourne et Princip panique.",
            isHistorical: false,
            nextId: "h01_s2_alt",
          },
        ],
      },

      h01_s2_hist: {
        id: "h01_s2_hist",
        type: "narrative",
        title: "Les Deux Coups de Feu",
        text: "Princip appuie deux fois. Sophie s'effondre la première, puis l'archiduc. Les témoins se figent, incrédules. En quelques semaines, l'Europe entière sera en guerre.",
        choices: [
          {
            id: "c02_hist_a",
            label: "Observer l'archiduc mourir",
            text: "Vous assistez à l'agonie de François-Ferdinand dans la voiture.",
            isHistorical: true,
            nextId: "h01_end_hist",
          },
          {
            id: "c02_hist_b",
            label: "Tenter de le sauver",
            text: "Vous comprimez la plaie — mais le destin d'un continent ne peut être stoppé.",
            isHistorical: false,
            nextId: "h01_end_alt1",
          },
        ],
      },

      h01_s2_alt: {
        id: "h01_s2_alt",
        type: "narrative",
        title: "La Chance Brisée",
        text: "Princip hésite une seconde de trop. Les gardes fondent sur lui, le désarment et le maîtrisent au sol. L'archiduc repart, blême mais vivant.",
        choices: [
          {
            id: "c02_alt_a",
            label: "Suivre le cortège impérial",
            text: "Vous escortez discrètement la voiture jusqu'à l'Hôtel de Ville.",
            isHistorical: false,
            nextId: "h01_end_alt2",
          },
          {
            id: "c02_alt_b",
            label: "Interroger Princip",
            text: "Vous profitez de la confusion pour questionner l'assassin capturé.",
            isHistorical: false,
            nextId: "h01_end_alt3",
          },
        ],
      },

      h01_end_hist: {
        id: "h01_end_hist",
        type: "end_historical",
        title: "La Mèche Est Allumée",
        text: "L'archiduc expire à 11h30. L'Autriche-Hongrie lance un ultimatum à la Serbie. En trente-sept jours, huit grandes puissances sont en guerre.\n\nDix millions de soldats mourront. Le monde que vous connaissiez n'existera plus jamais. Vous avez été le témoin du moment où tout bascula.",
        note: "Fait historique : La Première Guerre mondiale causa 18 à 20 millions de morts. Elle remodela les empires et prépara le terrain de la Seconde Guerre.",
      },

      h01_end_alt1: {
        id: "h01_end_alt1",
        type: "end_alternate",
        title: "Le Sauveur de l'Archiduc",
        text: "Votre intervention ralentit l'hémorragie. François-Ferdinand survit, estropié mais vivant. L'Autriche-Hongrie n'a aucun prétexte pour l'ultimatum serbe.\n\nSans guerre en 1914, les alliances restent fragiles. L'Europe n'explose pas — du moins, pas encore. Vous avez dévié l'Histoire, mais pour combien de temps ?",
        note: "Uchronie : La plupart des historiens débattent encore de savoir si la guerre était inévitable, ou si l'attentat en fut simplement le détonateur.",
      },

      h01_end_alt2: {
        id: "h01_end_alt2",
        type: "end_alternate",
        title: "Un Archiduc Prudent",
        text: "François-Ferdinand, choqué, annule toutes ses apparitions publiques. Il rentre à Vienne et pousse à des négociations avec la Serbie.\n\nSans guerre en 1914, l'Empire ottoman tient plus longtemps. Le Moyen-Orient du XXe siècle ressemble à quelque chose de très différent.",
        note: "Uchronie : Certains historiens pensent qu'un FFF survivant aurait pu freiner les faucons viennois partisans de la guerre.",
      },

      h01_end_alt3: {
        id: "h01_end_alt3",
        type: "end_alternate",
        title: "Les Aveux de Princip",
        text: "Princip, sous le choc, vous confie les noms de toute la cellule de la Main Noire. L'organisation est démantelée en 48 heures. L'Autriche-Hongrie n'a plus de cible serbe à blâmer.\n\nLa paix tient. Mais les tensions nationales restent là, comme des braises sous la cendre.",
        note: "Fait réel : La Main Noire (Ujedinjenje ili smrt) était une organisation nationaliste serbe secrète qui avait planifié l'attentat.",
      },
    },
  },

  // ────────────────────────────────────────────────────────────
  // STORY 02 — La Nuit du Mur  [STANDARD]
  // ────────────────────────────────────────────────────────────
  {
    id: "hero_02",
    title: "La Nuit du Mur",
    era: "Berlin, République Démocratique Allemande",
    year: "9 novembre 1989",
    icon: "🧱",
    theme: "La conférence de presse qui changea tout",
    difficulty: "STANDARD",
    synopsis: "Günter Schabowski vient d'annoncer par erreur la liberté de circulation immédiate. Des milliers de Berlinois de l'Est convergent vers les checkpoints.",
    startId: "h02_start",
    segments: {

      h02_start: {
        id: "h02_start",
        type: "narrative",
        title: "L'Annonce Accidentelle",
        text: "Berlin-Est, 18h57. Vous regardez en direct la conférence de presse de Schabowski. Il lit une note qu'il n'a pas eu le temps d'assimiler.\n\nUn journaliste lui demande : « Quand cela entre-t-il en vigueur ? » Schabowski consulte ses feuilles et répond, hésitant : « Immédiatement, sans délai. »\n\nVous êtes agent de la Stasi, posté au checkpoint Bornholmer Strasse. La foule commence à affluer.",
        note: "Fait réel : Schabowski n'avait pas lu l'intégralité de la note. L'ouverture devait être progressive et encadrée — pas immédiate.",
        choices: [
          {
            id: "c02_hist",
            label: "Laisser passer la foule",
            text: "Débordé, votre supérieur ouvre le checkpoint. La foule traverse.",
            isHistorical: true,
            nextId: "h02_s2_hist",
          },
          {
            id: "c02_alt",
            label: "Appeler le QG pour confirmation",
            text: "Vous décrochez le téléphone rouge — mais personne ne répond au sommet.",
            isHistorical: false,
            nextId: "h02_s2_alt",
          },
        ],
      },

      h02_s2_hist: {
        id: "h02_s2_hist",
        type: "narrative",
        title: "Le Flot Humain",
        text: "À 23h30, Harald Jäger ouvre les barrières. Des milliers de personnes traversent en pleurant, en riant. Certains s'embrassent avec des inconnus de l'Ouest.\n\nLe Mur ne tient plus qu'en tant que symbole. Il sera démoli dans les semaines qui suivent.",
        choices: [
          {
            id: "c02_hist_a",
            label: "Rejoindre la foule à pied",
            text: "Vous ôtez votre uniforme et traversez avec eux, ému.",
            isHistorical: true,
            nextId: "h02_end_hist",
          },
          {
            id: "c02_hist_b",
            label: "Documenter la scène",
            text: "Vous prenez des notes — ce moment mérite d'être consigné.",
            isHistorical: false,
            nextId: "h02_end_alt1",
          },
        ],
      },

      h02_s2_alt: {
        id: "h02_s2_alt",
        type: "narrative",
        title: "La Ligne Qui Sonne Dans le Vide",
        text: "Personne n'est joignable. Les responsables regardent tous la même conférence de presse, aussi désorientés que vous. La foule grossit minute après minute, sans consigne officielle.\n\nVotre supérieur direct arrive au checkpoint, livide.",
        choices: [
          {
            id: "c02_alt_a",
            label: "Maintenir la barrière fermée",
            text: "Vous ordonnez de tenir — mais la pression humaine est immense.",
            isHistorical: false,
            nextId: "h02_end_alt2",
          },
          {
            id: "c02_alt_b",
            label: "Ouvrir de votre propre chef",
            text: "Vous prenez la décision seul, sans attendre les ordres.",
            isHistorical: false,
            nextId: "h02_end_alt3",
          },
        ],
      },

      h02_end_hist: {
        id: "h02_end_hist",
        type: "end_historical",
        title: "La Nuit de la Liberté",
        text: "Des centaines de milliers de personnes traversent cette nuit. Des pioches et des marteaux s'attaquent au béton le lendemain.\n\nL'URSS ne réagit pas. Gorbatchev laisse faire. Moins d'un an plus tard, les deux Allemagnes sont réunifiées. Vous avez vécu la plus belle nuit de l'Histoire moderne.",
        note: "Fait historique : La chute du Mur de Berlin accéléra l'effondrement du bloc soviétique. La réunification allemande eut lieu le 3 octobre 1990.",
      },

      h02_end_alt1: {
        id: "h02_end_alt1",
        type: "end_alternate",
        title: "L'Archiviste du Mur",
        text: "Vos notes deviennent une chronique précieuse. Vous documentez chaque visage, chaque larme, chaque slogan crié dans la nuit.\n\nAu lieu de simplement vivre l'Histoire, vous l'avez préservée. Votre témoignage sera publié vingt ans plus tard.",
        note: "Uchronie : Des centaines de témoins ordinaires ont en réalité filmé et photographié cette nuit historique — souvent sans en mesurer l'importance sur le moment.",
      },

      h02_end_alt2: {
        id: "h02_end_alt2",
        type: "end_alternate",
        title: "La Digue Tient… Quelques Heures",
        text: "Vous résistez jusqu'à minuit. La foule chante, s'agglutine. Un officier supérieur arrive enfin et donne l'ordre d'ouvrir.\n\nLe retard a créé une pression supplémentaire — le passage est encore plus chaotique et émotionnel. L'Histoire aura attendu trois heures de plus.",
        note: "Uchronie : Harald Jäger, le vrai chef du checkpoint, a déclaré qu'il avait agi seul, sans ordre, parce qu'il « ne pouvait pas tirer sur la foule ».",
      },

      h02_end_alt3: {
        id: "h02_end_alt3",
        type: "end_alternate",
        title: "L'Agent Qui Ouvrit le Monde",
        text: "Vous serez celui qui, le premier, a ouvert le passage. Votre nom n'apparaîtra dans aucun manuel d'histoire — mais vous savez.\n\nLa foule vous porte presque en triomphe. Quelqu'un vous glisse une bière dans la main. Vous regardez l'Est et l'Ouest se mélanger pour la première fois depuis 28 ans.",
        note: "Fait réel : Harald Jäger fut effectivement le premier à ouvrir son checkpoint, vers 23h30. Il agit de sa propre initiative, contre les protocoles.",
      },
    },
  },

  // ────────────────────────────────────────────────────────────
  // STORY 03 — Tranquility Base  [STANDARD]
  // ────────────────────────────────────────────────────────────
  {
    id: "hero_03",
    title: "Tranquility Base",
    era: "Mer de la Tranquillité, Lune",
    year: "20 juillet 1969",
    icon: "🌕",
    theme: "Un petit pas, un grand choix",
    difficulty: "STANDARD",
    synopsis: "L'Eagle a atterri. Neil Armstrong s'apprête à descendre l'échelle. Mais l'alarme 1202 a failli tout faire avorter, et Houston surveille chaque paramètre.",
    startId: "h03_start",
    segments: {

      h03_start: {
        id: "h03_start",
        type: "narrative",
        title: "L'Eagle a Atterri",
        text: "20 juillet 1969, 20h17 UTC. Le module lunaire repose sur la Mer de la Tranquillité. Armstrong regarde par le hublot le sol gris et poudreux.\n\nVous êtes contrôleur de vol à Houston. L'alarme 1202 a failli déclencher un abandon de mission — mais Gene Kranz a dit « Go ». Maintenant, tout le monde retient son souffle.",
        note: "Fait réel : L'alarme 1202 était une surcharge de l'ordinateur de bord. Les ingénieurs avaient moins de 30 secondes pour décider d'atterrir ou d'avorter.",
        choices: [
          {
            id: "c03_hist",
            label: "Confirmer la sortie d'Armstrong",
            text: "Vous validez la check-list EVA. Armstrong descend l'échelle.",
            isHistorical: true,
            nextId: "h03_s2_hist",
          },
          {
            id: "c03_alt",
            label: "Signaler une anomalie de pression",
            text: "Vous marquez une lecture suspecte — sortie retardée de 2 heures.",
            isHistorical: false,
            nextId: "h03_s2_alt",
          },
        ],
      },

      h03_s2_hist: {
        id: "h03_s2_hist",
        type: "narrative",
        title: "Le Pied dans la Poussière",
        text: "Armstrong descend lentement. Sa botte gauche touche le régolithe lunaire. Six cents millions de personnes regardent en direct, en apnée.\n\n« C'est un petit pas pour l'homme, un bond de géant pour l'humanité. » La phrase résonne à travers l'espace, avec un léger délai de transmission.",
        choices: [
          {
            id: "c03_hist_a",
            label: "Coordonner le retour en orbite",
            text: "Vous calculez la fenêtre d'ascension pour le rendez-vous avec Collins.",
            isHistorical: true,
            nextId: "h03_end_hist",
          },
          {
            id: "c03_hist_b",
            label: "Suggérer une exploration plus longue",
            text: "Vous proposez d'étendre l'EVA — mais Houston refuse.",
            isHistorical: false,
            nextId: "h03_end_alt1",
          },
        ],
      },

      h03_s2_alt: {
        id: "h03_s2_alt",
        type: "narrative",
        title: "L'Attente Interminable",
        text: "Deux heures de vérifications supplémentaires. Armstrong et Aldrin s'impatientent dans le module. Nixon rédige en coulisse son discours d'échec.\n\nFinalement, l'anomalie est levée. La sortie peut reprendre.",
        choices: [
          {
            id: "c03_alt_a",
            label: "Valider la sortie maintenant",
            text: "Vous autorisez l'EVA — il fait encore jour lunaire, il reste du temps.",
            isHistorical: false,
            nextId: "h03_end_alt2",
          },
          {
            id: "c03_alt_b",
            label: "Reporter au lendemain lunaire",
            text: "Vous recommandez de dormir d'abord. La prudence prime.",
            isHistorical: false,
            nextId: "h03_end_alt3",
          },
        ],
      },

      h03_end_hist: {
        id: "h03_end_hist",
        type: "end_historical",
        title: "Retour en Orbite",
        text: "L'Eagle décolle 21 heures après l'alunissage. Le module remonte rejoindre Collins dans Columbia. Le périple de retour vers la Terre dure trois jours.\n\nLe 24 juillet, les trois astronautes amerrissent dans le Pacifique. L'humanité a marché sur la Lune. Vous en avez guidé le chemin.",
        note: "Fait historique : Apollo 11 transporta 21 kg d'échantillons lunaires. Les six missions Apollo collectèrent en tout 382 kg de roches qui sont encore étudiées aujourd'hui.",
      },

      h03_end_alt1: {
        id: "h03_end_alt1",
        type: "end_alternate",
        title: "Vingt Minutes de Plus",
        text: "Houston refuse votre suggestion. Mais Armstrong en profite pour s'éloigner de 50 mètres supplémentaires du LM, ramassant des échantillons inédits.\n\nCes roches révéleront, dix ans plus tard, des minéraux jamais observés sur Terre. Votre insistance a changé la géologie lunaire.",
        note: "Uchronie : Les astronautes d'Apollo 11 avaient en réalité très peu de marge pour s'éloigner — par précaution, Houston les gardait près du module.",
      },

      h03_end_alt2: {
        id: "h03_end_alt2",
        type: "end_alternate",
        title: "Le Pas Décalé",
        text: "Armstrong sort deux heures plus tard que prévu. La transmission télévisée mondiale a déjà perdu des millions de téléspectateurs — il est 2h du matin en Europe.\n\nLa phrase historique résonne dans un monde à moitié endormi. L'exploit est le même, mais la magie collective en est diminuée.",
        note: "Uchronie : Le timing de la sortie était délibérément choisi pour maximiser l'audience mondiale — un calcul de communication autant que de logistique.",
      },

      h03_end_alt3: {
        id: "h03_end_alt3",
        type: "end_alternate",
        title: "La Nuit Lunaire",
        text: "Armstrong et Aldrin dorment quelques heures dans le LM. Ils sortent au lever du soleil lunaire — une lumière rasante et spectaculaire que personne n'avait anticipée.\n\nLes photos d'Armstrong et Aldrin dans cette lumière dorée deviennent les plus belles de toute l'ère spatiale.",
        note: "Fait technique : La NASA avait prévu que les astronautes dorment avant leur sortie EVA, mais Armstrong et Aldrin avaient demandé à commencer plus tôt.",
      },
    },
  },

  // ────────────────────────────────────────────────────────────
  // STORY 04 — Les Ides de Mars  [COMPLEXE]
  // ────────────────────────────────────────────────────────────
  {
    id: "hero_04",
    title: "Les Ides de Mars",
    era: "Rome, République Romaine",
    year: "15 mars 44 av. J.-C.",
    icon: "🗡️",
    theme: "Tu quoque, Brute?",
    difficulty: "COMPLEXE",
    synopsis: "César se rend au Sénat malgré les mauvais présages. Les conjurés — Brutus, Cassius, et 22 autres — sont en place. Vous faites partie de sa garde rapprochée.",
    startId: "h04_start",
    segments: {

      h04_start: {
        id: "h04_start",
        type: "narrative",
        title: "Les Mauvais Présages",
        text: "Rome, aube du 15 mars. Un haruspice a prévenu César : « Prends garde aux Ides de Mars. » Sa femme Calpurnia a fait des cauchemars. Pourtant, César s'habille pour le Sénat.\n\nVous êtes Marcus, centurion de sa garde. Vous avez entendu des rumeurs de complot — vagues, non vérifiées. César vous demande d'escorter son licteur jusqu'au théâtre de Pompée.",
        note: "Fait réel : Plusieurs présages auraient mis en garde César. Il les aurait tous ignorés, ou du moins feint de les ignorer.",
        choices: [
          {
            id: "c04_warn",
            label: "Avertir César directement",
            text: "Vous lui rapportez les rumeurs de complot — il doit savoir.",
            isHistorical: false,
            nextId: "h04_death1",
          },
          {
            id: "c04_escort",
            label: "L'escorter sans mot dire",
            text: "Ce n'est pas votre rôle de remettre en question les décisions du dictateur.",
            isHistorical: true,
            nextId: "h04_s2_hist",
          },
          {
            id: "c04_investigate",
            label: "Enquêter discrètement sur le complot",
            text: "Vous retardez le départ et cherchez à confirmer vos informations.",
            isHistorical: false,
            nextId: "h04_s2_alt",
          },
        ],
      },

      h04_death1: {
        id: "h04_death1",
        type: "death",
        title: "La Trahison du Centurion",
        text: "César vous écoute, puis convoque Brutus. Brutus nie tout avec une éloquence parfaite. César vous regarde et dit : « Vois comme tu t'es laissé tromper par des rumeurs, Marcus. »\n\nVous êtes renvoyé de la garde sur-le-champ. Ce soir, César est assassiné sans que personne ne puisse l'en empêcher — et vous n'étiez même plus là pour tenter quoi que ce soit.",
        note: "Paradoxe : En cherchant à sauver César, vous avez perdu votre poste — et donc toute possibilité d'intervenir.",
      },

      h04_s2_hist: {
        id: "h04_s2_hist",
        type: "narrative",
        title: "La Curie de Pompée",
        text: "Le cortège arrive. César entre dans la salle du Sénat. Les conjurés se lèvent un à un, sous prétexte de pétitions. Vous regardez par l'embrasure de la porte.\n\nServilius Casca dégaine le premier. Sa lame effleure le cou de César. Les autres se jettent aussitôt.",
        choices: [
          {
            id: "c04_hist_charge",
            label: "Charger pour défendre César",
            text: "Vous entrez en courant, gladius dégainé.",
            isHistorical: false,
            nextId: "h04_death2",
          },
          {
            id: "c04_hist_witness",
            label: "Rester en retrait, horrifié",
            text: "La scène est trop rapide. Vous figez, impuissant.",
            isHistorical: true,
            nextId: "h04_s3_hist",
          },
        ],
      },

      h04_death2: {
        id: "h04_death2",
        type: "death",
        title: "Seul Contre Vingt-Trois",
        text: "Vous entrez dans la salle. Vingt-trois lames se tournent vers vous. Vous en blessez deux avant d'être submergé.\n\nVous mourrez en brave, mais César mourra quand même. Le destin de Rome ne dépendait pas d'un seul centurion.",
        note: "Paradoxe temporel : Votre courage était réel. Mais la conjuration était trop organisée pour qu'un seul homme puisse la briser de l'intérieur.",
      },

      h04_s2_alt: {
        id: "h04_s2_alt",
        type: "narrative",
        title: "La Filature",
        text: "Vous suivez discrètement Casca, l'un des suspects. Il entre dans une domus — celle de Brutus. Vous entendez des chuchotements, des noms. Le complot est réel.\n\nIl est déjà 9 heures. César est en route pour le Sénat. Vous n'avez que quelques minutes.",
        choices: [
          {
            id: "c04_alt_run",
            label: "Courir prévenir Antoine",
            text: "Marc Antoine est le seul assez puissant pour agir vite.",
            isHistorical: false,
            nextId: "h04_end_alt1",
          },
          {
            id: "c04_alt_block",
            label: "Bloquer l'entrée du Sénat",
            text: "Vous prétextez une inspection de sécurité pour retarder César.",
            isHistorical: false,
            nextId: "h04_s3_hist",
          },
        ],
      },

      h04_s3_hist: {
        id: "h04_s3_hist",
        type: "narrative",
        title: "Vingt-Trois Coups",
        text: "César reçoit vingt-trois coups de poignard. Il s'effondre au pied de la statue de Pompée. Selon Suétone, il mourait en prononçant : « Tu quoque, Brute, fili mi? »\n\nBrutus et les conjurés brandissent leurs lames tachées de sang, criant à la liberté. Rome est en état de choc.",
        choices: [
          {
            id: "c04_hist_final_a",
            label: "Fuir avec le corps de César",
            text: "Vous aidez à transporter la dépouille jusqu'à la maison de son épouse.",
            isHistorical: true,
            nextId: "h04_end_hist",
          },
          {
            id: "c04_hist_final_b",
            label: "Rallier la plèbe contre les conjurés",
            text: "Vous courez aux forums populaires pour alerter le peuple.",
            isHistorical: false,
            nextId: "h04_end_alt2",
          },
        ],
      },

      h04_end_hist: {
        id: "h04_end_hist",
        type: "end_historical",
        title: "La Fin de la République",
        text: "Les funérailles de César embrasent la plèbe. Marc Antoine lit le testament devant la foule en colère. Les conjurés fuient Rome.\n\nDix-sept ans de guerres civiles s'ensuivent. Octave, le neveu de César, en sort victorieux et devient Auguste — premier Empereur de Rome. La République meurt avec César.",
        note: "Fait historique : L'assassinat de César provoqua exactement l'inverse de ce que les conjurés voulaient — au lieu de restaurer la République, il précipita sa fin.",
      },

      h04_end_alt1: {
        id: "h04_end_alt1",
        type: "end_alternate",
        title: "Marc Antoine Intervient",
        text: "Antoine, prévenu à temps, se précipite vers le Sénat avec ses hommes. Il arrive alors que Casca lève déjà son poignard. Les conjurés, pris de panique, s'enfuient sans frapper.\n\nCésar est sauf. Mais Brutus et Cassius ne renonceront pas — ils reviendront. Vous avez gagné du temps, rien de plus.",
        note: "Uchronie : Marc Antoine se trouvait effectivement à l'extérieur du Sénat ce jour-là — les conjurés l'avaient délibérément écarté pour éviter qu'il intervienne.",
      },

      h04_end_alt2: {
        id: "h04_end_alt2",
        type: "end_alternate",
        title: "La Plèbe Se Soulève",
        text: "Votre cri rassemble des centaines de plébéiens furieux. Ils encerclent le Sénat avant que les conjurés n'aient pu s'échapper. Brutus et Cassius sont lynchés ce soir-là.\n\nMais sans chefs conjurés pour fuir et former une armée, la guerre civile est plus courte. Octave consolide le pouvoir en sept ans au lieu de dix-sept.",
        note: "Uchronie : La colère populaire contre les assassins de César fut réelle. Marc Antoine et Octave l'instrumentalisèrent pour se faire passer pour ses vengeurs.",
      },

      h04_end_alt3: {
        id: "h04_end_alt3",
        type: "end_alternate",
        title: "Le Sénat Bloqué",
        text: "Votre inspection de sécurité retarde César d'une heure. Les conjurés s'impatientent, commencent à douter les uns des autres. Cassius veut annuler.\n\nCésar arrive finalement — mais le moment est brisé. Seul Casca tente quand même de frapper. Il est maîtrisé par les licteurs. Le complot échoue.",
        note: "Uchronie : Les historiens antiques notaient que les conjurés étaient nerveux et auraient peut-être renoncé si le plan avait été perturbé.",
      },

      h04_end_alt4: {
        id: "h04_end_alt4",
        type: "end_alternate",
        title: "César Dictateur à Vie",
        text: "César survit. Il comprend que la République ne peut plus le contenir — il se déclare dictateur à vie et entame des réformes radicales.\n\nL'Empire romain naît de son vivant. Sans la transition chaotique des guerres civiles, Rome se stabilise plus vite — et dure peut-être deux siècles de plus.",
        note: "Uchronie spéculative : César avait des projets de réformes ambitieux (conquête des Parthes, colonisation, droit) que sa mort a interrompus.",
      },
    },
  },

  // ────────────────────────────────────────────────────────────
  // STORY 05 — La Valise  [COMPLEXE]
  // ────────────────────────────────────────────────────────────
  {
    id: "hero_05",
    title: "La Valise",
    era: "Quartier général du Wolf's Lair, Prusse-Orientale",
    year: "20 juillet 1944",
    icon: "💼",
    theme: "Opération Walkyrie — la bombe qui rata sa cible",
    difficulty: "COMPLEXE",
    synopsis: "Le colonel Stauffenberg a posé une valise piégée à deux mètres de Hitler lors d'une réunion de situation. Vous êtes le deuxième officier de liaison présent dans la salle.",
    startId: "h05_start",
    segments: {

      h05_start: {
        id: "h05_start",
        type: "narrative",
        title: "La Salle de Situation",
        text: "Wolf's Lair, 12h37. La réunion de situation bat son plein. Hitler penché sur la carte, entouré d'une vingtaine d'officiers. Une valise noire est posée contre la patte du lourd pupitre central.\n\nStauffenberg vient de quitter la salle sous prétexte d'un appel. Vous êtes à deux mètres de la valise. Dans votre poche, votre propre rôle dans Walkyrie : donner l'alerte à Berlin dès l'explosion.",
        note: "Fait réel : La bombe avait deux charges. Stauffenberg n'eut le temps d'en armer qu'une seule dans les toilettes. La deuxième resta dans sa serviette.",
        choices: [
          {
            id: "c05_move",
            label: "Déplacer la valise vers Hitler",
            text: "Vous la poussez discrètement du pied pour la rapprocher.",
            isHistorical: false,
            nextId: "h05_death1",
          },
          {
            id: "c05_wait",
            label: "Attendre l'explosion sans agir",
            text: "Votre rôle est à Berlin — vous ne touchez à rien.",
            isHistorical: true,
            nextId: "h05_s2_hist",
          },
          {
            id: "c05_abort",
            label: "Sortir discrètement avant l'heure",
            text: "Un mauvais pressentiment vous pousse à quitter la salle.",
            isHistorical: false,
            nextId: "h05_s2_alt",
          },
        ],
      },

      h05_death1: {
        id: "h05_death1",
        type: "death",
        title: "Le Geste de Trop",
        text: "Un autre officier vous voit pousser la valise. Il vous dévisage, hésite, puis appelle la sentinelle. Vous êtes arrêté avant l'explosion.\n\nLa valise est inspectée et désamorcée. Le complot est découvert dans l'heure. Stauffenberg est exécuté à l'aube — et vous avec lui.",
        note: "Paradoxe temporel : Votre initiative a trahi le complot entier. L'Histoire ne pardonne pas les gestes improvisés dans les opérations de précision.",
      },

      h05_s2_hist: {
        id: "h05_s2_hist",
        type: "narrative",
        title: "12h42 — L'Explosion",
        text: "La déflagration fait exploser le baraquement. Quatre officiers meurent. Hitler s'en sort avec des tympans crevés et une main brûlée.\n\nStauffenberg, à l'extérieur, voit les flammes et pense Hitler mort. Il s'envole pour Berlin. Mais Hitler est vivant — et la machine de répression se met en marche.",
        choices: [
          {
            id: "c05_hist_berlin",
            label: "Déclencher Walkyrie depuis Berlin",
            text: "Vous suivez le plan — appels téléphoniques, alerte aux unités.",
            isHistorical: true,
            nextId: "h05_s3_hist",
          },
          {
            id: "c05_hist_confirm",
            label: "Retourner vérifier si Hitler est mort",
            text: "Vous ne pouvez pas déclencher Walkyrie sans confirmation.",
            isHistorical: false,
            nextId: "h05_death2",
          },
        ],
      },

      h05_death2: {
        id: "h05_death2",
        type: "death",
        title: "La Confirmation Fatale",
        text: "Vous retournez sur les lieux. Les SS vous interceptent — vous n'avez aucune raison valable d'être là. Votre comportement suspect vous désigne immédiatement.\n\nL'interrogatoire révèle votre rôle. Walkyrie n'est jamais déclenché. Stauffenberg est arrêté à l'aéroport de Berlin.",
        note: "Paradoxe temporel : La réussite de Walkyrie reposait sur la rapidité d'exécution — chaque heure de retard donnait à la Gestapo le temps de réagir.",
      },

      h05_s2_alt: {
        id: "h05_s2_alt",
        type: "narrative",
        title: "La Voix de l'Instinct",
        text: "Vous sortez de la salle deux minutes avant l'explosion sous prétexte d'un besoin urgent. Vous attendez dans le couloir.\n\nLa déflagration vous projette contre le mur. Vous saignez d'une oreille. Dans la confusion, vous pouvez choisir votre prochain mouvement.",
        choices: [
          {
            id: "c05_alt_help",
            label: "Aider les blessés — jouer les innocents",
            text: "Vous vous fondez parmi les sauveteurs, brouillant les pistes.",
            isHistorical: false,
            nextId: "h05_s3_hist",
          },
          {
            id: "c05_alt_flee",
            label: "Fuir le Wolf's Lair immédiatement",
            text: "Vous quittez le périmètre avant que les sorties ne soient fermées.",
            isHistorical: false,
            nextId: "h05_end_alt3",
          },
        ],
      },

      h05_s3_hist: {
        id: "h05_s3_hist",
        type: "narrative",
        title: "Walkyrie Déclenché",
        text: "Depuis le Bendlerblock à Berlin, Stauffenberg déclenche Walkyrie. Les téléphones chauffent — ordres contradictoires, généraux hésitants. Certains rallient le complot. D'autres attendent de voir.\n\nMais la Radio allemande annonce à 18h30 que Hitler est vivant. Les hésitants rejoignent le camp des loyalistes. La fenêtre se ferme.",
        choices: [
          {
            id: "c05_hist_final_a",
            label: "Maintenir le mensonge : Hitler est mort",
            text: "Vous continuez à diffuser de fausses informations pour gagner du temps.",
            isHistorical: true,
            nextId: "h05_end_hist",
          },
          {
            id: "c05_hist_final_b",
            label: "Convaincre Rommel de rejoindre",
            text: "Vous tentez d'atteindre Rommel par téléphone — il pourrait tout changer.",
            isHistorical: false,
            nextId: "h05_end_alt1",
          },
          {
            id: "c05_hist_final_c",
            label: "Prendre Berlin par la force",
            text: "Vous mobilisez le Bataillon de Garde pour occuper les bâtiments clés.",
            isHistorical: false,
            nextId: "h05_end_alt2",
          },
        ],
      },

      h05_end_hist: {
        id: "h05_end_hist",
        type: "end_historical",
        title: "La Nuit des Longs Couteaux",
        text: "Stauffenberg est fusillé dans la cour du Bendlerblock à 1h du matin. Cinq mille personnes seront arrêtées dans les semaines suivantes. Deux cents seront exécutées.\n\nHitler prononce un discours la nuit même. Il y voit la main de la Providence. La guerre continue encore dix mois — et des millions de morts supplémentaires.",
        note: "Fait historique : L'attentat du 20 juillet 1944 impliquait plus de 200 conjurés. Son échec renforça paradoxalement le contrôle de Hitler sur l'armée.",
      },

      h05_end_alt1: {
        id: "h05_end_alt1",
        type: "end_alternate",
        title: "Rommel se Rallie",
        text: "Rommel, convalescent d'une blessure, est joint par téléphone. Il ne rejoint pas activement le complot — mais il promet de ne pas s'y opposer.\n\nSa neutralité bienveillante retarde les contre-ordres dans certains corps d'armée. Walkyrie tient jusqu'à l'aube. Cela ne suffit pas à renverser Hitler — mais la répression sera moins totale.",
        note: "Fait réel : Rommel était au courant du complot sans y participer directement. Il fut contraint au suicide en octobre 1944 pour avoir refusé de dénoncer les conjurés.",
      },

      h05_end_alt2: {
        id: "h05_end_alt2",
        type: "end_alternate",
        title: "Berlin Sous Contrôle",
        text: "Le Bataillon de Garde occupe le ministère de la Propagande et la Chancellerie pendant quatre heures. Goebbels est brièvement retenu.\n\nMais des unités SS loyalistes reprennent les bâtiments à 21h. La résistance s'effondre. Stauffenberg est fusillé — mais l'occupation temporelle de Berlin restera dans les archives comme le moment où le coup d'État faillit réussir.",
        note: "Uchronie : Le Bataillon de Garde de Berlin (Großdeutschland) avait effectivement reçu des ordres Walkyrie — mais son commandant finit par se rallier aux SS.",
      },

      h05_end_alt3: {
        id: "h05_end_alt3",
        type: "end_alternate",
        title: "La Fuite vers la Suisse",
        text: "Vous franchissez la frontière suisse à l'aube du 21 juillet. Vous portez avec vous des listes de conjurés — des noms que la Gestapo ne connaît pas encore.\n\nCes informations, transmises aux Alliés via les services secrets suisses, permettront de faire évacuer plusieurs familles. Vous avez échoué à tuer Hitler — mais vous avez sauvé des vies.",
        note: "Fait réel : Plusieurs officiers liés au complot réussirent à fuir ou à se cacher. Certains témoignèrent aux procès de Nuremberg.",
      },

      h05_end_alt4: {
        id: "h05_end_alt4",
        type: "end_alternate",
        title: "L'Ère Sans Hitler",
        text: "Si Hitler était mort ce jour-là, les généraux allemands auraient probablement demandé un armistice à l'automne 1944. La guerre se serait terminée six mois plus tôt.\n\nPlusieurs millions de vies — dont la majorité des victimes de l'Holocauste — auraient peut-être été sauvées. L'histoire du XXe siècle aurait été radicalement différente.",
        note: "Uchronie : La quasi-totalité des massacres en camps d'extermination eurent lieu entre 1942 et 1945. Un armistice en 1944 aurait changé l'ampleur du génocide.",
      },
    },
  },
]

// ───────────────────────────────────────────────────────────────
// HELPERS
// ───────────────────────────────────────────────────────────────

export function getHeroStory(id: string): HeroStory | undefined {
  return HERO_STORIES.find((s) => s.id === id)
}

export function getRandomHeroStory(): HeroStory {
  return HERO_STORIES[Math.floor(Math.random() * HERO_STORIES.length)]
}

export function getRandomHeroStoryByDifficulty(difficulty: "STANDARD" | "COMPLEXE"): HeroStory {
  const filtered = HERO_STORIES.filter((s) => s.difficulty === difficulty)
  if (filtered.length === 0) return getRandomHeroStory()
  return filtered[Math.floor(Math.random() * filtered.length)]
}
