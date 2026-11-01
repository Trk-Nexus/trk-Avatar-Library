# よもぎの便り（書体パック） — 権利とクレジット

## このパックの作り

GPL-3.0-or-later（trk-Avatar-Library）。クレジットとソースは保持してください。

## 同梱した書体

| family | ファイル | 太さ | ライセンス | 全文 |
| --- | --- | --- | --- | --- |
| TrkYomogi | `fonts/TrkYomogi400.woff2` | 400 | OFL-1.1 | `fonts/OFL.txt` |

`pack.json` の `fonts[].licenseFile` が `fonts/OFL.txt` を指しています（trk233 以降、アプリは全文を表示できます）。

- **書体**：Yomogi（https://github.com/googlefonts/yomogi）
- **入手元**：npm `@fontsource/yomogi@5.3.0`（`japanese-<weight>-normal` の woff2）
- **ライセンス**：SIL Open Font License 1.1（全文を `fonts/OFL.txt` に同梱）
- **家族名**：`TrkYomogi` は、このパックの中で使うための名前です（書体そのものの名前は変えていません）
- **作り方**：`node tools/build-pack.mjs font-packs/yomogi --fetch`（trk-PWA の `js/zip-io.js` で無圧縮・決定的）
