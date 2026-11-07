# trk-re-modern 開発マップ：概念・資料・道具

2026-11-07 時点の**開発者向け索引**。re-modern を初めて調べる人が、概念から試作・検証・PWA相談・公開判断まで辿るための地図です。各作品の最新状態や PWA の最新版を自動追跡するものではありません。個々の正本・コード・日付・検証記録を確認し、変更時はこの地図も見直してください。

**先に読む必須資料**：[`AGENTS.md`](../AGENTS.md)、[コンセプト・制作方式](trk-re-modern-concept.md)、[制作・調査・公開ガイドライン](trk-re-modern-guidelines.md)、[紹介書式](trk-re-modern-introduction-template.md)。この地図はそれらの代わりや新しい許可・公開基準ではありません。食い違いがあれば最新の合意・正本・対象コードを照合し、過去の研究記録を現在の仕様として扱わないでください。

## 1. 現在地と状態の読み分け

| 対象 | 現在の扱い | 根拠・注意 |
|---|---|---|
| カテゴリー | 色・形だけでなく、概念を色・文字・余白・動き・操作を通して体験にする作品集 | [コンセプト](trk-re-modern-concept.md)。美学／機能／実験は併用可能で序列ではない。 |
| 正式台帳 | [`catalog/re-modern/index.json`](../catalog/re-modern/index.json) の `ids` は空、正式作品0件 | 構造ゲートは事実・権利・人によるレビューを証明しない。 |
| ピクセル・コンソール | 依頼者が**作品案を承認**。正式登録・公開・配布は未了 | [作品データ](../drafts/re-modern/pixel-console/skin.json)、[作品説明](../drafts/re-modern/pixel-console/README.md)。実際の制作データの本文・タイトルは `system-ui, sans-serif`。 |
| 書体 | DotGothic16＋NeoDunggeunmo と Galmuri11 が多言語の**主な比較基準**。Press Start 2P は英字の**サブ基準** | [比較と根拠](re-modern-research/24-pixel-console-candidate-trail-2026-11-07.md)、[英字・日本語](re-modern-research/26-latin-japanese-font-candidates-2026-11-07.md)。候補の肯定は正式採用・利用権判断・自動適用の承認ではない。 |
| PWA連携 | [相談書28](re-modern-research/28-pwa-consultation-handoff-2026-11-07.md)・[trk315一括回答31](re-modern-research/31-pwa-trk315-consolidated-response-2026-11-07.md)を整理し、依頼者から PWA 側に渡したと報告あり | 31 の分析対象は PWA PR #107 の固定 head `e4c5427c...`。その後 PR は更新されており、その新しい head の内容・結果はこの地図では未レビュー。PWA側の決定・マージ・機能の現状は対象 PR／main を都度確認する。 |
| 研究・試作 | 限定条件での見本・状態モデル・試験パック | 研究用成果物は正式作品や PWA の製品機能ではない。見本や自動テストの成功は実機・言語話者・支援技術・法務の承認を代替しない。 |

**歴史資料の注意**：[残りの手順19](re-modern-research/19-remaining-roadmap-2026-11-07.md) は作成時点の作業計画で、末尾の「PWA未送信」などはその後の受け渡しより古い記述です。経緯として残し、現在地は本表と後続の28・31で確認します。

## 2. 開発に使う概念の一覧

