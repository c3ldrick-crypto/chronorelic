import { config } from "dotenv"
config({ path: ".env.local" })
config({ path: ".env" })
import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { HISTORICAL_EVENTS } from "../src/lib/game/events"

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL!
const adapter = new PrismaPg({ connectionString })
const prisma = new (PrismaClient as any)({ adapter })

async function main() {
  console.log("⏳ Seeding ChronoRelic database...")

  // ─── Événements historiques ───────────────────
  console.log(`  Seeding ${HISTORICAL_EVENTS.length} historical events...`)
  let seeded = 0
  for (const event of HISTORICAL_EVENTS) {
    await prisma.historicalEvent.upsert({
      where:  { id: event.minute },
      update: {
        year:        event.year,
        title:       event.title,
        description: event.description,
        curiosity:   event.curiosity ?? null,
        category:    event.category  ?? null,
      },
      create: {
        id:          event.minute,
        minute:      event.minute,
        year:        event.year,
        title:       event.title,
        description: event.description,
        curiosity:   event.curiosity ?? null,
        category:    event.category  ?? null,
      },
    })
    seeded++
  }
  console.log(`  ✓ ${seeded} événements historiques seedés.`)
}

main()
  .then(() => console.log("✅ Base de données seedée avec succès !"))
  .catch((e) => { console.error("❌ Seed échoué :", e); process.exit(1) })
  .finally(() => prisma.$disconnect())
