# ピクセル・コンソール 起動・確認手順書

版 1.0 ／ 2026-11-07 ／ 対象：利用者、Avatar と PWA の開発・確認担当

**正本：** Avatar Library の `docs/re-modern-pixel-console-start-guide.md`。GitHub の `main` に置かれたものを正本とし、個別の検証結果は日時・使用版とともに記録します。相手側の手順は、リンク先の PWA 側文書を正本とします。

**適用範囲：** この手順書は 2 つの固定 PWA による開発・検証のためのものです。将来の PWA 版での動作を保証せず、版の更新時には手順と期待結果を再検証します。書体や作品の正式公開手順ではありません。

**新しい PWA について（2026-11-07）：** 手順 B・C-1 の trk305 は過去の固定版であり、現行仕様として扱わないでください。trk309 では未確認作品の色は既定では適用されず、画面からの選択には「適用」が必要です。開発用スイッチは再読込後も残ります。trk309 での限定試験・戻し方と未確認事項は [開発用スイッチへの返答](2026-11-07-re-modern-dev-switch-answer.md) を参照してください。

## はじめに：どれを開く？

依頼者から作品「ピクセル・コンソール」の承認をいただきました。ありがとうございます。**正式登録・公開、実機や支援技術の確認、PWA の課題解消はこれから**です。この手順のファイルや見本は検証専用で、日常利用や公開配布を目的としません。

