import { isOfferedSpeechModel } from './speech-model-retirement'
import { speechModelQuality } from './speech-model-quality'
import type { SpeechModelManifest } from './speech-types'

/**
 * The on-device model one-click setup offers for a language: one the catalog names for it, else the
 * recommended default when it handles the language, else the best measured model that does.
 */
export function suggestSpeechModel(
  catalog: readonly SpeechModelManifest[],
  language: string
): SpeechModelManifest | undefined {
  const offered = catalog.filter((m) => m.provider === 'local' && isOfferedSpeechModel(m))
  const named = offered.find((m) => m.suggestedFor?.includes(language))
  if (named) {
    return named
  }
  const recommended = offered.find((m) => m.recommended)
  if (recommended?.languages.includes(language)) {
    return recommended
  }
  let best: { model: SpeechModelManifest; percent: number } | undefined
  for (const model of offered) {
    const quality = speechModelQuality(model, language)
    if (quality.kind === 'rated' && (!best || quality.errorRate.percent < best.percent)) {
      best = { model, percent: quality.errorRate.percent }
    }
  }
  return best?.model ?? offered.find((m) => m.languages.includes(language)) ?? recommended
}
