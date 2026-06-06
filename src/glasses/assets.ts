import { ImageRawDataUpdate } from '@evenrealities/even_hub_sdk'

type Bridge = { updateImageRawData(u: ImageRawDataUpdate): Promise<unknown> }

const cache = new Map<string, ArrayBuffer>()
async function loadPng(name: string): Promise<ArrayBuffer> {
  const hit = cache.get(name)
  if (hit) return hit
  const r = await fetch(`assets/${name}`) // 相対パス（.ehpk 配信対応）
  const buf = await r.arrayBuffer()
  cache.set(name, buf)
  return buf
}

// 指定コンテナへ PNG を送る。失敗は握りつぶす（postMessage 失敗で落とさない）。
export async function sendImage(
  bridge: Bridge, containerID: number, containerName: string, pngName: string,
): Promise<void> {
  try {
    const buf = await loadPng(pngName)
    await bridge.updateImageRawData(new ImageRawDataUpdate({ containerID, containerName, imageData: buf }))
  } catch { /* best-effort */ }
}

// 透明（全黒=非点灯）画像でコンテナを消去する。
const blankCache = new Map<string, ArrayBuffer>()
async function blankPng(w: number, h: number): Promise<ArrayBuffer> {
  const key = `${w}x${h}`
  const hit = blankCache.get(key)
  if (hit) return hit
  const canvas = document.createElement('canvas')
  canvas.width = w; canvas.height = h
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, w, h) // 黒=透明
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/png'))
  const buf = await blob!.arrayBuffer()
  blankCache.set(key, buf)
  return buf
}
export async function clearImage(
  bridge: Bridge, containerID: number, containerName: string, w: number, h: number,
): Promise<void> {
  try {
    const buf = await blankPng(w, h)
    await bridge.updateImageRawData(new ImageRawDataUpdate({ containerID, containerName, imageData: buf }))
  } catch { /* best-effort */ }
}
