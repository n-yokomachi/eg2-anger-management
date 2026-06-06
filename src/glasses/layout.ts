import { TextContainerProperty, ImageContainerProperty } from '@evenrealities/even_hub_sdk'

// 画像サイズ（assets と一致）。BIGNUM は "10" も収まる幅で画面中央 (x=(576-200)/2=188, y=(288-144)/2=72)。
export const BIGNUM = { w: 200, h: 144, x: 188, y: 72 } as const // 中央
export const FINIMG = { w: 288, h: 144, x: 144, y: 72 } as const // 中央

// ── テキスト ──
// 全画面イベント捕捉層（唯一の isEventCapture:1）
export const evtLayer = new TextContainerProperty({
  xPosition: 0, yPosition: 0, width: 576, height: 288,
  borderWidth: 0, borderColor: 0, paddingLength: 0,
  containerID: 1, containerName: 'evt', isEventCapture: 1, content: ' ',
})
// 上部ラベル
export const labelC = new TextContainerProperty({
  xPosition: 188, yPosition: 8, width: 200, height: 28,
  borderWidth: 0, paddingLength: 0,
  containerID: 2, containerName: 'label', isEventCapture: 0, content: ' ',
})
// 下部 進捗ドット
export const dotsC = new TextContainerProperty({
  xPosition: 138, yPosition: 250, width: 300, height: 28,
  borderWidth: 0, paddingLength: 0,
  containerID: 3, containerName: 'dots', isEventCapture: 0, content: ' ',
})
// メニュー（複数行・左寄せ）
export const menuC = new TextContainerProperty({
  xPosition: 200, yPosition: 70, width: 220, height: 160,
  borderWidth: 0, paddingLength: 0,
  containerID: 4, containerName: 'menu', isEventCapture: 0, content: ' ',
})
// 名言（複数行・左寄せ）
export const quoteC = new TextContainerProperty({
  xPosition: 40, yPosition: 60, width: 496, height: 180,
  borderWidth: 0, paddingLength: 0,
  containerID: 5, containerName: 'quote', isEventCapture: 0, content: ' ',
})

// ── 画像 ──
export const bignumImg = new ImageContainerProperty({
  xPosition: BIGNUM.x, yPosition: BIGNUM.y, width: BIGNUM.w, height: BIGNUM.h,
  containerID: 11, containerName: 'bignum',
})
export const finImg = new ImageContainerProperty({
  xPosition: FINIMG.x, yPosition: FINIMG.y, width: FINIMG.w, height: FINIMG.h,
  containerID: 12, containerName: 'finimg',
})

export const PAGE = {
  containerTotalNum: 7,
  textObject: [evtLayer, labelC, dotsC, menuC, quoteC],
  imageObject: [bignumImg, finImg],
}
