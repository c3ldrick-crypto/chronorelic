import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import * as dotenv from "dotenv"
import { resolve } from "path"

dotenv.config({ path: resolve(process.cwd(), ".env.local") })

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma  = new PrismaClient({ adapter } as any)

async function test() {
  try {
    const user = await prisma.user.findFirst({
      select: {
        id:             true,
        temporalShards: true,
        isPremium:      true,
      },
    })
    console.log("OK - user:", JSON.stringify(user))
  } catch (e: unknown) {
    console.error("ERREUR:", e instanceof Error ? e.message : String(e))
  }
  await prisma.$disconnect()
}

test()
