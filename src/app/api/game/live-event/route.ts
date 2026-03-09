import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { getEventForMinute } from "@/lib/game/events"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
  }

  const minute = req.nextUrl.searchParams.get("minute")
  if (!minute || !/^\d{2}:\d{2}$/.test(minute)) {
    return NextResponse.json({ event: null })
  }

  const event = getEventForMinute(minute)
  return NextResponse.json({ event: event ?? null })
}
