"use client"

/**
 * NeonBackground — fond d'écran vivant pour toutes les pages du jeu.
 * Branches de néon bleu (#00c8ff) et orange (#ff6500) qui s'étirent
 * depuis les coins, avec lueurs et animations douces.
 */
export function NeonBackground() {
  return (
    <div
      className="neon-bg-root"
      aria-hidden
    >
      {/* ── Fond de base ──────────────────────────────────────────────── */}
      <div className="neon-bg-base" />

      {/* ── Orbe bleu — haut gauche (adouci) ─────────────────────────── */}
      <div className="neon-orb neon-orb-blue" />

      {/* ── Orbe orange — bas gauche (nouveau) ───────────────────────── */}
      <div className="neon-orb neon-orb-orange" />

      {/* ── Orbe bleu secondaire — centre droit (très subtil) ─────────── */}
      <div className="neon-orb neon-orb-blue-secondary" />

      {/* ── SVG branches bleu — top-left ──────────────────────────────── */}
      <svg className="neon-svg neon-svg-blue" viewBox="0 0 900 700" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="glow-blue" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="glow-blue-soft" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="7" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Branche principale 1 */}
        <path
          d="M 0 0 C 60 80, 180 120, 280 200"
          stroke="#00c8ff" strokeWidth="1.2" strokeLinecap="round"
          filter="url(#glow-blue)"
          className="neon-branch nb-b1"
        />
        {/* Fork 1a */}
        <path
          d="M 160 110 C 220 160, 300 140, 380 180"
          stroke="#00c8ff" strokeWidth="0.8" strokeLinecap="round"
          filter="url(#glow-blue)"
          className="neon-branch nb-b1a"
        />
        {/* Fork 1b */}
        <path
          d="M 200 150 C 240 200, 260 260, 300 320"
          stroke="#00c8ff" strokeWidth="0.7" strokeLinecap="round"
          filter="url(#glow-blue)"
          className="neon-branch nb-b1b"
        />

        {/* Branche principale 2 */}
        <path
          d="M 0 0 C 40 120, 100 220, 180 340"
          stroke="#00c8ff" strokeWidth="1.0" strokeLinecap="round"
          filter="url(#glow-blue)"
          className="neon-branch nb-b2"
        />
        {/* Fork 2a */}
        <path
          d="M 100 200 C 160 230, 240 210, 320 240"
          stroke="#00c8ff" strokeWidth="0.6" strokeLinecap="round"
          filter="url(#glow-blue)"
          className="neon-branch nb-b2a"
        />

        {/* Branche principale 3 — plus horizontale */}
        <path
          d="M 0 20 C 100 40, 240 60, 400 80"
          stroke="#00c8ff" strokeWidth="0.9" strokeLinecap="round"
          filter="url(#glow-blue)"
          className="neon-branch nb-b3"
        />
        {/* Fork 3a */}
        <path
          d="M 240 65 C 290 100, 320 160, 350 220"
          stroke="#00c8ff" strokeWidth="0.55" strokeLinecap="round"
          filter="url(#glow-blue)"
          className="neon-branch nb-b3a"
        />

        {/* Micro-branches terminales */}
        <path d="M 280 200 C 310 230, 340 250, 360 280" stroke="#00c8ff" strokeWidth="0.4" strokeLinecap="round" filter="url(#glow-blue-soft)" className="neon-branch nb-m1" />
        <path d="M 180 340 C 210 360, 250 355, 290 370" stroke="#00c8ff" strokeWidth="0.4" strokeLinecap="round" filter="url(#glow-blue-soft)" className="neon-branch nb-m2" />
        <path d="M 380 180 C 410 210, 430 240, 420 280" stroke="#00c8ff" strokeWidth="0.35" strokeLinecap="round" filter="url(#glow-blue-soft)" className="neon-branch nb-m3" />
      </svg>

      {/* ── SVG branches orange — bottom-left ────────────────────────── */}
      <svg className="neon-svg neon-svg-orange" viewBox="0 0 900 700" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="glow-orange" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="glow-orange-soft" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="7" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Branche principale 1 — monte vers droite */}
        <path
          d="M 0 700 C 60 620, 180 580, 290 500"
          stroke="#ff6500" strokeWidth="1.2" strokeLinecap="round"
          filter="url(#glow-orange)"
          className="neon-branch nb-o1"
        />
        {/* Fork 1a */}
        <path
          d="M 160 590 C 220 540, 310 560, 390 520"
          stroke="#ff6500" strokeWidth="0.8" strokeLinecap="round"
          filter="url(#glow-orange)"
          className="neon-branch nb-o1a"
        />
        {/* Fork 1b */}
        <path
          d="M 200 550 C 240 500, 265 440, 310 380"
          stroke="#ff6500" strokeWidth="0.7" strokeLinecap="round"
          filter="url(#glow-orange)"
          className="neon-branch nb-o1b"
        />

        {/* Branche principale 2 */}
        <path
          d="M 0 700 C 40 580, 110 480, 200 360"
          stroke="#ff6500" strokeWidth="1.0" strokeLinecap="round"
          filter="url(#glow-orange)"
          className="neon-branch nb-o2"
        />
        {/* Fork 2a */}
        <path
          d="M 110 490 C 170 460, 250 480, 330 460"
          stroke="#ff6500" strokeWidth="0.6" strokeLinecap="round"
          filter="url(#glow-orange)"
          className="neon-branch nb-o2a"
        />

        {/* Branche principale 3 — plus horizontale */}
        <path
          d="M 0 680 C 100 660, 240 640, 410 620"
          stroke="#ff6500" strokeWidth="0.9" strokeLinecap="round"
          filter="url(#glow-orange)"
          className="neon-branch nb-o3"
        />
        {/* Fork 3a */}
        <path
          d="M 250 635 C 295 600, 325 540, 358 480"
          stroke="#ff6500" strokeWidth="0.55" strokeLinecap="round"
          filter="url(#glow-orange)"
          className="neon-branch nb-o3a"
        />

        {/* Micro-branches terminales */}
        <path d="M 290 500 C 320 470, 355 450, 370 420" stroke="#ff6500" strokeWidth="0.4" strokeLinecap="round" filter="url(#glow-orange-soft)" className="neon-branch nb-om1" />
        <path d="M 200 360 C 230 340, 270 345, 305 330" stroke="#ff6500" strokeWidth="0.4" strokeLinecap="round" filter="url(#glow-orange-soft)" className="neon-branch nb-om2" />
        <path d="M 390 520 C 420 490, 445 460, 435 420" stroke="#ff6500" strokeWidth="0.35" strokeLinecap="round" filter="url(#glow-orange-soft)" className="neon-branch nb-om3" />
      </svg>

      {/* ── Particules flottantes (points lumineux) ───────────────────── */}
      <div className="neon-particles">
        {[...Array(8)].map((_, i) => (
          <div key={i} className={`neon-particle neon-particle-${i}`} />
        ))}
      </div>
    </div>
  )
}
