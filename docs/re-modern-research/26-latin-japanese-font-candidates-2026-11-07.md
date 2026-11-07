# 英字の定番と小さな日本語：書体候補をもう少したどる

2026-11-07／依頼者の提案を受け、[二つの多言語候補](24-pixel-console-candidate-trail-2026-11-07.md)に加えて、英字向けの **Press Start 2P、JetBrains Mono、Fira Code** と、日本語の **美咲フォント**を調査した。さらに Source Code Pro、IBM Plex、k8x12 にもたどった。作品案の承認と別に、書体の最終採用・権利判断・公開は未決。

依頼者は **DotGothic16 ＋ NeoDunggeunmo と Galmuri11 を多言語の主な比較基準**として肯定し、さらに **Press Start 2P をピクセル・レトロやドットらしさを見る英字のサブ基準候補**として選んだ。計3候補だが役割は同じではない。Press Start 2P を多言語2案の代替や必須の追加フォントとはしない。今回の Latin subset は日本語作品名を持たない。`trk!` や英語名で比較し、実際の PWA 共通題字と作品の4言語名は別、適用先や組合せは未決。

## なぜ英字向けの書体も面白い？

「ピクセル・コンソール」の出発点 `pixel-8bit` は Press Start 2P という名前を指定していた。一方、コンソールという言葉からは、ゲームの画面だけでなく、等幅文字が並ぶ端末やプログラミング画面も連想できる。**ドット感の強い題字**と、**端末の文字を思わせる静かな題字**は、同じ作品の中でも違う解釈になるかもしれない。これらは制作側の仮説であり、元作者の意図を断定するものではない。

