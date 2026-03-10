import { NextResponse } from "next/server"
export async function GET() { return NextResponse.json({ error: "Non supporté" }, { status: 410 }) }
export async function POST() { return NextResponse.json({ error: "Non supporté" }, { status: 410 }) }