| 概念 | 実務上の意味・判断 | 深掘り |
|---|---|---|
| 作品・意図・トレードオフ | 概念から対象場面と優先点を決め、色・文字・余白・動き・操作に結びつける。元作品の ID・内容は無断変更しない。 | [コンセプト](trk-re-modern-concept.md)、[研究01–02](re-modern-research/01-pixel-console.md)／[02](re-modern-research/02-pixel-console-direction.md) |
| 美学／機能／実験 | 作品ごとに組み合わせ、読みやすさ・実験性などの代償も説明する。危険な演出、権利不明素材、解除不能を容認するものではない。 | [ガイドライン §1・5](trk-re-modern-guidelines.md) |
| 作品の表と裏 | 一覧は短い概念・状態、詳細の読み物は由来・選定理由・出典・限界。制作メモと公開向け文章は別。裏面の UI は未決。 | [紹介書式](trk-re-modern-introduction-template.md)、[表裏の草案29](re-modern-research/29-pixel-console-reader-front-back-2026-11-07.md)、[初期草案05](re-modern-research/05-concept-reverse-pixel-console-draft.md) |
| 領域と設定の保護 | 共通 UI・書斎・基地・ゲームは目的や既存設定が異なる。提案された領域別機能と PWA の実装済み機能を分け、利用者の本文・ノーツ等を勝手に変更しない。 | [領域03](re-modern-research/03-catalog-and-spaces.md)、[対象と依存20](re-modern-research/20-font-scope-dependencies-2026-11-07.md) |
| 基本表示／書体拡張 | 現在の system 系制作データ、作品に必要な基本書体、利用者が導入する任意拡張、比較候補は別々。作品ファイルにフォントが入るとは限らない。導入・選択・適用・解除・削除を区別する。 | [ガイドライン §4](trk-re-modern-guidelines.md)、[配布14](re-modern-research/14-font-distribution-and-user-choice-2026-11-07.md)、[棚16](re-modern-research/16-font-pack-settings-shelf-design-2026-11-07.md) |
| 書体の fallback | stack は原則として文字単位で代替され、複数字体を持つ言語の字形が意図どおり選ばれる保証はない。cmap、ロード、結合表示、読みやすさは別々の根拠。 | [字形23](re-modern-research/23-multilingual-font-review-study-2026-11-07.md)、[候補24](re-modern-research/24-pixel-console-candidate-trail-2026-11-07.md) |
| 状態と復帰 | 現状維持・保存だけ・選択・適用・解除・削除・失敗を分け、ユーザーの明示的な操作と既存設定を尊重する。競合／複数タブも設計する。 | [状態モデル21](re-modern-research/21-font-state-and-recovery-study-2026-11-07.md)、[PWAへの回答31](re-modern-research/31-pwa-trk315-consolidated-response-2026-11-07.md) |
| 権利・出典 | 書体、画像、作品、コードを個別に扱う。版、作者、取得元、hash、全文、RFN、改変・配布・画像公開条件を確認。資料を読めることと再配布許諾は別。 | [権利22](re-modern-research/22-font-rights-distribution-study-2026-11-07.md)、[SolidLinker等27](re-modern-research/27-japanese-solidlinker-font-trail-2026-11-07.md) |
| 色・透明・動き | 合成後の背景・変化、色以外の状態、強制色、文字拡大、停止・軽減を検討。単一色の比率や警告だけで安全とみなさない。 | [ガイドライン §5](trk-re-modern-guidelines.md)、[表現提案04](re-modern-research/04-gradient-and-creative-variants-proposal.md)、[PWA境界08](re-modern-research/08-trk314-boundaries-and-screen-2026-11-07.md) |
| 創作の自由と権限 | PWAの現状に発想を限定しないが、追加通信・権限・別環境・拡張は利用者の選択と別途合意・安全検討を要する。 | [権限と自由06](re-modern-research/06-creative-freedom-and-capabilities.md)、[ガイドライン §3](trk-re-modern-guidelines.md) |
| 台帳・公開ゲート | 新 ID／カテゴリ・台帳・記録・公開ページ・検索・権利・人のレビューを揃える。登録と公開・配布はそれぞれ判断する。 | [ガイドライン §7–8](trk-re-modern-guidelines.md)、[共通書式](trk-re-modern-introduction-template.md) |

## 3. 典型的な作業順序

1. **理解と問い**：必須3文書と `AGENTS.md` を読み、作品の概念、対象領域、優先事項、ユーザー設定、やらないことを記録する。
2. **出典と素材**：一次資料・版・確認日・ライセンス・ファイル・hash を控え、仮説と事実を分離する。権利不明の素材を配布しない。
3. **見本と実現方法**：制作メモと紹介草案を分け、既存 PWA の現行機能と提案を分ける。追加機能や作品連携は PWA 側と合意・別実装が必要。
4. **検証**：静的検査→対象の自動試験→固定環境のブラウザ→実機・言語話者・支援技術・独立レビュー。成功、失敗、未実施、対象版と方法を記録する。
5. **登録・公開判断**：台帳・正本・記録・紹介・出典・権利・検証を揃え、別途承認を得る。研究成果の merge や相談ファイルの共有を、作品の公開決定に読み替えない。

## 4. ツール一覧（Avatar側）

原則リポジトリルートで実行。生成物は多くが Git 管理外 `dist/` や一時フォルダに出る**実験用**です。固定 PWA checkout・バイナリ・ライセンスの指定や `--out` の上書き挙動はリンク先を確認し、既存の作業コピー・公開先を出力先に使わないでください。自動取得しないツールが多く、書体取得・再配布は別判断です。

