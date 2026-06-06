export type Lang = 'ja' | 'en'
export type Region = 'america' | 'japan'      // カウントの数字・向きのみ決定
export type FinisherMode = 'quote' | 'managed' | 'both'
export type NumberSize = 'large' | 'small'    // large=画像(遅延あり) / small=テキスト(安定)

export interface Settings {
  language: Lang; region: Region; finisher: FinisherMode; numberSize: NumberSize
}

export const DEFAULT_SETTINGS: Settings = {
  language: 'en', region: 'japan', finisher: 'both', numberSize: 'large',
}

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
    const numberSize: NumberSize = o.numberSize === 'small' ? 'small' : o.numberSize === 'large' ? 'large' : fallback.numberSize
    return { language, region, finisher, numberSize }
  } catch { return fallback }
}

export function serializeSettings(s: Settings): string { return JSON.stringify(s) }
