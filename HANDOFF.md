# trk-Avatar-Library 開発引き継ぎ

> **最終更新：2026-11-01**（trk233 版＝**書体パック 14 種を追加して 15 パック**・目録の `fonts[].note`（ひとこと）と `fonts[].cmap`（字数）・セット **r3**）。アプリ側は **trk!（trk-PWA）trk233**（`8e15e67`）を前提にしています。
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
| 2026-11-01 | **trk233 への対応**：trk-PWA 側から届いた**書体パック 14 種**を置いて **15 パック**に（届いた `.stpack` とバイト単位で一致）・目録に `fonts[].note`（L10）と `fonts[].cmap`（L11）・`licenseFile` をアプリが読むようになったので `check-contract` を集計表示に・実機チェックの手順（L12・§4-1）・`TRK_PWA_REF` を trk233 に・セット **r3**（16 パック・29.4 MB） |
| 2026-11-01 | **trk232 への対応**：書体の `licenseFile`（L7・任意項目）・`release` と目録の `version` の一致検査（L8）・**書体の中身（woff2・cmap）の検査**と見本の「🔤 同梱の書体」（L9）・`TRK_PWA_REF` を trk232 に・セット **r2**（書体パック 1.1.0） |
| 2026-11-01 | **trk231 への対応**：README の先頭に「はじめての3手順」（L1）・**Release のはじめてセット**（L2・ZIP 1つ）・目録に `colors`（L3）・パックの表（L4）・CI の相手側の版を固定＋週次（L5）・文書の検査（`check-docs`）。Pages（L6）は相談のみ |
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
  node tools/selftest.mjs              # 道具が「ちゃんと断る」か（2026-11-01 時点で 22 / 22）
  node tools/build-catalog.mjs --check # 目録が今の中身と合っているか（release と version の一致も）
  node tools/check-contract.mjs        # 目録がアプリの読み取り規則を通るか（相手側の版も表示）
  node tools/check-fonts.mjs           # 書体（woff2）が本当に読める形か・見本の字が入っているか
  node tools/export-skin-gallery.mjs --trk="$TRK_PWA" --check   # 見本が今の中身と一致するか
  for d in font-packs/*/; do node tools/build-pack.mjs "$d" --check --fetch; done   # 書体パック 15 個がフォルダと一致するか
  node tools/build-set.mjs sets/first-set.json --check          # はじめてセットが記録と一致するか
  node tools/check-docs.mjs            # README の表・内部リンク・セットの記録が今の中身と合っているか
  ```

- **相手側（trk-PWA）の版は固定**しています：CI の `TRK_PWA_REF`（`.github/workflows/check.yml` と `release-set.yml` の `env`。いまは trk233 = `8e15e6777736d5091ae63d8a490cba1934cbb379`）。
  trk-PWA の版が上がったら、**この1行と §7 の記録を一緒に**変えます。固定した版と `main` の両方を見るため、
  週に1回（日曜 21:00 UTC）`upstream-main` ジョブが `main` でも契約を確かめます（失敗しても全体は赤にしません）。

- **時刻を混ぜない**：目録の `updatedAt` だけが時刻を持ちます。`build-catalog --check` は `packs` だけを比べるので、
  作り直しても `updatedAt` のせいで落ちることはありません。`.stpack` は**無圧縮で決定的**（同じフォルダ → 同じ sha256）。
- 実ブラウザ・実機で見たかどうかを、自動検査の成功と混同しない（§4）。

## 1.5 この倉庫の今（2026-11-01）

| 項目 | 今の状態 |
| --- | --- |
| 目的 | trk! の見た目（スキン・書体）を**手元に並べて、見て、選んで、持ち込む**ための倉庫。GPL-3.0-or-later |
| 配るもの | `catalog/index.json`（目録）と、`packs/`・`font-packs/` の `.stpack` |
| パック | **16 件**。`packs/sample-mincho.stpack`（見本・690 B・release 1.0.0）と **書体パック 15 個**（`font-packs/*.stpack`・合計 30,697,343 B）。書体パックはどれも release 1.0.0（`maru-go` だけ 1.1.0・sha256 `db4dc011…`） |
| 書体パック | 日本語書体（OFL-1.1）15 種・20 ウェイト。woff2＋`fonts/OFL.txt`＋`NOTICE.md`＋スキン（色とノーツの色）。`fonts[].licenseFile` が全文を指す（L7）。**trk232 から本文の書体として本当に効く**。**trk233 からは全文もアプリで読める** |
| 見本 | `gallery/all-skins.html` = 全スキン **53 種（書体 9 種）**＋**「🔤 同梱の書体」の節（15 パック・ひとことつき）**・1 ファイル・外部参照 0・オフラインOK（70,315 B）。`catalog/skins.json` がもとデータ。`--check` でズレを見る |
| 道具 | `tools/` の 9 本（下記 §5）。`verify-pack` は書体の path／family／weight／license／`licenseFile` と **OFL.txt の同梱**まで、`check-fonts` は **woff2 の中身（表・cmap・見本の字）**まで見る。`build-catalog` は目録に **`note`（ひとこと・L10）と `cmap`（字数・L11）** も入れる |
| 目録の検査 | `tools/check-contract.mjs` が **アプリ自身の `sanitizeCatalog`** で 16 件とも通ることを確認。任意項目（`licenseFile`・`note`・`cmap`・`colors`）をアプリが読むかは**1 行に集計**して出す |
| 書体のひとこと | `catalog/font-notes.json`（パックの外）に 22 書体ぶん。目録の `fonts[].note` と見本の「🔤」に出る。**パックの `pack.json` は書き換えない**（届いた `.stpack` とバイト単位で同じまま） |
| はじめてセット | `sets/first-set.json` の定義から `tools/build-set.mjs` が **ZIP 1つ**（見本＋目録＋**16 パック**・**30,799,039 B**）を作る。記録は `release/first-set.json`、過去の記録は `release/first-set-2026-11-01.json`（r1）。いまは **r3**（`first-set-2026-11-01-r3`） |
| CI | `.github/workflows/check.yml`。push／PR ごとに §1 の 8 本（trk-PWA を**固定した版**で clone して実行）＋週次で `main` も検査 |
| 未確認 | **実ブラウザ・実機**（§4）。セットのダウンロードと展開、`FontFace` で書体が当たったときの見え方、ライセンス全文の表示、16 行の一覧。**手順は §4-1**（L12） |
| 大きさ | 倉庫は約 30 MB（`.git` を除く）。いちばん大きいのは `font-packs/klee-one.stpack` の 3.7 MB（3,929,934 B） |

## 2. 目録とパックの契約（アプリとの取り決め）

`catalog/index.json` は **trk-PWA trk230 の `js/pack-catalog.js` が読む形**です。正本は trk-PWA の `docs/LIBRARY-TRK230-2026-10-31.md` §3。

### 2-1. 目録（version 1）

```json
{
  "format": "trk-avatar-library", "version": 1,
  "name": "trk-Avatar-Library", "updatedAt": "…Z",
  "packs": [{
    "id": "…", "name": "…", "author": "…", "version": "1.0.0",
    "file": "font-packs/maru-go.stpack", "sha256": "64桁の16進", "bytes": 2936399,
    "fonts": [{ "family": "TrkZenMaru", "file": "fonts/…woff2", "license": "OFL-1.1", "weight": 400,
                "licenseFile": "fonts/OFL.txt" }],
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
| `packs[].version` | 任意 | `pack.json` の `release`（省略時 `1.0.0`） | **入っているパックの `release` と比べて「更新あり」を出す**（trk232）。`build-catalog --check` が `release` との一致を見る（L8） |
| `packs[].fonts[]` | 任意 | `pack.json` の `fonts`（`family`・`file`・`license`・任意の `weight`／`licenseFile`）＋倉庫で足す `note`／`cmap` | 目録では `family` があるものを「書体n」と表示。`licenseFile` は **trk233 から全文の表示に使う**。`note`／`cmap` はまだ持たないだけ（落とされない） |
| `packs[].fonts[].note` | 任意 | `catalog/font-notes.json`（パックの外）・60 文字まで | **trk233 は無視**（次の段で 🔎 中身に「書体の雰囲気」として出す予定・L10） |
| `packs[].fonts[].cmap` | 任意 | パックの woff2 の cmap を `build-catalog` が数える（字数） | **trk233 は無視**（「この書体に無い字はあるか」を入れる前に知らせる用・L11） |
| `packs[].license` / `description` | 任意 | `pack.json` | 200／300 文字で切って表示 |
| `packs[].url` | 任意 | `pack.json` の `url`（https のみ） | リンクにせず、項目として持つだけ |
| `packs[].colors` | 任意 | `pack.json` の `skin.colors` の `bg`／`accent`（2色） | **trk231 は無視**（trk235 以降で一覧に色の点を出す予定）。形は `check-contract` が見る |

上限：**500 パック**（超えたら `build-catalog` が断る）・名前 80 文字・説明 300 文字。

### 2-2. `pack.json`（`.stpack` の中身）

```json
{
  "format": "shadow-taiko-pack", "version": 1,
  "name": "…", "author": "…", "release": "1.0.0",
  "description": "…", "license": "…", "url": "https://…",
  "fonts": [{ "family": "TrkZenMaru", "file": "fonts/…woff2", "weight": 400, "license": "OFL-1.1",
              "licenseFile": "fonts/OFL.txt" }],
  "skin": { "name": "…", "colors": { "bg": "#…", "panel": "#…", "text": "#…", "accent": "#…", "gold": "#…" } },
  "notes": { "don": { "color": "#…", "shape": "circle" }, "ka": { "color": "#…", "shape": "circle" } }
}
```

- `release` は**配る版**（目録の `packs[].version` になる）。`url` は https だけ
- `fonts[]` は **woff2**・`family` は英数字と空白・`. _ -` の 40 文字まで・`weight` は 100〜900 の整数
- **書体を入れるときは、ライセンス全文（`OFL.txt` など）をパックに入れる**（OFL の条件。`verify-pack` が不合格にする）
- `licenseFile`（任意・2026-11-01 追加）は、その全文を指す **`.txt`／`.md` の相対パス**（256 KB まで・実在すること）。
  目録の `packs[].fonts[].licenseFile` に載り、アプリは **trk233** から全文を表示する
- `note`（ひとこと）と `cmap`（字数）は **`pack.json` には入れません**（目録だけに足す。パックのバイト列を動かさないため）
- 1 パック 500 MB まで（アプリと同じ。`js/custom.js` の `PACK_MAX`）

### 2-3. 形を守る仕組み

| 道具 | 見るもの |
| --- | --- |
| `tools/verify-pack.mjs` | 1 つのパック（ZIP・`pack.json`・色・指すファイル・書体・OFL.txt・`release`／`url`） |
| `tools/build-catalog.mjs` | 全パックを検査し、`sha256`・`bytes`・書体・版・URL・**`note`（`catalog/font-notes.json` から）・`cmap`（woff2 を数える）** を目録へ。500 件上限。`note` の書き間違いは止める |
| `tools/check-contract.mjs` | **アプリの `sanitizeCatalog` をそのまま読み込み**、1 件も落とされず値が変わらないか。任意項目（`licenseFile`・`note`・`cmap`・`colors`）をアプリが読むかは 1 行にまとめて出す |
| `tools/check-fonts.mjs` | パックの書体を ZIP から取り出し、**woff2 の中身**（署名・表・cmap・見本の字）を見る |
| `tools/export-skin-gallery.mjs` | 全スキン見本を作る／`--check` で今の中身と一致するか（`generatedAt` は無視） |
| `tools/build-set.mjs` | はじめてセット（ZIP）を作る／`--check` で記録と一致するか（決定的・`rev` で同じ日の r2 も作れる） |
| `tools/check-docs.mjs` | README の表と目録の一致・内部リンク（**見出しアンカーも**）・セットの記録 |
| `tools/selftest.mjs` | 上の道具が、わざと壊した入力で**ちゃんと断る**か |

## 2.5 相手側（trk-PWA trk231〜trk233）からのお願いへの回答（2026-11-01）

trk-PWA の `README-trk-Avatar-Library-へのお願い-2026-11-01.txt`（L1〜L6）・`README-trk-Avatar-Library-確認と次のお願い-2026-11-01.txt`（L7〜L9）・
`README-書体パック14種の追加をお願い-2026-11-01.txt`（書体パック 14 種・L10〜L12・セットの版の上げ方は A）と
`docs/LIBRARY-UX-PLAN-2026-11-01.md` への回答です。

| # | お願い | この版での対応 | 場所 |
| --- | --- | --- | --- |
| L1 | README の先頭に「はじめての3手順」 | **対応**。①見本を見る ②目録とパックを落とす ③trk! の 📥 まとめて入れる、の3行の表を先頭に置き、§2 も①②③の順に並べ替えました | `README.md` 冒頭・§2 |
| L2 | Release に「はじめてセット」 | **対応**。見本 HTML＋目録＋書体パックを1つのZIPにしました（**2,993,307 B**）。`tools/build-set.mjs` で決定的に作り、`release/first-set.json` に sha256 を記録。GitHub Release `first-set-2026-11-01` に添付 | `sets/first-set.json`・`release/first-set.json` |
| L3 | 目録に `colors` | **対応**。`pack.json` の `skin.colors` から `bg`／`accent` を `{"stage","accent"}` として目録に出力（任意項目）。trk231 のアプリは無視します。形の検査は `check-contract` | `tools/build-catalog.mjs`・`tools/check-contract.mjs` |
| L4 | 「どのパックを落とすか」の表 | **対応**。名前・ファイル・大きさ・何が変わるか・書体・ライセンスの表を README §2-2 に置き、**目録とズレたら CI が落ちる**ようにしました（`check-docs`） | `README.md` §2-2 |
| L5 | CI でアプリの読み取り検査を回す・版を固定する | **対応**。`TRK_PWA_REF`（trk231 = `9bf22d7a…`）で相手側を固定し、`check-contract` を毎回実行。加えて**週1回** `main` でも同じ検査（`upstream-main`・失敗しても全体は赤にしない）。`check-contract` は読んだ相手側の版を表示します | `.github/workflows/check.yml`・`tools/check-contract.mjs` |
| L6 | GitHub Pages で見本を開けるようにするか | **保留（相談）**。オリジンが増えるため、こちらからは決めません。やる場合はアプリ側の CSP・Service Worker・共有の扱いを一緒に確認します（相手側も「急がない・範囲を絞るのが良さそう」と同意） | — |
| L7 | 書体のライセンス全文（任意の `fonts[].licenseFile`） | **対応（アプリ側も trk233 で完了）**。`pack.json` で宣言でき（`verify-pack` が形・実在・大きさを検査）、目録の `packs[].fonts[].licenseFile` に載ります。**trk233 からアプリが読むようになった**ので、`check-contract` の ℹ が「アプリが読むようになりました（22 件）」に変わりました（見直しどきの合図） | `tools/verify-pack.mjs`・`tools/build-catalog.mjs`・`tools/check-contract.mjs`・`font-packs/*/pack.json` |
| L8 | `release` と目録の `version` を必ず一致 | **対応**。`build-catalog --check` が**名前を挙げて**止めます（片方だけ上げたパック・目録にあるのにファイルが無いパック）。`verify-pack` は `release` が無いとき「ℹ」で知らせます（目録は 1.0.0 になり、更新ありが効かないため） | `tools/build-catalog.mjs`・`tools/verify-pack.mjs` |
| L9 | 実ブラウザでの見え方の確認・見本に「同梱の書体」の節 | **一部対応**。ブラウザは無いので、代わりに **woff2 の中身を node で検査**（`check-fonts`：署名・表・cmap・見本の字）。見本 HTML に **「🔤 同梱の書体」**の節を追加（@font-face なし・書体名とライセンスだけ）。実際の見え方は実機でお願いします（手順は §4-1） | `tools/check-fonts.mjs`・`gallery/all-skins.html` |
| L10 | 目録に書体のひとこと `fonts[].note`（任意・60 文字） | **対応**。`catalog/font-notes.json` に 22 書体ぶんを書き、`build-catalog` が目録の `fonts[].note` に入れます（`pack.json` は書き換えない＝届いた `.stpack` のバイト列を動かさない）。60 文字を超える・パックにない書体・目録にないパックは**止まります**。見本の「🔤」にも出ます。アプリ（trk233）はまだ読みません | `catalog/font-notes.json`・`tools/build-catalog.mjs`・`tools/export-skin-gallery.mjs` |
| L11 | 目録に `fonts[].cmap`（対応する字数） | **対応**。`build-catalog` がパックの woff2 を brotli まで解いて cmap を数え、`fonts[].cmap` に入れます（22 書体・**5,451〜6,887 字**）。アプリ（trk233）はまだ読みません | `tools/build-catalog.mjs`（`check-fonts` の `checkFont` をそのまま使う） |
| L12 | 実ブラウザでの確認の分担（作業手順を HANDOFF に） | **対応**。§4-1 に **4 点のチェック表**（書体が当たるか・太さの切り替わり・ライセンス全文の表示・16 行の一覧）と、見た記録を書く欄を足しました。こちらはブラウザを持っていないので、実機で見たら §4-1 に追記します | `HANDOFF.md` §4-1 |

- 書体の `family` は `TrkZenMaru`、`weight` 400／700 の2本のまま（お願いどおり。変えていません）
- アプリは外部へ取りに行かない・`version 1` のまま・`file` は相対パスだけ、という約束も変えていません
- `check-docs` を足したので、**パックを足したら README の表も直す**のが必須になりました（CI が教えてくれます）
- **`TRK_PWA_REF` を trk232（`70fd92193f43157faafebb01ba58477eaf7087df`）に上げました**（L5 の「上がったら知らせる」を受けて）
- 書体パックを release **1.1.0** に上げ、セットも **r2** として配り直しました（同じタグは作り直さない・§9）
- **書体パック 14 種を置きました**（2026-11-01 に届いた `font-packs-src.zip` の 14 フォルダ）。`pack.json` は**そのまま**使い、
  `node tools/build-pack.mjs font-packs/<slug> --fetch` で組み立てた `.stpack` が、届いた `SHA256SUMS` の 14 本と**バイト単位で一致**しました
- セットの版の上げ方は、相手側の追記（`追記-2026-11-01-はじめてセットはA方式で.txt`）に合わせて **A（目録が変わるたびに r3・r4…）** にしました。
  r1・r2 のタグはそのまま、**r3 を新しく配ります**（16 パック・29.4 MB）

## 3. 変えてはいけないこと

1. **目録の `format` と `version`**（`trk-avatar-library` / `1`）。変えるときはアプリ側と同時に版を上げる。
2. **外部へ取りに行かない**：目録も `.stpack` も、利用者が選んだファイルだけを読む。URL の自動取得・CDN・解析タグを足さない
   （倉庫の道具が npm から素材を取るのは**ビルド時だけ**。配布物には入らない）。
3. **`sha256` と `bytes` は実物と一致**させる。目録を作り直さずに `.stpack` を差し替えない。
4. **書体のライセンス全文をパックに入れる**。`family` を変えた版を配るときは OFL の予約名に注意（`NOTICE.md`）。
5. **GPL-3.0-or-later のクレジットとソース**を消さない。パックごとの `license` は別物（同梱素材の権利は各権利者）。
6. **`.stpack` の作り方を変えない**：無圧縮（store）・決定的な並び。`build-pack --check` が CI で見ている。
7. 目録・パックの上限（500 件・500 MB・名前 40／80 文字）を超えるものを黙って出さない。
8. **`pack.json` の `release` と目録の `version` を片方だけ上げない**（アプリの「更新あり」が狂う。L8）。
9. **相手側から届いたパックの `pack.json` を書き換えない**（向こうで作った `.stpack` とバイト単位で同じでなくなる）。
   目録に足したいもの（ひとこと等）は、パックの外（`catalog/font-notes.json`）に書く。

## 4. 確かめていないこと（最重要）

1. **実ブラウザ・実機での見え方**（この作業環境にブラウザも端末もない）
   - `gallery/all-skins.html` の並び・絞り込み・並べ替え、**「🔤 同梱の書体」15 パック**のカードの見え方
   - `dist/preview/<slug>.html` の書体（`node tools/preview-pack.mjs <pack>` で作れます）
   - trk! にパックを入れたときの棚・適用後の画面
2. **書体が実際に画面に効くか**：trk232 で `FontFace` の読み込みが入りましたが、**実機では見ていません**
   （`check-fonts` で woff2 の中身と cmap までは確認済み。読み込みの成否と見た目はブラウザでしか分かりません）。
3. **`file://` で開いたときの `crypto.subtle`**（アプリ側の既知の未確認。使えない環境では「照合せずに入れる」表示になる）
4. **大きいパック**（数百 MB）を選んだときの sha256 計算の待ち時間（アプリ側。いまは `arrayBuffer()` で一括読み）
5. **目録 500 件**を一覧にしたときの重さ（アプリ側）
6. **はじめてセットの落として〜展開まで**：この作業環境からは `release-assets.githubusercontent.com` に届かないため、
   アップロード（CI）と**大きさ・sha256 の一致**までを確認しています。ブラウザでのダウンロードと展開、
   展開した中身を trk! の「📥 まとめて入れる」で選ぶところは、実機で一度見てください
   （**r3 は 29.4 MB** なので、落とす時間も見てください）
