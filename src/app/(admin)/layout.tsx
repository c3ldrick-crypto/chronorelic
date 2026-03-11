import { redirect } from "next/navigation"
import { auth } from "@/auth"
import Link from "next/link"
import { LayoutDashboard, Users, BookOpen, ChevronRight, FlaskConical, TestTube2 } from "lucide-react"

const ADMIN_NAV = [
  { href: "/admin",        label: "Dashboard",    icon: LayoutDashboard },
  { href: "/admin/users",  label: "Utilisateurs", icon: Users           },
  { href: "/admin/events", label: "Événements",   icon: BookOpen        },
  { href: "/admin/beta",   label: "Bêta Waitlist",icon: FlaskConical    },
  { href: "/admin/loot",   label: "Loot Lab",     icon: TestTube2       },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (!session?.user) {
    redirect("/play")
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar Admin */}
      <aside className="w-64 shrink-0 glass border-r border-[#1e1e42] flex flex-col">
        <div className="p-6 border-b border-[#1e1e42]">
          <Link href="/play" className="flex items-center gap-2">
            <span className="text-2xl">⏳</span>
            <div>
              <div className="font-display font-black text-gradient-violet text-sm">ChronoRelic</div>
              <div className="text-xs text-amber-400 font-semibold">Administration</div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {ADMIN_NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#94a3b8] hover:bg-amber-500/10 hover:text-amber-300 transition-all group"
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1">{label}</span>
              <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-[#1e1e42]">
          <Link href="/play" className="text-xs text-[#475569] hover:text-[#94a3b8] transition-colors">
            ← Retour au jeu
          </Link>
        </div>
      </aside>

      {/* Contenu admin */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
