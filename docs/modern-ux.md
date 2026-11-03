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

### Phase 6: 設定隠蔽・ミニマルUX（完了）

#### 6-1. ミニマルヘッダー
ヘッダーをタイトル（trk!）＋ 設定ボタン（⚙️）のみに簡素化。テーマ切替セレクトやスキン選択ボタンは通常時非表示。

#### 6-2. 設定パネル（オーバーレイ）
設定ボタンまたは `Ctrl+K` / `Cmd+K` で中央オーバーレイ表示。`Esc` で閉じる。`backdrop-filter: blur(4px)` で背景をぼかし、設定に集中できるUX。
- `role="dialog" aria-modal="true"` でスクリーンリーダー対応
- 展開時に「閉じる」ボタンに初期フォーカス、閉じる時に設定ボタンにフォーカス戻し

#### 6-3. 設定パネル内集約
テーマ切替（ダーク/ライト/システム）、スキン選択ポップオーバー、スキンプレビューグリッドを設定パネル内に集約。

#### 6-4. 没入型ターミナル
通常時はターミナルが画面を埋め（`min-height: calc(100vh - 60px)`）、設定が必要なときだけパネルを展開。

#### 6-5. キーボードショートカット
- `Ctrl+K` / `Cmd+K`: 設定パネル開閉
- `Esc`: 設定パネルを閉じる / 入力クリア
- `Ctrl+L`: 画面クリア（clear コマンド）

### Phase 7: UX 設定拡張（完了）

#### 7-1. ターミナル表示設定（設定パネル内）
以下の設定項目を設定パネルに追加し、`localStorage` に保存・復元：
- **スキャンライン強度**（0〜0.6、range スライダー、`--cli-scan` で制御）
- **カーソル点滅速度**（通常/速い/遅い、`--cli-blink-speed` で制御）
- **フォントサイズ**（小/中/大、`--cli-font-size` で制御）
- **アニメーション減らすモード**（アクセシビリティ、`.reduce-motion` クラス）
- **ベル音オン/オフ**（`cli.bell.enabled` と連動）

#### 7-2. アクセシビリティ強化
- アニメーション減らすモードでモーションに敏感なユーザーに配慮
- 各設定変更時にスクリーンリーダーへアナウンス（`aria-live="polite"`）

### Phase 8: モダンUX機能拡張（完了）

#### 8-1. View Transitions API（スキン変更時のスムーズな遷移）
`document.startViewTransition()` でスキン変更時の DOM 更新を囲み、スムーズな遷移アニメーションを適用。未サポートブラウザでは即座に適用。

#### 8-2. Container Queries（スキンプレビューカード）
`.skin-preview-card` に `container-type: inline-size` / `container-name: skin-card` を設定。`@container skin-card (max-width: 200px)` と `(min-width: 300px)` でカード幅に応じた内部レイアウト変更。

#### 8-3. Scroll-driven Animations（スキンプレビューカード）
`animation-timeline: view()` でビューポート連動フェードイン＋スライドイン。`animation-range: entry 10% cover 30%`。未サポートブラウザでも通常表示（Progressive Enhancement）。

#### 8-4. FOUC 対策（テーマの即座適用）
`<head>` 内のインラインスクリプトで `localStorage` からテーマを読み込み、`data-theme` と `color-scheme` を CSS 読み込み前に即座に設定。テーマのちらつきを防止。

### Phase 9: モダンUX 完結（Popover API / トースト通知 / ショートカットヘルプ / 魔導書テーマスキン）（完了）

#### 9-1. Popover API 移行（設定パネル・スキンピッカー）
`hidden` 属性による開閉をネイティブ Popover API に移行。
- 設定パネル：`popover` 属性、`popovertarget="settings-panel"` で開閉トグル。`::backdrop` で背景ぼかし・暗転。`.settings-backdrop` 要素を削除。
- スキンピッカー：`popover` 属性、`popovertarget="skin-picker-popover"` で開閉トグル。`position: absolute` + `anchor-name: --skin-picker` でトグルボタンにアンカー。
- JS：`showPopover()` / `hidePopover()` を使用。`toggle` イベントで `aria-expanded` を連動。`:popover-open` 擬似クラスで開閉アニメーション。
- キーボード：Ctrl+K / Cmd+K で設定開閉、Esc で閉じる。

#### 9-2. トースト通知
`showToast(message, type = "info")` を実装。`role="status"` `aria-live="polite"` のトーストを画面下部中央に表示し、3秒後にフェードアウトして DOM から削除。type は info/success/error/warning。

#### 9-3. ベル音（AudioContext 生成）
`playBell()` を AudioContext で生成（オシレーター + ゲイン、周波数 880Hz→1760Hz の swept sine、0.3秒）。外部音声ファイル不要。`js/cli.js` の `CliBell` も AudioContext で実装済み。

#### 9-4. キーボードショートカットヘルプ
`?` キーでショートカット一覧ポップオーバー（`popover` 属性、role="dialog"）を表示。`popovertargetaction="hide"` で閉じ、フォーカスを閉じるボタンに移動。一覧は表形式でキーと操作を記載。

