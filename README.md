# trk-Avatar-Library

**trk!（trk-PWA）の見た目を、手元に並べて、見て、選んで、持ち込むための倉庫**です。

> 名前の由来：VRChat の「VRC Avatar Library」——アバターを**手元のライブラリに並べて、検索して、タグで絞って、気に入りを選ぶ**という考え方。
> この倉庫は同じ考え方を trk! の**スキン・書体・パック**に当てはめたものです。
> （参考：`k0ta0uchi/VRCAvatarLibrary`＝ローカルのアバター管理・検索・タグ・使用履歴・`.vrcal` で持ち出し／BOOTH の AVATAR LIBRARY Manager＝グリッド表示・タグ・フォルダ登録）
> **配る側**（目録・見本・パックの置き場）がこのリポジトリ、**使う側**（棚・整理・インストール）が trk! 本体です。
> 開発の引き継ぎ（目録の契約・検査の走らせ方・未確認・PR 前チェック）は [`HANDOFF.md`](HANDOFF.md)。

---

## はじめての3手順

| | すること | 場所 |
| --- | --- | --- |
| ① | **見本を見る** — `gallery/all-skins.html` を落として開く（1ファイル・オフラインOK） | [`gallery/all-skins.html`](gallery/all-skins.html) |
| ② | **目録とパックを落とす** — `catalog/index.json` と、`packs/` か `font-packs/` の `.stpack`。<br>まとめて落とすなら [**はじめてセット**](https://github.com/TonbokiriRaikiriMuramasa-Taikoubou/trk-Avatar-Library/releases/tag/first-set-2026-11-01)（見本＋目録＋書体パックの1ファイル） | [`catalog/index.json`](catalog/index.json)／[`.stpack` の表](#2-2-目録とパックを落とす) |
| ③ | **trk! に入れる** — 設定 → 📦 カスタムパック → 📚 目録から入れる → **📥 まとめて入れる** で、目録とパックをまとめて選ぶ。<br>大きさと sha256 が合わないものは入りません | trk!（trk231 以降） |

## 1. いま入っているもの

| 場所 | 中身 |
| --- | --- |
| `gallery/all-skins.html` | **全スキン見本**（trk! の見た目のスキン **53 種**）。1ファイルで、ダブルクリックだけで開けます。外部からは何も読みません（オフラインOK） |
| `catalog/skins.json` | 上の見本のもとデータ（機械が読む用・53 種・書体 9 種） |
| `catalog/index.json` | **目録**。この倉庫で配るパックの一覧（名前・作者・版・sha256・バイト数・含まれる書体・ライセンス）。アプリ（trk230 以降）がそのまま読みます |
| `packs/` | 配る `.stpack`（trk! のカスタムパック）。いまは見本が1つ |
| `font-packs/` | 書体を同梱した `.stpack`。いまは **Zen Maru Gothic（400／700）入りの「丸ゴのお茶目」** が1つ（2.8 MB・2,935,978 B）。作り方は §4 |
| `tools/` | 見本の書き出し・パックの組み立て／検査・目録の作成・**目録がアプリの読み取り規則を通るかの検査**・パックの見本作り（Node だけ） |
| `sets/` | **はじめてセット**の定義（見本＋目録＋パックを1つのZIPにする）。作るのは `tools/build-set.mjs` |
| `release/` | 配ったセットの記録（ファイル名・大きさ・sha256） |
| `docs/` | 受け渡しメモ（2026-10-31）。開発の引き継ぎは [`HANDOFF.md`](HANDOFF.md) |
| `LICENSE` / `NOTICE.md` | GPL-3.0-or-later と、権利のまとめ |

## 2. 使い方（はじめての3手順の、くわしい版）

### 2-1. 見本を見る（①）

`gallery/all-skins.html` をダウンロードして開くだけです（ブラウザでダブルクリック）。
53 種を並べて、**名前・説明・カテゴリの言葉で絞り込み**、名前順・暗い順に並べ替えられます。
書体のスキンは、その端末にある書体で表示されます（無い書体は次の候補）。

> アプリを起動しなくても、「気になるスキンがあるかどうか」を先に確かめられます。
> 本物の見た目（背景・ノーツ・再生バーまで）は、trk! の 設定 → 🎨 見た目 → 🖼 スキンの棚 で。

### 2-2. 目録とパックを落とす（②）

**どのパックを落とすか**（いま配っているのは 2 つです）。

<!-- packs-table:start -->
| 名前 | ファイル | 大きさ | 何が変わるか | 書体 | ライセンス |
| --- | --- | --- | --- | --- | --- |
| 明朝の本（見本） | `packs/sample-mincho.stpack` | 690 B | 生成り×えんじの見た目（変わるのは色とノーツの色だけ。画像・音源は入っていません） | なし | パックの作り：GPL-3.0-or-later |
| 丸ゴのお茶目（書体パック） | `font-packs/maru-go.stpack` | 2.8 MB<br>（2,935,978 B） | 桃色の夜の見た目＋**丸ゴシック**（Zen Maru Gothic 400／700 を同梱。書体が効くのは trk232 以降） | Zen Maru Gothic 400／700（OFL-1.1） | パックの作り：GPL-3.0-or-later／書体：OFL-1.1 |
<!-- packs-table:end -->

- 表のとおり、**目録（`catalog/index.json`）と、使いたい `.stpack`** を落とします
- **まとめて落としたいとき**は [**はじめてセット**](https://github.com/TonbokiriRaikiriMuramasa-Taikoubou/trk-Avatar-Library/releases/tag/first-set-2026-11-01)（見本 HTML＋目録＋書体パックを1つのZIPにしたもの）を落として、**ZIP を展開**してください
- `catalog/index.json` の `sha256` と、落としたファイルのハッシュを比べれば、途中で壊れていないか確かめられます（アプリも入れる前に照合します）

### 2-3. trk! に入れる（③・trk231 以降）

1. trk! を開いて、**設定 → 📦 カスタムパック → 📚 目録から入れる**
2. **📥 まとめて入れる** を押し、**目録（`index.json`）と `.stpack` をまとめて選ぶ**（画面にまとめてドロップしても同じ）
3. 1件ずつ **大きさ → sha256** を照合して、合ったものだけが入ります。すでに入っているものは入れ直しません
4. 終わったら「入れた n件／入れられなかった n件／目録にない n件」と出ます。一覧の行の**「使う」**でその場で適用できます

- アプリは**外部へ取りに行きません**。目録も `.stpack` も、**選んだファイルだけ**を読みます（オフラインのまま使えます）
- 大きさが目録と違う／sha256 が合わないパックは**入りません**（途中で壊れた・別のファイルを防ぐため）
- trk230 の場合は「📚 目録（index.json）を選ぶ」→ 一覧の行ごとに「この .stpack を選ぶ」で入れます

### 2-4. 1つだけ入れる／目録とは

- **1つだけ入れる**：`packs/` か `font-packs/` の `.stpack` を落として、trk! の画面に**ドラッグ＆ドロップ**（または 設定 → 📦 カスタムパック → ファイルを選ぶ）
- **目録とは**：`catalog/index.json` は、**何が配られているか**を1か所で見られる一覧です。
  `format` / `version` / `name` / `packs[].name` / `packs[].file` / `packs[].sha256` / `packs[].bytes` /
  `packs[].fonts[]` / `packs[].license` / `packs[].description` / `packs[].url` / `packs[].colors`（一覧に出す2色・任意）を持ちます

形の取り決めは trk-PWA の [`docs/LIBRARY-TRK230-2026-10-31.md`](https://github.com/TonbokiriRaikiriMuramasa-Taikoubou/trk-PWA/blob/main/docs/LIBRARY-TRK230-2026-10-31.md) §3 が正本です。
この倉庫は、その形に合っているかを **アプリ自身の読み取り関数**で毎回確かめています（§3・§9）。

## 3. 作者向け：パックを置く

```
packs/
  my-skin.stpack        ← これが配布物（ZIP。中身は下の形）
font-packs/
  my-font.stpack        ← 書体を同梱するとき（§4）
```

`.stpack` は ZIP です。**いちばん上に `pack.json`** を置きます（trk! の仕様そのまま）。

```json
{
  "format": "shadow-taiko-pack",
  "version": 1,
  "name": "明朝の本（見本）",
  "author": "あなたの名前",
  "release": "1.0.0",
  "description": "どんな見た目かを1〜2行で",
  "license": "このパックの作りについて（例：CC0-1.0）",
  "url": "https://example.com/my-pack",
  "skin": {
    "name": "明朝の本",
    "colors": { "bg": "#f6f1e6", "panel": "#fffdf7", "text": "#241c14", "accent": "#8c2f39", "gold": "#a8762a" },
    "glow": false, "scanlines": false, "gradDir": "none",
    "font": "serif", "video": "mono", "mascot": "none"
  },
  "notes": {
    "don": { "color": "#8c2f39", "shape": "circle" },
    "ka":  { "color": "#2f5d7c", "shape": "diamond" }
  }
}
```

- 色は **`#rrggbb`**（3桁・名前付き色は不可）
- `font` はアプリのプリセット（`default` / `mono` / `rounded` / `serif`）だけ
- `release` は**配る版**（`1.0.0` など）。目録の `packs[].version` に入ります。省略すると `1.0.0`
- `url` は `https://` だけ。目録の `packs[].url` に入ります（アプリはリンクにせず、項目として持つだけ）
- 効果音・VRM・モーション・曲を入れるときは、`pack.json` から**相対パス**で指す（`../` と先頭 `/` は不可）
- **権利のある素材だけ**を入れてください（曲・画像・モデル）。`license` に書くのは「このパックの作り」についてで、同梱素材の権利は別です

#### フォルダから `.stpack` を組み立てる（書体パックなど、大きい素材を入れるとき）

`font-packs/maru-go/` のように、**フォルダを正**にして `.stpack` を作れます。
ZIP は trk-PWA の `js/zip-io.js`（アプリと同じ実装）で書き、**同じフォルダなら同じ sha256** になります（無圧縮で固定）。

```sh
node tools/build-pack.mjs font-packs/maru-go            # → font-packs/maru-go.stpack
node tools/build-pack.mjs font-packs/maru-go --check    # フォルダと .stpack が合っているかだけ見る（CI 向け）
node tools/build-pack.mjs font-packs/maru-go --fetch    # SOURCE.json の tarball から素材を取る（.cache/ に保存）
```

- `SOURCE.json` には、同梱素材の**出どころ（tarball の URL）と sha256** を書きます。このファイルはパックに入りません
- 手元に woff2 があるなら `--fetch` は要りません（フォルダに置けば、それが使われます）

置いたら、検査と目録の作り直しをします（Node 18 以降だけで動きます）。

```sh
node tools/verify-pack.mjs packs/my-skin.stpack     # 1つのパックを検査
node tools/build-catalog.mjs                        # 目録を作り直す（sha256・バイト数も更新）
node tools/build-catalog.mjs --check                # 目録が今の中身と合っているかだけ見る
node tools/check-contract.mjs                       # 目録が「アプリの読み取り規則」を通るか見る（trk-PWA が隣に要る）
node tools/preview-pack.mjs font-packs/maru-go.stpack  # 入れる前に見る見本 HTML（dist/preview/）
node tools/check-docs.mjs                           # README の表・リンク（見出しも）・セットの記録が今の中身と合っているか
node tools/selftest.mjs                             # 道具そのものが「ちゃんと断る」かを確かめる（14項目）
```

**パックを足したら、2か所も直します**（CI の `check-docs` が教えてくれます）。

1. README §2-2 の**表**（名前・ファイル・大きさ・何が変わるか・書体・ライセンス）
2. `sets/first-set.json` の `files` に入れるか決めて、`node tools/build-set.mjs sets/first-set.json --release` で作り直す

見本を作り直すときは（trk-PWA のチェックアウトが要ります）：

```sh
node tools/export-skin-gallery.mjs --trk=/path/to/trk-PWA
node tools/build-catalog.mjs --trk=/path/to/trk-PWA
```

`verify-pack.mjs` は trk! の `js/zip-io.js`（アプリと同じ ZIP の読み書き）を読み込んで使うので、
**アプリが読めないものは、ここでも不合格**になります。trk-PWA の場所は次の順で探します。

1. `--trk=/path/to/trk-PWA`
2. 環境変数 `TRK_PWA`
3. 既定＝このリポジトリの隣の `../trk-PWA`

## 4. 書体のパック（この倉庫の主役）

trk! は**実行時に外部から何も読みません**（CDN・外部APIなし）。だから書体は「Google Fonts を読む」のではなく、
**パックに入れて、端末の中に持ってくる**形にします。1書体あたり **woff2 で 0.9〜1.5 MB**（2026-10-31 実測）。

### 4-1. いま置いてあるもの

| ファイル | 中身 | 大きさ |
| --- | --- | --- |
| `font-packs/maru-go.stpack` | **丸ゴのお茶目（書体パック）**。Zen Maru Gothic 400／700 の woff2、`OFL.txt`、`NOTICE.md`、桃色の夜のスキン | 2,935,978 B（2.8 MB） |
| `font-packs/maru-go/` | 上の**もと**（`pack.json`・`SOURCE.json`・`fonts/OFL.txt`）。woff2 は `--fetch` で取ります | — |

`pack.json` はこうなっています（抜粋）。

```json
{
  "format": "shadow-taiko-pack", "version": 1,
  "name": "丸ゴのお茶目（書体パック）", "release": "1.0.0",
  "license": "GPL-3.0-or-later（このパックの作り）",
  "fonts": [
    { "family": "TrkZenMaru", "file": "fonts/ZenMaruGothic-Regular.woff2", "weight": 400, "license": "OFL-1.1" },
    { "family": "TrkZenMaru", "file": "fonts/ZenMaruGothic-Bold.woff2",    "weight": 700, "license": "OFL-1.1" }
  ],
  "skin": { "name": "丸ゴのお茶目", "colors": { "bg": "#241a2a", "panel": "#3a2843", "text": "#fdf2f8", "accent": "#ffb3d2", "gold": "#ffe27a" } }
}
```

作る・確かめる・見る：

```sh
node tools/build-pack.mjs font-packs/maru-go --fetch   # woff2 を取り、.stpack を組み立てる
node tools/build-pack.mjs font-packs/maru-go --check   # フォルダと .stpack が合っているか
node tools/verify-pack.mjs font-packs/maru-go.stpack   # アプリが読める形か
node tools/preview-pack.mjs font-packs/maru-go.stpack  # 色と書体の見本 HTML（dist/preview/）
```

### 4-2. 同梱するときの約束（`tools/verify-pack.mjs` が見ます）

| 約束 | 理由 |
| --- | --- |
| **woff2 だけ** | 配る形を1つに決める（サイズ・対応ブラウザ） |
| `family` は英数字と空白・`. _ -` の 40 文字まで | アプリが `@font-face` を組み立てる名前（日本語の family は受け付けません） |
| `file` は woff2 の相対パス（`..`・先頭 `/` は不可） | パックの外を指させない |
| `license` がある（OFL なら `OFL-1.1`） | 同梱した書体の権利を、配布物の中で明示する |
| **`OFL.txt` などをパックに入れる** | OFL は「ライセンス全文の同梱」が条件。**入れていないと不合格**にしています |
| `weight` は 100〜900 の整数 | アプリが `FontFace` の weight に使う |
| 1パック 500 MB まで | trk! のパックの上限（アプリ側の制限と同じ） |

### 4-3. アプリ側の対応（次の版・まだ読まない）

いまの trk!（trk230）は、パックの `fonts` を**目録に「書体n」と出すだけ**で、中身は使いません。
それでも、この書体パックは **trk230 にそのまま入れられます**（スキンの色とノーツの色が使われ、書体だけがまだ使われない、という状態です）。
アプリ側で必要な作業は trk-PWA の [`docs/LIBRARY-TRK230-2026-10-31.md`](https://github.com/TonbokiriRaikiriMuramasa-Taikoubou/trk-PWA/blob/main/docs/LIBRARY-TRK230-2026-10-31.md) §5 に整理してあります
（`FontFace` で登録 → `--font` の先頭に足す → パックを外したら片付ける）。

それまでの書体スキンは、`js/data.js` の `SKINS[].font` に**端末の書体名**を書く形で 9 種を配っています（trk228）。
この倉庫のパックは、**アプリが対応した日にそのまま使える形**で先に用意してあります。

## 5. これから（検討中）

| 案 | 中身 | 状態 |
| --- | --- | --- |
| 書体パックの読み込み（trk! 側） | `pack.json` の `fonts` を `FontFace`（`new FontFace(family, url(blob))`）で登録し、`--font` に足す。パックを外したら登録も外す | 設計だけ（**倉庫側は実物あり**・§4） |
| 目録からの取り込み | `catalog/index.json` を**ファイルとして選ぶ**と、一覧（名前・サイズ・書体・ライセンス）を出し、選んだ `.stpack` を入れる。**URL を自動で取りに行かない**（オフライン優先の方針を守る） | **trk! trk230 で実装済み**（2026-10-31）。この倉庫は目録の形をそれに合わせ、`tools/check-contract.mjs` で毎回確かめています |
| はじめてセット（ZIP 1つ） | 見本＋目録＋書体パックを1つに。アプリの「📥 まとめて入れる」でそのまま選べる | **できました**（[Release `first-set-2026-11-01`](https://github.com/TonbokiriRaikiriMuramasa-Taikoubou/trk-Avatar-Library/releases/tag/first-set-2026-11-01)・2,993,307 B） |
| `.stlib`（セットを1ファイルに） | アプリ（trk234）が `.stlib` を読めるようになったら、同じ定義から `.stlib` で配る | 定義は流用できます（`sets/first-set.json` の `extension`）／アプリ待ち |
| 全スキン入りビルド | 「全部入れて、見比べたい」人向けに、53 種＋書体パックを入れた trk! をこの倉庫の Release に置く | 未着手（見本 HTML で代替中） |
| GitHub Pages で見本を開く | `gallery/all-skins.html` を Pages で開けるようにすると導線は最も楽。ただし**アプリのオリジンが増える**ので、CSP・Service Worker・共有の扱いをアプリ側と一緒に確認してから | 相談中（2026-11-01 の相手側からのお願い L6） |
| 大きいファイルの置き場 | Git の1ファイル 100 MB 制限を避けるため、**1 パック 50 MB までを Git、それ以上は Release／Drive** | 方針だけ |

## 6. 容量の方針

- **Git に入れる**：パック（数十 MB まで）・見本 HTML・目録・ツール
- **Release か Drive に置く**：書体をたくさん束ねた大きな ZIP、全スキン入りビルド
- 目録には必ず `sha256` と `bytes` を書く（落とした人が確かめられるように）
- いまのいちばん大きいもの：`font-packs/maru-go.stpack` の **2.8 MB**（2,935,978 B・woff2 2 本）。書体を 10 本束ねても 15 MB 程度なので、1 パックなら Git のままで足ります

## 7. ライセンスとクレジット

- この倉庫のツールと文書：**GPL-3.0-or-later**（trk-PWA と同じ）。クレジットとソースは保持してください
- 各パック：`pack.json` の `license` を見てください（パックごとに違います）
- 同梱した書体：**OFL などの全文**をパックの中に入れ、`NOTICE.md` にも追記します
  - `font-packs/maru-go.stpack` は **Zen Maru Gothic**（Copyright 2021 The Zen Maru Gothic Project Authors / OFL-1.1）を同梱しています。
    全文はパックの中の `fonts/OFL.txt`、クレジットは `NOTICE.md`（パックの中と `font-packs/maru-go/NOTICE.md`）にあります

詳しくは [`NOTICE.md`](NOTICE.md)。

## 8. 確かめたこと・確かめていないこと（2026-10-31・2026-11-01 追記）

| 項目 | 結果 |
| --- | --- |
| `tools/export-skin-gallery.mjs` | trk-PWA（main・b79fa3c／trk230）の `js/data.js` + `js/characters/miku.js` から **53 種（書体 9 種）**。いまの `catalog/skins.json` と**中身が一致**（生成し直しても同じ） |
| 見本 HTML の外部参照 | **0 件**（`https?://` を含まない。フォントも画像も外部から読まない） |
| `tools/verify-pack.mjs` | 見本パックと書体パックの 2 件で合格。**壊れた ZIP・pack.json なし・色の形式違い・指すファイルの欠落・`..` のパス・日本語の family・OFL.txt なし・release の形違い**で、それぞれ不合格になることを確認 |
| `tools/build-pack.mjs` | `font-packs/maru-go` から **2,935,978 B** の `.stpack` を生成（5 ファイル・無圧縮で決定的）。`--check` でフォルダと一致することを確認 |
| `tools/build-catalog.mjs` | 目録を作り直し、**2 パック**（`version`・`url`・`fonts[].weight` つき）。`--check` も一致 |
| `tools/check-contract.mjs` | trk-PWA の **`js/pack-catalog.js` をそのまま読み込み**、目録 2 件が `sanitizeCatalog` を**1 件も落とされずに**通ることを確認（`name`/`file`/`sha256`/`bytes`/`fonts`/`license`/`description`/`url` が書いたとおりに残る） |
| `tools/selftest.mjs` | **14 / 14 合格**（書体のパス・family・OFL.txt・release の検査を追加） |
| `tools/preview-pack.mjs` | 書体パックから **1 ファイルの見本 HTML**（3.9 MB・woff2 2 本を base64 で埋め込み・外部参照 0）を生成 |
| `tools/build-set.mjs` | **はじめてセット**（ZIP 1つ）を生成。2 回作っても同じ sha256（`b9599930…`・**2,993,307 B**・4 ファイル）。中身のファイル名は UTF-8 |
| `tools/check-docs.mjs` | README の表と目録が一致・内部リンク 10 本（うち見出し `#…` 1 本）が実在・セットの記録と実物の sha256 が一致。**わざとずらすと落ちる**ことも確認（見出しリンクの規則は、GitHub が実際に付けた 20 個の id と一致することを確かめました） |
| `tools/check-contract.mjs`（2026-11-01 追記） | 目録の `colors` を足しても、アプリ（trk231・`9bf22d7`）が 2 パックとも落とさずに読むことを確認。読んだ相手側の版も表示 |
| 実機・実ブラウザでの見え方 | **未確認**（作業環境にブラウザも端末もない）。見本 HTML の並び、書体パックの見え方、パックを入れたときの棚は、端末で見てください |
| 書体のパック | **アプリ（trk230）はまだ読みません**（§4-3）。パックの形・OFL の同梱・目録の `fonts[]` までは用意済み |

## 9. 自動検査（GitHub Actions）

`.github/workflows/check.yml` が、push と Pull Request のたびに次を走らせます（trk-PWA をとなりのフォルダに取ってきます）。

```sh
node tools/selftest.mjs              # 14 / 14
node tools/build-catalog.mjs --check # 目録が最新か
node tools/check-contract.mjs        # 目録がアプリの読み取り規則を通るか（相手側の版も表示）
node tools/build-pack.mjs font-packs/maru-go --check --fetch  # 書体パックがフォルダと一致するか
node tools/build-set.mjs sets/first-set.json --check          # はじめてセットが記録と一致するか
node tools/check-docs.mjs            # README の表・リンク・セットの記録
```

- 相手側（trk-PWA）は **`TRK_PWA_REF` で版を固定**して取ってきます（trk231 = `9bf22d7a…`）。
  上げるときは `.github/workflows/check.yml` の `env` の1行を変えます
- 週に1回（日曜 21:00 UTC）、**固定しない `main`** でも同じ契約検査を回します（`upstream-main`）。
  相手側が先に進んでも、こちらが静かに壊れないようにするためです
