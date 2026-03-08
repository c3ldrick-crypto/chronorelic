/**
 * Script : créer un compte admin ChronoRelic
 * Usage : node --import tsx/esm scripts/create-admin.ts
 */

import { PrismaClient, Prisma } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import bcrypt from "bcryptjs"
import * as dotenv from "dotenv"
import { resolve } from "path"

// Charger .env.local
dotenv.config({ path: resolve(process.cwd(), ".env.local") })

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma  = new PrismaClient({ adapter } as Parameters<typeof PrismaClient>[0])

async function main() {
  const email    = "admin@chronorelic.com"
  const password = "Admin1234!"
  const name     = "Admin"

  const hashed = await bcrypt.hash(password, 12)

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    // Mettre à jour le rôle si le compte existe déjà
    await prisma.user.update({
      where: { email },
      data:  { role: "ADMIN", isPremium: true },
    })
    console.log(`✅ Compte existant mis à jour en ADMIN : ${email}`)
    return
  }

  const user = await prisma.user.create({
    data: {
      email,
      name,
      passwordHash: hashed,
      role:         "ADMIN",
      isPremium:    true,
    },
  })

  console.log(`✅ Compte admin créé !`)
  console.log(`   Email    : ${user.email}`)
  console.log(`   Password : ${password}`)
  console.log(`   Role     : ${user.role}`)
  console.log(`\n→ Connecte-toi sur http://localhost:3000/login`)
}

main()
  .catch((e) => { console.error("❌ Erreur :", e.message); process.exit(1) })
  .finally(() => prisma.$disconnect())
