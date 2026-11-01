# trk! はじめてセット

**落とすのはこのファイル 1つだけ。** 見本 2 枚・目録・パック 16 個（見本 1＋書体パック 15）をまとめたセットです。
**`.zip` と `.stlib` は中身が同じ**（同じバイト列・同じ sha256）です。**trk235（2026-11-01）以降は `.stlib` をそのまま選ぶだけ**で入ります。

## 手順

1. ファイルを落とす — **trk235 以降のアプリなら `.stlib` をそのまま選ぶだけ**（展開は要りません）。それより前は `.zip` を落として**展開**する
   （trk235 以降：設定 → 📦 カスタムパック → 📚 目録から入れる → **📦 セット（.stlib / .zip）を選ぶ**）
2. `gallery/all-skins.html` をダブルクリックして**見本を見る**（オフラインOK）。
   書体を選ぶときは **`gallery/fonts.html`**（名前・対応字数・大きさ・雰囲気で絞れます）
3. trk!（trk231 以降）で **設定 → 📦 カスタムパック → 📚 目録から入れる → 📥 まとめて入れる** を押し、
   展開した中の **`catalog/index.json` と `packs/`・`font-packs/` の `.stpack` をまとめて選ぶ**

- 入れる前に **大きさ → sha256** を照合します。目録と違うものは入りません
- すでに入っているパックは入れ直しません。入れたあとは一覧の行の「使う」で適用できます
- **trk232 以降**：書体パックの「使う」で**本文の書体**も変わります（外すと元に戻ります）
- **trk233 以降**：「🔤 同梱の書体」の中の **「📄 ライセンス全文を読む」** で、`fonts/OFL.txt` の全文が読めます
- 目録の `version` と入っているパックの `release` が違うと、一覧に **「更新あり（1.0.0 → 1.1.0）」** が出ます
- trk230 の場合は「📚 目録（index.json）を選ぶ」→ 行ごとに「この .stpack を選ぶ」
- 16 個を一度に入れると、一覧（📚 目録から入れる）が 16 行になります。全部いらないときは、
   展開した `font-packs/` から**好みの `.stpack` だけ**を選んでも同じです。
   `gallery/fonts.html` の行の「⬇ .stpack」から、**1 本だけ落とす**こともできます（目録と 1 本で入れられます）

## 中身

| ファイル | 何か |
| --- | --- |
| `README-はじめに.txt` | 手順・入っているもの・sha256（この道具が作る） |
| `set.json` | セットの名前と版（`format: trk-set`・`version: 1`・`release`／`rev` = r4・`packs`）。trk235 以降のアプリが**表示にだけ**使います（無くても動きます） |
| `gallery/all-skins.html` | trk! の全スキン見本 53 種＋「🔤 同梱の書体」の節（1ファイル・外部参照 0） |
| `gallery/fonts.html` | **書体の一覧と検索**（15 パック・22 ウェイト）。対応字数・大きさ・太さ・ライセンス・ひとこと・タグで並べ替え／絞り込み／検索（1ファイル・外部参照 0・**行ごとに 1 本だけ落とせます**） |
| `catalog/index.json` | 目録（16 パック・sha256・書体・ライセンス・色・書体のひとこと・字数・タグ） |
| `packs/sample-mincho.stpack` | 見本パック「明朝の本」（色とノーツの色だけ・690 B） |
| `font-packs/maru-go.stpack` | 「丸ゴのお茶目」— Zen Maru Gothic 400／700（OFL-1.1） |
| `font-packs/zen-kaku.stpack` | 「角ゴのしらゆき」— Zen Kaku Gothic New 400／700 |
| `font-packs/m-plus-rounded.stpack` | 「まるゴのミルクティー」— M PLUS Rounded 1c 400／700 |
| `font-packs/klee-one.stpack` | 「筆ペンの手紙」— Klee One 400／600 |
| `font-packs/yusei-magic.stpack` | 「筆ポップの夜祭」— Yusei Magic 400 |
| `font-packs/hachi-maru-pop.stpack` | 「まるぽっぷ いちご」— Hachi Maru Pop 400 |
| `font-packs/dotgothic.stpack` | 「ドットの電子音」— DotGothic16 400 |
| `font-packs/shippori-mincho.stpack` | 「墨と金の明朝」— Shippori Mincho 400／700 |
| `font-packs/zen-old-mincho.stpack` | 「古明朝の藍」— Zen Old Mincho 400／700 |
| `font-packs/dela-gothic.stpack` | 「極太ポスター」— Dela Gothic One 400 |
| `font-packs/rampart-one.stpack` | 「ラインのネオン」— Rampart One 400 |
| `font-packs/rocknroll-one.stpack` | 「ロックの夜」— RocknRoll One 400 |
| `font-packs/potta-one.stpack` | 「看板のポップ」— Potta One 400 |
| `font-packs/kaisei-decol.stpack` | 「飾り明朝のラベンダー」— Kaisei Decol 400／700 |
| `font-packs/mochiy-pop.stpack` | 「もちもちポップ」— Mochiy Pop One 400 |

