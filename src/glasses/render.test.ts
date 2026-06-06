import { test, expect } from 'vitest'
import { progressDots, menuText, quoteText, wrapAtPunctuation } from './render'
import { QUOTES } from '../quotes'

test('progressDots は経過数ぶん塗る', () => {
  expect(progressDots(7, 0)).toBe('○ ○ ○ ○ ○ ○ ○')
  expect(progressDots(7, 3)).toBe('● ● ● ○ ○ ○ ○')
  expect(progressDots(7, 7)).toBe('● ● ● ● ● ● ●')
})

test('menuText は選択行に > を付ける', () => {
  const t = menuText('PAUSED', ['Resume', 'Again', 'Exit'], 1)
  expect(t).toContain('PAUSED')
  expect(t).toContain('> Again')
  expect(t).toContain('  Resume')
})

test('wrapAtPunctuation は文末句（。！？ / . ! ?）で折り返す', () => {
  expect(wrapAtPunctuation('腹が立ったら数えよ。とても腹が立ったら数えよ。'))
    .toBe('腹が立ったら数えよ。\nとても腹が立ったら数えよ。')
  expect(wrapAtPunctuation('When angry count ten. Then a hundred.'))
    .toBe('When angry count ten.\nThen a hundred.')
})

test('wrapAtPunctuation はカンマ・読点では折り返さない', () => {
  expect(wrapAtPunctuation('腹が立ったら、まず数えよ。')).toBe('腹が立ったら、まず数えよ。')
  expect(wrapAtPunctuation('When angry, count to ten.')).toBe('When angry, count to ten.')
})

test('quoteText は本文（句読点折り返し）と出典を含む', () => {
  const q = QUOTES[0]
  const t = quoteText(q, 'ja')
  expect(t).toContain('腹が立ったら口を開く前に10数えよ。') // 先頭の節
  expect(t).toContain('ジェファーソン')
  expect(t.split('\n').length).toBeGreaterThan(2) // 本文折り返し＋出典で複数行
})
