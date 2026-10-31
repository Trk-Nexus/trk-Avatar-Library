#!/usr/bin/env node
// SPDX-License-Identifier: GPL-3.0-or-later
/* 🎁 はじめてセット（見本＋目録＋パック）を1つの ZIP にまとめる（2026-11-01）

   なぜ要るか：
     いまは「見本」「目録」「.stpack」を別々に落とすので、目録だけ落としてパックを忘れる・
     パックだけ落として目録を忘れる、が起きやすい（trk-PWA の開発案 F1）。
     アプリ（trk231 以降）は「📥 まとめて入れる」で複数ファイルを一度に選べるので、
     展開した中身をまとめて選べば、落とすのも入れるのも 1 回で済みます。

   作るもの（中身）：
     README-はじめに.txt    … 3手順・入っているもの・sha256（この道具が作る）
     gallery/all-skins.html … 全スキン見本
     catalog/index.json     … 目録
     font-packs/*.stpack    … パック（セットの中身は sets/*.json で決める）

   決定的：同じ中身なら同じ sha256（無圧縮で固定・README-はじめに.txt に時刻を入れない）。
   記録：--release で release/first-set.json（配ったものの sha256）を書く。--check はそれと比べる。

   使い方：
     node tools/build-set.mjs sets/first-set.json                  … dist/trk-first-set-YYYY-MM-DD.zip を作る
     node tools/build-set.mjs sets/first-set.json --release        … 作って、記録も書く
     node tools/build-set.mjs sets/first-set.json --check          … 記録と実物が合っているかだけ見る（CI 向け）
     node tools/build-set.mjs sets/first-set.json --out=/tmp --json
*/
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { loadZipIO } from "./lib/zip.mjs";

const HERE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sha256 = buf => crypto.createHash("sha256").update(buf).digest("hex");
const rel = p => path.relative(HERE, p).split(path.sep).join("/");
const fmt = n => n < 1024 ? `${n} B` : n < 1048576 ? `${(n / 1024).toFixed(1)} KB` : `${(n / 1048576).toFixed(1)} MB`;

function usage() {
  console.log(`使い方: node tools/build-set.mjs <sets/*.json> [--release] [--check] [--out=dist] [--json] [--trk=/path/to/trk-PWA]`);
}

/* セットの中の「はじめに」を組み立てる（時刻を入れない＝決定的） */
function guideText(cfg, entries, records) {
  const packNames = records.filter(r => /\.stpack$/.test(r.path)).map(r => path.basename(r.path));
  return [
    `${cfg.title || "trk! はじめてセット"}（${cfg.date}）`,
    "=".repeat(60),
    "",
    "trk!（trk-PWA）の見た目を、まとめて持ち込むためのセットです。",
    "",
    "■ はじめの3手順",
    "",
    "  ① 見本を見る",
    `     gallery/all-skins.html をダブルクリック（ブラウザで開くだけ。オフラインOK）`,
    "",
    "  ② 展開する",
    `     このZIPを展開すると、この説明のほかに ${entries.length} 個（フォルダごと）が出てきます。`,
    ...entries.map(n => `       ${n}`),
    "     そのうちアプリに入れるのは catalog/index.json と .stpack です",
    "     （gallery/all-skins.html は、ブラウザで見る見本です）",
    "",
    "  ③ trk! に入れる（trk231 以降）",
    "     trk! を開いて 設定 → 📦 カスタムパック → 📚 目録から入れる → 📥 まとめて入れる",
    "     展開した中の catalog/index.json と、font-packs/ の .stpack を「まとめて選ぶ」",
    "     （大きさと sha256 が目録と合わないものは入りません。入れたものは一覧の行の「使う」で適用）",
    "",
    "  trk230 の場合は「📚 目録（index.json）を選ぶ」→ 一覧の行ごとに「この .stpack を選ぶ」で入ります。",
    "",
    "■ 入っているもの",
    "",
    ...records.map(r => `  ${r.path}  ${fmt(r.bytes)}  sha256 ${r.sha256}`),
    "",
    "■ 書体について",
    "",
    "  font-packs/ の書体パックは Zen Maru Gothic（OFL-1.1）を同梱しています。",
    "  ライセンス全文はパックの中の fonts/OFL.txt にあります。",
    "  書体が画面に効くのは trk! trk232 以降です（それまでは色とノーツの色だけが変わります）。",
    "",
    "■ 権利",
    "",
    "  このセットの作り（目録・見本・説明）: GPL-3.0-or-later",
    "  パックごとの権利は packs の pack.json の license、同梱した書体は上記のライセンスに従います。",
    "",
    "■ 出どころ",
    "",
    "  https://github.com/TonbokiriRaikiriMuramasa-Taikoubou/trk-Avatar-Library",
    `  セットの名前: ${cfg.name}（アプリに入れるのは ${packNames.length} パック）`,
    "",
  ].join("\n");
}

