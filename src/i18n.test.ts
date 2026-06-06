import { test, expect } from 'vitest'
import { GLASSES, UI, regionReason } from './i18n'

test('グラス文言が両言語で揃う', () => {
  expect(GLASSES.ja.title).toBeTruthy()
  expect(GLASSES.en.title).toBeTruthy()
  expect(GLASSES.ja.menuResume).toBeTruthy()
  expect(GLASSES.en.menuExit).toBeTruthy()
})

test('地域の理由文に「俗説」/ folk が含まれる', () => {
  expect(regionReason('japan', 'ja')).toContain('俗説')
  expect(regionReason('america', 'ja')).toContain('俗説')
  expect(regionReason('japan', 'en')).toContain('folk')
})

test('スマホUI文言が両言語で揃う', () => {
  expect(UI.ja.language && UI.ja.region && UI.ja.finisher).toBeTruthy()
  expect(UI.en.language && UI.en.region && UI.en.finisher).toBeTruthy()
})
