#!/usr/bin/env node
// SPDX-License-Identifier: GPL-3.0-or-later
/* 🔗 配る文書（README・HANDOFF・docs）が、いまの中身と合っているかを見る（2026-11-01）

   なぜ要るか：
     目録（catalog/index.json）と README の「どのパックを落とすか」の表は、
     パックを足すたびに両方を直す必要があります。片方だけ直すと、
     利用者には**古い大きさ・古い一覧**が見えたままになります。
     ここで、表と目録のずれ・リンク切れ・「はじめての3手順」の抜けを検査します。

   見ること：
     ・README の表（<!-- packs-table:start --> 〜 <!-- packs-table:end -->）が、目録の全パックを持つ
       （ファイル名と大きさが一致。目録にない行が残っていたら不合格）
     ・README の先頭に「はじめての3手順」（①②③）がある
     ・README・HANDOFF・各 README・docs の**内部リンク**が実在する
     ・「はじめてセット」の記録（release/first-set.json）と実物の sha256 が一致する

   使い方：
     node tools/check-docs.mjs
     node tools/check-docs.mjs --trk=/path/to/trk-PWA   （いまは使いません・将来のため）

   終了コード：0＝合っている、1＝ずれている
*/
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const HERE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const fails = [];
const fail = m => fails.push(m);
const sha256 = buf => crypto.createHash("sha256").update(buf).digest("hex");
const rel = p => path.relative(HERE, p).split(path.sep).join("/");

/* 目録と同じ見せ方（README の表と突き合わせる） */
const formatBytes = n => {
  const v = Number(n) || 0;
  if (v < 1024) return `${v} B`;
  if (v < 1048576) return `${(v / 1024).toFixed(1)} KB`;
  return `${(v / 1048576).toFixed(1)} MB`;
};
const read = p => fs.readFileSync(p, "utf8");

/* ---------- 1. 目録と README の表 ---------- */
const catalogPath = path.join(HERE, "catalog/index.json");
if (!fs.existsSync(catalogPath)) fail("catalog/index.json がありません");
const catalog = fs.existsSync(catalogPath) ? JSON.parse(read(catalogPath)) : { packs: [] };

const readmePath = path.join(HERE, "README.md");
const readme = read(readmePath);
const START = "<!-- packs-table:start -->", END = "<!-- packs-table:end -->";
const s = readme.indexOf(START), e = readme.indexOf(END);
if (s < 0 || e < 0 || e < s) {
  fail(`README.md に表の目印（${START} 〜 ${END}）がありません`);
} else {
  const table = readme.slice(s + START.length, e);
  const rows = table.split("\n").filter(l => l.trim().startsWith("|"));
  for (const p of catalog.packs) {
    const row = rows.find(l => l.includes(`\`${p.file}\``));
    if (!row) { fail(`README の表に ${p.file} の行がありません（パックを足したら表も足してください）`); continue; }
    const size = formatBytes(p.bytes);
    if (!row.includes(size)) fail(`README の表の ${p.file} の大きさが「${size}」ではありません（目録は ${p.bytes.toLocaleString()} B）`);
    const license = String(p.license || "");
    if (license && !row.includes(license.split("（")[0])) fail(`README の表の ${p.file} にライセンス（${license}）が出ていません`);
  }
  /* 目録にない .stpack の行が残っていないか（パックを消したときの消し忘れ） */
  for (const row of rows) {
    const m = row.match(/`((?:packs|font-packs)\/[^`]+\.stpack)`/);
    if (m && !catalog.packs.some(p => p.file === m[1])) fail(`README の表に、目録にない ${m[1]} の行が残っています`);
  }
}

/* ---------- 2. はじめての3手順 ---------- */
if (!readme.includes("## はじめての3手順")) fail("README.md の先頭に「## はじめての3手順」がありません");
for (const mark of ["①", "②", "③"]) {
  if (!readme.includes(mark)) fail(`README.md の「はじめての3手順」に ${mark} がありません`);
}
const head = readme.slice(0, readme.indexOf("## 1."));
if (!head.includes("📥 まとめて入れる")) fail("「はじめての3手順」に「📥 まとめて入れる」への案内がありません");

/* ---------- 3. 内部リンク ---------- */
const DOCS = fs.existsSync(path.join(HERE, "docs"))
  ? fs.readdirSync(path.join(HERE, "docs")).filter(n => /\.(md|txt)$/i.test(n)).map(n => path.join("docs", n)) : [];
const files = ["README.md", "HANDOFF.md", "NOTICE.md", "packs/README.md", "font-packs/README.md", ...DOCS]
  .filter(f => fs.existsSync(path.join(HERE, f)));
const LINK = /\[[^\]]*\]\(([^)\s]+)\)/g;
let linkCount = 0;
for (const f of files) {
  const text = read(path.join(HERE, f));
  for (const m of text.matchAll(LINK)) {
    const href = m[1];
    if (/^(https?:|mailto:|#)/i.test(href)) continue;
    linkCount++;
    const target = decodeURIComponent(href.split("#")[0]);
    if (!target) continue;
    const abs = path.resolve(path.dirname(path.join(HERE, f)), target);
    if (!fs.existsSync(abs)) fail(`${f}: リンク先がありません → ${href}`);
  }
}

/* ---------- 4. はじめてセット ---------- */
const recordPath = path.join(HERE, "release/first-set.json");
if (!fs.existsSync(recordPath)) {
  fail("release/first-set.json がありません（node tools/build-set.mjs sets/first-set.json --release で作れます）");
} else {
  const rec = JSON.parse(read(recordPath));
  if (!/^trk-first-set-\d{4}-\d{2}-\d{2}\.zip$/.test(String(rec.file || ""))) fail(`release/first-set.json の file の形が違います（"${rec.file}"）`);
  if (!/^[0-9a-f]{64}$/.test(String(rec.sha256 || ""))) fail("release/first-set.json の sha256 の形が違います");
  if (!readme.includes(`releases/tag/${rec.tag || "first-set-" + String(rec.date || "")}`)) {
    fail(`README に はじめてセット のリリース（${rec.tag || rec.date}）へのリンクがありません`);
  }
  for (const f of rec.files || []) {
    const abs = path.join(HERE, f.path);
    if (!fs.existsSync(abs)) { fail(`はじめてセットに入れた ${f.path} がありません`); continue; }
    const buf = fs.readFileSync(abs);
    if (sha256(buf) !== f.sha256) fail(`はじめてセットの記録と ${f.path} の sha256 が違います（作り直してください）`);
  }
}

if (fails.length) {
  console.error(`❌ 文書が今の中身と合っていません（${fails.length} 件）`);
  for (const f of fails) console.error(`   ❌ ${f}`);
  process.exit(1);
}
console.log(`✅ 文書は今の中身と合っています（パック ${catalog.packs.length} 件・内部リンク ${linkCount} 本）`);
for (const p of catalog.packs) console.log(`   ${p.file} — ${formatBytes(p.bytes)}`);
