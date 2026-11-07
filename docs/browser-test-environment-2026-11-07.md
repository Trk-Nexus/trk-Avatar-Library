# Chromium ブラウザ試験環境の準備と再現

2026-11-07／Avatar Library の開発・検証用。以前の[ピクセル・コンソール開始ガイド C 節](re-modern-pixel-console-start-guide.md#c-ブラウザの自動-smoke-テスト両リポジトリで共有)にある方法を、将来の開発にも使えるよう切り出し、実行バイナリの混在を避ける手順を追記したものです。作品や PWA の機能を公開・承認する手順ではありません。

## 何を用意するか

このリポジトリの `package-lock.json` が固定する Node 依存は `playwright-core` 1.50.1 と `@sparticuz/chromium` 133.0.0。後者の npm パッケージには圧縮された Linux 用 Chromium と一部の共有ライブラリ・SwiftShader が入っています。`playwright-core` 自身はブラウザをダウンロードしません。

以下は **Debian GNU/Linux 12、x86_64、Node.js 22.22.3、npm 10.9.8** の sandbox で確認。Linux システムには別途必要なライブラリがあり、環境によっては追加で欠けるものがあります。他の Linux ディストリビューション、ARM、Windows、macOS、実機ではこの手順の互換性を確認していません。インターネットを使うのは主に npm registry への `npm ci` と、必要に応じて GitHub から固定 PWA を取得する時です。この sandbox では他の一般サイトへの直接接続は利用できません。

- `npm test` の末尾で `libnss3.so` 等の不足により Chromium が起動しない場合でも、**ソースを修正する必要はありません**。OS のパッケージ管理者に相談して必要な共有ライブラリを入れる方法か、以下の一時ディレクトリに展開する方法を選べます。OS へのインストールは権限・接続・各環境の更新方針に依存し、ここでは未実施です。
- 以下の実例は sudo 不要、システム領域を書き換えず、リポジトリにバイナリを追加しません。ただし実行するブラウザと共有ライブラリは npm 由来のネイティブコードです。hash と lockfile の確認は**真正性・安全性そのものを保証するものではありません**。信頼できる依存・隔離環境を使い、本番のブラウザプロファイルや個人データを使わないでください。
- コマンドはすべて **Avatar Library のルートで同じターミナル**に実行します。別ターミナルや新しいセッションでは変数を設定し直す必要があります。一時ディレクトリや `node_modules` は Arena の永続成果物ではなく、消えた場合は再作成してください。圧縮物・展開物と npm 依存で数百 MB の空き容量が必要です。

## 1. 依存を取得して確認

```sh
# リポジトリルートで実行。npm ci は既存の node_modules を入れ直す。
node --version
npm --version
uname -m
npm ci
npm ls @sparticuz/chromium playwright-core --depth=0
```

2026-11-07 の固定 lock では上記が Chromium `133.0.0`／Playwright Core `1.50.1` を示します。`package-lock.json` の SHA-256 は `e177d2be3ac9d18c054e99ec939e87f3f8e44cc996983da798267508ee0271a3`。lock や版が更新された場合は、以下の固定 hash を無理に書き換えて通さず、取得元・実際のバイナリと新しい環境での動作を調べ直します。

## 2. 共有ライブラリとブラウザを隔離して展開

GNU `tar`・`sha256sum` が必要。下記はパッケージ内の対象アーカイブと Chromium の hash を照合してから、**新しい一時ディレクトリ**に展開します。信頼できない tar をこの方法で展開しないでください。

```sh
# いずれかの検査が失敗したら先へ進まず原因を確認する。
sha256sum package-lock.json
sha256sum -c <<'SHA256'
2078f277b46a661222613d290d3264367905f1d9f08346239b8647d4ed694e65  node_modules/@sparticuz/chromium/bin/chromium.br
1f481fbdea3425e5b41e74f8d58b75c81dd780552c8f03a572c756fe5297799e  node_modules/@sparticuz/chromium/bin/al2023.tar.br
8f60f16ff5f666c43024360bdae6e0eca3ceefd29137ad5686ab75da2fc6a4b1  node_modules/@sparticuz/chromium/bin/swiftshader.tar.br
SHA256

BROWSER_ENV=$(mktemp -d "${TMPDIR:-/tmp}/avatar-browser-env.XXXXXX")
mkdir -p "$BROWSER_ENV/libs" "$BROWSER_ENV/run"
node -e 'const fs=require("node:fs"),z=require("node:zlib");for(const n of ["al2023","swiftshader"])fs.writeFileSync(`${process.argv[1]}/${n}.tar`,z.brotliDecompressSync(fs.readFileSync(`node_modules/@sparticuz/chromium/bin/${n}.tar.br`)))' "$BROWSER_ENV/libs"
tar -xf "$BROWSER_ENV/libs/al2023.tar" -C "$BROWSER_ENV/libs"
tar -xf "$BROWSER_ENV/libs/swiftshader.tar" -C "$BROWSER_ENV/run"
node -e 'const fs=require("node:fs"),z=require("node:zlib");fs.writeFileSync(process.argv[1],z.brotliDecompressSync(fs.readFileSync("node_modules/@sparticuz/chromium/bin/chromium.br")))' "$BROWSER_ENV/run/chromium"
chmod 700 "$BROWSER_ENV/run/chromium"
printf '環境の一時パス: %s\n' "$BROWSER_ENV"
sha256sum "$BROWSER_ENV/run/chromium"
# この固定版なら d3fb6170098bfa1adc58bf2a184b075f74ff079d0af375f326241d560182eccc
```

上記の `sha256sum -c` が失敗した場合、対話シェルは自動停止しないことがあります。エラーのまま続きを実行しないでください。解凍後の実行ファイルの hash も照合します。

次に**このターミナルの試験プロセスだけ**に必要なパスを渡します。`LD_LIBRARY_PATH` は子プロセス全体のライブラリ探索に影響するため、作業専用ターミナルで使い、常設の shell 設定には書き込みません。別のターミナルでは控えた `BROWSER_ENV` を再設定してから3行を実行します。

```sh
export TMPDIR="$BROWSER_ENV/run"
export CHROMIUM_PATH="$BROWSER_ENV/run/chromium"
export LD_LIBRARY_PATH="$BROWSER_ENV/libs/lib${LD_LIBRARY_PATH:+:$LD_LIBRARY_PATH}"
"$CHROMIUM_PATH" --version
ldd "$CHROMIUM_PATH" | grep 'not found' || true
```

成功時 `Chromium 133.0.6943.0`。`ldd` の `not found` が出たら共有ライブラリ不足であり、無表示だけでも実動作は保証できません。後述の `npm test` の終了コードまで確認してください。元の環境に戻すには専用ターミナルを終了します。`unset` は元々設定されていた値も消すため安易に常用しません。記録された自分の一時ディレクトリは、試験を終了して不要になったこと・パスを確認してから利用者が削除できます。

### なぜ `CHROMIUM_PATH` まで指定するか

この固定版 `@sparticuz/chromium` 133 の `executablePath()` は、**`/tmp/chromium` が存在すると先にそれを返します**。`TMPDIR` だけ変えても、共有の `/tmp/chromium` に以前の別バージョンがあれば、それを使ってしまうことがあります。従って、自分の一時フォルダに固定版を直接解凍し、`CHROMIUM_PATH` を明示し、`--version` と hash を確認します。既存の `/tmp/chromium` を削除・上書きする必要はありません。開始ガイド C-3 の別版 Chromium 141 は別の smoke と依存であり、133 と同じファイルとして混ぜないでください。

この手順では追加の多言語フォントをインストールしていません。フォント不足による代替や豆腐表示はあり得ます。描画の可否と日本語・中国語・韓国語の字形や可読性は別の確認です。

## 3. 基本試験

同じターミナル、同じリポジトリルートで実行：

```sh
npm run check
npm test
node tests/re-modern-pixel-preview.test.mjs
node tests/re-modern-catalog-prototype.test.mjs
```

`npm test` は複数の Node 検査と Chromium 操作試験を実行します。最後に `✅ advance wizard: Chromium behavior, persistence, XSS, subpath and offline` と出て**終了コード 0**になることを確認。残り2件はピクセル見本とカタログ試作の操作検査で、追加で実行するものです。途中の一部成功だけを全体成功としないでください。CI が使う OS やライブラリ構成はこの一時セットアップとは別です。

## 4. 固定 PWA で題字色の隔離実験を再現する場合

必須ではありません。Git と GitHub へのアクセスが必要です。以下は**新規一時クローン**の中だけで checkout します。既存の利用者の PWA 作業コピーや Avatar の作業ブランチは変更しません。同じターミナルでセクション2の環境変数が必要です。

```sh
PWA_HANDOFF=$(mktemp -d "${TMPDIR:-/tmp}/trk-pwa-handoff.XXXXXX")
git clone --no-checkout https://github.com/Trk-Nexus/trk-PWA.git "$PWA_HANDOFF"
git -C "$PWA_HANDOFF" checkout --detach 4f93a69f94ec3a3c14c6ea8d1cf9c064723b43e6
git -C "$PWA_HANDOFF" rev-parse HEAD
git -C "$PWA_HANDOFF" status --porcelain
TRK_PWA="$PWA_HANDOFF" node tests/re-modern-pwa-handoff.test.mjs
```

HEAD が指定 hash と一致し、status は空であること。このテストはクリーンでないコピー・異なる commit を拒否します。2026-11-07 の成功結果は `browser: 133.0.6943.0`、生成実験パック 36,813 B／SHA-256 `628bafef9c2b71e3246416d7770622fc3df0f4dca54a4960322e6848fea56ddd`、`isolatedImport`・`noPaintWithoutDev`・`devPaint`・`persistReload`・`devOffRestoresTitle`・`skinNotesFontUnchanged` が true、終了コード 0。**共通題字の色のみ**、空プロフィール・既定背景・固定 PWA の隔離試験です。書体・作品全体・実機・アクセシビリティ・法的確認・公開承認ではありません。新規クローンも一時ディレクトリ内に残り、セッション終了等で消えます。

trk315 の特性試験 `tests/re-modern-trk315-review.test.mjs` は別物です。固定 PR 版の取得と `TRK_PWA_315` が必要で、VM の模擬ストレージ・模擬 FontFace を使います。Chromium を使った実ブラウザ試験ではありません。対象版・範囲は [一括回答31](re-modern-research/31-pwa-trk315-consolidated-response-2026-11-07.md) に記載しています。

## 5. この環境で確認できたこと・残ること

2026-11-07 に、上記手順の一時環境で `npm run check`・`npm test`、見本とカタログの追加ブラウザ試験、固定 PWA の題字色実験がそれぞれ終了コード 0。Linux x86_64 の headless Chromium 133 とそのテスト条件に限ります。PR trk315 の実ブラウザ追試、多言語フォントの目視、Firefox／Safari、モバイル端末、支援技術、各言語の読み手の評価は実施していません。

- `lib*.so: cannot open shared object file`：手順2の `LD_LIBRARY_PATH`、`ldd` と対象アーキテクチャを確認。無関係なサイトの野良ライブラリを追加しない。
- 意図しない Chromium の版：`CHROMIUM_PATH`・`"$CHROMIUM_PATH" --version`・hash を確認。`/tmp/chromium` が残っていても手順2の明示パスなら使わない。
- `npm ci` のネットワーク失敗：npm registry に到達可能か、lockfile と npm のエラーを確認。ライブラリだけの展開では依存の取得を代替しない。
- PWA の clone／checkout 失敗：ネットワーク・GitHub のアクセスを確認し、一時クローンを再作成。認証情報や秘密情報を文書・コマンド履歴へ貼らない。
- ブラウザ起動が終わらない：プロセスの出力と終了コードを記録し、中断する。異なる版や smoke の終了問題は[開始ガイド C-3](re-modern-pixel-console-start-guide.md#c-3-pwa-側共通題字の-smoke)も参照。
