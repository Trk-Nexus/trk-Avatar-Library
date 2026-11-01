# trk! 書体セット（全部）

**書体パックを、全部まとめて。** 見本 3 枚・目録・書体パック **15 個**（いま）を 1 ファイルにしたセットです。
**`.zip` と `.stlib` は中身が同じ**（同じバイト列・同じ sha256）です。**trk235（2026-11-01）以降は `.stlib` をそのまま選ぶだけ**で入ります。

> r6 から、セットは **2 つ**に分かれました。
> - **はじめてセット**（軽い・5〜8 MB）… まず試す人向け。見本＋目録＋書体 3〜5 本
> - **書体セット（このリリース）** … 書体を全部。はじめてセットの書体も入っています（重なっても、すでに入っているパックはアプリが飛ばします）
>
> 1 本だけ欲しいときは、このセットを落とさずに `gallery/fonts.html`／`gallery/packs.html` の「⬇ .stpack」からどうぞ。

## 手順

1. ファイルを落とす — **trk235 以降のアプリなら `.stlib` をそのまま選ぶだけ**（展開は要りません）
   （設定 → 📦 カスタムパック → 📚 目録から入れる → **📦 セット（.stlib / .zip）を選ぶ**）
2. `gallery/all-skins.html` で見た目を、`gallery/fonts.html` で書体を、`gallery/packs.html` で**パックごとの中身**を見る（オフラインOK）
3. 入れたら、📦 カスタムパックの一覧で「使う」を押すと、本文の書体ごと切り替わります

- 入れる前に **大きさ → sha256** を照合します。目録と違うものは入りません
- **すでに入っているパック（版も同じ）は飛ばします**。はじめてセットのあとにこれを選んでも、確認は 1 回だけです
- **trk236 以降**：📚 目録から入れる → 各パックの「🔎 中身」に **太さ・対応字数・大きさ・タグ・ひとこと** が出ます
- **trk237 以降**：一覧の上に**雰囲気のタグ**（多い順）が出ます。押すとその語のパックだけに絞られます
- **trk238 以降**：📦 カスタムパックの上に **「🔤 入れている書体」**（家族名・太さ・パック名・ひとこと・タグ・対応字数・大きさ）が出ます

## 中身

| ファイル | 何か |
| --- | --- |
| `README-はじめに.txt` | 手順・入っているもの・sha256（この道具が作る） |
| `set.json` | セットの名前と版（`format: trk-set`・`version: 1`・`release`／`rev`）。trk235 以降のアプリが**表示にだけ**使います |
| `gallery/all-skins.html` | trk! の全スキン見本 53 種＋「🔤 同梱の書体」の節（1ファイル・外部参照 0） |
| `gallery/fonts.html` | **書体の一覧と検索**（パック 15・22 ウェイト）。対応字数・大きさ・太さ・ひとこと・タグで並べ替え／絞り込み／検索 |
| `gallery/packs.html` | **パックの一覧**（パックごとに、中に入っている書体・ひとこと・タグ・対応字数・大きさ・ライセンス・sha256） |
| `catalog/index.json` | 目録。**このセットに入っているパックだけ**を載せています（アプリは目録の `packs[]` を 1 本ずつ探すため） |
| `font-packs/*.stpack` | 書体パック。woff2＋`fonts/OFL.txt`＋スキンの組（下の表） |

| パック | 書体 | 太さ |
| --- | --- | --- |
| `maru-go` | Zen Maru Gothic | 400／700 |
| `zen-kaku` | Zen Kaku Gothic New | 400／700 |
| `m-plus-rounded` | M PLUS Rounded 1c | 400／700 |
| `klee-one` | Klee One | 400／600 |
| `yusei-magic` | Yusei Magic | 400 |
| `hachi-maru-pop` | Hachi Maru Pop | 400 |
| `dotgothic` | DotGothic16 | 400 |
| `shippori-mincho` | Shippori Mincho | 400／700 |
| `zen-old-mincho` | Zen Old Mincho | 400／700 |
| `dela-gothic` | Dela Gothic One | 400 |
| `rampart-one` | Rampart One | 400 |
| `rocknroll-one` | RocknRoll One | 400 |
| `potta-one` | Potta One | 400 |
| `kaisei-decol` | Kaisei Decol | 400／700 |
| `mochiy-pop` | Mochiy Pop One | 400 |

正確な大きさと sha256 は、このリリースの Assets と
[`release/font-set.json`](https://github.com/TonbokiriRaikiriMuramasa-Taikoubou/trk-Avatar-Library/blob/main/release/font-set.json) にあります
（`node tools/build-set.mjs sets/font-set.json --check` で、倉庫から作ったものと一致するかを確かめられます）。

## 権利

- セットの作り（目録・見本・説明）：GPL-3.0-or-later
- 書体：**すべて SIL Open Font License 1.1**。全文は各パックの中の `fonts/OFL.txt`、
  著作権者と入手元は各パックの `NOTICE.md` と `SOURCE.json` にあります
- パックごとの権利は `pack.json` の `license` を見てください

## 2 つの名前で配っています

- `trk-font-set-2026-11-01-r6.zip` … 展開して中の目録と `.stpack` を選ぶ（trk231 以降の「📥 まとめて入れる」）
- `trk-font-set-2026-11-01-r6.stlib` … 同じバイト列のまま `.stlib` にしたもの。**trk235 以降はこれをそのまま選ぶだけ**
- どちらも**中身も sha256 も同じ**です（`release/font-set.json` の `files_out` に両方の記録があります）

出どころ：https://github.com/TonbokiriRaikiriMuramasa-Taikoubou/trk-Avatar-Library
