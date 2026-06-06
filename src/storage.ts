import type { Settings } from './settings'
import { DEFAULT_SETTINGS, defaultLanguageFromCountry, parseSettings, serializeSettings } from './settings'

type Bridge = {
  getLocalStorage(k: string): Promise<string>
  setLocalStorage(k: string, v: string): Promise<boolean>
  getUserInfo(): Promise<{ country: string }>
}
const KEY = 'am.settings.v1'

export async function loadSettings(bridge: Bridge): Promise<Settings> {
  let fallback = DEFAULT_SETTINGS
  try {
    const u = await bridge.getUserInfo()
    fallback = { ...DEFAULT_SETTINGS, language: defaultLanguageFromCountry(u?.country) }
  } catch { /* keep default */ }
  try {
    const raw = await bridge.getLocalStorage(KEY)
    return parseSettings(raw, fallback)
  } catch { return fallback }
}

export async function saveSettings(bridge: Bridge, s: Settings): Promise<void> {
  try { await bridge.setLocalStorage(KEY, serializeSettings(s)) } catch { /* best-effort */ }
}
