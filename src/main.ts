import { waitForEvenAppBridge, OsEventTypeList } from '@evenrealities/even_hub_sdk'
import { loadSettings, saveSettings } from './storage'
import { countSequence } from './counter'
import { pickFinisher, type FinisherResult } from './finisher'
import { GLASSES } from './i18n'
import { createPage, renderCount, renderMenu, renderQuote, renderManaged } from './glasses/render'
import { mountPhoneUi } from './phone/ui'
import type { Settings, Lang, Region, FinisherMode } from './settings'

window.addEventListener('error', (e) => e.preventDefault())
window.addEventListener('unhandledrejection', (e) => e.preventDefault())

const bridge = await waitForEvenAppBridge()
const rB = bridge as unknown as Parameters<typeof createPage>[0]
const sB = bridge as unknown as Parameters<typeof loadSettings>[0]

let settings: Settings = await loadSettings(sB)

type Mode = 'counting' | 'paused' | 'finisher' | 'next'
let mode: Mode = 'counting'
let seq: number[] = []
let idx = 0                       // 現在のカウント位置
let menuSel = 0
let lastFinisher: FinisherResult | null = null
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

// ── カウント駆動（前描画完了後に最低1秒で次へ）──
let countToken = 0
async function startCount(): Promise<void> {
  mode = 'counting'
  seq = countSequence(settings.region)
  idx = 0
  const token = ++countToken
  for (; idx < seq.length; idx++) {
    if (token !== countToken || mode !== 'counting') return // 中断（メニュー等）
    await renderCount(rB, settings.language, seq[idx], seq.length, idx)
    await sleep(1000)
  }
  if (token === countToken && mode === 'counting') await showFinisher()
}

async function showFinisher(): Promise<void> {
  mode = 'finisher'
  lastFinisher = pickFinisher(settings.finisher)
  if (lastFinisher.kind === 'quote') await renderQuote(rB, lastFinisher.quote, settings.language)
  else await renderManaged(rB, lastFinisher.design)
}

function pausedItems(lang: Lang): string[] {
  const g = GLASSES[lang]; return [g.menuResume, g.menuRestart, g.menuExit]
}
function nextItems(lang: Lang): string[] {
  const g = GLASSES[lang]; return [g.menuRestart, g.menuExit]
}
async function showPaused(): Promise<void> {
  mode = 'paused'; menuSel = 0
  countToken++ // 進行中カウントを止める
  await renderMenu(rB, GLASSES[settings.language].pausedLabel, pausedItems(settings.language), menuSel)
}
async function showNext(): Promise<void> {
  mode = 'next'; menuSel = 0
  await renderMenu(rB, GLASSES[settings.language].nextLabel, nextItems(settings.language), menuSel)
}

async function moveSel(delta: number): Promise<void> {
  const items = mode === 'paused' ? pausedItems(settings.language) : nextItems(settings.language)
  menuSel = (menuSel + delta + items.length) % items.length
  const header = mode === 'paused' ? GLASSES[settings.language].pausedLabel : GLASSES[settings.language].nextLabel
  await renderMenu(rB, header, items, menuSel)
}

async function confirmSel(): Promise<void> {
  if (mode === 'paused') {
    if (menuSel === 0) { await startCount() }                 // 再開（最初から数え直す簡潔仕様）
    else if (menuSel === 1) { await startCount() }            // もう一度
    else { void bridge.shutDownPageContainer(0) }             // 終了
  } else if (mode === 'next') {
    if (menuSel === 0) { await startCount() }                 // もう一度
    else { void bridge.shutDownPageContainer(0) }             // 終了
  }
}

// ── 入力配線 ──
const listenerStart = performance.now()
bridge.onEvenHubEvent((ev) => {
  if (!ev.sysEvent) return
  const t = ev.sysEvent.eventType ?? 0
  switch (t) {
    case OsEventTypeList.DOUBLE_CLICK_EVENT:
      if (mode === 'counting') void showPaused()
      break
    case OsEventTypeList.CLICK_EVENT:
      if (mode === 'finisher') void showNext()
      else if (mode === 'paused' || mode === 'next') void confirmSel()
      break
    case OsEventTypeList.SCROLL_TOP_EVENT:
      if (mode === 'paused' || mode === 'next') void moveSel(-1)
      break
    case OsEventTypeList.SCROLL_BOTTOM_EVENT:
      if (mode === 'paused' || mode === 'next') void moveSel(1)
      break
    case OsEventTypeList.SYSTEM_EXIT_EVENT:
    case OsEventTypeList.ABNORMAL_EXIT_EVENT:
      if (performance.now() - listenerStart < 3000) return
      countToken++
      break
  }
})

// ── スマホ設定（変更で即保存。言語変更でスマホUIも再描画）──
function renderPhone() {
  mountPhoneUi(settings, {
    onLanguage: (v: Lang) => { settings = { ...settings, language: v }; void saveSettings(sB, settings); renderPhone() },
    onRegion: (v: Region) => { settings = { ...settings, region: v }; void saveSettings(sB, settings) },
    onFinisher: (v: FinisherMode) => { settings = { ...settings, finisher: v }; void saveSettings(sB, settings) },
  })
}

// ── 起動 ──
await createPage(rB)
renderPhone()
void startCount()
