import { defineConfig } from 'vite'

export default defineConfig({
  base: './', // パッケージ(.ehpk)がルート以外から配信されてもアセット解決できるように
  server: { host: true, port: 5173 },
  build: { target: 'esnext' },
})
