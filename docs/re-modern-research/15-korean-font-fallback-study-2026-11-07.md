# 韓国語の補助書体：NeoDunggeunmo の隔離研究

2026-11-07／[基本書体と任意案の方針](14-font-distribution-and-user-choice-2026-11-07.md)を受けた C2 の途中経過。作品への採用、PWA 実装、正式登録・公開・配布の決定ではない。**個別の文字列・環境を対象とした試験**であり、言語全体の字形や可読性は未確認。

## 候補と選んだ理由

DotGothic16 の既存日本語 subset は、作品名 `픽셀 콘솔` の4つのハングルを含まない。これを端末任せにせず、概念上の角形・電子的な印象を保ちやすい補助候補として **NeoDunggeunmo Regular 400** を調べた。作者は、1990年代の韓国語 DOS 用ビットマップ書体を基にし、新しい字形も加えたと[説明](https://github.com/neodgm/neodgm/blob/cbe9a3c6b7067c62612570ee1261b39a31e5061b/README.en.md)している。これは作者の説明と当方の選定仮説であり、元作品や歴史の再現・デザイン適合を保証するものではない。

| 項目 | 確認した内容 |
| --- | --- |
| 作者・固定版 | Eunbin Jeong (Dalgona.)、作者の webfont repository `v1.601` commit [`e0a715695c457d3f8ccd071f88cd71b376a5a23e`](https://github.com/neodgm/neodgm-webfont/tree/e0a715695c457d3f8ccd071f88cd71b376a5a23e)。バージョンは2026-03-18公開。 |
| 実ファイル | 上記固定版 [`neodgm/neodgm.woff2`](https://github.com/neodgm/neodgm-webfont/blob/e0a715695c457d3f8ccd071f88cd71b376a5a23e/neodgm/neodgm.woff2)、44,352 B、SHA-256 `0c0ca9cd73f692a5da5d7fb39737902aa9ea312537237779972a9d81ef0a33bf`。作者の同版 [`sha256sums`](https://github.com/neodgm/neodgm-webfont/blob/e0a715695c457d3f8ccd071f88cd71b376a5a23e/neodgm/sha256sums) と一致。 |
| ライセンス | 同版 [`LICENSE.txt`](https://github.com/neodgm/neodgm-webfont/blob/e0a715695c457d3f8ccd071f88cd71b376a5a23e/LICENSE.txt)、SIL OFL 1.1 と著作権表示。SHA-256 `4d3155f4caba9970c8b386064b398822c29d9181cfba07964ba7b07ccc6cca91`。同梱・配布時の表示と条件を確認する。 |
| Reserved Font Name | 作者の webfont 版 LICENSE は **NeoDunggeunmo** を Reserved Font Name として指定。実験は作者の WOFF2 バイト列を変えない。サブセット化・フォーマット変更等を行う場合の OFL 上の扱いは別途確認し、改変版の主な書体名に予約名を使わない。 |
| 他の配布元 | npm `@kfonts/neodgm@0.5.0` の WOFF2 は 44,620 B、SHA-256 `6a6f47f769d55dbf57c90c567d53d910d1aae944057802cd9e0824dd00e58a6f` で今回の作者版と**別ファイル**。この npm パッケージはライセンスを示すが、確認した tarball に LICENSE 実体はなかった。今回の見本には使わない。 |

OFL は一定の条件でソフトウェアとの同梱・再配布を許すが、ライセンス全文と著作権表示、Reserved Font Name、改変、配布物全体の条件を人が確認する。今回の調査は法的助言・正式配布承認ではない。作者資料の参照は作者による作品の公認を意味しない。

## 文字範囲と描画：確認したこと

- [準備ツール](../../tools/prepare-re-modern-font-study.mjs)に `--neo-dir` が指定された場合のみ、作者 WOFF2 と同版 LICENSE の SHA-256 を照合し、**ローカルの隔離見本**に複写。デフォルトの一書体見本、PWA、実作品 pack や正式カタログを変更しない。見本表示中に外部への自動取得はしない。
- 既存 DotGothic16 WOFF2 `a042e37d...` を第一書体、NeoDunggeunmo WOFF2 をその次、端末の system 系を最後に指定。本文は system 系のまま。初期選択はこれまでどおり system 系で、比較の選択時のみ書体をロードする。対象は見本の見出しであり、作品に導入後の基本表示を実現したものではない。
- [二書体の自動試験](../../tests/re-modern-korean-font-study.test.mjs)で、文字別 cmap 上、現行作品名の日本語の個別9文字は DotGothic16 に収録、韓国語の個別4文字は NeoDunggeunmo に収録。韓国語の短い説明文13種の文字も NeoDunggeunmo に収録されていた。これは既存の文字列に限定した確認で、全言語の収録・字形の自然さや組版を意味しない。
- Chromium 133.0.6943.0・JavaScript無効の隔離環境で、日本語／韓国語のフォントが `loaded`。Chromium DevTools の実際の描画フォント情報では、韓国語見本 `픽셀 콘솔` の4字に NeoDunggeunmo、空白1字に DotGothic16 が使われた。本文の指定は system 系のまま。異なるブラウザ・端末や他の文章では結果が変わり得る。
- 1280・390・320 CSS px、ルート文字サイズ100%／200%で横方向の文書はみ出しなし。試験中、選択肢の長い書体名が320 px／200%で57 pxはみ出したため、ラベルが折り返せるよう修正し再試験した。異なる SHA-256 の書体は準備時に拒否。
- Neo の要求を遮断した条件では読み込み `error` になり韓国語見本の要素は残ったが、端末の代替フォントの有無や文字が読めることの証明ではない。見本表示中の外部要求は観測されなかった。**人による韓国語の字形・見やすさ・組版、実ブラウザの拡大、他ブラウザ・実機・支援技術は未確認。**
- 合計フォントデータは 396,312 + 44,352 = **440,664 B**（ライセンス・ZIP等は別）。PWA の現行作品ファイルは256 KiB上限で書体ファイルも受け付けず、この構成を現行の作品形式にそのまま入れられない。

## ローカルで再現する場合

以下は GitHub CLI と `base64`、Node と PWA checkout が必要。作者版の取得は**制作者が明示的に行う操作**で、見本の表示時に自動取得するものではない。`/tmp` のファイルは消えることがある。

```sh
set -eu
mkdir -p /tmp/avatar-neo-1601
# 各 API 応答の content が base64。固定 commit に限定して取得。
gh api 'repos/neodgm/neodgm-webfont/contents/neodgm/neodgm.woff2?ref=e0a715695c457d3f8ccd071f88cd71b376a5a23e' --jq .content | base64 -d > /tmp/avatar-neo-1601/neodgm.woff2
gh api 'repos/neodgm/neodgm-webfont/contents/LICENSE.txt?ref=e0a715695c457d3f8ccd071f88cd71b376a5a23e' --jq .content | base64 -d > /tmp/avatar-neo-1601/LICENSE.txt
node tools/prepare-re-modern-font-study.mjs --trk=/path/to/trk-PWA --neo-dir=/tmp/avatar-neo-1601
TRK_PWA=/path/to/trk-PWA TRK_NEO_DIR=/tmp/avatar-neo-1601 node tests/re-modern-korean-font-study.test.mjs
python3 -m http.server 4175 --bind 127.0.0.1 --directory dist/re-modern-font-study
```

準備ツールは二つのファイルの固定 SHA-256 を検証し、違う場合は出力前に失敗する。固定版の必要な条件、Node と実行可能な Chromium は別途用意する。既に出力先に古いファイルがある場合、ツールは関係ないファイルを削除しない。明示的に空の `--out=...` を選べば、どのファイルが生成されたか確認できる。

## 今後の判断

1. 日本語・韓国語・中国語・英語を含む**対象の見出し文字列**と適切な言語タグを整理し、ユーザーや各言語に詳しい人に見た目・字形・代替の違いを確認してもらう。韓国語を NeoDunggeunmo にするかは未決。
2. ライセンス・著作権表示と配布方法を独立に確認し、実作品の基本書体としての同梱に適するか判断する。二書体の更新・サイズ・オフライン・失敗・ユーザー選択と解除を検討。
3. 旧PWA・他ブラウザ・支援技術・実機・font load 失敗時の表示を評価。必要な多言語テキストが system fallback に依存する場合は、その範囲と補助書体を明示する。
4. 完成案にしたうえで、PWA に供給・領域別適用・既存設定・容量の受け口を相談する。現在の PWA 作品形式を勝手に変更せず、PWA への返答も今回は行わない。
