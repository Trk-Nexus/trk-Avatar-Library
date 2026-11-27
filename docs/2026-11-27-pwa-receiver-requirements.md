# trk-PWA 受け子（受け口）要項・連携仕様書（trk328 照合・実装確認済）

- **作成・更新日**: 2026-11-27
- **照合基準 `trk-PWA`**: `trk328`（commit `d5de0656278e66e7ed7adb9be0147b2323e628ee`・初回策定時基準 `trk325` = `e30eb2ce98490c94b7768dd2ddf768fab7fe726d`）
- **対応する実装（当倉庫側）**:
  - データ契約・変換・検査モジュール: [`js/pwa-bridge.js`](../js/pwa-bridge.js)
  - 統合マニフェスト生成・検査: [`tools/build-library-manifest.mjs`](../tools/build-library-manifest.mjs) ／ [`catalog/library-manifest.json`](../catalog/library-manifest.json)
  - 稼働契約＆受け子プローブCLI: [`tools/check-pwa-receivers.mjs`](../tools/check-pwa-receivers.mjs)
  - 契約・回帰テスト: [`tests/pwa-bridge-and-receivers.test.mjs`](../tests/pwa-bridge-and-receivers.test.mjs)
  - 統合ライブラリUI（ブラウザ内検査・変換つき）: [`library.html`](../library.html)

---

## 1. 目的と基本原則

本書は、`trk-Avatar-Library`（配る・選ぶ・検査する側）と `trk-PWA`（受け取って表示・保存する側）の間で、**基盤受け口 7 系統（`C-*`）** と **`trk326`〜`trk328` で実装・照合完了した 7 項目の「受け子（受け口）」要項（`R-*`）** を体系的に整理した仕様書です。

すべての要望は、`trk-PWA` と当倉庫が共有する以下の安全原則を前提とします（合意なき仕様変更や自動適用は行いません）。

1. **完全オフライン優先・外部自動通信ゼロ**: URL の自動取得やテレメトリ送信は行わず、利用者が明示的に選んだローカルファイル（`.stpack` / `.stlib` / `.json` / `.woff2`）のみを読み込む。
2. **データのみ受け入れ（コード実行なし）**: 受け渡す対象は純粋な構造化データと静的素材（WOFF2・ライセンス文書）に限定し、任意の JavaScript や生 CSS 文字列の注入は拒否する。
3. **利用者の既存設定の保護**: パックや作品を導入しただけで、利用者が設定済みの本文書体・読書テーマ・ノーツ視認性・全体題字設定を無断で上書きしない。必ず 1 操作で元の状態へ戻せる離脱経路を保つ。
4. **機械検査と人間レビューの区別**: スキーマ合格やコントラスト警告（holdback）を「視覚品質の保証」と混同しない（[`AGENTS.md`](../AGENTS.md) および [`docs/trk-re-modern-guidelines.md`](trk-re-modern-guidelines.md) 準拠）。

### 3Dアバター（VRM / VRMA / MMD）に関するスコープ方針

- **方針**: **「3Dアバターの要素は、利用者の要望が求められてから着手判断を行う」** こととし、現マイルストーンでは実装対象外としています。
- **現状の扱い**:
  - `trk-PWA` 本体側には `.stpack` の `mascot`（VRM / VRMA）および別経路の MMD（IndexedDB）機構が存在しますが、当倉庫側では 3D モデル・モーションの同梱や目録拡張は行いません。
  - 将来要望が生じた際に破壊的変更なしで拡張できるよう、[`catalog/library-manifest.json`](../catalog/library-manifest.json) に `futureSlots.mascot`（`status: "deferred-until-requested"`, `count: 0`）の予約枠のみを設けています。`trk-PWA` 側では未知の `futureSlots` を無視して読み飛ばすだけで安全に共存できます。

---

## 2. 現行 `trk-PWA`（`trk328`）で稼働済みの基盤受け口（7系統）

