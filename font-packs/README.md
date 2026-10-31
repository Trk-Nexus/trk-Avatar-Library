# font-packs/ — 書体を同梱したパック

書体（woff2）を入れた `.stpack` の置き場です。**trk! trk232（2026-11-01）から、パックの書体が本当に効きます**
（`FontFace` で読み込み → 本文の書体 `--font` の先頭へ → 外すと元に戻る）。

書体スキン（`js/data.js` の `SKINS[].font` に端末の書体名を書く形・9 種）も、これまでどおり使えます。

## いまあるもの

| ファイル | 中身 | 大きさ |
| --- | --- | --- |
| `maru-go.stpack` | **丸ゴのお茶目（書体パック）**。Zen Maru Gothic 400／700・`fonts/OFL.txt`・`NOTICE.md`・桃色の夜のスキン（release 1.1.0・`licenseFile` つき） | 2,936,399 B |
| `maru-go/` | 上の**もと**（`pack.json`・`SOURCE.json`・`fonts/OFL.txt`）。woff2 は `--fetch` で取ります | — |

## 作り方（フォルダ → .stpack）

```sh
node tools/build-pack.mjs font-packs/maru-go --fetch   # SOURCE.json の tarball から woff2 を取り、組み立てる
node tools/build-pack.mjs font-packs/maru-go --check   # フォルダと .stpack が合っているか（CI 向け）
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

## 重さの目安（2026-10-31 実測・`@fontsource` の woff2）

| 書体 | 400 の woff2 |
| --- | --- |
| Zen Maru Gothic | 1,436,276 B |
| Shippori Mincho | 1,385,356 B |
| Dela Gothic One | 944,356 B |
| Yusei Magic | 895,852 B |

かな＋英数に絞ると 28 KB になりますが**漢字が全部欠けます**。漢字を全部入れると約 1.4 MB で、元とほぼ同じです。
→ **1書体あたり 1 MB 前後**で見込んでください。書体を10本束ねると 10 MB を超えます。