7. **書体パック 15 個を全部入れたときの保存容量**（アプリ側）：合計 **29.3 MB**（30,697,343 B）・20 ウェイト。
   端末の空きと、入れたあとの一覧の重さは実機で確かめてください

### 4-1. 実機で見るときの手順（L12・どちらが見ても同じ順で）

trk-PWA 側と「どこまで見たか」を揃えるための **4 点**です。見たら日付・端末・結果を下の「見た記録」に足してください。

| # | 見ること | 手順 | 期待 |
| --- | --- | --- | --- |
| 1 | **書体が当たるか** | trk! に `font-packs/zen-kaku.stpack` を入れて「使う」 | 本文の書体が角ゴシックに変わる。**「外す」で元に戻る** |
| 2 | **太さの切り替わり** | 2 ウェイトのパック（`maru-go`・`zen-kaku`・`kaisei-decol` など）で、太字を含む画面を見る | 本文（400）と見出し（700）で太さが変わる。**合成太字になっていない** |
| 3 | **ライセンス全文の表示** | 「🔤 同梱の書体」→「📄 ライセンス全文を読む」 | `fonts/OFL.txt` の全文が枠の中でスクロールして読める。古い版で入れたパックは「入れ直すと入ります」 |
| 4 | **16 行の一覧** | 📚 目録から入れる で `catalog/index.json` を選ぶ | 16 行がスクロールして選べる。名前・大きさ・書体・ライセンスが読める |