| やりたいこと | 手順 | 開くもの | 見える範囲 |
|---|---|---|---|
| 今すぐ作品の全体像を見る | [A](#a-作品の全体像を見る一時スキン棚) | 一時的なスキン棚の見本 | 配色・棚・選択。**旧版 PWA** のスキンとして仮追加したもの |
| PWA の作品読み込みを試す | [B](#b-現行-pwa-で作品ファイルの読み込みを試す) | 固定版＋検証専用ファイル | 共通題字の文字と `!` の2色のみ。書斎・基地・書体は未適用 |
| 自動で確認する | [C](#c-ブラウザの自動-smoke-テスト両リポジトリで共有) | 画面を出さず動く Chromium | Avatar と PWA それぞれの smoke テスト。結果をログで確認 |

A と B は**別物**です。A がきれいに見えることは、B で画面全体に適用されることを意味しません。B では**作品を選んだ後に通常スキンを変更すると、題字色が再判定されず読みにくくなる既知の問題**があります。試験以外には使わず、通常スキン変更前に B-4 の「現状維持」に戻してください。

どちらも PWA のコピーを使います。プレビューのオリジンには設定・Service Worker 等が残ることがあるため、テスト用ブラウザ／プロフィールを使い、大切なデータやログイン情報を持ち込まないでください。手動プレビューの PWA は通信機能を持ち、外部通信をしないとは保証できません。サーバーを外部公開しないでください。

## A. 作品の全体像を見る（一時スキン棚）

### A-1. Arena で起動済みの場合

Arena の **LIVE PREVIEW「PWA」**（ポート 4175）が動いていれば、それを開いて A-3 に進みます。ラベルが異なる場合も、ポート 4175 の一時見本を選びます。停止・環境再作成後は A-2 から起動します。Arena のプレビューでは、手元のブラウザに `localhost` や `127.0.0.1` を入力せず、Arena が表示するプレビューを開いてください。

### A-2. 自分の環境で立ち上げる（Linux/macOS、シェル）

必要なもの：Git、Node.js 22、npm、インターネット接続、Avatar Library のチェックアウト。この操作は既存の PWA 作業ツリーを変更しないよう、**新しい一時フォルダ**にコピーを取得します。`/tmp` は環境によって消えるので、消えたら取得からやり直します。

1. ターミナルを開き、Avatar Library のリポジトリルートへ移動する（`/path/to/` は実際の場所に置き換える）。
2. 以下を**同じターミナル**で順に実行する。`git checkout --detach` は新しく取得した PWA コピーにのみ行い、Avatar Library のブランチは切り替えない。

```sh
cd /path/to/trk-Avatar-Library
PWA_OLD=$(mktemp -d "${TMPDIR:-/tmp}/trk-pwa-old.XXXXXX")
git clone https://github.com/Trk-Nexus/trk-PWA.git "$PWA_OLD"
git -C "$PWA_OLD" checkout --detach f7b1272547f712d9a7d7a198404148457e936008
TRK_PWA="$PWA_OLD" PORT=4175 node tools/preview-re-modern-pixel.mjs
```

3. `Temporary PWA draft preview on port 4175` が出たら起動中。ターミナルを閉じずに、**サーバーとブラウザが同じコンピュータの場合のみ** `http://127.0.0.1:4175/` をブラウザで開く。Arena ではポート 4175 の LIVE PREVIEW を使う。
4. このサーバーは `0.0.0.0` に待ち受けるため、共有ネットワーク上ではアクセス範囲に注意する。起動した端末で `Ctrl+C` を押すとサーバーが止まり、配信用の一時コピーが削除される。取得した `$PWA_OLD` のクローンやブラウザの保存データは自動削除されない。

### A-3. 棚で選ぶ・戻す

1. 初回の案内が出たら閉じ、**設定 → 🎨 見た目 → スキン → 🖼 スキンの棚**を開く。現在のスキン名を控える。
2. **📚 巻**で「制作案・一時テスト」を選び、検索欄に「ピクセル・コンソール」と入力。出てきたカードを選ぶ。背景・本文などが変わる。
3. 戻すときは **📚 巻 → すべての巻**、検索欄を消して控えたスキンを検索し、そのカードを選ぶ。選択はそのプレビューのブラウザに残る場合がある。
4. 見つからないときは検索を消し、⭐／🕒 等の絞り込みを外し、巻が正しいか確認する。見本は最新 PWA の作品インポート機能ではない。**ノーツのおすすめは押さない**（共通ノーツ設定を書き換え、スキンを戻しても自動復元しない）。

## B. 現行 PWA で作品ファイルの読み込みを試す

**開発・検証向け。** PWA 固定 commit `4b4624140757e8faddda5b5a3b8c95df992ad9ca` を使う。新しい版では仕様や既知の問題が異なることがあるので、本手順の結果をそのまま転用しない。固定版の正常性と既知の不具合は [M3 検証記録](2026-11-06-re-modern-m3-avatar-response.md) にある。

1. Avatar Library のルートから以下を同じターミナルで実行し、クリーンな固定 PWA と ZIP を用意する。表示された `PWA_M3=` のパスは B-2 と C で使うので控える。

```sh
cd /path/to/trk-Avatar-Library
PWA_M3=$(mktemp -d "${TMPDIR:-/tmp}/trk-pwa-m3.XXXXXX")
git clone https://github.com/Trk-Nexus/trk-PWA.git "$PWA_M3"
git -C "$PWA_M3" checkout --detach 4b4624140757e8faddda5b5a3b8c95df992ad9ca
printf 'PWA_M3=%s\n' "$PWA_M3"
TRK_PWA="$PWA_M3" node tools/build-re-modern-draft.mjs
```

成功すると `dist/re-modern-drafts/pixel-console.DRAFT.stpack` ができる。2026-11-06 の固定入力では 36,315 B、SHA-256 `1d0ca30fa7f6390acabfe89d70b76671beb08b6d880d414f7a4cf3026c997bba`。`DRAFT`／表示名の「未承認」は**当時作成した検証ファイルの表示**であり、2026-11-07 の作品承認を取り消すものではない。このファイルは引き続き検証専用。固定 PWA が clean でない場合や版が違う場合、生成はエラーで止まる。

2. 元の PWA リポジトリではなく、配信用の別の一時コピーからサーバーを立てる。同じターミナルで実行し、そのまま起動しておく。Python 3 が必要。バージョン管理用 `.git` は配信しない。

```sh
PWA_SITE=$(mktemp -d "${TMPDIR:-/tmp}/trk-pwa-site.XXXXXX")
git -C "$PWA_M3" archive HEAD | tar -x -C "$PWA_SITE"
cd "$PWA_SITE"
python3 -m http.server 8770 --bind 0.0.0.0
```

サーバーとブラウザが同じコンピュータなら `http://127.0.0.1:8770/`、Arena ならポート 8770 の LIVE PREVIEW を開く。ポートが使われていたら別の空きポートに変更する。これは実験用 PWA の静的ファイルを配るサーバーで、操作によって保存したデータはブラウザ側に残る。終了は `Ctrl+C`。一時クローン・配信コピーは自動削除されない。

3. 初回案内を閉じ、**設定 → 🎨 見た目 → スキン → 📂 作品ファイルを読む**から、手順1の `pixel-console.DRAFT.stpack` を選ぶ。ファイル選択画面は**ブラウザが動く端末のファイル**を表示するので、Arena の遠隔環境に生成したファイルは手元の端末へ安全に移してから選ぶ必要がある。PWA の表示にはハッシュ先頭12桁が出る。
4. 「共通」を **この領域だけ独立**にし、隣の作品欄で「ピクセル・コンソール（未承認・検証用）」を選ぶ。変わるのは題字 `trk!` の文字と `!` の色だけ。読み込みだけでは自動適用されない。対比が足りない色は既定のままになる。戻すには「共通」を **現状維持**にする（3領域すべてを戻すボタンもあるが、他の領域設定も変える）。作品の一括削除は全作品を外すので、テスト用プロフィールでのみ使用する。

## C. ブラウザの自動 smoke テスト（両リポジトリで共有）

ここでの Chromium は **headless（画面を開かずに実行）**。目視で操作したい場合は A または B の LIVE PREVIEW を使う。`npm run check` とは別で、実機・読み上げ・Safari 等を代替しない。以下の Chromium の確認は **Linux x86_64 sandbox・Node.js 22** で実施したもので、macOS・Windows・ARM 等の環境は未検証。対応するブラウザと共有ライブラリの準備が別途必要。

### C-1. Avatar 側：作品 ZIP の読み込みから戻すまで

B-1 のクリーンな固定 PWA と、Avatar Library ルートが必要。別のターミナルでは B-1 で控えた実際のパスを設定する。`npm ci` はロックファイルに従い、このリポジトリの依存を入れ直す。

```sh
cd /path/to/trk-Avatar-Library
npm ci
PWA_M3=/B-1で控えた実際のパス
TRK_PWA="$PWA_M3" node tests/re-modern-work-m3.test.mjs
```

成功時は JSON が出て終了コード 0。`uploadedViaFileInput`、`commonTitleViaUi`、`reloadPersisted`、`badFileRejected`、`keepRestoresTitle` が `true`。`skinTransition` の対比不足と inline 色の残存は**既知不具合の再現確認**であり、安全に合格した意味ではない。試験は専用の PWA コピーと新しいブラウザ環境を使い、外部通信と Service Worker を遮断する。A のスキン棚自体を確認する場合は旧版の PWA を使い、`TRK_PWA="$PWA_OLD" node tests/re-modern-pixel-production-browser.test.mjs`。

### C-2. Linux sandbox で Chromium の共有ライブラリが無い場合

PWA 側の [smoke の立て方（固定版）](https://github.com/Trk-Nexus/trk-PWA/blob/4b4624140757e8faddda5b5a3b8c95df992ad9ca/tools/smoke/README.md) の方法を Avatar 側でも利用できる。次は Avatar の `npm ci` 後、**同じターミナル・リポジトリルート**で実行する。`al2023.tar.br` は npm 依存に含まれる。Linux の例であり、他の OS に使わない。

```sh
BROWSER_LIBS=$(mktemp -d "${TMPDIR:-/tmp}/trk-browser-libs.XXXXXX")
node -e 'const fs=require("fs"),z=require("zlib"); fs.writeFileSync(process.argv[1], z.brotliDecompressSync(fs.readFileSync("node_modules/@sparticuz/chromium/bin/al2023.tar.br")))' "$BROWSER_LIBS/al2023.tar"
tar -xf "$BROWSER_LIBS/al2023.tar" -C "$BROWSER_LIBS"
LD_LIBRARY_PATH="$BROWSER_LIBS/lib${LD_LIBRARY_PATH:+:$LD_LIBRARY_PATH}" TRK_PWA="$PWA_M3" node tests/re-modern-work-m3.test.mjs
```

2026-11-07 の sandbox で、同梱ライブラリと Avatar の Chromium 133 で上記テストが終了コード 0 になることを確認した。日本語フォントが環境に無い場合、□表示になることがある。自動操作の成功は日本語の見た目が適切という証明ではない。

### C-3. PWA 側：共通題字の smoke

[PWA 側 README の手順 1〜4](https://github.com/Trk-Nexus/trk-PWA/blob/4b4624140757e8faddda5b5a3b8c95df992ad9ca/tools/smoke/README.md) が正本。PWA 側は `puppeteer-core` と Chromium 141 を使い、PWA の smoke script を依存のある一時ディレクトリにコピーして実行する。テストは画面を表示せず、スクリーンショットを `/home/user/smoke-paint.png` に**上書き**するため、このパスが存在・書き込み可能な Linux sandbox でのみ以下を実行し、既存ファイルに注意する。別環境では PWA 側の script の出力先を確認・調整する。

1. **ターミナル1**で B-2 の固定 PWA サーバーを起動したままにする。
2. **ターミナル2**で次を実行。PWA のパスには B-1 で控えたものを指定する。依存と Chromium の展開先は新しい一時フォルダに分け、Avatar 側の版と混ざらないようにする。`timeout` コマンドが必要。

```sh
PWA_M3=/B-1で控えた実際のパス
SMOKE_DIR=$(mktemp -d "${TMPDIR:-/tmp}/pwa-smoke.XXXXXX")
npm install --prefix "$SMOKE_DIR" --no-save @sparticuz/chromium@141.0.0 puppeteer-core@24.43.1
mkdir -p "$SMOKE_DIR/libs" "$SMOKE_DIR/run"
node -e 'const fs=require("fs"),z=require("zlib"); fs.writeFileSync(process.argv[2],z.brotliDecompressSync(fs.readFileSync(process.argv[1])))' "$SMOKE_DIR/node_modules/@sparticuz/chromium/bin/al2023.tar.br" "$SMOKE_DIR/libs/al2023.tar"
tar -xf "$SMOKE_DIR/libs/al2023.tar" -C "$SMOKE_DIR/libs"
cp "$PWA_M3/tools/smoke/remodern-paint-smoke.mjs" "$SMOKE_DIR/smoke-paint.mjs"
TMPDIR="$SMOKE_DIR/run" LD_LIBRARY_PATH="$SMOKE_DIR/libs/lib${LD_LIBRARY_PATH:+:$LD_LIBRARY_PATH}" timeout 170 node "$SMOKE_DIR/smoke-paint.mjs"
```

PWA サーバーが 8770 以外なら最後のコマンドに `SMOKE_URL=http://127.0.0.1:ポート番号/index.html` を追加する。これはテストプロセスがサーバーと同じ環境で動く場合の内部接続先で、Arena 利用者がブラウザに入力する URL ではない。確認後、ターミナル1で `Ctrl+C` を押す。一時フォルダは自動削除されない。

2026-11-07 の sandbox で `@sparticuz/chromium` 141.0.0／puppeteer-core 24.43.1 を準備。初回は共有 `/tmp/chromium` に既存の Chromium 133 が残っていたため実際には 133 が起動し、`timeout 170` で 124。次に**別の空の `TMPDIR`** を指定して Chromium 141.0.7390.0 を起動し、`timeout 70` で 124。どちらも `before` は2色とも空、`applied` は `rgb(224, 232, 255)` と空、`cleared` は2色とも空、`errors: []` でスクリーンショットが出たが、ブラウザ終了待ちが終わらず、正常終了とは報告しない。PWA 側 README にも終了の遅延の注意がある。`@sparticuz/chromium` は同じ一時ディレクトリの `chromium` を再利用するため、異なる版の試験では分離し、実バイナリの `--version` も確認する。長く止まる場合はタイムアウトや `Ctrl+C` を使い、出力と終了コードを両方記録する。PWA 側の smoke が使うテストデータはピクセル・コンソールそのものではない。

## 困ったとき

- **PWA checkout must be clean and at the recorded commit**：A と B/C は別の固定版。`git -C "$PWA_OLD" status --short`、`git -C "$PWA_M3" status --short` とそれぞれの `rev-parse HEAD` を確認。既存の変更を消さず、新しい一時コピーを取得する。
- **Address already in use**：既に同じポートが使用中。確認して既存のプレビューを使うか、`PORT=4176` など空きポートで起動する。B の Python サーバーも同様にポートを変え、ブラウザや `SMOKE_URL` を合わせる。
- **libnspr4.so／libnss3.so が無い**：Linux sandbox なら C-2 のライブラリ展開と `LD_LIBRARY_PATH` を確認。ディレクトリを作らず `cwd` に指定してもコマンドは実行されない。
- **ブラウザに前の設定が残る**：一時サーバー停止だけでは保存は消えない。専用ブラウザプロフィールを閉じるか、そのプレビューのサイトデータを確認して削除する。他のサイトのデータを消さない。
- **続き・権利・公開条件を知りたい**：[作品の制作記録](../drafts/re-modern/pixel-console/README.md)、[制作ガイドライン](trk-re-modern-guidelines.md)、[M3 検証記録](2026-11-06-re-modern-m3-avatar-response.md) を参照。
