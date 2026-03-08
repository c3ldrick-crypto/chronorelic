import { create } from "zustand"
import { persist } from "zustand/middleware"
import { Rarity } from "@/types"

export interface CaptureResult {
  minute:    string
  rarity:    Rarity
  xpGained:  number
  narration?: string
  eventTitle?: string
  eventYear?:  number
  isMythique?: boolean
  relicId:    string
}

interface GameStore {
  // Session de jeu
  capturesThisSession:  number
  comboCount:           number
  lastCaptureTime:      number | null
  rerollsLeft:          number

  // Résultat en attente d'affichage
  pendingResult: CaptureResult | null

  // Actions
  incrementCapture:      () => void
  updateCombo:           () => void
  resetCombo:            () => void
  setPendingResult:      (result: CaptureResult | null) => void
  useReroll:             () => void
  resetSession:          () => void
}

const COMBO_TIMEOUT_MS = 60 * 1000  // 1 minute pour maintenir le combo

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      capturesThisSession: 0,
      comboCount:          0,
      lastCaptureTime:     null,
      rerollsLeft:         0,
      pendingResult:       null,

      incrementCapture: () => {
        set((s) => ({ capturesThisSession: s.capturesThisSession + 1 }))
        get().updateCombo()
      },

      updateCombo: () => {
        const now   = Date.now()
        const last  = get().lastCaptureTime
        const combo = get().comboCount

        if (last && now - last < COMBO_TIMEOUT_MS) {
          set({ comboCount: combo + 1, lastCaptureTime: now })
        } else {
          set({ comboCount: 1, lastCaptureTime: now })
        }
      },

      resetCombo: () => set({ comboCount: 0, lastCaptureTime: null }),

      setPendingResult: (result) => set({ pendingResult: result }),

      useReroll: () => {
        const left = get().rerollsLeft
        if (left > 0) set({ rerollsLeft: left - 1 })
      },

      resetSession: () =>
        set({
          capturesThisSession: 0,
          comboCount:           0,
          lastCaptureTime:      null,
          pendingResult:        null,
        }),
    }),
    {
      name:    "chronorelic-game",
      partialize: (s) => ({
        rerollsLeft:     s.rerollsLeft,
        lastCaptureTime: s.lastCaptureTime,
        comboCount:      s.comboCount,
      }),
    }
  )
)
