# trk! はじめてセット

**落とすのはこの ZIP 1つだけ。** 見本・目録・書体パックをまとめたセットです。

## 手順

1. ZIP を落として**展開**する
2. `gallery/all-skins.html` をダブルクリックして**見本を見る**（オフラインOK）
3. trk!（trk231 以降）で **設定 → 📦 カスタムパック → 📚 目録から入れる → 📥 まとめて入れる** を押し、
   展開した中の **`catalog/index.json` と `font-packs/` の `.stpack` をまとめて選ぶ**

- 入れる前に **大きさ → sha256** を照合します。目録と違うものは入りません
- すでに入っているパックは入れ直しません。入れたあとは一覧の行の「使う」で適用できます
- **trk232 以降**：書体パックの「使う」で**本文の書体**も変わります（外すと元に戻ります）
- 目録の `version` と入っているパックの `release` が違うと、一覧に **「更新あり（1.0.0 → 1.1.0）」** が出ます
- trk230 の場合は「📚 目録（index.json）を選ぶ」→ 行ごとに「この .stpack を選ぶ」

## 中身

| ファイル | 何か |
| --- | --- |
| `README-はじめに.txt` | 手順・入っているもの・sha256（この道具が作る） |
| `gallery/all-skins.html` | trk! の全スキン見本 53 種＋「🔤 同梱の書体」の節（1ファイル・外部参照 0） |
| `catalog/index.json` | 目録（2 パック・sha256・書体・ライセンス・色） |
| `font-packs/maru-go.stpack` | 書体パック「丸ゴのお茶目」（Zen Maru Gothic 400／700・OFL-1.1・`fonts/OFL.txt`） |

正確な大きさと sha256 は、このリリースの Assets と [`release/first-set.json`](https://github.com/TonbokiriRaikiriMuramasa-Taikoubou/trk-Avatar-Library/blob/main/release/first-set.json) にあります
（`node tools/build-set.mjs sets/first-set.json --check` で、倉庫から作ったものと一致するかを確かめられます）。

## 権利

- セットの作り（目録・見本・説明）：GPL-3.0-or-later
- 書体：Zen Maru Gothic（Copyright 2021 The Zen Maru Gothic Project Authors・OFL-1.1）。全文はパックの中の `fonts/OFL.txt`
- パックごとの権利は `pack.json` の `license` を見てください

出どころ：https://github.com/TonbokiriRaikiriMuramasa-Taikoubou/trk-Avatar-Library
