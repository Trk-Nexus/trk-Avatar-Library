# trk-Avatar-Library 開発引き継ぎ

> **最終更新：2026-11-02**（**組織を `Trk-Nexus` に移しました**（§9 の頭と `docs/2026-11-02-組織の引っ越し.md`）。セットは **r8** の 2 つ・組み合わせ 14 組・目録 30 パック）。CI が見る相手側の固定版は **trk!（trk-PWA）trk240**（`7344111`）です。
> この倉庫は **配る側**（目録・見本・`.stpack` の置き場）で、**使う側**は trk-PWA です。
> 目録の形の**正本**は trk-PWA の [`docs/LIBRARY-TRK230-2026-10-31.md`](https://github.com/Trk-Nexus/trk-PWA/blob/main/docs/LIBRARY-TRK230-2026-10-31.md) §3。
> 利用者向けの説明は [`README.md`](README.md)、権利は [`NOTICE.md`](NOTICE.md)。

## 0. この文書の使い方

| 節 | 内容 | いつ読むか |
| --- | --- | --- |
| §0.1 | 版の要約 | 経緯をざっと知りたいとき |
| §1 | 作業の基本 | 作業を始める前に |
| §1.5 | **この倉庫の今** | まずここ |
| §2 | 目録とパックの契約（アプリとの取り決め） | 目録・パックを触る前に |
| §3 | 変えてはいけないこと | 変更の前後 |
| §4 | **確かめていないこと（最重要）** | 配る前 |
| §5 | 主なファイル | 実装を探すとき |
| §6 | 直近の検証（自動検査で確かめたこと） | 検証を足すとき |
| §7 | 変更履歴（新しい順） | 経緯を追うとき |
| §8 | PR 前チェックリスト | PR を出す前 |
| §9 | 配布（Git・Release・Drive） | 配るとき |

### 0.1 版の要約

| 日付 | 中身（1行） |
| --- | --- |
| 2026-11-02 | **r10：旧 org の URL を全廃**（引っ越しの宿題）。`font-packs/<名前>/pack.json` 29 本の `url` を `Trk-Nexus` に・`release` を **1.0.0→1.0.1**（`maru-go` は 1.1.0→1.1.1）・`.stpack` 29 本を `build-pack --fetch` で**素材から作り直し**（1 本 −25 B・合計 63,103,675 B・**書体とライセンス全文は同じ**）・目録・`gallery` 2 枚・`build-set` の `README-はじめに.txt` の出どころ・**新検査 `tools/check-urls.mjs`**（追跡ファイルと `.stpack` の中を見る・CI に追加）・**`TRK_PWA_REF` を trk258（`722409a`）**に・**r10 の 2 セット**（はじめて 8,118,128 B／書体 64,197,328 B）。r9 を入れている人には 29 本とも「更新あり」が出る（同じ名前・同じ作者なので**棚に重複はできない**） |
| 2026-11-02 | **返事16（trk254 への返事）**：相手は**写しの手書きをやめて目録から機械生成**に（`sync-typography-catalog.mjs`・fixture の固定版は `7d7e5ae`・`--check` で照合）。聞かれていた 2 点に実物で返した——**縮刷版は r9 の 2 セットに入っている**（1400×2416 px・486,510 B・sha256 `74ca7054…`。`release/*.json` の `files[]` と `sets/*.json` の `files[]` の両方）・**`sha256` は各組には入れない**（top-level の 1 本＝`catalog/typography.json` の 34,194 B・`4301ac04…` で足りる）。決めごとに「**目録を変えたら返事に `sha256` を書いて先に知らせる**」を追加（`docs/2026-11-01-書体の組み合わせとエディター設定.md` §10）。r9 は**タグ push で流せた**ので B-8 の 403 は配布を止めない（Run workflow は所有者の確認用）。目録・パック・セットは不変 |
| 2026-11-02 | **レビュー（Trk-Nexus・`trk-Nexus-review-2026-11-02.zip`）を受けて直した**：`trkUse`（trk! ではどんな曲・どのスキンに合うか）を 14 組に足して**検査つき**・「雑誌の飾り」の見出しを**説明どおりひな明朝**に（データと説明の食い違い）・「電子ゲーム」の注記を角ゴに見本文をゲームの文に・「余白の書体」を**見た目の言葉**に・縮刷版に**見出しと数字/差し色の書体名**を出す（6 役すべて）・言い換え検索（丸ゴシック→丸ゴ）・README の**数字を MB に統一**して**3 手順を今のアプリ**に・`check-typography --json` に **`sha256`**（相手の写しが古くないか照合できる）・**引っ越し文書の「転送されます」を訂正**（実測：旧 URL は空リポジトリ・転送は切れている）・**`TRK_PWA_REF` を `d93d98b`**（trk252 まで）に。**r9 の 2 セット**（8,118,400 B・15 ファイル／64,198,800 B・39 ファイル）を出した（タグ push → CI が添付。`check` もタグで緑）・返事15（`docs/2026-11-02-レビューへの返事.md`）を Drive にも置いた（`1SYPA42ynizk_xSy2cSWhifCkIjxkfGxm`） |
| 2026-11-02 | **実機の通しとレビュー依頼（r8）**：相手に渡す 1 枚を用意（`docs/2026-11-02-実機の通しとレビュー依頼.md`）。**こちらの通しは機械で実施**——`build-set --check` ×2（記録と一致）・`verify-set` ×2（15／39 ファイル・入っていない 0・目録にない 0）・`check-set-app --both`（はじめて→書体＝入る 24／飛ばす 6、逆＝0／6）・相手側の**最新 main（trk252 = `9bc10e8`）**でも `check-contract` ✅（CI の固定は trk240 のまま）。**秒数だけは未測**で、§3 の記録シートで相手に測ってもらう。§4-1 の表の並び（6 と 7）も直した |
| 2026-11-02 | **組織の引っ越し（Trk-Nexus）**：リポジトリが `Trk-Nexus/trk-Avatar-Library` に移りました（相手側は `Trk-Nexus/trk-PWA`）。**転送なので中身は無傷**——ブランチ・タグ 11 本・Release（r8 が Latest）・Actions の履歴・PR #1〜#18 がそのまま。**旧 URL は転送**されます。こちらでは CI 2 本の相手側の参照先と、README／HANDOFF／NOTICE のリンク 10 か所を新しい org に直しました。**パックの中の `url`（`pack.json` → 目録）とセットの `README-はじめに.txt` の URL は、`.stpack` のバイト列を変えないため意図的に旧 org のまま**（r9 でまとめて）。経緯は `docs/2026-11-02-組織の引っ越し.md` |
| 2026-11-01 | **r8：縮刷版 1 枚・アプリ用の束・契約の確定（返事13 への返事）**：**`docs/2026-11-01-組み合わせ縮刷版.png`**（14 組を 1 枚・1400×2066・355,083 B・□ 0。`tools/render-pairings-sheet.py` が**パックの本物の書体**で描く）・**`catalog/typography-preview.json`**（アプリが 1 本で読める束・14 組＋見本 31 書体・169,841 B・`export-pairing-gallery` が作る）・**書き出しの形を合意形に**（`size` を落とす・`preset` は利用者の段階・組は `preset` を持たない・`pack` は任意）・`check-typography --json` に **`families`／`familyCount` を足すだけ**・`--json` の見本は**字数上限 `sampleLimits`**・**r8 の 2 セット**（はじめて 7,981,799 B・書体 64,062,199 B。両方に束と縮刷版が入る。r7 は見本文の折り返しを直す前だったので、公開したまま r8 で置き換え）・**r6／r7 の記録は `release/*-2026-11-01-r{6,7}.json` に保存** |
| 2026-11-01 | **書体の組み合わせと、エディターの設定の細分化（返事11のあと・r6）**：届いた **14 書体を目録に入れて 30 パック・42 ウェイト**に・**Kosugi Maru の Apache-2.0 を L16 で許す**（`FONT_LICENSES`）・**`catalog/typography.json`**（6 役・5 倍率・4 段階・**組み合わせ 14 組**）・**`gallery/pairings.html`**（題字・見出し・本文・注記を本物の書体で・エディターの試作つき・204,572 B・外部参照 0）・`tools/check-typography.mjs`／`tools/build-preview-fonts.py`／`tools/export-pairing-gallery.mjs`・**r6 の 2 セット**（はじめて 7,462,400 B・書体 63,542,800 B）・設計の経緯は `docs/2026-11-01-書体の組み合わせとエディター設定.md` |
| 2026-11-01 | **返事9（trk240）への対応**：相手の `check-set.mjs` に **`--json`（契約 version 2）**が入ったので、こちらの `check-set-app` を **数字で判定**する形に（日本語の文を読まない・trk239 でも動く）・**`--both`**（2 つを両方の順で数える）を追加し、**`release-set.yml` にもアプリの判定**を入れた・**selftest 38→40 項目**（契約 4 つの見張り＋`--have` が空振りしないこと）・**役割の書面**（書体・スキン・目録・セット・`gallery` はこちら／PWA 本体は向こう）を受け取って `TRK_PWA_REF` を **trk240（`7344111`）**に |
| 2026-11-01 | **返事7（trk239）への対応**：**2 分割を試作して、相手側の `tools/check-set.mjs` で通した**（はじめて＝6.9 MB・6 本／書体＝29.4 MB・15 本 → 2 つ目は **これから入る 10 本・22.5 MB／飛ばす 5 本**）・**`tools/check-set-app.mjs`**（相手側の道具をそのまま呼ぶ・`--have` で 2 つ目を数える）を新設して **CI と selftest（37→38 項目）**に・`check-contract` が **`setPending` の数え方**まで見る・`TRK_PWA_REF` を **trk239（`748ac03`）**に |
| 2026-11-01 | **trk236〜238 への対応（返事5）**：`check-contract` が **note／cmap／weight も「読みました」**に（値を突き合わせ）・`TRK_PWA_REF` を **trk238（`36673dd`）**に・**r6 の 2 分割**（はじめて＝書体 5 本・書体セット＝全部／**同じパックを両方に入れる**）・**セットの目録を「セットに入っているパックだけ」に絞る**（`build-set`・「見つからない n 件」を出さない）・CI が **first-set／font-set の 2 タグ**に対応（記録のタグと取り違えたら止まる）・`sets/font-set.json` と `release/font-set-notes.md` を用意（記録は r6 で）・`gallery/packs.html` を **家族名・太さ・パック名**にそろえる・`build-catalog` が note 30 文字超を ℹ |
| 2026-11-01 | **実機 OK・パックの一覧・起動時の索引の下ごしらえ**：**r5 の `.stlib` が実機で 16 パック入った**（§4-1 の 6 番が済み）・セットは **r6 から 2 つに分ける**と決定・**`gallery/packs.html`**（パックごとの一覧・「どのパックに何が入っているか」）・**`pack.json` の `fonts[].note`／`tags` を任意で書ける**ように（trk238 の「起動時にパックから索引を作る」の下ごしらえ）・trk238 への開発案 `docs/2026-11-01-実機OKと起動時の索引-開発案.md`・selftest **36 項目** |
| 2026-11-01 | **trk235 への対応（返事3）**：**`.stlib` の通し**（trk235 が「📦 セットを選ぶ」だけで 16 パックを入れる）を受けて、**`tools/verify-set.mjs`**（アプリと同じ手順の受け入れ検査・selftest 11 項目・CI と Release の前に実行）・**`check-fonts` の付け忘れを exit 2 に**・セットの `README-はじめに.txt` に「アプリが読むのは目録と `.stpack` だけ」を追記（Q8）・セット **r5**（30,832,734 B・`d2bea5a2…`）・`TRK_PWA_REF` を trk235 に |
| 2026-11-01 | **trk234 への対応（手紙 2026-11-01）**：**`gallery/fonts.html`**（書体の一覧と検索・L13／L14）・目録の `fonts[].tags`（L15）と `fonts[].bytes`・**書体パックの受け入れ検査**（L16）・セットに **`set.json`** を入れ **`.zip` と `.stlib` を同じバイト列**で配る・`TRK_PWA_REF` を trk234 に・セット **r4**（21 ファイル・29.4 MiB）・`bin-probe.stpack` を Drive から削除 |
| 2026-11-01 | **trk233 への対応**：trk-PWA 側から届いた**書体パック 14 種**を置いて **15 パック**に（届いた `.stpack` とバイト単位で一致）・目録に `fonts[].note`（L10）と `fonts[].cmap`（L11）・`licenseFile` をアプリが読むようになったので `check-contract` を集計表示に・実機チェックの手順（L12・§4-1）・`TRK_PWA_REF` を trk233 に・セット **r3**（16 パック・29.4 MB） |
| 2026-11-01 | **trk232 への対応**：書体の `licenseFile`（L7・任意項目）・`release` と目録の `version` の一致検査（L8）・**書体の中身（woff2・cmap）の検査**と見本の「🔤 同梱の書体」（L9）・`TRK_PWA_REF` を trk232 に・セット **r2**（書体パック 1.1.0） |
| 2026-11-01 | **trk231 への対応**：README の先頭に「はじめての3手順」（L1）・**Release のはじめてセット**（L2・ZIP 1つ）・目録に `colors`（L3）・パックの表（L4）・CI の相手側の版を固定＋週次（L5）・文書の検査（`check-docs`）。Pages（L6）は相談のみ |
| 2026-10-31 | **土台＋書体パック**：受け渡しZIPの中身（全スキン見本 53 種・目録・検査）を配置し、書体パックの実物（Zen Maru Gothic 400／700・OFL.txt）・目録の契約検査・決定的なパック組み立て・見本 HTML・CI を追加 |

受け渡しの経緯は [`docs/2026-10-31-受け渡しメモ.txt`](docs/2026-10-31-受け渡しメモ.txt)（元 `SETUP-このZIPの入れ方.txt`）。

## 1. 作業の基本

- 作業前に `git status --short` と差分を見て、既存の変更を破棄・上書きしない。
- Arena で指定された作業ブランチを維持し、`main` へ直接 push しない。反映は PR 経由。
- **ビルドはありません**。Node 18 以降だけで動きます（バンドラー・npm install 不要）。
- 道具は trk-PWA の **`js/zip-io.js`／`js/pack-catalog.js` をそのまま読みます**（写しを持たない）。
  場所は `--trk=/path/to/trk-PWA` → 環境変数 `TRK_PWA` → 既定 `../trk-PWA` の順で探します。
  隣に無いときは `git clone https://github.com/Trk-Nexus/trk-PWA.git ../trk-PWA`（読み取りだけ）。
- 変更したら、最低でもこれを流します。

  ```sh
  node tools/selftest.mjs              # 道具が「ちゃんと断る」か（2026-11-01 時点で 22 / 22）
  node tools/build-catalog.mjs --check # 目録が今の中身と合っているか（release と version の一致も）
  node tools/check-contract.mjs        # 目録がアプリの読み取り規則を通るか（相手側の版も表示）
  node tools/check-fonts.mjs           # 書体（woff2）が本当に読める形か・見本の字が入っているか
  node tools/export-skin-gallery.mjs --trk="$TRK_PWA" --check   # 見本が今の中身と一致するか
  for d in font-packs/*/; do node tools/build-pack.mjs "$d" --check --fetch; done   # 書体パック 15 個がフォルダと一致するか
  node tools/build-set.mjs sets/first-set.json --check          # はじめてセットが記録と一致するか
  node tools/check-docs.mjs            # README の表・内部リンク・セットの記録が今の中身と合っているか
  ```

- **相手側（trk-PWA）の版は固定**しています：CI の `TRK_PWA_REF`（`.github/workflows/check.yml` と `release-set.yml` の `env`。いまは **trk-PWA `b5e4a885163678933129cfbf4c158d37a2e84d59`**＝trk291（2026-11-06 参照））。
  trk-PWA の版が上がったら、**この1行と §7 の記録を一緒に**変えます。固定した版と `main` の両方を見るため、
  週に1回（日曜 21:00 UTC）`upstream-main` ジョブが `main` でも契約を確かめます（失敗しても全体は赤にしません）。

- **時刻を混ぜない**：目録の `updatedAt` だけが時刻を持ちます。`build-catalog --check` は `packs` だけを比べるので、
  作り直しても `updatedAt` のせいで落ちることはありません。`.stpack` は**無圧縮で決定的**（同じフォルダ → 同じ sha256）。
- 実ブラウザ・実機で見たかどうかを、自動検査の成功と混同しない（§4）。

## 1.5 この倉庫の今（2026-11-01）

| 項目 | 今の状態 |
| --- | --- |
| 目的 | trk! の見た目（スキン・書体）を**手元に並べて、見て、選んで、持ち込む**ための倉庫。GPL-3.0-or-later |
| 配るもの | `catalog/index.json`（目録）と、`packs/`・`font-packs/` の `.stpack` |
| パック | **30 件**。`packs/sample-mincho.stpack`（見本・690 B・release 1.0.0）と **書体パック 29 個**（`font-packs/*.stpack`・合計 63,103,675 B）。書体パックはどれも release **1.0.1**（`maru-go` だけ **1.1.1**）＝**r10 で URL を新 org に付け替えて版を上げた**（書体は r9 と同じ） |
| 書体パック | 日本語書体 **29 種・42 ウェイト**（OFL-1.1。**Kosugi Maru だけ Apache-2.0**）。woff2＋`fonts/OFL.txt`＋`NOTICE.md`＋スキン（色とノーツの色）。`fonts[].licenseFile` が全文を指す（L7）。**trk232 から本文の書体として本当に効く**。**trk233 からは全文もアプリで読める** |
| 見本 | `gallery/all-skins.html` = 全スキン **53 種（書体 9 種）**＋**「🔤 同梱の書体」の節（29 パック・ひとことつき）**・1 ファイル・外部参照 0・オフラインOK（85,852 B）。`catalog/skins.json` がもとデータ。`--check` でズレを見る |
| パックの一覧 | `gallery/packs.html` = **30 パック**を、中に入っている書体（family・太さ・ひとこと・タグ・対応字数・大きさ）・ライセンス・sha256 で並べる。横断検索・タグで絞り込み・パック名／大きさ／書体の数で並べ替え・**パックごとに「⬇ .stpack」**。1 ファイル・外部参照 0（44,433 B） |
| **組み合わせと設定** | `gallery/pairings.html` = **組み合わせ 14 組**を題字・見出し・本文・注記は**本物の書体**で並べ、**役ごとの書体・字間・行間、全体の基本サイズ・倍率を変えられる試作**つき（設定を JSON で書き出す）。もとデータは `catalog/typography.json`（6 役・5 倍率・4 段階）。1 ファイル・外部参照 0（204,572 B・見本の woff2 31 本を base64 で埋め込み） |
| 書体の一覧と検索 | `gallery/fonts.html` = **29 パック・42 ウェイト**を、family・太さ・対応字数・大きさ・ライセンス・ひとこと・タグ・パック名の**表**で並べる（L13）。並べ替え 4 種（50 音順／大きさ／字数／太さの数）・絞り込み 4 種（雰囲気タグ／ライセンス／2 ウェイト／大きさ）・横断検索（L14）・**行ごとに 1 本だけ落とすリンク**。1 ファイル・外部参照 0（38,804 B）。もとデータは `catalog/fonts.json` |
| 道具 | `tools/` の 16 本（下記 §5）。**`check-typography`** は組み合わせが目録に実在するかを見て、**`export-pairing-gallery`** が `gallery/pairings.html` を作る（**`build-preview-fonts.py`** が見本用の woff2 を作る・Python）。`verify-pack` は書体の path／family／weight／license／`licenseFile` と **OFL.txt の同梱**まで、`check-fonts` は **woff2 の中身（表・cmap・見本の字）**まで見る。`build-catalog` は目録に **`note`（L10）・`cmap`（L11）・`tags`（L15）・`bytes`** を入れ、**書体パックの受け入れ検査（L16・書体の license は OFL-1.1 と Apache-2.0）**を通してから書く。`export-font-gallery` が `gallery/fonts.html` を作り、`verify-set` がセットをアプリと同じ手順で開く |
| 目録の検査 | `tools/check-contract.mjs` が **アプリ自身の `sanitizeCatalog`** で 30 パックとも通ることを確認。任意項目（`licenseFile`・`note`・`cmap`・`colors`）をアプリが読むかは**1 行に集計**して出す |
| 書体のひとこと | `catalog/font-notes.json`（パックの外）に 42 書体ぶん。目録の `fonts[].note` と見本の「🔤」に出る。**パックの `pack.json` は書き換えない**（届いた `.stpack` とバイト単位で同じまま） |
| 書体のタグ | `catalog/font-tags.json`（パックの外）に 42 書体ぶん・16 語（丸ゴ／角ゴ／明朝／手書き／ポップ／ドット／極太／かすれ／かわいい／レトロ／和風／ネオン／見出し／本文／読みやすい／元気）。目録の `fonts[].tags`（8 個まで・各 16 文字）と `gallery/fonts.html` の絞り込みに入る（L15） |
| はじめてセット | `sets/first-set.json` の定義から `tools/build-set.mjs` が **1 つのセット**（見本 4 枚＋`set.json`＋目録＋**6 パック**＝見本 1＋書体 5・**7,981,799 B**・15 ファイル）を作る。定義の `extensions` で **`.zip` と `.stlib` を同じバイト列**（sha256 も同じ）で書く。記録は `release/first-set.json`、過去の記録は `release/first-set-2026-11-01.json`（r1）。いまは **r8**（`first-set-2026-11-01-r8`）。r5（16 パック・30,832,734 B）は実機で通しを確認済み。r6 は `verify-set`・`check-set-app --both`（はじめて→書体＝入る 24・飛ばす 6／書体→はじめて＝入る 0・飛ばす 6）で検査 |
| CI | `.github/workflows/check.yml`。push／PR ごとに §1 の 8 本（trk-PWA を**固定した版**で clone して実行）＋週次で `main` も検査 |
| 分担（trk240 の書面） | **書体の製作・追加・ライセンス、スキンの製作、目録とセットの組み立て、`gallery/` の 3 枚はこちら**。**アプリ本体（PWA）・受け入れの道具は trk-PWA**。受け渡しの形（目録の項目・L16・セット・`check-set.mjs`）は**両方の共有財産**で、変えるときは先に書面で知らせる（`docs/2026-11-01-返事9への返事.md` §2 に写し） |
| 未確認 | **実ブラウザ・実機**（§4）。セットのダウンロードと展開、`FontFace` で書体が当たったときの見え方、ライセンス全文の表示、16 行の一覧、**`gallery/fonts.html` の並べ替え・絞り込み・検索・1 本だけ落とす**、**r5 の `.stlib` を選んで最後まで入る通し**（相手側が 2026-11-01 に実機で確認中）。**手順は §4-1**（L12） |
| 大きさ | 倉庫は約 30 MB（`.git` を除く）。いちばん大きいのは `font-packs/klee-one.stpack` の 3.7 MB（3,929,934 B） |

## 2. 目録とパックの契約（アプリとの取り決め）

`catalog/index.json` は **trk-PWA trk230 の `js/pack-catalog.js` が読む形**です。正本は trk-PWA の `docs/LIBRARY-TRK230-2026-10-31.md` §3。

### 2-1. 目録（version 1）

```json
{
  "format": "trk-avatar-library", "version": 1,
  "name": "trk-Avatar-Library", "updatedAt": "…Z",
  "packs": [{
    "id": "…", "name": "…", "author": "…", "version": "1.0.0",
    "file": "font-packs/maru-go.stpack", "sha256": "64桁の16進", "bytes": 2936399,
    "fonts": [{ "family": "TrkZenMaru", "file": "fonts/…woff2", "license": "OFL-1.1", "weight": 400,
                "licenseFile": "fonts/OFL.txt" }],
    "license": "…", "description": "…", "url": "https://…"
  }]
}
```

| 項目 | 必須 | この倉庫の出どころ | アプリの見方 |
| --- | --- | --- | --- |
| `format` | ○ | 固定 | `"trk-avatar-library"` 以外は読まない |
| `version` | ○ | 固定 `1` | **2 以上は「読めない」として断る** |
| `packs[].name` | ○ | `pack.json` の `name`（40 文字まで） | 空なら、その1件だけ落とす。80 文字で切る |
| `packs[].file` | ○ | `packs/…`・`font-packs/…` | 相対パスで `.stpack` だけ。`..`・先頭 `/` はその1件を落とす |
| `packs[].sha256` | 推奨 | 実物から計算 | 64 桁の16進だけ。形が違えば照合しない（入れられはする） |
| `packs[].bytes` | 推奨 | 実物の大きさ | 違えば**入れない** |
| `packs[].version` | 任意 | `pack.json` の `release`（省略時 `1.0.0`） | **入っているパックの `release` と比べて「更新あり」を出す**（trk232）。`build-catalog --check` が `release` との一致を見る（L8） |
| `packs[].fonts[]` | 任意 | `pack.json` の `fonts`（`family`・`file`・`license`・任意の `weight`／`licenseFile`）＋倉庫で足す `note`／`cmap` | 目録では `family` があるものを「書体n」と表示。`licenseFile` は **trk233 から全文の表示に使う**。`note`／`cmap` はまだ持たないだけ（落とされない） |
| `packs[].fonts[].note` | 任意 | `catalog/font-notes.json`（パックの外）・60 文字まで | **trk233 は無視**（次の段で 🔎 中身に「書体の雰囲気」として出す予定・L10） |
| `packs[].fonts[].cmap` | 任意 | パックの woff2 の cmap を `build-catalog` が数える（字数） | **trk233 は無視**（「この書体に無い字はあるか」を入れる前に知らせる用・L11） |
| `packs[].fonts[].tags` | 任意 | `catalog/font-tags.json`（パックの外）・8 個まで・各 16 文字 | **trk234 は無視**（trk237 の「書体で絞る」用・L15） |
| `packs[].fonts[].bytes` | 任意 | パックの woff2 1 本の大きさを `build-catalog` が数える | **trk234 は無視**（`gallery/fonts.html` の「大きさ」用・2026-11-01 追加） |
| `packs[].license` / `description` | 任意 | `pack.json` | 200／300 文字で切って表示 |
| `packs[].url` | 任意 | `pack.json` の `url`（https のみ） | リンクにせず、項目として持つだけ |
| `packs[].colors` | 任意 | `pack.json` の `skin.colors` の `bg`／`accent`（2色） | **trk231 は無視**（trk235 以降で一覧に色の点を出す予定）。形は `check-contract` が見る |

上限：**500 パック**（超えたら `build-catalog` が断る）・名前 80 文字・説明 300 文字。

### 2-2. `pack.json`（`.stpack` の中身）

```json
{
  "format": "shadow-taiko-pack", "version": 1,
  "name": "…", "author": "…", "release": "1.0.0",
  "description": "…", "license": "…", "url": "https://…",
  "fonts": [{ "family": "TrkZenMaru", "file": "fonts/…woff2", "weight": 400, "license": "OFL-1.1",
              "licenseFile": "fonts/OFL.txt" }],
  "skin": { "name": "…", "colors": { "bg": "#…", "panel": "#…", "text": "#…", "accent": "#…", "gold": "#…" } },
  "notes": { "don": { "color": "#…", "shape": "circle" }, "ka": { "color": "#…", "shape": "circle" } }
}
```

- `release` は**配る版**（目録の `packs[].version` になる）。`url` は https だけ
- `fonts[]` は **woff2**・`family` は英数字と空白・`. _ -` の 40 文字まで・`weight` は 100〜900 の整数
- **書体を入れるときは、ライセンス全文（`OFL.txt` など）をパックに入れる**（OFL の条件。`verify-pack` が不合格にする）
- `licenseFile`（任意・2026-11-01 追加）は、その全文を指す **`.txt`／`.md` の相対パス**（256 KB まで・実在すること）。
  目録の `packs[].fonts[].licenseFile` に載り、アプリは **trk233** から全文を表示する
- `note`（ひとこと）と `cmap`（字数）は **`pack.json` には入れません**（目録だけに足す。パックのバイト列を動かさないため）
- 1 パック 500 MB まで（アプリと同じ。`js/custom.js` の `PACK_MAX`）

### 2-3. 形を守る仕組み

| 道具 | 見るもの |
| --- | --- |
| `tools/verify-pack.mjs` | 1 つのパック（ZIP・`pack.json`・色・指すファイル・書体・OFL.txt・`release`／`url`） |
| `tools/build-catalog.mjs` | 全パックを検査し、`sha256`・`bytes`・書体・版・URL・**`note`（`catalog/font-notes.json` から）・`cmap`（woff2 を数える）** を目録へ。500 件上限。`note` の書き間違いは止める |
| `tools/check-contract.mjs` | **アプリの `sanitizeCatalog` をそのまま読み込み**、1 件も落とされず値が変わらないか。任意項目（`licenseFile`・`note`・`cmap`・`colors`）をアプリが読むかは 1 行にまとめて出す |
| `tools/check-fonts.mjs` | パックの書体を ZIP から取り出し、**woff2 の中身**（署名・表・cmap・見本の字）を見る |
| `tools/export-skin-gallery.mjs` | 全スキン見本を作る／`--check` で今の中身と一致するか（`generatedAt` は無視） |
| `tools/build-set.mjs` | はじめてセット（ZIP）を作る／`--check` で記録と一致するか（決定的・`rev` で同じ日の r2 も作れる） |
| `tools/export-font-gallery.mjs` | 目録から書体の一覧と検索（`gallery/fonts.html`）と `catalog/fonts.json` を作る（`--check` で照合） |
| `tools/check-typography.mjs` | **組み合わせ**（`catalog/typography.json`）が、目録に実在する書体だけを使っているか・6 役そろっているか・ライセンス・見本の文の長さ（`--json`・`--strict`） |
| `tools/build-preview-fonts.py` | 見本用の woff2（各パックの書体から**見本の字だけ**）を `catalog/preview/` に作る（Python＋fontTools） |
| `tools/export-pairing-gallery.mjs` | **`gallery/pairings.html`**（組み合わせ 14 組＋エディターの試作）と **`catalog/typography-preview.json`**（アプリ用の束）を作る（`--check` で照合） |
| `tools/render-pairings-sheet.py` | 14 組を **1 枚の PNG** に描く（Python＋PIL＋fontTools。**パックの本物の書体**を使い、無いときだけ見本へ） |
| `tools/verify-set.mjs` | セット（`.stlib` / `.zip`）をアプリ（trk235）と同じ手順で開いて確かめる |
| `tools/check-docs.mjs` | README の表と目録の一致・内部リンク（**見出しアンカーも**）・セットの記録 |
| `tools/selftest.mjs` | 上の道具が、わざと壊した入力で**ちゃんと断る**か |

## 2.5 相手側（trk-PWA trk231〜trk233）からのお願いへの回答（2026-11-01）

trk-PWA の `README-trk-Avatar-Library-へのお願い-2026-11-01.txt`（L1〜L6）・`README-trk-Avatar-Library-確認と次のお願い-2026-11-01.txt`（L7〜L9）・
`README-書体パック14種の追加をお願い-2026-11-01.txt`（書体パック 14 種・L10〜L12・セットの版の上げ方は A）と
`docs/LIBRARY-UX-PLAN-2026-11-01.md` への回答です。

| # | お願い | この版での対応 | 場所 |
| --- | --- | --- | --- |
| L1 | README の先頭に「はじめての3手順」 | **対応**。①見本を見る ②目録とパックを落とす ③trk! の 📥 まとめて入れる、の3行の表を先頭に置き、§2 も①②③の順に並べ替えました | `README.md` 冒頭・§2 |
| L2 | Release に「はじめてセット」 | **対応**。見本 HTML＋目録＋書体パックを1つのZIPにしました（**2,993,307 B**）。`tools/build-set.mjs` で決定的に作り、`release/first-set.json` に sha256 を記録。GitHub Release `first-set-2026-11-01` に添付 | `sets/first-set.json`・`release/first-set.json` |
| L3 | 目録に `colors` | **対応**。`pack.json` の `skin.colors` から `bg`／`accent` を `{"stage","accent"}` として目録に出力（任意項目）。trk231 のアプリは無視します。形の検査は `check-contract` | `tools/build-catalog.mjs`・`tools/check-contract.mjs` |
| L4 | 「どのパックを落とすか」の表 | **対応**。名前・ファイル・大きさ・何が変わるか・書体・ライセンスの表を README §2-2 に置き、**目録とズレたら CI が落ちる**ようにしました（`check-docs`） | `README.md` §2-2 |
| L5 | CI でアプリの読み取り検査を回す・版を固定する | **対応**。`TRK_PWA_REF`（trk231 = `9bf22d7a…`）で相手側を固定し、`check-contract` を毎回実行。加えて**週1回** `main` でも同じ検査（`upstream-main`・失敗しても全体は赤にしない）。`check-contract` は読んだ相手側の版を表示します | `.github/workflows/check.yml`・`tools/check-contract.mjs` |
| L6 | GitHub Pages で見本を開けるようにするか | **保留（相談）**。オリジンが増えるため、こちらからは決めません。やる場合はアプリ側の CSP・Service Worker・共有の扱いを一緒に確認します（相手側も「急がない・範囲を絞るのが良さそう」と同意） | — |
| L7 | 書体のライセンス全文（任意の `fonts[].licenseFile`） | **対応（アプリ側も trk233 で完了）**。`pack.json` で宣言でき（`verify-pack` が形・実在・大きさを検査）、目録の `packs[].fonts[].licenseFile` に載ります。**trk233 からアプリが読むようになった**ので、`check-contract` の ℹ が「アプリが読むようになりました（22 件）」に変わりました（見直しどきの合図） | `tools/verify-pack.mjs`・`tools/build-catalog.mjs`・`tools/check-contract.mjs`・`font-packs/*/pack.json` |
| L8 | `release` と目録の `version` を必ず一致 | **対応**。`build-catalog --check` が**名前を挙げて**止めます（片方だけ上げたパック・目録にあるのにファイルが無いパック）。`verify-pack` は `release` が無いとき「ℹ」で知らせます（目録は 1.0.0 になり、更新ありが効かないため） | `tools/build-catalog.mjs`・`tools/verify-pack.mjs` |
| L9 | 実ブラウザでの見え方の確認・見本に「同梱の書体」の節 | **一部対応**。ブラウザは無いので、代わりに **woff2 の中身を node で検査**（`check-fonts`：署名・表・cmap・見本の字）。見本 HTML に **「🔤 同梱の書体」**の節を追加（@font-face なし・書体名とライセンスだけ）。実際の見え方は実機でお願いします（手順は §4-1） | `tools/check-fonts.mjs`・`gallery/all-skins.html` |
| L10 | 目録に書体のひとこと `fonts[].note`（任意・60 文字） | **対応**。`catalog/font-notes.json` に 22 書体ぶんを書き、`build-catalog` が目録の `fonts[].note` に入れます（`pack.json` は書き換えない＝届いた `.stpack` のバイト列を動かさない）。60 文字を超える・パックにない書体・目録にないパックは**止まります**。見本の「🔤」にも出ます。アプリ（trk233）はまだ読みません | `catalog/font-notes.json`・`tools/build-catalog.mjs`・`tools/export-skin-gallery.mjs` |
| L11 | 目録に `fonts[].cmap`（対応する字数） | **対応**。`build-catalog` がパックの woff2 を brotli まで解いて cmap を数え、`fonts[].cmap` に入れます（22 書体・**5,451〜6,887 字**）。アプリ（trk233）はまだ読みません | `tools/build-catalog.mjs`（`check-fonts` の `checkFont` をそのまま使う） |
| L12 | 実ブラウザでの確認の分担（作業手順を HANDOFF に） | **対応**。§4-1 に **4 点のチェック表**（書体が当たるか・太さの切り替わり・ライセンス全文の表示・16 行の一覧）と、見た記録を書く欄を足しました。こちらはブラウザを持っていないので、実機で見たら §4-1 に追記します | `HANDOFF.md` §4-1 |
| L13 | 書体の一覧ページ（1 ファイル・外部参照 0・表・並べ替え・絞り込み） | **対応**。`gallery/fonts.html`（27,863 B）。woff2 は埋めず、family・太さ・対応字数・大きさ・ライセンス・ひとこと・タグ・パック名の表。並べ替えは 50 音順／大きさ／字数／太さの数、絞り込みは雰囲気（`tags`）／ライセンス／2 ウェイト有無／大きさ | `tools/export-font-gallery.mjs`・`gallery/fonts.html` |
| L14 | 検索（1 つの入力で横断・件数と解除） | **対応**。パック名・family・ひとこと・タグ・スキン名を**日本語の部分一致**で絞る（空白で AND）。件数と「絞り込みを解除」つき | `gallery/fonts.html` |
| L15 | 目録に検索用の語を足すなら追加だけ | **対応**。`packs[].fonts[].tags`（任意・8 個まで・各 16 文字）を 22 書体に。`format`/`version`/既存の項目名は変えていません。書き間違い（17 文字・パックにない書体）は `build-catalog` が止めます | `catalog/font-tags.json`・`tools/build-catalog.mjs` |
| L16 | 書体パックを増やすときの受け入れ検査 | **対応**。`build-catalog` が目録を書く前に、OFL-1.1・`Trk` で始まる family・family＋太さの重複なし・1 本 4 MiB 以下・cmap 1,000 字以上・`licenseFile` の実在（`verify-pack`）・`note` 60 文字以下を見る。わざと壊したパックで**3 件の指摘が出て止まる**ことを確認 | `tools/build-catalog.mjs`・`tools/verify-pack.mjs` |

- 書体の `family` は `TrkZenMaru`、`weight` 400／700 の2本のまま（お願いどおり。変えていません）
- アプリは外部へ取りに行かない・`version 1` のまま・`file` は相対パスだけ、という約束も変えていません
- `check-docs` を足したので、**パックを足したら README の表も直す**のが必須になりました（CI が教えてくれます）
- **`TRK_PWA_REF` を trk232（`70fd92193f43157faafebb01ba58477eaf7087df`）に上げました**（L5 の「上がったら知らせる」を受けて）
- 書体パックを release **1.1.0** に上げ、セットも **r2** として配り直しました（同じタグは作り直さない・§9）
- **書体パック 14 種を置きました**（2026-11-01 に届いた `font-packs-src.zip` の 14 フォルダ）。`pack.json` は**そのまま**使い、
  `node tools/build-pack.mjs font-packs/<slug> --fetch` で組み立てた `.stpack` が、届いた `SHA256SUMS` の 14 本と**バイト単位で一致**しました
- セットの版の上げ方は、相手側の追記（`追記-2026-11-01-はじめてセットはA方式で.txt`）に合わせて **A（目録が変わるたびに r3・r4…）** にしました。
  r1・r2 のタグはそのまま、**r3 を新しく配ります**（16 パック・29.4 MB）

## 3. 変えてはいけないこと

1. **目録の `format` と `version`**（`trk-avatar-library` / `1`）。変えるときはアプリ側と同時に版を上げる。
2. **外部へ取りに行かない**：目録も `.stpack` も、利用者が選んだファイルだけを読む。URL の自動取得・CDN・解析タグを足さない
   （倉庫の道具が npm から素材を取るのは**ビルド時だけ**。配布物には入らない）。
3. **`sha256` と `bytes` は実物と一致**させる。目録を作り直さずに `.stpack` を差し替えない。
4. **書体のライセンス全文をパックに入れる**。`family` を変えた版を配るときは OFL の予約名に注意（`NOTICE.md`）。
5. **GPL-3.0-or-later のクレジットとソース**を消さない。パックごとの `license` は別物（同梱素材の権利は各権利者）。
6. **`.stpack` の作り方を変えない**：無圧縮（store）・決定的な並び。`build-pack --check` が CI で見ている。
7. 目録・パックの上限（500 件・500 MB・名前 40／80 文字）を超えるものを黙って出さない。
8. **`pack.json` の `release` と目録の `version` を片方だけ上げない**（アプリの「更新あり」が狂う。L8）。
9. **相手側から届いたパックの `pack.json` を書き換えない**（向こうで作った `.stpack` とバイト単位で同じでなくなる）。
   目録に足したいもの（ひとこと・タグ）は、パックの外（`catalog/font-notes.json`・`catalog/font-tags.json`）に書く。
10. **セットの中の `set.json` は「表示のため」だけ**。入れるかどうかは目録（`catalog/index.json`）が正。
    `packs` を目録と照合しない（アプリ側の trk235 も同じ扱い）。目録が無いセットは作らない（`build-set` が断る）。
11. **公開済みのタグは指し直さない**（r1〜r3 はそのまま）。目録かセットの中身が変わったら `rev` を上げる（A 方式）。

## 4. 確かめていないこと（最重要）

1. **実ブラウザ・実機での見え方**（この作業環境にブラウザも端末もない）
   - `gallery/all-skins.html` の並び・絞り込み・並べ替え、**「🔤 同梱の書体」15 パック**のカードの見え方
   - `gallery/fonts.html` の表・並べ替え 4 種・絞り込み 4 種・検索・**行ごとの「⬇ .stpack」**（スマホ幅での表の折り返しも）
   - `dist/preview/<slug>.html` の書体（`node tools/preview-pack.mjs <pack>` で作れます）
   - trk! にパックを入れたときの棚・適用後の画面
2. **書体が実際に画面に効くか**：trk232 で `FontFace` の読み込みが入りましたが、**実機では見ていません**
   （`check-fonts` で woff2 の中身と cmap までは確認済み。読み込みの成否と見た目はブラウザでしか分かりません）。
3. **`file://` で開いたときの `crypto.subtle`**（アプリ側の既知の未確認。使えない環境では「照合せずに入れる」表示になる）
4. **大きいパック**（数百 MB）を選んだときの sha256 計算の待ち時間（アプリ側。いまは `arrayBuffer()` で一括読み）
5. **目録 500 件**を一覧にしたときの重さ（アプリ側）
6. **はじめてセットの落として〜展開まで**：この作業環境からは `release-assets.githubusercontent.com` に届かないため、
   アップロード（CI）と**大きさ・sha256 の一致**までを確認しています。ブラウザでのダウンロードと展開、
   展開した中身を trk! の「📥 まとめて入れる」で選ぶところは、実機で一度見てください
   （**r5 は 29.4 MiB（30,832,734 B）**）。**r5 の `.stlib` は実機で通しが取れました**（2026-11-01・§4-1 の 6 番）
7. **書体パック 15 個を全部入れたときの保存容量**（アプリ側）：合計 **29.3 MB**（30,697,343 B）・20 ウェイト。
   端末の空きと、入れたあとの一覧の重さは実機で確かめてください

### 4-1. 実機で見るときの手順（L12・どちらが見ても同じ順で）

trk-PWA 側と「どこまで見たか」を揃えるための **4 点**です。見たら日付・端末・結果を下の「見た記録」に足してください。

| # | 見ること | 手順 | 期待 |
| --- | --- | --- | --- |
| 1 | **書体が当たるか** | trk! に `font-packs/zen-kaku.stpack` を入れて「使う」 | 本文の書体が角ゴシックに変わる。**「外す」で元に戻る** |
| 2 | **太さの切り替わり** | 2 ウェイトのパック（`maru-go`・`zen-kaku`・`kaisei-decol` など）で、太字を含む画面を見る | 本文（400）と見出し（700）で太さが変わる。**合成太字になっていない** |
| 3 | **ライセンス全文の表示** | 「🔤 同梱の書体」→「📄 ライセンス全文を読む」 | `fonts/OFL.txt` の全文が枠の中でスクロールして読める。古い版で入れたパックは「入れ直すと入ります」 |
| 4 | **16 行の一覧** | 📚 目録から入れる で `catalog/index.json` を選ぶ | 16 行がスクロールして選べる。名前・大きさ・書体・ライセンスが読める |
| 5 | **書体の一覧と検索**（L13・L14） | セットの中の `gallery/fonts.html` を開き、並べ替え・「明朝」で絞る・`見出し` で検索・行の「⬇ .stpack」を押す | 表が 15 行。件数が変わる。「絞り込みを解除」で戻る。リンクが `font-packs/<slug>.stpack` を指す |
| 6 | **セット（`.stlib`）の通し**（trk235） | 設定 → 📦 カスタムパック → 📚 目録から入れる → **📦 セット（.stlib / .zip）を選ぶ** で、r5 の `.stlib` を選ぶ | 「trk! はじめてセット（r5）・16 パック・約 29.3 MB・見つからない 0」が出て、確認 1 回で 16 本入る。**自動では適用されない**（一覧の「使う」で選ぶ） |
| 7 | **r8 の 2 つを続けて**（2026-11-01） | ① はじめてセットの `.stlib` を選ぶ → 一覧が **6 パック**になる ② 書体セットの `.stlib` を選ぶ → 「これから入る **24 本**／飛ばす **6 本**」と出る ③ 逆順（書体 → はじめて）も試す | はじめて→書体＝入る 24・飛ばす 6／書体→はじめて＝入る 0・飛ばす 6（`check-set-app --both` と同じ数字）。**所要時間を 2 行ぶん測って書く**（こちらは実機を持っていないため未測定）。**手順と記録シートは `docs/2026-11-02-実機の通しとレビュー依頼.md` §2〜3**（相手にそのまま渡せる形）。④ 入れたあと 🔤 の書体の一覧に r6 からの **29 本**が見えること、⑤ セットの中の **`docs/2026-11-01-組み合わせ縮刷版.png`** がスマホで開けること |

見た記録（日付・端末・結果）：

| 日付 | 端末 | 見たこと | 結果 |
| --- | --- | --- | --- |
| 2026-11-02 | — | **7. r8 の 2 つを続けて**（依頼中） | r8 の 2 セットを相手に渡し、`docs/2026-11-02-実機の通しとレビュー依頼.md` §3 の記録シートで**秒数をもらう**（未測のまま） |
| 2026-11-01 | 利用者の端末（trk235 の画面） | **6. セット（`.stlib`）の通し** — r5 の `.stlib` を「📦 セットを選ぶ」で選ぶ | ✅ **16 パックとも入った**（「実機で入ることは確認しました」） |

- 1〜5（書体が当たるか・太さ・ライセンス全文・16 行の一覧・`gallery/fonts.html` の操作）はまだ。見たら上の表に足す
- trk-PWA 側の書面にも同じ記録を返す予定

## 5. 主なファイル

| 場所 | 中身 |
| --- | --- |
| `README.md` | 利用者向け（見本の見方・パックの入れ方・作者向けの作り方） |
| `NOTICE.md` / `LICENSE` | 権利とクレジット（GPL-3.0-or-later） |
| `catalog/index.json` | **目録**（アプリが読む唯一のファイル・16 パック） |
| `catalog/font-notes.json` | 書体の**ひとこと**（雰囲気の一行・60 文字まで）。目録の `fonts[].note` と見本の「🔤」に入る（L10） |
| `catalog/skins.json` | 全スキン見本のもとデータ（53 種・書体 9 種） |
| `gallery/all-skins.html` | 全スキン見本（1 ファイル・外部参照 0） |
| `packs/` | 配る `.stpack`（サンプル） |
| `font-packs/` | 書体パック **15 個**の `.stpack` と、その**もと**（`font-packs/<slug>/`） |
| `font-packs/<slug>/` | `pack.json`・`SOURCE.json`（tarball と sha256）・`fonts/OFL.txt`・`NOTICE.md`（14 種は trk-PWA 側から届いたものをそのまま） |
| `tools/verify-pack.mjs` | 1 つの `.stpack` の検査（終了コード 0／1／2） |
| `tools/build-pack.mjs` | フォルダ → `.stpack`（`--check`・`--fetch`・`--json`） |
| `tools/build-catalog.mjs` | 目録の作成と `--check` |
| `tools/check-contract.mjs` | 目録がアプリの規則を通るか（trk-PWA 必須） |
| `tools/preview-pack.mjs` | パックの色と書体を埋め込んだ見本 HTML（`dist/` は gitignore） |
| `tools/check-fonts.mjs` | パックの書体（woff2）の中身を見る（署名・表・cmap・見本の字） |
| `tools/build-set.mjs` | セットを作る（`--release` で記録・`--check` で照合・`rev` で r2／r4・`extensions` で `.zip`＋`.stlib`・中に `set.json`）。**2026-11-01：目録を「セットに入っているパックだけ」に絞る**（`scopeCatalog`・絞ったときは記録に `scoped`／`source`） |
| `tools/export-font-gallery.mjs` | 目録から **`gallery/fonts.html`（書体の一覧と検索）** と `catalog/fonts.json` を作る（`--check` で照合・L13／L14） |
| `tools/export-pack-gallery.mjs` | 目録から **`gallery/packs.html`（パックの一覧＝パックごとに中身）** を作る（`--check` で照合・2026-11-01） |
| `gallery/packs.html` | パックの一覧（16 パック・書体 22 本）。**どのパックにどの書体が入っているか**をパックの側から見る（検索・タグ・並べ替え・1 本ずつの ⬇） |
| `tools/check-set-app.mjs` | **アプリ自身の判定**でセットを見る（相手側 trk239 以降の `tools/check-set.mjs` をそのまま呼ぶ）。trk240 からは **`--json` の `pending.count`／`bytes`／`skip` を読む**（日本語の文を読まない・無い版は文と終了コードで）。`--have=` で 2 つ続けて、`--both` で**両方の順**（2026-11-01） |
| `tools/verify-set.mjs` | **セット（`.stlib` / `.zip`）を、アプリと同じ手順で開いて確かめる**（拡張子ではなく中身で ZIP 判定・安全なパス・目録の形・実バイトで sha256／大きさを照合・内訳を出す・`--record` で記録とも比べる） |
| `catalog/font-notes.json` | 書体の**ひとこと**（60 文字まで・L10）。目録の `fonts[].note` に入る |
| `catalog/font-tags.json` | 書体の**タグ**（8 個まで・各 16 文字・L15）。目録の `fonts[].tags` と一覧の絞り込みに入る |
| `gallery/fonts.html` / `catalog/fonts.json` | 書体の一覧と検索（1 ファイル・外部参照 0）と、そのもとデータ |
| `tools/check-docs.mjs` | README の表と目録の一致・内部リンク（**見出しアンカーも**）・セットの記録 |
| `sets/first-set.json` | はじめてセットの**定義**（どのファイルを入れるか・日付・記録先・`extensions`）。いまは `rev: r8`・6 パック（見本 1＋書体 5）＋見本 4 枚・`.zip` と `.stlib` |
| `sets/font-set.json` | **書体セット（全部）の定義**（`rev: r8`）。いまは書体 29 本＋見本 1＋見本 4 枚＋目録＋束＋縮刷版。記録は `release/font-set.json`（r8 で作った） |
| `release/font-set-notes.md` | 書体セットの **Release の説明書き**（CI が大きさと sha256 を足して添付） |
| `release/first-set.json` | 配ったセットの**記録**（ファイル名・bytes・sha256・`files_out`（両方の名前）・中身の sha256）。いまは **r8（7,981,799 B・15 ファイル）**。r6／r7 の記録は `release/first-set-2026-11-01-r6.json`・`-r7.json` |
| `release/font-set.json` | **書体セットの記録**（r8・**64,062,199 B・39 ファイル**） |
| `catalog/typography-preview.json` | **アプリが 1 本で読める束**（`typography`＋見本 31 書体の woff2 を base64 で・169,841 B）。`export-pairing-gallery` が作り `--check` で照合。両方のセットに入ります |
| `docs/2026-11-01-組み合わせ縮刷版.png` | **14 組を 1 枚にした縮刷版**（1400×2066・355,083 B）。`tools/render-pairings-sheet.py` で作り直せます（`--cols=` `--width=` `--out=`） |
| `catalog/typography.json` | **組み合わせのデータ**（6 役・5 倍率・字間/行間の範囲・4 段階・14 組）。パックの中身は変えていません |
| `gallery/pairings.html` | 組み合わせの見本＋エディターの試作（1 ファイル・外部参照 0・**198,406 B**）。`catalog/preview/*.woff2`（見本の字だけ・31 本・**109,656 B**）を埋め込み |
| `docs/2026-11-01-trk235への返事.md` | 手紙（`.stlib` の Q1〜Q5・L13〜L16・重さの相談）への返事。Drive の同じフォルダにも置いた |
| `docs/2026-11-01-trk235の通しへの返事.md` | 返事3（trk235 ができた・Q7／Q8・`check-fonts` の指摘）への返事。Drive の同じフォルダにも置いた |
| `docs/2026-11-01-返事11への返事.md` | **返事12**（14 種の受け入れ・r6 の 2 セット・組み合わせ 14 組・設定の細分化の案） |
| `docs/2026-11-02-スキンの参考サイト.md` | **スキン・書体の参考サイトのメモ**（ゲーム UI・osu!・TypeSquare・Google Fonts・MDN Grid）と、この倉庫のどこに効かせるかの案（外部参照 0 は守る） |
| `docs/2026-11-02-返事17.md` | **返事17**（trk255 への返事・r10 で URL を全廃したこと・`TRK_PWA_REF` を trk256 に・実機待ち）。Drive の同じフォルダにも置いた（`1GWHcLoF36BU5mD6-6HwAYzmbhGiKFTks`） |
| `docs/2026-11-02-返事16.md` | **返事16**（trk254 の追記２への返事・縮刷版の同梱と `sha256` の形）。Drive の同じフォルダにも置いた（`1Chp9bnwHyD-VOHpo7-mHEqJJRBm1hhY6`） |
| `docs/2026-11-02-レビューへの返事.md` | **返事15**（レビュー §2〜§4 への返事・直したもの／r9・実機待ち／こちらの担当外）。Drive の同じフォルダにも置いた |
| `docs/2026-11-02-実機の通しとレビュー依頼.md` | **実機の通し（r8）の手順と記録シート＋レビュー依頼**。期待値は `verify-set`／`check-set-app --both` の実測、秒数だけ空欄（未測）。Drive の同じフォルダにも置いた |
| `docs/2026-11-02-組織の引っ越し.md` | **組織移行の記録**（Trk-Nexus・自動で付いてきたもの／直した 10 か所／**あえて直していないもの**とその理由／実測／そちらの判断待ち）。Drive の同じフォルダにも置いた |
| `docs/2026-11-01-返事13への返事.md` | **返事14**（縮刷版 1 枚・所要時間は**未測**・`settings.typography` の**確定**・`--json` は足すだけ・r8 の 2 セット）。Drive の同じフォルダにも置いた |
| `docs/2026-11-01-書体の組み合わせとエディター設定.md` | 組み合わせの調査メモ（出どころ・14 組の理由・4 段階・契約の案・こちらで決めなかったこと） |
| `docs/2026-11-01-返事5への返事.md` | 返事5（trk236〜238・r6 の 2 分割・セットの目録の絞り込み）への返事。Drive の同じフォルダにも置いた |
| `docs/2026-11-01-返事7への返事.md` | 返事7（trk239 の `setPending`）への返事。**試作 2 つを相手側の `check-set.mjs` で通した記録**と、CI への組み込み。Drive の同じフォルダにも置いた |
| `docs/2026-11-01-返事9への返事.md` | 返事9（trk240 の `--json` と役割の書面）への返事。**数字で判定する形**にしたこと・契約の見張り・`--both` の実測・これからの案。Drive の同じフォルダにも置いた |
| `docs/2026-11-01-実機OKと起動時の索引-開発案.md` | 実機の通し OK・**セットを 2 つに分ける**決定・**起動時にパックを全部読む索引**（trk238 案）の形と注意点。Drive の同じフォルダにも置いた |
| `release/first-set-notes.md` | Release の本文（手順・中身の表・権利）。CI が大きさと sha256 を足して添付 |
| `release/first-set-2026-11-01.json` | **過去**の記録（r1・2,993,307 B）。r2 の記録はタグ `first-set-2026-11-01-r2` の中。`release/README.md` に経緯 |
| `tools/selftest.mjs` | 道具の自己検査（40 項目） |
| `tools/export-skin-gallery.mjs` | trk-PWA から見本を作り直す |
| `tools/lib/zip.mjs` | trk-PWA の `js/zip-io.js` を読み込む小さな入口（写しを持たない） |
| `.github/workflows/check.yml` | CI（selftest・目録・契約・書体パック） |
| `docs/` | 受け渡しメモなど |

## 6. 直近の検証（2026-11-01・この環境）

```sh
node tools/selftest.mjs                                        # ✅ 40 / 40 合格（セット 11・check-fonts 1・note／tags 2・
                                                               #    パックの一覧 1・セットの定義 1・アプリ側の判定 3）
node tools/build-catalog.mjs --check                           # ✅ 目録は最新です（16 パック・release と version も一致）
node tools/check-contract.mjs                                  # ✅ アプリ（trk240・7344111）の規則を通ります（16 パック）
                                                               #    ℹ note／cmap／weight／tags／bytes とも「読みました」（trk236〜238）
node tools/build-set.mjs sets/font-set.json --out=/tmp/trk-sets # ✅ 試作（30,860,910 B・書体 15 本・目録は 15 本に絞る）
node tools/verify-set.mjs /tmp/trk-sets/…-r6.stlib              # ✅ 目録 15 本 → 入れる 15 本／入っていない 0（記録なし）
node tools/check-set-app.mjs /tmp/trk-sets/…-r6.stlib --have=/tmp/trk-sets/…-r5.zip
                                                               # ✅ --json（version 2）で判定：入れる 15 本／これから入る 0 本（r5 は 15 本とも入っている）
node tools/check-set-app.mjs /tmp/trk-sets/…-r6.stlib --have=/tmp/trk-sets/…-r5.zip --both
                                                               # ✅ 逆順（書体セットが先）でも「これから入る 1 本＝見本パック 690 B」
node tools/check-fonts.mjs                                     # ✅ 15 パック・22 書体とも読める形（cmap 5,451〜6,887 字・見本 7/7）
node tools/check-fonts.mjs --trk=/nope                         # ✅ exit 2（trk-PWA が無ければ使い方を出して止まる）
node tools/export-skin-gallery.mjs --trk=../trk-PWA --check    # ✅ 見本は最新です（53 種＋書体 15 パック）
node tools/export-font-gallery.mjs --check                     # ✅ 書体の一覧は最新です（15 パック・22 ウェイト・タグ 16 種）
node tools/export-pack-gallery.mjs --check                     # ✅ パックの一覧は最新です（16 パック・書体 22 本・タグ 16 種）
for d in font-packs/*/; do node tools/build-pack.mjs "$d" --check --fetch; done   # ✅ 15 個ともフォルダと一致
node tools/verify-pack.mjs packs/*.stpack font-packs/*.stpack  # ✅ 16 件とも合格
node tools/build-set.mjs sets/first-set.json --check           # ✅ 記録と一致（30,832,734 B・sha256 d2bea5a2…・.zip と .stlib）
node tools/verify-set.mjs dist/…-r5.stlib --record=release/first-set.json
                                                               # ✅ 目録 16 本 → 入れる 16 本（30,698,033 B）・記録一致
node tools/check-docs.mjs                                      # ✅ 文書は今の中身と合っています（16 パック・内部リンク 14 本）
```

2026-11-01（trk235 対応）に足した確認：

- **セットの受け入れ検査（`tools/verify-set.mjs`）**：r5 を、trk235 と同じ決めごとで開いて確かめた
  （中身で ZIP 判定・安全なパス・目録の形・**実バイトで sha256 と大きさを照合**）。目録 16 本 → **入れる 16 本（30,698,033 B）**・
  入れない 0・入っていない 0・目録にない 0。`--record` で `release/first-set.json` とも一致
- **わざと壊したセット**（selftest の 11 項目）：1 本だけ差し替え → **その 1 本だけ入れない**（15 本は入る）／1 本抜く → 入っていない 1 本／
  目録にない 1 本を混ぜる → 数えるだけで入れない／目録を壊す → **何も入れずに止まる**／`format` 違い → 止まる／
  `set.json` が壊れていても **目録だけで動く**／`set.json` が無くても動く／`PK` でないファイル → 開かない
- **`check-fonts` の付け忘れ**：`TRK_PWA` を存在しない場所にして実行 → **exit 2 と使い方**（以前は何も出さず exit 0）。
  パック自体が読めないときも「読めません」として不合格にした。最後に「15 パック・22 書体とも、読める形です」を出す
- **セット r5**：`README-はじめに.txt` に「アプリが読むのは `catalog/index.json` と `packs[].file` だけ（`gallery/` と `set.json` は読まなくても動く）」を追加（Q8）。
  **21 ファイル・30,832,734 B・sha256 `d2bea5a2…`**（`.zip` と `.stlib` は同じバイト列）
- **`check-contract`**：trk235 の `sanitizeCatalog` で 16 パックとも落とされない。`tags`（L15）と `fonts[].bytes` の形も見るようにし、
  ℹ は「tags は trk237 で使う予定」「bytes は表示用」に更新（trk233 固定だった文言も trk235 に）

2026-11-01（trk234 対応）に足した確認：

- **L16 の受け入れ検査**：わざと (1) `family` を `PottaBad`、(2) `license` を `MIT` にしたパックと、
  (3) 同じ `family`＋太さを持つ複製パックを `font-packs/` に置くと、`build-catalog` が**3 件の指摘で止まる**（目録は書き換えない）
- **L15 のタグ**：17 文字の語・パックにない書体を書くと `build-catalog` が**2 件の指摘で止まる**
- **`gallery/fonts.html`**：15 パック・22 ウェイト・タグ 16 種・27,863 B・**外部参照 0**（`--check` で目録と一致）
- **L13/L14 の表示データ**：`catalog/fonts.json` 18,126 B（目録の `note`/`cmap`/`tags`/`bytes` をそのまま写す）
- セット **r4**：`.zip` と `.stlib` が**同じバイト列**（30,832,151 B・sha256 `0d943e76…`・21 ファイル）。
  中に `set.json`（`format: trk-set`・`version: 1`・`release`/`rev` = r4・`packs` 16 本）が入る

2026-11-01（trk233 対応）に足した確認：

- **届いた 14 パックとバイト単位で一致**：`font-packs-src.zip` の 14 フォルダから `build-pack --fetch` で組み立てた `.stpack` が、
  届いた `SHA256SUMS` の 14 本と**すべて同じ sha256**（`zen-kaku` = `b12dc221636c…`・1,969,655 B ほか）。
  woff2 は npm `@fontsource` から取り、`SOURCE.json` の sha256 と照合しています（`--fetch` が毎回確かめる）
- **書体 20 本の中身**：`wOF2` 署名・TrueType・表 15〜19・**cmap 5,451〜6,887 字**・見本の字 7/7（`check-fonts`）
- **L10・L11**：目録の 22 書体すべてに `note` と `cmap`。`note` をわざと 61 文字にすると `build-catalog` が止まることを確認。
  アプリ（trk233）はこの 2 項目をまだ読まないが、**目録から 1 件も落とされない**（`check-contract`）
- **`licenseFile` をアプリが読むように**：`check-contract` の ℹ が「読むようになりました（22 件）」に変わった（trk233 の `sanitizeCatalog` が `licenseFile` を保持する）
- セット **r3**：2 回作っても同じ sha256（`1b381a1e…`・**30,799,039 B**・19 ファイル）

2026-11-01（trk232 対応）に足した確認：

- `licenseFile` を足しても、**アプリ（trk232）が 2 パックとも落とさずに読む**（ℹ「アプリはまだ読みません」だけ）
- `verify-pack` が `licenseFile` の**不在・拡張子・`..`** を弾く（selftest の 4 項目）
- **woff2 の中身**：`wOF2` 署名・TrueType・表 17 個・`cmap` 6,875 字・見本の字 7/7。
  `cmap` の文字数は **fonttools（Python）の `getBestCmap()` と完全一致**（1 度だけ手元で突き合わせた）
- 書体の中の名前は **Zen Maru Gothic**（Regular／Bold・usWeightClass 400／700・6,934 字形）。
  アプリは `TrkZenMaru` という**家族名を付けて** `FontFace` に登録するので、中の名前とは別でよい
- 見本 `--check` が、1 行足しただけで**落ちる**ことも確認（`generatedAt` は比べない）

2026-11-01（trk231 対応）に足した確認：

- 目録に `colors` が入る（`sample-mincho` = `#f6f1e6`／`#8c2f39`、`maru-go` = `#241a2a`／`#ffb3d2`）。
  **アプリ（trk231・`9bf22d7`）はこの項目を無視しても、2 パックとも落とさずに読む**ことを `check-contract` で確認
- はじめてセットは**2 回作っても同じ sha256**（`b9599930c9e5…`・2,993,307 B・4 ファイル）
- セットの ZIP の中のファイル名は UTF-8（`README-はじめに.txt` も化けずに読める。`flag_bits & 0x800` を確認）
- `check-docs` が、わざと大きさをずらした行・目録にない行・リンク切れ・記録の欠落で**落ちる**ことを確認
- **見出しアンカー**も検査します。GitHub の id の作り方（小文字→約物を消す→空白を1つずつ `-`）を写し、
  GitHub が実際に付けた README の 20 個の id と**全部一致**することを確かめてから入れました
  （`#2-2-②-…` のような「人が読みやすいが実在しない」リンクを、CI が見つけられます）

- わざと壊した入力（`..` のパス・日本語の family・`OFL.txt` なし・`release` の形違い・目録の偽エントリ・改変した `.stpack`）で、
  `verify-pack`／`build-catalog --check`／`build-pack --check`／`check-contract` が**それぞれ不合格になる**ことも確認
- 書体パックの woff2 は `SOURCE.json` の sha256 と照合済み（400：`58395f89…`／700：`05b928e9…`）
- GitHub Actions（`check.yml`）は push／PR で **成功**（run 41218922745・13 秒）

## 7. 変更履歴（新しい順）

### 2026-11-03 trk269 ターミナルの定番とWizardスキン — TRK_PWA_REF を trk269（6f60e234fca63cf47a2cba4bbcd954ee3850dacd）に、Wizard CLIスキン5操作感・コントラスト修正

- **`TRK_PWA_REF` を `6f60e234fca63cf47a2cba4bbcd954ee3850dacd`（trk269、40桁）に変更**：`.github/workflows/check.yml` と `.github/workflows/release-set.yml` の `env.TRK_PWA_REF`、および本文書 §1 の記録を同じ回にする。7桁では `actions/checkout` が枝名として探して失敗するため、必ず40桁のフル SHA を使う。
- **`catalog/skins.json` の wizard 24 種に cli オブジェクトと5操作感を追加**：`cursor`（block/underline/bar）、`opacity`（0.5〜1、地::beforeに適用、文字は透けさせない）、`history`（10〜200）、`completion`（tab/off）、`bell`（true のみ、デフォルトオフ、AudioContext で生成）。CLI対応12種（wizard-cli, wizard-terminal, wizard-grimoire, wizard-arcane, wizard-console, wizard-grep, wizard-man, wizard-sudo, wizard-pipe, wizard-history, wizard-tmux, wizard-nord）に完全実装。
- **cli.font の二重クォート修正**：wizard-grep, wizard-man, wizard-sudo の 3 種で `\"Courier New\",\"Courier\",monospace` → `Courier New, Courier, monospace` に正規化。
- **残り12種の Wizard スキン（CLIなし）の muted コントラストを 4.5:1 以上に修正**：wizard-spell, wizard-rune, wizard-alchemy, wizard-cauldron, wizard-crystal, wizard-tarot, wizard-void（text も #e0e0e0 に変更）, wizard-eldritch, wizard-seance, wizard-ouija, wizard-hermetic（field #ffe0b2 / text #3a2a5a / muted #3a2a5a / panel #e0c0a0 に変更）, wizard-necromancer。
- **`tools/import-skin-catalog.mjs` 新設**：catalog/skins.json から js/skins-wizard.js を生成（--cat=wizard、--cli-only 不使用で24種全入力、手編集禁止）。
- **`js/skins-wizard.js` 生成**：wizard 24 種のスキン定義。index.html で js/characters/miku.js の直後に読み込み。
- **`tools/check-cli-skin.mjs` を v2 にアップデート**：カタログ（--catalog）を受け取り、5操作感（cursor/opacity/history/completion/bell）もチェック対象。rgba(...) 形式の色に対応。--json で reason（name/color/contrast/cli）を出力。終了コード 0=受け取り／1=名前なし／2=読めない。
- **`tools/check-repo.mjs` 新設**：リポジトリ全体のスキンチェック（チェック対象 24 種、スキップ 229 種）。
- **PWA 基盤ファイル新設**：`package.json`（npm run check / npm test / import:skins）、`index.html`（trk-build=trk269、CACHE=trk-v2026.11.03-trk269、skins-wizard.js 読み込み）、`css/style.css`（地::beforeに --cli-opacity、文字は透けさせない）、`js/core.js`（SKIN_CATS に wizard 追加、cliBell 初期値）、`js/data.js`（sanitizeCliLook, cliLookVars, CLI_CURSOR_SHAPE）、`js/cli.js`（pwd/ls/cd/cat/grep/history/clear/echo/bell、`;` と `|` でつなぐ、生パス拒否、bell は AudioContext 生成）、`js/i18n.js`（catWizard 4言語）、`sw.js`（キャッシュ名 trk-v2026.11.03-trk269）、`manifest.json`。
- **テスト新設**：`tests/trk269-cli-standard.test.mjs`（23件、302 assert 合格）、`tests/skin-contrast.test.mjs`（61種、244 check 項目合格）。
- **npm run check 緑**：check-cli-skin.mjs v2（--catalog）24 種合格 + check-repo.mjs 24 種合格。
- **npm test 緑**：trk269-cli-standard 23 件通過 + skin-contrast 61 種通過。

### 2026-11-03 trk268 CLI スキン受け口 — TRK_PWA_REF を trk268（4a9cf1ccdb84ea92fb198fef7465ab16d342ffa0）に、Wizard 定番CLIスキン追加
- **`TRK_PWA_REF` を `4a9cf1ccdb84ea92fb198fef7465ab16d342ffa0`（trk268、40桁）に変更**：`.github/workflows/check.yml` と `.github/workflows/release-set.yml` の `env.TRK_PWA_REF`、および本文書 §1 の記録を同じ回にする。7桁では `actions/checkout` が枝名として探して失敗するため、必ず40桁のフル SHA を使う。
- **Wizard 定番CLIスキン7種を追加**（総数246→253種、wizard カテゴリ17→24種）：
  - `wizard-grep`（検索・ハイライト重視・黄色マーカー、cli: font=Courier New, prompt=?, caret=#ffff00, scan=0.10）
  - `wizard-man`（マニュアル・ドキュメント閲覧・serifフォント、cli: font=Trajan Pro/Garamond, prompt=>, caret=#cbd5e1, scan=0.05）
  - `wizard-sudo`（管理者権限・警告色・赤アクセント、cli: font=Cascadia Mono, prompt=#, caret=#ff0040, scan=0.15）
  - `wizard-pipe`（パイプライン・フロー重視・青空、cli: font=Rajdhani/Oswald, prompt=→, caret=#00ffff, scan=0.12）
  - `wizard-history`（履歴・タイムスタンプ重視、cli: font=Courier New, prompt=@, caret=#80deea, scan=0.10）
  - `wizard-tmux`（マルチペイン重視・グリッド、cli: font=JetBrains Mono, prompt=+, caret=#f92672, scan=0.08）
  - `wizard-nord`（定番カラースキームNord・青灰系、cli: font=JetBrains Mono, prompt=>, caret=#88c0d0, scan=0.06）
- **既存 Wizard CLI スキン5種の cli.font 正規化**（クォート除去）：wizard-cli, wizard-terminal, wizard-grimoire, wizard-arcane, wizard-console
- **CLI対応Wizardスキン合計12種**（`check-cli-skin.mjs` で全員 exit 0 を通過）
- **gallery/skins-wizard.html を 24 種で再生成**
  - `wizard-grep`（検索・ハイライト重視・黄色マーカー、cli: font=Courier New, prompt=?, caret=#ffff00, scan=0.10）
  - `wizard-man`（マニュアル・ドキュメント閲覧・serifフォント、cli: font=Trajan Pro/Garamond, prompt=>, caret=#cbd5e1, scan=0.05）
  - `wizard-sudo`（管理者権限・警告色・赤アクセント、cli: font=Cascadia Mono, prompt=#, caret=#ff0040, scan=0.15）
- **既存 Wizard CLI スキン5種の cli.font 正規化**（クォート除去）：wizard-cli, wizard-terminal, wizard-grimoire, wizard-arcane, wizard-console
- **CLI対応Wizardスキン合計8種**（`check-cli-skin.mjs` で全員 exit 0 を通過）
- **`docs/CLI-定番機能とWizardスキン案.md` を新設**：CLI定番機能・コマンド・カラースキーム・ターミナル機能の調査まとめ、Wizardスキン追加案7種、実装担当への伝達事項を記載
- **Google Drive フォルダ `trk-PWA-trk268-ターミナルの受け口-2026-11-03`**（ID `1YuApiK64rdk4NfpE615QbuqyO1YTuGP2`）に受け入れ条件ファイル7点を配置済み
- **`TRK_PWA_REF` を `4a9cf1ccdb84ea92fb198fef7465ab16d342ffa0`（trk268、40桁）に変更**：`.github/workflows/check.yml` と `.github/workflows/release-set.yml` の `env.TRK_PWA_REF`、および本文書 §1 の記録を同じ回にする。7桁では `actions/checkout` が枝名として探して失敗するため、必ず40桁のフル SHA を使う。
- **CLI 用スキン `wizard-cli` を `catalog/skins.json` に追加**：`cat` に `"wizard"` を1語含む（`["dark","wizard"]`）。`colors` は `bg`/`panel`/`text`/`accent`/`gold` の5色。`cli` は `font`/`prompt`/`caret`/`scan` を持ち、コントラストは text/muted vs panel/field で 4.5:1 以上、エラー行 vs field で 3:1 以上。
- **`tools/check-cli-skin.mjs` を新設**：CLI スキンのバリデーションツール。`cat` の命名・`colors` の不足・コントラスト・`cli` の値をチェック。終了コード 0=受け取り／1=名前なし／2=読めない。
- **受け入れ条件・設計書**：Google Drive フォルダ `trk-PWA-trk268-ターミナルの受け口-2026-11-03`（ID `1YuApiK64rdk4NfpE615QbuqyO1YTuGP2`）に `PLAN-TRK268-2026-11-03.md`、`VIEWER-TRK268-2026-11-03.md`、`2026-11-03-trk267-CLI-受け入れ条件とTRK_PWA_REF.md`、`SHA256SUMS-trk268-2026-11-03.txt`、`wizard-cli-sample.json`、`00-まえがき.txt`、`trk-standalone-2026-11-03-trk268.zip` を配置。
- **不要なファイル**：`tools/generate-skins-wizard.py` と `gallery/skins-wizard.html` は本体（trk-PWA）側にも無く、Skin側では不要。

レビュー（`trk-Nexus-review-trk258-2026-11-02.zip`）を受けて、以下を反映。

- **トークンを `722409a`（trk258、40桁）に変更**：`.github/workflows/check.yml` と `.github/workflows/release-set.yml` の `env.TRK_PWA_REF`。7桁では `actions/checkout` が枝名として探して失敗するため、必ず40桁のフル SHA を使う（`722409a04de3fd72526f19d87e78c25c97983226`）。
- **2文書を追加**：`docs/2026-11-02-レビュー受けに行く前のテスト項目.md`（はじめてセットは **6パック・6.7MB**、15はZIP内ファイル数ではない）・`docs/2026-11-02-レビューへのお願い.md`（§4 写しの取り直しは trk254 で済み済みのため外し、§6 は ①〜④＝設定の保存まで）。
- 安定版 runbook の期待値：追加116・更新45・同一355・反転62（旧値 109/44/356/57 は古く、当てる直前の dry-run 数字を正とする）。

### 2026-11-01 返事9（trk240）への対応 — 判定を「数字」で読む・役割の書面を受け取る

trk-PWA の `返事9-役割を書面にしました-2026-11-01.md` と `役割分担-書体とスキンはミュージアム側-2026-11-01.md`（Drive）への対応。
返事は `docs/2026-11-01-返事9への返事.md`。

- **`--json`（契約 version 2）を採りました**：`tools/check-set-app.mjs` が `pending.count`／`bytes`／`skip` を読む。
  **日本語の文を読まない**ので、文言が変わっても赤にならない。trk239（`--json` を知らない版）でもそのまま動く
- **契約の見張りを selftest に**（38 → **40 項目**）：終了コード（無いファイル・ZIP でない＝2）と `--json` の項目
  （`tool`／`version`／`ok`／`problems`／`packs`／`missing`／`pending`）、`--have` で「これから入る」が**空振りしない**こと
- **`--both`（新規）**：2 セットを**両方の順**で数える。実測＝r5 はじめて→書体セットは「入る 0／飛ばす 15」、
  逆順（書体セットが先）→はじめてセットは「**入る 1 本（見本パック 690 B）／飛ばす 15**」
- **`release-set.yml` にもアプリの判定**を入れた（前は `verify-set` だけだった）。添付前に 2 段になる
- **`TRK_PWA_REF` を trk240（`7344111`）**に。`check.yml` の自己検査の見出しから「22 項目」を外した（数を書くと必ず古くなる）
- **役割の書面を受け取りました**：書体・スキン・目録・セット・`gallery/` はこちら、PWA 本体は向こう。
  受け渡しの形は共有財産＝変えるときは先に知らせる（§1.5 の行と返事10 §2）

### 2026-11-01 返事7（trk239）への対応 — 2 分割をアプリの判定で通す

trk-PWA の `返事7-2分割の数え方を直しました-2026-11-01.md`（Drive）への対応。返事は `docs/2026-11-01-返事7への返事.md`。
相手側は trk239 で **確認の窓の数（すでに入っている分を飛ばす）** を直し、**アプリのコードで受け入れる道具 `tools/check-set.mjs`** を足した。

- **試作で 2 分割を通した**（定義は `/tmp`・倉庫は触らない）。はじめて＝見本 3＋目録＋見本パック＋書体 5 本 →
  **7,271,866 B（6.9 MB）・12 ファイル・目録 6 本**／書体＝見本 3＋目録＋書体 15 本 → **30,860,910 B・21 ファイル・目録 15 本**
  - 1 つ目：`check-set` ✅ 目録 6 本 → 入れる 6 本（6.8 MB）
  - 2 つ目：`check-set --have`（1 つ目の目録）✅ **これから入る 10 本（22.5 MB）／飛ばす 5 本**
- **`tools/check-set-app.mjs`（新規）**：相手側の `tools/check-set.mjs` をそのまま呼ぶ（写しを持たない）。
  `--have=<もう 1 つのセット>` で、こちらのセットから `catalog/index.json` を取り出して渡す。**道具が無い版では exit 2**
- **CI**：`check.yml` に「セットがアプリ（trk239）の判定でも通るか」を追加（記録のあるセットを 1 本ずつ＋2 つそろえば `--have`）。
  `release-set.yml` のコメントも trk239 に。**相手側の道具が無ければ「飛ばす」**（古い版に固定しても赤にしない）
- **`tools/selftest.mjs`**：**37 → 38 項目**（「アプリ自身の判定でも通る」・道具が無ければ ℹ で飛ばす）
- **`tools/check-contract.mjs`**：アプリの **`setPending` を直接呼んで**、入る本数・飛ばす本数・入る分だけの大きさ（`bytes`）を突き合わせる。
  無い版では ℹ で「確認の数が多めに出ます」
- **`TRK_PWA_REF` を trk239（`748ac03`）** に（`check` と `release-set`）
- `gallery/fonts.html` の「家族名」への統一は **r6 で**（r5 のバイト列を守るため）

### 2026-11-01 trk236〜238 への対応（返事5・r6 の 2 分割のしたく）

trk-PWA の `返事5-trk236〜238を実装しました-2026-11-01.md`（Drive）への対応。返事は `docs/2026-11-01-返事5への返事.md`。

- **`tools/check-contract.mjs`**：note（L10）・cmap（L11）・weight も**アプリが返した値と突き合わせて**数えるようにした。
  trk236 以降は「読みました」に変わる（`tags` は並びまで一致するか・`bytes` も値で見る）。ℹ の文言も更新
- **`TRK_PWA_REF` を trk238（`36673dd`）**に（`check.yml`・`release-set.yml`）
- **r6 の 2 分割を決定**：はじめてセット（見本 3 枚＋目録＋見本パック＋**書体 5 本**・約 7 MB）と
  書体セット（**書体は全部**・いま 29.4 MB → 14 種で 55〜65 MB）。**はじめての 5 本も書体セットに入れる**
- **`tools/build-set.mjs`：目録をセットの範囲に絞る**（`scopeCatalog`）。アプリは目録の `packs[]` を 1 本ずつ探すので、
  軽いセットに 16 パックの目録を入れると「見つからない 11 件」になる。絞ったときだけ記録に `scoped: true` と
  `source`（絞る前の sha256）を残し、`README-はじめに.txt` にも 1 行足す。**全部入りのセットは倉庫の目録をそのまま**
  （＝r5 は同じバイト列で再現できる・`--check` ✅）
- **`sets/font-set.json`（新規・`rev: r6`）** と **`release/font-set-notes.md`（新規）**。記録は r6 で作る
  （それまで CI は「記録の無い定義」として飛ばす）
- **CI**：`release-set.yml` は**タグの頭で定義を選ぶ**（`first-set-*`／`font-set-*`）。**記録の `tag` と押したタグが違えば止まる**。
  `check.yml` は記録のあるセットだけを、作って `verify-set` に通す
- **`tools/check-docs.mjs`**：セットの記録を `sets/*.json` の数だけ見る（絞った目録は `source` と比べる）
- **`gallery/packs.html`**：見出しを**家族名（family）**・リンクを**「🔤 書体から見る（家族名・太さ・パック名）」**に
  （アプリの 🔤 索引と同じ言い方）。**`gallery/fonts.html` は r5 のセットに入っているので r6 で変える**
- **`tools/build-catalog.mjs`**：note が 30 文字を超えたら ℹ で知らせる（60 が上限だが 1 行で読める長さに）
- 試作した書体セット（いまの 15 本）：**30,860,910 B・21 ファイル**・目録 15 本 → 入れる 15 本（30,697,343 B）・
  見つからない 0／入れない 0／目録にない 0

### 2026-11-01 実機 OK・パックの一覧・起動時の索引の下ごしらえ

利用者から「実機で入ることは確認しました」「配布するパックとしては分けても良い」「起動時にパックの全部を読み取れて、
どのパックに入っているか分かると、開発者も利用者も足しやすい」との返事。返事は `docs/2026-11-01-実機OKと起動時の索引-開発案.md`。

- **実機の通し OK**：r5 の `.stlib` で **16 パックとも入った**（§4-1 の 6 番）。残りは 1〜5
- **セットは r6 から 2 つに分ける**（決定）：はじめてセット（見本＋目録＋見本パック＋書体 3〜5 本・5〜8 MB 目安）と
  書体セット（29 本・55〜65 MB 目安）。中身と大きさは 14 種が届いてから決める
- **`tools/export-pack-gallery.mjs`（新規）→ `gallery/packs.html`**：パックごとに、中に入っている書体・ひとこと・タグ・
  対応字数・大きさ・ライセンス・sha256 を並べた 1 ファイル（検索・タグ・並べ替え・1 本ずつの ⬇）。`gallery/fonts.html`
  の逆方向（書体→パック）で、利用者と開発者が同じものを見られる。**r6 のセットに入れる**（r5 の記録は動かさない）
- **`pack.json` の `fonts[].note`／`fonts[].tags`（任意・2026-11-01）**：trk238 の「起動時にパックから索引を作る」に要るので、
  パック自身に書けるようにした。`verify-pack` は形を見て（60 文字・8 個・各 16 文字）、`build-catalog` は**目録側の
  `catalog/font-notes.json`／`font-tags.json` と二重なら止める**。いまの 15 パックは書いていない（バイト列を動かさない）
- **`tools/selftest.mjs`**：note／tags が読めること・行儀の悪い書き方が警告になること・`gallery/packs.html` が目録と
  合っていることの **3 項目**を追加（**33 → 36 項目**）。CI にも `export-pack-gallery --check`
- **trk238 への開発案**：材料はもう `packDB` の `manifest` にある（`listInstalledPacks()` が書体を捨てているだけ）。
  起動時に `packDB.all()` を 1 回なめて `{family, weight, packId, packName}` を作り、保存しない（消したパックの行が残らない）

### 2026-11-01 trk235 への対応（`.stlib` の通し・受け入れ検査・セット r5）

trk-PWA の `返事3-trk235ができました-2026-11-01.md`（Drive）への対応。返事は `docs/2026-11-01-trk235の通しへの返事.md`。

- **`tools/verify-set.mjs`（新規）**：セット（`.stlib` / `.zip`）を、**アプリと同じ決めごと**で開いて確かめる。
  **拡張子を信じず先頭 4 バイトが `PK` か**で ZIP と判断・1 セット 1 GiB・安全な相対パス・`catalog/index.json` の形・
  `packs[].file` を目録のとおりのパスで探し**実バイトで sha256 と大きさを照合**・入れない／入っていない／目録にない を数える・
  `set.json` は任意（壊れていても止めない）・`--record` で記録とも比べる
- **`tools/selftest.mjs`**：セットの受け入れ検査 **11 項目**と、`check-fonts` の付け忘れ **1 項目**を追加（**22 → 33 項目**）
- **`tools/check-fonts.mjs`**：**trk-PWA が見つからないと何も出さず exit 0**（合格に見える）だったのを、使い方を出して **exit 2** に。
  パック自体が読めないときも黙って飛ばさず不合格にし、最後に「n パック・n 書体とも、読める形です」を出す
- **`tools/build-set.mjs`**：`README-はじめに.txt` に **Q8 の 1 行**（アプリが読むのは目録と `.stpack` だけ）と、
  **trk235 以降の入口**（📦 セットを選ぶ）を追記 → バイト列が変わるので **r5**（30,832,734 B・`d2bea5a2…`）
- **CI**：`TRK_PWA_REF` を **trk235（`cd00408`）** に。`check.yml` と `release-set.yml` の両方で、**セットを開いて確かめてから**通す／添付する
- **`tools/check-contract.mjs`**：`tags`（L15）と `fonts[].bytes` の形を検査し、ℹ の文言を trk235 に更新
- 「`pack.json` は書き換えない」方針はそのまま（受け取り側の 14 種もバイト単位で同じ）

### 2026-11-01 trk234 への対応（L13〜L16・`.stlib`・セット r4）

trk-PWA の手紙 `手紙-trk235と書体の検索-2026-11-01.txt`（`.stlib` の要件・Q1〜Q5・L13〜L16・重さの相談）への対応。
返事は `docs/2026-11-01-trk235への返事.md`（Drive の `trk-Avatar-Library-手紙-2026-11-01` にも同じものを置いた）。

- **`tools/export-font-gallery.mjs`（新規）**：`gallery/fonts.html`（15 パック・22 ウェイト・27,863 B・外部参照 0）と
  `catalog/fonts.json`（18,126 B）を作る。表・並べ替え 4 種・絞り込み 4 種・横断検索・**1 本だけ落とすリンク**（L13・L14）
- **`tools/build-catalog.mjs`**：目録に **`fonts[].tags`（L15）と `fonts[].bytes`** を足し、**書体パックの受け入れ検査（L16）**を
  目録を書く前に通す（OFL-1.1・`Trk` で始まる family・family＋太さの重複なし・1 本 4 MiB 以下・cmap 1,000 字以上）
- **`catalog/font-tags.json`（新規）**：22 書体ぶん・16 語。パックの外に置く（`pack.json` は書き換えない）
- **`tools/build-set.mjs`**：セットの中に **`set.json`**（`format: trk-set`・`version: 1`・`release`/`rev`・`packs`）を入れ、
  定義の `extensions` で **`.zip` と `.stlib` を同じバイト列**で書く（記録は `files_out` に両方）。`README-はじめに.txt` に
  「trk235 以降は `.stlib` をそのまま」を追記
- **セット r3 → r4**：`gallery/fonts.html` と `set.json` が増えたため（A 方式）。**21 ファイル・30,832,151 B・sha256 `0d943e76…`**
- **CI**：`TRK_PWA_REF` を **trk234（`9c4d80d`）** に。`gallery/fonts.html` の `--check` を追加。`release-set.yml` は
  `release/first-set.json` の `files_out` を見て **2 つとも添付**する
- **文書の訂正**：`.stlib` の「アプリは trk234」を **trk235** に直した（trk234 は容量の見える化・まとめて消す）
- **Drive**：こちらのテスト用 `bin-probe.stpack`（690 B）を削除（相手側の指摘。`SHA256SUMS` に入らない余分なファイルだった）

### 2026-11-01 trk233 への対応（書体パック 14 種・L10〜L12・セット r3）

- `font-packs/` に **14 種**を追加（`pack.json`・`SOURCE.json`・`NOTICE.md`・`fonts/OFL.txt` は届いたまま）。
  `.stpack` は `build-pack --fetch` で組み立て、**届いた `SHA256SUMS` とバイト単位で一致**
- `catalog/font-notes.json`（新規）：書体の**ひとこと** 22 件（60 文字まで）
- `tools/build-catalog.mjs`：目録に **`fonts[].note`（L10）と `fonts[].cmap`（L11）**。`note` の書き間違い（長すぎる・パックにない書体）は止める
- `tools/check-contract.mjs`：任意項目をアプリが読むかを**1 行に集計**（16 パックぶんの ℹ を整理）。`note`／`cmap` の形も検査
- `tools/export-skin-gallery.mjs`：見本の「🔤 同梱の書体」に**ひとこと**を出し、見本の文字を書体に依らない「かな 漢字 いろは」に
- `tools/build-set.mjs`：セットの説明の「書体について」を**パックに依らない文**に（Zen Maru Gothic 決め打ちをやめた）
- `README.md`・`font-packs/README.md`・`NOTICE.md`：15 パックの一覧・書体の出どころ・ライセンスの説明を更新
- `HANDOFF.md`：**§4-1 実機チェックの手順（L12・4 点）**、§2.5 に L10〜L12、§3 に「届いた `pack.json` を書き換えない」
- `.github/workflows/check.yml`：`TRK_PWA_REF` を **trk233（`8e15e67`）** に。**書体パック 15 個すべて**を `build-pack --check --fetch`。
  取り置き（`.cache`）のキャッシュ key を `SOURCE.json` のハッシュに
- `release-set.yml`：`TRK_PWA_REF` を trk233 にそろえる
- セット **r3**（`trk-first-set-2026-11-01-r3.zip`・**30,799,039 B**・sha256 `1b381a1e…`・16 パック・19 ファイル）

### 2026-11-01 trk232 への対応（L7〜L9）

- `font-packs/maru-go/pack.json`：`fonts[].licenseFile`（`fonts/OFL.txt`）を宣言（L7）。`release` を **1.1.0** に
- `tools/verify-pack.mjs`：`licenseFile` の形・実在・大きさ（256 KB）を検査。`release` が無いときは **ℹ**（ノート）
- `tools/build-catalog.mjs`：目録の `fonts[].licenseFile` に載せる。`--check` で **`release` と `version` の不一致を名前つきで止める**（L8）
- `tools/check-contract.mjs`：`licenseFile` の形を検査し、アプリがまだ読まないことを ℹ で出す
- `tools/check-fonts.mjs`（新規）：woff2 の署名・sfnt の種類・必要な表・**cmap の文字**を見る（L9 の代わりにできる範囲）
- `tools/export-skin-gallery.mjs`：見本に **「🔤 同梱の書体」**の節（@font-face なし）と `--check`（L9）
- `tools/build-set.mjs`：`rev`（`r2`）で**同じ日にもう一度配れる**（ファイル名とタグの後ろに付く）
- `tools/selftest.mjs`：14 → **22 項目**（`licenseFile` 3・ℹ 1・woff2 2・`info` 1・既存 15）
- `.github/workflows/check.yml`：`TRK_PWA_REF` を **trk232（`70fd9219…`）** に。`check-fonts` と見本 `--check` を追加
- セット **r2**（`trk-first-set-2026-11-01-r2.zip`・2,996,422 B・sha256 `71c9ce0b…`）。r1 の記録は `release/first-set-2026-11-01.json` に保存

### 2026-11-01 trk231 への対応（L1〜L6）

- `README.md`：**はじめての3手順**を先頭に。§2 を①②③の順に並べ替え、**パックの表**（L4）を追加
- `sets/first-set.json`・`tools/build-set.mjs`：**はじめてセット**（ZIP 1つ・決定的・2,993,307 B）。`release/first-set.json` に記録
- `tools/build-catalog.mjs`・`tools/verify-pack.mjs`：目録に **`colors`**（`stage`／`accent`）を出力（L3）
- `tools/check-contract.mjs`：`colors` の形を検査。**読んだ相手側 trk-PWA の版を表示**（L5）
- `tools/check-docs.mjs`（新規）：README の表と目録の一致・内部リンク・セットの記録を検査
- `.github/workflows/check.yml`：`TRK_PWA_REF` で相手側を固定、週次の `upstream-main` ジョブ、セットと文書の検査を追加
- 大きさの表記を **2.8 MB（2,935,978 B）**に統一（アプリの `formatBytes` と同じ 1024 進で数える）

### 2026-10-31 土台＋書体パック

- 受け渡しZIP（`trk-avatar-library-2026-10-31.zip`＝15 ファイル）を展開し、`README.md` を差し替え
- 書体パックの実物 `font-packs/maru-go.stpack`（2,935,978 B）と、そのもと `font-packs/maru-go/`
- `tools/build-pack.mjs`・`tools/check-contract.mjs`・`tools/preview-pack.mjs` を追加
- `tools/verify-pack.mjs`：書体の path／family／weight／license、**OFL.txt 必須**、`release`／`url` を追加
- `tools/build-catalog.mjs`：`name`・`version`・`url`・`fonts[].weight`・500 件上限を追加
- `tools/selftest.mjs`：10 → **14 項目**
- `.github/workflows/check.yml`・`.gitignore`・`.gitattributes` を追加
- `docs/2026-10-31-土台と書体パック.md` を追加（のちにこの HANDOFF.md に統合）

### 2026-10-31 受け渡し（trk-PWA trk230 時点）

- trk-PWA 側で目録からの取り込み（trk230）が入り、倉庫側に土台が渡された
- 土台の中身：全スキン見本 53 種・`catalog/skins.json`・目録・サンプルパック・検査の道具

## 8. PR 前チェックリスト

- [ ] `node tools/selftest.mjs` が全部合格
- [ ] `node tools/build-catalog.mjs --check` が最新
- [ ] `node tools/check-contract.mjs` が通る（trk-PWA を隣に置いて）
- [ ] `.stpack` を変えたなら `node tools/build-pack.mjs <フォルダ> --check --fetch`（全部なら `for d in font-packs/*/; do …; done`）
- [ ] 書体パックを足したなら `catalog/font-notes.json` に**ひとこと**を足した（60 文字まで）
- [ ] `node tools/check-fonts.mjs`（書体の中身・見本の字）
- [ ] 見本を作り直したなら `node tools/export-skin-gallery.mjs --trk=… --check` が通る
- [ ] パックを足した／消したなら、README §2-2 の**表**と `sets/first-set.json` を見直した
- [ ] `node tools/check-docs.mjs`（表・リンク・セットの記録）
- [ ] セットを配り直すなら `node tools/build-set.mjs sets/first-set.json --release` して、**同じタグを作り直さず**新しいタグを push した（同じ日なら `rev` を上げる）
- [ ] 相手側（trk-PWA）の版が上がったなら、`TRK_PWA_REF` とこの文書の記録を更新した
- [ ] 目録の `sha256`／`bytes` が実物と一致（`build-catalog` を通した）
- [ ] 書体を足したなら `OFL.txt` をパックに入れた／`NOTICE.md` と `SOURCE.json` を更新した
- [ ] README（利用者向け）と HANDOFF（この文書）の記述が変わっていないか
- [ ] 実機で見ていないなら、その旨を PR に書いた（§4）
- [ ] `git diff --check`（空白の事故）

## 9. 配布（Git・Release・Drive）

- **置き場所（2026-11-02〜）**：この倉庫は **`Trk-Nexus/trk-Avatar-Library`**（相手側は `Trk-Nexus/trk-PWA`）。旧 `TonbokiriRaikiriMuramasa-Taikoubou/…` の URL は**転送**されます。
  パックの中の `url` と セットの `README-はじめに.txt` の URL は、**バイト列を変えないため旧 org のまま**（次にパックを作り直す r9 でそろえる。`docs/2026-11-02-組織の引っ越し.md` §3）
- **Git に入れる**：パック（1 つ 50 MB まで）・見本 HTML・目録・道具
- **Release か Drive に置く**：書体をたくさん束ねた ZIP・全スキン入りビルド（目録の `description` に「どこにあるか」を書く）
- 目録には必ず `sha256` と `bytes` を書く（落とした人が確かめられるように）
- **はじめてセット**（いまは **r5**：Release `first-set-2026-11-01-r5`・アセット `trk-first-set-2026-11-01-r5.zip` と **`.stlib`**（同じバイト列）・**30,832,734 B**・sha256 `d2bea5a2…`・**16 パック**・21 ファイル）：
  添付は `.github/workflows/release-set.yml` が **CI で作り直してから**行います（記録と一致しないものは添付しません）。
  **Release がまだ無ければ CI が作ります**（説明書きは `release/first-set-notes.md`。大きさと sha256 を足して添付）。
  手元で配る場合：
  見本 HTML＋目録＋書体パック。作り直したら **タグを増やす**（`first-set-2026-11-01` を作り直さない）——
  `release/first-set.json` と README のリンクを新しい日付に合わせます。
  新しいセットは、`sets/<name>.json` と `release/<name>.json` を足して、タグ `first-set-YYYY-MM-DD` を push すれば CI が添付します
  - **r1**（`first-set-2026-11-01`・`0801508`）：2,993,307 B・sha256 `b9599930…`・書体パック 1.0.0
  - **r2**（`first-set-2026-11-01-r2`・`8329524`）：2,996,422 B・sha256 `71c9ce0b…`・書体パック 1.1.0（`licenseFile`）＋見本の「同梱の書体」
  - **r3**（`first-set-2026-11-01-r3`）：30,799,039 B・sha256 `1b381a1e…`・**16 パック**（書体パック 14 種を追加）＋目録の `note`／`cmap`＋ひとことつきの見本
  - **r4**（`first-set-2026-11-01-r4`）：30,832,151 B・sha256 `0d943e76…`・**21 ファイル**。`gallery/fonts.html`（書体の一覧と検索）と
    `set.json` が増え、**`.zip` と `.stlib` を同じバイト列で添付**（trk235 以降は `.stlib`、それより前は `.zip` を展開）
  - **r5**（`first-set-2026-11-01-r5`）：30,832,734 B・sha256 `d2bea5a2…`・**21 ファイル**。`README-はじめに.txt` に
    「アプリが読むのは目録と `.stpack` だけ」（Q8）と trk235 以降の入口（📦 セットを選ぶ）を追記。中身のパックは r4 と同じ
  CI で作り直したものと記録の sha256 が**一致**します（別のマシンでも同じバイト列＝本当に決定的）。
  過去の記録は `release/first-set-2026-11-01.json`（r1）とタグ `first-set-2026-11-01-r2` の中（r2）、経緯は `release/README.md`。
  **古い記録は、そのときのタグ（`git worktree add /tmp/r1 first-set-2026-11-01`）で再現できます**。
- 利用者の手順は README §2（はじめての3手順）：**①見本 ②目録とパックを落とす ③trk! の 📥 まとめて入れる**
- 受け渡し用の ZIP を作るときは、`git archive` ではなく**このリポジトリの中身をそのまま**（`.cache/`・`dist/` を除く）

## 10. 次の段

1. ~~trk-PWA 側の書体読み込み~~ … **trk232 で完了**。倉庫側は「使うと本文の書体が変わる」状態で待っています
2. ~~ライセンス全文の表示~~ … **trk233 で完了**（アプリが `licenseFile` を読む）。倉庫は 15 パックすべてで宣言済み
3. **書体のひとこと・字数をアプリが読む**（次の段）：`fonts[].note`／`fonts[].cmap` をアプリが読むようになったら、
   `check-contract` の ℹ が「読みました」に変わる（見直しどきの合図）
4. ~~`.stlib`（セットを1ファイルに）~~ … **完了**。r4 から `.zip` と `.stlib` を両方配り、**trk235 がそのまま読める**ことを確認済み。
   アプリ側の受け入れ条件（A1〜A6）は `tools/verify-set.mjs` で**同じ手順**をこちらでも回しています（CI と Release の前）
5. 書体パックを増やす（`font-packs/<name>/` をコピーして `pack.json`・`SOURCE.json` を差し替え → `build-pack --fetch` → 表・`font-notes.json`・セットを更新）
6. **セットの分け方＝決定（r6 から 2 つ）・したく済み**：相手側の (b)「軽いセット＋書体セット」で進める。
   はじめてセットの 5 本も書体セットに入れる（アプリが飛ばす）。`sets/font-set.json` と CI の 2 タグ対応は**済み**。
   ① はじめてセット（見本 2 枚＋目録＋見本パック＋書体 3〜5 本・5〜8 MB 目安）② 書体セット（29 本・55〜65 MB 目安）。
   r6 では `sets/first-set.json` を**書体 5 本**に減らし、両方 `--release` して 2 つ作る（タグは `first-set-…r6`／`font-set-…r6`）。
   中身は 14 種が届いて**実際のバイト数を見てから**決める。`gallery/packs.html` も r6 のセットに入れる
7. 全スキン入りビルドを Release に置く（README §5）
8. **Pages で見本を開けるか**（L6）は相談。決まったら `.github/workflows/pages.yml` を足す
9. 実機で見た結果を §4-1 に追記する（**6 番＝r5 の `.stlib` は済み**。残りは書体が当たるか・太さ・ライセンス全文・
   16 行の一覧・`gallery/fonts.html`／`gallery/packs.html` の操作）
10. 届いた書体 14 種（相手側の手紙 §4-1 の候補）を受けたら、**L16 の検査 → 目録 → 一覧 → セット r6** まで一気に更新する
    （`family` は `Trk` 始まり・いまの 15 ファミリーと重複しない名前。1 ウェイトだけの書体も受ける＝Q7）
11. ~~実機で r5 の `.stlib` の通し~~ … **済み**（2026-11-01・§4-1 の「見た記録」）
12. ~~trk238（索引）の相談~~ … **相手側が trk236〜238 として実装済み**（返事5）。こちらは `check-contract` で「読みました」を確認済み。
    次のパックから `pack.json` に `note`／`tags` を書いて出す
13. **`gallery/fonts.html` の見出しを「家族名」に**（r6 で。r5 のセットに入っているので、いま変えると r5 の記録が合わなくなる）
14. **r6 を出すときの順**：`verify-set` → `check-set-app`（2 つそろったら `--have`＋`--both`）→ `--release` → タグ 2 つ
    （`first-set-2026-11-01-r6`／`font-set-2026-11-01-r6`）。CI も同じ順（`--json` の数字で判定）で、
    **どちらかが落ちれば添付しない**
15. **書体を足したら `sets/font-set.json` の `files` に足し忘れていないか**（いまは手で列挙している）。
    29 本になると抜けやすいので、r6 のあとに「目録と `font-packs/` にあって、どのセットにも入っていない書体パック」を
    ℹ で知らせる検査を足すか検討（返事9 への返事 §4 の案 1）
16. **スキン vol.1 を制作**（`catalog/skins.json` に16種追加、総数53→69種）：テーマ「夜の情景と光の色彩」。
    `lanternAlley`（提灯横丁）・`moonlitTerrace`（月光テラス）・`fireflyValley`（蛍の谷）・`midnightCafe`（深夜喫茶）・
    `snowyShrine`（雪の神社）・`autumnMaple`（紅葉の夜）・`summerNight`（夏の夜風）・`zenStone`（禅の石庭）・
    `inkWash`（墨流し・書体スキン）・`paperMoon`（紙月の夜）・`copperHour`（銅色の時）・`lavenderHill`（ラベンダーの丘）・
    `emeraldNight`（エメラルドの夜）・`cherrySnow`（桜吹雪の夜）・`ironMorning`（鉄の朝）・`goldLeafNight`（金箔の夜）。
    プレビューは `gallery/skins-vol1.html`。生成スクリプトは `tools/generate-skins-vol1.py`・`tools/generate-vol1-gallery.py`。
17. **スキン vol.2 を制作**（`catalog/skins.json` に16種追加、総数69→85種）：テーマ「宝石・鉱石」。
    `ruby`（ルビー）・`sapphire`（サファイア）・`emerald`（エメラルド）・`diamond`（ダイヤモンド）・
    `amber`（アンバー）・`amethyst`（アメジスト）・`topaz`（トパーズ）・`opal`（オパール）・
    `quartz`（クォーツ）・`onyx`（オニキス）・`jade`（ジェイド）・`pearl`（パール）・
    `garnet`（ガーネット）・`citrine`（シトリン）・`turquoise`（ターコイズ）・`obsidian`（オブシディアン）。
    プレビューは `gallery/skins-jewel.html`。生成スクリプトは `tools/generate-skins-vol2-vol3.py`・`tools/generate-theme-gallery.py`。
18. **スキン vol.3 を制作**（`catalog/skins.json` に16種追加、総数85→101種）：テーマ「タイポグラフィ・フォントデザイン」。
    `helvetica`（ヘルベチカ）・`garamond`（ガラモン）・`futura`（フューチュラ）・`bodoni`（ボドーニ）・
    `caslon`（キャスロン）・`baskerville`（バスカービル）・`gill-sans`（ギルサンド）・`din`（DIN）・
    `univers`（ユニバース）・`frutiger`（フルティガ）・`optima`（オプティマ）・`rockwell`（ロックウェル）・
    `copperplate`（カッパープレート）・`didot`（ディドー）・`akzidenz`（アクシデンツ）・`letterpress`（レタープレス）。
    type フィールドで各書体の特徴（タイトルフォント・太さ・行間・字間・変形）を設計。プレビューは `gallery/skins-typography.html`。
    vol2・vol3 も随時制作予定。
19. **スキン vol.4 を制作**（`catalog/skins.json` に16種追加、総数101→117種）：テーマ「人気フォント・ウェブデザイン」（vol.3と重複しない定番フォント）。
    `montserrat`（モントセラート）・`opensans`（オープンサンス）・`noto-sans-jp`（ノトサンスJP）・`hiragino-kaku`（ヒラギノ角ゴ）・
    `avenir`（アヴェニール）・`proxima-nova`（プロキシマノヴァ）・`lato`（ラト）・`roboto`（ロボト）・
    `source-sans-pro`（ソースサンスプロ）・`ubuntu`（ウブントゥ）・`playfair-display`（プレイフェアディスプレイ）・`merriweather`（メリウェザー）・
    `oswald`（オズワルド）・`raleway`（ラレーウェイ）・`poppins`（ポピンズ）・`inter`（インタ）。
    ウェブ・UIで広く使われる人気フォントを彷彿とさせるスキン。プレビューは `gallery/skins-fonts-vol4.html`。
20. **スキン vol.5 を制作**（`catalog/skins.json` に16種追加、総数117→133種）：テーマ「スイーツ・カフェ」。
    `matcha`（抹茶）・`chocolate`（ショコラ）・`strawberry-cake`（ストロベリーケーキ）・`macaron`（マカロン）・
    `croissant`（クロワッサン）・`espresso`（エスプレッソ）・`crepe`（クレープ）・`donut`（ドーナツ）・
    `parfait`（パフェ）・`mochi`（餅）・`dango`（だんご）・`melon-pan`（メロンパン）・`taiyaki`（たい焼き）・
    `creme-brulee`（クレームブリュレ）・`tart`（タルト）・`pancake`（パンケーキ）。
    食べ物・スイーツをモチーフにしたカラフルで遊び心のあるスキン。プレビューは `gallery/skins-sweets.html`。
21. **スキン vol.6 を制作**（`catalog/skins.json` に16種追加、総数133→149種）：テーマ「金属系・神話合金」（ユーザーアイディア）。質感として「金属体験」を重視し、メタリックなグラデーション・鋭いコントラスト・輝きを意識した配色。
    `silver`（白銀）・`gold`（王家の黄金）・`titanium`（チタン）・`mithril`（ミスリル・ファンタジー軽銀）・
    `adamantium`（アダマンチウム・不壊黒）・`orichalcum`（オリハルコン・神聖橙金）・`vibranium`（ヴィブラニウム・虚空紫）・
    `starmetal`（スターメタル・宇宙鋼）・`voidsteel`（ボイドスチール・虚空黒）・`celestial-bronze`（天鋼ブロンズ・半神）・
    `draconic-iron`（ドラゴンアイアン・炎竜）・`runic-iron`（ルーンアイアン・北欧刻印）・`quicksilver`（水銀・液体銀）・
    `platinum`（プラチナ・純白）・`ancient-bronze`（古銅・緑青）・`chrome-steel`（クロムスチール・鏡面メッキ）。
    フォントも各金属の質感に合わせて推敲（Inter / Playfair Display / Montserrat / Garamond / Oswald / Trajan Pro / Futura / Rajdhani / MedievalSharp / Caveat / Didot / Orbitron など）。プレビューは `gallery/skins-metal.html`。
    生成スクリプトは `tools/generate-skins-vol6-metal.py`。
22. **スキン vol.7 を制作**（`catalog/skins.json` に16種追加、総数149→165種）：テーマ「カジノ・スロットマシーン・ラグジュアリー」（ユーザーアイディア）。ラグジュアリーな輝きと、賭博が抱えるダークなテーマを混在。スロットのジャックポット、ルーレット、ポーカー、ブラックジャック、ハイローラー、VIPラウンジ、ネオンベガスなどをモチーフ。
    `casino-royale`（カジノロワイヤル）・`jackpot-777`（ジャックポット777）・`slot-machine`（スロットマシーン）・`roulette-wheel`（ルーレットホイール）・`poker-face`（ポーカーフェイス）・`blackjack-21`（ブラックジャック21）・`high-roller`（ハイローラー）・`vip-lounge`（VIPラウンジ）・`neon-vegas`（ネオンベガス）・`gold-chip`（金チップ）・`diamond-club`（ダイアモンドクラブ）・`midnight-casino`（ミッドナイトカジノ）・`velvet-ropes`（ベルベットロープ）・`champagne-gold`（シャンパンゴールド）・`neon-sign`（ネオンサイン）・`house-edge`（ハウスエッジ・カジノの暗い面）。
    フォントはカジノ・ラグジュアリーに合わせて推敲（Playfair Display / Orbitron / Rajdhani / Impact / Trajan Pro / Caslon / Oswald / Didot / Montserrat / Garamond / Papyrus / Caveat など）。プレビューは `gallery/skins-casino.html`。
    生成スクリプトは `tools/generate-skins-vol7-casino.py`。
23. **スキン vol.8 を制作**（`catalog/skins.json` に16種追加、総数165→181種）：テーマ「宇宙・惑星・星雲」（vol8からブレインストリーミング開始）。星雲、ブラックホール、超新星、パルサー、クエーサーなどの宇宙現象をモチーフ。ダークな宇宙空間と星々の輝き、星雲のカラフルなグラデーションを判定色に落とし込んだ設計。
    `nebula`（星雲）・`black-hole`（ブラックホール）・`supernova`（超新星）・`pulsar`（パルサー）・`quasar`（クエーサー）・`event-horizon`（事象の地平線）・`dark-matter`（ダークマター）・`wormhole`（ワームホール）・`exoplanet`（系外惑星）・`asteroid-belt`（小惑星帯）・`solar-flare`（太陽フレア）・`lunar-surface`（月面）・`martian-red`（火星赤）・`venus-clouds`（金星雲）・`mercury-core`（水星コア）・`cosmic-dust`（宇宙塵）。
    フォントは宇宙テーマに合わせて推敲（Orbitron / Rajdhani / Trajan Pro / Impact / Futura / Caslon / Garamond / Inter / Oswald / Caveat など）。プレビューは `gallery/skins-cosmos.html`。
    生成スクリプトは `tools/generate-skins-vol8-cosmos.py`。
24. **スキン vol.9 を制作**（`catalog/skins.json` に16種追加、総数181→197種）：テーマ「飲み物・お酒・カフェ」。飲み物の色合いと質感を重視した配色。
    `whiskey`（ウイスキー）・`wine-red`（ワインレッド）・`champagne`（シャンパン）・`espresso-martini`（エスプレッソマティーニ）・`mojito`（モヒート）・`sake`（日本酒）・`matcha-latte`（抹茶ラテ）・`hot-cocoa`（ホットココア）・`energy-drink`（エナジードリンク）・`soda-pop`（ソーダポップ）・`beer-foam`（ビールフォーム）・`absinthe`（アブシント）・`tequila-sunrise`（テキーラサンライズ）・`old-fashioned`（オールドファッション）・`negroni`（ネグローニ）・`kir-royale`（キールロワイヤル）。
    フォントは飲み物・カフェテーマに合わせて推敲（Playfair Display / Caslon / Didot / Oswald / Montserrat / Garamond / Trajan Pro / Futura / Papyrus / Caveat / Hiragino Mincho ProN など）。プレビューは `gallery/skins-drinks.html`。
    生成スクリプトは `tools/generate-skins-vol9-drinks.py`。
25. **スキン vol.10 を制作**（`catalog/skins.json` に16種追加、総数197→213種）：テーマ「建築・都市・インテリア」。建築の質感と都市の雰囲気を重視した配色。
    `art-deco`（アールデコ）・`brutalist`（ブルータリズム）・`gothic-cathedral`（ゴシック大聖堂）・`zen-temple`（禅寺）・`tokyo-night`（東京ナイト）・`paris-cafe`（パリカフェ）・`new-york-subway`（ニューヨーク地下鉄）・`venice-canal`（ヴェネチア運河）・`kyoto-machiya`（京都町家）・`desert-mosque`（砂漠モスク）・`ice-hotel`（アイスホテル）・`tree-house`（ツリーハウス）・`lighthouse`（灯台）・`windmill`（風車）・`clock-tower`（時計塔）・`bamboo-forest`（竹林）。
    フォントは建築・都市テーマに合わせて推敲（Trajan Pro / Oswald / Hiragino Mincho ProN / Impact / Garamond / Montserrat / Caslon / Playfair Display / Rajdhani / Caveat など）。プレビューは `gallery/skins-architecture.html`。
    生成スクリプトは `tools/generate-skins-vol10-architecture.py`。
26. **スキン カテゴリ「glitch」を新設・実験スキン16種を制作**（`catalog/skins.json` に16種追加、総数213→229種）：テーマ「glitch-art / pixel-art / デジタル実験」。geek / motherbound / matrix 系などスキンをいじる層に刺さる実験的配色と質感を重視。vol枠に収まらず、カテゴリ `glitch` を個別に持つ。
    `glitch-core`（グリッチコア）・`pixel-8bit`（ピクセル8ビット）・`matrix-rain`（マトリックス・レイン）・`motherboard`（マザーボード）・`cyberpunk`（サイバーパンク）・`datamosh`（データモッシュ）・`scanline`（スキャンライン）・`vaporwave`（ヴェイパーウェイブ）・`lofi-crt`（ローファイCRT）・`hacker`（ハッカー・ターミナル）・`synthwave`（シンセウェイブ）・`corrupted`（コラプテッド）・`crypto`（クリプト）・`pixel-art`（ピクセルアート）・`glitch-text`（グリッチテキスト）・`neon-grid`（ネオングリッド）。
    フォントはOrbitron / Press Start 2P / Courier New / Rajdhani など等幅・デジタルフォントを推敲。プレビューは `gallery/skins-glitch.html`。`tools/generate-theme-gallery.py` にカテゴリ `glitch`（グリッチ/実験）を追加。
    生成スクリプトは `tools/generate-skins-glitch.py`。
28. **trk Modern UX 大規模改修 計画策定**（`docs/MODERN-UX-GUIDANCE.md` 新設）：テーマ「モダンな UX 開発」。GoogleChrome/modern-web-guidance-src（https://github.com/GoogleChrome/modern-web-guidance-src）を常時参照ガイドラインとして採用。`features/`（CSS モダン機能ガイダンス）・`guides/`（アクセシビリティ/CSS/フォーム/HTML/JS/パフォーマンス）・`docs/`（CONTEXT.md/EVALS.md/RELEASING.md）を trk modern UX 開発の基準とする。

    計画フェーズ：
    - Phase 1 基盤整備：docs/CONTEXT.md・docs/EVALS.md 作成、CSS カスタムプロパティ体系見直し、prefers-color-scheme 対応
    - Phase 2 モダン CSS 適用：color-scheme / light-dark()、accent-color、アンカーポジショニング、カスタマイズ可能 <select>
    - Phase 3 UX コンポーネントモダン化：スキンプレビュー モダンUI、CLI ターミナル モダン化、アクセシビリティ対応、レスポンシブ対応
    - Phase 4 パフォーマンス・PWA 強化：Service Worker 戦略見直し、遅延読み込み、Core Web Vitals 改善
    - Phase 5 ドキュメント・テスト整備：docs/modern-ux.md、EVALS 基づく自動テスト拡充、受入条件策定

    受入条件（暫定）：npm run check 緑、tests/trk269-cli-standard 23件通過、tests/skin-contrast 61種通過、モダン UX 各フェーズの EVALS 基準を満たすこと。

29. **スキン カテゴリ「wizard」を新設・実験スキン16種を制作**（`catalog/skins.json` に16種追加、総数229→245種）：テーマ「Wizard / オカルト・神秘・呪術」。geek/hacker側ではなくWizard側の視野から、CLI・ターミナル、呪文、魔導書、ルーン文字、錬金術、タロット、水晶占い、ヴォイド、エルドリッチ、ヘルメティック、ネクロマンサーなど、汎用性を超えた自由度と実験的なUXを誇る。vol枠に収まらず、カテゴリ `wizard` を個別に持つ。
    `wizard-cli`（ウィザードCLI）・`wizard-spell`（スペルキャスト）・`wizard-grimoire`（魔導書）・`wizard-rune`（ルーン文字）・`wizard-alchemy`（錬金術）・`wizard-terminal`（魔導ターミナル）・`wizard-cauldron`（大釜）・`wizard-crystal`（クリスタルボール）・`wizard-tarot`（タロット）・`wizard-void`（ヴォイド）・`wizard-arcane`（アーケイン）・`wizard-eldritch`（エルドリッチ）・`wizard-seance`（降霊術）・`wizard-ouija`（ウィジャ板）・`wizard-hermetic`（ヘルメティック）・`wizard-necromancer`（ネクロマンサー）。
    フォントはTrajan Pro / Cinzel / Garamond / Caslon / Courier New など神秘的・等幅フォントを推敲。プレビューは `gallery/skins-wizard.html`。`tools/generate-theme-gallery.py` にカテゴリ `wizard`（ウィザード/オカルト）を追加。
    生成スクリプトは `tools/generate-skins-wizard.py`。
28. **trk CLI 設計書を作成・Google Drive で共有**（`docs/trk-cli-設計.md`）：テーマ「trk CLI / コンソールライク再生操作」。geek/hacker側ではなくWizard側の視野から、`play <track-id>` / `list` / `skin <skin-id>` / `volume` / `seek` / `spell <macro-id>` / `grimoire` などのCLIコマンドを定義。曲や登録ファイルを直で叩く体験は、メディアプレイヤーよりもコンソールを叩く感覚になり、Wizardのようで面白い。スキン側だけでは完結しないため、機能を作った後に導入を再生プレイヤー側に適応する形で開発。実装フェーズは A.設計・構想固め（このリポジトリ＋Google Drive）→ B.スキン側準備（CLI連携強化スキン追加）→ C.trk! 本体実装（CLIパーサー・コマンド実行・設定保存）。Google Drive ファイルID `1gSPdwjz9p-6u7e2aodMvlzh-Zq5-QLN1`（リンク共有・閲覧可能）。
