import { config } from "dotenv"
config({ path: ".env.local" })
config({ path: ".env" })

import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL! })
const prisma  = new (PrismaClient as any)({ adapter })

async function main() {
  // Trouver tous les doublons (userId + minute)
  const relics = await prisma.relic.findMany({
    orderBy: { capturedAt: "desc" },
    select: { id: true, userId: true, minute: true, capturedAt: true },
  })

  const seen = new Set<string>()
  const toDelete: string[] = []

  for (const r of relics) {
    const key = `${r.userId}:${r.minute}`
    if (seen.has(key)) {
      toDelete.push(r.id)
    } else {
      seen.add(key)
    }
  }

  if (toDelete.length === 0) {
    console.log("Aucun doublon trouvé.")
  } else {
    console.log(`Suppression de ${toDelete.length} doublons...`)
    await prisma.relic.deleteMany({ where: { id: { in: toDelete } } })
    console.log("Doublons supprimés.")
  }

  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