`tools/check-pwa-receivers.mjs --trk=/path/to/trk-PWA` により、以下の 7 系統が `trk328`（`d5de0656278e66e7ed7adb9be0147b2323e628ee`）で正常に稼働・一致していることを確認済みです。

| 契約ID | 対象 | `trk-PWA` 側モジュール | 形式 / 状態 |
| --- | --- | --- | --- |
| `C-PACK-CATALOG` | パック目録（30本） | `js/pack-catalog.js` | `trk-avatar-library` v1（`licenseFile`, `note`, `cmap`, `weight`, `tags`, `setPending` 読取済み） |
| `C-SET-INSTALL` | まとめセット（r10 2種） | `js/custom.js`, `tools/check-set.mjs` | `.stlib` / `.zip` の SHA-256 照合・重複スキップ・`--json` 契約 v2 |
| `C-SKIN-BUILDTIME` | スキン全291種・13巻（ビルド時） | `tools/import-skin-catalog.mjs`, `js/skins-volumes.js` | `trk274` / `trk293` で `house-edge` の `readability: "intentional-low"` 理由まで保持。差し戻しは既知3種に縮小 |
| `C-CUSTOM-SKIN` | 単体カスタムスキン（最大20件） | `js/custom.js`, `js/data.js` | `skin.shadow-taiko` v1（6色＋グラデ方向＋`cat`＋`cli` 対応）。当倉庫の統合ライブラリUIから全291種をこの形式へ変換書き出し可能 |
| `C-TYPOGRAPHY-SYNC` | 書体の組み合わせ（14組・6役） | `tools/sync-typography-catalog.mjs`, `js/typography.js`, `js/ui-prefs.js` | `catalog/typography.json` と SHA-256 一致。`trk255` で曲・スキン相性（`trkUse`）の画面表示も稼働済み |
| `C-REMODERN-PACK` | `trk-re-modern` 作品 `.stpack` ＆登録簿 | `js/remodern-work.js`, `js/remodern-registry.js` | 256 KiB 上限・14色・領域指定・`LICENSE`/`README`（`.txt`/`.md`）限定・`trk-re-modern-registry` v1 照合 |
| `C-TITLE-FONT-BASE` | 題字書体3候補の導入・退避・4言語文言 | `js/title-font.js`, `js/i18n.js` | `galmuri` / `dotneo` / `press` の固定 SHA-256 照合、Web Locks 直列化、`trk-title-font-works-backup` v1 退避出力、`zh`/`ko` 文言まで実装済み |

---

## 3. `trk-PWA` 側「受け子」要項と実装照合状況（7項目・`trk326`〜`trk328` で 7/7 実装済）

優先度順（高 2 件・中 4 件・低 1 件）に、背景・受け入れデータ仕様・UI導線・安全境界、および `trk328`（`d5de0656278e66e7ed7adb9be0147b2323e628ee`）時点の実装状態を記します。

| 受け子 | 状態（`trk328` 照合） | 根拠・主な実装箇所 |
| --- | --- | --- |
| `R-VOL-1`（巻別スキンの取り込み） | `implemented` | `trk326`（`js/library-receiver.js`・`js/custom.js` の「📚 取り込んだ巻」・`js/core.js`） |
| `R-REM-1`（作品ごとの題字書体接続） | `implemented` | `trk326`（`js/title-font.js` `applyForWork`・`js/remodern-ui.js` `fontForWork`） |
| `R-REM-2`（題字退避封筒の復元） | `implemented` | `trk326`（`js/title-font.js` `restoreWorks` / `importWorksBackup`） |
| `R-REM-3`（書斎・基地の独立オプトイン） | `implemented` | `trk326`（`js/remodern-regions.js` `defaultOptIn`・`js/remodern-ui.js` `regionOptIn`） |
| `R-TYP-1`（組見本単体 JSON と不足パック案内） | `implemented` | `trk326`（`js/typography.js` `pairingFromJson` / `missingPacks`・`js/ui-prefs.js`） |
| `R-SKIN-1`（差し戻しの単一定義・旧配色切替） | `implemented` ＋ **生成物とのずれを修正** | `trk326`（`tools/skin-holdback.mjs`・`settings.skinLegacy`）＋ **`trk328` M1（出力ファイルに存在する ID のみを `SKIN_HOLDBACK` に出力する修正）** |
| `R-WIZ-1`（Advance Wizard 設定・統合マニフェスト） | `implemented` | `trk326`（`js/cli.js` `importAdvancePrefs`・`js/pack-catalog.js` `readLibraryManifest`） |

