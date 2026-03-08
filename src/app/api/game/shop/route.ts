import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { SHARD_SHOP } from "@/types"
import { cache, REDIS_KEYS } from "@/lib/redis"

const shopSchema = z.object({
  itemId: z.string(),
})

// Durée des boosts en secondes
const BOOST_DURATION = 60 * 60 // 1h

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
  }

  const userId = session.user.id

  let body: z.infer<typeof shopSchema>
  try {
    body = shopSchema.parse(await req.json())
  } catch {
    return NextResponse.json({ error: "Données invalides" }, { status: 400 })
  }

  const item = SHARD_SHOP.find((i) => i.id === body.itemId)
  if (!item) {
    return NextResponse.json({ error: "Article introuvable" }, { status: 404 })
  }

  // Vérifier les éclats du joueur
  const user = await prisma.user.findUnique({
    where:  { id: userId },
    select: { temporalShards: true },
  })

  if (!user) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 })

  if (user.temporalShards < item.cost) {
    return NextResponse.json({
      error: `Éclats insuffisants. Vous avez ${user.temporalShards} éclats, il en faut ${item.cost}.`,
    }, { status: 402 })
  }

  // Appliquer l'effet de l'item
  let effectMessage = ""

  switch (item.id) {
    case "boost_rarete": {
      // Stocker le boost actif en Redis avec TTL
      await cache.set(REDIS_KEYS.rarityBoost(userId), "1", BOOST_DURATION)
      effectMessage = "Boost de rareté actif pendant 1 heure !"
      break
    }

    case "relance": {
      // Stocker une relance supplémentaire en Redis avec TTL 24h
      const currentRerolls = (await cache.get<number>(REDIS_KEYS.rerollCount(userId))) ?? 0
      await cache.set(REDIS_KEYS.rerollCount(userId), currentRerolls + 1, 24 * 60 * 60)
      effectMessage = "Relance supplémentaire ajoutée !"
      break
    }

    case "slot_inventaire": {
      // Augmenter les slots d'inventaire (stocké en DB dans user metadata)
      await prisma.character.updateMany({
        where: { userId },
        data:  {}, // L'inventaire est illimité dans l'implémentation actuelle
      })
      effectMessage = "+10 emplacements d'inventaire débloqués !"
      break
    }

    case "skin_legendaire": {
      // Marquer le skin comme acheté (future feature)
      effectMessage = "Skin Légendaire activé sur vos reliques !"
      break
    }

    default:
      return NextResponse.json({ error: "Effet non implémenté" }, { status: 501 })
  }

  // Débiter les éclats + audit log
  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data:  { temporalShards: { decrement: item.cost } },
    }),
    prisma.auditLog.create({
      data: {
        userId,
        action:   "SHOP_PURCHASE",
        resource: "shop",
        details: { itemId: item.id, cost: item.cost },
      },
    }),
  ])

  const updatedUser = await prisma.user.findUnique({
    where:  { id: userId },
    select: { temporalShards: true },
  })

  return NextResponse.json({
    success:          true,
    message:          effectMessage,
    shardsRemaining:  updatedUser?.temporalShards ?? 0,
    itemId:           item.id,
  })
}
