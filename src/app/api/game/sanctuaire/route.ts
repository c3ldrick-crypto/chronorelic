import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import {
  SANCTUAIRE_MODULES,
  MODULE_IDS,
  SanctuaireModuleId,
  computeProduction,
  computeBonuses,
  computePendingHarvest,
  getUpgradeCost,
} from "@/lib/game/sanctuaire"
import { CLASS_CONFIG, CharacterClass } from "@/types"

// ── Helper: build modules map from DB row ────────────────────────────────────
function dbToModules(s: {
  extracteur: number; generateur: number; archives: number; observatoire: number
  forge: number; resonance: number; laboratoire: number; nexus: number
}): Partial<Record<SanctuaireModuleId, number>> {
  return {
    extracteur:   s.extracteur,
    generateur:   s.generateur,
    archives:     s.archives,
    observatoire: s.observatoire,
    forge:        s.forge,
    resonance:    s.resonance,
    laboratoire:  s.laboratoire,
    nexus:        s.nexus,
  }
}

// ── GET — return current sanctuaire state + pending harvest ──────────────────
export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 })

  const userId = session.user.id

  const [sanctuaire, user] = await Promise.all([
    prisma.sanctuaire.findUnique({ where: { userId } }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { character: { select: { class: true, talents: { select: { talentId: true, level: true } } } } },
    }),
  ])

  if (!sanctuaire) {
    // Auto-create on first visit
    const created = await prisma.sanctuaire.create({
      data: { userId, lastHarvestedAt: new Date() },
    })
    const modules  = dbToModules(created)
    const prod     = computeProduction(modules)
    const bonuses  = computeBonuses(modules)
    return NextResponse.json({
      modules, production: prod, bonuses,
      pendingHarvest: { eclats: 0, chronite: 0, essences: 0, hoursElapsed: 0 },
      lastHarvestedAt: created.lastHarvestedAt,
      moduleDetails: MODULE_IDS.map((id) => ({
        ...SANCTUAIRE_MODULES[id],
        currentLevel: modules[id] ?? 0,
        upgradeCost:  getUpgradeCost(id, modules[id] ?? 0),
      })),
    })
  }

  const charClass     = (user?.character?.class ?? "CHRONOMANCER") as CharacterClass
  const classCfg      = CLASS_CONFIG[charClass]
  const talentMap     = Object.fromEntries((user?.character?.talents ?? []).map((t) => [t.talentId, t.level]))
  const sanctAmpLvl   = charClass === "CHASSEUR" ? (talentMap["sanctuaire_amp"] ?? 0) : 0
  const sanctBonus    = (classCfg.sanctuaireBonus ?? 0) + sanctAmpLvl * 0.10

  const modules       = dbToModules(sanctuaire)
  const prod          = computeProduction(modules)
  const bonuses       = computeBonuses(modules)

  // Apply CHASSEUR sanctuaire bonus to production display
  const prodWithBonus = {
    eclatsPerHour:   prod.eclatsPerHour   * (1 + sanctBonus),
    chronitePerHour: prod.chronitePerHour * (1 + sanctBonus),
    essencesPerHour: prod.essencesPerHour * (1 + sanctBonus),
  }

  const pending = computePendingHarvest(modules, sanctuaire.lastHarvestedAt)
  // Apply sanctuaire bonus to pending harvest too
  const pendingWithBonus = {
    eclats:       Math.floor(pending.eclats   * (1 + sanctBonus)),
    chronite:     Math.floor(pending.chronite * (1 + sanctBonus)),
    essences:     Math.floor(pending.essences * (1 + sanctBonus)),
    hoursElapsed: pending.hoursElapsed,
  }

  return NextResponse.json({
    modules,
    production:     prodWithBonus,
    bonuses,
    pendingHarvest: pendingWithBonus,
    lastHarvestedAt: sanctuaire.lastHarvestedAt,
    moduleDetails:  MODULE_IDS.map((id) => ({
      ...SANCTUAIRE_MODULES[id],
      currentLevel: modules[id] ?? 0,
      upgradeCost:  getUpgradeCost(id, modules[id] ?? 0),
    })),
  })
}

