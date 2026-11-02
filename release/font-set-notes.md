# trk! 書体セット（全部・r10）

**書体パックを、全部まとめて。** 見本 4 枚・目録・書体パック **29 本（42 ウェイト）**を 1 ファイルにした **64.20 MB** のセットです。
**`.zip` と `.stlib` は中身が同じ**（同じバイト列・同じ sha256）です。**trk235（2026-11-01）以降は `.stlib` をそのまま選ぶだけ**で入ります。

> r6 から、セットは **2 つ**に分かれました。
> - **はじめてセット**（軽い・8.12 MB）… まず試す人向け。見本＋目録＋書体 5 本
> - **書体セット（このリリース）** … 書体を全部。はじめてセットの 5 本も入っています（重なっても、すでに入っているパックはアプリが飛ばします）
>
> 1 本だけ欲しいときは、このセットを落とさずに `gallery/fonts.html`／`gallery/packs.html` の「⬇ .stpack」からどうぞ。

## 手順

1. ファイルを落とす — **trk235 以降のアプリなら `.stlib` をそのまま選ぶだけ**（展開は要りません）
   （設定 → 📦 カスタムパック → 📚 目録から入れる → **📦 セット（.stlib / .zip）を選ぶ**）
2. `gallery/all-skins.html` で見た目を、`gallery/fonts.html` で書体を、`gallery/packs.html` で**パックごとの中身**を、`gallery/pairings.html` で**組み合わせ**を見る（オフラインOK）
3. 入れたら、📦 カスタムパックの一覧で「使う」を押すと、本文の書体ごと切り替わります

- 入れる前に **大きさ → sha256** を照合します。目録と違うものは入りません
- **すでに入っているパック（版も同じ）は飛ばします**。はじめてセットのあとにこれを選ぶと、**入る 24 本（約 53.4 MB）／飛ばす 6 本**になります（`check-set-app --both` で確かめています）
- **trk236 以降**：📚 目録から入れる → 各パックの「🔎 中身」に **太さ・対応字数・大きさ・タグ・ひとこと** が出ます
- **trk237 以降**：一覧の上に**雰囲気のタグ**（多い順）が出ます。押すとその語のパックだけに絞られます
- **trk238 以降**：📦 カスタムパックの上に **「🔤 入れている書体」**（家族名・太さ・パック名・ひとこと・タグ・対応字数・大きさ）が出ます

## 中身（29 パック）

**定番の 2 家族から。** 本文と見出しの基準になる書体です。

| パック | 書体 | ライセンス |
| --- | --- | --- |
| `font-packs/noto-sans-jp.stpack` | Noto Sans JP 400／500／700 | OFL-1.1 |
| `font-packs/noto-serif-jp.stpack` | Noto Serif JP 400／600／700 | OFL-1.1 |

**明朝。** 和風・読み物・レトロ。

| パック | 書体 | ライセンス |
| --- | --- | --- |
| `font-packs/shippori-mincho.stpack` | Shippori Mincho 400／700 | OFL-1.1 |
| `font-packs/zen-old-mincho.stpack` | Zen Old Mincho 400／700 | OFL-1.1 |
| `font-packs/kaisei-tokumin.stpack` | Kaisei Tokumin 400／500／700 | OFL-1.1 |
| `font-packs/kaisei-decol.stpack` | Kaisei Decol 400／700 | OFL-1.1 |
| `font-packs/hina-mincho.stpack` | Hina Mincho 400 | OFL-1.1 |
| `font-packs/sawarabi-mincho.stpack` | Sawarabi Mincho 400 | OFL-1.1 |
| `font-packs/shippori-antique.stpack` | Shippori Antique 400 | OFL-1.1 |
| `font-packs/zen-antique.stpack` | Zen Antique 400 | OFL-1.1 |
| `font-packs/new-tegomin.stpack` | New Tegomin 400 | OFL-1.1 |

**角ゴ・丸ゴ。** 本文向けと、やわらかい見出し。

| パック | 書体 | ライセンス |
| --- | --- | --- |
| `font-packs/zen-kaku.stpack` | Zen Kaku Gothic New 400／700 | OFL-1.1 |
| `font-packs/maru-go.stpack` | Zen Maru Gothic 400／700 | OFL-1.1 |
| `font-packs/m-plus-rounded.stpack` | M PLUS Rounded 1c 400／700 | OFL-1.1 |
| `font-packs/kosugi-maru.stpack` | Kosugi Maru 400 | **Apache-2.0** |
| `font-packs/stick.stpack` | Stick 400 | OFL-1.1 |

**手書き・筆。**

