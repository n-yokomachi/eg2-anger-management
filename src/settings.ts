export type Lang = 'ja' | 'en'
export type Region = 'america' | 'japan'      // カウントの数字・向きのみ決定
export type FinisherMode = 'quote' | 'managed' | 'both'

// testMode: ON でカウントを行わず、全演出パターンを順番に表示する（デバッグ用）
export interface Settings { language: Lang; region: Region; finisher: FinisherMode; testMode: boolean }

export const DEFAULT_SETTINGS: Settings = { language: 'en', region: 'japan', finisher: 'both', testMode: false }

export function defaultLanguageFromCountry(country?: string | null): Lang {
  const c = (country ?? '').trim().toUpperCase()
  return (c === 'JP' || c === 'JAPAN' || c === '日本'.toUpperCase()) ? 'ja' : 'en'
}

export function parseSettings(raw: string | null | undefined, fallback: Settings): Settings {
  if (!raw) return fallback
  try {
    const o = JSON.parse(raw) as Partial<Settings>
    const language: Lang = o.language === 'ja' ? 'ja' : o.language === 'en' ? 'en' : fallback.language
    const region: Region = o.region === 'america' ? 'america' : o.region === 'japan' ? 'japan' : fallback.region
    const finisher: FinisherMode =
      o.finisher === 'quote' || o.finisher === 'managed' || o.finisher === 'both' ? o.finisher : fallback.finisher
    const testMode: boolean = typeof o.testMode === 'boolean' ? o.testMode : fallback.testMode
    return { language, region, finisher, testMode }
  } catch { return fallback }
}

export function serializeSettings(s: Settings): string { return JSON.stringify(s) }
