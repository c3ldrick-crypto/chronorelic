import { prisma } from "@/lib/prisma"
import { HISTORICAL_EVENTS } from "@/lib/game/events"
import { BookOpen, Database, Globe } from "lucide-react"

async function getEventStats() {
  try {
    const [dbEvents, relicsByEvent] = await Promise.all([
      prisma.historicalEvent.findMany({
        select: { id: true, minute: true, title: true, year: true },
        orderBy: { minute: "asc" },
      }),
      prisma.relic.groupBy({
        by:     ["historicalEventId"],
        where:  { historicalEventId: { not: null } },
        _count: { _all: true },
      }),
    ])

    const captureMap = new Map(
      relicsByEvent.map((r: { historicalEventId: string | null; _count: { _all: number } }) => [r.historicalEventId, r._count._all])
    )

    return { dbEvents, captureMap, error: null }
  } catch {
    return { dbEvents: [], captureMap: new Map<string, number>(), error: "Base de données non connectée" }
  }
}

export default async function AdminEventsPage() {
  const { dbEvents, captureMap, error } = await getEventStats()

  const dbMinutes = new Set(dbEvents.map((e: { minute: string }) => e.minute))

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-black text-[#e2e8f0] mb-1">Événements Historiques</h1>
        <p className="text-[#94a3b8] text-sm">
          {HISTORICAL_EVENTS.length} événements statiques · {dbEvents.length} en base de données
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-center gap-3">
          <Database className="h-5 w-5 text-amber-400 shrink-0" />
          <div>
            <div className="text-sm font-semibold text-amber-300">{error}</div>
            <div className="text-xs text-[#94a3b8] mt-0.5">
              Configurez DATABASE_URL dans .env.local puis lancez prisma migrate dev
            </div>
          </div>
        </div>
      )}

      {/* Stats globales */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="card-cosmic p-5 text-center">
          <div className="text-3xl font-black font-display text-violet-300 mb-1">
            {HISTORICAL_EVENTS.length}
          </div>
          <div className="text-xs text-[#94a3b8] uppercase tracking-wider">Événements statiques</div>
        </div>
        <div className="card-cosmic p-5 text-center">
          <div className="text-3xl font-black font-display text-emerald-300 mb-1">
            {dbEvents.length}
          </div>
          <div className="text-xs text-[#94a3b8] uppercase tracking-wider">En base de données</div>
        </div>
        <div className="card-cosmic p-5 text-center">
          <div className="text-3xl font-black font-display text-amber-300 mb-1">
            {Array.from(captureMap.values()).reduce((a, b) => a + b, 0)}
          </div>
          <div className="text-xs text-[#94a3b8] uppercase tracking-wider">Captures liées</div>
        </div>
      </div>

      {/* Tableau des événements */}
      <div className="card-cosmic overflow-hidden">
        <div className="px-6 py-4 border-b border-[#1e1e42] flex items-center gap-2">
          <Globe className="h-4 w-4 text-violet-400" />
          <h2 className="font-bold text-[#e2e8f0]">Événements définis</h2>
          <span className="ml-auto text-xs text-[#475569]">
            Éditez src/lib/game/events.ts pour modifier
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1e1e42]">
                <th className="text-left p-4 text-[#94a3b8] font-semibold w-20">Minute</th>
                <th className="text-left p-4 text-[#94a3b8] font-semibold w-16">Année</th>
                <th className="text-left p-4 text-[#94a3b8] font-semibold">Titre</th>
                <th className="text-left p-4 text-[#94a3b8] font-semibold w-32">Description</th>
                <th className="text-center p-4 text-[#94a3b8] font-semibold w-24">DB</th>
                <th className="text-center p-4 text-[#94a3b8] font-semibold w-24">Captures</th>
              </tr>
            </thead>
            <tbody>
              {HISTORICAL_EVENTS.map((ev) => {
                const inDb    = dbMinutes.has(ev.minute)
                const dbEvent = dbEvents.find((d: { minute: string }) => d.minute === ev.minute)
                const captures = dbEvent ? (captureMap.get(dbEvent.id) ?? 0) : 0

                return (
                  <tr key={ev.minute} className="border-b border-[#1e1e42] hover:bg-[#1e1e42]/30 transition-colors">
                    <td className="p-4">
                      <span className="font-mono font-black text-violet-300 text-base tracking-widest">
                        {ev.minute}
                      </span>
                    </td>
                    <td className="p-4 text-amber-300 font-semibold">{ev.year}</td>
                    <td className="p-4 font-medium text-[#e2e8f0]">{ev.title}</td>
                    <td className="p-4 text-[#94a3b8] text-xs max-w-xs">
                      <span className="line-clamp-2">{ev.description}</span>
                    </td>
                    <td className="p-4 text-center">
                      {inDb ? (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2 py-0.5">
                          <BookOpen className="h-3 w-3" /> Sync
                        </span>
                      ) : (
                        <span className="text-xs text-[#475569] bg-[#1e1e42] rounded-full px-2 py-0.5">
                          Non seedé
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {captures > 0 ? (
                        <span className="font-bold text-violet-300">{captures}</span>
                      ) : (
                        <span className="text-[#475569]">—</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Instructions seed */}
      <div className="mt-6 card-cosmic p-5">
        <h3 className="font-bold text-[#e2e8f0] mb-3 flex items-center gap-2">
          <Database className="h-4 w-4 text-violet-400" />
          Initialiser la base de données
        </h3>
        <p className="text-sm text-[#94a3b8] mb-3">
          Une fois DATABASE_URL configuré, lancez ces commandes pour créer les tables et peupler les événements :
        </p>
        <div className="space-y-2">
          {[
            'node node_modules/prisma/build/index.js migrate dev --name init',
            'node node_modules/prisma/build/index.js db seed',
          ].map((cmd) => (
            <div key={cmd} className="bg-[#0e0e24] border border-[#1e1e42] rounded-lg px-4 py-2.5">
              <code className="text-xs text-violet-300 font-mono">{cmd}</code>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