見た記録（日付・端末・結果）：

- （まだ。見たらここに追記）

## 5. 主なファイル

| 場所 | 中身 |
| --- | --- |
| `README.md` | 利用者向け（見本の見方・パックの入れ方・作者向けの作り方） |
| `NOTICE.md` / `LICENSE` | 権利とクレジット（GPL-3.0-or-later） |
| `catalog/index.json` | **目録**（アプリが読む唯一のファイル・16 パック） |
| `catalog/font-notes.json` | 書体の**ひとこと**（雰囲気の一行・60 文字まで）。目録の `fonts[].note` と見本の「🔤」に入る（L10） |
| `catalog/skins.json` | 全スキン見本のもとデータ（53 種・書体 9 種） |
| `gallery/all-skins.html` | 全スキン見本（1 ファイル・外部参照 0） |
| `packs/` | 配る `.stpack`（サンプル） |
| `font-packs/` | 書体パック **15 個**の `.stpack` と、その**もと**（`font-packs/<slug>/`） |
| `font-packs/<slug>/` | `pack.json`・`SOURCE.json`（tarball と sha256）・`fonts/OFL.txt`・`NOTICE.md`（14 種は trk-PWA 側から届いたものをそのまま） |
| `tools/verify-pack.mjs` | 1 つの `.stpack` の検査（終了コード 0／1／2） |
| `tools/build-pack.mjs` | フォルダ → `.stpack`（`--check`・`--fetch`・`--json`） |
| `tools/build-catalog.mjs` | 目録の作成と `--check` |
| `tools/check-contract.mjs` | 目録がアプリの規則を通るか（trk-PWA 必須） |
| `tools/preview-pack.mjs` | パックの色と書体を埋め込んだ見本 HTML（`dist/` は gitignore） |
| `tools/check-fonts.mjs` | パックの書体（woff2）の中身を見る（署名・表・cmap・見本の字） |
| `tools/build-set.mjs` | はじめてセット（ZIP）を作る（`--release` で記録・`--check` で照合・`rev` で r2） |
| `tools/check-docs.mjs` | README の表と目録の一致・内部リンク（**見出しアンカーも**）・セットの記録 |
| `sets/first-set.json` | はじめてセットの**定義**（どのファイルを入れるか・日付・記録先）。いまは `rev: r3`・16 パック |
| `release/first-set.json` | 配ったセットの**記録**（ファイル名・bytes・sha256・中身の sha256）。いまは r3（30,799,039 B） |
| `release/first-set-notes.md` | Release の本文（手順・中身の表・権利）。CI が大きさと sha256 を足して添付 |
| `release/first-set-2026-11-01.json` | **過去**の記録（r1・2,993,307 B）。r2 の記録はタグ `first-set-2026-11-01-r2` の中。`release/README.md` に経緯 |
| `tools/selftest.mjs` | 道具の自己検査（22 項目） |
| `tools/export-skin-gallery.mjs` | trk-PWA から見本を作り直す |
| `tools/lib/zip.mjs` | trk-PWA の `js/zip-io.js` を読み込む小さな入口（写しを持たない） |
| `.github/workflows/check.yml` | CI（selftest・目録・契約・書体パック） |
| `docs/` | 受け渡しメモなど |