---

### 【要項 R-VOL-1】（優先度：高）巻別・単体スキン JSON（`trk-avatar-library-skins` v1）の画面インポート受け子

- **背景と課題**:
  - 現在、`skin-volumes/<vol>/skins.json` および `skin-volumes/<vol>/items/<id>.json`（14色・4言語・`shapes`・`type`・`cli`・`readability` を持つ無損失の元データ）は、`trk-PWA` の開発用CLI（`tools/import-skin-catalog.mjs`）でのみ読めます。
  - 利用者が画面から読み込めるカスタムスキン枠（`skin.shadow-taiko` v1）は 6色への要約＋最大20件制限があるため、新しい巻や単体14色スキンをそのまま試せる画面受け口が必要です（先行相談: [`docs/2026-11-03-trk-pwa-スキン巻別受け入れの相談.md`](2026-11-03-trk-pwa-スキン巻別受け入れの相談.md)）。
- **要望する受け口仕様**:
  - **対象モジュール**: `js/skins-volumes.js` / `js/custom.js`
  - **受け入れ形式**:
    1. 巻形式: `{ "format": "trk-avatar-library-skins", "version": 1, "count": N, "skins": [ ... ] }`
    2. 単体形式: `skin-volumes/<vol>/items/<id>.json`（1要素オブジェクト）も 1 件の巻要素として受け入れ可能にすると利便性が高い
  - **保存領域と棚の分離**:
    - 内蔵291種やカスタムスキン20件枠とは分離し、専用の保存領域（IndexedDB 推奨、上限例：1ファイル 1 MiB・合計 300 種まで）に保存し、スキンの棚では **「📚 取り込んだ巻」** として区別表示する。
  - **必須の安全境界**:
    - 14色の CSS 値は既存の `import-skin-catalog.mjs` / `data.js` と同等の許可パターン（`#hex`, `rgba(...)`, `linear-gradient(...)`）で検証し、不正値は拒否する。
    - `readability: "intentional-low"` を持つスキンは警告バッジと4言語の `readabilityReason` を落とさず表示する。
    - 同一 `id` が既に取り込み済みの場合は黙って上書きせず、「件数・新規数・重複ID」を事前表示して **「重複をスキップして追加」／「上書き更新」／「キャンセル」** を選ばせる。
- **当倉庫側の先行準備**:
  - `js/pwa-bridge.js` の `validateSkinVolumePayload()` / `validateSkinItem()` で全13巻・291種の検証を実装・テスト済み。
  - 受け子実装までのつなぎとして、統合ライブラリUI（[`library.html`](../library.html)）に全291種を `skin.shadow-taiko` v1 へ変換書き出しする機能を実装済み。

---

### 【要項 R-REM-1】（優先度：高・`trk326` 実装済）`trk-re-modern` 作品ごとの題字書体 UI と表示接続（`trkTitleFontWorks` 実接続）

- **背景と実装経緯**:
  - `trk315`〜`trk325` 時点の `js/title-font.js` では `WORKS_KEY = "trkTitleFontWorks"`（`{ [workId]: { font, on } }`）が保存保護・退避・削除のみの待機状態でしたが、`trk326` で `applyForWork` および `js/remodern-ui.js` の `fontForWork` により画面・表示接続が完了しました。
