# 二書体の権利情報・配布形態の整理

2026-11-07／[進捗計画](19-remaining-roadmap-2026-11-07.md) A 節の手順3の途中。各書体の提供元・対象ファイル・表示条件を確認し、**利用者が二つの全文を別々に読める隔離見本**を作った。法的助言・配布許可の確定・作品への正式採用・公開ではない。作者や提供元による作品の公認も意味しない。

## 対象を混ぜない

| 項目 | DotGothic16 Regular 400（日本語 subset） | NeoDunggeunmo Regular 400 |
| --- | --- | --- |
| 書体ファイル | `@fontsource/dotgothic16@5.3.1` の `package/files/dotgothic16-japanese-400-normal.woff2`、396,312 B | 作者の webfont `v1.601`、固定 commit `e0a715695c457d3f8ccd071f88cd71b376a5a23e` の `neodgm/neodgm.woff2`、44,352 B |
| SHA-256 | `a042e37d1a36798f5a9dee9ab81d2fc4204950ae1729b856e4d22833a61997ee` | `0c0ca9cd73f692a5da5d7fb39737902aa9ea312537237779972a9d81ef0a33bf` |
| 全文の取得元・SHA-256 | 上記 npm 配布の `package/LICENSE` と既存 pack の `fonts/OFL.txt` は一致。`335d6a81ce1afcf64c8bc36334458ba3292ca6fba5d3974895b3ed84ccee530e` | 同じ固定 commit の `LICENSE.txt`。`4d3155f4caba9970c8b386064b398822c29d9181cfba07964ba7b07ccc6cca91` |
| 著作権表示 | `Copyright 2020 The DotGothic16 Project Authors` と作者資料URL。対象 LICENSE の冒頭に Reserved Font Name の指定は見当たらない。 | `Copyright (c) 2021-2026, Eunbin Jeong (Dalgona.)`。**Reserved Font Name `NeoDunggeunmo`** が指定されている。 |
| 出典 | [npm の版情報](https://registry.npmjs.org/@fontsource/dotgothic16/5.3.1)／[作者資料の固定版](https://github.com/fontworks-fonts/DotGothic16/tree/14517183ab2f75e8bccafc5a0bff6685d268c687)。この作者資料 commit は対象 WOFF2 の生成元を証明しない。 | [作者の webfont 固定版](https://github.com/neodgm/neodgm-webfont/tree/e0a715695c457d3f8ccd071f88cd71b376a5a23e)／[その LICENSE](https://github.com/neodgm/neodgm-webfont/blob/e0a715695c457d3f8ccd071f88cd71b376a5a23e/LICENSE.txt)。本体リポジトリの別 LICENSE と混同しない。 |

対象の各 LICENSE は **SIL Open Font License 1.1** と、その書体固有の著作権表示を含む。OFL は条件付きで同梱・再配布等を認めるが、フォント単体の販売、著作権表示とライセンス全文、改変版と Reserved Font Name、作者名の扱いなどを**対象ファイルの全文**で確認する。2つとも OFL だからと、著作権表示を1つにまとめたり、片方の LICENSE をもう片方の代用にしたりしない。

研究候補は WOFF2 のバイト列を変えずに使用する。サブセット化や形式変換をする場合、配布物や名前の扱いを改めて確認する。現行の研究 pack や試作はブラウザ登録名を指定するが、その呼び名とフォント内部名・OFL 上の改変版の判断を同一視せず、RFN の適用を独立に確認する。文章は権利の専門家や権利者の判断を代行しない。

## 実ファイル・見本・PWA の違い

- [研究用二書体 pack](17-isolated-font-pack-candidate-2026-11-07.md)は `fonts/dot/OFL.txt` と `fonts/neo/OFL.txt` を別々に含み、`pack.json` の各 `licenseFile` も対応させる。新たに書体をリポジトリへ入れていない。現行形式の検査合格だけでは配布条件の充足を証明しない。
- 固定版 PWA の実験では、2つの LICENSE は pack のレコードに保存されるが、詳細画面の全文ボタンは**最初の1件**のみを表示し、`NOTICE.md` はレコードに保存されなかった。ZIP に2件存在することと、導入後に使用者が2件とも確認できることは別。
- [新しい隔離見本のテンプレート](pixel-console-license-study/index.html)から生成するページは、各書体の出典と説明の下に、それぞれの全文を個別の開閉欄とローカルテキストリンクで示す。**テンプレートを直接開いても本文やリンク先は入っていない**ので、下の手順で生成する。JavaScript・外部素材・書体ファイルは使用しない。見本生成時に使用するファイルは、既存の見本準備ツールでサイズと SHA-256 を照合する。外部リンクへの移動は利用者が明示的に選ぶ場合だけ。
- これは PWA に設定棚ができた意味ではなく、作品に適用・配布する機能もない。見本は**利用者に読める提示方法の候補**であり、引用・作品画像・配布の許諾を自動的に保証しない。

既存 DotGothic 配布物の `NOTICE.md`・pack 内の作者資料 URL は旧 URL のまま、`SOURCE.json` だけ訂正済み。[棚卸しと未配布の訂正候補](11-dotgothic-distribution-inventory-2026-11-07.md)を参照。既存リリースや利用者が既に持つファイルを今回修正・撤回したわけではなく、今後の再配布・訂正・旧版への案内は別途判断する。旧 URL が応答しない事実だけで OFL 違反とは断定しない。

## 配布と棚の候補：決定前の比較

| 候補 | 利点 | 確認すべきこと |
| --- | --- | --- |
| **二書体を1つの拡張に含める** | 対象作品の基本表示に必要な資源を一緒に受け取れ、版と依存関係を揃えやすい。研究 pack のファイルは 452,364 B。 | 各 LICENSE・著作権を別々に表示する受け口、作品の題字だけへの適用、更新時に両書体を一体とする影響。現在の汎用パック UI はこの表示・適用を満たさない。 |
| **書体ごとに2つの拡張にする** | 各書体の出典・更新・削除を分けられ、他作品との共有を検討できる。 | 2つのバージョンと依存、欠落時の説明、片方だけ消すときの影響。現行 PWA はアクティブな汎用パックを切り替えるため、2パックを独立に同時適用できるとは言えない。 |
| **共通資源＋作品の依存関係を別管理** | 複数作品で重複を避けられる可能性。 | バージョン・識別・更新・削除・参照数・壊れた依存・同時操作の設計が必要。既存 UI にあると決めつけない。 |

いずれの場合も、作品や拡張の導入は利用者が選び、各書体の名前・版・作者／提供元・必要容量・ライセンス全文を確認できること、適用・解除・削除が別であることを目標にする。作品の基本表示に必要なら導入前に明示し、未導入では既存表示を残して差を案内する。**1つの候補に正式決定していない。**

ユーザー自身が取得する任意の別書体については、ファイルの再配布、利用者の取得・利用、見本画像の作成／公開を別々に確認する。条件が不明なら画像や書体ファイルを配布しない。[方針](14-font-distribution-and-user-choice-2026-11-07.md)。

## 見本の再現と検査

Neo の作者提供ファイルは[研究15の手順](15-korean-font-fallback-study-2026-11-07.md#ローカルで再現する場合)で明示取得し、固定 PWA checkout と Node を用意する。ブラウザ試験には実行可能な Chromium が必要。

```sh
node tools/prepare-re-modern-license-study.mjs --trk=/path/to/fixed-pwa --neo-dir=/path/to/neo-dir
TRK_PWA=/path/to/fixed-pwa TRK_NEO_DIR=/path/to/neo-dir node tests/re-modern-license-study.test.mjs
TRK_PWA=/path/to/fixed-pwa TRK_NEO_DIR=/path/to/neo-dir node tests/re-modern-license-study-browser.test.mjs
python3 -m http.server 4175 --bind 127.0.0.1 --directory dist/re-modern-license-study
```

既定出力は Git 管理外の `dist/re-modern-license-study`。`--out` で指定した場所は成功時に見本と2つの LICENSE を上書きする。誤った入力は出力前に拒否するが、書き込み途中のディスク障害まで原子的に扱うものではなく、既存の関係ないファイルも削除しない。正式配布物を出力先に指定しない。

- [ファイル試験](../../tests/re-modern-license-study.test.mjs)：候補 pack に入った各 LICENSE、見本内の全文、個別テキストのバイト列と固定ハッシュを照合。不正な Neo LICENSE を拒否し、既存の見本を変更しないことを確認。これは法的条件の十分性ではない。
- [ブラウザ試験](../../tests/re-modern-license-study-browser.test.mjs)：Chromium 133、JS・Service Worker 無効で、各全文をキーボードで開く／テキストが一致すること、外部要求・書体要求なしを確認。1280／390／320 CSS px、ルート文字100%／200%では横にはみ出さず、forced colors と reduced motion のエミュレーションで全文を表示。初回は390 px・200%で書体名等がはみ出したため折り返しを追加し、再検査した。実ブラウザのズーム・実機・支援技術・人手レビューは未実施。

## 残る判断

1. OFL 全文、作者・ファイル・Reservation、未改変バイナリとブラウザ上の名前、利用・頒布方法を独立に人が確認する。利用者向けの表示文面と翻訳・公開範囲も確認する。
2. 保存のみ／適用／解除／削除、作品の依存、共通資源や更新・容量の扱いを[状態研究](21-font-state-and-recovery-study-2026-11-07.md)と併せて整理する。モデルと実ストレージや複数タブの接続は未完。
3. 各言語の字形・読みやすさを人と実機で評価し、基本表示の候補を完成させる。その後、既存の設定棚をどう拡張するかを PWA 側と相談する。今回 PWA への連絡・仕様変更・正式配布は行っていない。
