# trk Modern UX 実装ガイド

## 概要
trk Modern UX は、GoogleChrome/modern-web-guidance-src を参照したトーク269 以降のモダン UX 開発ガイドです。本文書は各フェーズの実装手順と設計判断の記録をまとめます。

## 参照元（常時使用）
**GoogleChrome/modern-web-guidance-src**  
https://github.com/GoogleChrome/modern-web-guidance-src

| ディレクトリ | 用途 |
|-------------|------|
| `features/` | CSS モダン機能ガイダンス（color-scheme, light-dark(), accent-color, anchor-positioning, customizable-select, image-function など） |
| `guides/` | アクセシビリティ / CSS / フォーム / HTML / JS / パフォーマンス ガイド |
| `docs/CONTEXT.md` | 設計原則・受入条件 |
| `docs/EVALS.md` | 評価項目・合格基準 |

## フェーズ別実装手順

### Phase 1: 基盤整備（完了）

#### 1-1. docs/CONTEXT.md の作成
設計原則と受入条件を定義。
- モダン CSS ファースト
- アクセシビリティ優先
- PWA ファースト
- 段階的強化（Progressive Enhancement）
- セキュリティ（生パス・使用禁止文字の拒否）

#### 1-2. docs/EVALS.md の作成
各フェーズの評価項目と合格基準を定義（E1〜E19）。

#### 1-3. CSS カスタムプロパティ体系の統一
`--color-*` ベースカラー、`--skin-*` スキン上書き変数、`--cli-*` CLI 操作感変数を統一命名。

#### 1-4. prefers-color-scheme 対応
`@media (prefers-color-scheme: light / dark)` でライト・ダークテーマを自動切替。

#### 1-5. 手動テーマ上書き
`data-theme="light" / "dark"` でシステム設定に関わらず手動切替可能。

### Phase 2: モダン CSS 適用（完了）

#### 2-1. light-dark() の導入
`--color-bg: light-dark(#fafafa, #0a0a0a)` のようにベースカラーを `light-dark()` で定義。

#### 2-2. color-scheme 宣言
`:root { color-scheme: light dark; }` でブラウザ UI 色を自動追従。

#### 2-3. アンカーポジショニング
スキン選択ポップオーバーに `position-anchor: --skin-picker`、`position-try-options: flip-block, flip-inline` を適用。

#### 2-4. カスタマイズ可能 `<select>`
`appearance: none`、SVG data URI のカスタム矢印、フォーカスリング（`:focus-visible`）を適用。

#### 2-5. accent-color の統一
フォーム要素（button/select/input）に `accent-color: var(--skin-accent)` を適用。

#### 2-6. テーマ切替コントロール
テーマセレクト（ダーク/ライト/システム）＋ トグルボタン（🌙/☀️）を実装。

### Phase 3: UX コンポーネントのモダン化（完了）

#### 3-1. スキンプレビューカード
Grid レイアウト（`repeat(auto-fill, minmax(220px, 1fr))`）、カラースウォッチ（bg/panel/text/accent/gold）、適用ボタンを実装。

#### 3-2. キーボードナビゲーション
- スキンピッカー: ArrowUp/Down で移動、Enter/Space で適用、Escape で閉じる
- スキンカード: tabIndex 管理、Enter/Space で適用
- CLI: Esc で入力クリア、Ctrl+L で画面クリア

#### 3-3. ARIA ラベル強化
`role="log"`（ターミナル出力）、`aria-label`（各ボタン・セレクト・メニュー）、`aria-controls`（ポップオーバー連携）、`aria-expanded`（展開状態）

#### 3-4. スクリーンリーダー用ライブリージョン
`aria-live="polite"` / `aria-atomic="true"` で状況アナウンスを実装。

#### 3-5. レスポンシブ対応（モバイルファースト）
640px / 480px ブレークポイント。テーマコントロールの縦積み、ポップオーバーの中央配置、カードの 1 列化。

#### 3-6. カーソル・スキャンライン強化
`blink-fast`（0.5s）、`blink-slow`（2s）カーソルアニメーション。`scan-fast`（2s）、`scan-slow`（6s）スキャンラインアニメーション。

### Phase 4: パフォーマンス・PWA 強化（完了）

#### 4-1. Service Worker 戦略見直し
- ナビゲーションリクエスト: ネットワークファースト＋オフラインフォールバック
- 静的アセット: キャッシュファースト＋バックグラウンド更新（stale-while-revalidate）
- 動的リソース: ネットワークファースト＋キャッシュ容量管理（最大 50 エントリ）

