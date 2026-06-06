import type { Lang, Region } from './settings'

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

// ── スマホ側設定画面の文言（言語設定に追従）──
export interface UiStrings {
  title: string; status: string
  language: string; region: string; finisher: string
  america: string; japan: string
  finQuote: string; finManaged: string; finBoth: string
}
export const UI: Record<Lang, UiStrings> = {
  en: {
    title: 'Anger Management',
    status: 'A joke app. Put on your glasses and it counts to calm you down — then drops a random finisher (a famous quote or a big ANGER MANAGED).',
    language: 'Language', region: 'Region', finisher: 'Finisher',
    america: 'America', japan: 'Japan',
    finQuote: 'Quote', finManaged: 'ANGER MANAGED', finBoth: 'Both',
  },
  ja: {
    title: 'Anger Management',
    status: 'ジョークアプリです。グラスをかけるとカウントが始まり、完了時に演出（偉人の名言 or 派手な ANGER MANAGED）をランダムに表示します。',
    language: '言語', region: '地域', finisher: '演出',
    america: 'America', japan: 'Japan',
    finQuote: '名言', finManaged: 'ANGER MANAGED', finBoth: '両方',
  },
}
