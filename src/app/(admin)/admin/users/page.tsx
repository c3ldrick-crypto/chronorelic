import { prisma } from "@/lib/prisma"
import { formatDate } from "@/lib/utils"
import { Zap, ShieldCheck } from "lucide-react"

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id:             true,
      name:           true,
      email:          true,
      role:           true,
      isPremium:      true,
      temporalShards: true,
      createdAt:      true,
      character: {
        select: { class: true, level: true, xpTotal: true },
      },
      _count: {
        select: { relics: true },
      },
    },
  })

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-black text-[#e2e8f0] mb-1">Gestion Utilisateurs</h1>
        <p className="text-[#94a3b8] text-sm">{users.length} utilisateur{users.length > 1 ? "s" : ""} enregistré{users.length > 1 ? "s" : ""}</p>
      </div>

      <div className="card-cosmic overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1e1e42]">
                <th className="text-left p-4 text-[#94a3b8] font-semibold">Joueur</th>
                <th className="text-left p-4 text-[#94a3b8] font-semibold">Classe</th>
                <th className="text-left p-4 text-[#94a3b8] font-semibold">Niveau</th>
                <th className="text-left p-4 text-[#94a3b8] font-semibold">Reliques</th>
                <th className="text-left p-4 text-[#94a3b8] font-semibold">Éclats</th>
                <th className="text-left p-4 text-[#94a3b8] font-semibold">Statut</th>
                <th className="text-left p-4 text-[#94a3b8] font-semibold">Inscrit le</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u: (typeof users)[number]) => (
                <tr key={u.id} className="border-b border-[#1e1e42] hover:bg-[#1e1e42]/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-xs font-bold text-violet-300 shrink-0">
                        {(u.name ?? "?")[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-[#e2e8f0]">{u.name ?? "—"}</div>
                        <div className="text-xs text-[#475569] truncate max-w-[180px]">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-[#94a3b8]">{u.character?.class ?? "—"}</td>
                  <td className="p-4">
                    <span className="font-bold text-violet-300">{u.character?.level ?? "—"}</span>
                  </td>
                  <td className="p-4 text-[#94a3b8]">{u._count.relics}</td>
                  <td className="p-4 text-amber-300 font-semibold">{u.temporalShards}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {u.isPremium && (
                        <span className="flex items-center gap-1 text-xs font-bold text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-full px-2 py-0.5">
                          <Zap className="h-2.5 w-2.5" /> PRO
                        </span>
                      )}
                      {u.role === "ADMIN" && (
                        <span className="flex items-center gap-1 text-xs font-bold text-red-300 bg-red-500/10 border border-red-500/20 rounded-full px-2 py-0.5">
                          <ShieldCheck className="h-2.5 w-2.5" /> ADMIN
                        </span>
                      )}
                      {!u.isPremium && u.role !== "ADMIN" && (
                        <span className="text-xs text-[#475569]">Gratuit</span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-[#475569]">{formatDate(u.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