## 6. 直近の検証（2026-11-01・この環境）

```sh
node tools/selftest.mjs                                        # ✅ 22 / 22 合格
node tools/build-catalog.mjs --check                           # ✅ 目録は最新です（16 パック・release と version も一致）
node tools/check-contract.mjs                                  # ✅ アプリ（trk233・8e15e67）の規則を通ります（16 パック）
node tools/check-fonts.mjs                                     # ✅ 15 パック・20 書体（cmap 5,451〜6,887 字・見本 7/7）
node tools/export-skin-gallery.mjs --trk=../trk-PWA --check    # ✅ 見本は最新です（53 種＋書体 15 パック）
for d in font-packs/*/; do node tools/build-pack.mjs "$d" --check --fetch; done   # ✅ 15 個ともフォルダと一致
node tools/verify-pack.mjs packs/*.stpack font-packs/*.stpack  # ✅ 16 件とも合格
node tools/build-set.mjs sets/first-set.json --check           # ✅ 記録と一致（30,799,039 B・sha256 1b381a1e…）
node tools/check-docs.mjs                                      # ✅ 文書は今の中身と合っています（16 パック・内部リンク 10 本）
```

2026-11-01（trk233 対応）に足した確認：

- **届いた 14 パックとバイト単位で一致**：`font-packs-src.zip` の 14 フォルダから `build-pack --fetch` で組み立てた `.stpack` が、
  届いた `SHA256SUMS` の 14 本と**すべて同じ sha256**（`zen-kaku` = `b12dc221636c…`・1,969,655 B ほか）。
  woff2 は npm `@fontsource` から取り、`SOURCE.json` の sha256 と照合しています（`--fetch` が毎回確かめる）