| パック | 書体 | ライセンス |
| --- | --- | --- |
| `font-packs/klee-one.stpack` | Klee One 400／600 | OFL-1.1 |
| `font-packs/yomogi.stpack` | Yomogi 400 | OFL-1.1 |
| `font-packs/zen-kurenaido.stpack` | Zen Kurenaido 400 | OFL-1.1 |
| `font-packs/hachi-maru-pop.stpack` | Hachi Maru Pop 400 | OFL-1.1 |
| `font-packs/yuji-syuku.stpack` | Yuji Syuku 400 | OFL-1.1 |
| `font-packs/yusei-magic.stpack` | Yusei Magic 400 | OFL-1.1 |

**ポップ・題字。**

| パック | 書体 | ライセンス |
| --- | --- | --- |
| `font-packs/dela-gothic.stpack` | Dela Gothic One 400 | OFL-1.1 |
| `font-packs/potta-one.stpack` | Potta One 400 | OFL-1.1 |
| `font-packs/mochiy-pop.stpack` | Mochiy Pop One 400 | OFL-1.1 |
| `font-packs/rocknroll-one.stpack` | RocknRoll One 400 | OFL-1.1 |
| `font-packs/rampart-one.stpack` | Rampart One 400 | OFL-1.1 |
| `font-packs/train-one.stpack` | Train One 400 | OFL-1.1 |
| `font-packs/dotgothic.stpack` | DotGothic16 400 | OFL-1.1 |

ほかに `gallery/` 4 枚・`catalog/index.json`（このセットの 30 パック＝見本 1＋書体 29）・`catalog/typography-preview.json`（組み合わせ 14 組の束）・`docs/2026-11-01-組み合わせ縮刷版.png`（1 枚の縮刷版）・`packs/sample-mincho.stpack`（見本）・`set.json`・`README-はじめに.txt` が入っています。

ライセンス：パックの作りは GPL-3.0-or-later、書体は OFL-1.1（Kosugi Maru だけ Apache-2.0）。全文は各パックの `fonts/OFL.txt`／`fonts/LICENSE.txt` に同梱しています。

## 前の版との違い（r9 → r10）

**中身の書体は 1 バイトも変わっていません。** 変わったのは、パックの中の**表示用リンク**（`pack.json` の `url`）と**版**だけです。

- **旧 org の URL を新しい org に**そろえました（`TonbokiriRaikiriMuramasa-Taikoubou` → `Trk-Nexus`）。旧 URL は転送が切れていて、押すと**空のリポジトリ**に着いていたためです
- パックの `release` を **1.0.0 → 1.0.1**（`maru-go` だけ 1.1.0 → 1.1.1）に。**r9 を入れている人には 29 本とも「更新あり」が出ます**（入れ直しても、同じ名前・同じ作者なので**棚に重複はできません**）
- 29 本が 25 B ずつ小さくなりました（URL が短くなったぶん・合計 725 B）。**書体（woff2）・ライセンス全文・スキンは同じ**です
- 見本パック（`packs/sample-mincho.stpack`）は**変えていない**ので、r9 から選び直しても「飛ばす」になります
- **r9 のままで困ることはありません**（表示用のリンクだけの違い）。配り直すときは r10 を使ってください
- 大きさ：64,197,328 B（r9 は 64,198,800 B・**1,472 B 小さい**）

## 前の版との違い（r8 → r9）

レビュー（`trk-Nexus-review-2026-11-02`）の指摘を受けて、**見本と縮刷版を作り直しました**。書体パック 30 本は r8 から 1 バイトも変わっていません（sha256 も同じ）。

- 組み合わせの一覧に **`trkUse`**（trk! ではどんな曲・どのスキンに合うか）を出しました
- 縮刷版に **6 役ぶんの書体名**（題字・見出し・本文・数字・差し色・注記）を出しました
- 「雑誌の飾り」の見出しを説明どおりのひな明朝に・「電子ゲーム」の注記を角ゴに・「古道具」「静か」の説明を「アンティーク体」に
- 大きさの表記を **MB** に統一（64.06 → 64.20 MB）

## 前の版との違い（r7 → r8）

- 本文の見本文を文の終わりまで書き、縮刷版の折り返しを直しました
- パック 30 本は 1 バイトも変わっていません

## 前の版との違い（r6 → r7）

- 組み合わせの束（`catalog/typography-preview.json`）と縮刷版（`docs/2026-11-01-組み合わせ縮刷版.png`）を足しました
- `gallery/pairings.html` の見本の文から □ をなくしました（書体が持っている字だけに）
- パック 30 本は r6 から 1 バイトも変わっていません（sha256 も同じ）

## 前の版との違い（r5 → r6）

- 書体パック 15 → **29 本**（42 ウェイト・約 60.2 MB）。新しい 14 書体は §「中身」のとおり
- 見本 3 枚 → **4 枚**（`gallery/pairings.html` を追加）
- 目録はこのセットに入っている **30 パック**（見本 1＋書体 29）
- `check-set-app --both` で、はじめてセットとの**両方の順**を確認済み（書体→はじめて＝入る 0／飛ばす 6、はじめて→書体＝入る 24／飛ばす 6）
