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
     ・配ったセットの記録（release/*.json。r6 からは はじめて／書体 の 2 つ）と実物の sha256 が一致する
       （目録をセットの範囲に絞っているときは、記録の source と倉庫のファイルを比べる）
     ・見出しへのリンク（`#2-2-…`）が、その文書の見出しに実在する

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

/* ---------- 3. 内部リンク（パスと見出し） ---------- */

/* GitHub の見出しアンカーの作り方（2026-11-01 に、GitHub が実際に付けた 20 個の id と一致することを確認）：
     小文字にする → 約物（記号・句読点・①②・・など）を消す → 空白を1つずつ「-」にする
   空白をまとめないので「2-2. ② 目録」は「2-2--目録」ではなく「2-2-目録」…（② を消した跡に空白が2つ残ると「--」） */
const PUNCT = /[\u2000-\u206F\u2460-\u24FF\u2E00-\u2E7F\u30FB\uFF01-\uFF0F\uFF1A-\uFF20\uFF3B-\uFF40\uFF5B-\uFF65!'"#$%&()*+,./:;<=>?@\[\\\]^`{|}~\u3000-\u303F]/g;
const slug = h => h.trim().toLowerCase().replace(PUNCT, "").replace(/\s/g, "-");
function anchorsOf(text) {
  const seen = new Map();
  const out = new Set();
  for (const m of text.matchAll(/^#{1,6}\s+(.+)$/gm)) {
    const base = slug(m[1].replace(/`|\*\*|\[([^\]]*)\]\([^)]*\)/g, "$1"));
    const n = seen.get(base) || 0;
    seen.set(base, n + 1);
    out.add(n ? `${base}-${n}` : base);
  }
  return out;
}

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
    if (/^(https?:|mailto:)/i.test(href)) continue;
    linkCount++;
    const [rawPath, rawFrag] = href.split("#");
    if (rawFrag) {
      const frag = decodeURIComponent(rawFrag);
      if (!anchorsOf(text).has(frag)) fail(`${f}: 見出しリンクが実在しません → ${href}`);
    }
    const target = decodeURIComponent(rawPath);
    if (!target) continue;      /* 同じ文書の中の見出し（#…）だけのリンク */
    const abs = path.resolve(path.dirname(path.join(HERE, f)), target);
    if (!fs.existsSync(abs)) fail(`${f}: リンク先がありません → ${href}`);
  }
}

/* ---------- 4. セット（r6 から 2 つ：はじめて・書体） ---------- */
/* sets/*.json のうち、記録（release/<name>.json）があるものを検査する。
   記録がまだ無い定義は「これから配るもの」なので飛ばす（CI と同じ扱い）。
   目録をセットに入っているパックだけに絞っているとき（scoped）は、記録の source と倉庫のファイルを比べる */
const setsDir = path.join(HERE, "sets");
const setDefs = fs.existsSync(setsDir) ? fs.readdirSync(setsDir).filter(f => f.endsWith(".json")).sort() : [];
let setChecked = 0, setDrafts = 0;
for (const defName of setDefs) {
  const cfg = JSON.parse(read(path.join(setsDir, defName)));
  const recordPath = path.join(HERE, cfg.record || `release/${cfg.name}.json`);
  if (!fs.existsSync(recordPath)) { setDrafts++; continue; }
  setChecked++;
  const rec = JSON.parse(read(recordPath));
  const recRel = rel(recordPath);
  if (!/^trk-(first-set|font-set)-\d{4}-\d{2}-\d{2}(-r\d+)?\.zip$/.test(String(rec.file || ""))) {
    fail(`${recRel} の file の形が違います（"${rec.file}"）`);
  }
  if (!/^[0-9a-f]{64}$/.test(String(rec.sha256 || ""))) fail(`${recRel} の sha256 の形が違います`);
  /* CI（release-set.yml）が Release を作るときに使う説明書き */
  const notesPath = path.join(HERE, "release", `${rec.name || cfg.name}-notes.md`);
  if (!fs.existsSync(notesPath)) fail(`release/${rec.name || cfg.name}-notes.md がありません（Release の説明書き。CI が使います）`);
  if (rec.tag && !readme.includes(`releases/tag/${rec.tag}`)) {
    fail(`README にセット（${cfg.name}）のリリース ${rec.tag} へのリンクがありません`);
  }
  for (const f of rec.files || []) {
    const abs = path.join(HERE, f.path);
    if (!fs.existsSync(abs)) { fail(`${recRel} に入れた ${f.path} がありません`); continue; }
    /* 目録は「セットに入っているパックだけ」に絞って入れることがある（build-set の scopeCatalog）。
       そのときは、絞る前の倉庫のファイル（source）と比べる */
    const want = f.scoped && f.source ? f.source.sha256 : f.sha256;
    if (sha256(fs.readFileSync(abs)) !== want) fail(`${recRel} の記録と ${f.path} の sha256 が違います（作り直してください）`);
  }
}
if (!setChecked) fail("配ったセットの記録（release/*.json）がありません（node tools/build-set.mjs sets/first-set.json --release で作れます）");

if (fails.length) {
  console.error(`❌ 文書が今の中身と合っていません（${fails.length} 件）`);
  for (const f of fails) console.error(`   ❌ ${f}`);
  process.exit(1);
}
console.log(`✅ 文書は今の中身と合っています（パック ${catalog.packs.length} 件・内部リンク ${linkCount} 本・セット ${setChecked} 件${setDrafts ? `・これから配る定義 ${setDrafts} 件` : ""}）`);
for (const p of catalog.packs) console.log(`   ${p.file} — ${formatBytes(p.bytes)}`);
