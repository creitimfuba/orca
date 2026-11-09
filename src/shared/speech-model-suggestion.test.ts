import { describe, expect, it } from 'vitest'
import { suggestSpeechModel } from './speech-model-suggestion'
import type { SpeechModelErrorRate, SpeechModelManifest } from './speech-types'

const rate = (language: string, percent: number): SpeechModelErrorRate => ({
  language,
  percent,
  metric: 'wer',
  test: 'fleurs',
  clips: 5,
  measuredOn: '2026-11-09'
})

const model = (id: string, extra: Partial<SpeechModelManifest>): SpeechModelManifest => ({
  id,
  label: id,
  type: 'transducer',
  provider: 'local',
  language: 'multilingual',
  languages: [],
  sampleRate: 16000,
  streaming: false,
  ...extra
})

const catalog = [
  model('parakeet', { recommended: true, languages: ['en', 'fr'], errorRates: [rate('fr', 8)] }),
  model('sense', { languages: ['en', 'ko'], suggestedFor: ['ko'], errorRates: [rate('ko', 10)] }),
  model('nemotron', { languages: ['fr', 'ko', 'tr'], errorRates: [rate('tr', 14)] }),
  model('turbo', {
    languages: ['fr', 'ko', 'tr', 'cy'],
    errorRates: [rate('fr', 5), rate('ko', 3), rate('tr', 8)]
  }),
  model('retired', { languages: ['tr'], errorRates: [rate('tr', 1)], replacedBy: 'turbo' })
]

describe('suggestSpeechModel', () => {
  it('follows the setup rule: named model, then the default, then the best measured', () => {
    const pick = (language: string) => suggestSpeechModel(catalog, language)?.id
    expect(pick('ko')).toBe('sense')
    expect(pick('fr')).toBe('parakeet')
    expect(pick('tr')).toBe('turbo')
    expect(pick('cy')).toBe('turbo')
    expect(pick('xx')).toBe('parakeet')
  })
})
