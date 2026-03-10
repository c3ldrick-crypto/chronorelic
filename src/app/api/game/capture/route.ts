import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma, type PrismaTx } from "@/lib/prisma"
import { captureRateLimit, REDIS_KEYS, cache } from "@/lib/redis"
import { drawRarity, calculateXP, isBlessedMinute, isSecretMinute, rollJackpot } from "@/lib/game/rarity"
import { levelFromXP, talentPointsForLevel } from "@/lib/game/xp"
import { getEventForMinute } from "@/lib/game/events"
import { generateNarration } from "@/lib/ai/narrate"
import { FREE_LIMITS, CharacterClass, RESOURCE_DROPS, RESOURCE_EVENT_BONUS, RISKY_CAPTURE } from "@/types"
import { formatMinute, formatCaptureDate } from "@/lib/utils"
import { getTodayAnomalies, mergeAnomalyEffects } from "@/lib/game/anomalies"
import { computeBonuses } from "@/lib/game/sanctuaire"
import {
  STAKE_TIERS,
  type StakeTier,
  computeSuccessChance,
  rollDeath,
  ESSENCE_BY_CATEGORY,
  ESSENCE_BY_RARITY,
} from "@/lib/game/essences"
import { generateHeritageOptions } from "@/lib/game/heritage"