- **書体 20 本の中身**：`wOF2` 署名・TrueType・表 15〜19・**cmap 5,451〜6,887 字**・見本の字 7/7（`check-fonts`）
- **L10・L11**：目録の 22 書体すべてに `note` と `cmap`。`note` をわざと 61 文字にすると `build-catalog` が止まることを確認。
  アプリ（trk233）はこの 2 項目をまだ読まないが、**目録から 1 件も落とされない**（`check-contract`）
- **`licenseFile` をアプリが読むように**：`check-contract` の ℹ が「読むようになりました（22 件）」に変わった（trk233 の `sanitizeCatalog` が `licenseFile` を保持する）
- セット **r3**：2 回作っても同じ sha256（`1b381a1e…`・**30,799,039 B**・19 ファイル）

2026-11-01（trk232 対応）に足した確認：

- `licenseFile` を足しても、**アプリ（trk232）が 2 パックとも落とさずに読む**（ℹ「アプリはまだ読みません」だけ）
- `verify-pack` が `licenseFile` の**不在・拡張子・`..`** を弾く（selftest の 4 項目）
- **woff2 の中身**：`wOF2` 署名・TrueType・表 17 個・`cmap` 6,875 字・見本の字 7/7。
  `cmap` の文字数は **fonttools（Python）の `getBestCmap()` と完全一致**（1 度だけ手元で突き合わせた）
