import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import * as dotenv from "dotenv"
import { resolve } from "path"

dotenv.config({ path: resolve(process.cwd(), ".env.local") })

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma  = new PrismaClient({ adapter } as Parameters<typeof PrismaClient>[0])

async function test() {
  try {
    const user = await prisma.user.findFirst({
      select: {
        id:                  true,
        eclatsTemporels:     true,
        chronite:            true,
        essencesHistoriques: true,
        fragmentsAnomalie:   true,
      },
    })
    console.log("OK - colonnes ressources présentes:", JSON.stringify(user))
  } catch (e: any) {
    console.error("ERREUR:", e.message)
  }
  await prisma.$disconnect()
}

test()
