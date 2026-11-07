# 四角い文字をたどる：ピクセル・コンソールの候補と分かれ道

2026-11-07／作品の[完成候補をまとめる作業](25-pixel-console-candidate-brief-2026-11-07.md)に添える**調査の読み物・制作資料**。作品案は依頼者が承認済みだが、書体の採用や配布、この記事の公開は別の判断。ここでいう「よい」は用途に対する仮説であり、各言語の読み手・実機・権利の確認を経た「最良」ではない。

## 始まりは、古い画面のコピーではなく

元になった [`pixel-8bit`](../../skin-volumes/glitch/items/pixel-8bit.json) には、暗い舞台、限定した色、四角いノーツ、`Press Start 2P` という書体名がある。そこから引き継いだのは、特定のゲーム画面そのものよりも、**限られた要素が並ぶ秩序と電子的なリズム**だった。新しい案では、読むための面を静かに保ち、短い文字にだけその表情を持たせようとしている。[初期の研究](01-pixel-console.md)と[承認された制作案](../../drafts/re-modern/pixel-console/README.md)を参照。

ここでひとつ、意外な分かれ道がある。元データの「フォント名」と、読者の画面で実際に読み込まれる「フォントファイル」は別物だ。指定名があるだけでは、端末に書体があるか、本文にも適用されるか、失敗後にどう見えるかは分からない。さらに作品の名前は日本語だけではない。「四角くて雰囲気が合う」だけでは、一つの答えにできない理由がここから出てくる。

## 手がかり1：ゲームの文字から、短い見出しへ

