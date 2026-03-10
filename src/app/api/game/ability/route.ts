import { NextResponse } from "next/server"

// Abilities removed in v2 — simplified mechanics
export async function GET() {
  return NextResponse.json({ ability: null })
}

export async function POST() {
  return NextResponse.json({ error: "Capacités spéciales non disponibles dans cette version." }, { status: 410 })
}
