import type { FinisherMode } from './settings'
import { pickQuote, type Quote } from './quotes'

export const MANAGED_DESIGNS = ['speedlines', 'halftone', 'shockwave', 'stamp'] as const
export type ManagedDesign = (typeof MANAGED_DESIGNS)[number]

export type FinisherResult =
  | { kind: 'quote'; quote: Quote }
  | { kind: 'managed'; design: ManagedDesign }

// 演出を抽選。both は 種別を50/50 で選び、その中でランダム（フラット抽選だと名言に偏るため）。
export function pickFinisher(mode: FinisherMode, rng: () => number = Math.random): FinisherResult {
  const kind: 'quote' | 'managed' =
    mode === 'quote' ? 'quote'
    : mode === 'managed' ? 'managed'
    : (rng() < 0.5 ? 'quote' : 'managed')

  if (kind === 'quote') return { kind: 'quote', quote: pickQuote(rng) }
  const design = MANAGED_DESIGNS[Math.floor(rng() * MANAGED_DESIGNS.length)]
  return { kind: 'managed', design }
}
