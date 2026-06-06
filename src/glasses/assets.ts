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
// 画像の消去は rebuildPageContainer（render 側）で行うため、ここでは送信のみ。
export async function sendImage(
  bridge: Bridge, containerID: number, containerName: string, pngName: string,
): Promise<void> {
  try {
    const buf = await loadPng(pngName)
    await bridge.updateImageRawData(new ImageRawDataUpdate({ containerID, containerName, imageData: buf }))
  } catch { /* best-effort */ }
}