- 書体の中の名前は **Zen Maru Gothic**（Regular／Bold・usWeightClass 400／700・6,934 字形）。
  アプリは `TrkZenMaru` という**家族名を付けて** `FontFace` に登録するので、中の名前とは別でよい
- 見本 `--check` が、1 行足しただけで**落ちる**ことも確認（`generatedAt` は比べない）

2026-11-01（trk231 対応）に足した確認：

- 目録に `colors` が入る（`sample-mincho` = `#f6f1e6`／`#8c2f39`、`maru-go` = `#241a2a`／`#ffb3d2`）。
  **アプリ（trk231・`9bf22d7`）はこの項目を無視しても、2 パックとも落とさずに読む**ことを `check-contract` で確認
- はじめてセットは**2 回作っても同じ sha256**（`b9599930c9e5…`・2,993,307 B・4 ファイル）
- セットの ZIP の中のファイル名は UTF-8（`README-はじめに.txt` も化けずに読める。`flag_bits & 0x800` を確認）
- `check-docs` が、わざと大きさをずらした行・目録にない行・リンク切れ・記録の欠落で**落ちる**ことを確認
- **見出しアンカー**も検査します。GitHub の id の作り方（小文字→約物を消す→空白を1つずつ `-`）を写し、
  GitHub が実際に付けた README の 20 個の id と**全部一致**することを確かめてから入れました
  （`#2-2-②-…` のような「人が読みやすいが実在しない」リンクを、CI が見つけられます）

- わざと壊した入力（`..` のパス・日本語の family・`OFL.txt` なし・`release` の形違い・目録の偽エントリ・改変した `.stpack`）で、
  `verify-pack`／`build-catalog --check`／`build-pack --check`／`check-contract` が**それぞれ不合格になる**ことも確認