// ── POST — action: upgrade | harvest ────────────────────────────────────────
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 })

  const userId = session.user.id
  const body   = await req.json().catch(() => ({})) as { action?: string; moduleId?: string }
  const { action, moduleId } = body

  // ── HARVEST ──────────────────────────────────────────────────────────────
  if (action === "harvest") {
    const [sanctuaire, user] = await Promise.all([
      prisma.sanctuaire.findUnique({ where: { userId } }),
      prisma.user.findUnique({
        where:  { id: userId },
        select: { character: { select: { class: true, talents: { select: { talentId: true, level: true } } } } },
      }),
    ])
    if (!sanctuaire) return NextResponse.json({ error: "Sanctuaire introuvable." }, { status: 404 })

    const charClass    = (user?.character?.class ?? "CHRONOMANCER") as CharacterClass
    const harvestMap   = Object.fromEntries((user?.character?.talents ?? []).map((t) => [t.talentId, t.level]))
    const harvestAmpLvl = charClass === "CHASSEUR" ? (harvestMap["sanctuaire_amp"] ?? 0) : 0
    const sanctBonus   = (CLASS_CONFIG[charClass].sanctuaireBonus ?? 0) + harvestAmpLvl * 0.10
    const modules    = dbToModules(sanctuaire)
    const pending    = computePendingHarvest(modules, sanctuaire.lastHarvestedAt)

    const eclats   = Math.floor(pending.eclats   * (1 + sanctBonus))
    const chronite = Math.floor(pending.chronite * (1 + sanctBonus))
    const essences = Math.floor(pending.essences * (1 + sanctBonus))

    if (eclats === 0 && chronite === 0 && essences === 0) {
      return NextResponse.json({ error: "Rien à récolter pour le moment." }, { status: 400 })
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: {
          eclatsTemporels:     { increment: eclats   },
          chronite:            { increment: chronite },
          essencesHistoriques: { increment: essences },
        },
      }),
      prisma.sanctuaire.update({
        where: { userId },
        data:  { lastHarvestedAt: new Date() },
      }),
    ])

    return NextResponse.json({ success: true, harvested: { eclats, chronite, essences }, hoursElapsed: pending.hoursElapsed })
  }

  // ── UPGRADE ──────────────────────────────────────────────────────────────
  if (action === "upgrade" && moduleId) {
    if (!MODULE_IDS.includes(moduleId as SanctuaireModuleId)) {
      return NextResponse.json({ error: "Module inconnu." }, { status: 400 })
    }
    const mid = moduleId as SanctuaireModuleId

    const [sanctuaire, user] = await Promise.all([
      prisma.sanctuaire.findUnique({ where: { userId } }),
      prisma.user.findUnique({
        where:  { id: userId },
        select: {
          eclatsTemporels: true, chronite: true,
          essencesHistoriques: true, fragmentsAnomalie: true,
        },
      }),
    ])

    if (!sanctuaire) {
      return NextResponse.json({ error: "Sanctuaire introuvable." }, { status: 404 })
    }
    if (!user) {
      return NextResponse.json({ error: "Joueur introuvable." }, { status: 404 })
    }

    const modules      = dbToModules(sanctuaire)
    const currentLevel = modules[mid] ?? 0
    const cost         = getUpgradeCost(mid, currentLevel)

    if (!cost) {
      return NextResponse.json({ error: "Niveau maximum atteint." }, { status: 400 })
    }

    // Check resources
    if (
      user.eclatsTemporels     < cost.eclatsTemporels     ||
      user.chronite            < cost.chronite            ||
      user.essencesHistoriques < cost.essencesHistoriques ||
      user.fragmentsAnomalie   < cost.fragmentsAnomalie
    ) {
      return NextResponse.json({ error: "Ressources insuffisantes." }, { status: 400 })
    }

    // Deduct costs + increment module level
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: {
          eclatsTemporels:     { decrement: cost.eclatsTemporels     },
          chronite:            { decrement: cost.chronite            },
          essencesHistoriques: { decrement: cost.essencesHistoriques },
          fragmentsAnomalie:   { decrement: cost.fragmentsAnomalie   },
        },
      }),
      prisma.sanctuaire.update({
        where: { userId },
        data:  { [mid]: { increment: 1 } },
      }),
    ])

    return NextResponse.json({
      success:   true,
      moduleId:  mid,
      newLevel:  currentLevel + 1,
      costPaid:  cost,
    })
  }

  return NextResponse.json({ error: "Action inconnue." }, { status: 400 })
}
