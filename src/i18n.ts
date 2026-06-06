import type { Lang, Region, FinisherMode } from './settings'

// ── グラス側文言 ──
export interface GlassesStrings {
  title: string          // カウント中の上部ラベル
  menuResume: string
  menuRestart: string
  menuExit: string
  pausedLabel: string
  nextLabel: string
}
export const GLASSES: Record<Lang, GlassesStrings> = {
  en: { title: 'ANGER MANAGEMENT', menuResume: 'Resume', menuRestart: 'Again',
        menuExit: 'Exit', pausedLabel: 'PAUSED', nextLabel: 'NEXT?' },
  ja: { title: 'ANGER MANAGEMENT', menuResume: '再開', menuRestart: 'もう一度',
        menuExit: '終了', pausedLabel: 'PAUSED', nextLabel: 'NEXT?' },
}

// 地域セレクタ下の「秒数の理由」（俗説であることを正直に記載）
export function regionReason(region: Region, lang: Lang): string {
  if (lang === 'ja') {
    return region === 'japan'
      ? '「怒りのピークは6秒」という日本で広まった俗説にもとづき、6秒カウントします。'
      : '"count to ten"（10数える）という英語圏の俗説にもとづき、10までカウントします。'
  }
  return region === 'japan'
    ? 'Counts down 6 seconds, based on the Japanese folk belief that anger peaks for 6 seconds.'
    : 'Counts up to ten, based on the Western folk advice to "count to ten".'
}

// 演出セレクタ下の説明（選択中の演出が完了時に何を表示するか）
export function finisherReason(mode: FinisherMode, lang: Lang): string {
  if (lang === 'ja') {
    switch (mode) {
      case 'quote':   return '完了時に、怒りにまつわる偉人の名言をランダムで表示します。'
      case 'managed': return '完了時に、派手な「ANGER MANAGED」グラフィックをランダムで表示します。'
      default:        return '完了時に、名言か「ANGER MANAGED」のどちらかをランダムで表示します。'
    }
  }
  switch (mode) {
    case 'quote':   return 'On finish, shows a random famous quote about anger.'
    case 'managed': return 'On finish, shows a random flashy "ANGER MANAGED" graphic.'
    default:        return 'On finish, randomly shows either a quote or an "ANGER MANAGED" graphic.'
  }
}

// ── スマホ側設定画面の文言（言語設定に追従）。セクション見出しは固定の英/日併記なのでここには含めない。──
export interface UiStrings {
  title: string; status: string
  america: string; japan: string
  finQuote: string; finManaged: string; finRandom: string
  testDesc: string
}
export const UI: Record<Lang, UiStrings> = {
  en: {
    title: 'Anger Management',
    status: '* This is a joke app.\nLaunch it and a countdown begins; when it finishes, a finisher plays.\nYour companion for anger management.',
    america: 'America', japan: 'Japan',
    finQuote: 'Quote', finManaged: 'ANGER MANAGED', finRandom: 'Random',
    testDesc: 'When on, skips the count and cycles through every finisher in order (for testing).',
  },
  ja: {
    title: 'Anger Management',
    status: '※これはジョークアプリです。\nアプリを起動するとカウントが始まり、完了すると演出が入ります。\nあなたのアンガーマネジメントのお供に。',
    america: 'America', japan: 'Japan',
    finQuote: '名言', finManaged: 'ANGER MANAGED', finRandom: 'ランダム',
    testDesc: 'ONにすると、カウントせず全ての演出を順番に表示します（テスト用）。',
  },
}
