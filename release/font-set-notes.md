# trk! 書体セット（全部・r6）

**書体パックを、全部まとめて。** 見本 4 枚・目録・書体パック **29 本（42 ウェイト）**を 1 ファイルにした **約 60.6 MiB** のセットです。
**`.zip` と `.stlib` は中身が同じ**（同じバイト列・同じ sha256）です。**trk235（2026-11-01）以降は `.stlib` をそのまま選ぶだけ**で入ります。

> r6 から、セットは **2 つ**に分かれました。
> - **はじめてセット**（軽い・約 7.5 MB）… まず試す人向け。見本＋目録＋書体 5 本
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

ほかに `gallery/` 4 枚・`catalog/index.json`（このセットの 30 パック＝見本 1＋書体 29）・`packs/sample-mincho.stpack`（見本）・`set.json`・`README-はじめに.txt` が入っています。

ライセンス：パックの作りは GPL-3.0-or-later、書体は OFL-1.1（Kosugi Maru だけ Apache-2.0）。全文は各パックの `fonts/OFL.txt`／`fonts/LICENSE.txt` に同梱しています。

## 前の版との違い（r5 → r6）

- 書体パック 15 → **29 本**（42 ウェイト・約 60.2 MB）。新しい 14 書体は §「中身」のとおり
- 見本 3 枚 → **4 枚**（`gallery/pairings.html` を追加）
- 目録はこのセットに入っている **30 パック**（見本 1＋書体 29）
- `check-set-app --both` で、はじめてセットとの**両方の順**を確認済み（書体→はじめて＝入る 0／飛ばす 6、はじめて→書体＝入る 24／飛ばす 6）
