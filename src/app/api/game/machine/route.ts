import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { cache, REDIS_KEYS } from "@/lib/redis"
import { MACHINE_ERAS, MACHINE_LEVEL_LABELS, getAccessibleEras, generateTargetMinute } from "@/lib/game/machine"
import { getEventForMinute } from "@/lib/game/events"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }
    const userId = session.user.id

    const user = await prisma.user.findUnique({
      where:  { id: userId },
      select: {
        chronoEssence:       true,
        energieResiduelle:   true,
        cristalParadoxal:    true,
        residuAncestral:     true,
        quintessence:        true,
        quintessenceAbsolue: true,
        sanctuaire: { select: { machineTemporelle: true } },
      },
    })

    const machineLevel = user?.sanctuaire?.machineTemporelle ?? 0

    // Check recharge per era
    const eraStatuses: Record<string, { locked: boolean; rechargeEndsAt: number | null }> = {}
    for (const era of MACHINE_ERAS) {
      const rechargeData = await cache.get<{ endsAt: number }>(REDIS_KEYS.machineRecharge(`${userId}:${era.id}`))
      eraStatuses[era.id] = {
        locked:          era.minMachineLevel > machineLevel,
        rechargeEndsAt:  rechargeData ? rechargeData.endsAt : null,
      }
    }

    return NextResponse.json({
      machineLevel,
      machineLevelLabel: MACHINE_LEVEL_LABELS[machineLevel] ?? "Inconnue",
      accessibleEras:    getAccessibleEras(machineLevel),
      allEras:           MACHINE_ERAS,
      eraStatuses,
      essences: {
        chronoEssence:       user?.chronoEssence       ?? 0,
        energieResiduelle:   user?.energieResiduelle   ?? 0,
        cristalParadoxal:    user?.cristalParadoxal    ?? 0,
        residuAncestral:     user?.residuAncestral     ?? 0,
        quintessence:        user?.quintessence        ?? 0,
        quintessenceAbsolue: user?.quintessenceAbsolue ?? 0,
      },
    })
  } catch (err) {
    console.error("[machine GET]", err)
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

    const { eraId } = await req.json() as { eraId: string }
    const era = MACHINE_ERAS.find(e => e.id === eraId)
    if (!era) {
      return NextResponse.json({ error: "Ère inconnue." }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where:  { id: userId },
      select: {
        chronoEssence:       true,
        energieResiduelle:   true,
        cristalParadoxal:    true,
        residuAncestral:     true,
        quintessence:        true,
        quintessenceAbsolue: true,
        sanctuaire: { select: { machineTemporelle: true } },
        researchProgress: { select: { nodeId: true, level: true } },
      },
    })

    const machineLevel = user?.sanctuaire?.machineTemporelle ?? 0
    if (era.minMachineLevel > machineLevel) {
      return NextResponse.json(
        { error: `Cette ère nécessite une Machine Temporelle de niveau ${era.minMachineLevel}.` },
        { status: 403 }
      )
    }

    // Check recharge
    const rechargeKey  = REDIS_KEYS.machineRecharge(`${userId}:${eraId}`)
    const rechargeData = await cache.get<{ endsAt: number }>(rechargeKey)
    if (rechargeData && rechargeData.endsAt > Date.now()) {
      const minutesLeft = Math.ceil((rechargeData.endsAt - Date.now()) / 60000)
      return NextResponse.json(
        { error: `La Machine se recharge. Retentez dans ${minutesLeft} minute(s).` },
        { status: 429 }
      )
    }

    // Research cost reduction
    const researchMap    = Object.fromEntries(
      (user?.researchProgress ?? []).map((r: { nodeId: string; level: number }) => [r.nodeId, r.level])
    )
    const costReduction  = (researchMap["cartographie_temporelle"] ?? 0) * 0.10
    const instabilityRed = (researchMap["stabilisation_flux"] ?? 0) * 0.08

    // Check costs
    const cost = era.cost
    const hasCost =
      (user?.chronoEssence       ?? 0) >= Math.ceil((cost.chronoEssence       ?? 0) * (1 - costReduction)) &&
      (user?.energieResiduelle   ?? 0) >= (cost.energieResiduelle   ?? 0) &&
      (user?.cristalParadoxal    ?? 0) >= (cost.cristalParadoxal    ?? 0) &&
      (user?.residuAncestral     ?? 0) >= (cost.residuAncestral     ?? 0) &&
      (user?.quintessence        ?? 0) >= (cost.quintessence        ?? 0) &&
      (user?.quintessenceAbsolue ?? 0) >= (cost.quintessenceAbsolue ?? 0)

    if (!hasCost) {
      return NextResponse.json({ error: "Essences insuffisantes pour ce voyage temporel." }, { status: 400 })
    }

    // Deduct costs
    await prisma.user.update({
      where: { id: userId },
      data: {
        chronoEssence:       { decrement: Math.ceil((cost.chronoEssence       ?? 0) * (1 - costReduction)) },
        energieResiduelle:   { decrement: cost.energieResiduelle   ?? 0 },
        cristalParadoxal:    { decrement: cost.cristalParadoxal    ?? 0 },
        residuAncestral:     { decrement: cost.residuAncestral     ?? 0 },
        quintessence:        { decrement: cost.quintessence        ?? 0 },
        quintessenceAbsolue: { decrement: cost.quintessenceAbsolue ?? 0 },
      },
    })

    // Set recharge
    const rechargeMs  = era.rechargeMinutes * 60 * 1000
    const endsAt      = Date.now() + rechargeMs
    await cache.set(rechargeKey, { endsAt }, era.rechargeMinutes * 60)

    // Instability check (failure = refund partial cost)
    const effectiveInstability = Math.max(0, era.instabilityPct - instabilityRed * 100)
    const instabilityRoll      = Math.random() * 100
    if (instabilityRoll < effectiveInstability) {
      // Partial refund (50%) on instability failure
      await prisma.user.update({
        where: { id: userId },
        data: {
          chronoEssence: { increment: Math.floor(Math.ceil((cost.chronoEssence ?? 0) * (1 - costReduction)) * 0.5) },
        },
      })
      return NextResponse.json({
        failed:        true,
        instability:   true,
        message:       "Le flux temporel était trop instable. La Machine a été endommagée. Voyage avorté — 50% des essences remboursées.",
        rechargeEndsAt: endsAt,
      })
    }

    // Generate target minute not already captured by user today
    const captureDate    = new Date().toISOString().slice(0, 10)
    const capturedToday  = await prisma.relic.findMany({
      where:  { userId, captureDate },
      select: { minute: true },
    })
    const capturedSet = new Set(capturedToday.map((r: { minute: string }) => r.minute))

    let targetMinute = generateTargetMinute()
    for (let i = 0; i < 20; i++) {
      if (!capturedSet.has(targetMinute)) break
      targetMinute = generateTargetMinute()
    }

    const event = getEventForMinute(targetMinute)

    // Research machine essence bonus
    const essenceBonus = (researchMap["resonance_epoques"] ?? 0) > 0
      ? [0, 1.15, 1.30, 1.50][(researchMap["resonance_epoques"] ?? 0)]
      : 1

    return NextResponse.json({
      success:          true,
      targetMinute,
      era:              { id: era.id, label: era.label, icon: era.icon, minRarity: era.minRarity },
      eventHint:        event ? { title: event.title, year: event.year, category: event.category } : null,
      instabilityPct:   effectiveInstability,
      essenceBonusMult: essenceBonus,
      rechargeEndsAt:   endsAt,
      message:          `Connexion établie avec ${era.label}. Ciblez la minute ${targetMinute}${event ? ` — ${event.title}` : ""}. Lancez la capture !`,
    })
  } catch (err) {
    console.error("[machine POST]", err)
    return NextResponse.json({ error: "Erreur interne." }, { status: 500 })
  }
}
