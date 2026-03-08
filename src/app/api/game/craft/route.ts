import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { CRAFT_ITEMS } from "@/types"
import { z } from "zod"

const schema = z.object({ itemId: z.string() })

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
  }

  const userId = session.user.id

  let body: z.infer<typeof schema>
  try { body = schema.parse(await req.json()) }
  catch { return NextResponse.json({ error: "Données invalides." }, { status: 400 }) }

  const item = CRAFT_ITEMS.find(i => i.id === body.itemId)
  if (!item) return NextResponse.json({ error: "Objet inconnu." }, { status: 404 })

  const user = await prisma.user.findUnique({
    where:  { id: userId },
    select: {
      eclatsTemporels:     true,
      chronite:            true,
      essencesHistoriques: true,
      fragmentsAnomalie:   true,
      character:           { select: { level: true } },
    },
  })

  if (!user) return NextResponse.json({ error: "Introuvable" }, { status: 404 })
  if ((user.character?.level ?? 1) < item.levelRequired) {
    return NextResponse.json(
      { error: `Niveau ${item.levelRequired} requis pour fabriquer ${item.label}.` },
      { status: 403 }
    )
  }

  // Vérifier les ressources
  if (
    user.eclatsTemporels     < item.cost.eclatsTemporels  ||
    user.chronite            < item.cost.chronite          ||
    user.essencesHistoriques < item.cost.essencesHistoriques ||
    user.fragmentsAnomalie   < item.cost.fragmentsAnomalie
  ) {
    return NextResponse.json({ error: "Ressources insuffisantes." }, { status: 400 })
  }

  // Transaction : déduire ressources + ajouter à l'inventaire
  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: {
        eclatsTemporels:     { decrement: item.cost.eclatsTemporels },
        chronite:            { decrement: item.cost.chronite },
        essencesHistoriques: { decrement: item.cost.essencesHistoriques },
        fragmentsAnomalie:   { decrement: item.cost.fragmentsAnomalie },
      },
    }),
    prisma.playerInventory.upsert({
      where:  { userId_itemId: { userId, itemId: item.id } },
      create: { userId, itemId: item.id, quantity: 1 },
      update: { quantity: { increment: 1 } },
    }),
    prisma.auditLog.create({
      data: {
        userId, action: "CRAFT", resource: `item:${item.id}`,
        details: { itemId: item.id, cost: { ...item.cost } } as object,
      },
    }),
  ])

  return NextResponse.json({
    success:  true,
    itemId:   item.id,
    label:    item.label,
    icon:     item.icon,
    message:  `${item.label} fabriqué avec succès !`,
  })
}
