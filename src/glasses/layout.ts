import { TextContainerProperty, ImageContainerProperty } from '@evenrealities/even_hub_sdk'

// 演出画像（中央 288×144）
export const FINIMG = { w: 288, h: 144, x: 144, y: 72 } as const

// ── テキスト ──
// 全画面イベント捕捉層（唯一の isEventCapture:1）
export const evtLayer = new TextContainerProperty({
  xPosition: 0, yPosition: 0, width: 576, height: 288,
  borderWidth: 0, borderColor: 0, paddingLength: 0,
  containerID: 1, containerName: 'evt', isEventCapture: 1, content: ' ',
})
// 上部ラベル "ANGER MANAGEMENT"（実測幅184px）を画面中央に。x=(576-184)/2=196
export const labelC = new TextContainerProperty({
  xPosition: 196, yPosition: 8, width: 200, height: 28,
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
// 小サイズ用の数字テキスト（即時・安定。中央付近）。large=画像 / small=このテキスト。
export const numTextC = new TextContainerProperty({
  xPosition: 284, yPosition: 128, width: 80, height: 44,
  borderWidth: 0, paddingLength: 0,
  containerID: 6, containerName: 'numtext', isEventCapture: 0, content: ' ',
})

// ── 画像 ──
// 大きな数字（64×80・1ビット画像。画面中央 x=(576-64)/2=256, y=(288-80)/2=104）
export const NUMIMG = { w: 64, h: 80, x: 256, y: 104 } as const
export const numImg = new ImageContainerProperty({
  xPosition: NUMIMG.x, yPosition: NUMIMG.y, width: NUMIMG.w, height: NUMIMG.h,
  containerID: 11, containerName: 'num',
})
export const finImg = new ImageContainerProperty({
  xPosition: FINIMG.x, yPosition: FINIMG.y, width: FINIMG.w, height: FINIMG.h,
  containerID: 12, containerName: 'finimg',
})