- 書体パックの woff2 は `SOURCE.json` の sha256 と照合済み（400：`58395f89…`／700：`05b928e9…`）
- GitHub Actions（`check.yml`）は push／PR で **成功**（run 41218922745・13 秒）

## 7. 変更履歴（新しい順）

### 2026-11-01 trk233 への対応（書体パック 14 種・L10〜L12・セット r3）

- `font-packs/` に **14 種**を追加（`pack.json`・`SOURCE.json`・`NOTICE.md`・`fonts/OFL.txt` は届いたまま）。
  `.stpack` は `build-pack --fetch` で組み立て、**届いた `SHA256SUMS` とバイト単位で一致**
- `catalog/font-notes.json`（新規）：書体の**ひとこと** 22 件（60 文字まで）
- `tools/build-catalog.mjs`：目録に **`fonts[].note`（L10）と `fonts[].cmap`（L11）**。`note` の書き間違い（長すぎる・パックにない書体）は止める
- `tools/check-contract.mjs`：任意項目をアプリが読むかを**1 行に集計**（16 パックぶんの ℹ を整理）。`note`／`cmap` の形も検査
- `tools/export-skin-gallery.mjs`：見本の「🔤 同梱の書体」に**ひとこと**を出し、見本の文字を書体に依らない「かな 漢字 いろは」に
- `tools/build-set.mjs`：セットの説明の「書体について」を**パックに依らない文**に（Zen Maru Gothic 決め打ちをやめた）
- `README.md`・`font-packs/README.md`・`NOTICE.md`：15 パックの一覧・書体の出どころ・ライセンスの説明を更新
- `HANDOFF.md`：**§4-1 実機チェックの手順（L12・4 点）**、§2.5 に L10〜L12、§3 に「届いた `pack.json` を書き換えない」
- `.github/workflows/check.yml`：`TRK_PWA_REF` を **trk233（`8e15e67`）** に。**書体パック 15 個すべて**を `build-pack --check --fetch`。
  取り置き（`.cache`）のキャッシュ key を `SOURCE.json` のハッシュに
- `release-set.yml`：`TRK_PWA_REF` を trk233 にそろえる
- セット **r3**（`trk-first-set-2026-11-01-r3.zip`・**30,799,039 B**・sha256 `1b381a1e…`・16 パック・19 ファイル）

### 2026-11-01 trk232 への対応（L7〜L9）

- `font-packs/maru-go/pack.json`：`fonts[].licenseFile`（`fonts/OFL.txt`）を宣言（L7）。`release` を **1.1.0** に
- `tools/verify-pack.mjs`：`licenseFile` の形・実在・大きさ（256 KB）を検査。`release` が無いときは **ℹ**（ノート）
- `tools/build-catalog.mjs`：目録の `fonts[].licenseFile` に載せる。`--check` で **`release` と `version` の不一致を名前つきで止める**（L8）
- `tools/check-contract.mjs`：`licenseFile` の形を検査し、アプリがまだ読まないことを ℹ で出す
- `tools/check-fonts.mjs`（新規）：woff2 の署名・sfnt の種類・必要な表・**cmap の文字**を見る（L9 の代わりにできる範囲）
- `tools/export-skin-gallery.mjs`：見本に **「🔤 同梱の書体」**の節（@font-face なし）と `--check`（L9）
- `tools/build-set.mjs`：`rev`（`r2`）で**同じ日にもう一度配れる**（ファイル名とタグの後ろに付く）
- `tools/selftest.mjs`：14 → **22 項目**（`licenseFile` 3・ℹ 1・woff2 2・`info` 1・既存 15）
- `.github/workflows/check.yml`：`TRK_PWA_REF` を **trk232（`70fd9219…`）** に。`check-fonts` と見本 `--check` を追加
- セット **r2**（`trk-first-set-2026-11-01-r2.zip`・2,996,422 B・sha256 `71c9ce0b…`）。r1 の記録は `release/first-set-2026-11-01.json` に保存

### 2026-11-01 trk231 への対応（L1〜L6）

- `README.md`：**はじめての3手順**を先頭に。§2 を①②③の順に並べ替え、**パックの表**（L4）を追加
- `sets/first-set.json`・`tools/build-set.mjs`：**はじめてセット**（ZIP 1つ・決定的・2,993,307 B）。`release/first-set.json` に記録
- `tools/build-catalog.mjs`・`tools/verify-pack.mjs`：目録に **`colors`**（`stage`／`accent`）を出力（L3）
- `tools/check-contract.mjs`：`colors` の形を検査。**読んだ相手側 trk-PWA の版を表示**（L5）
- `tools/check-docs.mjs`（新規）：README の表と目録の一致・内部リンク・セットの記録を検査
- `.github/workflows/check.yml`：`TRK_PWA_REF` で相手側を固定、週次の `upstream-main` ジョブ、セットと文書の検査を追加
- 大きさの表記を **2.8 MB（2,935,978 B）**に統一（アプリの `formatBytes` と同じ 1024 進で数える）

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
- [ ] `.stpack` を変えたなら `node tools/build-pack.mjs <フォルダ> --check --fetch`（全部なら `for d in font-packs/*/; do …; done`）
- [ ] 書体パックを足したなら `catalog/font-notes.json` に**ひとこと**を足した（60 文字まで）
- [ ] `node tools/check-fonts.mjs`（書体の中身・見本の字）
- [ ] 見本を作り直したなら `node tools/export-skin-gallery.mjs --trk=… --check` が通る
- [ ] パックを足した／消したなら、README §2-2 の**表**と `sets/first-set.json` を見直した
- [ ] `node tools/check-docs.mjs`（表・リンク・セットの記録）
- [ ] セットを配り直すなら `node tools/build-set.mjs sets/first-set.json --release` して、**同じタグを作り直さず**新しいタグを push した（同じ日なら `rev` を上げる）
- [ ] 相手側（trk-PWA）の版が上がったなら、`TRK_PWA_REF` とこの文書の記録を更新した
- [ ] 目録の `sha256`／`bytes` が実物と一致（`build-catalog` を通した）
- [ ] 書体を足したなら `OFL.txt` をパックに入れた／`NOTICE.md` と `SOURCE.json` を更新した
- [ ] README（利用者向け）と HANDOFF（この文書）の記述が変わっていないか
- [ ] 実機で見ていないなら、その旨を PR に書いた（§4）
- [ ] `git diff --check`（空白の事故）

