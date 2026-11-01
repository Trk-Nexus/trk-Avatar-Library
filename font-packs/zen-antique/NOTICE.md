# 古道具の明朝（書体パック） — 権利とクレジット

## このパックの作り

GPL-3.0-or-later（trk-Avatar-Library）。クレジットとソースは保持してください。

## 同梱した書体

| family | ファイル | 太さ | ライセンス | 全文 |
| --- | --- | --- | --- | --- |
| TrkZenAntique | `fonts/TrkZenAntique400.woff2` | 400 | OFL-1.1 | `fonts/OFL.txt` |

`pack.json` の `fonts[].licenseFile` が `fonts/OFL.txt` を指しています（trk233 以降、アプリは全文を表示できます）。

- **書体**：ZenAntique（https://github.com/googlefonts/zen-antique）
- **入手元**：npm `@fontsource/zen-antique@5.3.1`（`japanese-<weight>-normal` の woff2）
- **ライセンス**：SIL Open Font License 1.1（全文を `fonts/OFL.txt` に同梱）
- **家族名**：`TrkZenAntique` は、このパックの中で使うための名前です（書体そのものの名前は変えていません）
- **作り方**：`node tools/build-pack.mjs font-packs/zen-antique --fetch`（trk-PWA の `js/zip-io.js` で無圧縮・決定的）
