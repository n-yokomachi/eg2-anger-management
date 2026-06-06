import { test, expect } from 'vitest'
import { loadSettings, saveSettings } from './storage'
import { DEFAULT_SETTINGS } from './settings'

function fakeBridge(store: Record<string, string>, country = 'US') {
  return {
    getLocalStorage: async (k: string) => store[k] ?? '',
    setLocalStorage: async (k: string, v: string) => { store[k] = v; return true },
    getUserInfo: async () => ({ country }),
  }
}

test('未保存なら国から既定言語を導く（JP→ja）', async () => {
  const b = fakeBridge({}, 'JP')
  const s = await loadSettings(b)
  expect(s.language).toBe('ja')
  expect(s.region).toBe(DEFAULT_SETTINGS.region)
})

test('保存した設定を読み戻せる', async () => {
  const store: Record<string, string> = {}
  const b = fakeBridge(store, 'US')
  await saveSettings(b, { language: 'ja', region: 'america', finisher: 'quote', numberSize: 'small' })
  const s = await loadSettings(b)
  expect(s).toEqual({ language: 'ja', region: 'america', finisher: 'quote', numberSize: 'small' })
})
