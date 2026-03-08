import Link from "next/link"
import { Clock, Home } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#08081a] px-4">
      <div className="text-center max-w-md">
        <div className="text-8xl mb-6">⏳</div>
        <h1 className="font-display text-6xl font-black text-gradient-violet mb-2">404</h1>
        <h2 className="text-2xl font-bold text-[#e2e8f0] mb-3">Instant Introuvable</h2>
        <p className="text-[#94a3b8] mb-8 leading-relaxed">
          Cette minute n&apos;existe pas dans le continuum temporel.
          Les fils du temps se sont peut-être emmêlés.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/play"
            className="btn-primary flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold"
          >
            <Clock className="h-4 w-4" />
            Capturer le temps
          </Link>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold border border-[#1e1e42] text-[#94a3b8] hover:text-[#e2e8f0] hover:bg-[#1e1e42] transition-colors"
          >
            <Home className="h-4 w-4" />
            Accueil
          </Link>
        </div>
      </div>
    </div>
  )
}
