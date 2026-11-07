# DotGothic16：出典と配布物の差分棚卸し

2026-11-07／[作業一覧 B2](07-avatar-work-inventory-2026-11-07.md)。既存の「ドットの電子音」パックの調査であり、「ピクセル・コンソール」に書体を同梱・適用したことや配布物を更新したことを意味しない。権利の最終判断・実機検証・独立レビューは未了。

## いま配布対象として置かれているもの

| 対象 | 現状と照合結果 | 次の扱い |
| --- | --- | --- |
| [SOURCE.json](../../font-packs/dotgothic/SOURCE.json) | npm `@fontsource/dotgothic16@5.3.1` 内 `package/files/dotgothic16-japanese-400-normal.woff2`、396,312 bytes、SHA-256 `a042e37d1a36798f5a9dee9ab81d2fc4204950ae1729b856e4d22833a61997ee`。参照上流は `fontworks-fonts/DotGothic16` の固定版。 | SOURCE はパックに入らないため、これだけの訂正では配布 NOTICE は直らない。作者上流の参照 commit は WOFF2 の生成元 commit を証明しない。 |
| [NOTICE.md](../../font-packs/dotgothic/NOTICE.md) | 書体の参照先が旧 `github.com/lastrites-net/dotgothic`。以前の調査で 404。 | 作者上流の明記を提案。404 は OFL 違反の証明ではない。配布する資料の記載・条件は人が確認する。 |
| [pack.json](../../font-packs/dotgothic/pack.json) | `TrkDotGothic` 400、`fonts/OFL.txt`、release `1.0.1`。スキンとノーツを含む。 | 見出しだけの書体 pack ではない。既存パックを新作品にそのまま使うと見た目・共通設定に影響し得る。 |
| [dotgothic.stpack](../../font-packs/dotgothic.stpack) | 403,433 bytes、SHA-256 `fb06c427232cdba238ff7806d79a410b9630e582e74ee5ce8473a78cc7cc6860`。中は `NOTICE.md`、WOFF2、`fonts/OFL.txt`、`pack.json` の4ファイル。中の NOTICE にも旧URL。 | 源フォルダから現行バイト列を再生成できた。配布済みまたは共有済みの旧バイト列と訂正候補を混同せず、差分・識別・移行をレビューする。 |
| OFL 全文 | ZIP内の `fonts/OFL.txt` と、npm tarball の `package/LICENSE` は同じ SHA-256 `335d6a81ce1afcf64c8bc36334458ba3292ca6fba5d3974895b3ed84ccee530e`。作者上流を示す著作権行あり。 | 一致は出所照合の一部であり、利用条件を満たしているとの法的結論ではない。配布する実ファイルの条件・表示を人が確認。 |
| [font-packs/README.md](../../font-packs/README.md) | dotgothic のサイズ表は 403,458 B と記載。現在のパックとは25 B違い、旧 [r9 の記録](../../release/font-set-2026-11-02-r9.json)にあるサイズと一致。 | 表を現行値にするか、表の対象版を明記するかレビューする。他パックにも古い数値があり得るため一行の数字だけを一般化しない。 |
| 現在の機械目録・配布セット記録 | [catalog/index.json](../../catalog/index.json)、[catalog/fonts.json](../../catalog/fonts.json)、[release/font-set.json](../../release/font-set.json)、[release/first-set.json](../../release/first-set.json) は現行ファイルのサイズ・ハッシュ等を参照。目録IDはハッシュ先頭8桁を含む。 | 新パックに置き換えると ID・サイズ・ハッシュ、目録・見本ページ・セットの整合が変わり得る。旧リリースの記録は歴史的な証拠として上書きしない。 |
| 見本用の書体 subset | [catalog/preview/SOURCE.json](../../catalog/preview/SOURCE.json) に同じ pack／書体からの見本用 subset 記録がある。 | WOFF2自体を変えない修正であっても、見本と由来・再生成・権利表示の影響を確認する。全てが自動更新されるとは決めつけない。 |

書体は日本語 subset であり、以前の cmap 検査は特定の文字についての観察に過ぎない。中国語・韓国語や組み合わせ文字を含む完全な表示品質を保証しない。詳しい条件は[元の調査](01-pixel-console.md)を参照。

## 変更案の一時的な再生成実験

作者上流リンクだけを差し替えた **一時コピー**から、PWA main の確認時点 `4f93a69f94ec3a3c14c6ea8d1cf9c064723b43e6` の ZIP 実装を使って二回生成。二つの候補のバイト列は一致し、`verify-pack` が通った。

| 項目 | 現行 → 一時候補 |
| --- | --- |
| パックサイズ | 403,433 → 403,483 bytes |
| 候補 SHA-256 | `a6e24769f5f9f3a1800c27fb8197d912723ff535d100e74e18a6ea851fed7bfb` |
| ZIP内の差 | `NOTICE.md` のみ変更。WOFF2、OFL全文、pack.json はそれぞれバイト一致。 |
| 変更案 | `https://github.com/lastrites-net/dotgothic` を `https://github.com/fontworks-fonts/DotGothic16/tree/14517183ab2f75e8bccafc5a0bff6685d268c687` に置換。 |

これは再現性と差分の実験であり、提案文面・版番号・配布方法の承認ではない。二回の生成が同一でも、他の環境・将来の ZIP 実装で自動的に同一とは言わない。**既存の NOTICE、パック、目録、リリース記録は変更していない。** 一時候補は `/tmp` にのみあり、配布物としては扱わない。

```sh
# このリポジトリから。PWA を上記固定版に checkout、Node と unzip が必要
TRK=/path/to/clean-pwa-4f93a69
node tools/build-pack.mjs font-packs/dotgothic --check --fetch --trk="$TRK"
node tools/verify-pack.mjs font-packs/dotgothic.stpack --trk="$TRK"
# 訂正候補はソースフォルダを一時領域にコピーし、NOTICE のURLだけを変更して --out=<一時パス> で作る。
# --release や既存 .stpack の上書きは行わない。
```

## 後で訂正・配布する場合の順序（未実施）

1. 作者上流・取得元・同梱ライセンス・使用範囲・NOTICE文面を人が確認。既存 release `1.0.1` の扱い、内容変更後の版・ID・既存利用者への告知・復元と旧配布物の扱いを決める。
2. 確認済みの修正を作業ブランチで行い、取得元とハッシュを検証して再ビルド。WOFF2・OFL全文など不変のはずのファイルを比較し、パック検査を実行する。
3. 機械目録・書体一覧・ギャラリー・必要な配布セットを別々に再生成し、ID・バイト数・ハッシュ・ダウンロードリンクの整合を検査。`catalog/index.json` のIDはパックハッシュに依存するため、単なる文字修正でも変化する。過去のリリース記録・添付物を書き換えて履歴を偽装しない。
4. 利用者と独立レビューを経て新たな配布・リリースを判断する。既存の配布物が更新されたことを今回の作業から推測しない。

## 次：フォントを含む作品案へのつながり

B2 は既存パックの出典・配布差分の棚卸しで完了。ピクセル・コンソールに載せる書体は別の問題：現在は system 系で、DotGothic16 の見出し適用は候補。見本と本文の範囲、字種、フォールバック、利用者設定、失敗・解除・権利・サイズを実際に検証した**フォント入り案**を用意し、そのうえで PWA 側と供給・実装の分担を相談する。PWA の既存パックを流用すれば見出しだけに限定できるという仮定は置かない。
