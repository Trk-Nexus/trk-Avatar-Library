# trk-re-modern：PWA M3 確認と Avatar 側からの返答・検証記録（2026-11-06）

対象：[PWA 側 M3 進捗返信](https://drive.google.com/file/d/1swQzLKTaCYpCGNacNg_ZTYzGgh2LfSAN/view) と [PWA main 固定版 4b4624140757e8faddda5b5a3b8c95df992ad9ca](https://github.com/Trk-Nexus/trk-PWA/tree/4b4624140757e8faddda5b5a3b8c95df992ad9ca)。この文書は Avatar 側の**提案・限定検証**であり、PWA 側との合意や作品の公開承認ではありません。

## 1. 受け入れ範囲と実験

- PWA は作品の ZIP を読み、領域選択を保存できる。作品の実際の色適用は、共通領域が own のときの `.brand h1` の文字と `!` の2色だけ。書斎・基地の見た目、書体、適用前確認と競合を考慮した復元画面、台帳照合、移行・バックアップは未完成。作品を読み込んだだけでは自動適用しない。
- `tools/build-re-modern-draft.mjs` は未登録の `drafts/re-modern/pixel-console/skin.json` から、PWA 固定版の実装を使って**実験専用** `.stpack` を決定的に作る。`regions` は実装済み範囲を示す `common` のみ。14 色は格納するが現在使われるのは text と accent だけ。書体を含めず、heading.font の適用も主張しない。LICENSE と実験用 README を同梱。作品 ID は正式台帳にも通常スキン目録にも存在しないことを確認する。出力先は Git 無視対象の `dist/re-modern-drafts/pixel-console.DRAFT.stpack` に固定し、公開ディレクトリや正本台帳を変更しない。配布用ビルダーではない。
- 再現：`npm ci` のうえ、PWA の上記コミットをクリーンに checkout し、`TRK_PWA=/path/to/trk-PWA node tools/build-re-modern-draft.mjs`。異なる版・dirty な PWA は拒否する。ZIP バイト列は同一入力で一致する。`TRK_PWA=/path/to/trk-PWA node tests/re-modern-work-m3.test.mjs` は生成、形式、実 PWA のアップロード UI、選択、再読込、破損ファイル拒否、現状維持への復帰を確認する。Chromium 実行にはホストの共有ライブラリが必要。
- 今回の実験値：36,315 B、SHA-256 `1d0ca30fa7f6390acabfe89d70b76671beb08b6d880d414f7a4cf3026c997bba`。固定 PWA の隔離コピーとヘッドレス Chromium 133、外部リクエスト・service worker 無効で実施。読み込み時のハッシュ表示、共通題字の2色、再読込、破損 ZIP 拒否と keep 復帰を確認。ノーツ・通常スキン・書体設定を変えなかった。これは実機、支援技術、全スキン・全背景の適合証明ではない。

## 2. 要対応：通常スキン変更後の対比が再判定されない

固定版で、作品選択後に通常スキンを明るいものへ変更すると、題字に以前の inline 色が残ることを再現した。再現試験は上記の `tests/re-modern-work-m3.test.mjs`（スキン変更には通常の選択処理が使う `Trk.core.applySkin` を直接呼ぶ）。

1. 既定の暗いスキンで実験作品を読み、共通を own にし、作品を選択。題字 `#ecf6ee` と `!` `#56d994` が適用される。
2. 通常スキンを `wizard-container-query-responder` に変更。題字の背景計算は `[255,255,255]`。同じ PWA の `titlePaint` を新背景で再計算すると両色とも 4.5:1 未満で `null` となるが、実画面の inline 題字色は `rgb(236, 246, 238)` のまま。PWA の計算関数では文字対比は約 **1.106:1**。通常スキンに戻して後続テストを実施。
3. `applySkin` は `skin` イベントを出すが、固定版の作品 UI はそれを購読していない。作品 UI の再描画を起こせば判定が再実行されるが、通常スキン変更のみでは起こらない。

**お願い：** 通常スキンや題字背景の変化時にも再評価し、対比不足時に inline 色を除いて元の色に戻す回帰試験を追加してほしい。背景画像・動画・透過等の非単色背景の扱い、背景が不確定な場合の安全側の扱いも別途検討してほしい。現在の背景計算は祖先の `background-color` を黒基準で合成し、画像そのものは計算しない。この記録は実機での背景画像表示まで検証したという意味ではない。現時点で試験作品は公開せず、常用もしない。

## 3. PWA 側の質問への Avatar 側提案

1. **順序**：題字のみの小さな先行実装は妥当。ただし完成作品として見せない。上記の再判定と、安全に何が変わるかの説明・戻す操作を優先し、その後は **書斎の外枠 → 基地の UI 外枠**を一領域ずつ試す案。読書本文のテーマ・書体・文字サイズや再生映像には無断で干渉しない。どちらの領域も独立選択・共通への連動・現状維持を守る。最終的な段階と範囲は双方で調整する。
2. **題字の色**：現段階では text と accent の2色で十分。背景や枠を題字だけのために新たに変えない。14 鍵を保存できることは、14 鍵が反映されていることを意味しないと UI に明記する。
3. **対比**：4.5:1 未満を個別に落として既定色へ戻す保守的な方針に賛成。ただし「既定」も必ず適切と決めつけず、背景変更後の再評価、適用不可の理由の表示、画像・透過や強制色での確認を求める。比率計算だけで WCAG 全体に適合したとは扱わない。
4. **書体**：DotGothic は引き続き候補であり、今回の作品に含めていない。下記の照合は進んだが、既存配布物内 NOTICE 修正、上流 TTF との変換履歴、PWA の供給・字種代替、権利レビューを完了したとは言えない。題字書体の提供を確定しない。
5. **登録簿**：正本は Avatar の `catalog/re-modern/index.json`（format `trk-re-modern-registry`, version 1, `ids`、現状空）。提案は、レビュー済みの Avatar 固定コミットから**そのままの JSON の写し**を PWA のリリースに同梱し、出典 commit と更新手順を明記する形。毎回のネットワーク依存は不要。欠損・破損・未知 version・不一致は「未確認」であり、作成者認証やファイルの完全性保証と混同しない。現行の ID 一覧には個々の作品 ZIP の SHA-256 はないため、ID 一致だけではファイル同一性を証明できない。ハッシュ照合を望むなら、公開審査後に別途バージョン付き契約と正本データを定める。空の台帳は全作品を未確認として扱い、登録済みとは表示しない。未確認作品を読むかどうかや安全表示の最終仕様は PWA 側と合意する。

## 4. DotGothic の出典照合（進捗、承認ではない）

- 元作者の上流は [Fontworks の固定 commit 14517183ab2f75e8bccafc5a0bff6685d268c687](https://github.com/fontworks-fonts/DotGothic16/tree/14517183ab2f75e8bccafc5a0bff6685d268c687)。その [OFL 全文](https://github.com/fontworks-fonts/DotGothic16/blob/14517183ab2f75e8bccafc5a0bff6685d268c687/OFL.txt) は Copyright 2020 The DotGothic16 Project Authors と OFL 1.1 を記す。
- 実際の取得元として既存 SOURCE が指定する [@fontsource/dotgothic16 5.3.1](https://registry.npmjs.org/@fontsource/dotgothic16/5.3.1) の tarball を取得。tarball SHA-256 は `cefa36fda9abf959960f7773e27124c3d4792826006b93f719c1ec668595dc64`。`package/files/dotgothic16-japanese-400-normal.woff2` は 396,312 B・SHA-256 `a042e37d1a36798f5a9dee9ab81d2fc4204950ae1729b856e4d22833a61997ee` で既存 `.stpack` 内のフォントとバイト一致。tarball の LICENSE と既存 `.stpack` 内 `fonts/OFL.txt` は SHA-256 `335d6a81ce1afcf64c8bc36334458ba3292ca6fba5d3974895b3ed84ccee530e` で一致。npm の metadata は Google Fonts を source、Fontworks を attribution とする。
- これは npm 版と既存配布物のバイト一致であり、作者上流 TTF から npm WOFF2 への変換手順や全字形の同一性を証明しない。取得元と作者上流を混同しない。
- `font-packs/dotgothic/SOURCE.json` の作者上流 URL は固定版に訂正した。**SOURCE.json は配布 ZIP に入らない**。既存 `NOTICE.md` と既存 `.stpack` 内の旧 URL はまだ修正していない。修正には配布 ZIP・目録ハッシュの変更と再検証を伴うため、別途レビューして整合した配布更新として行う。404 の旧 URL だけで権利違反と断定しない。

## 5. 次の作業

PWA 側に上記の再判定問題を共有し、優先順位と台帳写しを協議する。Avatar 側では DotGothic の配布済み NOTICE と目録を整合させる修正をレビューし、書体供給・字種・代替を確認する。作品の実機／支援技術確認、独立レビュー、権利確認、作品紹介ページと台帳登録は未完了。実験 ZIP を完成品として掲載・公開しない。
