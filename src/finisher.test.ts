import { test, expect } from 'vitest'
import { pickFinisher, MANAGED_DESIGNS } from './finisher'

// 連続した戻り値を返す rng を作る
function seq(values: number[]): () => number {
  let i = 0
  return () => values[i++ % values.length]
}

test('quote 指定なら常に名言', () => {
  const r = pickFinisher('quote', seq([0]))
  expect(r.kind).toBe('quote')
})

test('managed 指定なら常に ANGER MANAGED デザイン', () => {
  const r = pickFinisher('managed', seq([0]))
  expect(r.kind).toBe('managed')
  if (r.kind === 'managed') expect(MANAGED_DESIGNS).toContain(r.design)
})

test('both: 1回目rng<0.5 で quote 側', () => {
  const r = pickFinisher('both', seq([0.2, 0]))
  expect(r.kind).toBe('quote')
})

test('both: 1回目rng>=0.5 で managed 側', () => {
  const r = pickFinisher('both', seq([0.7, 0]))
  expect(r.kind).toBe('managed')
  if (r.kind === 'managed') expect(r.design).toBe(MANAGED_DESIGNS[0])
})
