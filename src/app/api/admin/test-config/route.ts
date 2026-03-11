import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { cache, REDIS_KEYS } from "@/lib/redis"
import { type TestConfig, DEFAULT_TEST_CONFIG } from "@/lib/testConfig"

async function requireAdmin() {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") return null
  return session
}

export async function GET() {
  if (!await requireAdmin()) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
  }
  const cfg = await cache.get<TestConfig>(REDIS_KEYS.testConfig())
  return NextResponse.json(cfg ?? DEFAULT_TEST_CONFIG)
}

export async function POST(req: NextRequest) {
  if (!await requireAdmin()) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
  }
  const body = await req.json() as Partial<TestConfig>
  const current = await cache.get<TestConfig>(REDIS_KEYS.testConfig()) ?? { ...DEFAULT_TEST_CONFIG }
  const next: TestConfig = { ...current, ...body }
  // TTL 24h — se réinitialise seul le lendemain
  await cache.set(REDIS_KEYS.testConfig(), next, 86400)
  return NextResponse.json(next)
}

export async function DELETE() {
  if (!await requireAdmin()) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
  }
  await cache.del(REDIS_KEYS.testConfig())
  return NextResponse.json(DEFAULT_TEST_CONFIG)
}