- **要望する受け口仕様**:
  - **対象モジュール**: `js/title-font.js` / `js/remodern-ui.js`
  - **UI導線**:
    - 導入済みの `trk-re-modern` 作品の設定欄に、題字書体候補（`使わない` / `galmuri` / `dotneo` / `press`）の選択と、作品連携オン/オフ（`setWorkFont` / `setWorkLink`）の操作欄を設ける。
    - 候補ファイルが未導入の場合は、自動で有効化せず「設定 → 題字の書体」への案内のみを表示する。
  - **適用優先順位（厳守）**:
    1. 利用者が全体の題字書体（`trkTitleFont`）を明示選択している場合は、**常に全体設定を優先**する（全体設定のファイルが欠損・エラー中であっても、黙って作品側の書体へ乗り換えない——現行 `fontForWork()` の設計を維持）。
    2. 全体設定が空（未選択）であり、かつ現在選択中の作品の `on === true` かつ必要 WOFF2 がすべて検証・ロードできた場合のみ、題字（`.brand h1` 等）へ適用する。
    3. 別スキンへ切り替えた際、または連携をオフにした際は即座に CSS 変数とクラスを解除し元の表示へ戻す。

---

### 【要項 R-REM-2】（優先度：中）題字書体・作品指定の退避封筒（`trk-title-font-works-backup` v1）の復元受け子

- **背景と課題**:
  - `trk322` で `backupWorks()` による退避封筒 JSON の書き出しと `removeWorksSettings()` による設定削除が実装されましたが、書き出した退避封筒を読み戻す **復元（インポート）受け口** がまだありません。
- **要望する受け口仕様**:
  - **対象モジュール**: `js/title-font.js`
  - **受け入れスキーマ**:
    ```json
    {
      "format": "trk-title-font-works-backup",
      "version": 1,
      "state": "ok",
      "raw": "{\"trk-re-modern-pixel-console\":{\"font\":\"galmuri\",\"on\":true}}"
    }
    ```
  - **必須の安全境界**:
    - `format === "trk-title-font-works-backup"` かつ `version === 1` 以外は拒否。サイズ上限（例：256 KiB）を設ける。
    - **`state === "invalid"` の扱い**: `backupWorks()` は壊れた保存値を削除する前に緊急退避できるよう `state: "invalid"` でも書き出せる仕様になっている。そのため、復元受け口では **`state === "invalid"` の封筒をそのまま localStorage へ書き戻してはならない**（壊れたデータの再注入防止）。「緊急退避用の壊れた生データのため自動復元できません」と明示して拒否する。
    - `__proto__` 等の危険キーはプロトタイプ汚染を起こさないよう `Object.keys` / `Object.defineProperty`（既存の `ownCopy` と同等）で扱う。
    - 既存の保存値がある場合は、復元前に件数差分を示して確認を取り、Web Locks（`LOCK_NAME = "trk-title-font"`）下で直列化して書き込む。
- **当倉庫側の先行準備**:
  - `js/pwa-bridge.js` の `validateTitleFontWorksEnvelope()` にて、`state: "ok"` / `"invalid"` の分離判定・プロトタイプ汚染防止・将来フィールド保持の契約テストを実装済み。

---

### 【要項 R-REM-3】（優先度：中）領域別スキン適用（書斎 `study`・基地 `base`）の独立オプトイン受け子

- **背景と課題**:
  - `js/remodern-regions.js` および作品 `.stpack` の `remodern.regions` には `common` / `stage` / `study` / `base` の概念がありますが、書斎（`trk312` の読書テーマ 30 種）や基地の配色を利用者の意図なく作品側が上書きすると可読性や操作感を損なう恐れがあります。
- **要望する受け口仕様**:
  - **対象モジュール**: `js/remodern-regions.js` / `js/remodern-ui.js`
  - **仕様**:
    - 作品が `regions` に `study` や `base` を含む場合でも、作品選択時の既定では共通/舞台（または安全な範囲）のみに留め、「書斎にも作品配色を適用する」「基地にも適用する」を利用者が領域ごとにオン/オフできる独立トグル（オプトイン受け口）を設ける。
    - オフにした領域は利用者が元々選んでいた読書テーマ・ノーツ設定をそのまま維持する。

