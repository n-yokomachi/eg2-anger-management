import { waitForEvenAppBridge, OsEventTypeList } from '@evenrealities/even_hub_sdk'
import { loadSettings, saveSettings } from './storage'
import { countSequence } from './counter'
import { pickFinisher, MANAGED_DESIGNS } from './finisher'
import { QUOTES } from './quotes'
import { GLASSES } from './i18n'
import { createPage, enterCounting, tickCount, enterMenu, updateMenu, enterQuote, enterManaged } from './glasses/render'
import { mountPhoneUi } from './phone/ui'
import type { Settings, Lang, Region, FinisherMode } from './settings'

window.addEventListener('error', (e) => e.preventDefault())
window.addEventListener('unhandledrejection', (e) => e.preventDefault())

const bridge = await waitForEvenAppBridge()
const rB = bridge as unknown as Parameters<typeof enterCounting>[0]
const sB = bridge as unknown as Parameters<typeof loadSettings>[0]

let settings: Settings = await loadSettings(sB)

type Mode = 'counting' | 'paused' | 'finisher' | 'next' | 'showcase'
let mode: Mode = 'counting'
let seq: number[] = []
let menuSel = 0
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

// 進捗ドット数: japan=6 / america=10（カウント0と演出は含めない）
function dotsTotalFor(region: Region): number { return region === 'japan' ? 6 : 10 }

// ── カウント駆動（前描画完了後に最低1秒で次へ）──
let countToken = 0
async function startCount(): Promise<void> {
  mode = 'counting'
  seq = countSequence(settings.region)
  const total = dotsTotalFor(settings.region)
  const token = ++countToken
  await enterCounting(rB, settings.language, total)
  for (let idx = 0; idx < seq.length; idx++) {
    if (token !== countToken || mode !== 'counting') return // 中断（メニュー等）
    await tickCount(rB, seq[idx], total, Math.min(idx + 1, total))
    await sleep(1000)
  }
  if (token === countToken && mode === 'counting') await showFinisher()
}

async function showFinisher(): Promise<void> {
  mode = 'finisher'
  const result = pickFinisher(settings.finisher)
  if (result.kind === 'quote') await enterQuote(rB, result.quote, settings.language)
  else await enterManaged(rB, result.design)
}

// テストモード: カウントせず全演出（ANGER MANAGED 4種 → 名言30件）をクリックで順番に表示。
let showIdx = 0
function showcaseSteps(): Array<() => Promise<void>> {
  return [
    ...MANAGED_DESIGNS.map((d) => () => enterManaged(rB, d)),
    ...QUOTES.map((q) => () => enterQuote(rB, q, settings.language)),
  ]
}
async function runShowcase(): Promise<void> {
  mode = 'showcase'
  showIdx = 0
  await showcaseSteps()[0]()
}
async function showcaseNext(): Promise<void> {
  const steps = showcaseSteps()
  showIdx = (showIdx + 1) % steps.length
  await steps[showIdx]()
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
  await enterMenu(rB, GLASSES[settings.language].pausedLabel, pausedItems(settings.language), menuSel)
}
async function showNext(): Promise<void> {
  mode = 'next'; menuSel = 0
  await enterMenu(rB, GLASSES[settings.language].nextLabel, nextItems(settings.language), menuSel)
}

async function moveSel(delta: number): Promise<void> {
  const items = mode === 'paused' ? pausedItems(settings.language) : nextItems(settings.language)
  menuSel = (menuSel + delta + items.length) % items.length
  const header = mode === 'paused' ? GLASSES[settings.language].pausedLabel : GLASSES[settings.language].nextLabel
  await updateMenu(rB, header, items, menuSel)
}

async function confirmSel(): Promise<void> {
  if (mode === 'paused') {
    // [再開, もう一度, 終了] — 再開/もう一度はどちらも最初から数え直す（簡潔仕様）
    if (menuSel === 2) void bridge.shutDownPageContainer(0)
    else await startCount()
  } else if (mode === 'next') {
    // [もう一度, 終了]
    if (menuSel === 1) void bridge.shutDownPageContainer(0)
    else await startCount()
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
      else if (mode === 'showcase') { countToken++; void bridge.shutDownPageContainer(0) }
      break
    case OsEventTypeList.CLICK_EVENT:
      if (mode === 'finisher') void showNext()
      else if (mode === 'paused' || mode === 'next') void confirmSel()
      else if (mode === 'showcase') void showcaseNext()
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
    onTest: (v: boolean) => { settings = { ...settings, testMode: v }; void saveSettings(sB, settings) },
  })
}

// ── 起動 ──
await createPage(rB) // 先に空ページを作成してから状態遷移（rebuild）に入る
renderPhone()
if (settings.testMode) void runShowcase()
else void startCount()
