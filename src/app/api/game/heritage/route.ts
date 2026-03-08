import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { generateHeritageOptions, type HeritageBonusDefinition } from "@/lib/game/heritage"

interface PendingDeathData {
  charClass:  string
  charLevel:  number
  generation: number
  options:    HeritageBonusDefinition[]
  diedAt:     number
}

function readPendingDeath(char: { pendingDeathData: unknown } | null): PendingDeathData | null {
  if (!char?.pendingDeathData) return null
  return char.pendingDeathData as PendingDeathData
}

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }
    const userId = session.user.id

    const [char, heritageTalent] = await Promise.all([
      prisma.character.findUnique({
        where:  { userId },
        select: { pendingDeathData: true },
      }),
      prisma.heritageTalent.findUnique({
        where:  { userId },
        select: { bonuses: true, totalDeaths: true },
      }),
    ])

    const pending = readPendingDeath(char)

    return NextResponse.json({
      hasPendingDeath: !!pending,
      pendingDeath:    pending,
      heritageBonuses: heritageTalent?.bonuses ?? [],
      totalDeaths:     heritageTalent?.totalDeaths ?? 0,
    })
  } catch (err) {
    console.error("[heritage GET]", err)
    return NextResponse.json({ error: "Erreur interne." }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }
    const userId = session.user.id

    const { action, bonusId, newCharName, newCharClass } = await req.json() as {
      action:        string
      bonusId?:      string
      newCharName?:  string
      newCharClass?: string
    }

    // ── GET OPTIONS ──────────────────────────────────────────────────────────
    if (action === "getOptions") {
      const char = await prisma.character.findUnique({
        where:  { userId },
        select: { pendingDeathData: true },
      })
      const pending = readPendingDeath(char)
      if (!pending) {
        return NextResponse.json({ error: "Aucune mort en attente." }, { status: 404 })
      }
      return NextResponse.json({ options: pending.options, pendingDeath: pending })
    }

    // ── CHOOSE BONUS + CREATE NEW CHARACTER ──────────────────────────────────
    if (action === "choose") {
      if (!bonusId) {
        return NextResponse.json({ error: "Bonus ID requis." }, { status: 400 })
      }

      const char = await prisma.character.findUnique({
        where:  { userId },
        select: { pendingDeathData: true },
      })
      const pending = readPendingDeath(char)
      if (!pending) {
        return NextResponse.json({ error: "Aucune mort en attente." }, { status: 404 })
      }

      const chosen = pending.options.find(o => o.id === bonusId)
      if (!chosen) {
        return NextResponse.json({ error: "Bonus invalide." }, { status: 400 })
      }

      // Apply immediate bonus effects to User resources
      const immediateUpdates: Record<string, { increment: number }> = {}
      if (bonusId === "souvenir_fort") {
        immediateUpdates["eclatsTemporels"] = { increment: 200 }
      }
      if (bonusId === "connaissance_off" || bonusId === "essence_stock") {
        immediateUpdates["connaissanceTemp"] = { increment: 50 }
      }
      if (bonusId === "essence_stock") {
        immediateUpdates["chronoEssence"] = { increment: 30 }
      }
      if (bonusId === "machine_head_start") {
        immediateUpdates["chronoEssence"] = {
          increment: (immediateUpdates["chronoEssence"]?.increment ?? 0) + 25,
        }
      }

      const existingHeritage = await prisma.heritageTalent.findUnique({
        where:  { userId },
        select: { bonuses: true, totalDeaths: true },
      })
      const existingBonuses = (existingHeritage?.bonuses as unknown as HeritageBonusDefinition[]) ?? []
      const updatedBonuses  = [...existingBonuses, chosen]

      await prisma.$transaction(async (tx) => {
        // Upsert heritage record
        await tx.heritageTalent.upsert({
          where:  { userId },
          create: {
            userId,
            bonuses:     updatedBonuses as never,
            totalDeaths: 1,
            updatedAt:   new Date(),
          },
          update: {
            bonuses:     updatedBonuses as never,
            totalDeaths: { increment: 1 },
            updatedAt:   new Date(),
          },
        })

        // Delete old character (talents + pendingDeathData cascade)
        await tx.character.deleteMany({ where: { userId } })

        // Create new character
        const generation = pending.generation + 1
        const newName    = newCharName || `Chrononaute Gen.${generation}`
        const newClass   = (newCharClass as "CHRONOMANCER" | "ARCHIVISTE" | "CHASSEUR" | "ORACLE") ?? "CHRONOMANCER"

        const startLevel = bonusId === "souvenir_fort" ? 3 : 1
        const startXP    = bonusId === "souvenir_fort" ? 30 : 0

        await tx.character.create({
          data: {
            userId,
            name:       newName,
            class:      newClass,
            level:      startLevel,
            xp:         startXP,
            xpTotal:    startXP,
            generation,
          },
        })

        if (Object.keys(immediateUpdates).length > 0) {
          await tx.user.update({
            where: { id: userId },
            data:  immediateUpdates,
          })
        }
      })

      return NextResponse.json({
        success:       true,
        chosenBonus:   chosen,
        newGeneration: pending.generation + 1,
        totalHeritage: updatedBonuses.length,
        message:       `L'héritage de "${chosen.label}" a été transmis. Un nouveau personnage est né.`,
      })
    }

    return NextResponse.json({ error: "Action inconnue." }, { status: 400 })
  } catch (err) {
    console.error("[heritage POST]", err)
    return NextResponse.json({ error: "Erreur interne." }, { status: 500 })
  }
}
