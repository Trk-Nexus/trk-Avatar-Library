# トーク269 Phase 10 レビュー依頼（advance wizard 設定）

## 概要

Modern Web Guidance (GoogleChrome/modern-web-guidance-src) の思想（Popover API、View Transitions、Container Queries、Scroll-driven Animations、prefers-color-scheme、light-dark()、アンカーポジショニング、:focus-visible、Responsible Fallbacks、Progressive Enhancement）を、trk-Avatar-Library の設定パネル（advance wizard）に大胆に追加しました。

## 実装内容（Phase 10）

### 設定パネル構造・アニメーション（4項目）
- 設定パネル開閉アニメーション（`@starting-style` + `transition-behavior: allow-discrete`）
- prefers-reduced-motion 尊重（MANDATORY）
- 個別コンポーネント color-scheme オーバーライド
- フォームコントロール accent-color 適用

### テーマ・カラー（5項目）
- ベースカラーからティント・シェード動的生成（`relative-color()` / `oklab()` / `color-mix()` / `lab()`）
- スクロールバーの色・太さカスタマイズ（`scrollbar-color` / `scrollbar-width`）
- テキスト選択範囲の色（`::selection`）
- カスタムチェックボックス / ラジオ / スイッチ（`appearance: none`）
- テキストフィールド連動サイズ（`field-sizing: content`）

### インタラクション・ナビゲーション（5項目）
- コマンドパレット（Ctrl+K / Cmd+K）
- キーボードナビゲーションループ
- スクロールエッジフェード
- プルダウン隠しメニュー（pull-to-reveal）
- カーソルアニメーション（個別 transform：pulse/bounce/rotate）

### アクセシビリティ・ユーザー設定（3項目）
- OS コントラスト設定対応（`prefers-contrast` / `prefers-reduced-transparency`）
- バリデーションスタイル（`:user-valid` / `:user-invalid`、操作後のみ）
- 隠しヒントの「ページ内検索」表示（`hidden="until-found"`）

### パフォーマンス・PWA（2項目）
- トップレイヤー UI の永続化
- PWA インストールプロンプト制御

### 共通仕様
- 全23項目すべて**オプションでオンオフ可能**（デフォルト値は各設定に記載）
- ローカルストレージに永続化
- `wizard 辞書` のリセットボタンでデフォルトに戻せる
- セキュリティ制約（使用禁止文字 ` \ .. ~ C:` 拒否）を順守

## 検証結果

- `npm test`：CLI 標準テスト 1030/0、skin-contrast 244/0、Modern UX 21/0 合格
- `npm run check`：62/62 スキンチェック合格

## TRK_PWA_REF

`6f60e234fca63cf47a2cba4bbcd954ee3850dacd`（40 桁）

## 提出ファイル（Google Drive アップロード対象）

| ファイル | 内容 |
|---------|------|
| index.html | 設定パネル（advance wizard 設定セクション、アコーディオン構造、JSロジック） |
| css/style.css | advance wizard 用スタイル（アコーディオン、色ランプ、スクロールバー、::selection、カスタムフォーム、エッジフェード、プルダウン、カーソルアニメーション、コントラスト、バリデーション、トップレイヤー、PWAプロンプト） |
| README.md | §10 トーク269 Wizardスキンシリーズ（advance wizard 設定テーブル追加） |
| ADVANCE_WIZARD_PROPOSALS.md | 全25項目の提案書 |
| docs/CONTEXT.md | 設計原則 |
| docs/EVALS.md | 評価基準 |
| docs/MODERN-UX-GUIDANCE.md | Modern Web Guidance 準拠ドキュメント |
| docs/modern-ux.md | モダンUX実装記録 |
| tests/modern-ux.test.mjs | Modern UX テスト |
| REVIEW_NOTE.md | 本レビュー依頼書 |

## レビュー観点

1. Modern Web Guidance の思想（Responsible Fallbacks、Progressive Enhancement）が適切に反映されているか
2. 各設定項目がオンオフ可能か、デフォルト値が適切か
3. セキュリティ制約（使用禁止文字拒否）が守られているか
4. テスト（npm test / npm run check）がすべて合格しているか

レビューをお願いします。