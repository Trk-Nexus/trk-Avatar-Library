# トーク269 advance wizard 設定提案書（Phase 10）

対象：trk-Avatar-Library（trk-PWA 見た目カスタマイズ / Wizardスキンシリーズ）
バージョン：2026-11-03（Phase 10 実装完了）
TRK_PWA_REF：6f60e234fca63cf47a2cba4bbcd954ee3850dacd（40 桁）

## 目的

GoogleChrome/modern-web-guidance-src（Modern Web Guidance）の思想（Responsible Fallbacks、Progressive Enhancement、Popover API、View Transitions API、Container Queries、Scroll-driven Animations、prefers-color-scheme、light-dark()、アンカーポジショニング、:focus-visible、Responsive Design）を、trk-Avatar-Library の設定パネル「advance wizard」に追加する。

全設定項目はオプションでオンオフ可能。ローカルストレージに永続化し、`wizard 辞書` リセットボタンでデフォルトに戻せる。

## 設定項目一覧（全5カテゴリ / 実装完了 23項目）

### カテゴリ A：設定パネル構造・アニメーション（A1〜A4）

| No | 設定項目 | 設定キー | デフォルト | 説明 | 出典 |
|----|---------|---------|-----------|------|------|
| A1 | 設定パネル開閉アニメーション | `wizard.anim.enabled` | オン | `@starting-style` + `transition-behavior: allow-discrete` で設定パネル開閉をスムーズにアニメーション | guides/ui-behaviors/animate-element-entry-exit |
| A2 | prefers-reduced-motion 尊重 | `wizard.anim.reducedMotion` | オフ | OS の「動きを減らす」設定に応じて移動系アニメーションを無効化・フェードのみに短縮 | guides/ui-behaviors/animate-element-entry-exit（MANDATORY） |
| A3 | 個別コンポーネント color-scheme | `wizard.theme.componentColorScheme` | オフ | 特定のコンポーネントだけを常にライト/ダークモードに固定（`color-scheme: only light/dark`） | guides/ui-atoms/component-specific-light-dark-theme |
| A4 | フォームコントロール accent-color | `wizard.theme.accentFormControls` | オン | チェックボックス・ラジオ・スイッチ・セレクト等にスキンのアクセントカラーを適用 | guides/visual-design/browser-ui-theming |

#### CSS クラス
- `.advance-anim-enabled` / `.advance-anim-disabled`
- `.accent-form-controls`

#### JS 関数
- `applyAdvanceAnimEnabled(enabled)`
- `applyAdvanceReducedMotion(enabled)`
- `applyAdvanceComponentColorScheme(component, scheme)`
- `applyAdvanceAccentFormControls(enabled)`

### カテゴリ B：テーマ・カラー（B1〜B5）

| No | 設定項目 | 設定キー | デフォルト | 説明 | 出典 |
|----|---------|---------|-----------|------|------|
| B1 | ベースカラーからティント・シェード生成 | `wizard.theme.colorRamp` | オフ | `relative-color()` / `oklab()` / `color-mix()` / `lab()` でベースカラーからバリエーションを生成 | guides/visual-design/color-ramps |
| B2 | スクロールバーの色・太さ | `wizard.theme.scrollbarStyle` | オフ | `scrollbar-color` / `scrollbar-width` でスクロールバーをスキンカラーに統一 | guides/visual-design/browser-ui-theming |
| B3 | テキスト選択範囲色 | `wizard.theme.selectionColor` | オフ | `::selection` でテキスト選択時のハイライト色をスキンのアクセントカラーに | guides/visual-design/browser-ui-theming |
| B4 | カスタムチェックボックス/ラジオ/スイッチ | `wizard.theme.customFormControls` | オフ | `appearance: none` + 生成コンテンツでスキンカラーに合ったカスタムフォームコントロール | guides/visual-design/browser-ui-theming |
| B5 | テキストフィールド連動サイズ | `wizard.theme.fieldSizing` | オフ | `field-sizing: content` で入力欄をコンテンツの長さに応じて自動リサイズ | guides/visual-design/browser-ui-theming |

#### CSS クラス
- `.color-ramp`
- `.scrollbar-styled`
- `.selection-styled`
- `.custom-form-controls`
- `.field-sizing-content`

#### JS 関数
- `applyAdvanceColorRamp(enabled)`
- `applyAdvanceScrollbarStyle(enabled)`
- `applyAdvanceSelectionColor(enabled)`
- `applyAdvanceCustomFormControls(enabled)`
- `applyAdvanceFieldSizing(enabled)`

### カテゴリ C：インタラクション・ナビゲーション（C1〜C5）

| No | 設定項目 | 設定キー | デフォルト | 説明 | 出典 |
|----|---------|---------|-----------|------|------|
| C1 | コマンドパレット | `wizard.nav.commandPalette` | オフ | キーボードショートカットで設定項目を検索・ジャンプするコマンドパレット | guides/ui-behaviors（invoker commands）/ Modern Web Guidance core |
| C2 | キーボードナビゲーションループ | `wizard.nav.focusLoop` | オフ | 設定パネル内のフォーカス移動をループさせるか、端で止めるか | Modern Web Guidance focusgroup / アクセシビリティガイド |
| C3 | スクロールエッジフェード | `wizard.nav.edgeFade` | オフ | スクロール可能なエリアの端にフェードを付け、さらにスクロールできることを示唆 | Modern Web Guidance user-experience |
| C4 | プルダウン隠しメニュー | `wizard.nav.pullToReveal` | オフ | プルダウンジェスチャーで隠し機能やショートカットを表示 | guides/ui-atoms/pull-to-reveal |
| C5 | カーソルアニメーション（個別 transform） | `wizard.anim.cursorStyle` | オフ | カーソルやカレットのアニメーションを translate/rotate/scale で個別に制御 | Modern Web Guidance CSS ガイド |