| 道具 | 用途・入力と結果 | 詳細 |
|---|---|---|
| `npm run check:re-modern`／[`check-re-modern.mjs`](../tools/check-re-modern.mjs) | 予約 ID／タグと台帳・必須記録・ページの構造ゲート | [ガイド §8](trk-re-modern-guidelines.md) |
| [`research-re-modern-pixel.mjs`](../tools/research-re-modern-pixel.mjs) | `TRK_PWA` で固定 PWA を指定し、仮目録・インポート・対比を一時検討。公開物は変更しない | [研究01](re-modern-research/01-pixel-console.md) |
| [`preview-re-modern-pixel.mjs`](../tools/preview-re-modern-pixel.mjs) | 固定 PWA の一時コピーを `TRK_PWA` と `PORT` で配信し作品案を試す。ブラウザ側の保存が残り得る | [開始ガイド A](re-modern-pixel-console-start-guide.md) |
| [`build-re-modern-draft.mjs`](../tools/build-re-modern-draft.mjs) | PWA `4b462414...` で**旧世代の共通題字色のみ**の検証 ZIP を生成 | [開始ガイド B](re-modern-pixel-console-start-guide.md) |
| [`build-re-modern-pwa-handoff.mjs`](../tools/build-re-modern-pwa-handoff.mjs) | PWA `4f93a69f...` で相談用 `pixel-console-consultation.stpack` を再現。共通題字色のみ、書体なし | [相談書28](re-modern-research/28-pwa-consultation-handoff-2026-11-07.md)、[ブラウザ環境](browser-test-environment-2026-11-07.md) |
| [`prepare-re-modern-font-study.mjs`](../tools/prepare-re-modern-font-study.mjs) | 既存 Dot パックから限定見本、任意で固定 Neo を追加。出力は研究用 | [研究12](re-modern-research/12-font-included-isolated-study-2026-11-07.md)、[15](re-modern-research/15-korean-font-fallback-study-2026-11-07.md) |
| [`build-re-modern-font-pack-study.mjs`](../tools/build-re-modern-font-pack-study.mjs) | `--trk` と `--neo-dir` から二書体の**書体だけ**の隔離 pack を作る。正式配布用ではない | [研究17](re-modern-research/17-isolated-font-pack-candidate-2026-11-07.md) |
| [`prepare-re-modern-license-study.mjs`](../tools/prepare-re-modern-license-study.mjs) | 二書体の個別ライセンス表示見本を作成 | [研究22](re-modern-research/22-font-rights-distribution-study-2026-11-07.md) |
| [`prepare-re-modern-multilingual-study.mjs`](../tools/prepare-re-modern-multilingual-study.mjs) | 二書体と4言語・文字例の隔離比較 | [研究23](re-modern-research/23-multilingual-font-review-study-2026-11-07.md) |
| [`prepare-re-modern-candidate-comparison.mjs`](../tools/prepare-re-modern-candidate-comparison.mjs) | Dot＋Neo と Galmuri の比較見本。固定 PWA・Neo・Galmuri が必要 | [研究24](re-modern-research/24-pixel-console-candidate-trail-2026-11-07.md) |
| [`prepare-re-modern-latin-study.mjs`](../tools/prepare-re-modern-latin-study.mjs) | 上記に Press、JetBrains Mono、Fira Code の固定ファイルを加え英字比較 | [研究26](re-modern-research/26-latin-japanese-font-candidates-2026-11-07.md) |
| [`prepare-re-modern-solidlinker-study.mjs`](../tools/prepare-re-modern-solidlinker-study.mjs) | 上記比較に作者指定の SolidLinker TTF・作者ページを追加。対象版は独自ライセンス | [研究27](re-modern-research/27-japanese-solidlinker-font-trail-2026-11-07.md) |
| [`tools/lib/re-modern-research-catalog.mjs`](../tools/lib/re-modern-research-catalog.mjs) | 一時目録を研究用に構成する共通ライブラリ。単独の利用者向け公開ツールではない | [研究01](re-modern-research/01-pixel-console.md) |

代表的なコマンド（入力準備は各リンク先を参照、**異なる固定版を流用しない**）：

```sh
npm ci
npm run check:re-modern
npm run check
npm test
# 相談用の題字色だけの実験。TRK_PWA は clean な固定 4f93a69f... checkout。
TRK_PWA=/path/to/fixed-pwa node tools/build-re-modern-pwa-handoff.mjs
TRK_PWA=/path/to/fixed-pwa node tests/re-modern-pwa-handoff.test.mjs
```

