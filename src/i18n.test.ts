import { test, expect } from 'vitest'
import { GLASSES, UI, regionReason, finisherReason } from './i18n'

test('グラス文言が両言語で揃う', () => {
  expect(GLASSES.ja.title).toBeTruthy()
  expect(GLASSES.en.title).toBeTruthy()
  expect(GLASSES.ja.menuRestart).toBeTruthy()
  expect(GLASSES.en.menuExit).toBeTruthy()
})

test('地域の理由文に「俗説」/ folk が含まれる', () => {
  expect(regionReason('japan', 'ja')).toContain('俗説')
  expect(regionReason('america', 'ja')).toContain('俗説')
  expect(regionReason('japan', 'en')).toContain('folk')
})

test('スマホUI文言が両言語で揃う', () => {
  expect(UI.ja.title && UI.ja.status && UI.ja.finRandom && UI.ja.numNote).toBeTruthy()
  expect(UI.en.title && UI.en.status && UI.en.finRandom && UI.en.numNote).toBeTruthy()
})

test('演出の説明が選択肢ごとに出る', () => {
  expect(finisherReason('quote', 'ja')).toContain('名言')
  expect(finisherReason('managed', 'ja')).toContain('ANGER MANAGED')
  expect(finisherReason('both', 'ja')).toContain('ランダム')
  expect(finisherReason('quote', 'en')).toContain('quote')
})
