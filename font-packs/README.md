# font-packs/ — 書体を同梱したパック

書体（woff2）を入れた `.stpack` の置き場です。**いまの trk!（trk230）は、パックの中の書体をまだ読みません。**
それまでの書体スキンは、`js/data.js` の `SKINS[].font` に**端末の書体名**を書く形で配っています（trk228・9 種）。
このフォルダは、アプリが対応した日にそのまま使える形で**先に用意**してあります（trk-PWA の `docs/LIBRARY-TRK230-2026-10-31.md` §5）。

## いまあるもの

| ファイル | 中身 | 大きさ |
| --- | --- | --- |
| `maru-go.stpack` | **丸ゴのお茶目（書体パック）**。Zen Maru Gothic 400／700・`fonts/OFL.txt`・`NOTICE.md`・桃色の夜のスキン | 2,935,978 B |
| `maru-go/` | 上の**もと**（`pack.json`・`SOURCE.json`・`fonts/OFL.txt`）。woff2 は `--fetch` で取ります | — |

## 作り方（フォルダ → .stpack）

```sh
node tools/build-pack.mjs font-packs/maru-go --fetch   # SOURCE.json の tarball から woff2 を取り、組み立てる
node tools/build-pack.mjs font-packs/maru-go --check   # フォルダと .stpack が合っているか（CI 向け）
node tools/verify-pack.mjs font-packs/maru-go.stpack   # アプリが読める形か
node tools/preview-pack.mjs font-packs/maru-go.stpack  # 色と書体の見本 HTML（dist/preview/）
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
- **ライセンス全文（`OFL.txt` など）をパックに入れる** — 入れていないと**不合格**です
- `weight` は 100〜900 の整数
- 1パック 500 MB まで

## 重さの目安（2026-10-31 実測・`@fontsource` の woff2）

| 書体 | 400 の woff2 |
| --- | --- |
| Zen Maru Gothic | 1,436,276 B |
| Shippori Mincho | 1,385,356 B |
| Dela Gothic One | 944,356 B |
| Yusei Magic | 895,852 B |

かな＋英数に絞ると 28 KB になりますが**漢字が全部欠けます**。漢字を全部入れると約 1.4 MB で、元とほぼ同じです。
→ **1書体あたり 1 MB 前後**で見込んでください。書体を10本束ねると 10 MB を超えます。
