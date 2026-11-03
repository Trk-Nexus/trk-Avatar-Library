# CLI 定番機能と Wizard スキン案（資料）

**作成日:** 2026-11-03  
**目的:** trk CLI 受け口（trk268）における Wizard スキンの定番化を検討するための参考資料  
**対象:** 実装担当（trk-PWA 側）への伝達資料 + Skin 側の追加制作案

---

## 1. CLI 定番機能（調査まとめ）

Web 検索と Google Drive 内の trk268 関連文書から、CLI/ターミナルで「外せない」とされる定番機能を整理しました。

### 1-1. 定番コマンド（基本5＋α）

| カテゴリ | コマンド | 役割 | 出典 |
|---|---|---|---|
| 現在地 | `pwd` | 今いるフォルダのパスを表示 | [1] |
| 一覧 | `ls`（`dir`） | ファイル・ディレクトリ一覧 | [1][2] |
| 移動 | `cd` | ディレクトリ移動 | [1][2] |
| コピー | `cp` | ファイル複製 | [1][2] |
| 移動/改名 | `mv` | ファイル移動・リネーム | [1][2] |
| 削除 | `rm` | ファイル削除 | [2][3] |
| 作成 | `mkdir` | ディレクトリ作成 | [3] |
| 表示 | `cat` | ファイル内容表示 | [3][4] |
| 検索 | `grep` | テキスト検索 | [3][4] |
| 編集 | `nano`/`vi` | テキスト編集 | [4] |
| 権限 | `sudo`/`chmod` | 管理者権限・権限変更 | [4] |
| 履歴 | `history` | コマンド履歴表示 | [4] |
| 補完 | Tab キー | ファイル名・コマンド名自動補完 | [1] |
| ヘルプ | `--help` / `man` | コマンド説明表示 | [5] |
| パイプ | `\|` | コマンドをつなげる | [3] |

### 1-2. ターミナル定番機能（カスタマイズ項目）

| 項目 | 定番の値・傾向 | スキンへの反映案 |
|---|---|---|
| **カラースキーム** | Dracula / Gruvbox / Tokyo Night / Nord / Catppuccin / Monokai | Wizard 風にアレンジした配色セット |
| **フォント** | 等幅フォント（JetBrains Mono / Cascadia Mono / Courier New / Press Start 2P） | `cli.font` で等幅フォントを指定 |
| **プロンプト** | `>` / `$` / `#` / `λ` など1〜4文字 | `cli.prompt` で呪文風プロンプト |
| **キャレット色** | アクセント色と同じか補色 | `cli.caret` でカーソル色 |
| **走査線** | 0.0 〜 0.6（CRT感） | `cli.scan` でスキャンライン濃度 |
| **タブ/ペイン** | 分割表示、マルチペイン | スキン側では表現困難（本体側機能） |
| **検索・コピーモード** | vimライクコピーモード | 本体側機能（スキンでは色で強調） |
| **透過・ぼかし** | 背景透過率 | `colors.bg` の rgba / opacity で表現 |
| **ショートカット** | Ctrl+C / Ctrl+V / Esc / 終了 | 本体側機能（スキンでは color で誘導） |

### 1-3. トレンドカラースキーム（2026年）

| スキーム名 | 背景 | 文字 | アクセント | 特徴 |
|---|---|---|---|---|
| Dracula | #282a36 | #f8f8f2 | #ff79c6 | 定番、視認性高い |
| Gruvbox | #282828 | #ebdbb2 | #fabd2f | レトロ、目に優しい |
| Tokyo Night | #1a1b26 | #c0caf5 | #bb9af7 | モダン、高コントラスト |
| Nord | #2e3440 | #d8dee9 | #88c0d0 | スカンジナビア風 |
| Catppuccin | #1e1e2e | #cdd6f4 | #f2cdcd | 近年人気、パステル |
| Monokai | #272822 | #f8f8f2 | #f92672 | コード用、視認性重視 |

---

## 2. Wizard スキンの現状（このリポジトリ）

`catalog/skins.json` における wizard カテゴリ（CLI対応含む）の現状：

