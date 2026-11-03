# Issue #35 レビュー対応メモ（2026-11-03）

対象はレビューの main `82dc295`。ZIP の指摘を現行コードと照合した。

- M1–M5: `until-found` と排他 `name` を外し、全セクションの表示・全展開を修正。フェードの方向と対象、accent-color のセレクタ、重複する reduced motion 設定を修正。OS の動き軽減は常に適用し、手動設定は従来の一つに統合。
- M6: 指摘された効かない 7 項目を取り下げた。さらにカーソルアニメーションも対象の `.cli-cursor.pulse/bounce/rotate` が存在しないため取り下げた。19 項目から重複 1 と無効 8 を除き、10 項目。旧 localStorage キーは削除せず参照しない。
- M7: Chromium で表示・一括開閉・フェード・accent・reduced motion・保存とリセットを検査。文字列を端末で HTML として実行しないこと、サブパス配信・別アプリのキャッシュ保持・オフラインも確認。CI と `npm test` に組み込んだ。
- 端末入力の `innerHTML`、`position-try-options`、文書リンクと提案書名を修正。manifest は相対 URL と実在するアイコンを用い、SW は自アプリの接頭辞付きキャッシュだけを削除する。以前の `trk-v...` は別アプリと区別できないため削除しない。

## 未解決・判断待ち

- この倉庫の `npm run check` は 291 種中 62 種だけが対象（229 種スキップ）で、色の全組み合わせは見ていない。別途、trk-PWA の v3 検査（main `48147c46a1caa8f4413aeea007579e7b07120f30`）を同じ目録に実行すると、**62 種中 18 種・23 件**のコントラスト指摘が残る。レビュー時の「23 種」とは版・集計が異なる可能性があるため、同一視しない。目録の色は今回変更していない。アプリ側の補正と目録での修正範囲を検討する必要がある。
  対象 ID: `wizard-alchemy`, `wizard-cauldron`, `wizard-void`, `wizard-hermetic`, `wizard-necromancer`, `wizard-sudo`, `wizard-tmux`, `wizard-solomon-key`, `wizard-agrippa`, `wizard-heptameron`, `wizard-arbatel`, `wizard-liu-tao`, `wizard-wei-liao-zi`, `wizard-vegetius`, `wizard-machiavelli`, `wizard-mahan`, `wizard-aura-caster`, `wizard-view-transition-master`。
- Pages で公開するかは未決定。公開する場合の既知の manifest / SW 問題は安全側に修正したが、公開や実機でのインストールを承認・確認したものではない。
- Wizard 62 種を trk-PWA の 24 種から増やすか、同アプリの LETTER の許諾・運用は未決定。`TRK_PWA_REF` は上げていない。版名の変更も別途検討する。
