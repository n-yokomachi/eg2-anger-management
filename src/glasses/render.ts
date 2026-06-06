import {
  CreateStartUpPageContainer, RebuildPageContainer, TextContainerProperty, ImageContainerProperty,
  TextContainerUpgrade,
} from '@evenrealities/even_hub_sdk'
import { evtLayer, labelC, dotsC, menuC, quoteC, numTextC, numImg, finImg } from './layout'
import { sendImage } from './assets'
import { GLASSES } from '../i18n'
import { authorLabel, type Quote } from '../quotes'
import type { Lang } from '../settings'
import type { ManagedDesign } from '../finisher'

type Bridge = {
  createStartUpPageContainer(p: CreateStartUpPageContainer): Promise<unknown>
  rebuildPageContainer(p: RebuildPageContainer): Promise<unknown>
  textContainerUpgrade(u: TextContainerUpgrade): Promise<unknown>
  updateImageRawData: Parameters<typeof sendImage>[0]['updateImageRawData']
}

// ── 純粋関数（テスト対象）──
export function progressDots(total: number, elapsed: number): string {
  const cells: string[] = []
  for (let i = 0; i < total; i++) cells.push(i < elapsed ? '●' : '○')
  return cells.join(' ')
}
export function menuText(header: string, items: string[], selected: number): string {
  const lines = items.map((it, i) => (i === selected ? `> ${it}` : `  ${it}`))
  return `${header}\n\n${lines.join('\n')}`
}
// 名言を文末句・セミコロンで折り返す（日本語の。！？ / 英語の . ! ? ; の直後で改行）。
// カンマ(,)・読点(、)では改行しない。
export function wrapAtPunctuation(s: string): string {
  return s
    .replace(/([。！？])/g, '$1\n')    // 日本語の句点・感嘆・疑問の直後
    .replace(/([.;!?])\s+/g, '$1\n')  // 英語の文末句・セミコロン＋空白の直後
    .replace(/\n+/g, '\n')
    .replace(/\n$/, '')
}
export function quoteText(q: Quote, lang: Lang): string {
  const body = lang === 'ja' ? q.text_ja : q.text_en
  return `"${wrapAtPunctuation(body)}"\n\n— ${authorLabel(q, lang)}`
}

// 進捗ドットの実測値（576x288・既定フォント）：● 1個の幅と中心間隔。
// テキストは中央寄せできないので、ドット列の幅から逆算してコンテナ x を中央に置く。
const DOT_GLYPH = 18, DOT_PITCH = 25
export function centeredDotsX(n: number): number {
  const rowW = (n - 1) * DOT_PITCH + DOT_GLYPH
  return Math.round((576 - rowW) / 2)
}

// 指定テキスト内容でページ payload を組む。画像コンテナは「その状態で必要なものだけ」宣言する
// ことで、rebuild 後に前状態の画像が残らない（数字と名言/メニューの被りを防ぐ排他制御）。
// dotsX を渡すと進捗ドットのコンテナ x を上書きして中央化する。
function pageWith(
  t: { label?: string; dots?: string; menu?: string; quote?: string; num?: string },
  images: ImageContainerProperty[] = [],
  dotsX?: number,
) {
  const set = (base: TextContainerProperty, content: string) =>
    new TextContainerProperty({ ...base, content: content || ' ' })
  const dots = new TextContainerProperty({
    ...dotsC, xPosition: dotsX ?? dotsC.xPosition, content: (t.dots ?? ' ') || ' ',
  })
  const textObject = [
    set(evtLayer, ' '),
    set(labelC, t.label ?? ' '),
    dots,
    set(numTextC, t.num ?? ' '),
    set(menuC, t.menu ?? ' '),
    set(quoteC, t.quote ?? ' '),
  ]
  return { containerTotalNum: textObject.length + images.length, textObject, imageObject: images }
}

const up = (b: Bridge, id: number, name: string, content: string) =>
  b.textContainerUpgrade(new TextContainerUpgrade({ containerID: id, containerName: name, content: content || ' ' }))
    .catch(() => {})

// 起動時に1度だけ空ページを作成する（以降の状態遷移はすべて rebuild）。
// これを最初に呼ばないと rebuild が土台のないページに対して走り、前状態が残る。
export async function createPage(bridge: Bridge): Promise<void> {
  await bridge.createStartUpPageContainer(new CreateStartUpPageContainer(pageWith({})))
}

// カウント開始（rebuild）。large=画像コンテナを宣言 / small=テキストのみ。
export async function enterCounting(
  bridge: Bridge, lang: Lang, dotsTotal: number, large: boolean,
): Promise<void> {
  await bridge.rebuildPageContainer(new RebuildPageContainer(
    pageWith({ label: GLASSES[lang].title, dots: progressDots(dotsTotal, 0) },
      large ? [numImg] : [], centeredDotsX(dotsTotal)),
  ))
}

// カウント1コマ。large=数字画像→ドット / small=数字テキスト→ドット（どちらも更新後にドット）。
export async function tickCount(
  bridge: Bridge, n: number, dotsTotal: number, dotsFilled: number, large: boolean,
): Promise<void> {
  if (large) await sendImage(bridge, 11, 'num', `d${n}.png`)
  else await up(bridge, 6, 'numtext', String(n))
  await up(bridge, 3, 'dots', progressDots(dotsTotal, dotsFilled))
}

// メニュー表示（rebuild で画像を消す）。
export async function enterMenu(
  bridge: Bridge, header: string, items: string[], selected: number,
): Promise<void> {
  await bridge.rebuildPageContainer(new RebuildPageContainer(pageWith({ menu: menuText(header, items, selected) })))
}
// メニュー選択移動（テキストのみ＝upgrade で軽量に）。
export async function updateMenu(
  bridge: Bridge, header: string, items: string[], selected: number,
): Promise<void> {
  await up(bridge, 4, 'menu', menuText(header, items, selected))
}

// 名言フィニッシャー（画像なし）。
export async function enterQuote(bridge: Bridge, q: Quote, lang: Lang): Promise<void> {
  await bridge.rebuildPageContainer(new RebuildPageContainer(pageWith({ quote: quoteText(q, lang) })))
}

// ANGER MANAGED フィニッシャー（画像取得まで簡易ローディング「• • •」→ 画像表示 → 消去）。
export async function enterManaged(bridge: Bridge, design: ManagedDesign): Promise<void> {
  // 文字を出さず点だけの簡易ローディング。BLE呼び出しは直列に保つ（rebuild→画像→消去）。
  await bridge.rebuildPageContainer(new RebuildPageContainer(pageWith({ menu: '• • •' }, [finImg])))
  await sendImage(bridge, 12, 'finimg', `${design}.png`) // 取得・表示（遅い場合あり）
  await up(bridge, 4, 'menu', ' ')                        // 画像が出たらローディング消去
}
