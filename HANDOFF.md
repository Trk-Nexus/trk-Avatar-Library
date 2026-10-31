# trk-Avatar-Library 開発引き継ぎ

> **最終更新：2026-10-31**（土台＋書体パックの版）。アプリ側は **trk!（trk-PWA）trk230** を前提にしています。
> この倉庫は **配る側**（目録・見本・`.stpack` の置き場）で、**使う側**は trk-PWA です。
> 目録の形の**正本**は trk-PWA の [`docs/LIBRARY-TRK230-2026-10-31.md`](https://github.com/TonbokiriRaikiriMuramasa-Taikoubou/trk-PWA/blob/main/docs/LIBRARY-TRK230-2026-10-31.md) §3。
> 利用者向けの説明は [`README.md`](README.md)、権利は [`NOTICE.md`](NOTICE.md)。

## 0. この文書の使い方

| 節 | 内容 | いつ読むか |
| --- | --- | --- |
| §0.1 | 版の要約 | 経緯をざっと知りたいとき |
| §1 | 作業の基本 | 作業を始める前に |
| §1.5 | **この倉庫の今** | まずここ |
| §2 | 目録とパックの契約（アプリとの取り決め） | 目録・パックを触る前に |
| §3 | 変えてはいけないこと | 変更の前後 |
| §4 | **確かめていないこと（最重要）** | 配る前 |
| §5 | 主なファイル | 実装を探すとき |
| §6 | 直近の検証（自動検査で確かめたこと） | 検証を足すとき |
| §7 | 変更履歴（新しい順） | 経緯を追うとき |
| §8 | PR 前チェックリスト | PR を出す前 |
| §9 | 配布（Git・Release・Drive） | 配るとき |

### 0.1 版の要約

| 日付 | 中身（1行） |
| --- | --- |
| 2026-10-31 | **土台＋書体パック**：受け渡しZIPの中身（全スキン見本 53 種・目録・検査）を配置し、書体パックの実物（Zen Maru Gothic 400／700・OFL.txt）・目録の契約検査・決定的なパック組み立て・見本 HTML・CI を追加 |

受け渡しの経緯は [`docs/2026-10-31-受け渡しメモ.txt`](docs/2026-10-31-受け渡しメモ.txt)（元 `SETUP-このZIPの入れ方.txt`）。

## 1. 作業の基本

- 作業前に `git status --short` と差分を見て、既存の変更を破棄・上書きしない。
- Arena で指定された作業ブランチを維持し、`main` へ直接 push しない。反映は PR 経由。
- **ビルドはありません**。Node 18 以降だけで動きます（バンドラー・npm install 不要）。
- 道具は trk-PWA の **`js/zip-io.js`／`js/pack-catalog.js` をそのまま読みます**（写しを持たない）。
  場所は `--trk=/path/to/trk-PWA` → 環境変数 `TRK_PWA` → 既定 `../trk-PWA` の順で探します。
  隣に無いときは `git clone https://github.com/TonbokiriRaikiriMuramasa-Taikoubou/trk-PWA.git ../trk-PWA`（読み取りだけ）。
- 変更したら、最低でもこれを流します。

  ```sh
  node tools/selftest.mjs              # 道具が「ちゃんと断る」か（2026-10-31 時点で 14 / 14）
  node tools/build-catalog.mjs --check # 目録が今の中身と合っているか
  node tools/check-contract.mjs        # 目録がアプリの読み取り規則を通るか
  node tools/build-pack.mjs font-packs/maru-go --check --fetch  # 書体パックがフォルダと一致するか
  ```

- **時刻を混ぜない**：目録の `updatedAt` だけが時刻を持ちます。`build-catalog --check` は `packs` だけを比べるので、
  作り直しても `updatedAt` のせいで落ちることはありません。`.stpack` は**無圧縮で決定的**（同じフォルダ → 同じ sha256）。
- 実ブラウザ・実機で見たかどうかを、自動検査の成功と混同しない（§4）。

## 1.5 この倉庫の今（2026-10-31）

| 項目 | 今の状態 |
| --- | --- |
| 目的 | trk! の見た目（スキン・書体）を**手元に並べて、見て、選んで、持ち込む**ための倉庫。GPL-3.0-or-later |
| 配るもの | `catalog/index.json`（目録）と、`packs/`・`font-packs/` の `.stpack` |
| パック | **2 件**。`packs/sample-mincho.stpack`（見本・690 B）と `font-packs/maru-go.stpack`（書体パック・2,935,978 B・sha256 `93a4bb2d…`） |
| 書体パック | Zen Maru Gothic 400／700 の woff2・`fonts/OFL.txt`・`NOTICE.md`・桃色の夜のスキン。**trk230 でも普通のスキンパックとして入る**（色は使われ、書体だけまだ使われない） |
| 見本 | `gallery/all-skins.html` = 全スキン **53 種（書体 9 種）**・1 ファイル・外部参照 0・オフラインOK。`catalog/skins.json` がもとデータ |
| 道具 | `tools/` の 6 本（下記 §5）。`verify-pack` は書体の path／family／weight／license と **OFL.txt の同梱**まで見る |
| 目録の検査 | `tools/check-contract.mjs` が **アプリ自身の `sanitizeCatalog`** で 2 件とも通ることを確認 |
| CI | `.github/workflows/check.yml`。push／PR ごとに §1 の 4 本（trk-PWA を隣に clone して実行） |
| 未確認 | **実ブラウザ・実機**（§4）。アプリ側の書体読み込みは trk-PWA の次の版 |
| 大きさ | 倉庫は約 3.2 MB（`.git` を除く）。いちばん大きいのは書体パックの 2.9 MB |

## 2. 目録とパックの契約（アプリとの取り決め）

`catalog/index.json` は **trk-PWA trk230 の `js/pack-catalog.js` が読む形**です。正本は trk-PWA の `docs/LIBRARY-TRK230-2026-10-31.md` §3。

### 2-1. 目録（version 1）

```json
{
  "format": "trk-avatar-library", "version": 1,
  "name": "trk-Avatar-Library", "updatedAt": "…Z",
  "packs": [{
    "id": "…", "name": "…", "author": "…", "version": "1.0.0",
    "file": "font-packs/maru-go.stpack", "sha256": "64桁の16進", "bytes": 2935978,
    "fonts": [{ "family": "TrkZenMaru", "file": "fonts/…woff2", "license": "OFL-1.1", "weight": 400 }],
    "license": "…", "description": "…", "url": "https://…"
  }]
}
```

| 項目 | 必須 | この倉庫の出どころ | アプリの見方 |
| --- | --- | --- | --- |
| `format` | ○ | 固定 | `"trk-avatar-library"` 以外は読まない |
| `version` | ○ | 固定 `1` | **2 以上は「読めない」として断る** |
| `packs[].name` | ○ | `pack.json` の `name`（40 文字まで） | 空なら、その1件だけ落とす。80 文字で切る |
| `packs[].file` | ○ | `packs/…`・`font-packs/…` | 相対パスで `.stpack` だけ。`..`・先頭 `/` はその1件を落とす |
| `packs[].sha256` | 推奨 | 実物から計算 | 64 桁の16進だけ。形が違えば照合しない（入れられはする） |
| `packs[].bytes` | 推奨 | 実物の大きさ | 違えば**入れない** |
| `packs[].version` | 任意 | `pack.json` の `release`（省略時 `1.0.0`） | 保持するだけ |
| `packs[].fonts[]` | 任意 | `pack.json` の `fonts` | `family` があるものを「書体n」と表示（中身はまだ使わない） |
| `packs[].license` / `description` | 任意 | `pack.json` | 200／300 文字で切って表示 |
| `packs[].url` | 任意 | `pack.json` の `url`（https のみ） | リンクにせず、項目として持つだけ |

上限：**500 パック**（超えたら `build-catalog` が断る）・名前 80 文字・説明 300 文字。

### 2-2. `pack.json`（`.stpack` の中身）

```json
{
  "format": "shadow-taiko-pack", "version": 1,
  "name": "…", "author": "…", "release": "1.0.0",
  "description": "…", "license": "…", "url": "https://…",
  "fonts": [{ "family": "TrkZenMaru", "file": "fonts/…woff2", "weight": 400, "license": "OFL-1.1" }],
  "skin": { "name": "…", "colors": { "bg": "#…", "panel": "#…", "text": "#…", "accent": "#…", "gold": "#…" } },
  "notes": { "don": { "color": "#…", "shape": "circle" }, "ka": { "color": "#…", "shape": "circle" } }
}
```

- `release` は**配る版**（目録の `packs[].version` になる）。`url` は https だけ
- `fonts[]` は **woff2**・`family` は英数字と空白・`. _ -` の 40 文字まで・`weight` は 100〜900 の整数
- **書体を入れるときは、ライセンス全文（`OFL.txt` など）をパックに入れる**（OFL の条件。`verify-pack` が不合格にする）
- 1 パック 500 MB まで（アプリと同じ。`js/custom.js` の `PACK_MAX`）

### 2-3. 形を守る仕組み

| 道具 | 見るもの |
| --- | --- |
| `tools/verify-pack.mjs` | 1 つのパック（ZIP・`pack.json`・色・指すファイル・書体・OFL.txt・`release`／`url`） |
| `tools/build-catalog.mjs` | 全パックを検査し、`sha256`・`bytes`・書体・版・URL を目録へ。500 件上限 |
| `tools/check-contract.mjs` | **アプリの `sanitizeCatalog` をそのまま読み込み**、1 件も落とされず値が変わらないか |
| `tools/selftest.mjs` | 上の道具が、わざと壊した入力で**ちゃんと断る**か |

## 3. 変えてはいけないこと

1. **目録の `format` と `version`**（`trk-avatar-library` / `1`）。変えるときはアプリ側と同時に版を上げる。
2. **外部へ取りに行かない**：目録も `.stpack` も、利用者が選んだファイルだけを読む。URL の自動取得・CDN・解析タグを足さない
   （倉庫の道具が npm から素材を取るのは**ビルド時だけ**。配布物には入らない）。
3. **`sha256` と `bytes` は実物と一致**させる。目録を作り直さずに `.stpack` を差し替えない。
4. **書体のライセンス全文をパックに入れる**。`family` を変えた版を配るときは OFL の予約名に注意（`NOTICE.md`）。
5. **GPL-3.0-or-later のクレジットとソース**を消さない。パックごとの `license` は別物（同梱素材の権利は各権利者）。
6. **`.stpack` の作り方を変えない**：無圧縮（store）・決定的な並び。`build-pack --check` が CI で見ている。
7. 目録・パックの上限（500 件・500 MB・名前 40／80 文字）を超えるものを黙って出さない。

## 4. 確かめていないこと（最重要）

1. **実ブラウザ・実機での見え方**（この作業環境にブラウザも端末もない）
   - `gallery/all-skins.html` の並び・絞り込み・並べ替え
   - `dist/preview/maru-go.html` の書体（Zen Maru Gothic が実際に当たっているか）
   - trk! にパックを入れたときの棚・適用後の画面
2. **アプリ側の書体読み込み**：trk230 は `pack.json` の `fonts` を使いません（目録に「書体n」と出すだけ）。
   必要な作業は trk-PWA の `docs/LIBRARY-TRK230-2026-10-31.md` §5（`FontFace` 登録 → `--font` の先頭へ → 外したら片付ける）。
3. **`file://` で開いたときの `crypto.subtle`**（アプリ側の既知の未確認。使えない環境では「照合せずに入れる」表示になる）
4. **大きいパック**（数百 MB）を選んだときの sha256 計算の待ち時間（アプリ側。いまは `arrayBuffer()` で一括読み）
5. **目録 500 件**を一覧にしたときの重さ（アプリ側）

## 5. 主なファイル

| 場所 | 中身 |
| --- | --- |
| `README.md` | 利用者向け（見本の見方・パックの入れ方・作者向けの作り方） |
| `NOTICE.md` / `LICENSE` | 権利とクレジット（GPL-3.0-or-later） |
| `catalog/index.json` | **目録**（アプリが読む唯一のファイル） |
| `catalog/skins.json` | 全スキン見本のもとデータ（53 種・書体 9 種） |
| `gallery/all-skins.html` | 全スキン見本（1 ファイル・外部参照 0） |
| `packs/` | 配る `.stpack`（サンプル） |
| `font-packs/` | 書体パックの `.stpack` と、その**もと**（`maru-go/`） |
| `font-packs/maru-go/` | `pack.json`・`SOURCE.json`（tarball と sha256）・`fonts/OFL.txt`・`NOTICE.md` |
| `tools/verify-pack.mjs` | 1 つの `.stpack` の検査（終了コード 0／1／2） |
| `tools/build-pack.mjs` | フォルダ → `.stpack`（`--check`・`--fetch`・`--json`） |
| `tools/build-catalog.mjs` | 目録の作成と `--check` |
| `tools/check-contract.mjs` | 目録がアプリの規則を通るか（trk-PWA 必須） |
| `tools/preview-pack.mjs` | パックの色と書体を埋め込んだ見本 HTML（`dist/` は gitignore） |
| `tools/selftest.mjs` | 道具の自己検査（14 項目） |
| `tools/export-skin-gallery.mjs` | trk-PWA から見本を作り直す |
| `tools/lib/zip.mjs` | trk-PWA の `js/zip-io.js` を読み込む小さな入口（写しを持たない） |
| `.github/workflows/check.yml` | CI（selftest・目録・契約・書体パック） |
| `docs/` | 受け渡しメモなど |

## 6. 直近の検証（2026-10-31・この環境）

```sh
node tools/selftest.mjs                                        # ✅ 14 / 14 合格
node tools/build-catalog.mjs --check                           # ✅ 目録は最新です（2 パック）
node tools/check-contract.mjs                                  # ✅ アプリの規則を通ります（2 パック）
node tools/build-pack.mjs font-packs/maru-go --check           # ✅ フォルダと一致（sha256 93a4bb2d…）
node tools/verify-pack.mjs packs/*.stpack font-packs/*.stpack  # ✅ 2 件とも合格
node tools/preview-pack.mjs font-packs/maru-go.stpack          # ✅ 3.9 MB・書体 2・外部参照 0
node tools/export-skin-gallery.mjs --trk=../trk-PWA            # ✅ 53 種（書体 9 種）・skins.json と一致
```

- わざと壊した入力（`..` のパス・日本語の family・`OFL.txt` なし・`release` の形違い・目録の偽エントリ・改変した `.stpack`）で、
  `verify-pack`／`build-catalog --check`／`build-pack --check`／`check-contract` が**それぞれ不合格になる**ことも確認
- 書体パックの woff2 は `SOURCE.json` の sha256 と照合済み（400：`58395f89…`／700：`05b928e9…`）
- GitHub Actions（`check.yml`）は push／PR で **成功**（run 41218922745・13 秒）

## 7. 変更履歴（新しい順）

### 2026-10-31 土台＋書体パック

- 受け渡しZIP（`trk-avatar-library-2026-10-31.zip`＝15 ファイル）を展開し、`README.md` を差し替え
- 書体パックの実物 `font-packs/maru-go.stpack`（2,935,978 B）と、そのもと `font-packs/maru-go/`
- `tools/build-pack.mjs`・`tools/check-contract.mjs`・`tools/preview-pack.mjs` を追加
- `tools/verify-pack.mjs`：書体の path／family／weight／license、**OFL.txt 必須**、`release`／`url` を追加
- `tools/build-catalog.mjs`：`name`・`version`・`url`・`fonts[].weight`・500 件上限を追加
- `tools/selftest.mjs`：10 → **14 項目**
- `.github/workflows/check.yml`・`.gitignore`・`.gitattributes` を追加
- `docs/2026-10-31-土台と書体パック.md` を追加（のちにこの HANDOFF.md に統合）

### 2026-10-31 受け渡し（trk-PWA trk230 時点）

- trk-PWA 側で目録からの取り込み（trk230）が入り、倉庫側に土台が渡された
- 土台の中身：全スキン見本 53 種・`catalog/skins.json`・目録・サンプルパック・検査の道具

## 8. PR 前チェックリスト

- [ ] `node tools/selftest.mjs` が全部合格
- [ ] `node tools/build-catalog.mjs --check` が最新
- [ ] `node tools/check-contract.mjs` が通る（trk-PWA を隣に置いて）
- [ ] `.stpack` を変えたなら `node tools/build-pack.mjs <フォルダ> --check --fetch`
- [ ] 目録の `sha256`／`bytes` が実物と一致（`build-catalog` を通した）
- [ ] 書体を足したなら `OFL.txt` をパックに入れた／`NOTICE.md` と `SOURCE.json` を更新した
- [ ] README（利用者向け）と HANDOFF（この文書）の記述が変わっていないか
- [ ] 実機で見ていないなら、その旨を PR に書いた（§4）
- [ ] `git diff --check`（空白の事故）

## 9. 配布（Git・Release・Drive）

- **Git に入れる**：パック（1 つ 50 MB まで）・見本 HTML・目録・道具
- **Release か Drive に置く**：書体をたくさん束ねた ZIP・全スキン入りビルド（目録の `description` に「どこにあるか」を書く）
- 目録には必ず `sha256` と `bytes` を書く（落とした人が確かめられるように）
- 利用者の手順は README §2：**trk! の 設定 → 📦 カスタムパック → 📚 目録から入れる → `index.json` を選ぶ → 一覧から `.stpack` を選ぶ**
- 受け渡し用の ZIP を作るときは、`git archive` ではなく**このリポジトリの中身をそのまま**（`.cache/`・`dist/` を除く）

## 10. 次の段

1. **trk-PWA 側の書体読み込み**（`sanitizeManifest` に `fonts` → `FontFace` 登録・解除）。倉庫側はもう用意済み
2. 書体パックを増やす（`font-packs/<name>/` をコピーして `pack.json`・`SOURCE.json` を差し替え → `build-pack --fetch`）
3. 全スキン入りビルドを Release に置く（README §5）
4. 実機で見た結果を §4 に追記する（見え方・導入・書体）
