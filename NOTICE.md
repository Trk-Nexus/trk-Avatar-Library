# 権利とクレジット（trk-Avatar-Library）

## このリポジトリ

- ツール（`tools/`）・文書（`README.md`・各 README）・見本の生成物：**GPL-3.0-or-later**（`LICENSE`）。
  trk-PWA（https://github.com/Trk-Nexus/trk-PWA）と同じライセンスです。
- `tools/lib/zip.mjs` は trk-PWA の `js/zip-io.js` を**読み込んで使う**だけで、写しは持ちません
  （使うときは trk-PWA のチェックアウトが要ります）。

## 見本（`gallery/all-skins.html`・`catalog/skins.json`）

- 見本の元データは trk-PWA の `js/data.js` と `js/characters/miku.js` から書き出したものです。
  スキンの名前・色・書体の指定は trk-PWA と同じ GPL-3.0-or-later の範囲で扱います。
- ミク系のスキンは PCL（ピアプロ・キャラクター・ライセンス）に沿った**非公式の二次創作**です。
  公式の素材は使っていません。詳しくは trk-PWA の `NOTICE.md` を参照してください。
- 見本は**特定の製品・作品の画面を写したものではありません**。色と書体の指定だけを並べています。

## パック（`packs/`・`font-packs/`）

- パックごとに権利が違います。**`pack.json` の `license` と、同梱した素材の権利者**を必ず見てください。
- 音源・画像・3Dモデル・書体は、**配布できるものだけ**を入れてください。
  「買った」「ダウンロードできた」は、再配布の許諾ではありません。
- 見本パック `packs/sample-mincho.stpack` は、trk-PWA の書体スキン「明朝の本」と同じ**色の指定**だけを持ちます
  （画像・音源・書体ファイルは入っていません）。作りのライセンスは GPL-3.0-or-later です。
- 書体パック `font-packs/maru-go.stpack` は、**Zen Maru Gothic**（Copyright 2021 The Zen Maru Gothic Project Authors・OFL-1.1）の
  woff2 2 本（400／700）を同梱しています。ライセンス全文はパックの中の `fonts/OFL.txt`、クレジットは `NOTICE.md` にあります。
  書体の入手元は npm `@fontsource/zen-maru-gothic@5.3.1` で、`font-packs/maru-go/SOURCE.json` に tarball と sha256 を書いています。
  パックの作り（`pack.json`・スキンの色）は GPL-3.0-or-later です。
  `pack.json` の `fonts[].licenseFile` が `fonts/OFL.txt` を指しています（任意項目。アプリが全文を表示できるのは trk233 以降）。
- 書体パック **15 個**（`font-packs/*.stpack`）は、どれも **SIL Open Font License 1.1** の日本語書体を 1〜2 ウェイト同梱しています。
  全文はパックの中の `fonts/OFL.txt`（`fonts[].licenseFile`）、著作権者・入手元・tarball・sha256 は
  各パックの `NOTICE.md` と `SOURCE.json` に書いています。書体そのものの名前は変えていません
  （`Trk…` はアプリの中で使う家族名で、OFL の予約名を避けるために付けています）。
  - 同梱している書体：Zen Maru Gothic／Zen Kaku Gothic New／Zen Old Mincho／M PLUS Rounded 1c／Klee One／
    Yusei Magic／Hachi Maru Pop／DotGothic16／Shippori Mincho／Dela Gothic One／Rampart One／RocknRoll One／
    Potta One／Kaisei Decol／Mochiy Pop One（すべて OFL-1.1・npm `@fontsource` の版を固定して取得）
- **2026-11-01 に届いた 14 パックは、trk-PWA 側が作った `pack.json` をそのまま使っています**（書き換えていません）。
  そのため、向こうの `.stpack` とバイト単位で同じものになります（`SHA256SUMS` と一致）。
  目録に足した「書体のひとこと」（`fonts[].note`・`catalog/font-notes.json`）と「タグ」（`fonts[].tags`・`catalog/font-tags.json`）は**パックの外**にあります。
- 「🔤 同梱の書体」の節（`gallery/all-skins.html`）は、パックの宣言から**書体の名前・ライセンス・ひとことを表示するだけ**で、
  書体ファイルを埋め込んでいません（@font-face を使わないので、表示は端末に入っている書体に従います）。
- **書体の一覧と検索**（`gallery/fonts.html`・`catalog/fonts.json`）も同じ方針です。目録の項目（family・太さ・字数・大きさ・
  ライセンス・ひとこと・タグ）を並べるだけで、**書体ファイルは 1 つも埋め込んでいません**。一覧から落とせるのは、各パックの
  `.stpack`（＝権利表示と `fonts/OFL.txt` を含む配布物）です。

## 書体を同梱するとき（`font-packs/`）

- OFL（SIL Open Font License）の書体は、**ライセンス全文（OFL.txt）を同じパックに入れる**ことが条件です。
  予約名（Reserved Font Name）がある書体は、改名していない限り、その名前を使い続けられますが、
  改変した版には別の名前が必要です。
- 書体の名前・作者・入手元・ライセンスを `pack.json` の `fonts[]` と `NOTICE.md` の両方に書いてください。
- Apache-2.0・MIT・CC0 などの書体もあり得ます。**それぞれの条件**（全文の同梱・表示など）に従ってください。

## 商標・作品名について

- 「VRChat」「VRC Avatar Library」は、この倉庫の**考え方の参考**として名前を挙げているだけです。
  この倉庫は VRChat Inc. や参考にしたアプリの作者とは関係ありません（非公認）。
- trk! は非公認のファンメイドのアプリです。各作品・サービスの権利は、それぞれの権利者にあります。
