import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma, type PrismaTx } from "@/lib/prisma"
import { z } from "zod"
import { Rarity, CharacterClass } from "@/types"
import { calculateXP } from "@/lib/game/rarity"
import { formatCaptureDate } from "@/lib/utils"

const fuseSchema = z.object({
  relicIds: z.array(z.string().cuid()).length(3),
})

const RARITY_UPGRADE: Record<Rarity, Rarity> = {
  COMMUNE:    "RARE",
  RARE:       "EPIQUE",
  EPIQUE:     "LEGENDAIRE",
  LEGENDAIRE: "MYTHIQUE",
  MYTHIQUE:   "MYTHIQUE",
}

const RARITY_ORDER: Rarity[] = ["COMMUNE", "RARE", "EPIQUE", "LEGENDAIRE", "MYTHIQUE"]

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
  }

  const userId = session.user.id

  let body: z.infer<typeof fuseSchema>
  try {
    body = fuseSchema.parse(await req.json())
  } catch {
    return NextResponse.json({ error: "Données invalides" }, { status: 400 })
  }

  // Vérifier que les 3 reliques appartiennent à l'utilisateur
  const relics = await prisma.relic.findMany({
    where:  { id: { in: body.relicIds }, userId },
    select: { id: true, minute: true, rarity: true },
  })

  if (relics.length !== 3) {
    return NextResponse.json({ error: "Reliques introuvables." }, { status: 404 })
  }

  const rarities = relics.map((r) => r.rarity as Rarity)
  const allSame  = rarities.every((r) => r === rarities[0])

  // Si toutes de même rareté → upgrade garanti
  // Sinon → upgrade de la rareté dominante (ancienne règle)
  let newRarity: Rarity
  let sameRarityBonus = false

  if (allSame) {
    newRarity = RARITY_UPGRADE[rarities[0]]
    sameRarityBonus = rarities[0] !== "MYTHIQUE"
  } else {
    const rarityCounts: Partial<Record<Rarity, number>> = {}
    for (const r of rarities) {
      rarityCounts[r] = (rarityCounts[r] ?? 0) + 1
    }
    const dominantRarity = (Object.entries(rarityCounts) as [Rarity, number][])
      .sort(([ra, a], [rb, b]) => {
        if (b !== a) return b - a
        return RARITY_ORDER.indexOf(rb) - RARITY_ORDER.indexOf(ra)
      })[0][0]
    newRarity = RARITY_UPGRADE[dominantRarity]
  }

  // La minute résultante est la médiane
  const minutes = relics.map((r: { minute: string }) => r.minute).sort()
  const fusedMinute = minutes[1]

  const character = await prisma.character.findUnique({
    where:  { userId },
    select: { class: true, xpTotal: true },
  })

  const xpGained = calculateXP({
    rarity:         newRarity,
    characterClass: character?.class as CharacterClass,
  })

  // La relique fusionnée obtient un captureDate d'aujourd'hui
  const captureDate = formatCaptureDate()

  // Vérifier qu'on peut créer cette minute (unicité)
  // Si une relique existe déjà pour ce captureDate+minute, on génère une minute adjacente
  let finalMinute = fusedMinute
  const existingAtMinute = await prisma.relic.findUnique({
    where: { userId_captureDate_minute: { userId, captureDate, minute: fusedMinute } },
    select: { id: true },
  })
  if (existingAtMinute) {
    // Utiliser la première minute disponible des trois
    for (const m of minutes) {
      const ex = await prisma.relic.findUnique({
        where: { userId_captureDate_minute: { userId, captureDate, minute: m } },
        select: { id: true },
      })
      if (!ex) { finalMinute = m; break }
    }
  }

  const fused = await prisma.$transaction(async (tx: PrismaTx) => {
    // Déséquiper les reliques avant suppression
    await tx.equippedRelic.deleteMany({ where: { relicId: { in: body.relicIds } } })

    // Supprimer les 3 reliques originales
    await tx.relic.deleteMany({ where: { id: { in: body.relicIds } } })

    // Créer la relique fusionnée
    const newRelic = await tx.relic.create({
      data: {
        userId,
        minute:      finalMinute,
        captureDate,
        rarity:      newRarity,
        xpGained,
        isFused:     true,
        fusedFromIds: body.relicIds,
      },
    })

    // Ajouter XP
    if (character) {
      const newXP = character.xpTotal + xpGained
      await tx.character.update({
        where: { userId },
        data:  { xpTotal: newXP, xp: newXP },
      })
    }

    await tx.auditLog.create({
      data: {
        userId,
        action:   "FUSE",
        resource: `relic:${newRelic.id}`,
        details:  { from: body.relicIds, newRarity, xpGained, sameRarityBonus },
      },
    })

    return newRelic
  })

  return NextResponse.json({
    id:              fused.id,
    minute:          fused.minute,
    rarity:          fused.rarity,
    xpGained:        fused.xpGained,
    sameRarityBonus,
    message:         sameRarityBonus
      ? "Fusion parfaite ! 3 reliques identiques → rareté supérieure garantie !"
      : "Fusion réussie.",
  })
}
