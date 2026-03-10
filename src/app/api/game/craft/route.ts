import { NextResponse } from "next/server"

// Craft system — coming soon in v3
export async function GET() {
  return NextResponse.json({ items: [], resources: {} })
}

export async function POST() {
  return NextResponse.json({ error: "Le système de craft arrive bientôt." }, { status: 410 })
}
