"use client"

import { usePathname } from "next/navigation"

const PAGE_BACKGROUNDS: Record<string, string> = {
  "/play":        "/bg/capturer.png",
  "/collection":  "/bg/collection.png",
  "/inventory":   "/bg/collection.png",
  "/atelier":     "/bg/atelier.png",
  "/expedition":  "/bg/expedition.png",
  "/machine":     "/bg/machine.png",
  "/research":    "/bg/recherche.png",
  "/talents":     "/bg/talents.png",
  "/quetes":      "/bg/quetes.png",
  "/profile":     "/bg/profil.png",
  "/character":   "/bg/classes.png",
  "/sanctuaire":  "/bg/design.png",
}

function resolveBackground(pathname: string): string | null {
  for (const [route, img] of Object.entries(PAGE_BACKGROUNDS)) {
    if (pathname === route || pathname.startsWith(route + "/")) return img
  }
  return null
}

export function GameBackground() {
  const pathname = usePathname()
  const bgImage = resolveBackground(pathname)
  if (!bgImage) return null

  return (
    <div
      aria-hidden
      style={{
        position:           "fixed",
        inset:              0,
        zIndex:             -1,
        backgroundImage:    `url(${bgImage})`,
        backgroundSize:     "cover",
        backgroundPosition: "center top",
        backgroundRepeat:   "no-repeat",
      }}
    >
      {/* Voile très léger — l'image reste le visuel principal */}
      <div style={{ position: "absolute", inset: 0, background: "rgba(5,4,14,0.30)" }} />
    </div>
  )
}
