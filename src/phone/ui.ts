import type { Settings, Lang, Region, FinisherMode } from '../settings'
import { UI, regionReason, finisherReason } from '../i18n'

export interface PhoneHandlers {
  onLanguage: (v: Lang) => void
  onRegion: (v: Region) => void
  onFinisher: (v: FinisherMode) => void
  onTest: (v: boolean) => void
}

export function mountPhoneUi(s: Settings, h: PhoneHandlers): void {
  const app = document.querySelector<HTMLDivElement>('#app')!
  const t = UI[s.language]
  app.innerHTML = `
    <div class="am-root">
      <header class="am-head">
        <h1 class="am-title">${t.title}</h1>
        <p class="am-status">${t.status}</p>
      </header>

      <div class="am-lbl">LANGUAGE / 言語</div>
      <div class="am-seg" id="am-lang">
        <button data-v="en">English</button><button data-v="ja">日本語</button>
      </div>

      <div class="am-lbl">REGION / 地域</div>
      <div class="am-seg" id="am-region">
        <button data-v="america">🇺🇸 ${t.america}</button><button data-v="japan">🇯🇵 ${t.japan}</button>
      </div>
      <p class="am-why" id="am-region-why">${regionReason(s.region, s.language)}</p>

      <div class="am-lbl">FINISHER / 演出</div>
      <div class="am-seg am-seg3" id="am-fin">
        <button data-v="quote">${t.finQuote}</button><button data-v="managed">${t.finManaged}</button><button data-v="both">${t.finRandom}</button>
      </div>
      <p class="am-why" id="am-fin-why">${finisherReason(s.finisher, s.language)}</p>

      <div class="am-lbl">TEST MODE / テスト</div>
      <div class="am-seg" id="am-test">
        <button data-v="off">OFF</button><button data-v="on">ON</button>
      </div>
      <p class="am-why">${t.testDesc}</p>
    </div>`
  injectStyles()

  const mark = (id: string, v: string) => {
    const seg = app.querySelector<HTMLDivElement>(id)!
    seg.querySelectorAll('button').forEach((b) => b.classList.toggle('on', b.dataset.v === v))
  }
  mark('#am-lang', s.language); mark('#am-region', s.region); mark('#am-fin', s.finisher)
  mark('#am-test', s.testMode ? 'on' : 'off')

  app.querySelector('#am-lang')!.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest('button'); if (!b) return
    h.onLanguage(b.dataset.v as Lang)
  })
  app.querySelector('#am-region')!.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest('button'); if (!b) return
    const v = b.dataset.v as Region; mark('#am-region', v)
    app.querySelector('#am-region-why')!.textContent = regionReason(v, s.language)
    h.onRegion(v)
  })
  app.querySelector('#am-fin')!.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest('button'); if (!b) return
    const v = b.dataset.v as FinisherMode; mark('#am-fin', v)
    app.querySelector('#am-fin-why')!.textContent = finisherReason(v, s.language)
    h.onFinisher(v)
  })
  app.querySelector('#am-test')!.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest('button'); if (!b) return
    const v = b.dataset.v === 'on'; mark('#am-test', v ? 'on' : 'off')
    h.onTest(v)
  })
}

function injectStyles() {
  if (document.getElementById('am-style')) return
  const css = `
  /* 端末のダークモードに関わらずライト固定（color-scheme:light でフォーム等もライトに） */
  :root{--text:#232323;--dim:#7B7B7B;--bg:#F5F5F7;--surface:#FFF;--track:rgba(35,35,35,.06);--accent:#FEF991;color-scheme:light;}
  /* 英語はミニマルな Helvetica 系。日本語は Hiragino にフォールバック（Web読込なし=権限不要） */
  html,body{margin:0;height:100%;background:var(--bg);color:var(--text);
    font:400 16px/1.5 'Helvetica Neue',Helvetica,Arial,'Hiragino Kaku Gothic ProN','Hiragino Sans',system-ui,sans-serif;
    letter-spacing:-.01em;-webkit-text-size-adjust:100%;touch-action:manipulation;}
  .am-root{max-width:560px;margin:0 auto;padding:32px 20px;box-sizing:border-box}
  .am-head{margin-bottom:20px}
  /* 太字は使わない（全般 weight:400 のミニマル指定） */
  .am-title{margin:0 0 6px;font-size:26px;font-weight:400;letter-spacing:-.02em}
  .am-status{margin:0;font-size:14px;color:var(--dim);white-space:pre-line}
  .am-lbl{font-size:12px;font-weight:400;letter-spacing:1.5px;color:var(--dim);margin:20px 0 8px}
  .am-seg{display:flex;background:var(--track);border-radius:12px;padding:4px;gap:4px}
  .am-seg button{flex:1;font:inherit;font-size:15px;font-weight:400;color:var(--text);background:transparent;border:0;
    padding:10px 6px;border-radius:9px;cursor:pointer;-webkit-tap-highlight-color:transparent;transition:background .15s}
  .am-seg button.on{background:var(--accent);color:#232323;box-shadow:0 1px 2px rgba(0,0,0,.12)}
  .am-seg3 button{font-size:13px}
  .am-why{font-size:12px;line-height:1.5;color:var(--dim);margin:9px 2px 0}
  `
  const el = document.createElement('style'); el.id = 'am-style'; el.textContent = css
  document.head.appendChild(el)
}
