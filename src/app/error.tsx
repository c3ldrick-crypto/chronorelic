"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

export default function Error({
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
    <div className="min-h-screen flex items-center justify-center bg-[#08081a] px-4">
      <div className="text-center max-w-md">
        <div className="text-7xl mb-6">⚠️</div>
        <h2 className="font-display text-3xl font-black text-[#e2e8f0] mb-2">
          Anomalie Temporelle
        </h2>
        <p className="text-[#94a3b8] mb-2">
          Une erreur inattendue a perturbé le continuum.
        </p>
        {error.digest && (
          <p className="text-xs text-[#475569] font-mono mb-6">
            Ref: {error.digest}
          </p>
        )}
        <Button
          onClick={reset}
          className="btn-primary flex items-center gap-2 mx-auto"
        >
          <RefreshCw className="h-4 w-4" />
          Réessayer
        </Button>
      </div>
    </div>
  )
}
