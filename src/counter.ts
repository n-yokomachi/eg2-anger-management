import type { Region } from './settings'

// 地域別のカウント列。japan=6→0 のカウントダウン（最後に0）、america=1→10 のカウントアップ。
export function countSequence(region: Region): number[] {
  return region === 'japan'
    ? [6, 5, 4, 3, 2, 1, 0]
    : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
}