## 9. 配布（Git・Release・Drive）

- **Git に入れる**：パック（1 つ 50 MB まで）・見本 HTML・目録・道具
- **Release か Drive に置く**：書体をたくさん束ねた ZIP・全スキン入りビルド（目録の `description` に「どこにあるか」を書く）
- 目録には必ず `sha256` と `bytes` を書く（落とした人が確かめられるように）
- **はじめてセット**（いまは **r3**：Release `first-set-2026-11-01-r3`・アセット `trk-first-set-2026-11-01-r3.zip`・**30,799,039 B**・sha256 `1b381a1e…`・**16 パック**）：
  添付は `.github/workflows/release-set.yml` が **CI で作り直してから**行います（記録と一致しないものは添付しません）。
  **Release がまだ無ければ CI が作ります**（説明書きは `release/first-set-notes.md`。大きさと sha256 を足して添付）。
  手元で配る場合：
  見本 HTML＋目録＋書体パック。作り直したら **タグを増やす**（`first-set-2026-11-01` を作り直さない）——
  `release/first-set.json` と README のリンクを新しい日付に合わせます。
  新しいセットは、`sets/<name>.json` と `release/<name>.json` を足して、タグ `first-set-YYYY-MM-DD` を push すれば CI が添付します
  - **r1**（`first-set-2026-11-01`・`0801508`）：2,993,307 B・sha256 `b9599930…`・書体パック 1.0.0
  - **r2**（`first-set-2026-11-01-r2`・`8329524`）：2,996,422 B・sha256 `71c9ce0b…`・書体パック 1.1.0（`licenseFile`）＋見本の「同梱の書体」
  - **r3**（`first-set-2026-11-01-r3`）：30,799,039 B・sha256 `1b381a1e…`・**16 パック**（書体パック 14 種を追加）＋目録の `note`／`cmap`＋ひとことつきの見本
  CI で作り直したものと記録の sha256 が**一致**します（別のマシンでも同じバイト列＝本当に決定的）。
  過去の記録は `release/first-set-2026-11-01.json`（r1）とタグ `first-set-2026-11-01-r2` の中（r2）、経緯は `release/README.md`。
  **古い記録は、そのときのタグ（`git worktree add /tmp/r1 first-set-2026-11-01`）で再現できます**。
- 利用者の手順は README §2（はじめての3手順）：**①見本 ②目録とパックを落とす ③trk! の 📥 まとめて入れる**
- 受け渡し用の ZIP を作るときは、`git archive` ではなく**このリポジトリの中身をそのまま**（`.cache/`・`dist/` を除く）

## 10. 次の段

1. ~~trk-PWA 側の書体読み込み~~ … **trk232 で完了**。倉庫側は「使うと本文の書体が変わる」状態で待っています
2. ~~ライセンス全文の表示~~ … **trk233 で完了**（アプリが `licenseFile` を読む）。倉庫は 15 パックすべてで宣言済み
3. **書体のひとこと・字数をアプリが読む**（次の段）：`fonts[].note`／`fonts[].cmap` をアプリが読むようになったら、
   `check-contract` の ℹ が「読みました」に変わる（見直しどきの合図）
4. **`.stlib`（セットを1ファイルに）**（trk234/235）：アプリ側の実装に合わせて、この倉庫のセットを `.stlib` で出す
   （`sets/*.json` の `extension` を `stlib` にすれば、同じ道具で作れます）
5. 書体パックを増やす（`font-packs/<name>/` をコピーして `pack.json`・`SOURCE.json` を差し替え → `build-pack --fetch` → 表・`font-notes.json`・セットを更新）
6. **書体セット（14 種だけ）を別に配るか**：`sets/font-set.json`（相手側から届いた定義）を置けば同じ道具で作れます。
   いまは「はじめてセット（16 パック）」と中身が重なるので**置いていません**（必要になったら足す）
7. 全スキン入りビルドを Release に置く（README §5）
8. **Pages で見本を開けるか**（L6）は相談。決まったら `.github/workflows/pages.yml` を足す
9. 実機で見た結果を §4-1 に追記する（書体が当たるか・太さ・ライセンス全文・16 行の一覧）
