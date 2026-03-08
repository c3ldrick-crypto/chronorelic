import { prisma } from "@/lib/prisma"
import { cache, REDIS_KEYS } from "@/lib/redis"
import { formatXP, formatDate } from "@/lib/utils"
import { RARITY_CONFIG, Rarity } from "@/types"
import { Users, Package, Zap, TrendingUp, Activity } from "lucide-react"

async function getStats() {
  const [
    totalUsers,
    premiumUsers,
    totalRelics,
    recentRelics,
    recentUsers,
    relicsByRarity,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { isPremium: true } }),
    prisma.relic.count(),
    prisma.relic.findMany({
      orderBy: { capturedAt: "desc" },
      take:    10,
      include: { user: { select: { name: true } } },
    }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take:    5,
      select:  { id: true, name: true, email: true, role: true, isPremium: true, createdAt: true },
    }),
    prisma.relic.groupBy({
      by:     ["rarity"],
      _count: { _all: true },
    }),
  ])

  const leaderboard = await cache.leaderboardTop(REDIS_KEYS.leaderboard(), 5)

  return { totalUsers, premiumUsers, totalRelics, recentRelics, recentUsers, relicsByRarity, leaderboard }
}

export default async function AdminDashboard() {
  const stats = await getStats()

  const STAT_CARDS = [
    { label: "Utilisateurs",    value: stats.totalUsers,   icon: Users,      color: "violet" },
    { label: "Premium",         value: stats.premiumUsers, icon: Zap,        color: "amber"  },
    { label: "Reliques totales",value: stats.totalRelics,  icon: Package,    color: "blue"   },
    { label: "Taux Premium",    value: `${stats.totalUsers > 0 ? Math.round((stats.premiumUsers / stats.totalUsers) * 100) : 0}%`, icon: TrendingUp, color: "emerald" },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-black text-[#e2e8f0] mb-1">Dashboard Admin</h1>
        <p className="text-[#94a3b8] text-sm">Vue globale de ChronoRelic</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {STAT_CARDS.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card-cosmic p-5">
            <div className={`flex items-center gap-2 mb-3 text-${color}-400`}>
              <Icon className="h-5 w-5" />
              <span className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">{label}</span>
            </div>
            <div className="text-3xl font-black font-display text-[#e2e8f0]">{value}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Reliques par rareté */}
        <div className="card-cosmic p-6">
          <h2 className="font-bold text-[#e2e8f0] mb-4 flex items-center gap-2">
            <Activity className="h-4 w-4 text-violet-400" />
            Reliques par Rareté
          </h2>
          <div className="space-y-3">
            {(["MYTHIQUE", "LEGENDAIRE", "EPIQUE", "RARE", "COMMUNE"] as Rarity[]).map((r) => {
              const count  = stats.relicsByRarity.find((x: (typeof stats.relicsByRarity)[number]) => x.rarity === r)?._count._all ?? 0
              const config = RARITY_CONFIG[r]
              const pct    = stats.totalRelics > 0 ? (count / stats.totalRelics) * 100 : 0
              return (
                <div key={r}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className={`font-semibold rarity-${r.toLowerCase()}`}>{config.emoji} {config.label}</span>
                    <span className="text-[#94a3b8]">{count}</span>
                  </div>
                  <div className="h-1.5 bg-[#1e1e42] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${pct}%`,
                        background: config.glow.replace("rgba(", "rgb(").replace(", 0.4)", ")"),
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Dernières captures */}
        <div className="card-cosmic p-6">
          <h2 className="font-bold text-[#e2e8f0] mb-4">Dernières Captures</h2>
          <div className="space-y-3">
            {stats.recentRelics.map((r: (typeof stats.recentRelics)[number]) => (
              <div key={r.id} className="flex items-center gap-3 text-sm">
                <span className="font-mono font-bold text-[#e2e8f0] w-12 shrink-0">{r.minute}</span>
                <span className={`text-xs rarity-${r.rarity.toLowerCase()}`}>
                  {RARITY_CONFIG[r.rarity as Rarity].emoji}
                </span>
                <span className="text-[#94a3b8] truncate flex-1">{r.user.name ?? "—"}</span>
                <span className="text-xs text-[#475569]">
                  {new Date(r.capturedAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Nouveaux utilisateurs */}
        <div className="card-cosmic p-6">
          <h2 className="font-bold text-[#e2e8f0] mb-4">Derniers Inscrits</h2>
          <div className="space-y-3">
            {stats.recentUsers.map((u: (typeof stats.recentUsers)[number]) => (
              <div key={u.id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-sm font-bold text-violet-300 shrink-0">
                  {(u.name ?? "?")[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-[#e2e8f0] truncate">{u.name ?? "—"}</div>
                  <div className="text-xs text-[#475569] truncate">{u.email}</div>
                </div>
                {u.isPremium && (
                  <span className="text-xs text-amber-400 font-bold">PRO</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
