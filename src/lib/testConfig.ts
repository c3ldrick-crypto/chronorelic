import type { Rarity } from "@/types"

export interface TestConfig {
  active:               boolean
  // Rareté
  forceRarity:          Rarity | null
  // Événement historique
  forceEvent:           boolean
  eventTitle:           string
  eventYear:            number
  eventDescription:     string
  eventCuriosity:       string
  // Chronolithe (Relique Netflix)
  forceChronolithe:     boolean
  chronolitheStoryId:   string | null
  // Kairos (Relique Kairos)
  forceKairos:          boolean
  kairosStoryId:        string | null
  // Capture
  bypassMinuteUniqueness: boolean
}

export const DEFAULT_TEST_CONFIG: TestConfig = {
  active:                 false,
  forceRarity:            null,
  forceEvent:             false,
  eventTitle:             "",
  eventYear:              2000,
  eventDescription:       "",
  eventCuriosity:         "",
  forceChronolithe:       false,
  chronolitheStoryId:     null,
  forceKairos:            false,
  kairosStoryId:          null,
  bypassMinuteUniqueness: false,
}
