# trk Modern UX — 設計原則と受入条件 (CONTEXT)

## 目的
trk-Avatar-Library のトーク269（ターミナルの定番とWizardスキン）完了後、モダンな UX を開発するための大規模改修の設計原則と受入条件を定める。

## 参照元（常時使用）
**GoogleChrome/modern-web-guidance-src**  
https://github.com/GoogleChrome/modern-web-guidance-src

本リポジトリの以下を trk modern UX 開発の基準とする。
- `features/` — CSS モダン機能ガイダンス（color-scheme, light-dark(), accent-color, anchor-positioning, customizable-select, image-function など）
- `guides/` — アクセシビリティ / CSS / フォーム / HTML / JS / パフォーマンス ガイド
- `docs/CONTEXT.md` — 設計原則・受入条件
- `docs/EVALS.md` — 評価項目・合格基準

## 対象スコープ
trk-Avatar-Library（PWA アバターライブラリ）の UI/UX をモダン化。
- スキンカタログ（catalog/skins.json、253種、wizard 24種含む）
- CLI ターミナル機能（pwd/ls/cd/cat/grep/history/clear/echo/bell）
- PWA 基盤（Service Worker, manifest.json）
- スキンプレビュー・ギャラリー

## 設計原則

### 1. モダン CSS ファースト
Modern Web Guidance `features/` のモダン CSS 機能を積極的に採用する。
- `color-scheme` / `light-dark()` でライト・ダークテーマをサポート
- `accent-color` でフォーム要素のテーマ色を統一
- アンカーポジショニング（anchor-positioning）でポップオーバー・ツールチップを配置
- カスタマイズ可能 `<select>` でフォームをモダン化

### 2. アクセシビリティ優先
Modern Web Guidance `guides/accessibility` に準拠。
- キーボードナビゲーションの完全対応
- フォーカスリングの可視化
- ARIA ラベル・ロールの適切な付与
- コントラスト比 4.5:1 以上（WCAG AA 準拠）

### 3. PWA ファースト
オフライン動作・インストール可能な PWA としての体験を維持・強化。
- Service Worker によるキャッシュ戦略
- Web App Manifest の充実
- Core Web Vitals の最適化

### 4. 段階的強化（Progressive Enhancement）
古いブラウザでも基本機能は動作し、モダンブラウザではモダン UX を享受できる設計。
- `@supports` で機能判定
- フォールバックを明示（FEATURE_FALLBACKS パターン）

### 5. セキュリティ
入力にバッククォート・バックスラッシュ・`..`・`~`・`C:` を含んではならない。
生のファイルパスは受け付けない。

## 受入条件（トーク269 基準、維持）
| 項目 | 条件 |
|------|------|
| npm run check | 緑（exit 0） |
| tests/trk269-cli-standard.test.mjs | 23件 通過 |
| tests/skin-contrast.test.mjs | 61種 通過 |
| TRK_PWA_REF | 40桁フル SHA（7桁禁止） |

## 受入条件（trk Modern UX 新規、Phase 1 時点での暫定）
| 項目 | 条件 |
|------|------|
| docs/CONTEXT.md | 本ファイルとして存在し、設計原則を記載 |
| docs/EVALS.md | 評価項目・合格基準を記載 |
| prefers-color-scheme | ライト/ダーク自動切替に対応 |
| CSS カスタムプロパティ | --cli-* などの統一命名規則を適用 |
| アクセシビリティ | フォーカスリング可視化、キーボードナビ対応 |

## ドキュメント構成
| ファイル | 役割 |
|----------|------|
| docs/MODERN-UX-GUIDANCE.md | Modern Web Guidance を参照する旨と改修計画（フェーズ別） |
| docs/CONTEXT.md | 設計原則・受入条件（本ファイル） |
| docs/EVALS.md | 評価項目・合格基準 |
| docs/modern-ux.md | 実装ガイド（Phase 5 で作成予定） |

## 変更履歴
| 日付 | 内容 |
|------|------|
| 2026-11-03 | 初版作成。トーク269 完了後、Phase 1 から着手。 |
