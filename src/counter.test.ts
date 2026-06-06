import { test, expect } from 'vitest'
import { countSequence } from './counter'

test('japan は 6→1 のカウントダウン（0は含まない）', () => {
  expect(countSequence('japan')).toEqual([6, 5, 4, 3, 2, 1])
})
test('america は 1→10 のカウントアップ', () => {
  expect(countSequence('america')).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
})
