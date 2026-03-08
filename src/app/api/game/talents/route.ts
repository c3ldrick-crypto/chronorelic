import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { TALENTS } from "@/types"

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 })

  const character = await prisma.character.findUnique({
    where:  { userId: session.user.id },
    select: {
      talentPoints: true,
      class:        true,
      talents: { select: { talentId: true, level: true } },
    },
  })

  if (!character) return NextResponse.json({ error: "Personnage introuvable" }, { status: 404 })

  return NextResponse.json({
    talentPoints:    character.talentPoints,
    characterClass:  character.class,
    unlockedTalents: Object.fromEntries(character.talents.map((t: { talentId: string; level: number }) => [t.talentId, t.level])),
  })
}

const unlockSchema = z.object({
  talentId: z.string(),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 })

  const { talentId } = unlockSchema.parse(await req.json())

  const talent = TALENTS.find((t) => t.id === talentId)
  if (!talent) return NextResponse.json({ error: "Talent introuvable" }, { status: 404 })

  const character = await prisma.character.findUnique({
    where:   { userId: session.user.id },
    include: { talents: { where: { talentId } } },
  })

  if (character && !talent.classes.includes(character.class as import("@/types").CharacterClass)) {
    return NextResponse.json({ error: "Ce talent n'est pas disponible pour votre classe." }, { status: 403 })
  }

  if (!character) return NextResponse.json({ error: "Personnage introuvable" }, { status: 404 })
  if (character.talentPoints < talent.cost) {
    return NextResponse.json({ error: "Points insuffisants" }, { status: 403 })
  }

  const existing = character.talents[0]
  if (existing && existing.level >= talent.maxLevel) {
    return NextResponse.json({ error: "Talent au niveau maximum" }, { status: 409 })
  }

  await prisma.$transaction([
    prisma.characterTalent.upsert({
      where:  { characterId_talentId: { characterId: character.id, talentId } },
      update: { level: { increment: 1 } },
      create: { characterId: character.id, talentId, level: 1 },
    }),
    prisma.character.update({
      where: { id: character.id },
      data:  { talentPoints: { decrement: talent.cost } },
    }),
  ])

  return NextResponse.json({ success: true })
}
