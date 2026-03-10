"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { FlaskConical, Lock, CheckCircle, ChevronRight } from "lucide-react"
import { RESEARCH_TREE, type ResearchBranch } from "@/lib/game/research"

interface ResearchNodeState {
  id:           string
  label:        string
  description:  string
  icon:         string
  branch:       ResearchBranch
  maxLevel:     number
  costPerLevel: number[]
  prerequisite?: string
  effect:       { type: string; value: number[]; description: string }
  currentLevel: number
  isMaxed:      boolean
  isUnlocked:   boolean
  nextCost:     number | null
}

interface ResearchData {
  connaissance: number
  nodes:        ResearchNodeState[]
}

const BRANCH_CONFIG: Record<ResearchBranch, { label: string; icon: string; color: string; border: string }> = {
  temporal:    { label: "Temporal",    icon: "⧗", color: "text-violet-400", border: "border-violet-500/30" },
  essence:     { label: "Essence",     icon: "⚗", color: "text-amber-400",  border: "border-amber-500/30"  },
  combat:      { label: "Combat",      icon: "⚔", color: "text-red-400",    border: "border-red-500/30"    },
  exploration: { label: "Exploration", icon: "🧭", color: "text-cyan-400",   border: "border-cyan-500/30"   },
}

function NodeCard({
  node,
  onUnlock,
  connaissance,
}: {
  node:        ResearchNodeState
  onUnlock:    (id: string) => void
  connaissance: number
}) {
  const [unlocking, setUnlocking] = useState(false)
  const branch = BRANCH_CONFIG[node.branch]
  const canAfford = (node.nextCost ?? Infinity) <= connaissance

  const handleUnlock = async () => {
    if (unlocking || node.isMaxed || !node.isUnlocked || !canAfford) return
    setUnlocking(true)
    try {
      await onUnlock(node.id)
    } finally {
      setUnlocking(false)
    }
  }

  return (
    <motion.div
      whileHover={node.isUnlocked && !node.isMaxed ? { scale: 1.02 } : {}}
      className={`rounded-xl border p-4 transition-all ${
        !node.isUnlocked
          ? "border-slate-800/50 bg-slate-900/20 opacity-50"
          : node.isMaxed
            ? `${branch.border} bg-slate-800/30 opacity-80`
            : `${branch.border} bg-slate-800/40 hover:bg-slate-800/60`
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="text-2xl mt-0.5">{node.isUnlocked ? node.icon : "🔒"}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className={`font-semibold text-sm ${node.isUnlocked ? "text-slate-100" : "text-slate-500"}`}>
                {node.label}
              </p>
              {node.isMaxed && <CheckCircle className="h-4 w-4 text-green-400 shrink-0" />}
              {!node.isUnlocked && <Lock className="h-3 w-3 text-slate-600 shrink-0" />}
            </div>
            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{node.description}</p>

            {/* Effect */}
            <p className={`text-xs mt-1.5 font-medium ${branch.color}`}>
              {node.effect.description.replace("X",
                node.isMaxed
                  ? String(node.effect.value[node.maxLevel])
                  : String(node.effect.value[Math.max(1, node.currentLevel + 1)] ?? "?")
              )}
            </p>

            {/* Prerequisite */}
            {node.prerequisite && !node.isUnlocked && (
              <p className="text-xs text-slate-600 mt-1">
                Requis: {RESEARCH_TREE.find(n => n.id === node.prerequisite)?.label ?? node.prerequisite}
              </p>
            )}
          </div>
        </div>

        {/* Level indicator */}
        <div className="text-right shrink-0">
          <div className="flex gap-0.5 justify-end">
            {Array.from({ length: node.maxLevel }).map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-sm ${
                  i < node.currentLevel ? "bg-green-400" : "bg-slate-700"
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-1">{node.currentLevel}/{node.maxLevel}</p>
        </div>
      </div>

      {/* Unlock button */}
      {node.isUnlocked && !node.isMaxed && (
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs">
            <span className="text-amber-400">📜</span>
            <span className={canAfford ? "text-slate-300" : "text-red-400"}>
              {node.nextCost} Connaissance
            </span>
          </div>
          <button
            onClick={handleUnlock}
            disabled={unlocking || !canAfford}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              canAfford
                ? `${branch.color.replace("text-", "bg-").replace("400", "950/40")} hover:brightness-110 border ${branch.border} text-slate-100`
                : "bg-slate-800 text-slate-600 cursor-not-allowed"
            }`}
          >
            {unlocking ? "..." : <><ChevronRight className="h-3 w-3" /> Débloquer</>}
          </button>
        </div>
      )}
    </motion.div>
  )
}

export default function ResearchPage() {
  const [data, setData]         = useState<ResearchData | null>(null)
  const [loading, setLoading]   = useState(true)
  const [activeBranch, setActiveBranch] = useState<ResearchBranch>("temporal")

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/game/research")
      if (!res.ok) throw new Error()
      setData(await res.json() as ResearchData)
    } catch {
      toast.error("Erreur de chargement.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const handleUnlock = useCallback(async (nodeId: string) => {
    const res  = await fetch("/api/game/research", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ nodeId }),
    })
    const json = await res.json() as { message?: string; error?: string }
    if (!res.ok) {
      toast.error(json.error ?? "Erreur")
      return
    }
    toast.success(json.message ?? "Recherche débloquée !")
    await load()
  }, [load])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FlaskConical className="h-10 w-10 text-amber-400 animate-pulse" />
      </div>
    )
  }

  if (!data) return null

  const branches: ResearchBranch[] = ["temporal", "essence", "combat", "exploration"]
  const branchNodes = data.nodes.filter(n => n.branch === activeBranch)

  return (
    <div className="min-h-screen p-4 max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <FlaskConical className="h-10 w-10 text-amber-400 mx-auto mb-2" />
        <h1 className="text-2xl font-bold text-slate-100">Arbre de Recherche</h1>
        <div className="flex items-center justify-center gap-2 mt-2">
          <span className="text-amber-300 text-lg">📜</span>
          <span className="text-xl font-bold font-mono text-amber-300">{data.connaissance}</span>
          <span className="text-slate-400 text-sm">Connaissance Temporelle</span>
        </div>
      </div>

      {/* Branch tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {branches.map(b => {
          const cfg  = BRANCH_CONFIG[b]
          const done = data.nodes.filter(n => n.branch === b && n.isMaxed).length
          const total = data.nodes.filter(n => n.branch === b).length
          return (
            <button
              key={b}
              onClick={() => setActiveBranch(b)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap border transition-all ${
                activeBranch === b
                  ? `${cfg.border} ${cfg.color} bg-slate-800`
                  : "border-slate-700/40 text-slate-400 hover:text-slate-200 bg-slate-800/30"
              }`}
            >
              <span>{cfg.icon}</span>
              {cfg.label}
              <span className={`text-xs ${done === total ? "text-green-400" : "text-slate-500"}`}>
                {done}/{total}
              </span>
            </button>
          )
        })}
      </div>

      {/* Node list */}
      <div className="space-y-3">
        {branchNodes.map(node => (
          <NodeCard
            key={node.id}
            node={node}
            onUnlock={handleUnlock}
            connaissance={data.connaissance}
          />
        ))}
      </div>

      {branchNodes.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          <p>Aucun nœud dans cette branche.</p>
        </div>
      )}
    </div>
  )
}
