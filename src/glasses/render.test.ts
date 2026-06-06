import { test, expect } from 'vitest'
import { progressDots, menuText, quoteText } from './render'
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

test('quoteText は本文と出典を含む', () => {
  const q = QUOTES[0]
  const t = quoteText(q, 'ja')
  expect(t).toContain(q.text_ja)
  expect(t).toContain('ジェファーソン')
})
