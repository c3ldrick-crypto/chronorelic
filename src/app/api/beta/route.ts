import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

// ── POST /api/beta — inscription publique ───────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({})) as { email?: string; name?: string; source?: string }

    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : ""
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Adresse email invalide." }, { status: 400 })
    }

    const name   = typeof body.name === "string" ? body.name.trim().slice(0, 100) : undefined
    const source = typeof body.source === "string" ? body.source.slice(0, 50) : "landing"

    // Upsert — pas d'erreur si l'email existe déjà
    await prisma.betaSubscriber.upsert({
      where:  { email },
      create: { email, name: name || null, source },
      update: { name: name || undefined },
    })

    return NextResponse.json({ ok: true, message: "Inscription enregistrée !" })
  } catch (err: unknown) {
    console.error("[beta/POST]", err)
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 })
  }
}

// ── GET /api/beta — liste admin (ADMIN only) ────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Accès refusé." }, { status: 403 })
    }

    const format = req.nextUrl.searchParams.get("format") // "csv" ou json par défaut

    const subscribers = await prisma.betaSubscriber.findMany({
      orderBy: { createdAt: "desc" },
    })

    if (format === "csv") {
      const header = "id,email,name,source,note,createdAt"
      const rows   = subscribers.map(s =>
        [s.id, `"${s.email}"`, `"${s.name ?? ""}"`, s.source, `"${s.note ?? ""}"`, s.createdAt.toISOString()].join(",")
      )
      const csv = [header, ...rows].join("\n")
      return new Response(csv, {
        headers: {
          "Content-Type":        "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="beta-subscribers-${new Date().toISOString().slice(0,10)}.csv"`,
        },
      })
    }

    return NextResponse.json({ subscribers, total: subscribers.length })
  } catch (err: unknown) {
    console.error("[beta/GET]", err)
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 })
  }
}

// ── DELETE /api/beta — suppression admin ────────────────────────────────────
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Accès refusé." }, { status: 403 })
    }

    const { id } = await req.json().catch(() => ({})) as { id?: string }
    if (!id) return NextResponse.json({ error: "ID manquant." }, { status: 400 })

    await prisma.betaSubscriber.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (err: unknown) {
    console.error("[beta/DELETE]", err)
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 })
  }
}

// ── PATCH /api/beta — ajout manuel admin ────────────────────────────────────
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Accès refusé." }, { status: 403 })
    }

    const body = await req.json().catch(() => ({})) as { email?: string; name?: string; note?: string }
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : ""
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Email invalide." }, { status: 400 })
    }

    const subscriber = await prisma.betaSubscriber.upsert({
      where:  { email },
      create: { email, name: body.name?.trim() || null, note: body.note?.trim() || null, source: "manual" },
      update: { name: body.name?.trim() || undefined, note: body.note?.trim() || undefined },
    })

    return NextResponse.json({ ok: true, subscriber })
  } catch (err: unknown) {
    console.error("[beta/PATCH]", err)
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 })
  }
}
