import {
  CreateStartUpPageContainer, RebuildPageContainer, TextContainerUpgrade,
} from '@evenrealities/even_hub_sdk'
import { PAGE, BIGNUM, FINIMG } from './layout'
import { sendImage, clearImage } from './assets'
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
export function quoteText(q: Quote, lang: Lang): string {
  const body = lang === 'ja' ? q.text_ja : q.text_en
  return `"${body}"\n\n— ${authorLabel(q, lang)}`
}

// ── ブリッジ I/O ──
const up = (b: Bridge, id: number, name: string, content: string) =>
  b.textContainerUpgrade(new TextContainerUpgrade({ containerID: id, containerName: name, content: content || ' ' }))
    .catch(() => {})

// 起動: ページ作成（全コンテナ宣言）。テキストは空、画像は未送信（プレースホルダ）。
export async function createPage(bridge: Bridge): Promise<void> {
  await bridge.createStartUpPageContainer(new CreateStartUpPageContainer(PAGE))
}

// カウント1コマ描画: ラベル＋大判数字＋進捗ドット。前画像完了まで await。
export async function renderCount(
  bridge: Bridge, lang: Lang, n: number, total: number, elapsed: number,
): Promise<void> {
  await up(bridge, 2, 'label', GLASSES[lang].title)
  await up(bridge, 3, 'dots', progressDots(total, elapsed))
  await up(bridge, 5, 'quote', ' ')
  await up(bridge, 4, 'menu', ' ')
  await sendImage(bridge, 11, 'bignum', `d${n}.png`)
}

// メニュー描画: 画像を消し、メニュー本文を出す。
export async function renderMenu(
  bridge: Bridge, header: string, items: string[], selected: number,
): Promise<void> {
  await up(bridge, 2, 'label', ' ')
  await up(bridge, 3, 'dots', ' ')
  await up(bridge, 5, 'quote', ' ')
  await clearImage(bridge, 11, 'bignum', BIGNUM.w, BIGNUM.h)
  await clearImage(bridge, 12, 'finimg', FINIMG.w, FINIMG.h)
  await up(bridge, 4, 'menu', menuText(header, items, selected))
}

// 名言フィニッシャー描画。
export async function renderQuote(bridge: Bridge, q: Quote, lang: Lang): Promise<void> {
  await up(bridge, 2, 'label', ' ')
  await up(bridge, 3, 'dots', ' ')
  await up(bridge, 4, 'menu', ' ')
  await clearImage(bridge, 11, 'bignum', BIGNUM.w, BIGNUM.h)
  await clearImage(bridge, 12, 'finimg', FINIMG.w, FINIMG.h)
  await up(bridge, 5, 'quote', quoteText(q, lang))
}

// ANGER MANAGED フィニッシャー描画（画像1枚）。
export async function renderManaged(bridge: Bridge, design: ManagedDesign): Promise<void> {
  await up(bridge, 2, 'label', ' ')
  await up(bridge, 3, 'dots', ' ')
  await up(bridge, 4, 'menu', ' ')
  await up(bridge, 5, 'quote', ' ')
  await clearImage(bridge, 11, 'bignum', BIGNUM.w, BIGNUM.h)
  await sendImage(bridge, 12, 'finimg', `${design}.png`)
}
