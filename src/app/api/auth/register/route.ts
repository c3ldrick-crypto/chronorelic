import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { prisma, type PrismaTx } from "@/lib/prisma"
import { authRateLimit } from "@/lib/redis"

const registerSchema = z.object({
  name:           z.string().min(2).max(50).trim(),
  email:          z.string().email().toLowerCase(),
  password:       z.string().min(8).max(100),
  characterClass: z.enum(["CHRONOMANCER", "ARCHIVISTE", "CHASSEUR", "ORACLE"]),
})

export async function POST(req: NextRequest) {
  // Rate limiting (OWASP A07)
  const ip = req.headers.get("x-forwarded-for") ?? "unknown"
  const { success } = await authRateLimit.limit(ip)
  if (!success) {
    return NextResponse.json(
      { error: "Trop de tentatives. Réessayez dans 15 minutes." },
      { status: 429 }
    )
  }

  // Validation des entrées (OWASP A03)
  let body: z.infer<typeof registerSchema>
  try {
    body = registerSchema.parse(await req.json())
  } catch {
    return NextResponse.json({ error: "Données invalides." }, { status: 400 })
  }

  const { name, email, password, characterClass } = body

  // Vérifier si l'email existe
  const existing = await prisma.user.findUnique({
    where:  { email },
    select: { id: true },
  })

  if (existing) {
    return NextResponse.json({ error: "Cet email est déjà utilisé." }, { status: 409 })
  }

  // Hash du mot de passe (bcrypt, cost 12)
  const passwordHash = await bcrypt.hash(password, 12)

  // Création dans une transaction
  const user = await prisma.$transaction(async (tx: PrismaTx) => {
    const newUser = await tx.user.create({
      data: {
        name,
        email,
        passwordHash,
        role:      "FREE",
        isPremium: false,
      },
    })

    await tx.character.create({
      data: {
        userId: newUser.id,
        name,
        class:  characterClass,
        level:  1,
        xp:     0,
        xpTotal: 0,
      },
    })

    await tx.streakData.create({
      data: {
        userId: newUser.id,
        updatedAt: new Date(),
      },
    })

    await tx.auditLog.create({
      data: {
        userId:   newUser.id,
        action:   "REGISTER",
        resource: "auth",
        ip,
      },
    })

    return newUser
  })

  return NextResponse.json(
    { id: user.id, email: user.email, name: user.name },
    { status: 201 }
  )
}
