"use client"

import { useEffect } from "react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="fr">
      <body style={{ background: "#08081a", color: "#e2e8f0", fontFamily: "system-ui, sans-serif", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", margin: 0 }}>
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>⏳</div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
            Erreur critique
          </h2>
          <p style={{ color: "#94a3b8", marginBottom: "1.5rem" }}>
            Le tissu du temps s&apos;est déchiré.
          </p>
          <button
            onClick={reset}
            style={{ background: "#7c3aed", color: "white", border: "none", borderRadius: "0.5rem", padding: "0.75rem 1.5rem", cursor: "pointer", fontSize: "1rem" }}
          >
            Réinitialiser
          </button>
        </div>
      </body>
    </html>
  )
}
