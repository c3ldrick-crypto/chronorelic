import { NextResponse } from "next/server"

// Expedition system removed in v2
export async function GET() {
  return NextResponse.json({ expedition: null })
}

export async function POST() {
  return NextResponse.json({ error: "Les expéditions ne sont pas disponibles dans cette version." }, { status: 410 })
}
