import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const schema = z.object({
  name:  z.string().min(2).max(50).trim(),
  class: z.enum(["CHRONOMANCER", "ARCHIVISTE", "CHASSEUR", "ORACLE"]),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
  }

  let body: z.infer<typeof schema>
  try {
    body = schema.parse(await req.json())
  } catch {
    return NextResponse.json({ error: "Données invalides." }, { status: 400 })
  }

  const existing = await prisma.character.findUnique({
    where:  { userId: session.user.id },
    select: { id: true },
  })
  if (existing) {
    return NextResponse.json({ error: "Personnage déjà créé." }, { status: 409 })
  }

  const character = await prisma.character.create({
    data: {
      userId:  session.user.id,
      name:    body.name,
      class:   body.class,
      level:   1,
      xp:      0,
      xpTotal: 0,
    },
  })

  return NextResponse.json({ id: character.id }, { status: 201 })
}
