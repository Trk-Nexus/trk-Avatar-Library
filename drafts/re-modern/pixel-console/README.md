# ピクセル・コンソール：正式作品に向けた制作案

2026-11-06 ／ **制作中・未承認・未登録・未公開**

## 作品の狙い

「ドットの秩序は残し、読むための文字は犠牲にしない」。既存 `pixel-8bit` の暗い舞台・限定色・角形を出発点に、静かな画面と読みやすい説明を重ねる。特定機種やゲームの復元ではない。元作品は変更しない。

[`skin.json`](skin.json) は、正式登録を目標にした**完全な1作品分の制作データ**。日本語・英語・中国語・韓国語のラベルと説明、用途別の色、文字、任意のノーツ提案を含む。正本 `catalog/skins.json` や `catalog/re-modern/index.json` には入っていない。将来の登録時に、このディレクトリを無検証でそのまま配布しない。

| 役割 | 制作値 | 意図と注意 |
|---|---|---|
| 背景／舞台 | `#10151a` | 情報を落ち着かせる暗い面 |
| パネル | `#172229` | 情報のまとまりを背景から分ける。固定PWAの変換では `rgba(23,34,41,0.96)` |
| 本文／補足 | `#ecf6ee`／`#b8c9bd` | 読む文字と補助説明を区別。見た目の快適さは人による確認が必要 |
| 操作の強調／その上の文字 | `#56d994`／`#092016` | 緑の強調に暗い文字。色だけに状態を依存しないことは実画面で別途確認 |
| 提案ノーツ | ドン `#ff8069` 四角、カッ `#69b8ff` ひし形 | **任意**のおすすめ。選択するだけでは共通ノーツを変更しない |
| 文字 | 本文・タイトルとも `system-ui, sans-serif` | この制作データでは書体バイナリを同梱しない。端末ごとの実書体と字種は異なる |
| 動き／映像 | 作品固有の映像フィルタなし | PWAの共通演出・動画が停止するわけではない |

`DotGothic16` は見出しの候補であり、**この制作データにもPWA見本にも読み込んでいない**。既存の DotGothic パックの出典リンク404、配布物の整合、実ファイルのライセンス・欠字・配布条件を引き続き確認する。具体的な資料と既存パックの測定は [第1案の研究記録](../../../docs/re-modern-research/01-pixel-console.md) を参照。

## 設定資料を読み込んだ確認

制作前に [コンセプト](../../../docs/trk-re-modern-concept.md)、[ガイドライン](../../../docs/trk-re-modern-guidelines.md)、[紹介書式](../../../docs/trk-re-modern-introduction-template.md)、`AGENTS.md` を読み、2026-11-06 に `npm run check:re-modern` を実行した。ゲートは文書の非空存在と登録構造を検査するが、制作時に人やエージェントが内容を正しく読んだことや、レビューの実在は証明しない。

