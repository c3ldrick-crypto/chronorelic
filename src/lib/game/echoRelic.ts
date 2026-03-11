// RELIQUE ÉCHO — Two voices across time, converging in shared human truth

export interface EchoFragment {
  index: number
  text: string
  hint: string
}

export interface EchoVoice {
  name: string
  period: string
  color: string
  fragments: EchoFragment[]
}

export interface EchoStory {
  id: string
  title: string
  icon: string
  voiceA: EchoVoice
  voiceB: EchoVoice
  convergenceTitle: string
  convergenceText: string
}

export interface EchoDropResult {
  storyId: string
  storyTitle: string
  storyIcon: string
  voice: "A" | "B"
  fragment: EchoFragment
  fragmentsA: number
  fragmentsB: number
  isFirstFragment: boolean
  isConvergence: boolean
}

export const ECHO_DROP_CHANCE = 0.08
export const ECHO_FRAGMENTS_PER_VOICE = 4

export const ECHO_STORIES: EchoStory[] = [
  {
    id: "echo_01",
    title: "L'Écho de la Peste",
    icon: "🐀",
    voiceA: {
      name: "Frère Anselmo",
      period: "Florence, 1347",
      color: "#3b82f6",
      fragments: [
        {
          index: 1,
          text: "Les cloches ne s'arrêtent plus. Hier c'était le vieux Marco, aujourd'hui la petite Agnese. Je tiens sa main jusqu'à la fin — c'est tout ce que Dieu me permet encore d'offrir.",
          hint: "Les cloches sonnent sans cesse",
        },
        {
          index: 2,
          text: "On dit que cela vient de l'Est, sur les navires de Gênes. Mes frères fuient le couvent. Moi je reste. Si le Seigneur rappelle ses serviteurs, qu'il me trouve à l'ouvrage.",
          hint: "La peur pousse ses frères à fuir",
        },
        {
          index: 3,
          text: "J'ai noué un linge de lin sur mon visage pour approcher les mourants. Cela ne sert peut-être à rien. Mais si un regard humain peut adoucir le passage, alors ce linge est ma prière.",
          hint: "Un linge sur le visage, une prière",
        },
        {
          index: 4,
          text: "Ce matin j'ai souri à un enfant à travers mes yeux — seule partie de moi visible. Il a souri en retour. Dans ce sourire, Florence existait encore. Dans ce sourire, j'ai compris pourquoi je reste.",
          hint: "Un sourire traversant le masque",
        },
      ],
    },
    voiceB: {
      name: "Sarah Okonkwo",
      period: "Lagos, 2020",
      color: "#f59e0b",
      fragments: [
        {
          index: 1,
          text: "Le couloir de l'unité Covid sent le désinfectant et quelque chose que je ne sais pas nommer. Ce matin, vingt lits. Ce soir, dix-huit. Je compte. Je ne peux pas m'en empêcher.",
          hint: "Elle compte les survivants chaque soir",
        },
        {
          index: 2,
          text: "Ma mère m'appelle pour savoir si je rentre. Je lui dis oui bientôt. Je mens. Aucun de nous ne sait quand cela finira. On enfile nos blouses et on revient le lendemain matin.",
          hint: "Un mensonge doux dit à sa mère",
        },
        {
          index: 3,
          text: "On ne peut plus toucher les patients comme avant. Alors je me penche et je parle doucement près de l'oreille. Les mots traversent le plastique. L'intention, elle, passe toujours.",
          hint: "Les mots traversent la visière",
        },
        {
          index: 4,
          text: "Un vieil homme m'a regardée dans les yeux au-dessus de son masque et a ri — un vrai rire, faible mais réel. J'ai ri aussi. Pour un instant, l'hôpital a disparu. Juste deux humains qui rient.",
          hint: "Deux humains qui rient malgré tout",
        },
      ],
    },
    convergenceTitle: "La Même Mort Invisible",
    convergenceText:
      "Six siècles les séparent, mais Anselmo et Sarah ont tenu les mêmes mains tremblantes, porté le même masque sur le visage, et découvert la même vérité : que même face à une mort qu'on ne peut voir, le regard humain demeure la seule médecine que nulle épidémie ne peut confisquer.",
  },
  {
    id: "echo_02",
    title: "L'Écho du Soldat",
    icon: "🪖",
    voiceA: {
      name: "Henri Dupont",
      period: "Verdun, 1916",
      color: "#3b82f6",
      fragments: [
        {
          index: 1,
          text: "La boue ici a une odeur que je ne pourrai jamais décrire à Madeleine. Elle est faite de tout ce que la terre a absorbé. Je lui écris ce soir. Je ne lui enverrai pas cette lettre.",
          hint: "Une lettre qu'il n'enverra jamais",
        },
        {
          index: 2,
          text: "Gaston chante à voix basse quand il croit que personne n'écoute. Ce soir il a chanté La Marseillaise si doucement que c'était presque une berceuse. Nous avons tous fait semblant de dormir.",
          hint: "Une berceuse nationale dans la nuit",
        },
        {
          index: 3,
          text: "Il y a un silence avant l'assaut qui est différent de tous les autres silences. Les oiseaux le connaissent. Les rats aussi. Tout le monde s'immobilise. Même la guerre retient son souffle.",
          hint: "Le silence que les rats reconnaissent",
        },
        {
          index: 4,
          text: "Je pense à notre jardin. Les tomates que papa taillait en juillet. Le bruit des ciseaux dans le feuillage vert. Si je rentre, je passerai des heures dans ce jardin. Je ne ferai rien d'autre.",
          hint: "Les tomates du jardin familial",
        },
      ],
    },
    voiceB: {
      name: "Carlos Reyes",
      period: "Vietnam, 1968",
      color: "#f59e0b",
      fragments: [
        {
          index: 1,
          text: "J'ai commencé une lettre pour ma mère à Tucson. Troisième tentative ce mois-ci. Je la range dans ma poche. Les mots que je veux écrire n'existent pas encore dans aucune langue.",
          hint: "Des mots qui n'existent dans aucune langue",
        },
        {
          index: 2,
          text: "Rodriguez fredonnait quelque chose hier soir — une chanson que sa grand-mère lui apprenait. On était six à faire semblant de ne pas entendre. On écoutait tous. C'est comme ça qu'on survit.",
          hint: "Faire semblant de ne pas entendre",
        },
        {
          index: 3,
          text: "Avant l'embuscade la jungle se tait d'une façon précise. Les singes s'arrêtent. Les oiseaux s'arrêtent. L'air s'épaissit. Le corps sait avant le cerveau. J'ai appris à faire confiance au corps.",
          hint: "La jungle se tait avant l'embuscade",
        },
        {
          index: 4,
          text: "Je pense au base-ball. Au bruit du gant qui attrape la balle. Mon père me l'avait appris dans le parc derrière la maison. Ce bruit. Ce bruit simple. Si je rentre, je veux juste entendre ce bruit.",
          hint: "Le bruit d'une balle dans un gant",
        },
      ],
    },
    convergenceTitle: "Les Lettres Non Envoyées",
    convergenceText:
      "Henri et Carlos ne se sont jamais rencontrés — cinquante ans et un océan les séparent. Pourtant ils ont écrit les mêmes lettres impossibles, entendu le même silence avant la mort, et rêvé tous deux d'un geste simple et doux dans un jardin de paix. La guerre invente des soldats différents. L'amour de la vie les rend identiques.",
  },
  {
    id: "echo_03",
    title: "L'Écho de l'Artiste",
    icon: "🎨",
    voiceA: {
      name: "Michel-Ange",
      period: "Rome, 1512",
      color: "#3b82f6",
      fragments: [
        {
          index: 1,
          text: "Quatre ans sur le dos. Mes doigts ne se ferment plus complètement le matin. Le plâtre m'a mangé les mains. Et pourtant je regarde en haut et quelque chose là-haut me regarde en retour.",
          hint: "Quatre ans les yeux au plafond",
        },
        {
          index: 2,
          text: "Le Pape est venu voir. Il a regardé longtemps sans parler. Puis il est parti. Je ne sais pas s'il a vu ce que j'ai voulu dire. Je ne sais plus ce que j'ai voulu dire. L'œuvre sait mieux que moi.",
          hint: "Le Pape regarde en silence",
        },
        {
          index: 3,
          text: "J'ai peint Dieu tendant la main vers Adam et j'ai compris que je peignais quelque chose que je n'avais pas le droit de regarder en face. Comme fixer le soleil. Alors j'ai détourné les yeux et j'ai peint.",
          hint: "Peindre sans oser regarder",
        },
        {
          index: 4,
          text: "Ce travail m'a pris quelque chose que je ne retrouverai pas. Je ne saurais nommer ce que c'est. Mais dans ce vide qu'il a laissé, il y a quelque chose de grand et de froid comme une cathédrale vide.",
          hint: "Un vide en forme de cathédrale",
        },
      ],
    },
    voiceB: {
      name: "Mark Rothko",
      period: "New York, 1969",
      color: "#f59e0b",
      fragments: [
        {
          index: 1,
          text: "Je peins seul depuis des mois. Mes assistants ont cessé de comprendre ce que je veux. Moi aussi j'ai cessé de comprendre. Mais les couleurs savent. Je leur fais confiance maintenant plus qu'à moi.",
          hint: "Les couleurs savent mieux que lui",
        },
        {
          index: 2,
          text: "Un critique a dit que mes tableaux étaient vides. Je lui ai répondu que les gens qui pleurent devant eux savent qu'ils ne le sont pas. Il n'a pas compris. Je n'ai pas insisté.",
          hint: "Des gens pleurent devant le vide",
        },
        {
          index: 3,
          text: "Il y a quelque chose dans le rouge et le noir que je cherche depuis des années. Un bord. Quelque chose de l'ordre d'un abîme que l'on regarde de trop près. Je m'en approche encore. Je ne peux pas m'arrêter.",
          hint: "Un abîme qu'on regarde de trop près",
        },
        {
          index: 4,
          text: "Cette peinture m'a coûté tout ce que j'avais. Chaque toile a prélevé quelque chose. Je ne regrette rien. Mais le silence dans l'atelier ce soir est immense. Comme si les murs avaient absorbé ma voix.",
          hint: "L'atelier a absorbé sa voix",
        },
      ],
    },
    convergenceTitle: "Le Prix de l'Infini",
    convergenceText:
      "Michel-Ange et Rothko ont tous deux touché quelque chose qui n'a pas de nom. Tous deux ont senti que l'art leur prenait plus qu'il ne leur donnait — et tous deux ont continué. Car ce vide que l'œuvre laisse n'est pas un manque : c'est la preuve qu'on a, l'espace d'un instant, regardé au-delà du monde visible.",
  },
  {
    id: "echo_04",
    title: "L'Écho du Vieux Sage",
    icon: "🦁",
    voiceA: {
      name: "Léonard de Vinci",
      period: "Amboise, 1519",
      color: "#3b82f6",
      fragments: [
        {
          index: 1,
          text: "Je relis mes carnets depuis l'aube. Des milliers de pages. Des machines jamais construites, des visages jamais peints. Le temps m'a volé plus qu'il ne m'a accordé. Et pourtant je ne lui en veux pas.",
          hint: "Des milliers de pages jamais finies",
        },
        {
          index: 2,
          text: "Ma main droite ne dessine plus. Je la regarde le matin comme un outil étranger. Mais les yeux, eux, voient encore tout. Peut-être que c'était toujours les yeux l'essentiel.",
          hint: "La main ne dessine plus, les yeux voient",
        },
        {
          index: 3,
          text: "Le roi François est venu s'asseoir près de moi ce soir. Nous n'avons pas parlé. Cela n'était pas nécessaire. Il a tenu ma main un moment. C'est ainsi que se termine une vie bien remplie — dans le silence d'un ami.",
          hint: "Un roi silencieux tenant sa main",
        },
        {
          index: 4,
          text: "J'aurais voulu vivre trois cents ans. Pas pour la gloire — pour finir. Pour voir si le vol de l'oiseau pouvait être compris jusqu'au bout. Je meurs avec la question intacte. C'est peut-être cela, la vraie réponse.",
          hint: "Mourir avec la question intacte",
        },
      ],
    },
    voiceB: {
      name: "Pablo Picasso",
      period: "Mougins, 1972",
      color: "#f59e0b",
      fragments: [
        {
          index: 1,
          text: "Quatre-vingt-dix ans et je peins encore chaque matin avant que la lumière change. Mes ennemis attendaient que je m'arrête. Je ne m'arrête pas. La mort devra venir me chercher au travail.",
          hint: "La mort devra venir le chercher au travail",
        },
        {
          index: 2,
          text: "Mon œil gauche voit moins bien. Je peins de mémoire autant que de vision. Peut-être que c'est mieux ainsi. La mémoire garde ce que l'œil oublie. Elle peint ce qui compte vraiment.",
          hint: "Peindre de mémoire autant que de vision",
        },
        {
          index: 3,
          text: "Jacqueline m'a demandé pourquoi je travaille autant à mon âge. Je lui ai dit que c'est la seule chose qui fasse sens. Le reste — la gloire, l'argent, même l'amour — ce sont des accessoires. L'art est le seul fait.",
          hint: "L'art comme seul fait véritable",
        },
        {
          index: 4,
          text: "Le temps est mon ennemi et mon seul allié. Il m'a tout pris — la souplesse, les amis, les certitudes. Et il m'a laissé l'urgence. Cette urgence qui me fait lever avant l'aube. Sans elle je ne serais rien.",
          hint: "L'urgence que le temps lui a laissée",
        },
      ],
    },
    convergenceTitle: "L'Ennemi et l'Allié",
    convergenceText:
      "Léonard et Picasso ont tous deux couru contre le temps et tous deux ont compris que cette course était le sens même de l'existence. L'un est mort avec ses questions, l'autre avec ses pinceaux. Mais ni l'un ni l'autre ne s'est arrêté. Car l'art n'est pas ce qu'on produit — c'est la raison pour laquelle on se lève le matin quand tout le reste s'effondre.",
  },
  {
    id: "echo_05",
    title: "L'Écho de la Mère",
    icon: "🕯️",
    voiceA: {
      name: "Livia",
      period: "Rome, 79 ap. J.-C.",
      color: "#3b82f6",
      fragments: [
        {
          index: 1,
          text: "La montagne gronde depuis l'aube. Les bêtes ont fui la nuit dernière. Mon fils Marcus dit que c'est Vulcain qui forge. Je lui ai dit oui, c'est Vulcain. Il faut bien que quelqu'un forge les étoiles.",
          hint: "Vulcain qui forge les étoiles",
        },
        {
          index: 2,
          text: "Le ciel à l'Est est devenu rouge puis noir en quelques heures. Les voisins courent vers la mer. J'ai pris la main de Flavia dans la mienne. Elle avait quatre ans ce printemps. Sa main est si petite.",
          hint: "Une petite main dans la sienne",
        },
        {
          index: 3,
          text: "Les cendres tombent comme une neige grise et tiède. Flavia les attrape et rit. Je lui ai dit que c'était la neige des dieux. Elle a ouvert la bouche pour en attraper. J'ai détourné son visage doucement.",
          hint: "La neige des dieux qu'il ne faut pas goûter",
        },
        {
          index: 4,
          text: "Quand le mur de nuit est arrivé, j'ai mis mes mains sur les yeux de Flavia et je l'ai serrée contre moi. Elle n'a pas vu. Elle ne verra pas. Ce que les yeux n'ont pas vu, le cœur peut guérir.",
          hint: "Des mains sur les yeux d'un enfant",
        },
      ],
    },
    voiceB: {
      name: "Hana Novak",
      period: "Prague, 1944",
      color: "#f59e0b",
      fragments: [
        {
          index: 1,
          text: "Ils frappent aux portes depuis ce matin. J'entends les bottes dans l'escalier. Tereza est cachée derrière les livres au fond de l'armoire. Elle a six ans. Elle croit que c'est un jeu. Laisse-la le croire.",
          hint: "Un jeu dans l'armoire derrière les livres",
        },
        {
          index: 2,
          text: "J'ai mis ma main sur la bouche de Tereza quand ils ont frappé à notre porte. Elle a compris que ce n'était plus un jeu. Ses yeux m'ont posé une question que je n'ai pas répondu. Certaines réponses ne doivent pas exister pour les enfants.",
          hint: "Une question dans des yeux d'enfant",
        },
        {
          index: 3,
          text: "Ils sont partis. Pour l'instant. Tereza tremble dans mes bras. Je lui chante la chanson que ma mère me chantait. Ma voix tremble aussi. Elle ne s'en aperçoit pas. Ou peut-être qu'elle fait semblant.",
          hint: "Une chanson dont la voix tremble",
        },
        {
          index: 4,
          text: "Si nous survivons à ce soir, je lui apprendrai à nager l'été prochain dans la rivière. Je le lui promets en silence, la tenant contre moi. Quand les bottes repassent dans le couloir, je mets les mains sur ses yeux. Doucement.",
          hint: "Des mains douces sur les yeux",
        },
      ],
    },
    convergenceTitle: "Le Même Geste Traversant les Âges",
    convergenceText:
      "Deux mères, dix-neuf siècles d'écart, la même catastrophe différente. Toutes deux ont mis leurs mains sur les yeux de leur enfant pour que le monde finissant ne laisse pas son empreinte dans les pupilles trop jeunes. Ce geste — les paumes sur les yeux d'un enfant — est peut-être le plus vieux geste humain qui soit. La protection absolue. L'amour sans parole.",
  },
]

export function getEchoStory(id: string): EchoStory | undefined {
  return ECHO_STORIES.find((story) => story.id === id)
}

export function getRandomEchoStory(): EchoStory {
  return ECHO_STORIES[Math.floor(Math.random() * ECHO_STORIES.length)]
}
