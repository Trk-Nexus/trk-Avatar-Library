#!/usr/bin/env node
// SPDX-License-Identifier: GPL-3.0-or-later
/* 📚 目録（catalog/index.json）を作る（2026-10-31）

   packs/ と font-packs/ の .stpack を全部検査し、sha256・バイト数・中身の要約を1つの JSON にまとめます。
   **何を配るかの一覧**（人が読む）と、**道具が読む目録**（アプリ・ミラー・監査）を同じ1ファイルで兼ねます。

   使い方：
     node tools/build-catalog.mjs                    … 目録を作り直す
     node tools/build-catalog.mjs --check            … 作らずに、目録が今の中身と合っているかだけ見る（CI 用）
     node tools/build-catalog.mjs --trk=/path/to/trk-PWA

   目録の形（version 1・trk-PWA の docs/LIBRARY-TRK230 §3 が正本）：
     { format:"trk-avatar-library", version:1, name, updatedAt, packs:[
         { id, name, author, version, file, sha256, bytes, fonts:[{family,file,license,weight,licenseFile}], license, description, url } ] }
     ・version は pack.json の release（省略時 1.0.0）／url は https のときだけ載せる
     ・fonts[].licenseFile は任意（L7・trk232 からのお願い）。アプリは trk233 以降で全文の表示に使う
     ・形が合っているかは tools/check-contract.mjs（アプリ自身の sanitizeCatalog）で確かめる
*/
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { verifyPack } from "./verify-pack.mjs";

const HERE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const argv = process.argv.slice(2);
const checkOnly = argv.includes("--check");
const trk = (argv.find(a => a.startsWith("--trk=")) || "").slice(6) || undefined;
const DIRS = ["packs", "font-packs"];
const OUT = path.join(HERE, "catalog/index.json");

const sha256 = buf => crypto.createHash("sha256").update(buf).digest("hex");
const listPacks = () => DIRS.flatMap(dir => {
  const abs = path.join(HERE, dir);
  if (!fs.existsSync(abs)) return [];
  return fs.readdirSync(abs).filter(n => n.toLowerCase().endsWith(".stpack")).sort()
    .map(n => ({ dir, file: path.posix.join(dir, n), abs: path.join(abs, n) }));
});

const packs = [];
const problems = [];
for (const p of listPacks()) {
  const buf = fs.readFileSync(p.abs);
  const r = await verifyPack(p.abs, { trk });
  if (!r.ok) problems.push({ file: p.file, errors: r.errors });
  const slug = (r.info.name || path.basename(p.file, ".stpack")).toLowerCase()
    .replace(/[^a-z0-9\u3040-\u30ff\u4e00-\u9fff]+/gi, "-").replace(/^-|-$/g, "").slice(0, 40) || "pack";
  packs.push({
    id: `${slug}-${sha256(buf).slice(0, 8)}`,
    name: r.info.name || path.basename(p.file, ".stpack"),
    author: r.info.author || "",
    /* アプリが読む項目（docs/LIBRARY-TRK230 §3）。version は pack.json の release、url は https のときだけ */
    version: r.info.release || "1.0.0",
    folder: p.dir,
    file: p.file,
    sha256: sha256(buf),
    bytes: buf.length,
    entries: r.info.entries,
    payloadBytes: r.info.payloadBytes,
    songs: r.info.songs,
    skin: r.info.skin ? { name: r.info.skin.name, colors: r.info.skin.colors } : null,
    /* L3：一覧に出す見本の2色（任意項目。trk231 のアプリはまだ読まない） */
    ...(r.info.colors ? { colors: r.info.colors } : {}),
    fonts: r.info.fonts && r.info.fonts.length
      ? r.info.fonts.map(f => ({ family: f.family, file: f.file, license: f.license,
          ...(Number.isInteger(f.weight) ? { weight: f.weight } : {}),
          ...(f.licenseFile ? { licenseFile: f.licenseFile } : {}) })) : [],
    license: r.info.license || "",
    description: r.info.description || "",
    ...(r.info.url ? { url: r.info.url } : {}),
    ok: r.ok,
    warnings: r.warnings,
  });
}
/* アプリは目録を 500 件までしか読まない（それ以上は黙って捨てるので、こちらで断る） */
const MAX_PACKS = 500;
if (packs.length > MAX_PACKS) {
  console.error(`❌ パックが ${packs.length} 件あります（アプリが読めるのは ${MAX_PACKS} 件までです）`);
  process.exit(1);
}