| 書体 | 作者資料からたどれること | 今回考える役割と注意 |
| --- | --- | --- |
| **Press Start 2P（英字サブ基準）** | [作者 README](https://github.com/codeman38/PressStart2P/blob/41826487a3d18e4e97f6e6ac166a376a79d1a7fa/README.md) は、80年代のアーケードゲームの字形を基にし、ASCII 以外に欧州向け・ギリシャ・キリルも挙げる。 | 出発点へのつながりがある英字題字候補。今回使ったのは **Latin subset** であり、書体全体の文字範囲ではない。 |
| **JetBrains Mono** | [作者 README](https://github.com/JetBrains/JetBrainsMono/blob/19371302b95d218af43299bce79ddbddd0bc364d/README.md) は開発者向け書体として説明し、合字を含む既定版と、合字を含まない `NL` 版を区別している。 | 等幅の端末的な印象を比べる候補。今回の作者 WOFF2 に `Привет` と `Γειά` の各文字はあるので、書体全体を「英語だけ」とは呼ばない。NL 版は今回測っていない。 |
| **Fira Code** | [作者 README](https://github.com/tonsky/FiraCode/blob/ecd367b040ad92a28b64fa93135775f7e2417b37/README.md) はプログラミング用の複数文字の合字、文字や記号の選択肢を説明する。文字列そのものと、合字としての表示は別。 | コンソールらしさの比較候補。今回の Latin subset のギリシャ・キリル例は欠けるが、[Google Fonts の全体メタデータ](https://github.com/google/fonts/blob/86aced91de05cd4f96a06838124cca45be337b2b/ofl/firacode/METADATA.pb) は別 subset を列挙しており、書体全体が英語のみとは言えない。 |

合字はコードの意味を変えない表示機能というのが Fira Code 作者の説明。ただし、記号の見分けやすさは好み・文脈・ソフトウェア設定に左右される。今回の作品はコードエディターではなく、**合字があることを必須・自動適用することは提案しない**。見本に記号を置いたが、合字の形・オンオフ・読みやすさの自動判定はしていない。

## 実際に比べたファイルはこれ

版・形式・subset を揃えずに、数字を「どの書体が最も軽い」と比較しない。下は各自の**特定の WOFF2 単体**で、license やパック・他の言語の subset は含まない。

| 参考候補・入手経路 | ファイル | サイズ・SHA-256 | 付属する権利情報 |
| --- | --- | --- | --- |
| Press Start 2P | [`@fontsource/press-start-2p@5.3.0`](https://registry.npmjs.org/@fontsource/press-start-2p/5.3.0) `package/files/press-start-2p-latin-400-normal.woff2` | 12,512 B／`afec86997fdaf54af1f59358fa2c1e2a0f1d04146edad18e5cd141d0384a7548` | npm 配布の `package/LICENSE`、OFL 1.1、著作権表示と Reserved Font Name `Press Start 2P`。LICENSE SHA-256 `98e451fe911e5ee4a1a45359535dc30ea7df28b8d9a9cd1f741778efab1387ee`。 |
| JetBrains Mono | [作者 commit `19371302...`](https://github.com/JetBrains/JetBrainsMono/blob/19371302b95d218af43299bce79ddbddd0bc364d/fonts/webfonts/JetBrainsMono-Regular.woff2) `fonts/webfonts/JetBrainsMono-Regular.woff2` | 92,380 B／`f1a7a03672cdd494ce0d5543fac6e4360fe22403c6de297fdc2e55a815f7baff` | [同 commit の OFL](https://github.com/JetBrains/JetBrainsMono/blob/19371302b95d218af43299bce79ddbddd0bc364d/OFL.txt)、JetBrains Mono Project Authors。SHA-256 `a76abf002c49097d146e86740a3105a5d00450b1592e820a1109a8c5680cd697`。 |
| Fira Code | [`@fontsource/fira-code@5.3.0`](https://registry.npmjs.org/@fontsource/fira-code/5.3.0) `package/files/fira-code-latin-400-normal.woff2` | 23,312 B／`6dc9da171ccea71d525379ee1cbf51d143e31acac330a251bb71b3d6060e687c` | npm 配布の `package/LICENSE`、OFL 1.1、Fira Code Project Authors。SHA-256 `126cd7bf732b86f42885f1fbf682e6aeea456672c7fdb99f2d557ec44e468a28`。 |

Press Start 2P の[作者資料の LICENSE](https://github.com/codeman38/PressStart2P/blob/41826487a3d18e4e97f6e6ac166a376a79d1a7fa/LICENSE.txt) は別の著作権表示と Reserved Font Name `Press Start` を記している。**実ファイルに付いた表示を混ぜず、作者版と今回の Fontsource 版を同一物と扱わない。** 各書体の OFL・予約名・改変／サブセット・頒布条件は対象物について人が確認する。

Fira の `latin-400-normal.woff2` は [試験](../../tests/re-modern-latin-study.test.mjs)で OS/2 の weight 400 と確認した一方、Chromium 133 は内部 family 名を **`Fira Code Light`**、PostScript 名を `FiraCodeLight-Regular` と報告した。FontTools 4.60.1 でも内部 name の family `Fira Code Light`・subfamily `Regular`・full `Fira Code Light Regular`・OS/2 weight 400 を確認。ファイル名の `400` と内部名の `Light` を同じ情報として扱わない。見た目や他の配布版の weight、変換経路は未検証。

## cmap と描画：この短い例で何が分かったか

| 検査した文字列 | Press Start 2P の Latin subset | JetBrains 作者 WOFF2 | Fira Code の Latin subset |
| --- | --- | --- | --- |
| `trk!`／`Pixel Console` | すべてあり | すべてあり | すべてあり |
| 日本語名 `ピクセル・コンソール` | 9種類とも欠字 | 9種類とも欠字 | 9種類とも欠字 |
| 中国語名 `像素控制台`／韓国語名 `픽셀 콘솔` | 5種類／4種類とも欠字 | 同左 | 同左 |
| `Привет`／`Γειά` | 各文字とも欠字 | 例の各文字はあり | 各文字とも欠字 |

個別コードポイントの cmap、空白は除外。上表はこの3ファイルの一部文字列の結果であり、言語全体・字形・結合の保証ではない。Latin subset の結果を本家全ファイルの言語範囲と取り違えない。日本語・中国語・韓国語を本候補の書体だけで表示できると考えず、混植・欠字・利用者のフォールバックを別に検討する。

[英字比較見本のテンプレート](pixel-console-latin-study/index.html)は直接開くだけでは完成しない。下の手順で生成した見本では、system 系、Dot＋Neo、Galmuri11、今回の3ファイルを切り替え、共通題字・英語作品名・記号例を比較する。**日本語の本文見本は変更せず、どの書体もPWAに適用しない。** 文書内の選択状態はページから保存しない。

Linux sandbox・Chromium 133・JS／Service Worker 無効の試験で、各候補を選択した場合 `trk!` と `Pixel Console` の描画に対応する候補書体が使われたことを DevTools 情報で確認。Tab と矢印キー、本文の CSS font-family 不変、選択まで自動書体要求なし、外部要求なし、再読込初期化、6選択肢×幅1280／390／320 CSS px×ルート文字100／200%の横 overflow なしを確認した。forced colors・reduced motion のエミュレーションで要素は存在。Fira の要求遮断時は FontFace が `error` となり題字要素は残ったが、代替字形の可読性や失敗通知は確認していない。**実際のブラウザズーム、実機、支援技術、読み手の評価・合字の可否・法的承認ではない。**

## 美咲フォント：小さな文字に余白を作る

[作者の美咲フォント資料](https://littlelimit.net/misaki.htm)は、8×8ドットの日本語ビットマップフォントで、JIS 第一・第二水準をサポートすると説明する。一部の記号を除き7×7の範囲に収め、文字同士の間隔を作るという設計は、本作の「ドットと読むための余白」という問いに興味深い。資料は PC-E500 系の日本語表示用に制作した経緯、ゴシック・明朝・ゴシック第2の違い、2021-05-05 版と BDF・TTF 等を記している。

作者ページからは、8×8が読みにくい場合の別候補 [k8x12](https://littlelimit.net/k8x12.htm) にもたどれる。こちらは8×12、仮名などを変えたバリエーションもある。**美咲とは別の書体**で、今回の作品への採用や小サイズの読みやすさを意味しない。

[作者のライセンスページ](https://littlelimit.net/font.htm#license)は使用・複製・改変・再配布と無保証の条件を記している。OFL だと推測せず、実際に使用する版・形式に添付される資料と表示・改変・Web 用変換・画像公開条件を個別に確認する。作者サイトに HTML でアクセスして資料は読めたが、この実行環境では作者サイトからフォントのバイナリを取得できず、**実ファイルの hash・cmap・ブラウザ描画・日本語／英字・他言語の欠字は未検証**。非公式コピーを作者版とみなして代用せず、見本・pack にも加えていない。実ファイルの確認は、許可された環境で作者提供ファイルと付属文書を入手できてから行う。

## さらに広がる定番：資料のみの候補

- **Source Code Pro**：Adobe は[固定 README](https://github.com/adobe-fonts/source-code-pro/blob/803b7e23ec97ae58b6232ea76519a76d428ba268/README.md)で UI 環境向け OpenType と説明し、[LICENSE](https://github.com/adobe-fonts/source-code-pro/blob/803b7e23ec97ae58b6232ea76519a76d428ba268/LICENSE.md)に OFL と Reserved Font Name `Source` を記す。`@fontsource/source-code-pro@5.3.0` の配布物も調べたところ、`package/LICENSE` の先頭は `Google Inc.` で、Adobe 側資料の表示と異なった。これは違反や権利帰属を断定するものではなく、対象 WOFF2・metadata・供給経路と必要な表示をさらに照合するための保留点。今回の見本には入れていない。
- **IBM Plex Mono**：[IBM の固定 README](https://github.com/IBM/plex/blob/48e8676114c04f29033b4b53da4ec579f8846297/README.md)は UI 用途と Sans／Serif／Mono などのファミリーを紹介する。日本語・韓国語などの記述は主に **Plex Sans の別系列**についてで、Mono の1ファイルがそれらを含むと推測しない。実ファイル・文字・容量・表示・ライセンスは未確認の探索先。

追加候補は発見自体が採用・素材の配布許可を意味しない。画面画像を保存・公開する場合も、対象ファイルの条件・出所・公開範囲を個別に確認する。

## 再現する場合

固定 PWA・Neo と Galmuri は[研究24](24-pixel-console-candidate-trail-2026-11-07.md#再現する場合)の入力を用意する。英字候補は以下の明示操作で取得し、生成器は hash を検証する。Node、GitHub CLI、`base64`、`tar`、実行可能な Chromium が必要。取得は制作者が行う明示操作であり、生成器と見本自体は外部の書体を自動取得しない。

```sh
mkdir -p /tmp/avatar-latin-fonts /tmp/avatar-latin-tar
npm pack @fontsource/press-start-2p@5.3.0 --pack-destination /tmp/avatar-latin-tar
npm pack @fontsource/fira-code@5.3.0 --pack-destination /tmp/avatar-latin-tar
for name in press-start-2p fira-code; do
  arc="/tmp/avatar-latin-tar/fontsource-$name-5.3.0.tgz"
  tar -xOzf "$arc" "package/files/$name-latin-400-normal.woff2" > "/tmp/avatar-latin-fonts/$name.woff2"
  tar -xOzf "$arc" package/LICENSE > "/tmp/avatar-latin-fonts/$name-LICENSE.txt"
done
gh api 'repos/JetBrains/JetBrainsMono/contents/fonts/webfonts/JetBrainsMono-Regular.woff2?ref=19371302b95d218af43299bce79ddbddd0bc364d' --jq .content | base64 -d > /tmp/avatar-latin-fonts/JetBrainsMono-Regular.woff2
gh api 'repos/JetBrains/JetBrainsMono/contents/OFL.txt?ref=19371302b95d218af43299bce79ddbddd0bc364d' --jq .content | base64 -d > /tmp/avatar-latin-fonts/JetBrainsMono-OFL.txt
node tools/prepare-re-modern-latin-study.mjs --trk=/path/to/fixed-pwa --neo-dir=/path/to/neo-dir --galmuri-dir=/path/to/galmuri-dir --latin-dir=/tmp/avatar-latin-fonts
TRK_PWA=/path/to/fixed-pwa TRK_NEO_DIR=/path/to/neo-dir TRK_GALMURI_DIR=/path/to/galmuri-dir TRK_LATIN_DIR=/tmp/avatar-latin-fonts node tests/re-modern-latin-study.test.mjs
python3 -m http.server 4178 --bind 127.0.0.1 --directory dist/re-modern-latin-study
```

`dist` は Git 管理外で、`--out` の同名ファイルは上書き、無関係な古いファイルは消さず、複数ファイル出力は原子的ではない。正式配布先には指定しない。入力不一致は出力に触れる前に拒否する。作者サイトの書体データや見本画像を勝手に再配布しない。

## いまの位置と次の確認

二つの多言語基準候補に加え、Press Start 2P を**英字サブ基準**、JetBrains Mono・Fira Code を**比較可能な参考候補**、美咲・k8x12・Source Code Pro・IBM Plex Mono を**資料段階**に置く。人に見てもらう時は、文字の区別、作品との相性、対象領域、端末や実ズームを記録し、文字があるだけで採用を決めない。美咲の実ファイルは正規入手後に別途固定・検査し、必要なら韓国語などの補助候補との組合せも考える。PWA 設定棚の相談・正式公開は完成候補が揃った後の別判断。