同日 Modern Web Guidance の公開ソース `main` を取得し、commit `9892dcc2d88f358386355bfce9fcfbba348c55c9` の [Color](https://github.com/GoogleChrome/modern-web-guidance-src/blob/9892dcc2d88f358386355bfce9fcfbba348c55c9/guides/visual-design/color/guide.md)、[Typography](https://github.com/GoogleChrome/modern-web-guidance-src/blob/9892dcc2d88f358386355bfce9fcfbba348c55c9/guides/visual-design/typography/guide.md)、[Motion](https://github.com/GoogleChrome/modern-web-guidance-src/blob/9892dcc2d88f358386355bfce9fcfbba348c55c9/guides/ui-behaviors/motion/guide.md)、[Accessibility](https://github.com/GoogleChrome/modern-web-guidance-src/blob/9892dcc2d88f358386355bfce9fcfbba348c55c9/guides/accessibility/accessibility/guide.md) を `contrast`、`forced colors`、`color alone`、`prefers-reduced-motion`、`resize`、`zoom` で検索・確認した。色以外の区別、文字の200%拡大、強制色、動きの軽減、フォーカス表示を検証項目に反映したが、資料を読んだことは作品の適合を証明しない。

## 一時PWAへの読み込み・選択・復帰

[再現テスト](../../../tests/re-modern-pixel-production-browser.test.mjs) では、クリーンな固定PWA `f7b1272547f712d9a7d7a198404148457e936008` を一時コピーし、**現在の正本291種と制作案**を一時的に結合。テスト専用の「制作案・一時テスト」巻を作り、既存インポータで生成した。テスト用の巻は正式なカテゴリー棚の合意や実装ではない。

Linux sandbox、Playwright Core 1.50.1／headless Chromium 133.0.6943.0、新規プロファイル。サービスワーカーは無効化、テストサーバー外への要求を遮断した。結果：

1. 本体が制作案のIDを読み込み、テスト用巻を選択し、日本語名で検索して棚に表示できた。
2. 棚のカードから選択すると、背景・本文・本文とタイトルの書体変数は制作データに対応。**共通ノーツは変更されなかった**。
3. 再読み込みしても選択が残り、棚から元のスキンに戻してもノーツは変わらなかった。
4. 固定PWAの色検査ではこの案の問題0件・holdback 0件。全体の既存holdbackは33件。これは今回の**正本291種をベースにしたテスト条件**の数であり、以前の研究時の未マージ配色を含む履歴差分ベースで報告した11件とは同じ条件ではない。数値はPWAの全表示・全スキンのWCAG適合を示さない。
5. ブラウザコンソールの未処理エラーはなかった。色選択器、ゲームでの視認性、元のカスタムノーツの人手による復帰、実機・支援技術はこのテストの対象外。

```sh
npm ci
TRK_PWA=/path/to/clean-fixed-pwa node tests/re-modern-pixel-production-browser.test.mjs
```

Chromiumが使える環境が必要。sandboxでは別途ビルドしたNSS/NSPRの共有ライブラリを使用した。検証用に Noto Sans JP（Google Fonts commit `24ddc1f324cac5d9f5aedca126d298f56e3f1640`）を環境側に用意したが、この制作データには含めていない。Firefox・Safari・モバイル・実機は未検証。

### 見本の起動方法

```sh
TRK_PWA=/path/to/clean-fixed-pwa PORT=4175 node tools/preview-re-modern-pixel.mjs
```

固定PWAの一時コピーだけを配信する**確認用**。設定 → 見た目 → スキンの棚 → 巻「制作案・一時テスト」→「ピクセル・コンソール」で試す。元のPWAや正本を変更せず、停止時に一時コピーを削除する。ブラウザの設定・保存はそのプレビューのオリジンに残りうる。テスト用の場であり、実際の個人データを使うことや公開配布を想定しない。自動検査はサービスワーカーと外部要求を遮断したが、手動見本のPWA本体には既存の通信機能があるため、動作時に外部通信がないと保証しない。

## 補足：既存の「書体の組み合わせ」

今回、従来の調査で見落としていた固定PWAの機能を確認した。設定の「書体の組み合わせ」に **「電子ゲーム」**（`denshi`）があり、題字向け `TrkDotGothic` と説明向け `TrkZenKaku` の指定を持つ。[実装](https://github.com/Trk-Nexus/trk-PWA/blob/f7b1272547f712d9a7d7a198404148457e936008/js/typography.js) と [適用先](https://github.com/Trk-Nexus/trk-PWA/blob/f7b1272547f712d9a7d7a198404148457e936008/css/style.css) によると、一部の見出し・`.hint` 等に適用し、ゲームcanvasには適用しない。

新規プロファイルのテストでこの組を選ぶと `--trk-typo-display` に `"TrkDotGothic",system-ui, sans-serif` が設定され、「使わない」に戻せた。フォントフェイスは追加されていない。**組を選ぶだけでは書体はインストールされず**、使えるファイルがなければ代替になる。書体パックを有効化したときの本文、スキン、ノーツ、設定保存・解除の影響は未検証であり、この機能だけで本作品への見出し専用供給が解決したとは言えない。選択は利用者共通の設定で、スキン選択時の自動変更はしない。

## 正式登録までに残ること

- 実際のPWAで色・透明・操作面・フォーカス・強制色・縮小／拡大・狭い画面・映像背景・キーボード・読み上げ等を評価する。今回のスクリーンショットは色の目視の参考であり、適合や操作性の証明ではない。
- 元作品や既存のドット風作品と見比べ、作品らしさ・読みやすさ・利用者の体験を人が確認する。中国語・韓国語を含む文言はネイティブ確認未実施。
- DotGothic16採用の可否、権利、正しい出典とファイル、供給方法、字種とロード失敗時、本文と設定の副作用を決める。system系のまま進む場合も端末差を説明する。
- ノーツおすすめは共通設定を保存し、スキンを変えても自動では元に戻らない。注意・現在値の控え・手動復元を人が試す。ノーツの視認性と形状も確認する。
- 検査環境の拡張・実機・当事者評価、PWA側との互換・書斎／基地への独立適用の協議、公開紹介ページ・検索・正式記録の準備を行う。
- **別の人**が証拠とページを照合し、判断・日付・未解決事項を記録する。レビューがまだないため承認済みと書かず、ガイドラインの正本登録・公開ゲートを迂回しない。

関連：[制作の方向と限定テスト](../../../docs/re-modern-research/02-pixel-console-direction.md) ／ [カタログ・書斎・基地](../../../docs/re-modern-research/03-catalog-and-spaces.md) ／ [研究用の静止見本](../../../docs/re-modern-research/pixel-console-preview/index.html)。
