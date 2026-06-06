import { test, expect } from 'vitest'
import { QUOTES, pickQuote, authorLabel } from './quotes'

test('30件・全フィールド非空', () => {
  expect(QUOTES.length).toBe(30)
  for (const q of QUOTES) {
    expect(q.text_en.length).toBeGreaterThan(0)
    expect(q.text_ja.length).toBeGreaterThan(0)
    expect(q.author_en.length).toBeGreaterThan(0)
    expect(q.author_ja.length).toBeGreaterThan(0)
  }
})

test('id は一意', () => {
  expect(new Set(QUOTES.map((q) => q.id)).size).toBe(QUOTES.length)
})

test('traditional は著者ラベルに伝/ trad. を付す', () => {
  const trad = QUOTES.find((q) => q.traditional)!
  expect(authorLabel(trad, 'ja')).toContain('（伝）')
  expect(authorLabel(trad, 'en')).toContain('(trad.)')
  const sure = QUOTES.find((q) => !q.traditional)!
  expect(authorLabel(sure, 'ja')).not.toContain('（伝）')
})

test('pickQuote は rng で決定的に選ぶ', () => {
  expect(pickQuote(() => 0)).toBe(QUOTES[0])
  expect(pickQuote(() => 0.999)).toBe(QUOTES[QUOTES.length - 1])
})
