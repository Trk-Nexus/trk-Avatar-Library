#!/usr/bin/env node
// SPDX-License-Identifier: GPL-3.0-or-later
/* 🔗 配るものに、旧 org の URL が残っていないかを見る（2026-11-02・r10）

   なぜ要るか：
     `Trk-Nexus` へ引っ越したあと、パックの中の `pack.json` の `url` と、セットの
     `README-はじめに.txt` に出どころ（旧 org）が残っていました。URL は**表示用**なので
     アプリの動作には効きませんが、押すと空のリポジトリに着きます（旧 URL の転送は切れています）。
     r10 で一斉に直したので、**戻らないように**機械で見ます。

   見ること：
     ・追跡しているファイルのどれにも、旧 org（`TonbokiriRaikiriMuramasa-Taikoubou`）が無い
       （例外は下の ALLOW。引っ越しの記録として、実測と一緒に残している文書だけ）
     ・`font-packs/<名前>/pack.json` と、`font-packs/<名前>.stpack` の中の `pack.json` の `url` が
       新しい org（`https://github.com/Trk-Nexus/...`）を指している
     ・`catalog/index.json` の `packs[].url` も同じ

   使い方：
     node tools/check-urls.mjs                     … 見るだけ（合格 0／不合格 1／使い方 2）
     node tools/check-urls.mjs --json              … 機械が読む形
     node tools/check-urls.mjs --trk=/path/to/trk-PWA   … .stpack の中を読むのに使う

   .stpack の中の pack.json は、trk-PWA の zip-io で読みます（アプリと同じ道具）。
   読めない版のときは、バイト列の検索だけにします（警告を出します）。
*/
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { openZip, readJsonEntry } from "./lib/zip.mjs";

const HERE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
/* 見るのは「リンクとしての旧 URL」。org の名前だけを歴史として書くのは構わない */
/* この道具自身は、下の OLD を持つので対象から外します（SELF） */
const SELF = "tools/check-urls.mjs";
const OLD = "https://github.com/TonbokiriRaikiriMuramasa-Taikoubou";
const NEW_PREFIX = "https://github.com/Trk-Nexus/";

/* 例外：引っ越しの記録として、旧 URL と実測をわざと残している文書（履歴なので消さない） */
const ALLOW = [
  "HANDOFF.md",
  "docs/2026-11-02-組織の引っ越し.md",
  "docs/2026-11-02-レビューへの返事.md",
];

const errors = [], warnings = [];
const err = m => errors.push(m);

function tracked() {
  try {
    const out = execFileSync("git", ["ls-files", "-z"], { cwd: HERE, encoding: "utf8" });
    return out.split("\0").filter(Boolean);
  } catch (_) {
    return [];   /* git が無い所（ZIP を展開しただけ）では、下の決まったファイルだけ見る */
  }
}

/* --- 1. 追跡ファイルに旧 org が残っていないか --- */
const allow = new Set(ALLOW);
const files = tracked();
let scanned = 0;
for (const rel of files) {
  if (allow.has(rel) || rel === SELF) continue;   /* SELF は下の OLD を自分で持っている */
  if (rel.endsWith(".stpack") || rel.endsWith(".png") || rel.endsWith(".woff2") || rel.endsWith(".zip")) continue;
  const abs = path.join(HERE, rel);
  let text = "";
  try { text = fs.readFileSync(abs, "utf8"); } catch (_) { continue; }
  scanned++;
  if (text.includes(OLD)) {
    const n = text.split(OLD).length - 1;
    err(`${rel}: 旧 org の URL が ${n} か所残っています（${NEW_PREFIX}… に直してください）`);
  }
}

/* --- 2. パックの url（フォルダと、.stpack の中） --- */
const packDirs = fs.existsSync(path.join(HERE, "font-packs"))
  ? fs.readdirSync(path.join(HERE, "font-packs")).filter(n => fs.statSync(path.join(HERE, "font-packs", n)).isDirectory())
  : [];
let urls = 0;
for (const d of packDirs) {
  const pj = path.join(HERE, "font-packs", d, "pack.json");
  if (!fs.existsSync(pj)) continue;
  const man = JSON.parse(fs.readFileSync(pj, "utf8"));
  if (man.url) {
    urls++;
    if (!String(man.url).startsWith(NEW_PREFIX)) err(`font-packs/${d}/pack.json: url が新 org ではありません（${man.url}）`);
  }
}

/* --- 3. .stpack の中（バイト列＋読めるなら pack.json） --- */
async function checkStpacks() {
  const dir = path.join(HERE, "font-packs");
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir).filter(n => n.endsWith(".stpack"));
  let read = 0, unreadable = 0;
  for (const f of files) {
    const buf = fs.readFileSync(path.join(dir, f));
    if (buf.includes(OLD)) err(`font-packs/${f}: バイト列に旧 org が残っています（作り直してください）`);
    let zip = null;
    try {
      zip = await openZip(buf);
    } catch (e) {
      unreadable++;
      warnings.push(`font-packs/${f}: ZIP を読めませんでした（${e.message}）。バイト列の検索だけ見ました`);
      continue;
    }
    const man = await readJsonEntry(zip, "pack.json");
    if (man && man.url) {
      read++;
      if (!String(man.url).startsWith(NEW_PREFIX)) err(`font-packs/${f}: 中の pack.json の url が新 org ではありません（${man.url}）`);
    }
  }
  if (unreadable) warnings.push(`.stpack のうち ${unreadable} 本は中を読めませんでした（trk-PWA の版を確かめてください）`);
  return { files: files.length, read };
}

/* --- 4. 目録 --- */
const catPath = path.join(HERE, "catalog/index.json");
let catPacks = 0;
if (fs.existsSync(catPath)) {
  const cat = JSON.parse(fs.readFileSync(catPath, "utf8"));
  for (const p of cat.packs || []) {
    catPacks++;
    if (p.url && !String(p.url).startsWith(NEW_PREFIX)) err(`catalog/index.json: ${p.id} の url が新 org ではありません（${p.url}）`);
  }
}

const st = await checkStpacks();
const summary = {
  tool: "check-urls", version: 1,
  oldOrg: OLD, newPrefix: NEW_PREFIX,
  scanned, allow: ALLOW,
  packs: packDirs.length, packUrls: urls, stpacks: st ? st.files : 0, stpackManifests: st ? st.read : 0,
  catalogPacks: catPacks,
  errors, warnings,
};

const json = process.argv.includes("--json");
if (json) {
  console.log(JSON.stringify(summary, null, 2));
} else {
  for (const w of warnings) console.log(`   ⚠ ${w}`);
  for (const e of errors) console.log(`   ❌ ${e}`);
}

if (errors.length) {
  if (!json) console.log(`\n❌ 旧 org の URL が残っています（${errors.length} 件）`);
  process.exit(1);
}
if (!json) {
  console.log(`✅ 配るものは、すべて新 org（${NEW_PREFIX}…）を指しています`);
  console.log(`   追跡ファイル ${scanned} 本・パック ${packDirs.length} 本（url ${urls}）・.stpack ${st ? st.files : 0} 本（中の pack.json ${st ? st.read : 0}）・目録 ${catPacks} パック`);
  console.log(`   旧 org を残してよい文書：${ALLOW.join("／")}`);
}