type CaptureIntent = "RELIQUE" | "ESSENCE" | "HYBRIDE"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    const userId = session.user.id

    // Rate limiting
    const { success: rateLimitOk } = await captureRateLimit.limit(userId)
    if (!rateLimitOk) {
      return NextResponse.json({ error: "Trop de captures. Attendez quelques secondes." }, { status: 429 })
    }

    // Parse body
    const body = await req.json().catch(() => ({})) as {
      captureIntent?: string
      stakeTier?: string
      windowId?: string
      mode?: string          // legacy SAFE/RISKY
      preselectedMinute?: string  // from Machine Temporelle
      timingZone?: string         // from anchor mini-game
      minute?: string             // client-provided current minute (HH:mm)
    }

    const captureIntent: CaptureIntent =
      body.captureIntent === "ESSENCE" ? "ESSENCE"
      : body.captureIntent === "HYBRIDE" ? "HYBRIDE"
      : "RELIQUE"

    // Map legacy RISKY mode to INVESTISSEMENT, otherwise use stakeTier
    let stakeTier: StakeTier = "OBSERVATION"
    if (body.mode === "RISKY") {
      stakeTier = "INVESTISSEMENT"
    } else if (body.stakeTier && body.stakeTier in STAKE_TIERS) {
      stakeTier = body.stakeTier as StakeTier
    }

    const windowId           = typeof body.windowId === "string" ? body.windowId : undefined
    const preselectedMinute  = typeof body.preselectedMinute === "string" ? body.preselectedMinute : undefined

    // Load user
    const user = await prisma.user.findUnique({
      where:  { id: userId },
      select: {
        isPremium:           true,
        eclatsTemporels:     true,
        chronite:            true,
        essencesHistoriques: true,
        fragmentsAnomalie:   true,
        chronoEssence:       true,
        connaissanceTemp:    true,
        character: {
          select: {
            id:                 true,
            class:              true,
            level:              true,
            xpTotal:            true,
            blessedMinutes:     true,
            deathCount:         true,
            guaranteedRareNext: true,
            rerollBonusNext:    true,
            talents: { select: { talentId: true, level: true } },
          },
        },
        streakData:  { select: { comboCount: true, lastPlayedAt: true } },
        sanctuaire:  {
          select: {
            extracteur: true, generateur: true, archives: true,
            observatoire: true, forge: true, resonance: true,
            laboratoire: true, nexus: true,
          },
        },
        researchProgress: { select: { nodeId: true, level: true } },
      },
    })

    if (!user?.character) {
      return NextResponse.json({ error: "Personnage introuvable." }, { status: 404 })
    }

    const charLevel  = user.character.level
    const charClass  = user.character.class as CharacterClass
    const stake      = STAKE_TIERS[stakeTier]

    // Check stake min level
    if (charLevel < stake.minLevel) {
      return NextResponse.json(
        { error: `La mise "${stake.label}" se débloque au niveau ${stake.minLevel}.` },
        { status: 403 }
      )
    }

    // ── Daily anomalies ────────────────────────────────────────────────────────
    const todayAnomalies = getTodayAnomalies()
    const anomalyEffects = mergeAnomalyEffects(todayAnomalies)

    // ── Sanctuaire bonuses ─────────────────────────────────────────────────────
    const sanctModules = user.sanctuaire ? {
      extracteur:   user.sanctuaire.extracteur,
      generateur:   user.sanctuaire.generateur,
      archives:     user.sanctuaire.archives,
      observatoire: user.sanctuaire.observatoire,
      forge:        user.sanctuaire.forge,
      resonance:    user.sanctuaire.resonance,
      laboratoire:  user.sanctuaire.laboratoire,
      nexus:        user.sanctuaire.nexus,
    } : {}
    const sanctBonuses = computeBonuses(sanctModules)

    // ── Research bonuses ───────────────────────────────────────────────────────
    const researchMap = Object.fromEntries(
      user.researchProgress.map((r: { nodeId: string; level: number }) => [r.nodeId, r.level])
    )
    const researchSuccessBonus = (researchMap["endurance_temporelle"] ?? 0) * 0.02 // +2%/level → max +14%

    // ── Daily capture limit (freemium) ─────────────────────────────────────────
    if (!user.isPremium) {
      const capturesKey  = REDIS_KEYS.captureCount(userId)
      const capturesUsed = (await cache.get<number>(capturesKey)) ?? 0
      const talents      = Object.fromEntries(
        user.character.talents.map((t: { talentId: string; level: number }) => [t.talentId, t.level])
      )
      const classBonus   = charClass === "CHASSEUR" ? 5 : charClass === "CHRONOMANCER" ? 3 : 0
      const sprintLevel  = (talents["sprint_temporel"] as number) ?? 0
      const anomalyExtra = anomalyEffects.extraCaptures ?? 0
      const maxCaptures  = FREE_LIMITS.capturesPerDay + classBonus + (sprintLevel * 2) + Math.max(0, anomalyExtra)
      if (capturesUsed >= maxCaptures) {
        return NextResponse.json(
          { error: "Limite de captures atteinte pour aujourd'hui. Revenez demain ou passez Premium !" },
          { status: 403 }
        )
      }
      const midnight = new Date(); midnight.setHours(24, 0, 0, 0)
      const ttl = Math.floor((midnight.getTime() - Date.now()) / 1000)
      await cache.set(capturesKey, capturesUsed + 1, ttl)
    }

    // ── Resolve target minute ──────────────────────────────────────────────────
    // Prefer client-provided minute (avoids server locale/timezone mismatch)
    const clientMinute = typeof body.minute === "string" && /^\d{2}:\d{2}$/.test(body.minute)
      ? body.minute
      : undefined
    let minute        = preselectedMinute ?? clientMinute ?? formatMinute()
    const captureDate = formatCaptureDate()

    // Window validation
    if (windowId && !preselectedMinute) {
      const windowsKey = REDIS_KEYS.timeWindows(userId)
      const windowSet  = await cache.get<import("@/lib/game/windows").TimeWindowSet>(windowsKey)
      if (!windowSet) {
        return NextResponse.json({ error: "Les fenêtres temporelles ont expiré. Rechargez la page." }, { status: 400 })
      }
      if (windowSet.usedWindowId !== null) {
        return NextResponse.json({ error: "Une fenêtre a déjà été utilisée dans cette session." }, { status: 409 })
      }
      const win = windowSet.windows.find(w => w.id === windowId)
      if (!win) {
        return NextResponse.json({ error: "Fenêtre temporelle invalide." }, { status: 400 })
      }
      minute = win.minute
      windowSet.usedWindowId = windowId
      const remaining = Math.max(0, Math.floor((windowSet.generatedAt + 300000 - Date.now()) / 1000))
      await cache.set(windowsKey, windowSet, remaining || 1)
    }

    // Uniqueness check
    const existing = await prisma.relic.findUnique({
      where:  { userId_captureDate_minute: { userId, captureDate, minute } },
      select: { id: true },
    })
    if (existing) {
      return NextResponse.json(
        { error: `La minute ${minute} est déjà capturée aujourd'hui !`, alreadyCaptured: true },
        { status: 409 }
      )
    }

    // ── Stake cost deduction (upfront — lost on failure) ──────────────────────
    const stakeCost = stake.cost
    if (stakeCost.eclatsTemporels > 0 || stakeCost.chronite || stakeCost.chronoEssence) {
      const hasEclats     = user.eclatsTemporels >= (stakeCost.eclatsTemporels ?? 0)
      const hasChronite   = user.chronite        >= (stakeCost.chronite ?? 0)
      const hasChronoEss  = user.chronoEssence   >= (stakeCost.chronoEssence ?? 0)
      if (!hasEclats || !hasChronite || !hasChronoEss) {
        return NextResponse.json(
          { error: `Ressources insuffisantes pour la mise "${stake.label}".` },
          { status: 400 }
        )
      }
      await prisma.user.update({
        where: { id: userId },
        data: {
          eclatsTemporels: { decrement: stakeCost.eclatsTemporels ?? 0 },
          chronite:        { decrement: stakeCost.chronite ?? 0 },
          chronoEssence:   { decrement: stakeCost.chronoEssence ?? 0 },
        },
      })
    }

    // ── Talents map ────────────────────────────────────────────────────────────
    const talents = Object.fromEntries(
      user.character.talents.map((t: { talentId: string; level: number }) => [t.talentId, t.level])
    )

    // ── Window energy bonus ────────────────────────────────────────────────────
    // windowId presence implies medium energy; we use +5% for any window
    const windowBonus = windowId ? 0.05 : 0

    // ── Research death risk reduction ──────────────────────────────────────────
    const deathReduction = (researchMap["instinct_survie"] ?? 0) * 10 // -10%/level, max -30%
    const adjustedDeathPct = Math.max(0, stake.deathRiskPct - deathReduction)

    // ── Success chance ─────────────────────────────────────────────────────────
    const maitriseRisqueLevel = (talents["maitrise_risque"] as number) ?? 0
    const talentSuccessBonus  = maitriseRisqueLevel * 0.05
    const anomalyMod          = 1 - (anomalyEffects.failChanceAdd ?? 0)
    const successChance       = computeSuccessChance(stake.successChanceBase, {
      talentBonus:    talentSuccessBonus,
      windowBonus,
      researchBonus:  researchSuccessBonus,
      anomalyMod,
    })

    const success = Math.random() < successChance

    // ── FAILURE PATH ───────────────────────────────────────────────────────────
    if (!success) {
      // Consolation: Larme Temporelle
      const failConsolationChance = 0.05 + (researchMap["resilience_echec"] ?? 0) * 0.08
      const getsLarme = Math.random() < failConsolationChance

      if (getsLarme) {
        await prisma.user.update({
          where: { id: userId },
          data: { larmeTemporelle: { increment: 1 } },
        })
      }

      // Death roll
      const isDead = adjustedDeathPct > 0 && rollDeath(adjustedDeathPct, charLevel)

      if (isDead) {
        // Fetch existing heritage to avoid duplicate bonus offers
        const existing_heritage = await prisma.heritageTalent.findUnique({
          where: { userId },
          select: { bonuses: true, totalDeaths: true },
        })
        const existingBonusIds = (existing_heritage?.bonuses as Array<{ id: string }> ?? []).map(b => b.id)
        const options = generateHeritageOptions(charClass, charLevel, existingBonusIds)

        const pendingDeathPayload = {
          charClass,
          charLevel,
          generation: user.character.deathCount + 1,
          options,
          diedAt:     Date.now(),
        }

        // Store death state in DB (Redis-independent)
        await prisma.character.update({
          where: { id: user.character.id },
          data: {
            deathCount:      { increment: 1 },
            pendingDeathData: pendingDeathPayload as object,
          },
        })

        return NextResponse.json({
          failed:         true,
          stakeTier,
          lostCost:       stakeCost,
          consolation:    getsLarme ? { larmeTemporelle: 1 } : null,
          deathPending:   true,
          heritageOptions: options,
          message:        "Le rituel vous a consumé. Votre personnage est mort, mais son héritage demeure.",
        })
      }

      // Reset consecutive wins streak
      await cache.del(REDIS_KEYS.consecutiveWins(userId))

      return NextResponse.json({
        failed:      true,
        stakeTier,
        lostCost:    stakeCost,
        consolation: getsLarme ? { larmeTemporelle: 1 } : null,
        message:     `Échec de capture en mode "${stake.label}". Les ressources investies ont été perdues.`,
      })
    }

    // ── SUCCESS PATH ───────────────────────────────────────────────────────────

    // Track consecutive wins (for furie_temporelle research)
    const prevWins    = (await cache.get<number>(REDIS_KEYS.consecutiveWins(userId))) ?? 0
    const newWins     = Math.min(prevWins + 1, 5)
    const furieBonus  = (researchMap["furie_temporelle"] ?? 0) > 0
      ? 1 + newWins * ((researchMap["furie_temporelle"] === 1 ? 5 : 12) / 100)
      : 1
    await cache.set(REDIS_KEYS.consecutiveWins(userId), newWins, 3600)

    // Blessed + secret
    const boostActive        = !!(await cache.get(REDIS_KEYS.boostActive(userId)))
    const isOracle           = charClass === "ORACLE"
    let blessed              = isBlessedMinute(minute, user.character.blessedMinutes)
    const isSecret           = isSecretMinute(minute)
    const isNewDay           = !user.streakData?.lastPlayedAt ||
      new Date(user.streakData.lastPlayedAt).toDateString() !== new Date().toDateString()

    // Read ability flags from DB (Redis-independent)
    const guaranteedRareFlag = !!user.character.guaranteedRareNext
    const rerollBonusFlag    = !!user.character.rerollBonusNext

    // Clear consumed flags immediately
    if (guaranteedRareFlag || rerollBonusFlag) {
      await prisma.character.update({
        where: { id: user.character.id },
        data: {
          ...(guaranteedRareFlag ? { guaranteedRareNext: false } : {}),
          ...(rerollBonusFlag    ? { rerollBonusNext:    false } : {}),
        },
      })
    }

    // Stake-based rarity guarantees — investing more = guaranteed better loot
    // ENGAGEMENT/RITUEL guarantee RARE+; higher tiers boost EPIQUE+/LEGENDAIRE+
    const stakeGuaranteesRare = stakeTier === "ENGAGEMENT" || stakeTier === "RITUEL"
    const stakeEpiqueBonus    = stakeTier === "INVESTISSEMENT" ? 8
                              : stakeTier === "ENGAGEMENT"     ? 20
                              : stakeTier === "RITUEL"         ? 40 : 0
    const stakeLegBonus       = stakeTier === "ENGAGEMENT"     ? 8
                              : stakeTier === "RITUEL"         ? 20 : 0
    const stakeRareBonus      = stakeTier === "INVESTISSEMENT" ? 15
                              : stakeTier === "ENGAGEMENT"     ? 0   // already guaranteed
                              : stakeTier === "RITUEL"         ? 0   : 0

    // Timing zone bonuses from anchor mini-game
    const timingRareBonus =
      body.timingZone === "RARE" || body.timingZone === "EPIQUE" || body.timingZone === "LEGENDAIRE" ? 10 : 0
    const timingEpiqueBonus =
      body.timingZone === "EPIQUE" ? 15 : body.timingZone === "LEGENDAIRE" ? 10 : 0
    const timingLegBonus =
      body.timingZone === "LEGENDAIRE" ? 25 : 0

    // Rarity draw
    const rarity = drawRarity({
      characterClass:  charClass,
      boostActive,
      isBlessedMinute: blessed,
      guaranteedRare:  guaranteedRareFlag || stakeGuaranteesRare,
      talentBonuses: {
        chanceRare:       (talents["radar_reliques"]      ?? 0) * 10
                        + (anomalyEffects.rareChanceBonus ?? 0)
                        + stakeRareBonus
                        + timingRareBonus,
        chanceEpique:     (talents["chance_epique"]       ?? 0) * 5
                        + stakeEpiqueBonus
                        + timingEpiqueBonus,
        chanceLegendaire: (talents["oracle_legendaire"]   ?? 0) * 10
                        + (sanctBonuses.legendaireChancePct ?? 0)
                        + (anomalyEffects.legendaireChanceBonus ?? 0)
                        + (rerollBonusFlag ? 30 : 0)
                        + stakeLegBonus
                        + timingLegBonus,
        chanceMythique:   (talents["drop_mythique"]       ?? 0) * 0.5
                        + (talents["anomalie_pressentie"] ?? 0) * 1.0
                        + (talents["oracle_mythique"]     ?? 0) * 2.0
                        + (sanctBonuses.mythiqueChancePct ?? 0)
                        + (anomalyEffects.mythiqueChanceBonus ?? 0),
      },
    })

    if (isOracle && (rarity === "LEGENDAIRE" || rarity === "MYTHIQUE")) blessed = true
    if (rarity !== "COMMUNE" && (talents["benediction_temporelle"] ?? 0) > 0) blessed = true

    const event   = getEventForMinute(minute)
    const jackpot = rollJackpot(talents["jackpot_xp"] ?? 0)

    // ── XP ──────────────────────────────────────────────────────────────────
    let xpGained = calculateXP({
      rarity,
      characterClass:      charClass,
      hasHistoricalEvent:  !!event,
      comboCount:          user.streakData?.comboCount ?? 0,
      isBlessedMinute:     blessed,
      talentDistorsion:    talents["distorsion"]         ?? 0,
      talentErudit:        talents["bonus_xp_events"]    ?? 0,
      talentMemoireVive:   talents["memoire_vive"]       ?? 0,
      talentEruditSupreme: talents["erudit_supreme"]     ?? 0,
      talentFluxDivin:     talents["flux_divin"]         ?? 0,
      jackpotRoll:         jackpot,
    })

    if (["EPIQUE", "LEGENDAIRE", "MYTHIQUE"].includes(rarity) && (talents["distorsion_supreme"] ?? 0) > 0) {
      xpGained = Math.floor(xpGained * (1 + (talents["distorsion_supreme"] as number) * 0.3))
    }

    const sanctXpMult  = 1 + (sanctBonuses.xpBonusPct ?? 0) / 100
    const isRarePlus   = rarity !== "COMMUNE"
    const anomalyId0   = todayAnomalies[0].id
    const anomalyId1   = todayAnomalies[1].id
    const isMemVive    = anomalyId0 === "memoire_vive" || anomalyId1 === "memoire_vive"
    const anomalyXpMult = isMemVive
      ? (isRarePlus ? (anomalyEffects.xpMultiplier ?? 1) : 1)
      : (anomalyEffects.xpMultiplier ?? 1)

    xpGained = Math.floor(xpGained * sanctXpMult * anomalyXpMult * furieBonus)

    // ── Stake XP multiplier ──────────────────────────────────────────────────
    xpGained = Math.floor(xpGained * stake.multiplier)

    // ── Standard resource drops (RELIQUE + HYBRIDE) ───────────────────────────
    const drops = { ...RESOURCE_DROPS[rarity] }
    if (event) {
      const evtMult = anomalyEffects.eventResourceMultiplier ?? 1
      drops.eclatsTemporels     += Math.floor(RESOURCE_EVENT_BONUS.eclatsTemporels     * evtMult)
      drops.chronite            += Math.floor(RESOURCE_EVENT_BONUS.chronite            * evtMult)
      drops.essencesHistoriques += Math.floor(RESOURCE_EVENT_BONUS.essencesHistoriques * evtMult)
    }

    const anomalyResMult  = anomalyEffects.resourceMultiplier  ?? 1
    const anomalyChroMult = anomalyEffects.chroniteMultiplier  ?? 1
    drops.eclatsTemporels     = Math.floor(drops.eclatsTemporels     * anomalyResMult)
    drops.chronite            = Math.floor(drops.chronite            * anomalyResMult * anomalyChroMult)
    drops.essencesHistoriques = Math.floor(drops.essencesHistoriques * anomalyResMult)
    drops.fragmentsAnomalie   = Math.floor(drops.fragmentsAnomalie   * anomalyResMult)
      + (anomalyEffects.fragmentsPerCapture ?? 0)

    const predateurElite = (talents["predateur_elite"] as number) ?? 0
    if (predateurElite > 0) {
      const predBonus = 1 + predateurElite * 0.1
      drops.eclatsTemporels     = Math.floor(drops.eclatsTemporels     * predBonus)
      drops.chronite            = Math.floor(drops.chronite            * predBonus)
      drops.essencesHistoriques = Math.floor(drops.essencesHistoriques * predBonus)
      drops.fragmentsAnomalie   = Math.floor(drops.fragmentsAnomalie   * predBonus)
    }

    const nexusProphetique = (talents["nexus_prophetique"] as number) ?? 0
    if (rarity === "MYTHIQUE" && nexusProphetique > 0) {
      drops.essencesHistoriques = Math.floor(drops.essencesHistoriques * (1 + nexusProphetique))
      drops.fragmentsAnomalie   = Math.floor(drops.fragmentsAnomalie   * (1 + nexusProphetique))
    }

    // Apply stake multiplier to resource drops
    drops.eclatsTemporels     = Math.floor(drops.eclatsTemporels     * stake.multiplier)
    drops.chronite            = Math.floor(drops.chronite            * stake.multiplier)
    drops.essencesHistoriques = Math.floor(drops.essencesHistoriques * stake.multiplier)
    drops.fragmentsAnomalie   = Math.floor(drops.fragmentsAnomalie   * stake.multiplier)

    // Legacy RISKY extra multiplier compatibility
    if (body.mode === "RISKY") {
      xpGained                  = Math.floor(xpGained * RISKY_CAPTURE.successBonus)
      drops.eclatsTemporels     = Math.floor(drops.eclatsTemporels * RISKY_CAPTURE.successBonus)
      drops.chronite            = Math.floor(drops.chronite * RISKY_CAPTURE.successBonus)
      drops.essencesHistoriques = Math.floor(drops.essencesHistoriques * RISKY_CAPTURE.successBonus)
      drops.fragmentsAnomalie   = Math.floor(drops.fragmentsAnomalie * RISKY_CAPTURE.successBonus)
    }

    // HYBRIDE mode: reduce standard drops by 30%
    if (captureIntent === "HYBRIDE") {
      drops.eclatsTemporels     = Math.floor(drops.eclatsTemporels     * 0.7)
      drops.chronite            = Math.floor(drops.chronite            * 0.7)
      drops.essencesHistoriques = Math.floor(drops.essencesHistoriques * 0.7)
      drops.fragmentsAnomalie   = Math.floor(drops.fragmentsAnomalie   * 0.7)
      xpGained                  = Math.floor(xpGained * 0.7)
    }

    // ── Essence drops (ESSENCE + HYBRIDE) ────────────────────────────────────
    let essenceDrops: Record<string, number> = {}
    if (captureIntent === "ESSENCE" || captureIntent === "HYBRIDE") {
      const essYield     = ESSENCE_BY_RARITY[rarity] ?? ESSENCE_BY_RARITY["COMMUNE"]
      const category     = event?.category?.toLowerCase() ?? "default"
      const categoryDef  = ESSENCE_BY_CATEGORY[category] ?? ESSENCE_BY_CATEGORY["default"]

      // Research essence yield bonus
      const researchYieldBonus = 1 + ((researchMap["extraction_profonde"] ?? 0) * 0.1)
      // Hybride reduces essence by 30%
      const hybrideMult = captureIntent === "HYBRIDE" ? 0.7 : 1

      const primaryQty   = Math.floor(essYield.primaryQty   * stake.multiplier * researchYieldBonus * hybrideMult)
      const chronoQty    = Math.floor(essYield.chronoBase    * stake.multiplier * researchYieldBonus * hybrideMult)
      const connaisQty   = Math.floor(essYield.connaissanceBase * stake.multiplier * researchYieldBonus * hybrideMult)

      essenceDrops[categoryDef.primary] = primaryQty
      essenceDrops["chronoEssence"]     = (essenceDrops["chronoEssence"] ?? 0) + chronoQty
      essenceDrops["connaissanceTemp"]  = (essenceDrops["connaissanceTemp"] ?? 0) + connaisQty

      // Bonus secondary essence drop
      if (categoryDef.secondary) {
        const distilBonus = (talents["distil_bonus"] as number > 0) ? 0.15 : 0
        if (Math.random() < categoryDef.secondaryChance + distilBonus) {
          essenceDrops[categoryDef.secondary] = 1
        }
      }

      // Ancient era bonus (year < 1000 CE)
      const eventYear = event?.year
      if (eventYear && eventYear < 1000 && eventYear > 0) {
        essenceDrops["residuAncestral"] = (essenceDrops["residuAncestral"] ?? 0) + 2
      }

      // fluxAnomique during anomaly
      if (todayAnomalies.length > 0) {
        if (Math.random() < 0.10) {
          essenceDrops["fluxAnomique"] = (essenceDrops["fluxAnomique"] ?? 0) + 1
        }
      }
    }

    // ── Level up ──────────────────────────────────────────────────────────────
    const xpBefore    = user.character.xpTotal
    const xpAfter     = xpBefore + xpGained
    const levelBefore = levelFromXP(xpBefore)
    const levelAfter  = levelFromXP(xpAfter)
    const didLevelUp  = levelAfter > levelBefore

    // ── AI narration (ESSENCE/HYBRIDE skip narration for speed) ───────────────
    let narration: string | undefined
    if (captureIntent === "RELIQUE" &&
        (rarity === "EPIQUE" || rarity === "LEGENDAIRE" || rarity === "MYTHIQUE" || (event && rarity !== "COMMUNE"))) {
      narration = await generateNarration({
        minute, rarity,
        characterClass:  charClass,
        event,
        isBlessedMinute: blessed,
        isSecretMinute:  isSecret,
        hasLoreEnrichi:  (talents["lore_enrichi"] ?? 0) > 0,
      }).catch(() => undefined)
    }

    // ── DB Transaction ────────────────────────────────────────────────────────
    const dbMode = captureIntent === "RELIQUE" ? (body.mode === "RISKY" ? "RISKY" : "SAFE")
                  : captureIntent === "ESSENCE" ? "ESSENCE"
                  : "HYBRIDE"

    const relic = await prisma.$transaction(async (tx: PrismaTx) => {
      // Create relic only for RELIQUE / HYBRIDE
      let newRelic: { id: string; capturedAt: Date; historicalEvent: { title: string; year: number | null } | null } | null = null
      if (captureIntent === "RELIQUE" || captureIntent === "HYBRIDE") {
        newRelic = await tx.relic.create({
          data: {
            userId,
            minute,
            captureDate,
            rarity,
            xpGained,
            eclatsGained:   drops.eclatsTemporels,
            chroniteGained: drops.chronite,
            captureMode:    dbMode as "SAFE" | "RISKY" | "ESSENCE" | "HYBRIDE",
            historicalEventId: event
              ? (await tx.historicalEvent.findFirst({ where: { minute }, select: { id: true } }))?.id
              : undefined,
          },
          include: { historicalEvent: { select: { title: true, year: true } } },
        })
      } else {
        // ESSENCE mode: create a "ghost" relic to track the minute as captured
        newRelic = await tx.relic.create({
          data: {
            userId,
            minute,
            captureDate,
            rarity,
            xpGained,
            eclatsGained:   0,
            chroniteGained: 0,
            captureMode:    "ESSENCE",
            historicalEventId: event
              ? (await tx.historicalEvent.findFirst({ where: { minute }, select: { id: true } }))?.id
              : undefined,
          },
          include: { historicalEvent: { select: { title: true, year: true } } },
        })
      }

      // Update character XP
      await tx.character.update({
        where: { id: user.character!.id },
        data: {
          xpTotal:      xpAfter,
          xp:           xpAfter,
          level:        levelAfter,
          talentPoints: didLevelUp ? { increment: talentPointsForLevel(levelAfter) - talentPointsForLevel(levelBefore) } : undefined,
        },
      })

      // Resource update (standard drops)
      const resourceUpdate: Record<string, { increment: number }> = {}
      if (captureIntent !== "ESSENCE") {
        if (drops.eclatsTemporels     > 0) resourceUpdate["eclatsTemporels"]     = { increment: drops.eclatsTemporels }
        if (drops.chronite            > 0) resourceUpdate["chronite"]            = { increment: drops.chronite }
        if (drops.essencesHistoriques > 0) resourceUpdate["essencesHistoriques"] = { increment: drops.essencesHistoriques }
        if (drops.fragmentsAnomalie   > 0) resourceUpdate["fragmentsAnomalie"]   = { increment: drops.fragmentsAnomalie }
      }

      // Essence drops
      for (const [essType, qty] of Object.entries(essenceDrops)) {
        if (qty > 0) {
          resourceUpdate[essType] = { increment: qty }
        }
      }

      if (Object.keys(resourceUpdate).length > 0) {
        await tx.user.update({ where: { id: userId }, data: resourceUpdate })
      }

      // Streak
      const lastPlay   = user.streakData?.lastPlayedAt
      const yesterday  = new Date(); yesterday.setDate(yesterday.getDate() - 1)
      const wasYesterday = lastPlay && new Date(lastPlay).toDateString() === yesterday.toDateString()
      await tx.streakData.upsert({
        where:  { userId },
        create: { userId, lastPlayedAt: new Date(), comboCount: 1, currentStreak: 1, updatedAt: new Date() },
        update: {
          lastPlayedAt:  new Date(),
          comboCount:    { increment: 1 },
          currentStreak: isNewDay ? (wasYesterday ? { increment: 1 } : 1) : undefined,
          updatedAt:     new Date(),
        },
      })

      await cache.leaderboardAdd(REDIS_KEYS.leaderboard(), userId, xpAfter).catch(() => {})
      await tx.auditLog.create({
        data: {
          userId,
          action:   "CAPTURE",
          resource: `relic:${newRelic?.id}`,
          details:  { minute, rarity, xpGained, captureIntent, stakeTier, drops, essenceDrops },
        },
      })

      return newRelic
    })

    // Fire-and-forget chain completion check
    let newlyCompletedChains: Array<{ chainId: string; label: string }> = []
    try {
      const { computeChainProgress, CHAIN_DEFINITIONS } = await import("@/lib/game/chains")
      const [chainRelics, chainClaims] = await Promise.all([
        prisma.relic.findMany({
          where:  { userId },
          select: { minute: true, historicalEvent: { select: { category: true, year: true } } },
        }),
        prisma.questClaim.findMany({
          where:  { userId, questId: { startsWith: "chain_" } },
          select: { questId: true },
        }),
      ])
      const claimedIds = new Set(chainClaims.map((c: { questId: string }) => c.questId.replace("chain_", "")))
      const progress   = computeChainProgress(chainRelics, claimedIds)
      newlyCompletedChains = progress
        .filter(p => p.completed && !p.claimed)
        .map(p => ({
          chainId: p.chainId,
          label:   CHAIN_DEFINITIONS.find(c => c.id === p.chainId)?.label ?? p.chainId,
        }))
    } catch { /* ignore */ }

    return NextResponse.json({
      relicId:     relic?.id,
      minute,
      rarity,
      xpGained,
      narration,
      eventTitle:  relic?.historicalEvent?.title,
      eventYear:   relic?.historicalEvent?.year,
      isMythique:  rarity === "MYTHIQUE",
      didLevelUp,
      newLevel:    didLevelUp ? levelAfter : undefined,
      jackpot,
      captureIntent,
      stakeTier,
      drops:       captureIntent === "ESSENCE" ? {} : drops,
      essenceDrops: captureIntent !== "RELIQUE" ? essenceDrops : {},
      anomalies:   todayAnomalies.map((a) => ({ id: a.id, label: a.label, icon: a.icon })),
      newlyCompletedChains,
      relic: relic ? {
        id: relic.id, minute, rarity, xpGained,
        capturedAt: relic.capturedAt, isFused: false,
        historicalEvent: relic.historicalEvent,
      } : null,
    })
  } catch (err) {
    console.error("[capture] Unhandled error:", err)
    return NextResponse.json({ error: "Une erreur interne est survenue. Réessayez." }, { status: 500 })
  }
}
