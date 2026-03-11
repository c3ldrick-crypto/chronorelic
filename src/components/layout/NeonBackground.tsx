"use client"

/**
 * NeonBackground — halos colorés doux, sans SVG ni branches.
 * Bleu haut-gauche, orange bas-gauche, zone de fusion au centre.
 */
export function NeonBackground() {
  return (
    <div className="neon-bg-root" aria-hidden>
      <div className="neon-base" />
      <div className="neon-orb orb-blue-tl" />
      <div className="neon-orb orb-orange-bl" />
      <div className="neon-orb orb-mix" />
      <div className="neon-particles">
        <div className="np np-0" /><div className="np np-1" />
        <div className="np np-2" /><div className="np np-3" />
        <div className="np np-4" /><div className="np np-5" />
      </div>
    </div>
  )
}
