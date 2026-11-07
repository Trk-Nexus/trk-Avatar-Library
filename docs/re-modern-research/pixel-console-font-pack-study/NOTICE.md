# 研究用：ピクセル・コンソールの書体候補

正式配布物ではなく、PWAを隔離した実験にのみ使う試作です。現行の汎用パック入口では、見出しだけではなく本文などにも書体が適用されます。普段の環境で読み込まないでください。

- DotGothic16 Regular 400：`fonts/dotgothic.woff2`。取得元 `@fontsource/dotgothic16@5.3.1` の日本語 WOFF2、SHA-256 `a042e37d1a36798f5a9dee9ab81d2fc4204950ae1729b856e4d22833a61997ee`。作者資料 https://github.com/fontworks-fonts/DotGothic16/tree/14517183ab2f75e8bccafc5a0bff6685d268c687 。`fonts/dot/OFL.txt` に同ファイルに添付されていたライセンス全文・著作権表示。
- NeoDunggeunmo Regular 400：`fonts/neodgm.woff2`。作者配布 v1.601 固定版 https://github.com/neodgm/neodgm-webfont/tree/e0a715695c457d3f8ccd071f88cd71b376a5a23e 、SHA-256 `0c0ca9cd73f692a5da5d7fb39737902aa9ea312537237779972a9d81ef0a33bf`。`fonts/neo/OFL.txt` に対象配布物のライセンス全文・著作権表示。Reserved Font Name は NeoDunggeunmo。

いずれも SIL Open Font License 1.1 の下で提供される別々の書体です。書体ファイルのバイト列は改変していません。`pack.json` の family は研究用のブラウザ登録名です。別途、表示・字形・配布条件・法的判断・実機・利用者レビューが必要です。
