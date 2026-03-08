import { Redis } from "@upstash/redis"
import { Ratelimit } from "@upstash/ratelimit"

// Vérifie si Redis est correctement configuré (URL réelle, pas placeholder)
const redisUrl   = process.env.UPSTASH_REDIS_REST_URL ?? ""
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN ?? ""
const isRedisConfigured = redisUrl.startsWith("https://") &&
  !redisUrl.includes("[") && redisToken.length > 10

export const redis = isRedisConfigured
  ? new Redis({ url: redisUrl, token: redisToken })
  : null as unknown as Redis

// Stub rate limiter pour quand Redis n'est pas disponible (dev / test)
const allowAllLimiter = {
  limit: async (_id: string) => ({ success: true, limit: 999, remaining: 999, reset: 0, pending: Promise.resolve() }),
}

type RateLimiter = { limit: (id: string) => Promise<{ success: boolean }> }

function makeRatelimit(limiter: unknown, prefix: string): RateLimiter {
  if (!isRedisConfigured) return allowAllLimiter
  return new Ratelimit({ redis, limiter: limiter as never, analytics: true, prefix })
}

// Rate limiters (sécurité OWASP A07)
export const captureRateLimit = makeRatelimit(Ratelimit.slidingWindow(30, "1 m"),  "rl:capture")
export const authRateLimit    = makeRatelimit(Ratelimit.slidingWindow(5, "15 m"),  "rl:auth")
export const apiRateLimit     = makeRatelimit(Ratelimit.slidingWindow(100, "1 m"), "rl:api")

// Helpers cache (dégradent gracieusement si Redis non configuré)
export const cache = {
  async get<T>(key: string): Promise<T | null> {
    if (!isRedisConfigured) return null
    return redis.get<T>(key)
  },
  async set(key: string, value: unknown, ttlSeconds = 300): Promise<void> {
    if (!isRedisConfigured) return
    await redis.set(key, value, { ex: ttlSeconds })
  },
  async del(key: string): Promise<void> {
    if (!isRedisConfigured) return
    await redis.del(key)
  },
  async incr(key: string): Promise<number> {
    if (!isRedisConfigured) return 0
    return redis.incr(key)
  },
  // Leaderboard (sorted set)
  async leaderboardAdd(key: string, userId: string, xp: number): Promise<void> {
    if (!isRedisConfigured) return
    await redis.zadd(key, { score: xp, member: userId })
  },
  async leaderboardTop(key: string, count = 10): Promise<{ member: string; score: number }[]> {
    if (!isRedisConfigured) return []
    const results = await redis.zrange(key, 0, count - 1, { rev: true })
    return (results as string[]).map((member) => ({ member, score: 0 }))
  },
  async leaderboardRank(key: string, userId: string): Promise<number | null> {
    if (!isRedisConfigured) return null
    const rank = await redis.zrank(key, userId)
    return rank !== null ? rank + 1 : null
  },
}

// Clés Redis
export const REDIS_KEYS = {
  captureCount:    (userId: string) => `game:captures:${userId}:${new Date().toDateString()}`,
  boostActive:     (userId: string) => `game:boost:${userId}`,
  rarityBoost:     (userId: string) => `game:boost:rarity:${userId}`,
  rerollCount:     (userId: string) => `game:rerolls:${userId}:${new Date().toDateString()}`,
  sessionData:     (token: string)  => `session:${token}`,
  historicalEvent: (minute: string) => `event:${minute}`,
  leaderboard:     ()               => `leaderboard:global`,
  // Class active abilities (daily tracking)
  abilityUses:     (userId: string, abilityId: string) =>
    `game:ability:${userId}:${abilityId}:${new Date().toISOString().slice(0, 10)}`,
  // Chasseur guaranteed RARE+ next capture flag
  guaranteedRare:  (userId: string) => `game:guaranteed_rare:${userId}`,
  // Chronomancer reroll bonus flag
  rerollBonus:     (userId: string) => `game:reroll_bonus:${userId}`,
  // Time windows (3 random minutes for capture)
  timeWindows:     (userId: string) => `game:windows:${userId}:${new Date().toISOString().slice(0, 10)}`,
  // Active expedition
  expedition:      (userId: string) => `game:expedition:${userId}`,
  // Expedition cooldown per era
  expeditionCooldown: (userId: string, eraId: string) => `game:expedition:cd:${userId}:${eraId}`,
  // Chain progress cache
  chainCache:          (userId: string) => `game:chains:${userId}`,
  // Machine Temporelle recharge tracking
  machineRecharge:     (userId: string) => `game:machine:recharge:${userId}`,
  // Heritage / death system
  pendingDeath:        (userId: string) => `game:death:${userId}`,
  heritageOptions:     (userId: string) => `game:heritage:options:${userId}`,
  // Consecutive wins streak for furie_temporelle research
  consecutiveWins:     (userId: string) => `game:streak:wins:${userId}`,
}