#### 4-2. キャッシュ更新・即座有効化
`skipWaiting()` / `clients.claim()` で新バージョンを即座に有効化。`updatefound` イベントで新バージョン検出。

#### 4-3. オフラインフォールバック
オフライン時に `index.html` をキャッシュから返却。最後の手段として 503 レスポンス。

#### 4-4. PWA マニフェスト充実
`description`, `dir`, `categories`, `languages` 追加。icon-192 / icon-512（maskable any）追加。

#### 4-5. Core Web Vitals 測定
LCP / FID / CLS を Performance Observer で測定。`window.trkWebVitals` として公開。

#### 4-6. リソースヒント
`preconnect`, `dns-prefetch`, `preload`（CSS）、`rel="icon"` を追加。

### Phase 5: ドキュメント・テスト整備（完了）

#### 5-1. docs/modern-ux.md の作成
本ファイル。各フェーズの実装手順と設計判断を記録。

#### 5-2. モダン UX テスト拡充
`tests/modern-ux.test.mjs` を新設し、EVALS 各項目の自動テストを追加。

#### 5-3. 受入条件の策定とレビュー
npm run check / テスト各種 + モダン UX EVALS 基準を満たすことを確認し、レビュー。

## 設計判断の記録

| 項目 | 判断 | 理由 |
|------|------|------|
| カラースキーム | `light-dark()` + `color-scheme: light dark` | Modern Web Guidance features/color-scheme に準拠。ブラウザネイティブのダーク/ライト切替を活用 |
| アンカーポジショニング | CSS `position-anchor` / `position-try` | Modern Web Guidance features/anchor-positioning に準拠。JS で位置計算するよりパフォーマンスが良い |
| カスタムセレクト | `appearance: none` + SVG 矢印 | Modern Web Guidance features/customizable-select に準拠。ネイティブ挙動を維持しつつ見た目をモダン化 |
| テーマ切替 | `data-theme` + `localStorage` | システム設定（prefers-color-scheme）と手動切替の両立。永続化でユーザー体験を向上 |
| Service Worker | キャッシュファースト＋バックグラウンド更新 | PWA としてオフライン動作を最優先。stale-while-revalidate で常に最新コンテンツを提供 |
| Core Web Vitals | Performance Observer | ブラウザネイティブ API で正確に測定。外部ライブラリ依存を避ける |

## セキュリティ注意事項

- 入力にバッククォート・バックスラッシュ・`..`・`~`・`C:` を含んではならない（`js/data.js` の `sanitizeCliLook` でチェック）
- 生のファイルパスは受け付けない（`/`、`..`、`~`、`C:` で始まるパスを拒否）
- 外部 URL（`https://` / `http://`）はスキン定義に含めない

## トラブルシューティング

| 症状 | 原因 | 対処 |
|------|------|------|
| テーマが切り替わらない | `localStorage` に古い値が残っている | ブラウザの devtools で `localStorage.removeItem('trk-theme')` を実行 |
| Service Worker が更新されない | 古いキャッシュが残っている | `unregister()` 後、ページをリロード |
| ポップオーバーが位置ずれする | アンカー要素が `--skin-picker` に紐付いていない | `style.anchorName = '--skin-picker'` を確認 |
| スキンプレビューが表示されない | `SKINS_WIZARD` のインポートに失敗 | `js/skins-wizard.js` の生成状態を確認 |

## 関連ファイル

| ファイル | 役割 |
|----------|------|
| docs/MODERN-UX-GUIDANCE.md | Modern Web Guidance を参照する旨と改修計画（フェーズ別） |
| docs/CONTEXT.md | 設計原則・受入条件 |
| docs/EVALS.md | 評価項目・合格基準 |
| docs/modern-ux.md | 実装ガイド（本ファイル） |
| css/style.css | モダンカラースキーム・アンカーポジショニング・レスポンシブスタイル |
| index.html | テーマ切替・スキンピッカー・スキンプレビュー・PWA 登録・Core Web Vitals 測定 |
| sw.js | Service Worker キャッシュ戦略・オフラインフォールバック |
| manifest.json | PWA マニフェスト |
| tests/modern-ux.test.mjs | モダン UX 自動テスト |

## 変更履歴

| 日付 | 内容 |
|------|------|
| 2026-11-03 | 初版作成。Phase 1〜5 の実装手順を記録。 |
