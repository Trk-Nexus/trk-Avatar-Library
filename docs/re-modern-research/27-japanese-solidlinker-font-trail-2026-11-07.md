# 明朝のドット、横浜の太さ、連なる輪郭

2026-11-07／[ドットフォント一覧](https://ffont.jp/collections/dot_matome/)を入口に、**縁架ドット明朝24・横浜ドット・SolidLinker** を日英の題字の観点でたどる。特に、SolidLinker の「隣の文字と縁がつながる」印象は、作品を差別化する可能性がある。ただし、それは良さを確定した結論ではなく、比較して確かめたい仮説。

[DotGothic16 ＋ NeoDunggeunmo と Galmuri11 の二つ](24-pixel-console-candidate-trail-2026-11-07.md)は、依頼者が良いと評価した**多言語の比較候補として維持**する。今回の3書体で置き換える決定ではない。[Press Start 2P・JetBrains Mono・Fira Code・美咲等](26-latin-japanese-font-candidates-2026-11-07.md)も探索の参考に残す。作品案の承認は、書体の採用、拡張の配布、公開、PWA 側の実装の承認ではない。

## 三つの方向：日英をどう楽しむか

| 候補 | 作り・文字についての作者資料 | 作品に重ねるとしたら？（仮説） | 今回の確認段階 |
| --- | --- | --- | --- |
| 縁架ドット明朝24 | [作者](https://enth-imaginary-rail.jp/tools/enkafont/)は Noto Serif の字形を基に24ドットを手打ちし、明朝の飾りを極力省略しないと説明。仮名・英数字・一部漢字・記号等、横書き。 | 和文の題字や、英字と同じ系統で組んだ作品名に、端末的なゴシックとは異なる柔らかさ／文学的な表情が出るか。小さな本文に使う前提ではない。 | 作者ページの設計・試し打ち・配布案内のみ。実ファイル、英字の字形と幅、混植、cmap、表示未検証。 |
| 横浜ドット **フリー版** | [作者](https://typingart.net/?p=563)は「ちょっとウェイトが太め」、漢字の出現頻度上位1000字＋αを収録と説明。[ストア](https://typingart.stores.jp/items/6731a7d807e36703881d7823)は英数字、仮名、限定漢字・記号を列挙。 | 日英を一体として力強く見せられるか。文字が詰まった短い題字と、細かな説明文の両方で見え方を分けて考えたい。 | 作者の資料と利用条件のみ。実ファイル、cmap、英字の字形・混植・表示未検証。**Web見本や拡張に搭載しない。** |
| SolidLinker | [作者](https://hicchicc.github.io/00ff/)はアウトラインオーバーラップ型。固定した実 TTF の英数字・記号を検査。日本語名の例は欠字。 | `trk!` のような短い英字題字を「つながった部品」のように見せる案。日英を同じ書体で揃えるのではなく、日本語候補や利用者書体との組合せが必要。 | 作者固定 TTF の cmap・字形幅を確認し、英字のみ隔離比較。人間の視覚評価・混植・実機は未了。 |

見出しの力強さがそのまま長文の読みやすさになるとは限らない。ここで日本語の「本文候補」として推奨してはいない。実際の候補対象は、固定 PWA の共通題字 `trk!` と、これとは別物の作品名（日本語 `ピクセル・コンソール`／英語 `Pixel Console` 等）。適用範囲もまだ決めていない。

## SolidLinker：境界を越える文字

[作者の固定 commit `f7759490...`](https://github.com/hicchicc/hicchicc.github.io/tree/f7759490bbd67c37b3e80f81d05c346e08936616/00ff) の `x12y16pxSolidLinker.ttf`、作者サイト記載 **Version 2023-10-29**。TTF は **25,980 B**、SHA-256 `d84e7e5b244e10f80382af19626092f77d18ab5b4aa92431d243b0142486ba4d`。単体サイズであり、拡張パック全体の容量ではない。

FontTools 4.60.1 で同ファイルの Unicode `getBestCmap()` は106コードポイント。`trk!`、`Pixel Console`、`PIXEL CONSOLE`、例の数字・記号は揃う。一方、日本語名 `ピクセル・コンソール` の9種類、中国語名 `像素控制台` の5種類、韓国語名 `픽셀 콘솔` の4種類は、空白を除きそれぞれ欠字。これは**この固定ファイルの指定文字列**の結果であり、言語全体・字形・結合を保証しない。日本語対応とする第三者紹介もあるが、今回取得した作者版の cmap の方を優先し、作者版を日本語全体に使えるとは扱わない。

もう少し中身を見ると、units per em は64。`t` と `r` は字形の xMin=0・xMax=48、送り幅=40、`k` は xMin=0・xMax=56、送り幅=48、`!` は xMin=0・xMax=32、送り幅=24。いずれも字形の**外接範囲が送り幅を8単位超える**。次の文字も xMin=0 なら、水平方向の外接範囲は重なる。これは作者が説明するオーバーラップと整合するが、外接矩形だけでは実際の黒い画素や全ての文字の輪郭がつながると証明できない。文字の並び、サイズ、アンチエイリアス、字間、ブラウザによって見え方は変わる。

「少し離しても成立するか」を観察するための研究見本を作った。字間 `0` と、8/64 em に相当する **`0.125em`** を上下に表示し、system・Dot＋Neo・Galmuri11・Press Start 2P・JetBrains Mono・Fira Code・SolidLinker を切替できる。0.125em は単に構造を見る実験値であり、最適値・推奨値・PWAへの設定ではない。日本語本文の書体は変更しない。フォントを読み込めない場合や欠字は端末の代替書体で表示され、失敗通知はない。

### 機械試験で確認したこと／していないこと

[試験](../../tests/re-modern-solidlinker-study.test.mjs)では、Chromium 133、JavaScript／Service Worker 無効の隔離ページで、SolidLinker を選択後の `trk!`（4 glyph）と `Pixel Console`（13 glyph）が、字間0と0.125emのいずれでも作者 TTF で描画されたことを DevTools で確認。代表条件で `trk!` の range 幅は 79.75px／96.5625px と広がった。値はその画面条件だけの測定。選択前の自動書体要求なし、外部要求なし、キーボード選択、本文 CSS 不変、再読込で初期選択、7選択肢×幅1280／390／320 CSS px×root 100／200%の横 overflow なしを確認した。forced colors・reduced motion では要素の存在、TTF 要求遮断時はロード error と文字要素の存在を確認。

この試験は**輪郭の重なりの画素判定、可読性、実際のズーム、各種 OS・実機・ブラウザ、支援技術、人の好みや法的な承認ではない**。サンプル文字に欠字がないことも混植の品質を意味しない。次の人手比較では短い題字、大小文字、数字と `!` の接続、長い英語名、本文との釣り合いを見て、文字間が詰まった場合にも読めるかを記録したい。

## 明朝は「24ドットの中の飾り」

[作者ページ](https://enth-imaginary-rail.jp/tools/enkafont/)は、縁架ドット明朝24 **Ver.1.2（2026-08-14）**、TrueType（bitmap embedded）と記載。24dot ボディ、飾りを極力省かない、左右端の縦画に1dot空ける等の規則を図示し、試し打ちを用意している。漢字は1269字で教育漢字と出現頻度上位を含むという説明だが、**一部未収録**があり、仮名・半角／全角英数字・記号・ギリシャ／キリルも全字保証ではない。本文に使う場合の視認性や言語の自然さは別途評価する。

作者の[BOOTH 配布ページ](https://booth.pm/ja/items/6784922)を案内し、今回は購入・アカウント操作を代行していない。**実フォント、付属ライセンス、バージョン hash、実際の cmap／描画は未確認**。作者ページは OFL 1.1 に準じること、配布・埋込み時のライセンス情報と `© 2025 Enthiesia`、予約名「縁架」「Enka」を記す。ファイルが入手できたら添付文書・元書体情報・改変や Web 用変換・配布条件を対象物ごとに照合し、OFL の扱いを判断する。

美咲の8×8と縁架の24dotは、描く密度と目指す表情の違いが興味深い。ただし異なる実ファイル・描画環境を見ずにどちらが読みやすいとは結論しない。SolidLinker と組む案も、字形の相性・日英の境界・ベースライン・fallback の動作を後で人が見るための案である。

## 横浜ドット：無料と配布可能は別

[フリー版の作者ストア](https://typingart.stores.jp/items/6731a7d807e36703881d7823)は OpenType・横書き、日英と限定漢字の文字一覧を示す。使用には商用・私用とも **X `@sakujitetsu` のフォローまたはリリースポストのリポスト**が条件。さらに、フォントデータをサーバー等にアップロードして送信可能にする目的の使用、改変・販売・頒布・バックアップ目的以外のコピーを禁止し、成果物の著作権・意匠・商標等の登録にも制限を記載している。

したがって無料という表示だけから Web プレビューや `.stpack` への同梱・再配布が可能と判断せず、今回**フォントを取得・変換・アップロード・同梱していない**。ローカルで使えるか、画像作成・公開ができるか、パックに別途許諾を得られるかは、実際の利用方法と最新の全文について確認する。条件を自動で満たすための SNS 操作は行わない。

同作者の[有料バリアブル版](https://booth.pm/ja/items/5801542)は別商品で、ページは TTF と WOFF、ドットの大きさの可変、購入者の独占利用デバイス2台まで等を説明する。掲載文字はフリー版の漢字収録と同じではなく、規約にも頒布禁止等がある。**Web 形式が含まれることは、利用者向けパックへの再配布許可を意味しない。** 2つの商品・条件・文字範囲を混ぜない。購入・実ファイル・権利の個別確認は行っていない。

## SolidLinker の権利：OFL と混ぜない

固定した[作者サイト](https://github.com/hicchicc/hicchicc.github.io/blob/f7759490bbd67c37b3e80f81d05c346e08936616/00ff/index.html)は、2026年に OFL への移行準備を説明する一方、今回の **SolidLinker は「Original License」区画**に掲載されている。固定時点の独自規約は、生成データの利用、TTF 同梱ゲーム、商用、加工・改変・再配布を記載し、著作権放棄なし、著作者を名乗ることやフォントそのものの販売等の禁止、無保証、予告なく規約変更の可能性も述べる。

試験見本には、作者ページのその区画を固定 HTML から文字として取り出した全文記録を別添し、**TTF に同梱されていた LICENSE だとは装わない**。作者・元 URL・固定 commit を明記。固定ファイルの未改変研究見本と、将来の公開・拡張パックでの配布・組合せ・変換は別の判断であり、[最新の作者ページ](https://hicchicc.github.io/00ff/)と対象物を人が確認する。今回 `.stpack` の採用・正式配布・PWA実装はしていない。

## 再現する場合

固定 PWA・Neo・Galmuri は[研究24](24-pixel-console-candidate-trail-2026-11-07.md)、Latin 候補は[研究26](26-latin-japanese-font-candidates-2026-11-07.md#再現する場合)の入力を用意する。以下は明示的な取得と研究見本の生成で、自動取得は行わない。生成物は Git 管理外の `dist/` に置き、見本は日本語2書体を含まない。

```sh
mkdir -p /tmp/avatar-solidlinker
ref=f7759490bbd67c37b3e80f81d05c346e08936616
gh api "repos/hicchicc/hicchicc.github.io/contents/00ff/x12y16pxSolidLinker.ttf?ref=$ref" --jq .content | base64 -d > /tmp/avatar-solidlinker/x12y16pxSolidLinker.ttf
gh api "repos/hicchicc/hicchicc.github.io/contents/00ff/index.html?ref=$ref" --jq .content | base64 -d > /tmp/avatar-solidlinker/author-index.html
node tools/prepare-re-modern-solidlinker-study.mjs --trk=/path/to/fixed-pwa --neo-dir=/path/to/neo --galmuri-dir=/path/to/galmuri --latin-dir=/path/to/latin --solid-dir=/tmp/avatar-solidlinker
TRK_PWA=/path/to/fixed-pwa TRK_NEO_DIR=/path/to/neo TRK_GALMURI_DIR=/path/to/galmuri TRK_LATIN_DIR=/path/to/latin TRK_SOLID_DIR=/tmp/avatar-solidlinker node tests/re-modern-solidlinker-study.test.mjs
python3 -m http.server 4179 --bind 127.0.0.1 --directory dist/re-modern-solidlinker-study
```

生成器は TTF と作者ページを SHA-256 で固定し、権利情報と既存候補を別々に表示する。FontTools によるメトリクス／cmap の検査は上記ブラウザ試験とは別に行った。比較用プレビューは利用者の設定や PWA を変更しない。正式配布や別媒体への画像公開の前には対象ライセンスと公開範囲を改めて確認する。
