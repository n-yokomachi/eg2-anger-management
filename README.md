# Anger Management (eg2-anger-management)

Even Realities G2 向けジョークアプリ。カッとなったら起動 → グラスがカウント（日本式6秒 / 米国式10カウント）→ 完了時に偉人の名言か派手な「ANGER MANAGED」をランダム表示。表示専用・完全ローカル。

> 「怒りのピークは6秒」も「count to ten」も学術的原典のない俗説。グラスは律儀に数えます。

## 設定（スマホ側）
- **Language**: 表示言語（en / ja）
- **Region**: 数え方（🇯🇵 6 / 🇺🇸 10）
- **Finisher**: 完了演出（名言 / ANGER MANAGED / ランダム）
- **Test Mode**: ON でカウントせず全演出を順番に表示（デバッグ用）

## 開発
- `npm run assets` … 画像生成（要 Pillow）
- `npm run dev` / `npm run simulate` … 開発・シミュレータ
- `npm test` … 単体テスト
- `npm run build && npm run pack` … `.ehpk` 生成