ブラウザや NSS 等の準備、実際に使用する Chromium バージョンの確認、専用 profile は[ブラウザ試験環境](browser-test-environment-2026-11-07.md)。`/path/to/...` は説明用で、実際のパスを指定します。`--out` の指定先はツールごとに上書きされ得ます。`dist/`、`node_modules/`、一時クローンは永続の正本や配布物ではありません。

## 5. 試験の選び方

| 種別 | 主なファイル・入力 | 確認範囲 |
|---|---|---|
| 通常ゲート | `npm run check`、`npm test`、[`re-modern-policy.test.mjs`](../tests/re-modern-policy.test.mjs)、[`re-modern-pixel-draft.test.mjs`](../tests/re-modern-pixel-draft.test.mjs)、[`re-modern-font-state-study.test.mjs`](../tests/re-modern-font-state-study.test.mjs) | 正本・記録・制作案・純粋状態モデル等。`npm test` の範囲は [`package.json`](../package.json) が正本。 |
| 静止見本・カタログ | [`re-modern-pixel-preview.test.mjs`](../tests/re-modern-pixel-preview.test.mjs)、[`re-modern-catalog-prototype.test.mjs`](../tests/re-modern-catalog-prototype.test.mjs) | 個別実行する Chromium 試験。実 PWA や人による確認ではない。 |
| PWA・色 | [`re-modern-pixel-production-browser.test.mjs`](../tests/re-modern-pixel-production-browser.test.mjs)、[`re-modern-pixel-pwa-browser.test.mjs`](../tests/re-modern-pixel-pwa-browser.test.mjs)、[`re-modern-work-m3.test.mjs`](../tests/re-modern-work-m3.test.mjs)、[`re-modern-pwa-handoff.test.mjs`](../tests/re-modern-pwa-handoff.test.mjs) | 各スクリプト固定の `TRK_PWA` とブラウザが必要。固定版・対象画面は同一ではない。[開始ガイド](re-modern-pixel-console-start-guide.md)・[相談書28](re-modern-research/28-pwa-consultation-handoff-2026-11-07.md)。 |
| PWA版ごとの回帰 | [`re-modern-work-trk309.test.mjs`](../tests/re-modern-work-trk309.test.mjs)・[trk310](../tests/re-modern-work-trk310.test.mjs)・[trk311](../tests/re-modern-work-trk311.test.mjs)、[`re-modern-trk314-*.test.mjs`](../tests/) | 個別スクリプトの固定 commit・`TRK_PWA`／`TRK_PWA_M3` を確認。過去の不具合特性試験は「今も問題がある」証明ではない。 |
| 書体・権利・見本 | [`re-modern-font-study.test.mjs`](../tests/re-modern-font-study.test.mjs)、[韓国語](../tests/re-modern-korean-font-study.test.mjs)、[pack](../tests/re-modern-font-pack-study.test.mjs)、[契約](../tests/re-modern-font-contract.test.mjs)、[題字限定](../tests/re-modern-scoped-font-study.test.mjs)、[ライセンス](../tests/re-modern-license-study.test.mjs)／[browser](../tests/re-modern-license-study-browser.test.mjs)、[多言語](../tests/re-modern-multilingual-study.test.mjs)、[候補比較](../tests/re-modern-candidate-comparison.test.mjs)、[英字](../tests/re-modern-latin-study.test.mjs)、[SolidLinker](../tests/re-modern-solidlinker-study.test.mjs) | 個別実行。固定 PWA と `TRK_NEO_DIR` 等の指定、必要なファイル・ブラウザは各研究を参照。PWA実装や権利判断ではない。 |
| trk315 固定版の特性 | [`re-modern-trk315-review.test.mjs`](../tests/re-modern-trk315-review.test.mjs) | `TRK_PWA_315` の固定 `title-font.js` を hash 検査。合成ファイル・模擬 IndexedDB／FontFace の 5 ケース。変数なしでは skip、最新PRや実ブラウザの試験ではない。[回答31](re-modern-research/31-pwa-trk315-consolidated-response-2026-11-07.md)。 |

**一括で `tests/re-modern-*.test.mjs` を実行しない**：固定 commit や素材が異なる試験が混在します。使う試験を選び、対象版・必要な入力・副作用・期待値を各ファイルと研究記録で確認してください。`npm test` は全研究試験を自動で実行しません。

## 6. 研究資料と成果物の場所

