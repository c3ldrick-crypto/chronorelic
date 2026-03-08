import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { CRAFT_ITEMS } from "@/types"

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
  }

  const userId = session.user.id

  const user = await prisma.user.findUnique({
    where:  { id: userId },
    select: {
      eclatsTemporels:     true,
      chronite:            true,
      essencesHistoriques: true,
      fragmentsAnomalie:   true,
      character:           { select: { level: true } },
      inventory:           { select: { itemId: true, quantity: true } },
    },
  })

  if (!user) return NextResponse.json({ error: "Introuvable" }, { status: 404 })

  const charLevel   = user.character?.level ?? 1
  const inventoryMap = Object.fromEntries(user.inventory.map(i => [i.itemId, i.quantity]))

  // Ajouter les infos de déblocage pour chaque recette
  const craftableItems = CRAFT_ITEMS.map(item => ({
    ...item,
    unlocked: charLevel >= item.levelRequired,
    owned:    inventoryMap[item.id] ?? 0,
    canCraft: charLevel >= item.levelRequired &&
      user.eclatsTemporels     >= item.cost.eclatsTemporels &&
      user.chronite            >= item.cost.chronite &&
      user.essencesHistoriques >= item.cost.essencesHistoriques &&
      user.fragmentsAnomalie   >= item.cost.fragmentsAnomalie,
  }))

  return NextResponse.json({
    resources: {
      eclatsTemporels:     user.eclatsTemporels,
      chronite:            user.chronite,
      essencesHistoriques: user.essencesHistoriques,
      fragmentsAnomalie:   user.fragmentsAnomalie,
    },
    inventory:     inventoryMap,
    craftableItems,
    charLevel,
  })
}