| スキンID | テーマ | CLI対応 | cli.font | cli.prompt | cli.caret | cli.scan |
|---|---|---|---|---|---|---|
| `wizard-cli` | 黒端末・白呪文 | ✅ | Cascadia Mono | `λ` | `#39ff14` | 0.12 |
| `wizard-terminal` | 琥珀色CRT | ✅ | Courier New | `>` | `#ffbf00` | 0.15 |
| `wizard-grimoire` | 魔導書・羊皮紙 | ✅ | Trajan Pro / Garamond | `>` | `#d4af37` | 0.08 |
| `wizard-arcane` | 神秘・紫×マゼンタ | ✅ | Cinzel / Trajan Pro | `✦` | `#ff00ff` | 0.18 |
| `wizard-console` | 打鍵感重視・CRT | ✅ | Courier New | `λ` | `#39ff14` | 0.20 |
| `wizard-spell` | スペルキャスト | ❌ | - | - | - | - |
| `wizard-rune` | ルーン文字 | ❌ | - | - | - | - |
| `wizard-alchemy` | 錬金術 | ❌ | - | - | - | - |
| `wizard-cauldron` | 大釜 | ❌ | - | - | - | - |
| `wizard-crystal` | クリスタルボール | ❌ | - | - | - | - |
| `wizard-tarot` | タロット | ❌ | - | - | - | - |
| `wizard-void` | ヴォイド | ❌ | - | - | - | - |
| `wizard-eldritch` | エルドリッチ | ❌ | - | - | - | - |
| `wizard-seance` | 降霊術 | ❌ | - | - | - | - |
| `wizard-ouija` | ウィジャ板 | ❌ | - | - | - | - |
| `wizard-hermetic` | ヘルメティック | ❌ | - | - | - | - |
| `wizard-necromancer` | ネクロマンサー | ❌ | - | - | - | - |

CLI対応：5種 / 17種。残り12種は `cli` オブジェクトを持たない。

---

## 3. 定番 CLI スキン案（追加制作候補）

CLIを使う人々の定番機能・操作感にインスパイアされた、Wizard側の視野からの新スキン案です。すべて `cli` オブジェクト（§9.3 準拠）を持ち、`cat` に `"wizard"` を含みます。

### 3-1. `wizard-grep` — 検索・ハイライト重視

| 項目 | 値 |
|---|---|
| テーマ | テキスト検索・マッチ強調・黄色マーカー |
| `cat` | `["wizard", "fun", "access"]` |
| `cli.font` | `"Courier New, Courier, monospace"` |
| `cli.prompt` | `?` |
| `cli.caret` | `#ffff00` |
| `cli.scan` | 0.10 |
| `colors.accent` | `#ffff00`（マッチ強調色） |
| `colors.bg` | `#0a0a0a` |
| `video` | `saturate(1.4) contrast(1.2) brightness(.9)` |

### 3-2. `wizard-man` — マニュアル・ドキュメント重視

| 項目 | 値 |
|---|---|
| テーマ | manページ・ドキュメント閲覧・serifフォント |
| `cat` | `["wizard", "life", "grad"]` |
| `cli.font` | `"Trajan Pro, Garamond, serif"` |
| `cli.prompt` | `>` |
| `cli.caret` | `#cbd5e1` |
| `cli.scan` | 0.05 |
| `colors.accent` | `#cbd5e1` |
| `colors.bg` | `#f5f5f5` |
| `video` | `sepia(.1) brightness(1.02)` |

### 3-3. `wizard-sudo` — 管理者権限・警告重視

| 項目 | 値 |
|---|---|
| テーマ | root権限・警告色・赤アクセント |
| `cat` | `["wizard", "dark", "access"]` |
| `cli.font` | `"Cascadia Mono, Consolas, monospace"` |
| `cli.prompt` | `#` |
| `cli.caret` | `#ff0040` |
| `cli.scan` | 0.15 |
| `colors.accent` | `#ff0040` |
| `colors.bg` | `#0a0a0a` |
| `video` | `hue-rotate(0deg) saturate(1.5) contrast(1.3) brightness(.8)` |

### 3-4. `wizard-pipe` — パイプライン・フロー重視

| 項目 | 値 |
|---|---|
| テーマ | コマンドをつなぐ・矢印・フロー感 |
| `cat` | `["wizard", "fun", "grad"]` |
| `cli.font` | `"Rajdhani, Oswald, sans-serif"` |
| `cli.prompt` | `→` |
| `cli.caret` `#00ffff` |
| `cli.scan` | 0.12 |
| `colors.accent` | `#00ffff` |
| `colors.bg` | `#050510` |
| `video` | `hue-rotate(200deg) saturate(1.6) brightness(.75) contrast(1.3)` |

### 3-5. `wizard-history` — 履歴・タイムスタンプ重視

| 項目 | 値 |
|---|---|
| テーマ | コマンド履歴・過去の呪文・タイムスタンプ |
| `cat` | `["wizard", "life", "dark"]` |
| `cli.font` | `"Courier New, Courier, monospace"` |
| `cli.prompt` | `@` |
| `cli.caret` | `#80deea` |
| `cli.scan` | 0.10 |
| `colors.accent` | `#80deea` |
| `colors.bg` | `#00000a` |
| `video` | `brightness(1.05) saturate(.9) contrast(1.02)` |

