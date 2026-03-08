import Anthropic from "@anthropic-ai/sdk"
import { Rarity, CharacterClass } from "@/types"
import { StaticEvent } from "@/lib/game/events"

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

interface NarrationInput {
  minute: string
  rarity: Rarity
  characterClass: CharacterClass
  event?: StaticEvent | null
  isBlessedMinute?: boolean
  isSecretMinute?: boolean
  playerName?: string
  hasLoreEnrichi?: boolean  // Talent lore_enrichi
}

const RARITY_TONE: Record<Rarity, string> = {
  COMMUNE:    "bref et factuel, 1-2 phrases",
  RARE:       "intriguant et légèrement mystérieux, 2-3 phrases",
  EPIQUE:     "dramatique et évocateur, 3-4 phrases",
  LEGENDAIRE: "épique et poétique, 4-5 phrases avec métaphores temporelles",
  MYTHIQUE:   "cosmique, prophétique, bouleversant. 5-6 phrases. Utilise des métaphores du temps, de l'éternité, des dimensions parallèles.",
}

const CLASS_STYLE: Record<CharacterClass, string> = {
  CHRONOMANCER: "Du point de vue d'un maître du temps qui perçoit les probabilités comme des fils lumineux.",
  ARCHIVISTE:   "Du point de vue d'un érudit passionné par l'histoire, avec des détails historiques précis.",
  CHASSEUR:     "Du point de vue d'un chasseur de l'instant, vif et percutant, plein d'adrénaline.",
  ORACLE:       "Du point de vue d'un oracle mystique qui voit le passé et le futur simultanément.",
}

export async function generateNarration(input: NarrationInput): Promise<string> {
  const { minute, rarity, characterClass, event, isBlessedMinute, isSecretMinute, playerName, hasLoreEnrichi } = input

  const tone = RARITY_TONE[rarity]
  const style = CLASS_STYLE[characterClass]
  const playerRef = playerName ? `Le joueur s'appelle ${playerName}.` : ""

  let contextInfo = ""
  if (event) {
    contextInfo = `Cette minute est liée à l'événement historique : "${event.title}" (${event.year}) — ${event.description}`
    if (hasLoreEnrichi) {
      contextInfo += ` Curiosité : ${event.curiosity}`
    }
  } else {
    contextInfo = `Il est ${minute}. Aucun événement historique majeur connu pour cette minute précise.`
  }

  const specialContext = [
    isBlessedMinute   ? "C'est une MINUTE BÉNIE pour ce joueur — un moment personnel et sacré." : "",
    isSecretMinute    ? "C'est une MINUTE SECRÈTE — un palindrome temporel ou une heure miroir magique." : "",
    rarity === "MYTHIQUE" ? "UNE ANOMALIE TEMPORELLE vient de se produire ! C'est extraordinairement rare." : "",
  ].filter(Boolean).join(" ")

  const prompt = `Tu es le narrateur mystérieux de ChronoRelic, un RPG où le temps devient une ressource magique.

CONTEXTE :
${contextInfo}
${specialContext}
Rareté capturée : ${rarity}
${playerRef}

STYLE DE NARRATION :
${style}
Ton : ${tone}
Langue : français
Format : texte narratif direct, sans titre, sans bullet points.

Génère une narration immersive et ${rarity === "MYTHIQUE" ? "spectaculaire" : "évocatrice"} pour la capture de la minute ${minute}.`

  try {
    const message = await anthropic.messages.create({
      model:      "claude-opus-4-6",
      max_tokens: hasLoreEnrichi ? 400 : 200,
      messages: [
        { role: "user", content: prompt }
      ],
    })

    const content = message.content[0]
    if (content.type === "text") {
      return content.text.trim()
    }
    return defaultNarration(minute, rarity)
  } catch {
    return defaultNarration(minute, rarity)
  }
}

function defaultNarration(minute: string, rarity: Rarity): string {
  const narrations: Record<Rarity, string> = {
    COMMUNE:    `L'instant ${minute} glisse entre vos doigts comme du sable. Une relique ordinaire, mais chaque grain compte.`,
    RARE:       `${minute}... Cette minute cache quelque chose. Une vibration subtile vous traverse — l'écho d'un moment qui compte.`,
    EPIQUE:     `Le temps frémit à ${minute}. Les fils de la réalité se tendent, puis se distordent. Cette relique porte en elle un fragment d'histoire qui refuse d'être oublié.`,
    LEGENDAIRE: `À ${minute}, le tissu du temps se déchire brièvement. Une lumière dorée en émane — la trace d'un instant qui a changé le cours des choses. Vous tenez entre vos mains un éclat de destin.`,
    MYTHIQUE:   `ANOMALIE TEMPORELLE DÉTECTÉE. À ${minute}, les dimensions convergent. L'espace-temps lui-même s'incline devant vous. Ce n'est pas une capture — c'est une révélation cosmique. Vous ne serez plus jamais le même.`,
  }
  return narrations[rarity]
}
