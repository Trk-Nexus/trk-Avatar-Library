# font-packs/ — 書体を同梱したパック

書体（woff2）を入れた `.stpack` の置き場です。**trk! trk232（2026-11-01）から、パックの書体が本当に効きます**
（`FontFace` で読み込み → 本文の書体 `--font` の先頭へ → 外すと元に戻る）。

書体スキン（`js/data.js` の `SKINS[].font` に端末の書体名を書く形・9 種）も、これまでどおり使えます。

## いまあるもの（15 パック・20 ウェイト・合計 29.3 MB）

日本語書体（OFL-1.1）を1書体（または2ウェイト）ずつ束ねたパックです。どれも `pack.json`・woff2・`fonts/OFL.txt`・`NOTICE.md` が入り、
**スキン（色とノーツの色）つき**なので、入れて「使う」だけで本文の書体と見た目が変わります（trk! trk232 以降）。

| パック | 書体 | 太さ | 大きさ |
| --- | --- | --- | --- |
| `maru-go.stpack` | Zen Maru Gothic | 400／700 | 2,936,399 B |
| `zen-kaku.stpack` | Zen Kaku Gothic New | 400／700 | 1,969,655 B |
| `m-plus-rounded.stpack` | M PLUS Rounded 1c | 400／700 | 1,902,101 B |
| `klee-one.stpack` | Klee One | 400／600 | 3,929,934 B |
| `yusei-magic.stpack` | Yusei Magic | 400 | 902,975 B |
| `hachi-maru-pop.stpack` | Hachi Maru Pop | 400 | 1,973,189 B |
| `dotgothic.stpack` | DotGothic16 | 400 | 403,458 B |
| `shippori-mincho.stpack` | Shippori Mincho | 400／700 | 2,850,282 B |
| `zen-old-mincho.stpack` | Zen Old Mincho | 400／700 | 3,899,129 B |
| `dela-gothic.stpack` | Dela Gothic One | 400 | 951,499 B |
| `rampart-one.stpack` | Rampart One | 400 | 1,577,304 B |
| `rocknroll-one.stpack` | RocknRoll One | 400 | 981,561 B |
| `potta-one.stpack` | Potta One | 400 | 2,020,608 B |
| `kaisei-decol.stpack` | Kaisei Decol | 400／700 | 3,399,530 B |
| `mochiy-pop.stpack` | Mochiy Pop One | 400 | 999,719 B |

`<slug>/` はそれぞれの**もと**（`pack.json`・`SOURCE.json`・`NOTICE.md`・`fonts/OFL.txt`）。woff2 は `--fetch` で取ります。

**届いた 14 パックは `pack.json` を書き換えていません**（向こうで作った `.stpack` とバイト単位で同じになります）。
目録に出す「書体のひとこと」（`fonts[].note`）は、パックの外の `catalog/font-notes.json` に書きます。

## 作り方（フォルダ → .stpack）

```sh
node tools/build-pack.mjs font-packs/maru-go --fetch   # SOURCE.json の tarball から woff2 を取り、組み立てる
node tools/build-pack.mjs font-packs/maru-go --check   # フォルダと .stpack が合っているか（CI 向け）
for d in font-packs/*/; do node tools/build-pack.mjs "$d" --check --fetch; done   # 全パックをまとめて
node tools/verify-pack.mjs font-packs/maru-go.stpack   # アプリが読める形か
node tools/preview-pack.mjs font-packs/maru-go.stpack  # 色と書体の見本 HTML（dist/preview/）
node tools/check-fonts.mjs                             # woff2 の中身（表・cmap・見本の字）まで見る
node tools/build-catalog.mjs                           # 目録を作り直す
```

`SOURCE.json` には、同梱素材の**出どころ（tarball の URL）と sha256** を書きます。このファイルはパックに入りません。
手元に woff2 があるなら、フォルダに置けば `--fetch` は要りません。

ZIP は trk-PWA の `js/zip-io.js` で書き、**無圧縮（store）で固定**しています。
同じフォルダなら、Node の版が変わっても同じ sha256 になります。

## 約束（`tools/verify-pack.mjs` が見ます）

- `woff2` だけ
- `family` は英数字と空白・`. _ -` の 40 文字まで
- `file` は相対パス（`..`・先頭 `/` は不可）
- `license` がある（OFL なら `OFL-1.1`）
- `licenseFile`（任意）は、パックの中の `.txt`／`.md` を指す（ライセンス全文。書くと目録に載り、trk233 以降でアプリが表示）
- **ライセンス全文（`OFL.txt` など）をパックに入れる** — 入れていないと**不合格**です
- `weight` は 100〜900 の整数
- 1パック 500 MB まで（1書体 16 MB・1パック 8書体まで＝アプリの上限）
- 目録だけに足すもの：`note`（雰囲気の一行・60 文字まで・`catalog/font-notes.json`）と `cmap`（対応する字数・`build-catalog` が数える）

## 重さの目安（2026-10-31 実測・`@fontsource` の woff2）

| 書体 | 400 の woff2 |
| --- | --- |
| Zen Maru Gothic | 1,436,276 B |
| Shippori Mincho | 1,385,356 B |
| Dela Gothic One | 944,356 B |
| Yusei Magic | 895,852 B |

かな＋英数に絞ると 28 KB になりますが**漢字が全部欠けます**。漢字を全部入れると約 1.4 MB で、元とほぼ同じです。
→ **1書体あたり 1 MB 前後**で見込んでください。書体を10本束ねると 10 MB を超えます。