---

### 【要項 R-TYP-1】（優先度：中）書体の組み合わせ単体 JSON（`trk-typography-pairing` v1）受け渡しと不足パック具体名案内

- **背景と課題**:
  - `trk246` / `trk254` / `trk255` により、14組のビルド時同期と曲・スキン相性（`trkUse`）表示は既に稼働しています。
  - 一方、(1) 当倉庫の統合ライブラリUIや `gallery/pairings.html` で調整・書き出した単体の組み合わせ JSON を PWA 側へ読み込む受け口と、(2) 組を選んだ際に未導入の書体があるとき「どの `.stpack`（例：`kaisei-decol.stpack`）を入れればよいか」を具体的に示す案内があると、パック導入導線が一気につながります。
- **要望する受け口仕様**:
  - **対象モジュール**: `js/typography.js` / `js/ui-prefs.js`
  - **受け入れスキーマ（`trk-typography-pairing` v1）**:
    ```json
    {
      "format": "trk-typography-pairing",
      "version": 1,
      "id": "shinbun",
      "name": "新聞の顔",
      "scale": "1.25",
      "trkUse": "オーソドックスな和風曲・演歌・バラード",
      "requiredPacks": ["font-packs/noto-sans-jp.stpack", "font-packs/noto-serif-jp.stpack"],
      "slots": {
        "display": { "pack": "font-packs/noto-serif-jp.stpack", "family": "TrkNotoSerifJP", "weight": 700 },
        "heading": { "pack": "font-packs/noto-serif-jp.stpack", "family": "TrkNotoSerifJP", "weight": 700 },
        "body": { "pack": "font-packs/noto-sans-jp.stpack", "family": "TrkNotoSansJP", "weight": 400 },
        "caption": { "pack": "font-packs/noto-sans-jp.stpack", "family": "TrkNotoSansJP", "weight": 400 },
        "numeral": { "pack": "font-packs/noto-sans-jp.stpack", "family": "TrkNotoSansJP", "weight": 500 },
        "accent": { "pack": "font-packs/noto-serif-jp.stpack", "family": "TrkNotoSerifJP", "weight": 700 }
      },
      "tracking": { "display": 0, "heading": 0.02, "body": 0.02, "caption": 0.06 },
      "leading": { "display": 1.1, "heading": 1.35, "body": 1.8, "caption": 1.5 }
    }
    ```
  - **不足パックの具体名表示**: `T.available(saved) === false` の際、`p.packs` のうちまだ導入されていない `.stpack` 名を `typoState` 欄に列挙する（自動ダウンロードは行わない）。

---

### 【要項 R-SKIN-1】（優先度：中）保留2種（`gold-chip` / `orichalcum`）・重複19種の旧配色切替（`legacy`）と `SKIN_HOLDBACK` 単一定義化

- **背景と課題**:
  - `trk293` により差し戻しは 11種 → **3種（`gold-chip`, `orichalcum`, `house-edge`）** まで減少しました（[`tests/pwa-holdback-baseline.json`](../tests/pwa-holdback-baseline.json) 更新済み）。
  - 残る `gold-chip` / `orichalcum`（[`catalog/skin-revisions/2026-11-06-gold-pending-proposal.json`](../catalog/skin-revisions/2026-11-06-gold-pending-proposal.json)）および重複配色 19種（[`catalog/skin-revisions/2026-11-06-duplicate-palette-proposals.json`](../catalog/skin-revisions/2026-11-06-duplicate-palette-proposals.json)）を正本へ反映するには、従来の見た目を好む利用者向けの旧配色保持（`legacyColors` 等）の受け口合意が必要です（先行議論: [`docs/2026-11-06-trk291-review-followup.md`](2026-11-06-trk291-review-followup.md)）。
