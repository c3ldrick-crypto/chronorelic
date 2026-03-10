import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 })

  const character = await prisma.character.findUnique({
    where:  { userId: session.user.id },
    select: {
      name:    true,
      class:   true,
      level:   true,
      xpTotal: true,
    },
  })

  if (!character) return NextResponse.json({ error: "Personnage introuvable" }, { status: 404 })

  return NextResponse.json(character)
}

export async function PATCH() {
  return NextResponse.json({ error: "Non supporté" }, { status: 410 })
}
