import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 })

  const character = await prisma.character.findUnique({
    where:  { userId: session.user.id },
    select: {
      name:           true,
      class:          true,
      level:          true,
      xpTotal:        true,
      blessedMinutes: true,
    },
  })

  if (!character) return NextResponse.json({ error: "Personnage introuvable" }, { status: 404 })

  return NextResponse.json(character)
}

const profileSchema = z.object({
  blessedMinutes: z
    .array(z.string().regex(/^\d{2}:\d{2}$/, "Format HH:MM requis"))
    .max(5, "Maximum 5 minutes bénies"),
})

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 })

  let body: z.infer<typeof profileSchema>
  try {
    body = profileSchema.parse(await req.json())
  } catch {
    return NextResponse.json({ error: "Données invalides" }, { status: 400 })
  }

  // Dédupliquer + valider les plages d'heures
  const unique = [...new Set(body.blessedMinutes)].filter((m) => {
    const [h, min] = m.split(":").map(Number)
    return h >= 0 && h <= 23 && min >= 0 && min <= 59
  })

  const character = await prisma.character.findUnique({
    where:  { userId: session.user.id },
    select: { id: true },
  })
  if (!character) return NextResponse.json({ error: "Personnage introuvable" }, { status: 404 })

  await prisma.character.update({
    where: { id: character.id },
    data:  { blessedMinutes: unique },
  })

  return NextResponse.json({ success: true, blessedMinutes: unique })
}