const skinsPath = path.join(HERE, "catalog/skins.json");
let skinSummary = null;
if (fs.existsSync(skinsPath)) {
  const j = JSON.parse(fs.readFileSync(skinsPath, "utf8"));
  skinSummary = { count: j.count, typeSkins: j.typeSkins, generatedAt: j.generatedAt, file: "catalog/skins.json" };
}

const catalog = {
  format: "trk-avatar-library",
  version: 1,
  name: "trk-Avatar-Library",
  updatedAt: new Date().toISOString(),
  app: "trk! (trk-PWA)",
  howToInstall: "trk! の 設定 → 📦 カスタムパック → 📚 目録から入れる で、この目録（index.json）を選び、"
    + "一覧から入れたい .stpack を選んでください。.stpack を画面にドラッグ＆ドロップしても入ります。",
  builtinSkins: skinSummary,
  packs,
};

const text = JSON.stringify(catalog, null, 2) + "\n";
if (checkOnly) {
  const prev = fs.existsSync(OUT) ? fs.readFileSync(OUT, "utf8") : "";
  if (!prev) { console.error("❌ catalog/index.json がありません。node tools/build-catalog.mjs で作ってください"); process.exit(1); }
  const prevJson = JSON.parse(prev);
  const samePacks = JSON.stringify(prevJson.packs) === JSON.stringify(catalog.packs);

  /* L8（trk232 からのお願い）：pack.json の release と、目録の packs[].version は必ず一致。
     片方だけ上げたパックがあると、アプリの「更新あり」が誤って出る／出ないので、名前を挙げて止めます。 */
  const l8 = [];
  const prevByFile = new Map((prevJson.packs || []).map(p => [p.file, p]));
  for (const p of catalog.packs) {
    const old = prevByFile.get(p.file);
    if (!old) continue;
    if (String(old.version || "") !== String(p.version || "")) {
      l8.push(`${p.file}: pack.json の release "${p.version}" と、目録の version "${old.version || ""}" が違います`);
    }
  }
  for (const old of prevJson.packs || []) {
    if (!catalog.packs.some(p => p.file === old.file)) l8.push(`${old.file}: 目録にあるのに、パックのファイルがありません`);
  }
  if (l8.length) {
    console.error(`❌ L8：配布版（release）と目録の version がそろっていません（${l8.length} 件）`);
    for (const m of l8) console.error(`   ❌ ${m}`);
    console.error("   どちらかに合わせて node tools/build-catalog.mjs で作り直してください");
    process.exit(1);
  }
  if (!samePacks) { console.error("❌ 目録が今の中身と合っていません。node tools/build-catalog.mjs で作り直してください"); process.exit(1); }
  console.log(`✅ 目録は最新です（${packs.length} パック・release と version も一致）`);
  process.exit(problems.length ? 1 : 0);
}

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, text, "utf8");
console.log(`✅ ${packs.length} パック → catalog/index.json（${text.length.toLocaleString()} B）`);
for (const p of packs) console.log(`   ${p.ok ? "✅" : "❌"} ${p.file} — ${p.name}${p.fonts.length ? `／書体 ${p.fonts.length}` : ""}`);
if (problems.length) {
  console.error("\n❌ 検査に通らないパックがあります（目録には載せましたが ok:false です）");
  for (const p of problems) for (const e of p.errors) console.error(`   ${p.file}: ${e}`);
  process.exit(1);
}