async function buildSet(cfgPath, opts) {
  const cfg = JSON.parse(fs.readFileSync(cfgPath, "utf8"));
  const files = Array.isArray(cfg.files) ? cfg.files.map(f => String(f)) : [];
  if (!files.length) throw new Error(`${cfgPath}: files が空です`);
  for (const f of files) {
    if (f.includes("..") || f.startsWith("/")) throw new Error(`セットに入れるパスが不正です: ${f}`);
    if (!fs.existsSync(path.join(HERE, f))) throw new Error(`セットに入れるファイルがありません: ${f}`);
  }
  /* 目録は必ず入れる（入れ忘れたセットは作らない） */
  if (!files.includes("catalog/index.json")) throw new Error("catalog/index.json がセットに入っていません");
  const packs = files.filter(f => f.endsWith(".stpack"));
  if (!packs.length) throw new Error("パック（.stpack）が1つも入っていません");

  const records = files
    .map(f => ({ path: f, bytes: fs.statSync(path.join(HERE, f)).size }))
    .map(r => ({ ...r, sha256: sha256(fs.readFileSync(path.join(HERE, r.path))) }));

  const guide = guideText(cfg, files, records);
  const entries = [
    { name: cfg.readme || "README-はじめに.txt", buf: Buffer.from(guide, "utf8") },
    ...files.map(f => ({ name: f, buf: fs.readFileSync(path.join(HERE, f)) })),
  ];
  const zipIO = loadZipIO(opts.trk);
  const blob = await zipIO.zipWrite(entries.map(e => ({ name: e.name, blob: new Blob([e.buf]) })));
  const bytes = Buffer.from(await blob.arrayBuffer());

  const ext = String(cfg.extension || "zip");
  const file = `trk-${cfg.name}-${cfg.date}.${ext}`;
  const out = path.join(path.resolve(opts.out || path.join(HERE, "dist")), file);
  const record = {
    name: cfg.name,
    title: cfg.title || "",
    date: cfg.date,
    tag: cfg.tag || `first-set-${cfg.date}`,
    file,
    bytes: bytes.length,
    sha256: sha256(bytes),
    files: records,
    note: cfg.note || "",
  };
  return { out, bytes, record, records, cfg };
}

async function main() {
  const argv = process.argv.slice(2);
  const opts = { release: false, check: false, json: false, out: "", trk: undefined };
  const rest = [];
  for (const a of argv) {
    if (a === "--release") opts.release = true;
    else if (a === "--check") opts.check = true;
    else if (a === "--json") opts.json = true;
    else if (a.startsWith("--out=")) opts.out = a.slice(6);
    else if (a.startsWith("--trk=")) opts.trk = a.slice(6);
    else if (a === "-h" || a === "--help") { usage(); process.exit(0); }
    else if (a.startsWith("--")) { console.error(`使い方にないオプションです: ${a}`); usage(); process.exit(2); }
    else rest.push(a);
  }
  if (!rest.length) { usage(); process.exit(2); }
  const cfgPath = path.resolve(rest[0]);
  if (!fs.existsSync(cfgPath)) { console.error(`セットの定義がありません: ${cfgPath}`); process.exit(2); }

  const built = await buildSet(cfgPath, opts);
  const recordPath = path.join(HERE, built.cfg.record || `release/${built.cfg.name}.json`);

  if (opts.check) {
    if (!fs.existsSync(recordPath)) {
      console.error(`❌ 記録がありません: ${rel(recordPath)}（--release で作れます）`);
      process.exit(1);
    }
    const rec = JSON.parse(fs.readFileSync(recordPath, "utf8"));
    const same = rec.sha256 === built.record.sha256 && rec.bytes === built.record.bytes
      && JSON.stringify(rec.files) === JSON.stringify(built.record.files);
    if (opts.json) console.log(JSON.stringify({ ok: same, record: rec, built: built.record }, null, 2));
    else if (same) console.log(`✅ ${built.record.file} は記録と合っています（${built.record.bytes.toLocaleString()} B・sha256 ${built.record.sha256.slice(0, 12)}…）`);
    else console.log(`❌ ${built.record.file} が記録と合っていません。node tools/build-set.mjs ${rel(cfgPath)} --release で作り直してください`);
    process.exit(same ? 0 : 1);
  }

  fs.mkdirSync(path.dirname(built.out), { recursive: true });
  fs.writeFileSync(built.out, built.bytes);
  if (opts.release) {
    fs.mkdirSync(path.dirname(recordPath), { recursive: true });
    fs.writeFileSync(recordPath, JSON.stringify(built.record, null, 2) + "\n", "utf8");
  }
  if (opts.json) { console.log(JSON.stringify({ ...built.record, out: rel(built.out) }, null, 2)); process.exit(0); }
  console.log(`✅ ${rel(built.out)}（${built.record.bytes.toLocaleString()} B・${built.record.files.length + 1} ファイル・sha256 ${built.record.sha256}）`);
  for (const r of built.records) console.log(`   + ${r.path}  ${fmt(r.bytes)}`);
  if (opts.release) console.log(`   記録: ${rel(recordPath)}`);
  else console.log("   （配るなら --release を付けて、記録も書いてください）");
}

main().catch(err => {
  console.error(`❌ ${err && err.message ? err.message : err}`);
  process.exit(1);
});
