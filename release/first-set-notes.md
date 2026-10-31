# trk! はじめてセット

**落とすのはこの ZIP 1つだけ。** 見本・目録・パック 16 個（見本 1＋書体パック 15）をまとめたセットです。

## 手順

1. ZIP を落として**展開**する
2. `gallery/all-skins.html` をダブルクリックして**見本を見る**（オフラインOK）
3. trk!（trk231 以降）で **設定 → 📦 カスタムパック → 📚 目録から入れる → 📥 まとめて入れる** を押し、
   展開した中の **`catalog/index.json` と `packs/`・`font-packs/` の `.stpack` をまとめて選ぶ**

- 入れる前に **大きさ → sha256** を照合します。目録と違うものは入りません
- すでに入っているパックは入れ直しません。入れたあとは一覧の行の「使う」で適用できます
- **trk232 以降**：書体パックの「使う」で**本文の書体**も変わります（外すと元に戻ります）
- **trk233 以降**：「🔤 同梱の書体」の中の **「📄 ライセンス全文を読む」** で、`fonts/OFL.txt` の全文が読めます
- 目録の `version` と入っているパックの `release` が違うと、一覧に **「更新あり（1.0.0 → 1.1.0）」** が出ます
- trk230 の場合は「📚 目録（index.json）を選ぶ」→ 行ごとに「この .stpack を選ぶ」
- 16 個を一度に入れると、一覧（📚 目録から入れる）が 16 行になります。全部いらないときは、
   展開した `font-packs/` から**好みの `.stpack` だけ**を選んでも同じです

## 中身

| ファイル | 何か |
| --- | --- |
| `README-はじめに.txt` | 手順・入っているもの・sha256（この道具が作る） |
| `gallery/all-skins.html` | trk! の全スキン見本 53 種＋「🔤 同梱の書体」の節（1ファイル・外部参照 0） |
| `catalog/index.json` | 目録（16 パック・sha256・書体・ライセンス・色・書体のひとこと・字数） |
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

## 前の版との違い（r2 → r3）

- 書体パックを **1 → 15** に増やしました（trk-PWA 側から届いた 14 種を、届いたとおりのバイト列で収録）
- 目録に **書体のひとこと**（`fonts[].note`）と **対応する字数**（`fonts[].cmap`）が入りました
- 見本の「🔤 同梱の書体」が 15 パックになり、ひとことも出ます
- 前の版（r1・r2）のタグはそのまま残しています。中身が違うので、**同じタグを作り直してはいません**

出どころ：https://github.com/TonbokiriRaikiriMuramasa-Taikoubou/trk-Avatar-Library
