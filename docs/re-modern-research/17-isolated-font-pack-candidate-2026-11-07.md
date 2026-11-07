# 二書体の汎用パック形式による隔離候補

2026-11-07／[書体拡張と設定棚](16-font-pack-settings-shelf-design-2026-11-07.md)の具体的な試作。**正式配布物ではない。普段使う PWA に読み込まない。** 現行のパック操作は選択すると適用され、本文にも影響し、既に有効なパックを切り替えるため、作品見出し専用の完成経路ではない。

## 作ったもの

- [研究用 pack.json](pixel-console-font-pack-study/pack.json) は既存の `shadow-taiko-pack` version 1 で、DotGothic16 と NeoDunggeunmo の WOFF2 とそれぞれ別のライセンスを示す。`skin`、`notes`、`remodern` は含めない。これは**カスタムパックの実験**であり、作品ファイルではない。
- [研究用 NOTICE](pixel-console-font-pack-study/NOTICE.md) と2つの LICENSE 全文・各著作権表示を ZIP に格納。WOFF2 と LICENSE のバイト列は各固定版に一致し、改変していない。`TrkPixelResearchDot` と `TrkPixelResearchNeo` は研究用の FontFace 登録名で、書体ファイル自体を書き換えた名前ではない。表示・識別・Reserved Font Name の扱いは正式配布前に改めて確認する。
- [生成ツール](../../tools/build-re-modern-font-pack-study.mjs)は、[既存の見本準備](../../tools/prepare-re-modern-font-study.mjs)で対象4ファイルと既存パックの SHA-256 を確認し、[既存の pack builder](../../tools/build-pack.mjs)と verifier を使用する。自動の外部取得はない。入力が間違っている場合、指定の出力を書き換えない。
- 元の verifier は LICENSE の指示だけでなく、`OFL.txt` 等の**決められたファイル名**も要求する。初回に `DotGothic-OFL.txt` などを使ったときは不合格だったため、個別ディレクトリ `fonts/dot/OFL.txt`、`fonts/neo/OFL.txt` に分け、別々の全文を残して再検証した。

## 組み立てと限定結果

DotGothic16 は既存配布 pack から取り出し、NeoDunggeunmo は利用者／制作者が明示的に準備した作者ファイルを使う。取得方法は[研究15](15-korean-font-fallback-study-2026-11-07.md#ローカルで再現する場合)。

```sh
node tools/build-re-modern-font-pack-study.mjs --trk=/path/to/trk-PWA --neo-dir=/path/to/neo-dir
TRK_PWA=/path/to/trk-PWA TRK_NEO_DIR=/path/to/neo-dir node tests/re-modern-font-pack-study.test.mjs
```

既定の出力先は Git 管理外の `dist/re-modern-font-pack-study/pixel-console-research.stpack`。`--out=/path/to/research.stpack` で変更可能で、成功時にそのファイルを上書きする。完成版や既存の配布物を出力先に指定しない。試験は固定 commit のクリーンな PWA checkout を要求し、独立した一時プロファイルとローカルサーバーで行う。PWA本体のソースや普段の保存データは変更しない。

| 確認 | 結果・範囲 |
| --- | --- |
| 出力 | **452,364 B**、6エントリ、SHA-256 `7c92ab063274021c0e0c56aaa19d86f73274e807b5a3a2831923b15fb0ab5c54`。同じ入力と固定版 ZIP 実装で2回作りバイト単位で一致。 |
| 形式・材料 | `verify-pack` 合格。ZIP 内の二書体・二ライセンスの SHA-256 を個別に再検査。ライセンスを不正な入力にすると生成失敗し、既存出力を上書きしない。形式検査の合格は権利や表示品質の保証ではない。 |
| 実際のインポート | PWA main `4f93a69f94ec3a3c14c6ea8d1cf9c064723b43e6`、Chromium 133、Service Worker 無効・外部要求遮断、空のプロファイルで、設定のプロ段のファイル選択から読み込んだ。2つの FontFace は `loaded`、インストール済み書体索引にも2件。設定の読み込みは自動的に有効化する。 |
| 保存・解除 | この条件では再読込後も両書体が復元され、パックを外すと本文の CSS 指定が元に戻った。削除後は書体索引から消えた。空のプロファイルで元のスキンとノーツ設定は変化しなかった。容量不足、読込失敗、他ブラウザ・再起動や全設定の組合せを保証しない。 |
| 適用範囲 | 空のプロファイルの本文の `font-family` は system 系から `TrkPixelResearchDot, TrkPixelResearchNeo, system-ui, ...` に変化した。**見出し専用ではなく、作品として意図した保護条件を満たさない。** |
| 複数ライセンス | PWA のパックレコードには両 LICENSE が保存されたが、パック詳細の全文ボタンは先頭の DotGothic16 の全文だけを表示した。この UI だけでは Neo の全文を確認できない。またパックの `NOTICE.md` は現行の manifestPaths に含まれず、パックレコードには保存されなかった。実際に使用者が各書体の出典・全文にアクセスできる方法が必要。 |
| 既存パックとの関係 | 続けて既存 DotGothic パックを有効化し、試作パックを読み込むと、既存パックは**保存されたまま非アクティブ**になり、試作が有効化された。元のスキンは `shadow` に戻り、既存パックが設定したノーツ色はその時点では残った。1条件の観測であり、一般の設定保護・共存を保証しない。 |

## 題字限定の続き

[隔離試作18](18-scoped-font-prototype-2026-11-07.md)では保存だけの内部 API と研究コードを使用し、既存パックを有効に保ったまま題字に2書体を使う可能性を限定確認した。PWA の機能として導入されたものではなく、永続化・利用者向け設定 UI・更新や削除の連動は未実装。

## 完成案へ残ること

1. 作品用見出しに限定し、本文・他領域の設定を保ったうえで、必要な二書体を順に使用する。既存パックとの独立性・優先順位・解除後の利用者設定の扱いを設計する。現行カスタムパックの即時適用をそのまま完成案としない。
2. 依存・未導入・未対応・部分失敗・削除・再導入・他作品との共有を明示し、利用者が取得と適用を選べる形を検証する。基本表示を期待できる条件と代替表示を区別する。
3. 全ての書体に対する出典・版・ライセンス全文と著作権表示を、ZIP だけでなく利用者に必要な場面で確認可能にする。OFL・RFN と配布形態を人が独立に確認する。
4. 韓国語・日本語・中国語等の対象文字・字形・人によるレビュー、読みやすさ、実機・ブラウザ・支援技術を確認。対応範囲外を明記する。
5. これらを含む完成候補を整えた後、PWA 側に既存受け口・設定棚と作品側の契約を相談する。今回 PWA への連絡・仕様変更・正式公開は行っていない。
