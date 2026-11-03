# trk Modern UX 開発ガイドライン

## 参照元（常時使用）

**GoogleChrome/modern-web-guidance-src**  
https://github.com/GoogleChrome/modern-web-guidance-src

trk modern UX の開発において、本リポジトリの以下を常時参照・適用するものとする。

| ディレクトリ | 用途 |
|-------------|------|
| `features/` | CSS モダン機能ガイダンス（color-scheme, light-dark(), accent-color, anchor-positioning, customizable-select, image-function など） |
| `guides/` | アクセシビリティ / CSS / フォーム / HTML / JS / パフォーマンス ガイド |
| `docs/` | CONTEXT.md（設計原則・受入条件）、EVALS.md（評価項目・合格基準）、RELEASING.md |

---

## trk Modern UX 改修計画

### 概要
trk-Avatar-Library のトーク269（ターミナルの定番とWizardスキン）完了後、モダンな UX を開発するための大規模改修。GoogleChrome/modern-web-guidance-src を基準とし、PWA アバターライブラリの UI/UX をモダン化する。

### フェーズ

#### Phase 1: 基盤整備（1〜2週間）
- [ ] `docs/CONTEXT.md` 作成（trk modern UX の設計原則・受入条件）
- [ ] `docs/EVALS.md` 作成（評価項目・合格基準）
- [ ] CSS カスタムプロパティ体系の見直し（--cli-* などの統一）
- [ ] `prefers-color-scheme` 対応（ライト/ダーク自動切替）

#### Phase 2: モダン CSS 適用（2〜3週間）
- [ ] `color-scheme` / `light-dark()` 導入
- [ ] `accent-color` でフォーム要素のテーマ色統一
- [ ] アンカーポジショニング（ポップオーバー・ツールチップ配置）
- [ ] カスタマイズ可能 `<select>` への移行

#### Phase 3: UX コンポーネントのモダン化（3〜4週間）
- [ ] スキンプレビューのモダンUI（グリッド→カード＋フィルタ）
- [ ] CLI ターミナルのモダン化（スキャンライン、カーソルアニメーション強化）
- [ ] アクセシビリティ対応（フォーカスリング、ARIAラベル、キーボード操作）
- [ ] レスポンシブ対応（モバイルファースト）

#### Phase 4: パフォーマンス・PWA 強化（2週間）
- [ ] Service Worker の戦略見直し（キャッシュ更新、オフラインフォールバック）
- [ ] 遅延読み込み（スキンプレビュー画像の遅延読込）
- [ ] Core Web Vitals 測定・改善

#### Phase 5: ドキュメント・テスト整備（1〜2週間）
- [ ] `docs/modern-ux.md` 作成（実装ガイド）
- [ ] EVALS に基づく自動テスト拡充
- [ ] 受入条件の策定とレビュー

### 必要なリソース
- Google Drive フォルダ `trk-PWA-trk269-端末の定番とWizardのスキン-2026-11-03`（設計書・進捗文書のアップロード先）
- GitHub リポジトリ `Trk-Nexus/trk-Avatar-Library`（ブランチ `arena/2d72d3d6-trk-avatar-library` で作業）

### 受入条件（暫定）
- npm run check 緑
- tests/trk269-cli-standard.test.mjs 23件通過
- tests/skin-contrast.test.mjs 61種通過
- モダン UX 各フェーズの EVALS 基準を満たすこと

---

## 変更履歴

| 日付 | 内容 |
|------|------|
| 2026-11-03 | 初版作成。GoogleChrome/modern-web-guidance-src を常時参照ガイドラインとして採用。トーク269 完了後、Phase 1 から着手予定。 |
