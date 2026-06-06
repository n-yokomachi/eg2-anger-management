import { waitForEvenAppBridge, OsEventTypeList } from '@evenrealities/even_hub_sdk'
import { loadSettings, saveSettings } from './storage'
import { countSequence } from './counter'
import { pickFinisher, MANAGED_DESIGNS, type FinisherResult } from './finisher'
import { GLASSES } from './i18n'
import { createPage, enterCounting, tickCount, enterMenu, updateMenu, enterQuote, enterManaged } from './glasses/render'
import { preloadImages } from './glasses/assets'
import { mountPhoneUi } from './phone/ui'
import type { Settings, Lang, Region, FinisherMode, NumberSize } from './settings'

window.addEventListener('error', (e) => e.preventDefault())
window.addEventListener('unhandledrejection', (e) => e.preventDefault())

const bridge = await waitForEvenAppBridge()
const rB = bridge as unknown as Parameters<typeof enterCounting>[0]
const sB = bridge as unknown as Parameters<typeof loadSettings>[0]

let settings: Settings = await loadSettings(sB)

type Mode = 'counting' | 'paused' | 'finisher' | 'next'
let mode: Mode = 'counting'
let seq: number[] = []
let menuSel = 0
let pendingFinisher: FinisherResult | null = null // カウント開始前に決定する演出
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

// 進捗ドット数: japan=6 / america=10（カウント0と演出は含めない）
function dotsTotalFor(region: Region): number { return region === 'japan' ? 6 : 10 }

// ── カウント駆動（前描画完了後に最低1秒で次へ）──
let countToken = 0
async function startCount(): Promise<void> {
  mode = 'counting'
  seq = countSequence(settings.region)
  const total = dotsTotalFor(settings.region)
  const large = settings.numberSize === 'large'
  const token = ++countToken
  // 演出はカウント開始前に決定。ANGER MANAGED ならカウント中に画像を先読みしておく。
  pendingFinisher = pickFinisher(settings.finisher)
  if (pendingFinisher.kind === 'managed') void preloadImages([`${pendingFinisher.design}.png`])
  await enterCounting(rB, settings.language, total, large)
  const base = performance.now()
  for (let idx = 0; idx < seq.length; idx++) {
    if (token !== countToken || mode !== 'counting') return // 中断（メニュー等）
    await tickCount(rB, seq[idx], total, Math.min(idx + 1, total), large)
    if (idx === seq.length - 1) {
      await sleep(1000) // 最後の数字はきっちり1秒表示してから演出へ
    } else {
      // 送信にかかった時間を差し引き、各数字を均等な間隔(約1秒)で表示する
      const wait = base + (idx + 1) * 1000 - performance.now()
      if (wait > 0) await sleep(wait)
    }
  }
  if (token === countToken && mode === 'counting') await showFinisher()
}

async function showFinisher(): Promise<void> {
  mode = 'finisher'
  const result = pendingFinisher ?? pickFinisher(settings.finisher) // カウント前に決定済みのものを使う
  if (result.kind === 'quote') await enterQuote(rB, result.quote, settings.language)
  else await enterManaged(rB, result.design)
}

// 表示フローを再起動（設定変更で即反映）。進行中のカウントを停止して数え直す。
function restartFlow(): void {
  countToken++ // 進行中ループを停止
  void startCount()
}

// PAUSED / NEXT とも選択肢は [もう一度, 終了]（再開はもう一度と同じ動きのため廃止）
function menuItems(lang: Lang): string[] {
  const g = GLASSES[lang]; return [g.menuRestart, g.menuExit]
}
async function showPaused(): Promise<void> {
  mode = 'paused'; menuSel = 0
  countToken++ // 進行中カウントを止める
  await enterMenu(rB, GLASSES[settings.language].pausedLabel, menuItems(settings.language), menuSel)
}
async function showNext(): Promise<void> {
  mode = 'next'; menuSel = 0
  await enterMenu(rB, GLASSES[settings.language].nextLabel, menuItems(settings.language), menuSel)
}

async function moveSel(delta: number): Promise<void> {
  const items = menuItems(settings.language)
  menuSel = (menuSel + delta + items.length) % items.length
  const header = mode === 'paused' ? GLASSES[settings.language].pausedLabel : GLASSES[settings.language].nextLabel
  await updateMenu(rB, header, items, menuSel)
}

// PAUSED / NEXT とも [もう一度, 終了]: 0=もう一度(数え直し) / 1=終了
async function confirmSel(): Promise<void> {
  if (mode !== 'paused' && mode !== 'next') return
  if (menuSel === 1) void bridge.shutDownPageContainer(0)
  else await startCount()
}

// ── 入力配線 ──
// 実機/シミュレータのイベント形式（実測）:
//   クリック      → sysEvent（eventType 無し）
//   ダブルクリック → sysEvent.eventType = 3
//   上/下スクロール → textEvent.eventType = 1 / 2   ← sysEvent ではなく textEvent で届く
//   退出         → sysEvent.eventType = 6 / 7
const listenerStart = performance.now()
bridge.onEvenHubEvent((ev) => {
  // システム退出（起動直後の誤発火は無視）
  const sysType = ev.sysEvent?.eventType
  if (sysType === OsEventTypeList.SYSTEM_EXIT_EVENT || sysType === OsEventTypeList.ABNORMAL_EXIT_EVENT) {
    if (performance.now() - listenerStart < 3000) return
    countToken++
    return
  }
  // 入力種別: スクロールは textEvent、クリック/ダブルクリックは sysEvent から拾う
  let t: number | undefined
  if (typeof ev.textEvent?.eventType === 'number') t = ev.textEvent.eventType
  else if (ev.sysEvent) t = ev.sysEvent.eventType ?? OsEventTypeList.CLICK_EVENT
  if (t === undefined) return

  switch (t) {
    case OsEventTypeList.DOUBLE_CLICK_EVENT:
      if (mode === 'counting') void showPaused()
      else if (mode === 'finisher') void showNext() // 演出後はタップ/ダブルタップ両方でメニュー
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
  }
})

// ── スマホ設定（変更で即保存。言語変更でスマホUIも再描画）──
function renderPhone() {
  mountPhoneUi(settings, {
    onLanguage: (v: Lang) => { settings = { ...settings, language: v }; void saveSettings(sB, settings); renderPhone() },
    onRegion: (v: Region) => { settings = { ...settings, region: v }; void saveSettings(sB, settings) },
    onFinisher: (v: FinisherMode) => { settings = { ...settings, finisher: v }; void saveSettings(sB, settings) },
    onNumberSize: (v: NumberSize) => { settings = { ...settings, numberSize: v }; void saveSettings(sB, settings); restartFlow() },
  })
}

// ── 起動 ──
await createPage(rB) // 先に空ページを作成してから状態遷移（rebuild）に入る
// 数字画像(d0..d10)と演出画像を起動時に先読み（表示時のfetch遅延をゼロに）
void preloadImages([
  ...Array.from({ length: 11 }, (_, i) => `d${i}.png`),
  ...MANAGED_DESIGNS.map((d) => `${d}.png`),
])
renderPhone()
void startCount()