元作に名前があった **Press Start 2P** の[作者 README](https://github.com/codeman38/PressStart2P/blob/41826487a3d18e4e97f6e6ac166a376a79d1a7fa/README.md) は、1980年代のアーケードゲームの書体に基づき、英小文字も使う字形として1986年の例を挙げている。これは書体作者の説明であって、元スキンの作者が同じ歴史を意図した証拠ではない。作者は ASCII 以外の欧州向け文字、ギリシャ文字、キリル文字も挙げているが、**今回この書体のバイナリ・字種や描画を測っていない**。同じ固定資料の[ライセンス](https://github.com/codeman38/PressStart2P/blob/41826487a3d18e4e97f6e6ac166a376a79d1a7fa/LICENSE.txt) は OFL 1.1 と Reserved Font Name `Press Start` を記す。別の形式や配布元のファイルも同じだと推測しない。

日本語の短い見出しへ問いを移すと、Fontworks は **DotGothic16** を16×16ゴシックのビットマップを基にした書体と[説明](https://github.com/fontworks-fonts/DotGothic16/blob/14517183ab2f75e8bccafc5a0bff6685d268c687/README-JP.md)している。画面全体を16ピクセルの格子に揃える必要はなく、作者の可読性についての説明も、今回の端末・大きさでの人の評価とは分ける。実際の比較用 WOFF2 は Fontsource の日本語 subset で、作者資料の固定 commit がその WOFF2 のビルド元だと証明したわけではない。[実ファイルの来歴](11-dotgothic-distribution-inventory-2026-11-07.md)。

この二つから得た仮説は、「歴史らしい一書体を全画面に使う」ではなく、**短い題字と長文を別の役割として扱う**こと。元の表現を大切にしつつ、本文や利用者が選んだ書体設定を守りたい。現行制作データ自体は system 系であり、この仮説をPWAに実装済みという意味ではない。

## 手がかり2：日本語の次に韓国語を見る

固定 DotGothic16 subset の cmap を読むと、現在の韓国語作品名 `픽셀 콘솔` の4種類のハングルは含まれていなかった。そこで見つけた **NeoDunggeunmo** は、作者が DOS 用ビットマップ書体を出発点とし、元にない字形も加えたと[説明](https://github.com/neodgm/neodgm/blob/cbe9a3c6b7067c62612570ee1261b39a31e5061b/README.en.md)している。単なる「昔の書体そのもの」ではなく、現代の環境で使うための作者による別の成果物である。

研究に使ったのは作者の [webfont 固定版](https://github.com/neodgm/neodgm-webfont/tree/e0a715695c457d3f8ccd071f88cd71b376a5a23e) `v1.601`。Dot の次に Neo を置いた隔離見本で、Chromium は韓国語4字を Neo、空白を Dot で描画した。[研究15](15-korean-font-fallback-study-2026-11-07.md)／[研究23](23-multilingual-font-review-study-2026-11-07.md)。二つを並べた印象の一貫性、韓国語として自然な字形、異なる端末での混植は、読み手の確認を待つ。

## 手がかり3：一書体で同じ文字列を持てるか

二書体を読み込むと版・ライセンス・失敗時の扱いも二つになる。そこで「**同じ短い文字列を、一書体の別候補で比較すると何が変わるか**」を調べた。これは既存の二書体案を撤回する判断ではなく、比較範囲を広げる実験。

**Galmuri11** は、作者が携帯ゲーム機 Nintendo DS の文字デザインに着想を得たとする [Galmuri の README](https://github.com/quiple/galmuri/blob/71e1cacf1437a11220307120e63e30bc275312d4/README.md) にある一書体。README は機種名が商標でありプロジェクトは Nintendo と無関係とも記す。本作品もその機種の復元や公認を意味しない。作者はグリフの出自や法的見解にも言及しているが、それを当方が一般的な権利判断として採用したわけではない。**出自と日本を含む配布・公開先の権利条件は別途人が確認する。**

作者配布の固定 commit `71e1cacf1437a11220307120e63e30bc275312d4` の [`dist/Galmuri11.woff2`](https://github.com/quiple/galmuri/blob/71e1cacf1437a11220307120e63e30bc275312d4/dist/Galmuri11.woff2) は **505,400 B**、SHA-256 `8bad9322b3340bfb5cb26cb00f4752bf4c8e7d1b526bb07205f4af458eebed31`。同じ固定 commit の [`dist/LICENSE.txt`](https://github.com/quiple/galmuri/blob/71e1cacf1437a11220307120e63e30bc275312d4/dist/LICENSE.txt) は作者 Lee Minseo の著作権表示と OFL 1.1、SHA-256 `86a3ee9495f942f0243f18c103da9faca27adb88142613edb8bb852e56c892c1`。対象ファイルの表示先頭に Reserved Font Name の指定は見当たらない。README は複数の書体・範囲を区別しており、他の太さや版まで同じ結果としない。

同 commit では `package.json` に `2.40.3` と記載がある一方、リポジトリの[リリース一覧](https://github.com/quiple/galmuri/releases/tag/v2.40.4)には `v2.40.4` がある。**バージョン名だけを同一性の根拠にせず、今回の候補は commit・ファイル・hash で固定した。** 別版や npm 配布物との同一性は確認していない。

### 文字の存在を比べると

以下は [比較試験](../../tests/re-modern-candidate-comparison.test.mjs)の cmap 上の結果。空白を除く**個別コードポイント**を見ており、文字列全体の描画・結合・字形・自然さは保証しない。「あり」はその試料の対象文字があるという意味で、言語全体の対応ではない。

| 試料 | Dot 日本語 subset | Neo 作者 WOFF2 | Galmuri11 固定 WOFF2 | 次に見ること |
| --- | --- | --- | --- | --- |
| `trk!` | あり | あり | あり | 題字の実寸・字間。 |
| 現在の日本語／英語作品名 | あり／あり | 日本語は9種類欠ける／英語はあり | 両方あり | 日本語の形と英字の組み合わせを人が比較。 |
| 現在の中国語 `像素控制台` | あり | 5字欠ける | あり | 地域に適した漢字か。収録と字形の妥当性は別。 |
| 現在の韓国語 `픽셀 콘솔` | 4種類欠ける | あり | あり | 韓国語話者による自然さ・混植・字間。 |
| 中国語の別例 `你好` | `你` が欠ける | 両字欠ける | `你` が欠ける | 同じ中国語の別文でも不足し得る。用途の範囲と fallback が必要。 |
| 韓国語の別例 `한글` | 両字欠ける | あり | あり | これも2文字の例にすぎない。 |
| 分解した Hangul Jamo `픽` | 3種欠ける | 3種あり | 3種欠ける | **結合・正規化・描画は未検証**。事前合成された `픽` の存在とは別。 |
| `❤ 🎵` | 2種欠ける | 2種欠ける | 2種欠ける | 記号・絵文字を想定するなら他の対応方法を検討。 |

隔離比較見本の Chromium 133 では、Galmuri11 一書体で `trk!` と4言語の作品名を描画したことを DevTools の情報で確認できた。これは候補の字形がよいこと、全端末で動くこと、利用者の端末 fallback があることを意味しない。見本は JS 不要、初期 system 系で、選択時にのみローカルの書体を要求する。書体の読み込みが失敗しても残りの書体や端末に代替される**比較ページ**であり、両書体揃うまで実作品に適用しない研究案の実装ではない。書体を使用者の設定に保存・適用しない。

### 一書体なら、必ず軽くて簡単？

| 方向 | この固定ファイルで分かること | 判断を保留すること |
| --- | --- | --- |
| Dot ＋ Neo | 396,312 + 44,352 = **440,664 B**。今の4言語作品名を二書体の cmap が補う。[別々の OFL と状態モデル](22-font-rights-distribution-study-2026-11-07.md)を研究済み。 | 二つの資源・字形の調和・予約名・失敗時・個別ライセンスの表示。 |
| Galmuri11 単体 | **505,400 B**。今の4言語作品名の個別文字は cmap にある。今回の二書体合計より **64,736 B 大きい**。一つの資源でも他の文章や記号は不足し得る。 | 現物の人手評価、作者が記述する出自と対象地域での権利、各言語の字形、PWA受け口、実際のパック容量・更新。 |
| 端末 system 系 | 新たな書体ファイルを送らない。利用者の既存環境を尊重する基準として重要。 | OS ごとに実書体・字種・見た目が異なり、作品の表情や表示品質は保証できない。 |

上記のバイト数は WOFF2 **単体の合計**で、ライセンス・ZIP・索引・保存容量は別。現行 PWA の作品 ZIP は 256 KiB 上限でフォントファイルも許可しておらず、いずれもその形式へ入れればよいという話ではない。別の拡張と設定棚の検討が必要。[研究16](16-font-pack-settings-shelf-design-2026-11-07.md)。

## もう一つの寄り道：英字の表情

[Pixelify Sans の Google Fonts 固定資料](https://github.com/google/fonts/blob/86aced91de05cd4f96a06838124cca45be337b2b/ofl/pixelifysans/METADATA.pb) は、Stefie Justprince を designer、display 用、400〜700 の可変ウェイト、latin／latin-ext／cyrillic を記している。作者の[ソース](https://github.com/eifetx/Pixelify-Sans/tree/39df74aba80df8157546034b878e8be1eb565ced)にもたどれる。OFL と著作権表示は[対象資料](https://github.com/google/fonts/blob/86aced91de05cd4f96a06838124cca45be337b2b/ofl/pixelifysans/OFL.txt)を参照。

英字題字の別の表情を考える**調査先**として面白いが、この場ではバイナリ・cmap・見本を確認しておらず、4言語すべてを一書体で満たすと推測しない。未確認の素材をこの比較見本・パックに加えていない。より探索するときは、まず適用したい実文字列、使用する具体的ファイル、ライセンス、実表示を固定する。

## 仮の結論と、best を決める前に

2026-11-07 の続きで、依頼者は **Dot ＋ Neo と Galmuri11 の二つを候補にすることを肯定**した。これらを多言語の比較基準として残す。作品案の承認とは別に、二候補のうち一つへの最終採用・配布を決めたという意味ではない。その後、Press Start 2P・JetBrains Mono・Fira Code・美咲フォント等について[追加調査](26-latin-japanese-font-candidates-2026-11-07.md)した。Pixelify Sans は引き続き多言語ファイル実測まで進んでいない参考資料。

「最良」の条件は、見た目だけでなく、対象となる言語・文字、読み手の自然さ、本文を守れる範囲、利用者設定、必要容量、出典・ライセンス、失敗／復元の体験、PWA の実装可能性で変わる。たとえば一書体にまとまる Galmuri は管理上の別の可能性を示すが、**今回の数値では二書体より小さくない**。中国語の別例はどちらにも不足し、字形の適切さはどちらも未評価。候補が一つ増えたことで問いも増えた。

他のスキンでは、同じ書体や同じ探し方を機械的に当てはめない。概念に応じて、文献・歴史・色・素材・動き・音・操作・地域などを手がかりに枝を伸ばし、**何を知りたいか → 一次資料 → 実物の条件 → 比較 → 未確認**を記録する。参考として面白い発見と、作品に使えるという判断は分ける。詳しい探索は価値がある一方、候補の追加ごとに対象・版・権利・人手確認を増やしてから比較する。

## 再現する場合

外部取得は制作者が明示的に行う。GitHub CLI、`base64`、Node、固定 PWA、[Neo の固定ファイル](15-korean-font-fallback-study-2026-11-07.md#ローカルで再現する場合)と実行可能な Chromium が必要。

```sh
mkdir -p /tmp/avatar-galmuri-research
gh api 'repos/quiple/galmuri/contents/dist/Galmuri11.woff2?ref=71e1cacf1437a11220307120e63e30bc275312d4' --jq .content | base64 -d > /tmp/avatar-galmuri-research/Galmuri11.woff2
gh api 'repos/quiple/galmuri/contents/dist/LICENSE.txt?ref=71e1cacf1437a11220307120e63e30bc275312d4' --jq .content | base64 -d > /tmp/avatar-galmuri-research/Galmuri-LICENSE.txt
node tools/prepare-re-modern-candidate-comparison.mjs --trk=/path/to/fixed-pwa --neo-dir=/path/to/neo-dir --galmuri-dir=/tmp/avatar-galmuri-research
TRK_PWA=/path/to/fixed-pwa TRK_NEO_DIR=/path/to/neo-dir TRK_GALMURI_DIR=/tmp/avatar-galmuri-research node tests/re-modern-candidate-comparison.test.mjs
python3 -m http.server 4177 --bind 127.0.0.1 --directory dist/re-modern-candidate-comparison
```

生成器は両既存書体・追加候補と各 LICENSE、固定 PWA、制作データを検証し、Git 管理外の `dist` に生成する。見本表示中の自動外部取得はない。`--out` の同名ファイルは上書きし、無関係な古いファイルは消さず、出力は原子的ではない。正式配布先には使わない。ファイルや画像の外部公開は別の権利確認・承認が必要。

試験は JS・Service Worker 無効の Chromium で3選択のキーボード操作、ルート文字100／200%と幅1280／390／320 CSS px、強制色・動き軽減のエミュレーション、Galmuri 遮断時の要素表示を限定確認した。**実際のズーム・他ブラウザ・実機・支援技術・読み手の評価・法的承認ではない。**