| 領域 | 資料 |
|---|---|
| 出発点・方向 | [01 第1案](re-modern-research/01-pixel-console.md)、[02 方向見本](re-modern-research/02-pixel-console-direction.md)、[03 カタログ・書斎・基地](re-modern-research/03-catalog-and-spaces.md)、[04 グラデーション・表現](re-modern-research/04-gradient-and-creative-variants-proposal.md)、[05 読み物草案](re-modern-research/05-concept-reverse-pixel-console-draft.md)、[06 創作と拡張](re-modern-research/06-creative-freedom-and-capabilities.md) |
| 計画・PWA境界 | [07 作業棚卸し](re-modern-research/07-avatar-work-inventory-2026-11-07.md)、[08 trk314 境界](re-modern-research/08-trk314-boundaries-and-screen-2026-11-07.md)、[19 当時の計画](re-modern-research/19-remaining-roadmap-2026-11-07.md)、[28 相談書](re-modern-research/28-pwa-consultation-handoff-2026-11-07.md)、[31 trk315回答](re-modern-research/31-pwa-trk315-consolidated-response-2026-11-07.md) |
| 紹介・制作記録 | [09 旧紹介草案](re-modern-research/09-pixel-console-reader-draft.md)、[10 開発メモ](re-modern-research/10-pixel-console-development-notes.md)、[25 候補資料束](re-modern-research/25-pixel-console-candidate-brief-2026-11-07.md)、[29 表裏草案](re-modern-research/29-pixel-console-reader-front-back-2026-11-07.md)、[30 受け渡し目次](re-modern-research/30-pixel-console-delivery-index-2026-11-07.md) |
| 書体・利用者選択 | [11 Dot棚卸し](re-modern-research/11-dotgothic-distribution-inventory-2026-11-07.md)、[12 同梱研究](re-modern-research/12-font-included-isolated-study-2026-11-07.md)、[13 検証 pack の由来](re-modern-research/13-pixel-console-test-pack-provenance-2026-11-07.md)、[14 配布・選択](re-modern-research/14-font-distribution-and-user-choice-2026-11-07.md)、[15 韓国語 fallback](re-modern-research/15-korean-font-fallback-study-2026-11-07.md)、[16 棚案](re-modern-research/16-font-pack-settings-shelf-design-2026-11-07.md)、[17 隔離 pack](re-modern-research/17-isolated-font-pack-candidate-2026-11-07.md)、[18 題字限定試作](re-modern-research/18-scoped-font-prototype-2026-11-07.md) |
| 書体・設計と比較 | [20 対象と依存](re-modern-research/20-font-scope-dependencies-2026-11-07.md)、[21 状態・復帰](re-modern-research/21-font-state-and-recovery-study-2026-11-07.md)、[22 権利](re-modern-research/22-font-rights-distribution-study-2026-11-07.md)、[23 多言語](re-modern-research/23-multilingual-font-review-study-2026-11-07.md)、[24 候補の道筋](re-modern-research/24-pixel-console-candidate-trail-2026-11-07.md)、[26 英字・日本語](re-modern-research/26-latin-japanese-font-candidates-2026-11-07.md)、[27 追加候補](re-modern-research/27-japanese-solidlinker-font-trail-2026-11-07.md) |
| 見本テンプレート | [`docs/re-modern-research/pixel-console-preview/`](re-modern-research/pixel-console-preview/)、`pixel-console-*-study/` の各ディレクトリ。入力や生成が必要な見本を完成配布物としない。 |
| 正本・作業案 | [`catalog/re-modern/index.json`](../catalog/re-modern/index.json)、[`drafts/re-modern/pixel-console/`](../drafts/re-modern/pixel-console/)。将来の正式記録と公開ページの置き場は[ガイド §8](trk-re-modern-guidelines.md)。 |

## 7. 次に進む際の確認

- PWA 側の**現在の**PR／main・合意を調べ、固定版の証拠と区別する。全体題字設定と、作品限定の拡張を混同しない。
- 言語話者・実機・支援技術・人の字形評価、権利・配布と実ストレージ／競合の扱いは未完。PWA 側の作業状況を未確認のまま「完了」としない。
- 新作品はこの地図から方向・出典・見本・検証を選ぶ。ピクセル・コンソール専用のファイルや hash を、無関係な作品の必須構成として扱わない。
- 文書・スクリプト・版が変わったら、一覧・例・リンク・状態を更新し、手元で実行した範囲と未確認を記録する。
