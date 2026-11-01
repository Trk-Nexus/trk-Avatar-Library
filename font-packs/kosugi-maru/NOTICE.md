# こすぎの丸ゴ（書体パック） — 権利とクレジット

## このパックの作り

GPL-3.0-or-later（trk-Avatar-Library）。クレジットとソースは保持してください。

## 同梱した書体

| family | ファイル | 太さ | ライセンス | 全文 |
| --- | --- | --- | --- | --- |
| TrkKosugiMaru | `fonts/TrkKosugiMaru400.woff2` | 400 | Apache-2.0 | `fonts/LICENSE.txt` |

`pack.json` の `fonts[].licenseFile` が `fonts/LICENSE.txt` を指しています（trk233 以降、アプリは全文を表示できます）。

- **書体**：KosugiMaru（https://github.com/googlefonts/kosugi-maru）
- **入手元**：npm `@fontsource/kosugi-maru@5.3.0`（`japanese-<weight>-normal` の woff2）
- **ライセンス**：Apache License 2.0（全文を `fonts/LICENSE.txt` に同梱）
- **家族名**：`TrkKosugiMaru` は、このパックの中で使うための名前です（書体そのものの名前は変えていません）
- **作り方**：`node tools/build-pack.mjs font-packs/kosugi-maru --fetch`（trk-PWA の `js/zip-io.js` で無圧縮・決定的）
