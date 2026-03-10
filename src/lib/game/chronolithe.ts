// ─────────────────────────────────────────────────────────────────────────────
// CHRONOLITHES — Fragments narratifs du passé
// Des pierres-mémoires qui renferment des échos de l'Histoire
// ─────────────────────────────────────────────────────────────────────────────

export interface ChronolitheSegment {
  index: number   // 1-based
  title: string
  text:  string
  hook?: string   // accroche pour la partie suivante (absent sur le dernier segment)
}

export interface ChronolitheStory {
  id:       string
  title:    string
  theme:    string
  icon:     string
  segments: ChronolitheSegment[]
}

export interface ChronolitheDropResult {
  storyId:       string
  storyTitle:    string
  storyIcon:     string
  theme:         string
  segmentIndex:  number
  segmentTitle:  string
  segmentText:   string
  segmentHook?:  string
  isNewStory:    boolean
  isCompleted:   boolean
  totalSegments: number
}

// ─────────────────────────────────────────────────────────────────────────────
// LES 20 HISTOIRES
// ─────────────────────────────────────────────────────────────────────────────

export const CHRONOLITHE_STORIES: ChronolitheStory[] = [
  {
    id:    "chrono_01",
    title: "Le Sablier Brisé",
    theme: "La fin du temps",
    icon:  "⌛",
    segments: [
      {
        index: 1,
        title: "Partie I — Le gardien",
        text: `Il existe, dans les archives de l'Histoire, une ligne qui dit simplement ceci : *"Le Sablier fut brisé à 3h17 du matin."* Personne ne sait qui l'a écrit. Ce que l'on sait, c'est que ce matin-là, dans une ville dont le nom a été effacé de toutes les cartes, les cloches s'arrêtèrent. Toutes. En même temps. Les chiens cessèrent d'aboyer. Les rivières ralentirent. Et le ciel, témoins de ceux qui levèrent les yeux, sembla retenir son souffle pendant sept secondes exactement. Puis tout reprit comme si rien ne s'était passé. Sauf que quelque chose, quelque part, avait changé. Quelque chose d'irréparable.`,
        hook: "Celui qui gardait le Sablier s'appelait Elion. Et il était introuvable.",
      },
      {
        index: 2,
        title: "Partie II — La chute",
        text: `Elion était gardien du Sablier depuis quarante ans. Il ne dormait jamais plus de deux heures. Chaque nuit, à 3h16 précises, il le retournait — geste qu'il accomplissait depuis que son maître mourant lui avait confié cette tâche avec une seule instruction : *"Ne le pose pas. Ne le brise pas. Et surtout — n'essaie jamais de le comprendre."* Ce soir-là, pour la première fois en quarante ans, Elion avait hésité. Une seconde. Une seule. Sa main avait tremblé. Le Sablier avait glissé entre ses doigts, comme s'il avait voulu fuir. Le bruit du verre sur la pierre avait résonné comme un tonnerre dans un ciel vide.`,
        hook: "Mais le sable ne s'était pas répandu. Il montait.",
      },
      {
        index: 3,
        title: "Partie III — Le sable qui monte",
        text: `Lentement, contre toute loi connue, les grains blancs s'élevaient depuis les éclats de verre en fines spirales lumineuses. Elion recula, incapable de parler. Les grains formaient des motifs — pas aléatoires, mais précis, comme gravés dans l'air. La naissance d'un enfant sous une étoile rouge. Le dernier souffle d'un empire. Un coucher de soleil que personne sur Terre n'avait vu depuis dix mille ans. Elion comprit alors ce que son maître n'avait jamais voulu lui dire : le Sablier ne *mesurait* pas le temps. Il le *contenait*. Chaque grain était une seconde réelle, arrachée à l'écoulement naturel du monde et emprisonnée là pour une raison que personne ne connaissait.`,
        hook: "Et maintenant que le contenant était brisé, tout ce temps libre cherchait où aller.",
      },
      {
        index: 4,
        title: "Partie IV — La Grande Anomalie",
        text: `Les historiens appelèrent cela la *Grande Anomalie de 3h17*. Dans les mois qui suivirent, des phénomènes inexplicables furent reportés aux quatre coins du monde connu. Des hommes se réveillèrent en parlant des langues mortes depuis mille ans. Des enfants dessinèrent des cités qui n'existaient pas encore — et leurs dessins se révélèrent exacts des décennies plus tard. Des rêves collectifs envahirent des peuples entiers : le même rêve, la même nuit — un vieillard courant dans un couloir de verre, les mains pleines de sable blanc brillant. Personne ne savait ce que cela signifiait. Personne, sauf peut-être Elion. Qui avait disparu. Mais qui avait laissé une lettre.`,
        hook: "La lettre ne contenait qu'un seul mot : *Recommence.*",
      },
      {
        index: 5,
        title: "Partie V — La lettre",
        text: `La lettre fut retrouvée trois siècles après la mort supposée d'Elion. Un enfant la dénicha dans le mur d'une vieille tour — roulée dans un tube de bronze, scellée à la cire noire. Quand on la déroula, on vit que le parchemin était couvert de l'écriture d'Elion : des pages et des pages de chiffres, de dates, de noms d'inconnus. Et au centre exact du rouleau, un seul mot écrit en rouge sang : *Recommence.* Les scholars débattirent pendant des années. Puis l'un d'eux remarqua quelque chose : les chiffres, disposés en spirale, formaient une date précise. Celle de la découverte de la lettre elle-même. Elion, quarante ans avant de briser le Sablier, savait déjà. Il avait choisi de le faire quand même.`,
      },
    ],
  },

  {
    id:    "chrono_02",
    title: "La Mémoire du Glacier",
    theme: "La mémoire de la Terre",
    icon:  "🧊",
    segments: [
      {
        index: 1,
        title: "Partie I — La découverte",
        text: `En 1977, une équipe de glaciologues soviétiques forerait le plateau de l'Antarctique quand leur foreuse heurta quelque chose. Pas du roc. Quelque chose de mou. Ils remontèrent l'échantillon dans le froid mordant du laboratoire de surface. Un bloc de glace translucide, pas plus gros qu'un coffre de pirate. Et dedans, parfaitement conservé depuis environ quarante mille ans, un mammouth laineux — pas un fossile, pas un squelette, mais un corps entier, poils roux encore en place, yeux mi-clos comme s'il dormait. La scientifique en chef, Irina Volkov, nota dans son journal une chose étrange : *"Il avait l'air serein. Presque heureux."*`,
        hook: "Ce qu'elle ne nota pas, c'est ce qu'elle crut voir dans ses yeux à demi fermés.",
      },
      {
        index: 2,
        title: "Partie II — Les yeux ouverts",
        text: `Irina Volkov ne dormit pas cette nuit-là. Elle resta assise face au bloc de glace dans le laboratoire de fortune, seule sous les néons bourdonnants. Elle regardait les yeux du mammouth. Ils n'étaient pas fermés, elle le comprit après des heures — ils étaient *presque* ouverts, figés dans l'instant précis où la bête avait sombré dans la glace. Et dans cet iris brun ambré, conservé avec une précision hallucinante, on pouvait voir : un reflet. Un reflet du paysage de ce moment-là, quarante mille ans plus tôt. Une forêt de bouleaux. Un ciel violet. Et la silhouette floue d'un être debout sur deux jambes qui le regardait tomber.`,
        hook: "L'être ne ressemblait à aucun animal connu. Mais il ressemblait à un homme.",
      },
      {
        index: 3,
        title: "Partie III — Ce que la glace garde",
        text: `Les images de l'œil furent analysées par trois laboratoires indépendants. Tous conclurent la même chose : le reflet était réel, pas une artefact optique, pas une illusion. Quelqu'un — quelque chose — avait assisté à la mort du mammouth. Les paléoanthropologues furent formels : à cette latitude, à cette époque, *Homo sapiens* n'avait pas encore migré. Ce que montrait l'œil ne pouvait pas exister. L'affaire fut classifiée. Les photos furent saisies. Irina Volkov reçut un ordre de ne plus communiquer sur ses travaux. Elle accepta. Mais avant que ses archives lui soient retirées, elle dissimula une copie de la photo dans la reliure d'un livre qu'elle offrit à sa fille.`,
        hook: "Le livre s'appelait *Mémoires du Monde Perdu*. Sa fille ne l'ouvrit que trente ans plus tard.",
      },
      {
        index: 4,
        title: "Partie IV — Le livre",
        text: `La fille d'Irina, Natasha, trouva la photo en 2007 en désherba la bibliothèque de sa mère décédée. Elle la regarda longtemps. Elle était scientifique elle aussi — chercheuse en ADN ancien. Elle emporta la photo dans son laboratoire de Moscou et fit ce que sa génération pouvait faire que la sienne ne pouvait pas : elle séquença l'ADN du mammouth, qui avait été extrait et conservé depuis la découverte. Et dans ce génome vieux de quarante mille ans, elle trouva une séquence qui n'appartenait ni au mammouth ni à aucune espèce connue. Une séquence courte, répétitive, qui ressemblait moins à de l'ADN qu'à du *code binaire*.`,
        hook: "Natasha envoya les données à une seule personne. Un physicien théorique à Cambridge. Il ne répondit pas pendant six mois.",
      },
      {
        index: 5,
        title: "Partie V — Le message",
        text: `Le physicien de Cambridge répondit finalement par une lettre manuscrite de deux pages. Dans la première page, il expliquait comment la séquence ADN pouvait être convertie, en suivant une règle mathématique précise, en une série de coordonnées. Pas des coordonnées géographiques — des coordonnées temporelles. Des dates. Vingt-trois dates, couvrant une période allant de moins quarante mille ans à... l'année suivante. La dernière coordonnée pointait vers un moment précis : 3h17 du matin, le 21 décembre de l'année en cours. La deuxième page de la lettre ne contenait qu'une phrase : *"Je ne sais pas qui a programmé ce mammouth. Mais ils voulaient qu'on sache quand revenir."*`,
      },
    ],
  },

  {
    id:    "chrono_03",
    title: "L'Heure Immobile de Pompéi",
    theme: "Le temps arrêté",
    icon:  "🌋",
    segments: [
      {
        index: 1,
        title: "Partie I — 24 août 79",
        text: `À 13h08, heure romaine, le Vésuve entra en éruption. Les habitants de Pompéi avaient seize minutes. Dix-sept, peut-être. Les archéologues le savent maintenant parce qu'ils ont lu les marques de temps gravées involontairement dans la catastrophe elle-même : la position des ombres dans les rues, les repas à moitié mangés figés dans la lave, les montres solaires arrêtées pour toujours. Parmi les corps retrouvés, certains sont figés dans des gestes tellement précis qu'ils ressemblent à des photographies. Une femme tenant un enfant contre elle. Un homme dont la main est tendue vers quelque chose qu'il n'atteindra jamais. Et un boulanger, debout derrière son four, qui regardait vers le nord.`,
        hook: "Ce boulanger, les archéologues lui donnèrent un nom. Marcus. Et Marcus avait vu venir le nuage bien avant les autres.",
      },
      {
        index: 2,
        title: "Partie II — Marcus le boulanger",
        text: `Marcus Caelius Rufus, boulanger de la rue de l'Abondance, avait commencé sa journée avant l'aube comme tous les matins. Il avait pétri sa pâte, allumé son four, vendu son pain. Mais à midi, quelque chose l'avait arrêté. Un grondement sourd venu des profondeurs. Il n'était pas le seul à l'entendre — les chiens de la ville aboyaient depuis deux heures — mais il fut l'un des seuls à le reconnaître. Son père lui avait parlé d'un grondement semblable, soixante ans plus tôt, lors d'un tremblement de terre qui avait à moitié détruit la ville. Marcus savait ce que ce bruit signifiait. Alors il fit quelque chose d'étrange : il finit de cuire son pain.`,
        hook: "Pourquoi rester ? Pourquoi continuer à travailler quand la mort approche ?",
      },
      {
        index: 3,
        title: "Partie III — Le choix de rester",
        text: `Les archéologues ont reconstruit ses gestes avec une précision troublante grâce aux marques laissées dans la cendre. Marcus avait sorti ses dernières miches à 13h21 — treize minutes après le début de l'éruption. Il les avait disposées sur l'étal, comme pour la vente. Il avait replié sa tablette de comptes. Il avait éteint la lampe à huile. Puis il s'était tourné vers le Vésuve. Le nuage pyroclastique — ce mur de gaz brûlant à six cents degrés — voyageait à cent kilomètres à l'heure. Il lui restait environ quatre minutes. On ne sait pas s'il essaya de fuir. Son corps fut retrouvé là, dans la position de quelqu'un qui regarde, pas de quelqu'un qui court.`,
        hook: "Près de lui, on trouva quelque chose que les rapports officiels ne mentionnèrent pas.",
      },
      {
        index: 4,
        title: "Partie IV — La tablette",
        text: `Près du corps de Marcus, en 1961, un étudiant en archéologie trouva une petite tablette de cire. Elle était partiellement fondue mais lisible sur les bords. Ce n'était pas un compte, ni une recette. C'était une lettre. Inachevée. Adressée à une femme nommée Lucia, qui vivait à Herculanum — la ville voisine, elle aussi engloutie. La lettre disait simplement : *"Le pain est cuit. Je reste avec le four. Ne reviens pas ici. Prends les enfants et va vers la mer. Si tu lis ces mots, c'est que j'ai eu raison de rester. Si tu ne les lis pas—"* La phrase s'arrêtait là. L'étudiant photographia la tablette. Son directeur de thèse la fit classer *"fragment non pertinent"*.`,
        hook: "Soixante ans plus tard, un généticien crut identifier les descendants de Marcus.",
      },
      {
        index: 5,
        title: "Partie V — Ce qui survit",
        text: `En 2019, une équipe italienne testa l'ADN de trente familles campaniennes dont les généalogies remontaient aux premières années après l'éruption. Parmi elles, une famille de Napoli portait une mutation génétique rare qui apparaissait aussi dans l'ADN extrait des os de Marcus. Une arrière-petite-fille de Marcus. Qui ignorait tout de lui, bien sûr. La chercheuse en chef lui rendit visite. Elle lui montra la photo de la lettre. La femme — prénommée Lucia, par coïncidence ou par quelque chose de plus mystérieux — lut les mots inachevés de son ancêtre. Et selon les notes de la chercheuse, elle dit une seule chose : *"Il avait raison. Ma famille vient de la côte. Nous sommes allés vers la mer."*`,
      },
    ],
  },

  {
    id:    "chrono_04",
    title: "Le Dernier Méridien",
    theme: "L'heure universelle",
    icon:  "🌐",
    segments: [
      {
        index: 1,
        title: "Partie I — Washington, 1884",
        text: `En octobre 1884, des délégués de vingt-cinq nations se réunirent à Washington pour résoudre une question qui semblait absurde mais qui paralysait la planète moderne : *quelle heure est-il ?* Avec l'avènement du chemin de fer et du télégraphe, les temps locaux — chaque ville avait le sien, calé sur sa propre longitude — causaient des catastrophes. Des trains se percutaient parce que les conducteurs avaient des montres réglées sur des fuseaux différents. Des marchés s'effondraient parce que les télégrammes arrivaient avec des horodatages impossibles. Il fallait un méridien zéro. Un point de départ unique pour l'heure mondiale. La question était : *lequel ?*`,
        hook: "La France voulait Paris. L'Angleterre voulait Greenwich. Et les deux pays ne se parlaient plus depuis Waterloo.",
      },
      {
        index: 2,
        title: "Partie II — La bataille des méridiens",
        text: `Le débat dura vingt-deux jours. Les Français avaient proposé un méridien *neutre* — passant par les Açores, ne favorisant personne. Les Britanniques avaient présenté des données convaincantes : déjà 72% du commerce maritime mondial utilisait des cartes basées sur Greenwich. Le délégué français, M. Janssen, grand astronome et homme de principes, refusait de céder. Il avait passé sa vie à calculer des éphémérides depuis l'Observatoire de Paris. Accepter Greenwich, c'était effacer son travail. Effacer l'histoire française de la mesure du temps. Lors d'un dîner privé, on lui rapporta qu'un délégué américain lui avait dit : *"Monsieur, le temps n'appartient à personne. C'est précisément pourquoi tout le monde se bat pour le posséder."*`,
        hook: "La nuit du vingtième jour, Janssen disparut de son hôtel.",
      },
      {
        index: 3,
        title: "Partie III — La nuit du compromis",
        text: `On retrouva Janssen à 4h du matin dans les jardins de l'Observatoire Naval de Washington, assis sur un banc, regardant les étoiles. Il avait passé la nuit à refaire ses calculs. Non pas pour gagner le débat — il savait déjà qu'il l'avait perdu. Mais pour comprendre quelque chose qui le taraudait depuis des semaines. Dans ses carnets retrouvés plus tard, il avait écrit : *"J'ai compris cette nuit que le méridien n'est pas une ligne sur la Terre. C'est une ligne dans nos têtes. Que nous décidions que Greenwich est le centre du temps, et Greenwich le deviendra — non pas parce que c'est vrai, mais parce que nous aurons choisi de croire que c'est vrai."* Le lendemain, il vota pour Greenwich.`,
        hook: "Son vote fut la surprise de la conférence. Personne ne comprit pourquoi il avait changé d'avis.",
      },
      {
        index: 4,
        title: "Partie IV — La lettre à son fils",
        text: `Janssen mourut en 1907. Dans ses papiers, sa famille trouva une lettre jamais envoyée, datée du 23 octobre 1884 — le lendemain de son vote. Elle était adressée à son fils, alors enfant. Il lui expliquait sa décision avec une clarté étonnante pour un homme de science : *"J'ai voté pour Greenwich non parce que les Anglais avaient raison, mais parce que j'ai réalisé que choisir un mensonge utile au bon moment est parfois plus courageux que défendre une vérité inutile. Le méridien de Greenwich n'est pas le centre du monde. Aucun endroit n'est le centre du monde. Mais le monde avait besoin d'un centre, alors j'ai donné le mien."* La lettre se terminait par : *"Quand tu grandiras, tu comprendras que les grandes décisions de l'Histoire ressemblent toujours à des défaites."*`,
        hook: "Son fils devint ingénieur. Il construisit les premières horloges atomiques de France.",
      },
      {
        index: 5,
        title: "Partie V — L'heure qui n'existe pas",
        text: `Aujourd'hui, le méridien de Greenwich traverse le quartier de Londres, une ligne verte tracée dans le sol d'un parc. Des touristes viennent se photographier dessus — un pied dans chaque jour, sourire aux lèvres. Ce qu'ils ne savent pas, c'est que la vraie ligne — calculée par GPS — passe à cent deux mètres à l'est du télescope de l'observatoire. La position "officielle" de Greenwich est fausse d'une centaine de mètres, à cause des déformations gravitationnelles locales que les instruments du XIXe siècle ne pouvaient pas détecter. Nous avons organisé le temps mondial entier autour d'un endroit légèrement incorrect. Janssen l'aurait trouvé drôle.`,
      },
    ],
  },

  {
    id:    "chrono_05",
    title: "L'Horloge de la Tranchée",
    theme: "Le temps en guerre",
    icon:  "⚙️",
    segments: [
      {
        index: 1,
        title: "Partie I — Dans la boue",
        text: `En novembre 1917, un soldat britannique nommé Thomas Whitfield fut enterré vivant pendant six heures lors de l'effondrement d'un tunnel de communication près d'Ypres. On le dégagea à moitié asphyxié, couvert de boue jusqu'aux yeux. La première chose qu'il fit, une fois debout, ce fut de sortir sa montre de gousset de sa poche et de vérifier l'heure. Elle était arrêtée. Elle avait pris un éclat d'obus à un moment indéterminé de son enfouissement. L'aiguille des minutes pointait vers le sept. L'aiguille des heures vers le deux. 2h35. Thomas la remit dans sa poche et ne parla à personne de ce qui s'était passé dans le noir.`,
        hook: "Il ne parla pas non plus des voix qu'il avait entendues pendant ces six heures.",
      },
      {
        index: 2,
        title: "Partie II — Les voix sous la terre",
        text: `Dans le noir total, enseveli, Thomas avait d'abord essayé de creuser. Puis il avait compris que ses bras étaient bloqués par le poids de la terre. Alors il avait fait ce que font les hommes dans les endroits impossibles : il avait commencé à parler. À voix basse, puis de plus en plus fort, à personne en particulier. À son père, mort à Gallipoli. À sa sœur, à Birmingham. Au chien qu'il avait eu enfant. Et à un moment — il n'aurait pas su dire quand — quelque chose lui avait répondu. Pas une voix humaine. Plutôt un son, comme un bourdonnement profond, régulier, mécanique. Comme une horloge. Dans ses lettres à sa femme, envoyées de l'hôpital de campagne deux semaines plus tard, il écrit : *"J'ai cru entendre le temps lui-même battre dans les murs de la terre."*`,
        hook: "Ce qu'il ne sut jamais, c'est que d'autres soldats avaient entendu la même chose. Dans d'autres tranchées. À des kilomètres de distance.",
      },
      {
        index: 3,
        title: "Partie III — Le phénomène",
        text: `Un psychiatre militaire français, le docteur Henri Mazeau, recueillit entre 1916 et 1918 les témoignages de quarante-sept soldats qui rapportaient le même phénomène : enterrés vivants ou isolés dans des abris bombardés, ils avaient entendu un battement régulier qu'ils décrivaient invariablement comme *"une horloge"* ou *"le pouls de la terre"*. Mazeau publia une note en 1919, suggérant qu'il s'agissait d'une hallucination auditive déclenchée par la privation sensorielle et le choc. La note fut largement ignorée. Ce qui l'intrigua le plus, cependant, n'était pas les hallucinations elles-mêmes — mais le fait que tous les soldats avaient entendu le même rythme. Il l'avait mesuré. Il battait à une pulsation toutes les 0,86 secondes.`,
        hook: "0,86 seconde. Mazeau avait cherché pendant des années à quoi correspondait ce chiffre. Il trouva la réponse dans une revue scientifique américaine, publiée en 1932.",
      },
      {
        index: 4,
        title: "Partie IV — La résonance",
        text: `En 1952, le physicien allemand Winfried Otto Schumann découvrit mathématiquement que la cavité entre la surface terrestre et l'ionosphère agissait comme un résonateur naturel. Les éclairs qui frappent la Terre en permanence — plusieurs centaines par seconde dans le monde entier — génèrent des ondes électromagnétiques qui rebondissent dans cet espace. La fréquence fondamentale de ces ondes : 7,83 Hz. Ce qui correspond à... 0,85 seconde entre chaque battement. Les soldats enterrés dans la boue d'Ypres, privés de tout stimuli sensoriel, avaient perçu la résonance de Schumann. Le pouls électromagnétique de la planète elle-même. Ils n'avaient pas halluciné. Ils avaient *entendu* la Terre.`,
        hook: "Thomas Whitfield mourut en 1964. Sa montre arrêtée sur 2h35 fut retrouvée dans une boîte à chaussures. À côté, une note : *\"C'est l'heure à laquelle le monde s'est tu.\"*",
      },
      {
        index: 5,
        title: "Partie V — 2h35",
        text: `La montre de Thomas Whitfield fut achetée aux enchères en 2003 par un collectionneur belge qui s'intéressait aux *objets arrêtés* — montres, pendules, baromètres figés pour toujours à l'instant d'un événement. Il en avait des centaines. Mais celle-ci l'intrigua. Il fit analyser l'éclat d'obus coincé dans le mécanisme. Le métal était d'origine allemande — standard pour les obus de 77mm. L'impact avait eu lieu selon les métallurgistes autour de 1917, cohérent. Puis il demanda à un historien de retrouver les journaux de tranchée de la région d'Ypres pour novembre 1917. Il cherchait quelque chose de précis. Il le trouva : le 12 novembre 1917, à 2h35, une mine allemande explodit sous un tunnel britannique. Thomas Whitfield était dans ce tunnel. Sa montre s'était arrêtée au moment exact où son monde s'était effondré.`,
      },
    ],
  },

  {
    id:    "chrono_06",
    title: "L'Éclipse Qui Arrêta une Guerre",
    theme: "Le temps comme arbitre",
    icon:  "🌑",
    segments: [
      {
        index: 1,
        title: "Partie I — La rivière Halys",
        text: `Le 28 mai 585 avant notre ère, deux armées se faisaient face au bord de la rivière Halys, en Anatolie. D'un côté, les Lydiens — riches, puissants, maîtres des plaines dorées de l'ouest. De l'autre, les Mèdes — guerriers féroces venus des montagnes du nord-est, qui avaient déjà englouti l'Assyrie. Cela faisait cinq ans qu'ils se battaient. Des milliers de morts pour une frontière que personne ne savait plus exactement où tracer. Ce matin-là, à l'heure où les combats devaient reprendre, quelque chose se produisit. Le soleil commença à disparaître. Lentement d'abord, comme si un nuage immense traversait le ciel. Puis, d'un seul coup, la nuit tomba.`,
        hook: "Les soldats s'arrêtèrent. Les deux camps. Simultanément. Et tous regardèrent vers le haut.",
      },
      {
        index: 2,
        title: "Partie II — La nuit en plein jour",
        text: `L'éclipse totale dura six minutes. Six minutes pendant lesquelles des dizaines de milliers d'hommes armés restèrent immobiles, saisis d'une terreur commune qui transcendait les frontières, les langues, les dieux. Dans ces six minutes, quelque chose se brisa dans la volonté de combattre. Les Lydiens virent dans ce présage le signe de leur dieu Soleil qui refusait de bénir leur guerre. Les Mèdes y lurent la colère d'Ahura Mazda, leur divinité lumineuse. Quand le soleil revint, personne ne donna l'ordre de charger. Les généraux se regardèrent à travers le champ de bataille. Puis, selon Hérodote qui rapporta ces événements cent ans plus tard, ils firent quelque chose d'inédit : ils envoyèrent des messagers.`,
        hook: "Hérodote dit qu'un philosophe grec avait *prédit* cette éclipse. Un homme nommé Thalès.",
      },
      {
        index: 3,
        title: "Partie III — Thalès et la prédiction",
        text: `Thalès de Milet était le premier homme dont nous savons avec certitude qu'il avait tenté d'expliquer les phénomènes naturels sans recourir aux dieux. Il avait calculé, en utilisant des tables babyloniennes vieilles de siècles, que le soleil serait mangé cette année-là. Il l'avait annoncé. Personne ne l'avait cru — ou plutôt, personne n'avait compris ce que cela signifiait. L'idée qu'un homme puisse *prévoir* le comportement du ciel était aussi absurde que de prétendre qu'on pouvait prédire la volonté des dieux. Mais Thalès avait compris quelque chose que ses contemporains ne saisissaient pas : le ciel n'avait pas de volonté. Il avait des *règles*. Et les règles pouvaient être apprises.`,
        hook: "Ce n'est pas la paix qu'il avait cherché à provoquer. C'était autre chose.",
      },
      {
        index: 4,
        title: "Partie IV — Ce que Thalès voulait prouver",
        text: `Dans les lettres que ses élèves attribuent à Thalès — authentiques ou non, elles capturent sa pensée — il explique qu'il avait annoncé l'éclipse pour démontrer une seule chose : que la nature obéit à des lois, pas à des caprices divins. Que si un homme ordinaire pouvait prédire ce que ferait le soleil, alors le soleil n'était pas un dieu — c'était un mécanisme. Cette idée, inoffensive en apparence, était la plus subversive jamais formulée. Elle signifiait que les prêtres n'avaient aucun accès privilégié au cosmos. Que la vérité était accessible à quiconque observait et calculait avec assez de patience. Thalès inventait, sans le nommer, ce qu'on appellera deux mille cinq cents ans plus tard la méthode scientifique.`,
        hook: "La paix entre Lydiens et Mèdes dura quarante ans. Elle finit quand Cyrus le Grand envahit les deux royaumes. Thalès, lui, survécut à tout ça.",
      },
      {
        index: 5,
        title: "Partie V — La plus ancienne date précise",
        text: `Le 28 mai 585 avant notre ère est la plus ancienne date de l'histoire que nous puissions fixer avec une précision absolue. Pas approximativement — *absolument*. Les astronomes modernes peuvent recalculer la trajectoire exacte de la Lune et du Soleil en remontant dans le passé, et ils confirment : une éclipse totale a bien eu lieu ce jour-là, visible depuis la rivière Halys, Anatolie. Tout ce que nous savons de l'Antiquité avant cette date est estimatif, flottant, incertain. Mais à partir de ce coucher de soleil en plein midi, l'histoire du monde acquiert une ancre temporelle. Thalès avait voulu prouver que le ciel obéissait à des règles. Il avait, sans le savoir, offert à l'humanité son premier point fixe dans le temps.`,
      },
    ],
  },

  {
    id:    "chrono_07",
    title: "La Bibliothèque Sans Fin",
    theme: "La mémoire perdue",
    icon:  "📜",
    segments: [
      {
        index: 1,
        title: "Partie I — Le bibliothécaire",
        text: `La bibliothèque d'Alexandrie ne brûla pas en une seule nuit. C'est le premier mensonge qu'on nous enseigne. Elle mourut lentement, sur plusieurs siècles, de négligence, de politique, de guerres successives, de coupes budgétaires. Mais il y eut bien un incendie. Plusieurs, en fait. Le plus célèbre — 48 avant notre ère, pendant la guerre civile romaine — est celui qu'on attribue à César. Ce soir-là, un bibliothécaire nommé Callimaque le Jeune — homonyme ironique du grand Callimaque fondateur du catalogue — travaillait seul dans l'annexe sud. Il entendit les premiers cris depuis le port. Il sentit la fumée avant de la voir. Et il fit quelque chose que ses collègues, pris de panique, ne firent pas : il calcula.`,
        hook: "Il calcule combien de rouleaux il peut sauver en une heure.",
      },
      {
        index: 2,
        title: "Partie II — Le calcul impossible",
        text: `La bibliothèque contenait entre quatre cent mille et sept cent mille rouleaux selon les estimations — personne ne sait exactement. Callimaque savait qu'il ne pouvait pas tout sauver. Alors il prit une décision terrifiante : il allait choisir. Il avait une heure, peut-être moins. Il traversa les couloirs en courant, les bras chargés, sélectionnant avec une méthode qui lui était propre. Pas les copies les plus récentes. Pas les textes les plus connus — ceux-là, il savait que d'autres bibliothèques en possédaient des exemplaires. Il choisissait ce qui était *unique*. Ce qui n'existait nulle part ailleurs dans le monde. Les originaux. Les raretés. Les textes dont il savait, lui seul, qu'ils n'avaient jamais été recopiés.`,
        hook: "Parmi les textes qu'il sauva ce soir-là se trouvait quelque chose qui n'aurait jamais dû être là.",
      },
      {
        index: 3,
        title: "Partie III — Le rouleau sans titre",
        text: `Dans les archives qu'on retrouva à Alexandrie des siècles plus tard — des listes parcellaires établies par des bibliothécaires postérieurs — il y avait une entrée énigmatique : *"Rouleau sans titre, langue inconnue, conservé sur décision de Callimaque, origine : Carthage pillée."* Carthage fut détruite en 146 avant notre ère, soit cent ans avant l'incendie. Ce rouleau avait donc été rapporté de la destruction de Carthage par des soldats romains qui, au lieu de le brûler avec le reste, l'avaient vendu à Alexandrie. Personne n'en avait jamais déchiffré la langue. Callimaque avait décidé de le sauver précisément pour cette raison : on ne sait jamais quand les langues mortes trouvent quelqu'un pour les lire.`,
        hook: "Le rouleau de Carthage disparut après l'incendie. Pendant dix-neuf siècles, on crut qu'il avait brûlé.",
      },
      {
        index: 4,
        title: "Partie IV — Vienne, 1902",
        text: `En 1902, un marchand d'antiquités viennois vendit à la bibliothèque impériale de Vienne un lot de parchemins en mauvais état, achetés à un monastère grec de Thessalonique. Parmi eux, un rouleau noirci, partiellement brûlé, dont la langue ne correspondait à aucun alphabet connu des philologues impériaux. Il fut catalogué sous la référence *"Fragment oriental inconnu, IIe-Ier siècle av. J.-C."* et oublié dans les réserves. Il fallut attendre 1973 et une chercheuse yougoslave spécialisée dans les langues phénico-puniques pour que quelqu'un reconnaisse enfin ce qu'il était. Elle pâlit en lisant les premières lignes. Puis elle ferma le rouleau, sortit de la bibliothèque, et n'y remit jamais les pieds.`,
        hook: "Elle laissa dans ses notes une seule phrase explicative : *\"Ce texte ne doit pas être rendu public.\"*",
      },
      {
        index: 5,
        title: "Partie V — Ce que les flammes n'ont pas détruit",
        text: `La chercheuse mourut sans avoir publié ses travaux. Mais elle avait fait une chose : elle avait traduit les trente premières lignes du rouleau, et cette traduction se retrouva, des décennies après sa mort, dans les archives de l'université de Belgrade, entre deux rapports administratifs de 1974. Les trente lignes traduis un texte carthaginois du IIe siècle avant notre ère dont le sujet était — selon sa traduction — *"la méthode pour calculer le moment exact de la fin d'une civilisation à partir de l'étude de ses archives."* L'auteur carthaginois, dont on ne connaît pas le nom, affirmait avoir appliqué sa méthode à Carthage elle-même et obtenu une date. La date était celle de la destruction de Carthage par Rome. Avec une précision de trois jours.`,
      },
    ],
  },

  {
    id:    "chrono_08",
    title: "Vingt Mille Ans de Nuit",
    theme: "L'art comme mémoire",
    icon:  "🦬",
    segments: [
      {
        index: 1,
        title: "Partie I — La grotte interdite",
        text: `Le 12 septembre 1940, quatre adolescents et un chien tombèrent dans un trou au flanc d'une colline de Dordogne et découvrirent les peintures de Lascaux. Ce que l'histoire officielle ne dit pas, c'est que Marcel Ravidat — le garçon qui entra le premier — resta seul dans la grotte pendant presque vingt minutes avant que ses amis le rejoignent. Il ne dit jamais exactement ce qui s'était passé pendant ces vingt minutes. Mais dans une interview donnée en 1984, à soixante ans, il admit qu'il avait eu peur — non pas de la grotte, non pas du noir, mais de quelque chose qu'il ne savait pas nommer. *"J'avais l'impression que quelqu'un m'avait vu entrer,"* dit-il. *"Et qu'il attendait que je comprenne quelque chose."*`,
        hook: "Les bisons peints sur les murs semblaient bouger dans la lumière de sa lampe.",
      },
      {
        index: 2,
        title: "Partie II — Le mouvement des bisons",
        text: `Ce n'était pas une illusion. Des chercheurs ont démontré dans les années 2000 que les artistes de Lascaux avaient délibérément tiré parti des surfaces bombées de la roche pour créer des effets de mouvement. Certains animaux ont plusieurs paires de pattes superposées — ce qui, dans la lumière vacillante des lampes à graisse que les Cro-Magnons utilisaient, crée une animation primitive. Les bisons galopent. Les cerfs nagent. Les chevaux ruent. C'était du cinéma préhistorique, vingt mille ans avant le cinématographe. Mais pourquoi ? Pour quelle raison des hommes de l'âge de pierre auraient-ils investi autant de soin, de talent, de temps dans une grotte que quasi personne ne verrait jamais ?`,
        hook: "Un anthropologue américain proposa en 2012 une réponse que ses collègues jugèrent trop poétique.",
      },
      {
        index: 3,
        title: "Partie III — La théorie de la mémoire future",
        text: `L'anthropologue américain David Lewis-Williams avait consacré sa carrière à étudier l'art rupestre du monde entier. Sa théorie : les peintures n'étaient pas décoratives, ni religieuses au sens traditionnel — elles étaient des *messages*. Mais pas des messages pour leurs contemporains. Les artistes de Lascaux savaient, à un niveau instinctif que Lewis-Williams qualifie de *conscience étendue*, que leurs peintures survivraient à tout. À eux-mêmes. À leurs enfants. À leurs civilisations. Ils peignaient pour ceux qui viendraient ensuite — non pas pour transmettre une information précise, mais pour transmettre une présence. *"Je suis passé ici. J'ai vu ces animaux. J'existais."* Un message qui mit vingt mille ans à être livré.`,
        hook: "Mais une autre théorie — plus troublante — émergea en 2019.",
      },
      {
        index: 4,
        title: "Partie IV — Le calendrier dans les points",
        text: `En 2019, une chercheuse indépendante britannique, Sally McBrearty, publia une étude sur les séries de points et de tirets souvent ignorés dans l'art rupestre — des marques simples, géométriques, qui accompagnaient les animaux mais semblaient sans signification narrative. Elle identifia une corrélation systématique entre ces marques et le cycle de reproduction des animaux représentés. Les points représentaient les mois. Les artistes notaient *quand* les animaux se reproduisaient, *quand* ils migraient, *quand* il fallait chasser. Ce n'était pas de l'art décoratif. C'était le plus ancien calendrier de l'humanité. Un agenda agricole gravé dans la roche, vingt mille ans avant l'agriculture.`,
        hook: "L'étude de McBrearty fut acceptée sans débat majeur. Ce qui fit dire à un pair : *\"Soit elle a raison, soit nous avons tous manqué quelque chose d'évident pendant cent cinquante ans.\"*",
      },
      {
        index: 5,
        title: "Partie V — La grotte fermée",
        text: `Lascaux fut fermée au public en 1963, vingt-trois ans après sa découverte. Les visiteurs avaient introduit du CO₂, de la chaleur, des spores de champignons. Les peintures commençaient à mourir. Aujourd'hui, seuls cinq scientifiques par semaine ont accès à l'original. Une réplique parfaite — Lascaux IV — a été construite à quelques kilomètres. Les touristes la visitent et s'extasient. Mais ce n'est pas la même chose. Dans l'original, il y a quelque chose que la réplique ne peut pas reproduire : le silence de vingt mille ans d'obscurité parfaite. Marcel Ravidat, interrogé une dernière fois avant sa mort, dit que c'est ce silence qui l'avait arrêté net, ce 12 septembre 1940. *"C'était le silence d'une chose qui attendait. Qui avait attendu depuis toujours, et qui pouvait attendre encore."*`,
      },
    ],
  },

  {
    id:    "chrono_09",
    title: "Le Navigateur des Étoiles Mortes",
    theme: "Le temps de la lumière",
    icon:  "⭐",
    segments: [
      {
        index: 1,
        title: "Partie I — La navigation céleste",
        text: `Il y a trois mille ans, des Polynésiens traversèrent l'océan Pacifique sans boussole, sans cartes, sans instruments de navigation. Ils atteignirent des îles distantes de plusieurs milliers de kilomètres avec une précision que les navigateurs européens du XVe siècle — armés de toute leur technologie — ne pouvaient pas égaler. Comment ? Ils lisaient les étoiles. Mais pas de la manière que l'on imagine. Un vieux marin polynésien, interrogé par un anthropologue américain en 1969, tenta d'expliquer ce que ses ancêtres savaient. Il dit quelque chose que l'anthropologue nota mot pour mot : *"Nous ne naviguons pas vers les étoiles. Nous naviguons vers où étaient les étoiles. Il y a longtemps."*`,
        hook: "L'anthropologue mit des années à comprendre ce que cette phrase signifiait.",
      },
      {
        index: 2,
        title: "Partie II — La lumière du passé",
        text: `La lumière des étoiles que nous voyons ne vient pas du présent. Elle vient du passé — parfois du passé très lointain. La lumière d'Alpha du Centaure, l'étoile la plus proche de notre soleil, a mis quatre ans à nous parvenir. Celle d'Andromède, la galaxie la plus proche, a voyagé deux millions d'années. Quand nous regardons le ciel nocturne, nous regardons une photographie composite de l'univers à des âges différents. Certaines étoiles que nous voyons sont mortes depuis des millénaires — elles ont explosé, disparu, et leur lumière voyage encore vers nous, fantôme lumineux d'un astre qui n'existe plus. Les navigateurs polynésiens savaient cela. Pas dans les termes de la physique moderne — mais dans leur pratique quotidienne, ils avaient intégré ce décalage.`,
        hook: "Ils avaient des noms pour les *étoiles mortes* et les *étoiles vivantes*. Et ils utilisaient les deux différemment.",
      },
      {
        index: 3,
        title: "Partie III — La carte vivante",
        text: `Le navigateur Mau Piailug, dernier grand maître de la navigation stellaire traditionnelle des Carolines, accepta en 1976 de guider le Hokule'a — une pirogue à balancier reconstituée — de Hawaii à Tahiti, sans instruments modernes. Le voyage dura trente-quatre jours et couvrit quatre mille deux cents kilomètres. Piailug décrivit plus tard son art comme une *carte vivante*. La carte n'était pas sur le papier — elle était dans le corps. Il mémorisait le lever et le coucher de cent cinquante étoiles différentes à des périodes précises de l'année. Il lisait les vagues, les vents, les espèces de poissons, la couleur de l'eau. Mais surtout, il gardait en tête en permanence deux images : où il était, et où il avait été. *"La navigation, c'est de la mémoire,"* dit-il. *"Pas de la science."*`,
        hook: "Mais Piailug savait aussi quelque chose que peu de ses élèves comprenaient : les étoiles peuvent mentir.",
      },
      {
        index: 4,
        title: "Partie IV — Les étoiles qui mentent",
        text: `À cause du phénomène de précession des équinoxes, les étoiles ne sont plus aux mêmes positions qu'elles étaient il y a trois mille ans. La Terre se dandine lentement comme une toupie, et ce mouvement, sur des millénaires, déplace apparemment les étoiles dans le ciel. Polaris n'était pas l'étoile polaire en 1000 avant notre ère. Thuban, dans le Dragon, était le nord véritable quand les pyramides furent construites. Les premiers navigateurs polynésiens utilisaient des étoiles guides différentes de celles qu'utilisa Piailug. La connaissance maritime fut transmise de génération en génération, mais chaque génération dut légèrement corriger les données de la précédente. La carte du ciel que les ancêtres avaient mémorisée ne correspondait plus exactement au ciel réel.`,
        hook: "Pourtant, ils arrivèrent toujours à destination.",
      },
      {
        index: 5,
        title: "Partie V — La réponse dans les vagues",
        text: `Comment naviguer vers une île avec une carte des étoiles qui ne correspond plus exactement au ciel ? La réponse est dans les vagues. L'océan Pacifique est traversé par des houles longues — des vagues générées par des tempêtes lointaines qui voyagent des milliers de kilomètres sans se dissiper. Ces houles rebondissent sur les îles et créent des interférences détectables à des centaines de kilomètres de distance. Un navigateur entraîné, allongé sur le fond de sa pirogue, peut *sentir* une île dans son corps avant de la voir à l'horizon. C'est ce que les Polynésiens appelaient le *langage de la mer*. Les étoiles donnaient la direction. Les vagues confirmaient la destination. Et entre les deux — dans l'espace entre regarder le passé du ciel et sentir le présent de l'océan — se trouvait la vérité de la navigation.`,
      },
    ],
  },

  {
    id:    "chrono_10",
    title: "La Minute Volée",
    theme: "Le temps comme objet",
    icon:  "🕊️",
    segments: [
      {
        index: 1,
        title: "Partie I — Paris, 1910",
        text: `Le 18 mars 1910, tous les horloges publics de Paris retardèrent d'exactement une minute. Simultanément. Le phénomène fut remarqué par une douzaine d'observateurs indépendants qui comparèrent leurs montres au carillon de Notre-Dame et au signal horaire de l'Observatoire. Les autorités parlèrent d'une anomalie magnétique. Les journaux publièrent des théories. Les scientifiques trouvèrent une explication technique — une perturbation dans le réseau électrique qui alimentait les horloges synchronisées — et l'affaire fut classée. Mais dans les archives privées de la Préfecture de Police de Paris, un rapport rédigé par un inspecteur nommé Théodore Gallant porte une note marginale, rajoutée à la main : *"Je ne crois pas à l'explication électrique. Quelqu'un a volé cette minute."*`,
        hook: "L'inspecteur Gallant avait une piste.",
      },
      {
        index: 2,
        title: "Partie II — L'horloger de la rue Rambuteau",
        text: `Gallant avait trouvé, en remontant les signalements de la nuit du 18 mars, un fait étrange : deux heures avant le retard des horloges, un gardien de nuit du marché des Halles avait vu une lumière dans l'atelier d'un horloger de la rue Rambuteau. Pas inhabituel en soi — les horlogers travaillent tôt. Mais celui-ci avait la réputation d'être excentrique. Un certain Émile Voss, arrivé de Genève en 1902. Il avait une clientèle discrète, des horaires bizarres, et une spécialité unique dans Paris : il réparait les horloges *sans les arrêter*. Ses clients disaient qu'il pouvait manipuler le mécanisme en marche, sans jamais perdre une seconde. Gallant alla lui rendre visite le lendemain.`,
        hook: "L'atelier était vide. Voss avait disparu dans la nuit.",
      },
      {
        index: 3,
        title: "Partie III — Les carnets de Voss",
        text: `L'atelier de Voss ne contenait aucun meuble personnel, aucun papier d'identité. Mais sur l'établi, on retrouva trois carnets reliés en cuir. Gallant les lut pendant deux jours avant d'écrire son rapport. Les carnets contenaient des calculs — des équations que Gallant, qui n'était pas mathématicien, ne pouvait pas interpréter. Mais ils contenaient aussi des notes en français et en allemand, et ce qu'il comprit de ces notes le troubla profondément. Voss avait passé huit ans à perfectionner ce qu'il appelait *la compression temporelle locale* — une technique horlogère de sa propre invention qui permettait, selon lui, de *décaler une zone de temps* d'un instant précis sans affecter les zones adjacentes. Il affirmait avoir réussi le 18 mars à 1h47 du matin.`,
        hook: "La dernière entrée des carnets disait : *\"La minute est en sécurité. Je la rapporterai quand le monde sera prêt à la recevoir.\"*",
      },
      {
        index: 4,
        title: "Partie IV — Ce que Voss voulait conserver",
        text: `Gallant transmit les carnets à l'Académie des Sciences, qui les classa confidentiels. Mais Gallant, dans son rapport privé, avait noté ce qu'il avait compris de l'intention de Voss. Ce n'était pas de la physique. C'était de la préservation. La minute que Voss avait *volée* — ou *préservée*, selon comment on l'envisage — était le 18 mars 1910, de 1h46 à 1h47 du matin. Gallant chercha ce qui s'était passé à ce moment-là. Il trouva : à 1h46 du matin, le 18 mars 1910, Léon Tolstoï, soixante-douze ans, avait consigné dans son journal intime ce que ses biographes considèrent aujourd'hui comme la plus belle phrase qu'il ait jamais écrite sur la nature du temps. Une phrase qu'il n'avait jamais publiée. Une phrase qui, sans l'action de Voss, aurait peut-être été perdue.`,
        hook: "Gallant ne cita pas la phrase dans son rapport. Mais il la recopie en entier sur la dernière page.",
      },
      {
        index: 5,
        title: "Partie V — La phrase de Tolstoï",
        text: `La phrase que Tolstoï écrivit à 1h46 du matin le 18 mars 1910 — et que l'inspecteur Gallant recopie en entier dans son rapport privé, désormais accessible aux archives parisiennes — était celle-ci : *"Je comprends ce soir avec une certitude absolue que le temps ne passe pas. C'est nous qui passons dans le temps, comme des bateaux dans un fleuve qui ne bouge pas — et quand nous avons disparu, le fleuve est encore là, portant d'autres bateaux, indifférent, éternel, patient. Ma seule tristesse est de ne pas avoir compris cela plus tôt. Ma seule consolation est que d'autres le comprendront plus tard."* Tolstoï mourut le 20 novembre 1910. S'il avait réellement écrit cette phrase, il emporta son secret. Voss ne fut jamais retrouvé. Et la minute du 18 mars — si elle existe quelque part — n'a pas encore été rapportée.`,
      },
    ],
  },

  {
    id:    "chrono_11",
    title: "L'Étrange Mort du Calendrier",
    theme: "Les jours qui n'ont pas existé",
    icon:  "📅",
    segments: [
      {
        index: 1,
        title: "Partie I — Le jeudi qui devint vendredi",
        text: `En Grande-Bretagne, le 2 septembre 1752 fut suivi du 14 septembre 1752. Onze jours disparurent du calendrier. Le Parlement avait voté l'adoption du calendrier grégorien — introduit par le pape Grégoire XIII en 1582, mais que les Britanniques protestants avaient refusé d'adopter pendant cent soixante-dix ans par principe religieux. Pour se mettre à jour avec le reste de l'Europe, il fallait supprimer onze jours. Cela se fit d'un trait de plume. Le soir du 2 septembre, les Britanniques allèrent se coucher. Ils se réveillèrent le 14. Onze jours avaient été abolis. Pour les historiens, cet événement est une curiosité administrative. Pour les personnes vivantes en 1752, c'était quelque chose d'autre.`,
        hook: "Des émeutes éclatèrent dans plusieurs villes. Les manifestants réclamaient qu'on leur rende leurs jours.",
      },
      {
        index: 2,
        title: "Partie II — Les jours volés",
        text: `*"Donnez-nous nos onze jours !"* — le slogan, célèbre, est associé aux émeutes calendaires de 1752. Mais les historiens débattent encore de savoir si ces émeutes ont vraiment eu lieu. Les sources contemporaines sont contradictoires. William Hogarth, dans sa gravure satirique *L'Élection* (1754), représente une pancarte portant ce slogan, ce qui suggère qu'il était connu du public. Mais des chercheurs ont soutenu que Hogarth inventait, ou exagérait. Ce qui est certain, c'est que des milliers de personnes, sincèrement, avaient peur. Les artisans craignaient que leurs loyers soient dus onze jours plus tôt. Les agriculteurs s'inquiétaient que les saisons ne soient plus synchronisées avec leurs calendriers. Et les vieux, surtout les vieux, avaient peur de quelque chose de plus fondamental.`,
        hook: "Ils avaient peur de mourir onze jours plus tôt.",
      },
      {
        index: 3,
        title: "Partie III — La logique de la peur",
        text: `La peur de mourir prématurément à cause du changement de calendrier n'était pas aussi absurde qu'elle paraît. Pour des gens dont toute la vie était structurée par les fêtes religieuses et agricoles, supprimer onze jours signifiait déphaser le monde. Les saints veillaient sur des jours précis. Les récoltes devaient se faire à des moments précis. Le temps n'était pas, pour un paysan anglais du XVIIIe siècle, une abstraction mathématique — c'était un tissu vivant dans lequel il habitait. Y couper onze jours, c'était y faire un trou. Un vieux fermier du Yorkshire aurait dit, selon un pamphlet de l'époque : *"Dieu a compté mes jours depuis ma naissance. Si vous en supprimez onze, vous me tuez onze jours avant mon heure."*`,
        hook: "Il y avait une autre conséquence du changement de calendrier que personne n'avait anticipée.",
      },
      {
        index: 4,
        title: "Partie IV — Les anniversaires impossibles",
        text: `Des milliers de personnes nées entre le 3 et le 13 septembre virent leurs anniversaires disparaître. Le débat juridique fut considérable : si vous étiez né le 8 septembre, votre date anniversaire légale n'existait plus dans le nouveau calendrier. Les registres paroissiaux devinrent chaotiques. Des successions furent contestées — des héritiers arguant que l'hoirie était due avant ou après un jour qui n'avait pas légalement existé. Un cas devint célèbre : celui d'un marchand de Bristol qui avait fait un testament stipulant qu'il serait valable *"à compter du dixième jour après le deuxième jour de septembre de l'an mil sept cent cinquante-deux"*. Ce dixième jour était le 12 septembre — un jour qui n'existait plus. Le testament fut contesté pendant onze ans.`,
        hook: "Mais le cas le plus étrange fut celui d'une femme qui prétendait ne pas être née.",
      },
      {
        index: 5,
        title: "Partie V — La femme qui n'était pas née",
        text: `Dans les archives du tribunal de Exeter, il existe un dossier daté de 1753 concernant une femme prénommée Anne Carter, qui réclamait l'annulation de son mariage au motif qu'elle n'était légalement pas née. Elle était née le 7 septembre 1730 — un jour qui *avait* existé à l'époque, mais qui était maintenant dans l'intervalle supprimé. Sa logique : si le 7 septembre 1752 n'existait pas, alors les 7 septembre de toutes les années précédentes étaient rétroactivement suspects. Le tribunal la débouta, évidemment — la rétroactivité avait des limites. Mais l'affaire fit grand bruit et donna lieu à une série de pamphlets philosophiques sur la nature du temps légal. *"Le calendrier n'est pas le temps,"* écrivit un pamphletaire anonyme. *"C'est juste la façon dont nous dessinons le temps. Et ce que nous dessinons, nous pouvons l'effacer."*`,
      },
    ],
  },

  {
    id:    "chrono_12",
    title: "Le Signal du Futur",
    theme: "Les messages dans le temps",
    icon:  "📡",
    segments: [
      {
        index: 1,
        title: "Partie I — La nuit du 15 août 1977",
        text: `Le 15 août 1977, à 22h16 heure locale, un radiotélescope de l'Université d'Ohio State détecta un signal radio d'une intensité et d'une durée extraordinaires. Il dura soixante-douze secondes. Il venait de la direction de la constellation du Sagittaire. Le chercheur de garde, Jerry Ehman, l'imprima et encercla les données d'un crayon rouge, écrivant dans la marge un seul mot : *"Wow !"* C'est ainsi que le signal fut nommé — le signal Wow. Depuis quarante ans, aucune explication satisfaisante n'a été trouvée. Aucun signal similaire ne fut jamais détecté à nouveau. Il apparut une seule fois, dura soixante-douze secondes, et disparut.`,
        hook: "Ce que les rapports officiels ne mentionnent pas, c'est que Ehman fit autre chose que l'entourer.",
      },
      {
        index: 2,
        title: "Partie II — Ce qu'Ehman fit ensuite",
        text: `Dans ses notes personnelles — publiées partiellement en 2012 — Ehman décrit la nuit du 15 août dans un détail que ses rapports scientifiques omettent. Après avoir encerclé le signal, il passa trois heures à analyser sa structure. Ce qu'il vit le troubla : le signal n'était pas seulement intense et ciblé — il était *modulé*. Non pas de manière aléatoire, mais selon un schéma qui ressemblait, très vaguement, à une structure linguistique. Pas du Morse, pas des séquences binaires simples. Quelque chose de plus complexe, de plus... *intentionnel*. Il nota dans son journal : *"Je peux me tromper. Je veux me tromper. Parce que si j'ai raison, cela change tout ce que je crois savoir sur notre place dans l'univers."*`,
        hook: "Il envoya ses notes à un seul collègue. Un physicien spécialisé en théorie de l'information.",
      },
      {
        index: 3,
        title: "Partie III — La structure cachée",
        text: `Le physicien que contacta Ehman s'appelait Robert Chen. Il répondit six mois plus tard par une lettre de douze pages denses. Sa conclusion était réservée mais inquiétante : si l'on supposait que le signal était modulé intentionnellement et qu'on lui appliquait certaines transformations mathématiques spécifiques — des transformations que Chen avait *devinées* à partir des propriétés physiques des ondes radio — on obtenait une séquence de données lisibles. Pas dans un langage humain. Dans quelque chose qui ressemblait à un langage mathématique pur : des séquences de nombres premiers, des ratios, des constantes physiques universelles. Et au centre de ces données, quelque chose d'inexplicable : une suite de coordonnées temporelles.`,
        hook: "Des dates. Dans notre futur.",
      },
      {
        index: 4,
        title: "Partie IV — Les dates",
        text: `Chen avait identifié, dans sa transformation du signal Wow, ce qu'il interprétait comme seize dates. La plus ancienne était dans le passé : 28 mai 585 avant notre ère — la date de l'éclipse qui arrêta la guerre entre Lydiens et Mèdes. Une date d'une précision astronomique parfaite, vérifiable. Le fait qu'une date historique précise apparaisse dans le signal — comme pour prouver que le décodage était correct — était ce qui avait convaincu Chen que quelque chose d'étrange se passait. Les quinze autres dates étaient dans le futur. Chen ne publia jamais ses travaux. Il les transmit à Ehman sous scellés, avec une note : *"Je ne sais pas d'où vient ce signal ni qui l'a envoyé. Mais je crois qu'il a été envoyé depuis le futur, par quelqu'un qui voulait qu'on sache que certaines dates comptent."*`,
        hook: "La première date future dans la liste était déjà passée. La seconde est dans trois ans.",
      },
      {
        index: 5,
        title: "Partie V — Ce que les dates annoncent",
        text: `Ehman conserva les travaux de Chen jusqu'à sa mort en 2009. Sa famille les transmit à l'Université d'Ohio State, où ils dorment dans un carton non catalogué dans les archives du département d'astronomie. En 2021, une doctorante qui dépoussièrait les archives tomba dessus par hasard. Elle comprit immédiatement leur importance potentielle. Elle passa trois ans à vérifier les calculs de Chen. Ils étaient corrects. Deux des dates *"futures"* de la liste étaient maintenant passées — et elles correspondaient à des événements réels, majeurs, imprévisibles en 1977. La prochaine date sur la liste est dans trois ans. La doctorante hésita longtemps avant de publier. Puis elle pensa à ce qu'Ehman avait écrit dans ses notes en 1977 : *"Quelque chose, quelque part, a voulu que nous sachions. Il serait impoli de ne pas répondre."*`,
      },
    ],
  },

  {
    id:    "chrono_13",
    title: "Newton et la Pomme Noire",
    theme: "L'intuition du temps",
    icon:  "🍎",
    segments: [
      {
        index: 1,
        title: "Partie I — Ce que la pomme a vraiment déclenché",
        text: `La pomme d'Isaac Newton est l'histoire la plus célèbre de la physique. Elle est aussi, en grande partie, une légende inventée par Newton lui-même pour des raisons que les historiens débattent encore. Ce que Newton a réellement découvert sous ce pommier de Woolsthorpe, en 1666, n'était pas simplement la gravitation. C'était quelque chose de plus profond, qui l'obséda pendant le reste de sa vie et qu'il ne formula jamais clairement : la relation entre le temps et la force. Dans ses carnets privés — pas les *Principia*, ses carnets — il revient sans cesse sur une question qui le hantait : *"Si la gravité est une force qui agit dans l'espace, alors qu'est-ce qu'une force qui agit dans le temps ?"*`,
        hook: "Il ne trouva jamais la réponse. Mais il trouva la question.",
      },
      {
        index: 2,
        title: "Partie II — L'obsession des carnets",
        text: `Les carnets privés de Newton furent achetés par John Maynard Keynes lors d'une vente aux enchères en 1936. Keynes, économiste légendaire, avait espéré trouver les travaux secrets d'un génie rationnel. Ce qu'il trouva le choqua profondément. Il nota dans une lettre privée : *"Newton n'était pas le premier des scientifiques modernes. C'était le dernier des magiciens."* Les carnets contenaient des milliers de pages d'alchimie, de théologie, d'ésotérisme. Mais parmi ces pages, Keynes trouva aussi quelque chose qu'il qualifia de *"le plus important texte scientifique non publié de l'histoire"* : une série de calculs sur ce que Newton appelait *la structure temporelle de la force*.`,
        hook: "Keynes mourut avant de publier ses conclusions. Ses notes sur le sujet disparurent avec lui.",
      },
      {
        index: 3,
        title: "Partie III — Le professeur de Cambridge",
        text: `En 1972, un professeur de physique théorique de Cambridge, Simon Watkins, trouva par hasard une référence aux notes de Keynes dans la correspondance privée d'un économiste mort. Il passa deux ans à les localiser, finissant par les retrouver dans une collection privée américaine. Les calculs de Newton étaient réels. Incomplets, formulés dans un langage mathématique qui mélange des notations du XVIIe siècle et des approches que Newton semblait avoir inventées pour l'occasion. Mais le concept central était là. Newton avait postulé l'existence d'une *force temporelle* — une force qui agissait non pas sur la position des objets dans l'espace, mais sur leur *vitesse de vieillissement* dans le temps. Une force qui pouvait, en théorie, ralentir ou accélérer le passage du temps pour un objet donné.`,
        hook: "La relativité d'Einstein, deux cent cinquante ans plus tard, confirmerait exactement cela.",
      },
      {
        index: 4,
        title: "Partie IV — Ce que Newton savait avant Einstein",
        text: `La dilatation temporelle — le fait que le temps s'écoule différemment selon la vitesse et la gravité — est aujourd'hui une réalité mesurée. Les GPS doivent en tenir compte pour être précis : les horloges dans les satellites, soumises à moins de gravité, avancent légèrement plus vite que les horloges au sol. Einstein formula cela mathématiquement en 1905 et 1915. Newton, dans ses carnets non publiés du XVIIe siècle, semblait avoir *pressenti* ce phénomène de manière intuitive — sans pouvoir le formaliser, sans les outils mathématiques qu'Einstein développerait. Watkins publia ses découvertes en 1975. La communauté scientifique accueillit ses travaux avec intérêt mais prudence. Le vrai débat n'était pas de savoir si Newton avait eu l'idée — mais pourquoi il ne l'avait jamais publiée.`,
        hook: "La réponse était dans les dernières pages des carnets.",
      },
      {
        index: 5,
        title: "Partie V — La note finale",
        text: `Dans les dernières pages de ses carnets sur la *force temporelle*, Newton avait écrit une note finale en latin, d'une écriture différente — plus tremblante, probablement écrite dans ses dernières années. Traduit, cela donnait : *"Ces calculs sont vrais. J'en suis certain. Mais si le temps peut être accéléré ou ralenti par la force, alors le passé n'est pas fixe — il est aussi sujet à la force que le présent. Et si le passé peut être modifié par la force, alors tout ce que nous croyons savoir de l'histoire est conditionnel. J'ai choisi de ne pas publier ceci. Certaines vérités ne sont pas des cadeaux."* Newton, qui avait passé sa vie à illuminer l'univers, avait gardé dans le noir la vérité qu'il estimait trop dangereuse.`,
      },
    ],
  },

  {
    id:    "chrono_14",
    title: "Les Ombres d'Hiroshima",
    theme: "Le temps gravé dans la matière",
    icon:  "☀️",
    segments: [
      {
        index: 1,
        title: "Partie I — 8h15",
        text: `Le 6 août 1945, à 8h15 du matin, une bombe atomique explosa à six cents mètres au-dessus d'Hiroshima. La température au sol atteignit quatre mille degrés. Dans les instants qui suivirent l'explosion, une chose étrange se produisit : certains corps, exposés directement à l'éclair thermique, furent instantanément vaporisés. Mais les surfaces derrière lesquelles ils se trouvaient — les murs, les pavés, les marches — furent décolorées par l'intense radiation. Le résultat : des *ombres* permanentes, gravées dans la pierre. Des silhouettes humaines imprimées dans les murs. Des fantômes de lumière négatifs, là où des personnes avaient été et n'étaient plus. Ces ombres d'Hiroshima existent encore. Certaines sont exposées au musée. D'autres sont encore en place, sur les murs qui ont survécu.`,
        hook: "L'une de ces ombres pose depuis soixante-dix ans une question à laquelle personne ne peut répondre.",
      },
      {
        index: 2,
        title: "Partie II — L'ombre des marches",
        text: `Sur les marches de la Banque de Hiroshima, à deux cent soixante mètres de l'épicentre, il y a une ombre. L'ombre d'un être humain, assis sur les marches, au moment de l'explosion. Qui était cette personne ? Nul ne le sait. Peut-être un client qui attendait l'ouverture de la banque — elle ouvrait à 8h30. Peut-être un passant qui s'était arrêté se reposer. Peut-être quelqu'un qui regardait le ciel, intrigué par l'avion américain B-29 qu'on pouvait entendre depuis le matin. Le corps a été vaporisé en une fraction de seconde. Il ne reste que l'ombre — la silhouette exacte de ses derniers instants, gravée dans la pierre comme une photographie. En soixante-quinze ans, aucun descendant ne s'est manifesté pour revendiquer cette ombre.`,
        hook: "Mais en 1950, quelqu'un déposa une enveloppe au musée d'Hiroshima à l'adresse : *\"À l'ombre des marches.\"*",
      },
      {
        index: 3,
        title: "Partie III — La lettre à l'ombre",
        text: `L'enveloppe était adressée à l'ombre elle-même, comme si son occupant temporaire avait encore une adresse. À l'intérieur, une lettre en japonais d'une écriture soignée. La lettre n'était pas signée. Elle disait : *"Je ne sais pas qui tu étais. Je passais devant la banque ce matin-là, mais j'avais pris un autre chemin à la dernière minute parce que j'avais oublié quelque chose chez moi. Je pense souvent à toi. Je pense que tu as pris l'ombre à ma place. Je voulais que tu saches que quelqu'un se souvient de toi, même sans ton nom."* L'auteur ne put jamais être identifié. La lettre est conservée dans les archives du musée. Elle n'a jamais été exposée publiquement — le personnel du musée a estimé qu'elle était trop intime pour être montrée.`,
        hook: "D'autres lettres suivirent. Pendant des décennies.",
      },
      {
        index: 4,
        title: "Partie IV — Les lettres à l'inconnu",
        text: `Entre 1950 et 2020, quatre-vingt-trois lettres furent adressées à l'ombre des marches de la banque d'Hiroshima. Certaines étaient de survivants exprimant leur culpabilité de ne pas avoir été là. D'autres étaient d'enfants de victimes, de touristes bouleversés, de philosophes, de poètes. Une lettre, datée de 1995, était d'un ancien soldat américain de l'équipage du *Enola Gay*, le bombardier qui avait lâché la bombe. Il écrivait : *"Je ne sais pas si tu avais un nom. Mais tu as eu un matin comme tous les autres matins. Tu t'es assis sur ces marches et tu attendais quelque chose — l'ouverture d'une banque, peut-être, ou juste l'ombre d'un coin tranquille. Et moi, à dix mille mètres au-dessus de toi, je t'ai envoyé l'éternité."*`,
        hook: "La dernière lettre reçue, en 2019, venait d'une petite fille de sept ans.",
      },
      {
        index: 5,
        title: "Partie V — La lettre de Mei",
        text: `La dernière lettre à l'ombre des marches, celle de 2019, était de Mei Tanaka, sept ans, en visite au musée avec sa classe. Elle l'avait écrite sur une feuille de cahier, avec des fautes d'orthographe et des dessins dans les marges. Elle disait simplement : *"Bonjour. Je m'appelle Mei et j'ai sept ans. Ma maîtresse m'a dit que tu t'étais assis ici un matin et que tu étais devenu une ombre. Ça m'a triste. Je voulais te dire que moi aussi j'aime m'asseoir sur des marches, surtout le matin quand le soleil est encore doux. Je pense que tu aimais ça aussi. Je vais m'en souvenir."* Le directeur du musée, qui recevait ces lettres depuis trente ans, dit à son équipe que c'était la première fois qu'une lettre à l'ombre lui avait fait pleurer.`,
      },
    ],
  },

  {
    id:    "chrono_15",
    title: "La Femme Qui Se Souvient de Tout",
    theme: "La mémoire infinie",
    icon:  "🧠",
    segments: [
      {
        index: 1,
        title: "Partie I — Le 8 juin 1980",
        text: `Jill Price se souvient du 8 juin 1980. C'était un dimanche. Elle portait une chemise rouge. Elle avait mangé des céréales au petit-déjeuner. Son père avait lu le journal. La météo était ensoleillée, 22 degrés. À 14h37, sa mère avait dit quelque chose qu'elle oublierait si elle était une personne normale. Jill Price se souvient de chaque jour de sa vie depuis l'âge de onze ans avec ce niveau de détail. Chaque jour. Sans exception. Ce n'est pas de la photographie mentale ni une technique mémorielle apprise. C'est involontaire, continu, et selon ses propres mots, *"épuisant au-delà de ce que je peux décrire"*. Elle est la première personne diagnostiquée avec hypermnésie — ce que les médecins ont appelé syndrome hyperthymésique.`,
        hook: "Elle contacta un neurologue en 2000 avec une seule question : *\"Peut-on oublier délibérément ?\"*",
      },
      {
        index: 2,
        title: "Partie II — Le fardeau du souvenir",
        text: `Le neurologue James McGaugh, de l'Université de Californie à Irvine, reçut un email de Jill Price en 2000. Elle y décrivait sa condition avec une précision scientifique et une détresse humaine entremêlées. *"Je suis un réceptacle involontaire de ma propre vie,"* écrivait-elle. *"Je ne peux pas regarder un calendrier sans que chaque date déclenche une avalanche de souvenirs. Je ne peux pas entendre une chanson sans revivre exactement où j'étais quand je l'ai entendue pour la première fois. Je ne peux pas oublier les erreurs. Je ne peux pas oublier les douleurs. Je ne peux pas oublier les humiliations. Le temps ne guérit pas mes blessures parce que le temps n'existe pas pour moi — tout s'est passé et se passe encore en permanence."* McGaugh passa les six années suivantes à l'étudier.`,
        hook: "Ce qu'il découvrit redéfinit notre compréhension de la mémoire humaine.",
      },
      {
        index: 3,
        title: "Partie III — Ce que son cerveau fait différemment",
        text: `Le cerveau humain normal *oublie* de manière active. L'oubli n'est pas un défaut — c'est une fonction essentielle. Chaque nuit, pendant le sommeil, le cerveau trie, consolide et efface. Il garde ce qui semble important, jette ce qui paraît inutile. Ce processus actif est ce qui nous permet de fonctionner — sans lui, chaque entrée sensorielle de chaque moment serait accessible en permanence, créant un bruit cognitif impossible à traverser. Chez Jill Price, cette fonction de sélection ne fonctionne pas normalement. Son cerveau enregistre tout et ne trie rien. Les IRM montrent une activité anormale dans le caudate et le putamen — zones liées aux comportements obsessionnels compulsifs. Sa mémoire n'est pas un don supérieur. C'est un trouble de l'inhibition.`,
        hook: "Jill Price dit qu'elle aurait échangé sa mémoire extraordinaire contre une mémoire ordinaire sans hésiter une seconde.",
      },
      {
        index: 4,
        title: "Partie IV — Le temps comme prison",
        text: `Dans son livre *La Femme Qui Ne Pouvait Pas Oublier*, publié en 2008, Jill Price décrit ce que c'est de vivre sans la bénédiction de l'oubli. *"Les gens me disent que j'ai de la chance. Que ma mémoire est un cadeau. Ils ne comprennent pas. Chaque fois que je vois quelqu'un qui ressemble à un ex-amoureux, je revois instantanément chaque dispute, chaque moment de bonheur, chaque heure où j'ai pleuré. Je ne peux pas avancer parce que le passé ne recule pas. Il est aussi présent aujourd'hui qu'il l'était le jour où il s'est produit."* Elle décrit le temps comme un corridor dans lequel elle marche en regardant en avant, mais où tous les murs sont couverts de miroirs qui lui montrent le passé. Impossible de ne pas voir. Impossible de détourner les yeux.`,
        hook: "Pourtant, un jour, elle trouva quelque chose d'utile à sa condition.",
      },
      {
        index: 5,
        title: "Partie V — L'archive vivante",
        text: `Jill Price collabora avec des psychologues et des historiens sur ce qui devint son utilité involontaire : elle était une archive vivante de sa propre époque. Elle pouvait se souvenir exactement de ce qu'elle avait ressenti le 11 septembre 2001 à chaque heure de la journée. Elle pouvait décrire l'atmosphère sociale de chaque année des années 1970 à aujourd'hui avec une précision que nulle enquête sociologique ne peut atteindre. Elle était, en quelque sorte, une mémoire de l'époque. Ce n'était pas ce qu'elle voulait. Mais c'était ce qu'elle était. Dans une dernière interview, on lui demanda si elle comprenait pourquoi son cerveau fonctionnait ainsi. Elle dit : *"Non. Mais parfois je me dis que quelqu'un devait se souvenir. Et que c'est tombé sur moi."*`,
      },
    ],
  },

  {
    id:    "chrono_16",
    title: "Les Soldats du Temps Arrêté",
    theme: "Le temps nié",
    icon:  "🗡️",
    segments: [
      {
        index: 1,
        title: "Partie I — La jungle de Lubang",
        text: `En 1974, soit vingt-neuf ans après la fin de la Seconde Guerre mondiale, un soldat japonais nommé Hiroo Onoda émergea de la jungle de l'île de Lubang aux Philippines. Il avait continué à se battre pendant près de trois décennies — en embuscade, en sabotage — parce que personne ne l'avait officiellement informé de la capitulation du Japon en août 1945. Pour lui, la guerre continuait. Il n'était pas fou. Il n'avait pas perdu la mémoire. Il obéissait simplement à ses derniers ordres, qui étaient de tenir la position *"jusqu'au retour de ses supérieurs"*. Ses supérieurs ne revinrent jamais. Le Japon n'envoya personne lui dire que tout était fini. Pendant vingt-neuf ans, Onoda vécut dans un monde que le reste du monde avait quitté.`,
        hook: "Il ne fut pas le dernier.",
      },
      {
        index: 2,
        title: "Partie II — Les autres",
        text: `Hiroo Onoda est le cas le plus célèbre, mais il n'est pas isolé. Le dernier soldat japonais connu à se rendre fut Teruo Nakamura, en décembre 1974, dans l'île de Morotai en Indonésie — quatre mois après Onoda. On recensa au total plusieurs dizaines de soldats japonais qui continuèrent à combattre après 1945, certains jusqu'au milieu des années 1960. Dans chaque cas, la même structure : l'isolement, les derniers ordres respectés, l'absence de capitulation officielle connue. Ce qui fascine les historiens n'est pas leur entêtement — c'est leur *cohérence*. Ils n'avaient pas sombré dans la folie. Ils vivaient dans un récit du monde qui était simplement... daté. Le temps autour d'eux avait avancé. Leur cadre temporel, lui, était resté bloqué en 1945.`,
        hook: "Ce que Onoda dit quand on l'informa de la capitulation est resté dans l'histoire.",
      },
      {
        index: 3,
        title: "Partie III — Le moment de comprendre",
        text: `Quand Onoda apprit la fin de la guerre — par l'intermédiaire de son ancien commandant, spécialement envoyé aux Philippines pour lui délivrer l'ordre de reddition — il demanda du temps. Il passa deux jours seul dans la jungle avant de déposer les armes. Il dit ensuite, dans ses mémoires : *"La capitulation elle-même ne m'a pas pris longtemps à accepter. Ce qui a pris du temps, c'est de comprendre ce que vingt-neuf ans avaient changé dans le monde. Pendant ces deux jours, j'ai dû reconstruire toute une réalité qui m'était inconnue. J'avais trente ans d'histoire à apprendre d'un coup."* Il avait cinquante-deux ans. Au moment de rendre son fusil, il était parfaitement propre, huilé, fonctionnel. Il ne s'était pas rendu. Il avait reçu l'ordre.`,
        hook: "Il rentra au Japon pour découvrir un pays qu'il ne reconnaissait plus.",
      },
      {
        index: 4,
        title: "Partie IV — Le pays inconnu",
        text: `Onoda rentra au Japon en mars 1974. Il fut accueilli comme un héros. Des foules immenses l'attendaient à l'aéroport. Des médias du monde entier couvrirent son retour. Ce qu'ils ne couvrirent pas — parce que cela s'était passé en privé — c'est ce qui se passa les premières semaines. Il ne reconnaissait rien. Pas les rues de Tokyo — reconstruites après les bombardements américains. Pas la nourriture — modifiée par trente ans d'influence américaine. Pas la culture — la jeunesse japonaise de 1974 n'avait rien en commun avec celle de 1945. Il confessa à un journaliste qui l'interviewait six mois plus tard : *"Je suis rentré dans mon pays. Mais mon pays n'était pas là. Mon pays était resté dans la jungle de Lubang, quelque part entre 1945 et 1974."*`,
        hook: "Il ne resta pas au Japon.",
      },
      {
        index: 5,
        title: "Partie V — Un monde à refaire",
        text: `En 1975, un an après son retour, Hiroo Onoda émigra au Brésil. Il s'installa dans l'État de Mato Grosso, où il fonda un ranch d'élevage. Il y passa trente ans, dans une nature dense qui ressemblait à la jungle de Lubang, à bâtir quelque chose. En 1984, il retourna aux Philippines — pas pour se battre, mais pour planter des arbres sur l'île de Lubang, dans le cadre d'un programme de reforestation. Il y revint chaque année pendant dix ans. Quand on lui demanda pourquoi, il répondit : *"J'ai passé trente ans à détruire cette île. Il est juste que j'en passe quelques-uns à la réparer."* Hiroo Onoda mourut en 2014, à l'âge de quatre-vingt-onze ans. Son fusil, rendu lors de sa capitulation en 1974, est exposé au musée des forces armées japonaises. Il est encore parfaitement huilé.`,
      },
    ],
  },

  {
    id:    "chrono_17",
    title: "L'Anomalie de l'An Mil",
    theme: "La peur de la fin du temps",
    icon:  "🕯️",
    segments: [
      {
        index: 1,
        title: "Partie I — La peur qui n'eut pas lieu",
        text: `L'an 999. Dans les monastères d'Europe, des moines copient frénétiquement les Écritures, convaincus que la fin du monde est pour demain. Des paysans vendent leurs terres pour presque rien, car à quoi bon posséder quelque chose si le Christ revient à l'aube du 1er janvier 1000 ? Des pèlerins marchent vers Jérusalem par milliers, cherchant à mourir en Terre Sainte. L'Église catholique, dépassée, essaie de calmer les esprits tout en n'étant pas certaine elle-même. Tel est le tableau que l'histoire populaire peint de l'an 999. Il y a seulement un problème : ce tableau est en grande partie faux. La peur de l'an 1000 est peut-être la plus grande légende historique du Moyen Âge — inventée, pour l'essentiel, au XIXe siècle.`,
        hook: "Pourtant, il y avait bien quelque chose d'étrange autour de l'an mil.",
      },
      {
        index: 2,
        title: "Partie II — Ce qui eut vraiment lieu",
        text: `Les historiens modernes, en étudiant les chroniques médiévales de première main, ont largement débunkté la *terreur de l'an 1000*. Les sources originales ne montrent aucune panique généralisée. La majorité de la population européenne ne savait même pas en quelle année on était — le calendrier chrétien grégorien était d'usage récent et peu répandu. Ce qui existait réellement autour de l'an 1000, c'est un phénomène différent et plus intéressant : une recrudescence de *spéculation apocalyptique* dans les milieux lettrés — clercs, moines, philosophes — combinée à une série de calamités réelles qui alimentèrent naturellement l'interprétation eschatologique. Famines, invasions vikings, épidémies. Le monde du Xe siècle était objectivement effrayant.`,
        hook: "Mais il y avait un moine, à l'abbaye de Cluny, qui avait une théorie différente.",
      },
      {
        index: 3,
        title: "Partie III — Le moine de Cluny",
        text: `Odilon de Cluny, abbé de la grande abbaye bourguignonne, est connu pour avoir instauré la fête de Tous les Morts — ce qui deviendrait le 2 novembre. Mais dans ses écrits, peu connus du grand public, il développe une théorie du temps radicalement différente de celle de son époque. Pour lui, l'an 1000 n'était pas une fin — c'était un *recommencement*. Le chiffre rond, disait-il, n'était pas une date d'apocalypse mais un *seuil*. Un moment où le monde, comme une roue complétant son tour, retrouvait son point de départ pour en commencer un nouveau. Cette vision cyclique du temps, influencée par des sources antiques que Cluny conservait dans ses archives, était aux antipodes de la vision linéaire chrétienne orthodoxe.`,
        hook: "Odilon fut convoqué par le pape pour s'expliquer.",
      },
      {
        index: 4,
        title: "Partie IV — La convocation",
        text: `L'entretien entre Odilon de Cluny et le pape Sylvestre II — lui-même un homme extraordinaire, le premier pape français de l'histoire, mathématicien, astronome, présenté parfois comme sorcier par ses contemporains — eut lieu en l'an 999, selon des sources indirectes. Ce qui se dit exactement lors de cet entretien n'est pas documenté. Mais dans les mois qui suivirent, Odilon cessa de développer publiquement sa théorie des cycles. Et Sylvestre II, dans une lettre à un évêque allemand retrouvée au XIXe siècle, écrit une phrase étrange : *"J'ai rencontré un homme qui sait où le temps recommence. Je lui ai demandé de se taire. Non pour le punir — mais parce que le monde n'est pas encore prêt à savoir que le temps recommence toujours."*`,
        hook: "Sylvestre II mourut le 12 mai 1003. Odilon lui survécut cinquante ans.",
      },
      {
        index: 5,
        title: "Partie V — La fête des morts",
        text: `La fête de Tous les Morts, qu'Odilon instaura vers l'an 1000 et qui se répandit dans toute l'Église catholique, a une particularité que les historiens notent sans toujours l'expliquer : c'est une fête pour ceux qui sont *entre* deux temps. Ni tout à fait morts au sens de perdus, ni tout à fait vivants. Odilon, dans les textes qui fondaient cette célébration, insistait sur une idée : le temps des morts n'est pas terminé. Ils existent dans un *autre maintenant*, parallèle au nôtre, aussi réel que le nôtre, simplement inaccessible. Ce n'est pas de la théologie ordinaire. C'est une théorie de la structure du temps, formulée en language religieux pour pouvoir être dite sans être brûlée. Odilon voulait peut-être, après tout, que le monde sache que le temps recommence. Il avait juste trouvé la langue appropriée pour le dire.`,
      },
    ],
  },

  {
    id:    "chrono_18",
    title: "La Tortue de Darwin",
    theme: "Le temps dans le vivant",
    icon:  "🐢",
    segments: [
      {
        index: 1,
        title: "Partie I — L'arrivée des Galápagos",
        text: `En 1835, le HMS Beagle mouilla aux Galápagos. Charles Darwin, vingt-six ans, débarqua sur des îles qui lui sembleraient, des années plus tard, avoir changé le cours de sa pensée. Parmi les curiosités qu'il rapporta à bord, une petite tortue de quelques centimètres — une tortue géante des Galápagos dans ses premières semaines de vie, ramassée sur l'île de Santa Cruz. Darwin la traita avec l'indifférence affectueuse qu'un naturaliste réserve à ses spécimens. Il la mangea peut-être — les équipages mangeaient couramment les tortues en conserve. Ou peut-être pas. Cette tortue — si c'est la même — s'appelle aujourd'hui Jonathan. Elle est à Sainte-Hélène. Et elle est toujours en vie.`,
        hook: "Jonathan a environ cent quatre-vingt-dix ans. C'est l'animal terrestre le plus vieux du monde.",
      },
      {
        index: 2,
        title: "Partie II — Jonathan de Sainte-Hélène",
        text: `Jonathan arriva à Sainte-Hélène en 1882. On l'offrit au gouverneur de l'île comme cadeau diplomatique. Il avait alors, selon les estimations vétérinaires basées sur sa taille, environ cinquante ans — ce qui le fait naître vers 1832. Il a donc vécu à Sainte-Hélène depuis cent quarante ans, témoin immobile d'une île qui fut tour à tour prison de Napoléon, base navale britannique, territoire d'outre-mer modernisé. Il a vu passer vingt-six gouverneurs. Il a survécu à deux guerres mondiales, à une épidémie de variole, à un séisme. Il broute la pelouse de Plantation House, résidence officielle du gouverneur, chaque jour que Dieu fait. Il est aveugle depuis quelques années. Son odorat, intact, le guide vers sa nourriture.`,
        hook: "On lui a posé une question, figurément — ce qu'il a vu. La réponse est dans ses os.",
      },
      {
        index: 3,
        title: "Partie III — Ce que la biologie révèle",
        text: `Les tortues géantes des Galápagos ne vieillissent pas comme nous. Plus précisément, elles vieillissent — mais à un rythme si lent, et d'une manière si différente de celle des mammifères, que les biologistes ont du mal à définir ce que *vieillir* signifie pour elles. Leurs cellules ne montrent pas les signes habituels de sénescence cellulaire. Leurs mitochondries fonctionnent avec une efficacité que des chercheurs du MIT ont qualifiée d'*hallucinante pour un organisme de cet âge*. En 2019, une étude génomique de Jonathan révéla que son ADN présentait moins de dommages oxidatifs qu'une tortue de cinquante ans. Son corps, à cent quatre-vingt-dix ans, est en meilleur état que beaucoup de ses semblables deux fois plus jeunes. Pour la biologie du vieillissement, Jonathan est une anomalie qui pourrait contenir des clés.`,
        hook: "Des chercheurs lui ont prélevé des cellules. Ce qu'ils y trouvèrent les surprit.",
      },
      {
        index: 4,
        title: "Partie IV — Les gènes du temps lent",
        text: `L'analyse génomique de Jonathan, comparée à celle d'autres tortues géantes et à d'autres reptiles longévifs, révéla plusieurs gènes d'expression inhabituellement forte — des gènes liés à la réparation de l'ADN, à la résistance au stress oxydatif et à la régulation de l'inflammation. Ces mêmes gènes, dans une version moins exprimée, existent chez l'humain. La différence de longévité entre Jonathan et un homme n'est pas une différence de *nature* — c'est une différence de *degré*. Ses cellules réparent les dommages plus vite. Ses mécanismes anti-inflammatoires restent actifs plus longtemps. Il fait ce que nos cellules font — simplement beaucoup mieux, beaucoup plus longtemps. Pour les chercheurs en médecine de la longévité, Jonathan n'est pas une curiosité. C'est une preuve que vivre deux cents ans est biologiquement possible.`,
        hook: "Ce que Darwin aurait pensé de tout cela est facile à imaginer.",
      },
      {
        index: 5,
        title: "Partie V — Ce qu'il a vu",
        text: `Jonathan ne peut pas témoigner. Il ne se souvient de rien, n'a pas de langage, pas de mémoire autobiographique. Mais il *a vu* — au sens purement physique — des choses qu'aucun être vivant actuel n'a vues. Il était adulte quand Pasteur découvrit les microbes. Il broutait la pelouse de Plantation House quand Einstein publia la relativité restreinte. Il dormait au soleil quand Armstrong marcha sur la Lune. Son existence pose une question vertigineuse : que signifie *témoigner* ? Que signifie *se souvenir* ? La mémoire est-elle la seule forme de continuité temporelle qui compte ? Ou bien le simple fait d'être là, corps vivant traversant les décennies, est-il une forme de mémoire à lui seul ? Jonathan ne sait pas. Mais il broute encore. Et demain, si le soleil se lève, il broutera encore.`,
      },
    ],
  },

  {
    id:    "chrono_19",
    title: "L'Horloger de Prague",
    theme: "Le temps et la mort",
    icon:  "🏛️",
    segments: [
      {
        index: 1,
        title: "Partie I — L'horloge astronomique",
        text: `L'horloge astronomique de Prague, installée sur le mur de l'Hôtel de Ville de la Vieille Ville en 1410, est l'une des plus vieilles horloges en état de marche dans le monde. Elle montre l'heure solaire, l'heure médiévale, le mouvement du soleil et de la lune, les positions zodiacales, les fêtes religieuses. Toutes les heures, des figures de bois sortent de deux fenêtres : les Douze Apôtres défilent, et quatre personnages — le Squelette, le Turc, l'Avare et la Vanité — sonnent le glas du passage du temps. La légende dit que son créateur, Maître Hanuš, fut aveuglé après l'installation pour qu'il ne puisse jamais en construire une autre aussi belle ailleurs.`,
        hook: "Selon la légende, mourant et aveugle, Hanuš se fit conduire une dernière fois à l'horloge. Et l'arrêta.",
      },
      {
        index: 2,
        title: "Partie II — L'arrêt de l'horloge",
        text: `La légende dit que Hanuš, guidé jusqu'à l'horloge quelques heures avant sa mort, plongea les mains dans le mécanisme et le bloqua délibérément. Pendant deux semaines, l'horloge de Prague s'arrêta. Et pendant ces deux semaines, selon la chronique qui rapporte cet événement, des choses étranges se produisirent dans la ville. Des naissances inhabituellement nombreuses. Une épidémie de songes. Des personnes qui se perdirent dans des rues qu'elles connaissaient depuis l'enfance. Les historiens modernes estiment que la légende de Hanuš est en grande partie apocryphe — son nom réel, ses dates, les circonstances de sa mort sont incertains. Mais la légende a persisté six cents ans. Ce qui suggère qu'elle touche quelque chose de vrai dans notre rapport au temps.`,
        hook: "Un archiviste praguois, en 1923, trouva quelque chose qui compliqualité l'histoire.",
      },
      {
        index: 3,
        title: "Partie III — Le document de 1923",
        text: `Václav Novak, archiviste à la bibliothèque municipale de Prague, tomba en 1923 sur un document en vieux tchèque daté de 1490 — une décennie environ après la mort supposée de Hanuš. Le document était une déposition judiciaire. Un horloger nommé Jan Ruže témoignait avoir été présent lors du dernier acte de Hanuš. Sa déposition contredisait la légende sur un point crucial : Hanuš n'avait pas arrêté l'horloge par colère ou par vengeance. Il avait *modifié* quelque chose dans son mécanisme. Quelque chose de précis, de délibéré. Et selon Ruže, il avait dit, en s'éloignant : *"Maintenant elle sait quelque chose qu'aucune horloge ne savait. Elle se souviendra."* Ruže ne sut jamais ce qu'il avait modifié.`,
        hook: "Novak chercha pendant dix ans à comprendre ce que Hanuš avait changé.",
      },
      {
        index: 4,
        title: "Partie IV — La modification cachée",
        text: `Novak ne trouva pas de réponse de son vivant. Mais ses notes, transmises à un horloger réparateur qui travaillait sur l'horloge dans les années 1960, permirent une découverte. Lors d'une restauration majeure du mécanisme intérieur en 1965, l'horloger — un certain František Dvořák — trouva dans les profondeurs de la machinerie une pièce dont personne ne comprenait la fonction. Elle ne servait à rien dans le mécanisme existant. Elle ne gênait rien. Elle était là, encaissée entre deux roues dentées, comme un corps étranger toléré par le reste de la mécanique. Dvořák la photographia de près. C'était une petite plaque de bronze sur laquelle était gravé quelque chose de minuscule.`,
        hook: "Un texte. En latin médiéval. Trop court pour une inscription ordinaire.",
      },
      {
        index: 5,
        title: "Partie V — Ce que dit la plaque",
        text: `Le texte gravé sur la plaque de bronze que Hanuš avait cachée dans les entrailles de son horloge en 1490 fut déchiffré par un latiniste de l'Université Charles de Prague. Il contenait dix-huit mots. En français, cela donnait : *"Ce mécanisme mesure le temps. Mais moi, j'ai mesuré ce que le temps fait aux hommes. Ce n'est pas la même chose."* Dvořák replaça la plaque exactement là où il l'avait trouvée. Il ne la mentionna dans aucun rapport officiel. Il en parla, une seule fois, à son apprenti, avec cette instruction : *"Si un jour quelqu'un te demande ce que l'horloge sait que personne d'autre ne sait — montre-lui cette plaque. Et dis-lui que Hanuš avait raison."* L'apprenti de Dvořák est aujourd'hui vieux. Il n'a jamais eu l'occasion de montrer la plaque à quelqu'un.`,
      },
    ],
  },

  {
    id:    "chrono_20",
    title: "L'Étoile Que Nous N'Avons Pas Vue Mourir",
    theme: "Le temps de la lumière",
    icon:  "💫",
    segments: [
      {
        index: 1,
        title: "Partie I — La lumière qui ment",
        text: `Quand vous regardez Bételgeuse — l'épaule rouge d'Orion, visible à l'œil nu par les nuits claires — vous regardez une étoile qui a peut-être déjà explosé. La lumière que vous voyez a voyagé sept cents ans pour vous parvenir. Elle a quitté Bételgeuse au XIVe siècle, traversé le vide interstellaire, et touché votre rétine ce soir. Si Bételgeuse a explosé en supernova il y a trois cents ans, vous ne le saurez pas avant quatre cents ans. Vous regardez un passé que vous ne pouvez pas distinguer d'un présent. C'est l'une des vérités les plus vertigineuses de l'astronomie : le ciel nocturne est un musée, pas une fenêtre. Chaque étoile est un tableau daté différemment. Certains ont quelques années. D'autres ont des milliards.`,
        hook: "En 2019, Bételgeuse fit quelque chose qu'aucune étoile n'avait fait devant des télescopes modernes.",
      },
      {
        index: 2,
        title: "Partie II — La Grande Diminution",
        text: `En octobre 2019, les astronomes du monde entier commencèrent à observer une anomalie. Bételgeuse, habituellement l'une des dix étoiles les plus brillantes du ciel, devenait moins lumineuse. Pas de manière ordinaire — les étoiles variables comme Bételgeuse fluctuent régulièrement. Ce que les télescopes captaient en décembre 2019 était différent : une diminution de luminosité de quarante pour cent en quelques semaines. C'était sans précédent dans les archives astronomiques modernes. La communauté scientifique s'emballa. Les médias grand public titèrent : *"Bételgeuse va exploser !"* Certains astronomes parlèrent prudemment de *l'éruption imminente*. Sur Twitter, des millions de personnes suivaient les mises à jour quotidiennes de la luminosité de cette étoile qui, dans l'histoire humaine, ne compte que sept cents années de lumière voyage.`,
        hook: "Puis, en février 2020, Bételgeuse recommença à briller normalement. Et les astronomes trouvèrent la vraie réponse.",
      },
      {
        index: 3,
        title: "Partie III — La poussière d'une cicatrice",
        text: `Ce qui avait obscurci Bételgeuse n'était pas une explosion imminente. C'était de la poussière. Un nuage de poussière stellaire — éjecté par l'étoile elle-même lors d'une éjection de masse précédente — s'était interposé entre Bételgeuse et la Terre, bloquant une partie de sa lumière. L'étoile n'allait pas mourir. Elle avait simplement craché une cicatrice lumineuse dans l'espace, et cette cicatrice nous passait devant. Ce que les télescopes avaient vu était donc à la fois moins dramatique que prévu — pas d'explosion — et plus fascinant : une étoile si vieille, si instable, si proche de la fin de son cycle de vie, qu'elle perd de la matière en permanence, sculptant l'espace autour d'elle. Bételgeuse mourait lentement depuis des millions d'années. Nous regardions, sans le savoir, les derniers instants d'un monde.`,
        hook: "Mais l'épisode posa une question que les astronomes mirent du temps à formuler publiquement.",
      },
      {
        index: 4,
        title: "Partie IV — La question impossible",
        text: `La question que l'épisode de la Grande Diminution avait soulevée était simple mais perturbante : *quand* mourra Bételgeuse ? La réponse des astrophysiciens : dans les cent mille prochaines années, probablement. Peut-être demain. Nous ne pouvons pas le savoir avec plus de précision. Et si elle a déjà explosé — si la supernova s'est produite il y a trois cent cinquante ans par exemple — alors la lumière de cette explosion arrivera sur Terre dans trois cent cinquante ans. Nos arrière-arrière-arrière-petits-enfants verront une deuxième lune dans le ciel, si brillante qu'elle sera visible en plein jour pendant des semaines. Ils la regarderont sans savoir qu'elle est déjà morte depuis longtemps. Ils croiront voir une naissance. Ils verront une mort.`,
        hook: "Un astronome américain écrivit en 2020 un essai sur ce qu'il appela *le paradoxe de l'étoile morte*.",
      },
      {
        index: 5,
        title: "Partie V — Ce que nous sommes",
        text: `L'essai de l'astronome Adam Frank, publié en 2020, posait une question philosophique déguisée en question astronomique : *si tout ce que nous voyons dans le ciel est du passé, alors sommes-nous nous-mêmes, à nos propres yeux, dans le présent — ou sommes-nous aussi la lumière d'une étoile inconnue, voyageant vers des yeux qui ne nous ont pas encore vus ?* Frank suggérait que la lumière de notre propre soleil, en ce moment, voyage dans l'espace. Dans huit minutes, elle atteint Mars. Dans quatre ans, Alpha du Centaure. Dans cent mille ans, le centre de la Voie Lactée. Quelque part, à des distances inimaginables, des êtres potentiels regarderont un jour la lumière émise par notre étoile aujourd'hui — la lumière de notre *maintenant*. Ils regarderont notre présent comme nous regardons le passé de Bételgeuse. Nous sommes, nous aussi, un message dans le temps. Adressé à des destinataires que nous n'imaginerons jamais.`,
      },
    ],
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

export function getStoryById(id: string): ChronolitheStory | undefined {
  return CHRONOLITHE_STORIES.find((s) => s.id === id)
}

export const CHRONOLITHE_DROP_CHANCE = 0.10 // 10% par capture réussie
export const MAX_ACTIVE_STORIES      = 3