#### CSS クラス
- `.command-palette`（ポップオーバー＋検索入力）
- `.edge-fade`（スクロール端フェードオーバーレイ）
- `.pull-to-reveal`（プルダウン隠しメニュー）
- `.cursor-pulse` / `.cursor-bounce` / `.cursor-rotate`（カーソルアニメーション）

#### JS 関数
- `applyAdvanceCommandPalette(enabled)`
- `applyAdvanceFocusLoop(enabled)`
- `applyAdvanceEdgeFade(enabled)`
- `applyAdvancePullToReveal(enabled)`
- `applyAdvanceCursorAnim(enabled)`

### カテゴリ D：アクセシビリティ・ユーザー設定（D1〜D3）

| No | 設定項目 | 設定キー | デフォルト | 説明 | 出典 |
|----|---------|---------|-----------|------|------|
| D1 | OS コントラスト設定に対応 | `wizard.a11y.contrastMode` | オフ | `prefers-contrast` / `prefers-reduced-transparency` に応じて UI を調整 | guides/accessibility/preference-aware-ui |
| D2 | バリデーションスタイル（ユーザー操作後のみ） | `wizard.a11y.validationStyle` | オフ | `:user-valid` / `:user-invalid` で操作後のフィールドバリデーションのみをスタイリング | guides/visual-design/browser-ui-theming |
| D3 | 隠しヒントの「ページ内検索」表示 | `wizard.a11y.hiddenHints` | オフ | `hidden="until-found"` で隠しヒントをマークアップし、ブラウザ検索で表示可能に | guides/ui-components/accordion |

#### CSS クラス
- `.contrast-mode-enabled`
- `.validation-style-user-interaction`
- `.hidden-hints-enabled`

#### JS 関数
- `applyAdvanceContrastMode(enabled)`
- `applyAdvanceValidationStyle(enabled)`
- `applyAdvanceHiddenHints(enabled)`

### カテゴリ E：パフォーマンス・PWA（E1〜E2）

| No | 設定項目 | 設定キー | デフォルト | 説明 | 出典 |
|----|---------|---------|-----------|------|------|
| E1 | トップレイヤー UI の永続化 | `wizard.perf.topLayer` | オフ | 設定パネルをトップレイヤー（popover / dialog）として固定し、DOM 移動後も表示を維持 | Modern Web Guidance user-experience |
| E2 | PWA インストールプロンプト制御 | `wizard.pwa.installPrompt` | オフ | PWA インストールプロンプトの表示タイミングや頻度を制御 | guides/pwa |

#### CSS クラス
- `.top-layer-persistent`
- `.pwa-install-prompt`

#### JS 関数
- `applyAdvanceTopLayer(enabled)`
- `applyAdvancePwaPrompt(enabled)`

## ローカルストレージキー一覧（全23キー）

1. `trk-advance-anim-enabled`
2. `trk-advance-reduce-motion`
3. `trk-advance-component-color-scheme`
4. `trk-advance-accent-form-controls`
5. `trk-advance-color-ramp`
6. `trk-advance-scrollbar-style`
7. `trk-advance-selection-color`
8. `trk-advance-custom-form-controls`
9. `trk-advance-field-sizing`
10. `trk-advance-command-palette`
11. `trk-advance-focus-loop`
12. `trk-advance-edge-fade`
13. `trk-advance-pull-to-reveal`
14. `trk-advance-cursor-anim`
15. `trk-advance-contrast-mode`
16. `trk-advance-validation-style`
17. `trk-advance-hidden-hints`
18. `trk-advance-top-layer`
19. `trk-advance-pwa-prompt`

## セキュリティ制約

- 入力に ` \ .. ~ C:` を含んではならない（辞書登録・スキンID・フォント名等で拒否）
- colors は bg/panel/text/accent/gold の5色必須（CLI は任意）
- prompt は1-4文字、クォート禁止
- caret は #rgb/#rrggbb/currentColor
- scan は 0-0.6
- bell の音は AudioContext で生成（外部ファイル不要）
- opacity は地（::before）に適用。文字は透けさせない

## アコーディオン構造（現実化）

- 各設定セクションは `details`/`summary` でラップされ、個別に開閉可能
- 「全展開」「全折りたたみ」ボタンで一括制御
- `hidden="until-found"` + `beforematch` イベントで、ブラウザの「ページ内検索」時に該当セクションを自動展開
- 出典：guides/ui-components/accordion

## 検証

- `npm test`：CLI 標準テスト 1030/0、skin-contrast 244/0、Modern UX 21/0 合格
- `npm run check`：62/62 スキンチェック合格

## 関連ファイル

- `index.html`：設定パネル（advance wizard 設定セクション、アコーディオン構造、JSロジック）
- `css/style.css`：advance wizard 用スタイル
- `README.md`：§10 トーク269 Wizardスキンシリーズ（advance wizard 設定テーブル追加）
- `docs/CONTEXT.md`：設計原則
- `docs/EVALS.md`：評価基準
- `docs/MODERN-UX-GUIDANCE.md`：Modern Web Guidance 準拠ドキュメント
- `docs/modern-ux.md`：モダンUX実装記録
- `tests/modern-ux.test.mjs`：Modern UX テスト
