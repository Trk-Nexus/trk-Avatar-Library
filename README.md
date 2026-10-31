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
| ② | **目録とパックを落とす** — `catalog/index.json` と、`packs/` か `font-packs/` の `.stpack`（いま 16 個）。<br>まとめて落とすなら [**はじめてセット**](https://github.com/TonbokiriRaikiriMuramasa-Taikoubou/trk-Avatar-Library/releases/tag/first-set-2026-11-01-r3)（見本＋目録＋16 パックの1ファイル・約 29.4 MB） | [`catalog/index.json`](catalog/index.json)／[`.stpack` の表](#2-2-目録とパックを落とす) |
| ③ | **trk! に入れる** — 設定 → 📦 カスタムパック → 📚 目録から入れる → **📥 まとめて入れる** で、目録とパックをまとめて選ぶ。<br>大きさと sha256 が合わないものは入りません | trk!（trk231 以降） |

## 1. いま入っているもの

| 場所 | 中身 |
| --- | --- |
| `gallery/all-skins.html` | **全スキン見本**（trk! の見た目のスキン **53 種**）。1ファイルで、ダブルクリックだけで開けます。外部からは何も読みません（オフラインOK） |
| `catalog/skins.json` | 上の見本のもとデータ（機械が読む用・53 種・書体 9 種） |
| `catalog/index.json` | **目録**。この倉庫で配るパックの一覧（名前・作者・版・sha256・バイト数・含まれる書体・ライセンス）。アプリ（trk230 以降）がそのまま読みます |
| `catalog/font-notes.json` | 書体の**ひとこと**（「どんな雰囲気か」の1行・60 文字まで）。目録の `fonts[].note` に入ります（L10）。パックの中身は変えません |
| `packs/` | 配る `.stpack`（trk! のカスタムパック）。いまは見本が1つ |
| `font-packs/` | 書体を同梱した `.stpack` が **15 個**（14 種の日本語書体＋「丸ゴのお茶目」）。合計 **29.3 MB**（30,697,343 B）・20 ウェイト。一覧は §2-2、作り方は §4 |
| `tools/` | 見本の書き出し・パックの組み立て／検査・目録の作成・**目録がアプリの読み取り規則を通るかの検査**・パックの見本作り（Node だけ） |
| `sets/` | **はじめてセット**の定義（見本＋目録＋16 パックを1つのZIPにする）。作るのは `tools/build-set.mjs` |
| `release/` | 配ったセットの記録（ファイル名・大きさ・sha256）。いまの記録（**r3**）と、過去の記録（r1 の `first-set-2026-11-01.json`。r2 の経緯は `release/README.md`） |
| `docs/` | 受け渡しメモ（2026-10-31）。開発の引き継ぎは [`HANDOFF.md`](HANDOFF.md) |
| `LICENSE` / `NOTICE.md` | GPL-3.0-or-later と、権利のまとめ |

## 2. 使い方（はじめての3手順の、くわしい版）

### 2-1. 見本を見る（①）

`gallery/all-skins.html` をダウンロードして開くだけです（ブラウザでダブルクリック）。
53 種を並べて、**名前・説明・カテゴリの言葉で絞り込み**、名前順・暗い順に並べ替えられます。
書体のスキンは、その端末にある書体で表示されます（無い書体は次の候補）。

上のほうに **「🔤 同梱の書体」** の節があります。書体パックに入っている書体の**名前**と**ひとこと**（雰囲気の一行）を
並べたもので、ここでも書体ファイルは読みません（@font-face なし）。端末に同じ家族名の書体が入っているときだけ、その書体で出ます。
ひとことは目録の `fonts[].note` と同じ出どころ（`catalog/font-notes.json`）です。
書体そのものは `.stpack` の中にあり、trk! に入れて「使う」と本文に効きます（trk232 以降）。

> アプリを起動しなくても、「気になるスキンがあるかどうか」を先に確かめられます。
> 本物の見た目（背景・ノーツ・再生バーまで）は、trk! の 設定 → 🎨 見た目 → 🖼 スキンの棚 で。

### 2-2. 目録とパックを落とす（②）

**どのパックを落とすか**（いま配っているのは **16 個**：見本 1＋書体パック 15）。

- 書体パックは、どれも **日本語の書体（woff2）＋`fonts/OFL.txt`（ライセンス全文）＋スキン**の組です。入れて「使う」で本文の書体が変わります（trk232 以降）
- 全部まとめてほしいときは、下の表のファイルを1つずつではなく **はじめてセット** を落としてください（16 個入り・約 29.4 MB）

<!-- packs-table:start -->
| 名前 | ファイル | 大きさ | 何が変わるか | 書体 | ライセンス |
| --- | --- | --- | --- | --- | --- |
| 明朝の本（見本） | `packs/sample-mincho.stpack` | 690 B<br>（690 B） | 生成り×えんじの見た目（変わるのは色とノーツの色だけ。画像・音源は入っていません） | なし | パックの作り：GPL-3.0-or-later（release 1.0.0） |
| 極太ポスター（書体パック） | `font-packs/dela-gothic.stpack` | 929.2 KB<br>（951,499 B） | 黒地に赤と黄のポスター風＋**極太** | Dela Gothic One 400<br>`TrkDelaGothic` | パックの作り：GPL-3.0-or-later／書体：OFL-1.1（release 1.0.0） |
| ドットの電子音（書体パック） | `font-packs/dotgothic.stpack` | 394.0 KB<br>（403,458 B） | 走査線つき電子基板の見た目＋**ドット文字** | DotGothic16 400<br>`TrkDotGothic` | パックの作り：GPL-3.0-or-later／書体：OFL-1.1（release 1.0.0） |
| まるぽっぷ いちご（書体パック） | `font-packs/hachi-maru-pop.stpack` | 1.9 MB<br>（1,973,189 B） | いちごミルク色の見た目＋**まる文字** | Hachi Maru Pop 400<br>`TrkHachiMaru` | パックの作り：GPL-3.0-or-later／書体：OFL-1.1（release 1.0.0） |
| 飾り明朝のラベンダー（書体パック） | `font-packs/kaisei-decol.stpack` | 3.2 MB<br>（3,399,530 B） | ラベンダーの明るい見た目＋**飾り明朝** | Kaisei Decol 400／700<br>`TrkKaiseiDecol` | パックの作り：GPL-3.0-or-later／書体：OFL-1.1（release 1.0.0） |
| 筆ペンの手紙（書体パック） | `font-packs/klee-one.stpack` | 3.7 MB<br>（3,929,934 B） | 和紙の手ざわりの見た目＋**手書き風** | Klee One 400／600<br>`TrkKleeOne` | パックの作り：GPL-3.0-or-later／書体：OFL-1.1（release 1.0.0） |
| まるゴのミルクティー（書体パック） | `font-packs/m-plus-rounded.stpack` | 1.8 MB<br>（1,902,101 B） | ミルクティー色の見た目＋**丸ゴシック** | M PLUS Rounded 1c 400／700<br>`TrkMPlusRounded` | パックの作り：GPL-3.0-or-later／書体：OFL-1.1（release 1.0.0） |
| 丸ゴのお茶目（書体パック） | `font-packs/maru-go.stpack` | 2.8 MB<br>（2,936,399 B） | 桃色の夜の見た目＋**丸ゴシック** | Zen Maru Gothic 400／700<br>`TrkZenMaru` | パックの作り：GPL-3.0-or-later／書体：OFL-1.1（release 1.1.0） |
| もちもちポップ（書体パック） | `font-packs/mochiy-pop.stpack` | 976.3 KB<br>（999,719 B） | 夜紫に桃色の見た目＋**まるい太字ポップ** | Mochiy Pop One 400<br>`TrkMochiyPop` | パックの作り：GPL-3.0-or-later／書体：OFL-1.1（release 1.0.0） |
| 看板のポップ（書体パック） | `font-packs/potta-one.stpack` | 1.9 MB<br>（2,020,608 B） | 深い青緑に黄色の見た目＋**看板風ポップ** | Potta One 400<br>`TrkPottaOne` | パックの作り：GPL-3.0-or-later／書体：OFL-1.1（release 1.0.0） |
| ラインのネオン（書体パック） | `font-packs/rampart-one.stpack` | 1.5 MB<br>（1,577,304 B） | 紫と水色のネオンの見た目＋**袋文字** | Rampart One 400<br>`TrkRampart` | パックの作り：GPL-3.0-or-later／書体：OFL-1.1（release 1.0.0） |
| ロックの夜（書体パック） | `font-packs/rocknroll-one.stpack` | 958.6 KB<br>（981,561 B） | 焚き火のような暖色の見た目＋**手書きロック風** | RocknRoll One 400<br>`TrkRocknRoll` | パックの作り：GPL-3.0-or-later／書体：OFL-1.1（release 1.0.0） |
| 墨と金の明朝（書体パック） | `font-packs/shippori-mincho.stpack` | 2.7 MB<br>（2,850,282 B） | 墨と金の落ち着いた見た目＋**明朝** | Shippori Mincho 400／700<br>`TrkShipporiMincho` | パックの作り：GPL-3.0-or-later／書体：OFL-1.1（release 1.0.0） |
| 筆ポップの夜祭（書体パック） | `font-packs/yusei-magic.stpack` | 881.8 KB<br>（902,975 B） | 提灯と屋台の夜の見た目＋**筆文字ポップ** | Yusei Magic 400<br>`TrkYuseiMagic` | パックの作り：GPL-3.0-or-later／書体：OFL-1.1（release 1.0.0） |
| 角ゴのしらゆき（書体パック） | `font-packs/zen-kaku.stpack` | 1.9 MB<br>（1,969,655 B） | 夜の白銀の見た目＋**角ゴシック** | Zen Kaku Gothic New 400／700<br>`TrkZenKaku` | パックの作り：GPL-3.0-or-later／書体：OFL-1.1（release 1.0.0） |
| 古明朝の藍（書体パック） | `font-packs/zen-old-mincho.stpack` | 3.7 MB<br>（3,899,129 B） | 藍色の静かな見た目＋**古風な明朝** | Zen Old Mincho 400／700<br>`TrkZenOldMincho` | パックの作り：GPL-3.0-or-later／書体：OFL-1.1（release 1.0.0） |
<!-- packs-table:end -->

- 表のとおり、**目録（`catalog/index.json`）と、使いたい `.stpack`** を落とします
- **まとめて落としたいとき**は [**はじめてセット**](https://github.com/TonbokiriRaikiriMuramasa-Taikoubou/trk-Avatar-Library/releases/tag/first-set-2026-11-01-r3)（見本 HTML＋目録＋16 パックを1つのZIPにしたもの・`release/first-set.json` に sha256）を落として、**ZIP を展開**してください
- `catalog/index.json` の `sha256` と、落としたファイルのハッシュを比べれば、途中で壊れていないか確かめられます（アプリも入れる前に照合します）

### 2-3. trk! に入れる（③・trk231 以降）

1. trk! を開いて、**設定 → 📦 カスタムパック → 📚 目録から入れる**
2. **📥 まとめて入れる** を押し、**目録（`index.json`）と `.stpack` をまとめて選ぶ**（画面にまとめてドロップしても同じ）
3. 1件ずつ **大きさ → sha256** を照合して、合ったものだけが入ります。すでに入っているものは入れ直しません
4. 終わったら「入れた n件／入れられなかった n件／目録にない n件」と出ます。一覧の行の**「使う」**でその場で適用できます

- アプリは**外部へ取りに行きません**。目録も `.stpack` も、**選んだファイルだけ**を読みます（オフラインのまま使えます）
- 大きさが目録と違う／sha256 が合わないパックは**入りません**（途中で壊れた・別のファイルを防ぐため）
- trk232 以降は、書体パックの行の**「使う」**で**本文の書体**も変わります（外すと元に戻ります）
- 目録の `version` と入っているパックの `release` が違うと、一覧に **「更新あり（1.0.0 → 1.1.0）」** が出ます
  （入れ替えは、新しい `.stpack` を選んだときだけ）
- trk230 の場合は「📚 目録（index.json）を選ぶ」→ 一覧の行ごとに「この .stpack を選ぶ」で入れます

### 2-4. 1つだけ入れる／目録とは

- **1つだけ入れる**：`packs/` か `font-packs/` の `.stpack` を落として、trk! の画面に**ドラッグ＆ドロップ**（または 設定 → 📦 カスタムパック → ファイルを選ぶ）
- **目録とは**：`catalog/index.json` は、**何が配られているか**を1か所で見られる一覧です。
  `format` / `version` / `name` / `packs[].name` / `packs[].file` / `packs[].sha256` / `packs[].bytes` /
  `packs[].fonts[]`（`family`・`file`・`license`・任意の `weight`／`licenseFile`／`note`／`cmap`） / `packs[].license` / `packs[].description` /
  `packs[].url` / `packs[].colors`（一覧に出す2色・任意）を持ちます。
  `note` は「どんな雰囲気の書体か」の一行（60 文字まで）、`cmap` はその書体が対応する字数です（どちらも任意。
  trk233 のアプリはまだ読みませんが、載せておいても落とされません）
- **`version` は `pack.json` の `release` と同じ**にします（アプリはこの2つを比べて「更新あり（1.0.0 → 1.1.0）」を出します）。
  `tools/build-catalog.mjs --check` が、ずれていたら止めます（L8）

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
node tools/check-fonts.mjs                          # パックの書体（woff2）が本当に読める形か・見本の字が入っているか
node tools/selftest.mjs                             # 道具そのものが「ちゃんと断る」かを確かめる（22項目）
```

**パックを足したら、3か所を直します**（CI の `check-docs` と `build-catalog` が教えてくれます）。

1. README §2-2 の**表**（名前・ファイル・大きさ・何が変わるか・書体・ライセンス）
2. `sets/first-set.json` の `files` に入れるか決めて、`node tools/build-set.mjs sets/first-set.json --release` で作り直す
3. 書体パックなら `catalog/font-notes.json` に**ひとこと**（60 文字まで）を足す。書き間違い（長すぎる・パックにない書体）は
   `node tools/build-catalog.mjs` が止めます

見本を作り直すときは（trk-PWA のチェックアウトが要ります）：

```sh
node tools/export-skin-gallery.mjs --trk=/path/to/trk-PWA
node tools/export-skin-gallery.mjs --trk=/path/to/trk-PWA --check   # いまの見本と合っているかだけ見る（CI 向け）
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

**書体パックは 15 個**あります（14 種の日本語書体＋「丸ゴのお茶目」）。どれも
**woff2＋`fonts/OFL.txt`（ライセンス全文）＋スキン（色とノーツの色）** の組で、入れて「使う」と本文の書体が変わります。

| 種類 | 中身 |
| --- | --- |
| `font-packs/<slug>.stpack` | 配るパック（`pack.json`・woff2・`OFL.txt`・`NOTICE.md` の 4〜5 ファイル） |
| `font-packs/<slug>/` | 上の**もと**（`pack.json`・`SOURCE.json`・`NOTICE.md`・`fonts/OFL.txt`）。woff2 は `--fetch` で取ります |

一覧（大きさ・書体・ライセンス）は §2-2 の表です。合計 **29.3 MB**・20 ウェイト。
**パックは trk-PWA 側から届いたものをそのまま置いています**（`pack.json` を書き換えないので、向こうで作った `.stpack` と
バイト単位で同じものになります）。ひとこと（`note`）だけは、パックの外の `catalog/font-notes.json` に書きます。

`pack.json` はこうなっています（抜粋）。

```json
{
  "format": "shadow-taiko-pack", "version": 1,
  "name": "丸ゴのお茶目（書体パック）", "release": "1.1.0",
  "license": "GPL-3.0-or-later（このパックの作り）",
  "fonts": [
    { "family": "TrkZenMaru", "file": "fonts/ZenMaruGothic-Regular.woff2", "weight": 400, "license": "OFL-1.1", "licenseFile": "fonts/OFL.txt" },
    { "family": "TrkZenMaru", "file": "fonts/ZenMaruGothic-Bold.woff2",    "weight": 700, "license": "OFL-1.1", "licenseFile": "fonts/OFL.txt" }
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
node tools/check-fonts.mjs                             # woff2 の中身（表・cmap・見本の字）まで見る
```

### 4-2. 同梱するときの約束（`tools/verify-pack.mjs` が見ます）

| 約束 | 理由 |
| --- | --- |
| **woff2 だけ** | 配る形を1つに決める（サイズ・対応ブラウザ） |
| `family` は英数字と空白・`. _ -` の 40 文字まで | アプリが `@font-face` を組み立てる名前（日本語の family は受け付けません） |
| `file` は woff2 の相対パス（`..`・先頭 `/` は不可） | パックの外を指させない |
| `license` がある（OFL なら `OFL-1.1`） | 同梱した書体の権利を、配布物の中で明示する |
| `licenseFile`（任意）は `.txt`／`.md` のパック内パス | ライセンス全文をアプリに持たせる（trk233 以降で表示）。無くても合格ですが、書いておくと全文が目録に載ります |
| **`OFL.txt` などをパックに入れる** | OFL は「ライセンス全文の同梱」が条件。**入れていないと不合格**にしています |
| `weight` は 100〜900 の整数 | アプリが `FontFace` の weight に使う |
| `note`（任意・目録のみ）は 60 文字まで | 「どんな雰囲気か」の一行。`catalog/font-notes.json` から足します（パックには入れません） |
| `cmap`（任意・目録のみ）は正の整数 | その書体が対応する字数。`build-catalog` が woff2 の cmap を数えて入れます |
| 1パック 500 MB まで | trk! のパックの上限（アプリ側の制限と同じ） |

### 4-3. アプリ側の対応（trk232 から本当に効きます）

**trk! trk232（2026-11-01）で、書体パックが本物になりました。** パックを入れて「使う」と、
同梱の書体が `FontFace` で読み込まれ、本文の書体（`--font`）の先頭に入ります。外す・消すと元に戻ります。

- アプリが受け付ける形：`family`（英数字と空白・`. _ -` の 40 文字）・`file`（woff2／woff）・`license`・任意の `weight`（100〜900）と `style`
- 1書体 16 MB・1パック 8書体まで。**この倉庫の検査（`verify-pack`）を通ったパックは、そのままアプリでも通ります**
- `release` と目録の `version` が違うと、一覧に **「更新あり（1.0.0 → 1.1.0）」** が出ます

trk233 で、`licenseFile`（ライセンス全文）をアプリが読むようになりました。パック一覧の「🔤 同梱の書体」の中の
**「📄 ライセンス全文を読む」** を押すと、パックの中の `fonts/OFL.txt` の全文が読めます（押したときだけ読みます）。
目録の `fonts[].note`／`cmap`（雰囲気の一行・対応する字数）は、まだアプリは読みません（次の段で使う予定）。

書体スキン（`js/data.js` の `SKINS[].font` に端末の書体名を書く形・9 種）は、これまでどおりそのまま使えます。

## 5. これから（検討中）

| 案 | 中身 | 状態 |
| --- | --- | --- |
| 書体パックの読み込み（trk! 側） | `pack.json` の `fonts` を `FontFace` で登録し、`--font` に足す。パックを外したら登録も外す | **trk! trk232（2026-11-01）で実装済み**。この倉庫の書体パックがそのまま効きます（§4-3） |
| 目録からの取り込み | `catalog/index.json` を**ファイルとして選ぶ**と、一覧（名前・サイズ・書体・ライセンス）を出し、選んだ `.stpack` を入れる。**URL を自動で取りに行かない**（オフライン優先の方針を守る） | **trk! trk230 で実装済み**（2026-10-31）。この倉庫は目録の形をそれに合わせ、`tools/check-contract.mjs` で毎回確かめています |
| はじめてセット（ZIP 1つ） | 見本＋目録＋書体パックを1つに。アプリの「📥 まとめて入れる」でそのまま選べる | **できました**（[Release `first-set-2026-11-01-r2`](https://github.com/TonbokiriRaikiriMuramasa-Taikoubou/trk-Avatar-Library/releases/tag/first-set-2026-11-01-r2)・2,996,422 B・書体パック release 1.1.0） |
| ライセンス全文をアプリで見る | 目録の `fonts[].licenseFile` を読み、アプリ内で全文を表示する | **trk! trk233 で実装済み**（パック一覧の「📄 ライセンス全文を読む」）。倉庫は 15 パックすべてで宣言済み |
| 書体のひとこと・対応する字数 | 目録の `fonts[].note`（雰囲気の一行）と `fonts[].cmap`（字数）を、アプリの 🔎 中身に出す | **倉庫側は用意済み**（L10・L11）。アプリは次の段で読む予定 |
| `.stlib`（セットを1ファイルに） | アプリ（trk234）が `.stlib` を読めるようになったら、同じ定義から `.stlib` で配る | 定義は流用できます（`sets/first-set.json` の `extension`）／アプリ待ち |
| 全スキン入りビルド | 「全部入れて、見比べたい」人向けに、53 種＋書体パックを入れた trk! をこの倉庫の Release に置く | 未着手（見本 HTML で代替中） |
| GitHub Pages で見本を開く | `gallery/all-skins.html` を Pages で開けるようにすると導線は最も楽。ただし**アプリのオリジンが増える**ので、CSP・Service Worker・共有の扱いをアプリ側と一緒に確認してから | 相談中（2026-11-01 の相手側からのお願い L6） |
| 大きいファイルの置き場 | Git の1ファイル 100 MB 制限を避けるため、**1 パック 50 MB までを Git、それ以上は Release／Drive** | 方針だけ |

## 6. 容量の方針

- **Git に入れる**：パック（数十 MB まで）・見本 HTML・目録・ツール
- **Release か Drive に置く**：書体をたくさん束ねた大きな ZIP、全スキン入りビルド
- 目録には必ず `sha256` と `bytes` を書く（落とした人が確かめられるように）
- いまのいちばん大きいもの：`font-packs/klee-one.stpack` の **3.7 MB**（3,929,934 B・woff2 2 本）。
  書体パック 15 個で **29.3 MB**（30,697,343 B）。1 パック 50 MB の枠に余裕があり、Git のままで足ります
- はじめてセット（16 パック入り）は **約 29.4 MB**。Release に置くので、Git には入れません（`dist/` は gitignore）

## 7. ライセンスとクレジット

- この倉庫のツールと文書：**GPL-3.0-or-later**（trk-PWA と同じ）。クレジットとソースは保持してください
- 各パック：`pack.json` の `license` を見てください（パックごとに違います）
- 同梱した書体：**OFL などの全文**をパックの中に入れ、`NOTICE.md` にも追記します
  - `font-packs/` の 15 パックは、いずれも **SIL Open Font License 1.1** の日本語書体を1〜2 ウェイト同梱しています。
    全文は**パックの中の `fonts/OFL.txt`**（＝`fonts[].licenseFile`）、クレジットは各パックの `NOTICE.md`
    （パックの中と `font-packs/<slug>/NOTICE.md`）にあります。書体そのものの名前は変えていません
    （`Trk…` はアプリの中で使う家族名です）

| 書体（同梱） | 出どころ（npm・版を固定） |
| --- | --- |
| Zen Maru Gothic | `@fontsource/zen-maru-gothic@5.3.1` |
| Zen Kaku Gothic New | `@fontsource/zen-kaku-gothic-new@5.3.1` |
| Zen Old Mincho | `@fontsource/zen-old-mincho@5.3.1` |
| M PLUS Rounded 1c | `@fontsource/m-plus-rounded-1c@5.3.0` |
| Klee One | `@fontsource/klee-one@5.3.1` |
| Yusei Magic | `@fontsource/yusei-magic@5.3.0` |
| Hachi Maru Pop | `@fontsource/hachi-maru-pop@5.3.0` |
| DotGothic16 | `@fontsource/dotgothic16@5.3.1` |
| Shippori Mincho | `@fontsource/shippori-mincho@5.3.0` |
| Dela Gothic One | `@fontsource/dela-gothic-one@5.3.0` |
| Rampart One | `@fontsource/rampart-one@5.3.1` |
| RocknRoll One | `@fontsource/rocknroll-one@5.3.1` |
| Potta One | `@fontsource/potta-one@5.3.0` |
| Kaisei Decol | `@fontsource/kaisei-decol@5.3.1` |
| Mochiy Pop One | `@fontsource/mochiy-pop-one@5.3.0` |

  それぞれの著作権表示・入手元・tarball・sha256 は、`font-packs/<slug>/SOURCE.json` と `NOTICE.md` にあります

詳しくは [`NOTICE.md`](NOTICE.md)。

## 8. 確かめたこと・確かめていないこと（2026-10-31・2026-11-01 追記）

| 項目 | 結果 |
| --- | --- |
| `tools/export-skin-gallery.mjs` | trk-PWA（main・b79fa3c／trk230）の `js/data.js` + `js/characters/miku.js` から **53 種（書体 9 種）**。いまの `catalog/skins.json` と**中身が一致**（生成し直しても同じ） |
| 見本 HTML の外部参照 | **0 件**（`https?://` を含まない。フォントも画像も外部から読まない） |
| `tools/verify-pack.mjs` | 見本パックと書体パックの 2 件で合格。**壊れた ZIP・pack.json なし・色の形式違い・指すファイルの欠落・`..` のパス・日本語の family・OFL.txt なし・release の形違い**で、それぞれ不合格になることを確認 |
| `tools/build-pack.mjs` | `font-packs/maru-go` から **2,936,399 B** の `.stpack` を生成（5 ファイル・無圧縮で決定的）。`--check` でフォルダと一致することを確認 |
| `tools/build-catalog.mjs` | 目録を作り直し、**16 パック**（`version`・`url`・`fonts[].weight`・`note`・`cmap` つき）。`--check` も一致 |
| `tools/check-contract.mjs` | trk-PWA の **`js/pack-catalog.js` をそのまま読み込み**、目録 16 件が `sanitizeCatalog` を**1 件も落とされずに**通ることを確認（`name`/`file`/`sha256`/`bytes`/`fonts`/`license`/`description`/`url` が書いたとおりに残る） |
| `tools/selftest.mjs` | **22 / 22 合格**（書体のパス・family・OFL.txt・release・`licenseFile` 3種・woff2 2種の検査を追加） |
| `tools/preview-pack.mjs` | 書体パックから **1 ファイルの見本 HTML**（3.9 MB・woff2 2 本を base64 で埋め込み・外部参照 0）を生成 |
| `tools/build-set.mjs` | **はじめてセット**（ZIP 1つ）を生成。2 回作っても同じ sha256（r2 = `71c9ce0b…`・**2,996,422 B**・4 ファイル／r3 = `1b381a1e…`・**30,799,039 B**・19 ファイル）。中身のファイル名は UTF-8 |
| `tools/check-docs.mjs` | README の表と目録が一致・内部リンク 10 本（うち見出し `#…` 1 本）が実在・セットの記録と実物の sha256 が一致。**わざとずらすと落ちる**ことも確認（見出しリンクの規則は、GitHub が実際に付けた 20 個の id と一致することを確かめました） |
| `tools/check-contract.mjs`（2026-11-01 追記） | 目録の `colors` を足しても、アプリ（trk231・`9bf22d7`）が 2 パックとも落とさずに読むことを確認。読んだ相手側の版も表示 |
| `tools/check-contract.mjs`（trk232・`70fd921`） | 目録の `fonts[].licenseFile`（L7）を足しても、**2 パックとも 1 件も落とされずに**読めることを確認（アプリは trk233 まで、この項目を読まないだけ） |
| `tools/check-fonts.mjs`（新規） | 書体パックの woff2 2 本を**中身まで**検査：`wOF2` 署名・TrueType・表 17 個・cmap **6,875 字**・見本の字（あア漢 Aa 12）**7/7 あり**。cmap の文字数は fonttools（Python）の値と**完全一致**。woff2 でない中身・空ファイルは不合格 |
| 見本の「🔤 同梱の書体」 | `gallery/all-skins.html` に、**@font-face を使わず家族名だけ**を当てた書体の節を追加（書体ファイルは埋め込みません）。`--check` で見本が今の中身と一致するかを見ます |
| L8（`release` と目録の `version`） | `build-catalog --check` が、片方だけ上げたパックを**名前を挙げて**止めます。いまは 15 パック 1.0.0／`maru-go` 1.1.0 で一致 |
| 届いた 14 パック（2026-11-01・trk-PWA 側） | `font-packs-src.zip` の 14 フォルダから `build-pack --fetch` で組み立てた `.stpack` が、**届いた `SHA256SUMS` の 14 本とバイト単位で一致**（例：`zen-kaku.stpack` = `b12dc221636c…`・1,969,655 B）。woff2 は npm `@fontsource` から取り、`SOURCE.json` の sha256 と照合 |
| `tools/check-fonts.mjs`（15 パック） | 20 書体すべて合格。TrueType・表 15〜19・**cmap 5,451〜6,887 字**・見本の字 7/7。いちばん少ないのは M PLUS Rounded 1c の 5,451 字 |
| L10・L11（`note`・`cmap`） | 目録の 22 書体すべてに `note`（雰囲気の一行）と `cmap`（字数）が入りました。`note` は 60 文字を超えると `build-catalog` が止めます（わざと長くして確認）。アプリ（trk233）はまだ読みませんが、目録から落とされないことを `check-contract` で確認 |
| 実機・実ブラウザでの見え方 | **未確認**（作業環境にブラウザも端末もない）。見本 HTML の並び、書体パック 15 個の見え方、パックを入れたときの棚（📚 目録が 16 行になったときの長さ）は、端末で見てください（手順は HANDOFF §4-1） |
| 書体が実際に画面に効くか | **未確認**（ブラウザが無い）。woff2 の中身（表・cmap）までは `check-fonts` で見ていますが、`FontFace` の読み込みと見た目は実機で見てください（§4-3） |
| ライセンス全文の表示 | アプリ（trk233）が `licenseFile` を読むようになりました。**実画面での表示は未確認**（ブラウザが無い）。パックには `fonts/OFL.txt` が入っています |

## 9. 自動検査（GitHub Actions）

`.github/workflows/check.yml` が、push と Pull Request のたびに次を走らせます（trk-PWA をとなりのフォルダに取ってきます）。

```sh
node tools/selftest.mjs              # 22 / 22
node tools/build-catalog.mjs --check # 目録が最新か（release と version の一致も）
node tools/check-contract.mjs        # 目録がアプリの読み取り規則を通るか（相手側の版も表示）
node tools/check-fonts.mjs           # 書体（woff2）が本当に読める形か・見本の字が入っているか
node tools/export-skin-gallery.mjs --trk=… --check  # 全スキン見本が今の中身と一致するか
node tools/build-pack.mjs font-packs/* --check --fetch        # 書体パック 15 個がフォルダと一致するか
node tools/build-set.mjs sets/first-set.json --check          # はじめてセットが記録と一致するか
node tools/check-docs.mjs            # README の表・リンク・セットの記録
```

- 相手側（trk-PWA）は **`TRK_PWA_REF` で版を固定**して取ってきます（trk233 = `8e15e67…`）。
  上げるときは `.github/workflows/check.yml` の `env` の1行を変えます
- 週に1回（日曜 21:00 UTC）、**固定しない `main`** でも同じ契約検査を回します（`upstream-main`）。
  相手側が先に進んでも、こちらが静かに壊れないようにするためです