- **要望する受け口仕様**:
  - **対象モジュール**: `tools/import-skin-catalog.mjs` / `tools/check-skin-contrast.mjs` / スキン設定UI
  - `legacyColors`（任意フィールド）を持つスキンについて、既定はコントラスト適合後の新配色としつつ、利用者が「旧配色を使う」トグルで従来の色へ戻せる受け口を用意する。
  - 併せて、`import-skin-catalog.mjs` と `check-skin-contrast.mjs` に分かれている既知保留リスト（`SKIN_HOLDBACK`）を単一定義へ集約し、意図的低可読（`house-edge`）と調整待ち保留（`gold-chip`, `orichalcum`）を区別して出力する。

---

### 【要項 R-WIZ-1】（優先度：低）Advance Wizard 設定受け渡し・統合マニフェスト（`trk-avatar-library-manifest` v1）参照受け子

- **背景と課題**:
  - 当倉庫のターミナル画面（[`index.html`](../index.html)）で育てたウィザード辞書や Advance Wizard 10項目の設定を、将来的に `trk-PWA` 側の CLI モードでも任意で読み込めるようにする拡張受け口と、倉庫全体の収録件数・各目録ハッシュを1ファイルで確認できる統合マニフェスト（[`catalog/library-manifest.json`](../catalog/library-manifest.json)）の参照対応です。
- **要望する受け口仕様**:
  - **対象モジュール**: `js/cli.js` / `js/pack-catalog.js`
  - `trk-avatar-library-advance-prefs` v1 を読み込む際は、使用禁止文字（`` ` ``, `\`, `..`, `~`, `C:`）を含むキー・辞書語を厳格に拒否する。
  - `trk-avatar-library-manifest` v1 を参照する際は、未知の `futureSlots`（`mascot` 予約枠など）を読み飛ばしてエラーにしない前方互換設計とする。

---

## 4. 自動検証と受け入れ確認手順

当倉庫側には、上記 7 系統の稼働契約と 7 項目の要望受け子を自動検査する CLI を実装済みです。

```sh
# ローカル正本・統合マニフェスト・カスタムスキン変換（全291種）の検査
npm run check:pwa-receivers

# 実物の trk-PWA チェックアウトを突き合わせた稼働契約検査＋受け子実装プローブ
TRK_PWA=/path/to/trk-PWA npm run check:pwa-receivers

# JSON レポート出力（CI・自動連携用）
node tools/check-pwa-receivers.mjs --trk=/path/to/trk-PWA --json
```

`trk-PWA`（`trk328`：`d5de0656278e66e7ed7adb9be0147b2323e628ee`）に対して実行すると、稼働契約 7/7 合格かつ `receiverProbes` 全 7 件（`R-VOL-1`〜`R-WIZ-1`）が `"implemented"` と判定されます（`tests/pwa-bridge-and-receivers.test.mjs` でも回帰監視対象として固定済み）。なお、Node / 自動検査の合格は実ブラウザ・実機端末での操作確認を代替しません。

---

## 5. `trk-PWA` 側で次版以降に送られた改善余地（連携への影響なし）

`trk328` 安定化レビュー（`AVATAR-HANDOFF-TRK328-2026-11-27.md` §4）にて、データ形式や受け渡し契約に影響しない PWA 内部改善として以下の 2 点が記録されています。

1. **`js/library-receiver.js` の取り込み失敗メッセージ 20 件の多言語化**：画面見出し・ボタン類は 4 言語対応済みだが、JSON の不備を知らせる詳細文言が日本語固定のため、将来英語・韓国語・簡体字へ展開予定。
2. **「取り込んだ巻をすべて消す」（`clearImported()`）実行時のスキン復帰先**：取り込みスキン使用中に全削除すると既定テーマ（`classic`）へ戻る仕様であり、取り込み前に選んでいた内蔵スキンへの復帰は今後の UI 改善候補。

