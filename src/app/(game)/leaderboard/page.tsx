import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { cache, REDIS_KEYS } from "@/lib/redis"
import { levelFromXP } from "@/lib/game/xp"
import { Trophy, Flame, Zap, Star } from "lucide-react"

interface LeaderboardEntry {
  rank:      number
  userId:    string
  name:      string
  level:     number
  xpTotal:   number
  isPremium: boolean
  score:     number  // score Redis (XP total)
}

const CLASS_ICONS: Record<string, string> = {
  CHRONOMANCER: "⏰",
  ARCHIVISTE:   "📚",
  CHASSEUR:     "⚡",
  ORACLE:       "🔮",
}

async function getLeaderboard(currentUserId: string): Promise<{
  top: LeaderboardEntry[]
  currentUserRank: number | null
}> {
  try {
    // Top 50 depuis Redis (scores = XP total)
    const top50 = await cache.leaderboardTop(REDIS_KEYS.leaderboard(), 50)

    if (!top50.length) return { top: [], currentUserRank: null }

    const userIds = top50.map((e: { member: string }) => e.member)

    const users = await prisma.user.findMany({
      where:  { id: { in: userIds } },
      select: {
        id:        true,
        name:      true,
        isPremium: true,
        character: { select: { level: true, xpTotal: true, class: true } },
      },
    })

    const userMap = new Map(users.map((u) => [u.id, u]))

    const entries: LeaderboardEntry[] = top50
      .map((entry: { member: string; score: number }, i: number) => {
        const user = userMap.get(entry.member)
        if (!user) return null
        return {
          rank:      i + 1,
          userId:    user.id,
          name:      user.name ?? "Gardien",
          level:     user.character ? levelFromXP(user.character.xpTotal) : 1,
          xpTotal:   user.character?.xpTotal ?? 0,
          isPremium: user.isPremium,
          score:     entry.score,
        }
      })
      .filter((e): e is LeaderboardEntry => e !== null)

    const currentUserRank = await cache.leaderboardRank(REDIS_KEYS.leaderboard(), currentUserId)

    return { top: entries, currentUserRank }
  } catch {
    return { top: [], currentUserRank: null }
  }
}

export default async function LeaderboardPage() {
  const session = await auth()
  const userId  = session?.user?.id ?? ""

  const { top, currentUserRank } = await getLeaderboard(userId)

  const medals = ["🥇", "🥈", "🥉"]

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Trophy className="h-8 w-8 text-amber-400" />
        <div>
          <h1 className="font-display text-3xl font-black text-gradient-gold">Classement</h1>
          <p className="text-sm text-[#94a3b8]">Les Gardiens du Temps les plus puissants</p>
        </div>
        {currentUserRank !== null && (
          <div className="ml-auto text-center">
            <div className="text-2xl font-black font-display text-violet-300">#{currentUserRank}</div>
            <div className="text-xs text-[#475569]">Votre rang</div>
          </div>
        )}
      </div>

      {top.length === 0 ? (
        <div className="card-cosmic p-12 text-center">
          <Trophy className="h-16 w-16 text-[#1e1e42] mx-auto mb-4" />
          <p className="text-[#475569]">Aucun classement disponible.</p>
          <p className="text-xs text-[#475569] mt-2">
            Jouez pour apparaître dans le classement !
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {top.map((entry) => {
            const isCurrentUser = entry.userId === userId
            const medal = medals[entry.rank - 1]

            return (
              <div
                key={entry.userId}
                className={`card-cosmic p-4 flex items-center gap-4 transition-all ${
                  isCurrentUser
                    ? "border-violet-500/50 ring-1 ring-violet-500/20"
                    : entry.rank <= 3
                    ? "border-amber-500/20"
                    : ""
                }`}
              >
                {/* Rang */}
                <div className="w-10 text-center shrink-0">
                  {medal ? (
                    <span className="text-2xl">{medal}</span>
                  ) : (
                    <span className="font-display font-black text-[#475569] text-lg">
                      #{entry.rank}
                    </span>
                  )}
                </div>

                {/* Avatar */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0 ${
                  isCurrentUser
                    ? "bg-violet-500/30 border-2 border-violet-500/60"
                    : "bg-[#1e1e42] border border-[#2e2e52]"
                }`}>
                  {(entry.name)[0].toUpperCase()}
                </div>

                {/* Infos */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`font-bold truncate ${isCurrentUser ? "text-violet-300" : "text-[#e2e8f0]"}`}>
                      {entry.name}
                      {isCurrentUser && <span className="text-xs text-violet-400 ml-1">(vous)</span>}
                    </span>
                    {entry.isPremium && (
                      <span className="flex items-center gap-0.5 text-[10px] font-bold text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-full px-1.5 py-0.5 shrink-0">
                        <Zap className="h-2.5 w-2.5" /> PRO
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-violet-400 flex items-center gap-1">
                      <Star className="h-3 w-3" /> Niv. {entry.level}
                    </span>
                    <span className="text-xs text-[#475569]">
                      {entry.xpTotal.toLocaleString("fr-FR")} XP
                    </span>
                  </div>
                </div>

                {/* Score */}
                <div className="text-right shrink-0">
                  <div className="font-black font-display text-lg text-amber-300">
                    {entry.score.toLocaleString("fr-FR")}
                  </div>
                  <div className="text-[10px] text-[#475569]">points</div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Explication du score */}
      <div className="mt-8 card-cosmic p-4 flex items-start gap-3">
        <Flame className="h-5 w-5 text-orange-400 shrink-0 mt-0.5" />
        <div className="text-sm text-[#94a3b8]">
          <span className="text-[#e2e8f0] font-semibold">Comment le score est calculé :</span>{" "}
          Chaque relique capturée ajoute son XP au classement. Les reliques légendaires et mythiques
          valent beaucoup plus — et le bonus de streak peut multiplier les gains.
        </div>
      </div>
    </div>
  )
}