書体パックはどれも **woff2＋`fonts/OFL.txt`（ライセンス全文）＋スキン**の組です。合計 20 ウェイト・29.3 MB。

正確な大きさと sha256 は、このリリースの Assets と [`release/first-set.json`](https://github.com/TonbokiriRaikiriMuramasa-Taikoubou/trk-Avatar-Library/blob/main/release/first-set.json) にあります
（`node tools/build-set.mjs sets/first-set.json --check` で、倉庫から作ったものと一致するかを確かめられます）。

## 権利

- セットの作り（目録・見本・説明）：GPL-3.0-or-later
- 書体：15 書体すべて **SIL Open Font License 1.1**（Zen Maru Gothic／Zen Kaku Gothic New／Zen Old Mincho／
  M PLUS Rounded 1c／Klee One／Yusei Magic／Hachi Maru Pop／DotGothic16／Shippori Mincho／Dela Gothic One／
  Rampart One／RocknRoll One／Potta One／Kaisei Decol／Mochiy Pop One）。
  全文は各パックの中の `fonts/OFL.txt`、著作権者と入手元は各パックの `NOTICE.md` と `SOURCE.json` にあります
- パックごとの権利は `pack.json` の `license` を見てください

## 2 つの名前で配っています（r4 から）

- `trk-first-set-2026-11-01-r4.zip` … 展開して中の目録と `.stpack` を選ぶ（trk231 以降の「📥 まとめて入れる」）
- `trk-first-set-2026-11-01-r4.stlib` … 同じバイト列のまま `.stlib` にしたもの。**trk235 以降はこれをそのまま選ぶだけ**
- どちらも**中身も sha256 も同じ**です（`release/first-set.json` の `files_out` に両方の記録があります）

## 前の版との違い（r4 → r5）

- `README-はじめに.txt` に「**アプリが読むのは `catalog/index.json` と `packs[].file` だけ**（`gallery/` と `set.json` は読まなくても動きます）」を足しました
- 同じ説明に、**trk235 以降の入口（📦 セットを選ぶ）**を足しました
- **パックの中身は r4 と同じ**です（書体・目録・見本も変わっていません）。説明だけの更新なので、すでに入れた人は入れ直さなくて大丈夫です
- 前の版（r1〜r4）のタグはそのまま残しています

## 前の版との違い（r3 → r4）

- **書体の一覧と検索**（`gallery/fonts.html`）が入りました（L13・L14）。woff2 は埋めず、表にしてあります
- **`set.json`**（セットの名前と版）が入りました（trk235 の任意ファイル・表示にだけ使います）
- 目録に **`fonts[].tags`**（検索と絞り込みの語・8 個まで）と **`fonts[].bytes`**（書体 1 本の大きさ）が入りました
- **`.stlib` でも配る**ようになりました（`.zip` と同じ中身）
- 前の版（r1〜r3）のタグはそのまま残しています

## 前の版との違い（r2 → r3）

- 書体パックを **1 → 15** に増やしました（trk-PWA 側から届いた 14 種を、届いたとおりのバイト列で収録）
- 目録に **書体のひとこと**（`fonts[].note`）と **対応する字数**（`fonts[].cmap`）が入りました
- 見本の「🔤 同梱の書体」が 15 パックになり、ひとことも出ます
- 前の版（r1・r2）のタグはそのまま残しています。中身が違うので、**同じタグを作り直してはいません**

出どころ：https://github.com/TonbokiriRaikiriMuramasa-Taikoubou/trk-Avatar-Library
