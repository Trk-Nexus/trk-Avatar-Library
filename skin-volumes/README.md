# 巻別スキンデータ

[巻別一覧](index.html)から巻・1 枚ずつの**元データ JSON**を取得できます。`vol-01`〜`vol-10`、`glitch`、`wizard`、`other` に分かれ、それぞれに巻全体の `skins.json` と `items/<ID>.json` があります。収録値は `catalog/skins.json` の該当スキンと同一です。`wizard` は wizard カテゴリ全体、`other` はほかに分類されないスキンです。

現段階では trk-PWA の画面用カスタムスキン JSON や `.stpack` ではなく、**そのまま一括インストールできません**。アプリ側の受け入れを相談中です。書体は含まれません。

巻の ID は `volumes.json` で管理します。元の目録や巻を変更したら `node tools/export-skin-volumes.mjs` で生成し、`node tools/export-skin-volumes.mjs --check` で欠落・差・古い単品ファイルを検査します。見本 HTML の分類は作成時に利用したもので、生成時の正本ではありません。
