"use client"

import { useEffect, useState } from "react"
import { Download, Trash2, Plus, RefreshCw } from "lucide-react"

interface Subscriber {
  id:        string
  email:     string
  name:      string | null
  source:    string
  note:      string | null
  createdAt: string
}

export default function AdminBetaPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [total,       setTotal]       = useState(0)
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState("")

  // Manual add form
  const [addEmail, setAddEmail] = useState("")
  const [addName,  setAddName]  = useState("")
  const [addNote,  setAddNote]  = useState("")
  const [adding,   setAdding]   = useState(false)
  const [addMsg,   setAddMsg]   = useState("")

  async function load() {
    setLoading(true)
    setError("")
    try {
      const r = await fetch("/api/beta")
      if (!r.ok) { setError("Erreur lors du chargement."); setLoading(false); return }
      const d = await r.json()
      setSubscribers(d.subscribers ?? [])
      setTotal(d.total ?? 0)
    } catch {
      setError("Erreur réseau.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function handleDelete(id: string, email: string) {
    if (!confirm(`Supprimer ${email} ?`)) return
    const r = await fetch("/api/beta", {
      method:  "DELETE",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ id }),
    })
    if (r.ok) setSubscribers(prev => prev.filter(s => s.id !== id))
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!addEmail) return
    setAdding(true)
    setAddMsg("")
    const r = await fetch("/api/beta", {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ email: addEmail, name: addName, note: addNote }),
    })
    const d = await r.json().catch(() => ({}))
    if (r.ok) {
      setAddMsg("Ajouté !")
      setAddEmail(""); setAddName(""); setAddNote("")
      load()
    } else {
      setAddMsg(d.error ?? "Erreur.")
    }
    setAdding(false)
  }

  function downloadCSV() {
    window.open("/api/beta?format=csv", "_blank")
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-black text-gradient-violet">Bêta Waitlist</h1>
          <p className="text-sm text-[#64748b] mt-1">{total} inscrit{total !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={load}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-white/5 hover:bg-white/10 text-[#94a3b8] transition-all border border-white/10"
          >
            <RefreshCw className="h-4 w-4" />
            Actualiser
          </button>
          <button
            onClick={downloadCSV}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border"
            style={{
              background: "linear-gradient(135deg, rgba(107,40,200,0.2), rgba(107,40,200,0.1))",
              borderColor: "rgba(107,40,200,0.4)",
              color: "#c4b5fd",
            }}
          >
            <Download className="h-4 w-4" />
            Exporter CSV
          </button>
        </div>
      </div>

      {/* Ajout manuel */}
      <form onSubmit={handleAdd} className="mb-8 rounded-2xl p-6 border border-white/10 bg-white/[0.02]">
        <h2 className="text-sm font-semibold text-[#94a3b8] mb-4 flex items-center gap-2">
          <Plus className="h-4 w-4" /> Ajouter manuellement
        </h2>
        <div className="flex flex-wrap gap-3">
          <input
            type="email"
            placeholder="email@exemple.com *"
            value={addEmail}
            onChange={e => setAddEmail(e.target.value)}
            required
            className="flex-1 min-w-[200px] rounded-xl px-4 py-2.5 text-sm bg-white/5 border border-white/10 text-[#f0e6c8] placeholder-[#475569] outline-none"
          />
          <input
            type="text"
            placeholder="Prénom (optionnel)"
            value={addName}
            onChange={e => setAddName(e.target.value)}
            className="w-40 rounded-xl px-4 py-2.5 text-sm bg-white/5 border border-white/10 text-[#f0e6c8] placeholder-[#475569] outline-none"
          />
          <input
            type="text"
            placeholder="Note interne"
            value={addNote}
            onChange={e => setAddNote(e.target.value)}
            className="w-48 rounded-xl px-4 py-2.5 text-sm bg-white/5 border border-white/10 text-[#f0e6c8] placeholder-[#475569] outline-none"
          />
          <button
            type="submit"
            disabled={adding}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{ background: "linear-gradient(135deg, #5b21b6, #7c3aed)", color: "#fff", opacity: adding ? 0.6 : 1 }}
          >
            {adding ? "..." : "Ajouter"}
          </button>
        </div>
        {addMsg && <p className="text-xs mt-2" style={{ color: addMsg === "Ajouté !" ? "#6ee7b7" : "#f43f5e" }}>{addMsg}</p>}
      </form>

      {/* Table */}
      {loading ? (
        <div className="text-center py-16 text-[#475569]">Chargement…</div>
      ) : error ? (
        <div className="text-center py-16 text-red-400">{error}</div>
      ) : subscribers.length === 0 ? (
        <div className="text-center py-16 text-[#475569]">Aucun inscrit pour le moment.</div>
      ) : (
        <div className="rounded-2xl border border-white/10 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02]">
                <th className="text-left px-4 py-3 text-[#64748b] font-medium">Email</th>
                <th className="text-left px-4 py-3 text-[#64748b] font-medium">Prénom</th>
                <th className="text-left px-4 py-3 text-[#64748b] font-medium">Source</th>
                <th className="text-left px-4 py-3 text-[#64748b] font-medium">Note</th>
                <th className="text-left px-4 py-3 text-[#64748b] font-medium">Date</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {subscribers.map((s, i) => (
                <tr
                  key={s.id}
                  className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                  style={{ background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)" }}
                >
                  <td className="px-4 py-3 text-[#f0e6c8] font-mono text-xs">{s.email}</td>
                  <td className="px-4 py-3 text-[#94a3b8]">{s.name ?? <span className="text-[#334155]">—</span>}</td>
                  <td className="px-4 py-3">
                    <span
                      className="px-2 py-0.5 rounded text-xs font-medium"
                      style={{
                        background: s.source === "manual" ? "rgba(196,150,10,0.15)" : "rgba(107,40,200,0.15)",
                        color:      s.source === "manual" ? "#c4960a" : "#a78bfa",
                      }}
                    >
                      {s.source}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#64748b] text-xs max-w-[160px] truncate">{s.note ?? "—"}</td>
                  <td className="px-4 py-3 text-[#475569] text-xs whitespace-nowrap">
                    {new Date(s.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(s.id, s.email)}
                      className="p-1.5 rounded-lg text-[#475569] hover:text-red-400 hover:bg-red-400/10 transition-all"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
