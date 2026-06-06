import {
  CreateStartUpPageContainer, RebuildPageContainer, TextContainerProperty, ImageContainerProperty,
  TextContainerUpgrade,
} from '@evenrealities/even_hub_sdk'
import { evtLayer, labelC, dotsC, menuC, quoteC, bignumImg, finImg } from './layout'
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
// 名言を文末句で折り返す（日本語の。！？ / 英語の . ! ? の直後で改行）。
// カンマ(,)・読点(、)・セミコロン(;)では改行しない。
export function wrapAtPunctuation(s: string): string {
  return s
    .replace(/([。！？])/g, '$1\n')    // 日本語の句点・感嘆・疑問の直後
    .replace(/([.!?])\s+/g, '$1\n')   // 英語の文末句＋空白の直後
    .replace(/\n+/g, '\n')
    .replace(/\n$/, '')
}
export function quoteText(q: Quote, lang: Lang): string {
  const body = lang === 'ja' ? q.text_ja : q.text_en
  return `"${wrapAtPunctuation(body)}"\n\n— ${authorLabel(q, lang)}`
}

// 指定テキスト内容でページ payload を組む。画像コンテナは「その状態で必要なものだけ」宣言する
// ことで、rebuild 後に前状態の画像が残らない（数字と名言/メニューの被りを防ぐ排他制御）。
function pageWith(
  t: { label?: string; dots?: string; menu?: string; quote?: string },
  images: ImageContainerProperty[] = [],
) {
  const set = (base: TextContainerProperty, content: string) =>
    new TextContainerProperty({ ...base, content: content || ' ' })
  const textObject = [
    set(evtLayer, ' '),
    set(labelC, t.label ?? ' '),
    set(dotsC, t.dots ?? ' '),
    set(menuC, t.menu ?? ' '),
    set(quoteC, t.quote ?? ' '),
  ]
  return { containerTotalNum: textObject.length + images.length, textObject, imageObject: images }
}

const up = (b: Bridge, id: number, name: string, content: string) =>
  b.textContainerUpgrade(new TextContainerUpgrade({ containerID: id, containerName: name, content: content || ' ' }))
    .catch(() => {})

// カウント開始。firstTime はページ作成、以降は rebuild（前状態の画像を確実に消す）。
export async function enterCounting(
  bridge: Bridge, lang: Lang, dotsTotal: number, firstTime: boolean,
): Promise<void> {
  const payload = pageWith({ label: GLASSES[lang].title, dots: progressDots(dotsTotal, 0) }, [bignumImg])
  if (firstTime) await bridge.createStartUpPageContainer(new CreateStartUpPageContainer(payload))
  else await bridge.rebuildPageContainer(new RebuildPageContainer(payload))
}

// カウント1コマ: 進捗ドット更新＋大判数字画像。前描画完了まで await。
export async function tickCount(
  bridge: Bridge, n: number, dotsTotal: number, dotsFilled: number,
): Promise<void> {
  await up(bridge, 3, 'dots', progressDots(dotsTotal, dotsFilled))
  await sendImage(bridge, 11, 'bignum', `d${n}.png`)
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

// 名言フィニッシャー（画像なし・rebuild で数字画像を消す）。
export async function enterQuote(bridge: Bridge, q: Quote, lang: Lang): Promise<void> {
  await bridge.rebuildPageContainer(new RebuildPageContainer(pageWith({ quote: quoteText(q, lang) })))
}

// ANGER MANAGED フィニッシャー（rebuild で数字画像を消去 → 中央に画像1枚）。
export async function enterManaged(bridge: Bridge, design: ManagedDesign): Promise<void> {
  await bridge.rebuildPageContainer(new RebuildPageContainer(pageWith({}, [finImg])))
  await sendImage(bridge, 12, 'finimg', `${design}.png`)
}
