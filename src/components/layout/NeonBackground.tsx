"use client"

/**
 * NeonBackground — fond vivant neon bleu/orange.
 * Technique "neon tube" : double passe SVG (halo épais flou + filon fin lumineux).
 * Bleu depuis le coin haut-gauche, orange depuis le coin bas-gauche, fusion au centre.
 */
export function NeonBackground() {
  return (
    <div className="neon-bg-root" aria-hidden>
      {/* ── Base sombre ─────────────────────────────────────── */}
      <div className="neon-base" />

      {/* ── Orbes de couleur (halos larges et doux) ─────────── */}
      <div className="neon-orb orb-blue-tl" />
      <div className="neon-orb orb-orange-bl" />
      <div className="neon-orb orb-mix" />

      {/* ══════════════════════════════════════════════════════
          SVG BLEU — coin haut-gauche
          Technique double passe : 1) halo épais+flou  2) filon fin+vif
      ══════════════════════════════════════════════════════ */}
      <svg className="neon-svg svg-tl" viewBox="0 0 820 640" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="glow-b-fat" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="22" />
          </filter>
          <filter id="glow-b-med" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="8" />
          </filter>
        </defs>

        {/* ─── Branche B1 — diagonale principale ──────────────── */}
        {/* halo */}
        <path d="M -10 -10 C 90 110, 220 200, 390 300" stroke="#00c8ff" strokeWidth="44" strokeLinecap="round" opacity="0.12" filter="url(#glow-b-fat)" className="nb nb-b1-h" />
        {/* lueur intermédiaire */}
        <path d="M -10 -10 C 90 110, 220 200, 390 300" stroke="#00c8ff" strokeWidth="6" strokeLinecap="round" opacity="0.25" filter="url(#glow-b-med)" className="nb nb-b1-h" />
        {/* filon vif */}
        <path d="M -10 -10 C 90 110, 220 200, 390 300" stroke="#7eeeff" strokeWidth="1.4" strokeLinecap="round" className="nb nb-b1" />

        {/* ─── Branche B2 — horizontale douce ─────────────────── */}
        <path d="M -10 15 C 110 38, 280 55, 500 75" stroke="#00c8ff" strokeWidth="36" strokeLinecap="round" opacity="0.10" filter="url(#glow-b-fat)" className="nb nb-b2-h" />
        <path d="M -10 15 C 110 38, 280 55, 500 75" stroke="#00c8ff" strokeWidth="5" strokeLinecap="round" opacity="0.22" filter="url(#glow-b-med)" className="nb nb-b2-h" />
        <path d="M -10 15 C 110 38, 280 55, 500 75" stroke="#7eeeff" strokeWidth="1.1" strokeLinecap="round" className="nb nb-b2" />

        {/* ─── Branche B3 — descendante ────────────────────────── */}
        <path d="M 12 -10 C 35 130, 88 250, 135 410" stroke="#00c8ff" strokeWidth="32" strokeLinecap="round" opacity="0.10" filter="url(#glow-b-fat)" className="nb nb-b3-h" />
        <path d="M 12 -10 C 35 130, 88 250, 135 410" stroke="#00c8ff" strokeWidth="4" strokeLinecap="round" opacity="0.20" filter="url(#glow-b-med)" className="nb nb-b3-h" />
        <path d="M 12 -10 C 35 130, 88 250, 135 410" stroke="#7eeeff" strokeWidth="0.9" strokeLinecap="round" className="nb nb-b3" />

        {/* ─── Fork BF1 (depuis B1 ≈ 220,200) ─────────────────── */}
        <path d="M 220 200 C 290 225, 360 215, 470 240" stroke="#00c8ff" strokeWidth="24" strokeLinecap="round" opacity="0.09" filter="url(#glow-b-fat)" className="nb nb-bf1-h" />
        <path d="M 220 200 C 290 225, 360 215, 470 240" stroke="#00c8ff" strokeWidth="3" strokeLinecap="round" opacity="0.18" filter="url(#glow-b-med)" className="nb nb-bf1-h" />
        <path d="M 220 200 C 290 225, 360 215, 470 240" stroke="#7eeeff" strokeWidth="0.8" strokeLinecap="round" className="nb nb-bf1" />

        {/* ─── Fork BF2 (depuis B1 ≈ 280,245) ─────────────────── */}
        <path d="M 280 245 C 305 295, 325 345, 340 410" stroke="#00c8ff" strokeWidth="20" strokeLinecap="round" opacity="0.08" filter="url(#glow-b-fat)" className="nb nb-bf2-h" />
        <path d="M 280 245 C 305 295, 325 345, 340 410" stroke="#00c8ff" strokeWidth="2.5" strokeLinecap="round" opacity="0.16" filter="url(#glow-b-med)" className="nb nb-bf2-h" />
        <path d="M 280 245 C 305 295, 325 345, 340 410" stroke="#7eeeff" strokeWidth="0.7" strokeLinecap="round" className="nb nb-bf2" />

        {/* ─── Fork BF3 (depuis B2 ≈ 310,60) ──────────────────── */}
        <path d="M 310 60 C 355 110, 385 170, 400 240" stroke="#00c8ff" strokeWidth="18" strokeLinecap="round" opacity="0.08" filter="url(#glow-b-fat)" className="nb nb-bf3-h" />
        <path d="M 310 60 C 355 110, 385 170, 400 240" stroke="#00c8ff" strokeWidth="2" strokeLinecap="round" opacity="0.15" filter="url(#glow-b-med)" className="nb nb-bf3-h" />
        <path d="M 310 60 C 355 110, 385 170, 400 240" stroke="#7eeeff" strokeWidth="0.65" strokeLinecap="round" className="nb nb-bf3" />
      </svg>

      {/* ══════════════════════════════════════════════════════
          SVG ORANGE — coin bas-gauche
      ══════════════════════════════════════════════════════ */}
      <svg className="neon-svg svg-bl" viewBox="0 0 820 640" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="glow-o-fat" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="22" />
          </filter>
          <filter id="glow-o-med" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="8" />
          </filter>
        </defs>

        {/* ─── Branche O1 — diagonale montante principale ─────── */}
        <path d="M -10 650 C 90 530, 220 440, 390 340" stroke="#ff6500" strokeWidth="44" strokeLinecap="round" opacity="0.13" filter="url(#glow-o-fat)" className="nb nb-o1-h" />
        <path d="M -10 650 C 90 530, 220 440, 390 340" stroke="#ff6500" strokeWidth="6" strokeLinecap="round" opacity="0.26" filter="url(#glow-o-med)" className="nb nb-o1-h" />
        <path d="M -10 650 C 90 530, 220 440, 390 340" stroke="#ffaa55" strokeWidth="1.4" strokeLinecap="round" className="nb nb-o1" />

        {/* ─── Branche O2 — horizontale vers droite ───────────── */}
        <path d="M -10 625 C 110 600, 280 585, 500 565" stroke="#ff6500" strokeWidth="36" strokeLinecap="round" opacity="0.10" filter="url(#glow-o-fat)" className="nb nb-o2-h" />
        <path d="M -10 625 C 110 600, 280 585, 500 565" stroke="#ff6500" strokeWidth="5" strokeLinecap="round" opacity="0.22" filter="url(#glow-o-med)" className="nb nb-o2-h" />
        <path d="M -10 625 C 110 600, 280 585, 500 565" stroke="#ffaa55" strokeWidth="1.1" strokeLinecap="round" className="nb nb-o2" />

        {/* ─── Branche O3 — montante verticale ───────────────── */}
        <path d="M 12 650 C 35 510, 88 390, 135 230" stroke="#ff6500" strokeWidth="32" strokeLinecap="round" opacity="0.10" filter="url(#glow-o-fat)" className="nb nb-o3-h" />
        <path d="M 12 650 C 35 510, 88 390, 135 230" stroke="#ff6500" strokeWidth="4" strokeLinecap="round" opacity="0.20" filter="url(#glow-o-med)" className="nb nb-o3-h" />
        <path d="M 12 650 C 35 510, 88 390, 135 230" stroke="#ffaa55" strokeWidth="0.9" strokeLinecap="round" className="nb nb-o3" />

        {/* ─── Fork OF1 (depuis O1 ≈ 220,440) ─────────────────── */}
        <path d="M 220 440 C 290 415, 360 425, 470 400" stroke="#ff6500" strokeWidth="24" strokeLinecap="round" opacity="0.09" filter="url(#glow-o-fat)" className="nb nb-of1-h" />
        <path d="M 220 440 C 290 415, 360 425, 470 400" stroke="#ff6500" strokeWidth="3" strokeLinecap="round" opacity="0.18" filter="url(#glow-o-med)" className="nb nb-of1-h" />
        <path d="M 220 440 C 290 415, 360 425, 470 400" stroke="#ffaa55" strokeWidth="0.8" strokeLinecap="round" className="nb nb-of1" />

        {/* ─── Fork OF2 (depuis O1 ≈ 280,395) ─────────────────── */}
        <path d="M 280 395 C 305 345, 325 295, 340 230" stroke="#ff6500" strokeWidth="20" strokeLinecap="round" opacity="0.08" filter="url(#glow-o-fat)" className="nb nb-of2-h" />
        <path d="M 280 395 C 305 345, 325 295, 340 230" stroke="#ff6500" strokeWidth="2.5" strokeLinecap="round" opacity="0.16" filter="url(#glow-o-med)" className="nb nb-of2-h" />
        <path d="M 280 395 C 305 345, 325 295, 340 230" stroke="#ffaa55" strokeWidth="0.7" strokeLinecap="round" className="nb nb-of2" />

        {/* ─── Fork OF3 (depuis O2 ≈ 310,580) ─────────────────── */}
        <path d="M 310 580 C 355 535, 385 480, 400 410" stroke="#ff6500" strokeWidth="18" strokeLinecap="round" opacity="0.08" filter="url(#glow-o-fat)" className="nb nb-of3-h" />
        <path d="M 310 580 C 355 535, 385 480, 400 410" stroke="#ff6500" strokeWidth="2" strokeLinecap="round" opacity="0.15" filter="url(#glow-o-med)" className="nb nb-of3-h" />
        <path d="M 310 580 C 355 535, 385 480, 400 410" stroke="#ffaa55" strokeWidth="0.65" strokeLinecap="round" className="nb nb-of3" />
      </svg>

      {/* ── Particules flottantes ──────────────────────────── */}
      <div className="neon-particles">
        <div className="np np-0" /><div className="np np-1" /><div className="np np-2" />
        <div className="np np-3" /><div className="np np-4" /><div className="np np-5" />
        <div className="np np-6" /><div className="np np-7" />
      </div>
    </div>
  )
}