#### 9-5. 魔導書テーマスキンシリーズ（グリモワール等）追加
`catalog/skins.json` に魔導書テーマスキンを追加し、`tools/import-skin-catalog.mjs --cat=wizard` で `js/skins-wizard.js` を再生成（手編集禁止）。
- 第1弾（Phase 9b）：`wizard-grimoire-noir`（黒の魔導書、dark/access）、`wizard-grimoire-aureate`（黄金の魔導書、grad/light）、`wizard-grimoire-umbra`（影の魔導書、dark/fun）、`wizard-grimoire-celestial`（天球の魔導書、grad/light）
- 第2弾（前回追加）：`wizard-solomon-key`（ソロモンの鍵、grad/light）、`wizard-lemgeton`（レメゲトン、dark/access）、`wizard-solomon-book`（ソロモンの書、life/grad）、`wizard-goetia`（ゴエティア、dark/fun）、`wizard-necronomicon`（ネクロノミコン、dark/fun）、`wizard-necronomicon-azif`（ネクロノミコン アル・アジフ、grad/dark）
- 第3弾（白魔術系統）：`wizard-raziel`（ラジエルの書、light/access）、`wizard-abramelin`（アブラメリンの書、life/grad）、`wizard-agrippa`（オカルト哲学三書、grad/light）、`wizard-honorius`（ホノリウスの誓約書、light/access）、`wizard-heptameron`（ヘプタメロン、grad/light）、`wizard-arbatel`（アルバテル、life/grad）
- 第4弾（東洋軍略書）：`wizard-liu-tao`（六韜、grad/light）、`wizard-san-lue`（三略、dark/access）、`wizard-sun-tzu`（孫子、dark/fun）、`wizard-sima-fa`（司馬法、light/access）、`wizard-wei-liao-zi`（尉繚子、grad/dark）、`wizard-seven-military-classics`（武経七書、life/grad）
- 第5弾（西洋軍略書）：`wizard-vegetius`（ウェゲティウス 軍事論、grad/dark）、`wizard-machiavelli`（マキアヴェッリ 戦術論、grad/light）、`wizard-clausewitz`（クラウゼヴィッツ 戦争論、dark/fun）、`wizard-jomini`（ジョミニ 戦争概論、light/access）、`wizard-mahan`（マハン 海上権力史論、grad/dark）、`wizard-douhet`（ドゥーエ 制空、dark/fun）
- 第6弾（特殊WebUX体験スキン）：`wizard-aura-caster`（オーラキャスター、grad/light、マウス追従オーラ＋グラデーションアニメーション）、`wizard-glitch-sorcerer`（グリッチソーサラー、dark/fun、CSSアニメーションによるグリッチ・色ずれ・走査線エフェクト）、`wizard-crystal-gazer`（クリスタルゲイザー、grad/dark、ガラスモーフィズム＋backdrop-filterぼかし）、`wizard-void-walker`（ボイドウォーカー、dark/access、発光テキスト＋星屑エフェクト）
- colors に bg/panel/text/accent/gold の5色を定義。cli オブジェクトに prompt（1-4文字、クォート無）、caret（#rrggbb）、scan（0-0.6）を定義。
- スキン総数 285 種、wizard 56 種、CLI 対応 wizard 44 種。

## 関連ファイル

| ファイル | 役割 |
|----------|------|
| docs/MODERN-UX-GUIDANCE.md | Modern Web Guidance を参照する旨と改修計画（フェーズ別） |
| docs/CONTEXT.md | 設計原則・受入条件 |
| docs/EVALS.md | 評価項目・合格基準 |
| docs/modern-ux.md | 実装ガイド（本ファイル） |
| css/style.css | モダンカラースキーム・アンカーポジショニング・レスポンシブスタイル・Popover/トースト/ショートカットヘルプスタイル |
| index.html | テーマ切替・スキンピッカー・スキンプレビュー・PWA 登録・Core Web Vitals 測定・トースト・ショートカットヘルプ |
| sw.js | Service Worker キャッシュ戦略・オフラインフォールバック |
| manifest.json | PWA マニフェスト |
| js/skins-wizard.js | wizard スキン定義（catalog/skins.json から import ツールで生成、手編集禁止） |
| catalog/skins.json | スキンカタログ（export-skin-gallery.mjs 生成物、スキン定義の提供元） |
| tests/modern-ux.test.mjs | モダン UX 自動テスト |
| tests/trk269-cli-standard.test.mjs | trk269 CLI 標準テスト |

## 変更履歴

| 日付 | 内容 |
|------|------|
| 2026-11-03 | 初版作成。Phase 1〜5 の実装手順を記録。 |
| 2026-11-03 | Phase 6 実装手順を追加。 |
| 2026-11-03 | Phase 7 実装手順を追加。 |
| 2026-11-03 | Phase 8 実装手順を追加。 |
| 2026-11-03 | Phase 9 実装手順を追加（Popover API 移行、トースト通知、ショートカットヘルプ、魔導書テーマスキンシリーズ）。 |