### 3-6. `wizard-tmux` — マルチペイン重視

| 項目 | 値 |
|---|---|
| テーマ | 画面分割・グリッド・ペイン操作 |
| `cat` | `["wizard", "fun", "access"]` |
| `cli.font` | `"JetBrains Mono, monospace"` |
| `cli.prompt` | `+` |
| `cli.caret` | `#f92672` |
| `cli.scan` | 0.08 |
| `colors.accent` | `#f92672` |
| `colors.bg` | `#272822` |
| `video` | `saturate(1.2) contrast(1.15) brightness(.95)` |

### 3-7. `wizard-nord` — 定番カラースキーム（Nord）Wizard風

| 項目 | 値 |
|---|---|
| テーマ | スカンジナビア風・青灰系・落ち着いた夜間モード |
| `cat` | `["wizard", "grad", "light"]` |
| `cli.font` | `"JetBrains Mono, monospace"` |
| `cli.prompt` | `>` |
| `cli.caret` | `#88c0d0` |
| `cli.scan` | 0.06 |
| `colors.accent` | `#88c0d0` |
| `colors.bg` | `#2e3440` |
| `video` | `saturate(.8) brightness(1.02)` |

---

## 4. 実装担当（trk-PWA 側）への伝達事項

trk268 受け入れ条件（Google Drive フォルダ `1YuApiK64rdk4NfpE615QbuqyO1YTuGP2` 内）に基づき、Skin 側から以下を要請・確認します。

### 4-1. `cli` オブジェクトの拡張可能性（§9.3 現状）

現状、`cli` は 4 プロパティに制限：
- `font`: フォント名（120文字まで、使用禁止文字なし）
- `prompt`: 入力の合図（1〜4文字、使用禁止文字なし）
- `caret`: キャレット色（`#rgb` / `#rrggbb` / `currentColor`）
- `scan`: 走査線濃度（0 〜 0.6）

**追加検討項目（本体側との調整が必要）：**
- `bell`: ビープ音・警告音のON/OFF
- `cursor`: カーソル形状（block / underline / bar）
- `opacity`: 背景透過率
- `history`: 履歴保存件数
- `completion`: 補完の挙動（Tab / ふずぃ）

### 4-2. スキン自動切替のトリガー

acceptance conditions §2 より：
- `cat` に `wizard` / `cli` / `console` のいずれかを含むスキン → 端末開いている間、そのスキンが当たる（`auto`）
- `auto` は `wizard` を含む中で最初の1スキン → 元に戻す `terminal`
- `settings.cliSkin` で明示指定するとその ID が優先

### 4-3. コントラスト基準（§9.3-C）

| 組み合わせ | 最小コントラスト比 |
|---|---|
| `--ui-text` vs `--ui-panel` / `--ui-field` | 4.5:1 以上 |
| エラー行 (`--j-miss`) vs `--ui-field` | 3:1 以上 |

### 4-4. 検証ツール

`tools/check-cli-skin.mjs` で以下をチェック：
- `cat` に `"wizard"` 含有
- `colors` の必須5色（bg/panel/text/accent/gold）
- コントラスト比
- `cli` の font/prompt/caret/scan 値
- 使用禁止文字（`/` `\` `` ` `` `~` `:` `..` `C:`）

終了コード：0=受け取り / 1=名前なし / 2=読めない

---

## 5. 次のステップ

1. 本資料を実装担当に共有し、`cli` オブジェクトの拡張可能性を確認
2. 定番スキン案（3-1〜3-7）から優先順位をつけて制作
3. `check-cli-skin.mjs` で全スキンが exit 0 を通過することを確認
4. `gallery/skins-wizard.html` を更新しプレビュー

---

**参考文献（Web 検索より）:**
- [1] ターミナル・CLI入門｜非エンジニアのための基本コマンド2026（ai-agent.camp）
- [2] コマンドラインインターフェース（CLI）| IT用語解説（espedia.es-p.jp）
- [3] 【2026年最新版】Linuxコマンドの基本一覧（minto.tech）
- [4] 【Mac】ターミナルの使い方と必須コマンド30選（logicalyze.com）
- [5] CLI（コマンドラインインターフェース）とは？（the-simple.jp）
- [6] Windows Terminal カスタマイズ完全ガイド（jisaku.com）
- [7] Best Linux Terminal Emulators: 2026 Comparison（glukhov.org）
