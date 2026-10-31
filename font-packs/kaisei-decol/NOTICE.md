# 飾り明朝のラベンダー（書体パック） — 権利とクレジット

## このパックの作り

GPL-3.0-or-later（trk-PWA の `LICENSE`）。クレジットとソースは保持してください。

## 同梱した書体

| family | ファイル | 太さ | ライセンス | 全文 |
| --- | --- | --- | --- | --- |
| TrkKaiseiDecol | `fonts/KaiseiDecol-Regular.woff2` | 400 | OFL-1.1 | `fonts/OFL.txt` |
| TrkKaiseiDecol | `fonts/KaiseiDecol-Bold.woff2` | 700 | OFL-1.1 | `fonts/OFL.txt` |

`pack.json` の `fonts[].licenseFile` が `fonts/OFL.txt` を指しています（trk233 以降、アプリは全文を表示できます）。

- **書体**：KaiseiDecol（https://github.com/fontdaso/kaisei）
- **入手元**：npm `@fontsource/kaisei-decol@5.3.1`（`japanese-<weight>-normal` の woff2）
- **ライセンス**：SIL Open Font License 1.1（全文を `fonts/OFL.txt` に同梱。OFL の条件どおりです）
- **家族名**：`TrkKaiseiDecol` は、このパックの中で使うための名前です（書体そのものの名前は変えていません）
- **作り方**：`node tools/build-pack.mjs font-packs/kaisei-decol --fetch`（trk-PWA の `js/zip-io.js` で無圧縮・決定的）
