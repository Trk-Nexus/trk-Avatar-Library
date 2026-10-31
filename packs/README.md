# packs/ — 配るパック（.stpack）

ここに `.stpack` を置きます。`.stpack` は ZIP で、いちばん上に `pack.json` があります。
形と書き方は、リポジトリ直下の [`../README.md`](../README.md) §3 を見てください。

置いたあと：

```sh
node tools/verify-pack.mjs packs/あなたのパック.stpack
node tools/preview-pack.mjs packs/あなたのパック.stpack   # 入れる前に見る見本 HTML（dist/preview/）
node tools/build-catalog.mjs
node tools/check-contract.mjs                             # 目録がアプリの読み取り規則を通るか
```

- **1ファイル 50 MB を目安**にしてください（それ以上は Release か Drive に置き、目録には URL ではなく
  「どこにあるか」を書きます）。
- 権利のある素材だけを入れてください。`license` は「このパックの作り」についてで、同梱素材の権利は別です。

## いまあるもの

| ファイル | 中身 |
| --- | --- |
| `sample-mincho.stpack` | 見本。書体スキン「明朝の本」と同じ色の指定（画像・音源・書体ファイルなし） |
