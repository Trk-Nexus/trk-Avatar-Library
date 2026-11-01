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
     ・fonts[].note は任意（L10・trk233 からのお願い）。「どんな雰囲気の書体か」の一行（60 文字まで）。
       パックの中身（pack.json）は動かさず、この倉庫の catalog/font-notes.json で足す
     ・fonts[].cmap は任意（L11）。その書体が対応する字数（woff2 の cmap を数える）
     ・fonts[].tags は任意（L15・8 個まで・各 16 文字）。catalog/font-tags.json で足す（検索と絞り込みの語）
     ・fonts[].bytes は任意。パックの中の woff2 1 本の大きさ（見本ページが使う）
     ・note と tags は、**パック自身（pack.json の fonts[]）にも書ける**（2026-11-01）。両方に書いたら止める
       （trk238 予定の「起動時にパックから索引を作る」ために、パックを自己紹介できる形にしておく）
     ・書体パックの受け入れ検査（L16）はこの道具が持ちます：OFL-1.1・family は Trk で始まる・
       family＋weight が目録全体で重複しない・1 本 4 MiB 以下・cmap 1,000 字以上
     ・形が合っているかは tools/check-contract.mjs（アプリ自身の sanitizeCatalog）で確かめる
*/
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { verifyPack } from "./verify-pack.mjs";
import { openZip } from "./lib/zip.mjs";
import { checkFont } from "./check-fonts.mjs";

const HERE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const argv = process.argv.slice(2);
const checkOnly = argv.includes("--check");
const trk = (argv.find(a => a.startsWith("--trk=")) || "").slice(6) || undefined;
const DIRS = ["packs", "font-packs"];
const OUT = path.join(HERE, "catalog/index.json");

const sha256 = buf => crypto.createHash("sha256").update(buf).digest("hex");

/* L10：書体の「雰囲気の一行」。パックの pack.json は変えず、この倉庫の catalog/font-notes.json で足す
   （パックのバイト列＝配ったものの sha256 を動かさないため）。キーは目録の file、その下がパックの中の書体ファイル。 */
const NOTES_PATH = path.join(HERE, "catalog/font-notes.json");
const NOTES = fs.existsSync(NOTES_PATH) ? JSON.parse(fs.readFileSync(NOTES_PATH, "utf8")) : {};
const NOTES_BY_PACK = NOTES && typeof NOTES.packs === "object" && NOTES.packs ? NOTES.packs : {};
const NOTE_MAX = 60, NOTE_SOFT = 30;   /* 60 が上限・30 くらいまでが 1 行で読みやすい（trk236 の返事） */
const noteProblems = [];
const noteUsed = new Set();
const noteOf = (packFile, fontFile) => {
  const byFont = NOTES_BY_PACK[packFile];
  if (!byFont || typeof byFont !== "object") return "";
  const raw = byFont[fontFile];
  if (raw === undefined || raw === null) return "";
  noteUsed.add(`${packFile}|${fontFile}`);
  if (typeof raw !== "string" || !raw.trim()) { noteProblems.push(`${packFile} の「${fontFile}」の note が空です`); return ""; }
  const note = raw.trim();
  if ([...note].length > NOTE_MAX) {
    noteProblems.push(`${packFile} の「${fontFile}」の note が ${[...note].length} 文字です（${NOTE_MAX} 文字まで）`);
    return "";
  }
  return note;
};

/* L15：検索と絞り込みの語（packs[].fonts[].tags・任意・8 個まで・各 16 文字）。
   アプリは trk236 以降で「書体で絞る」に使う。L10 の note と同じく、パックの外で足す */
const TAGS_PATH = path.join(HERE, "catalog/font-tags.json");
const TAGS = fs.existsSync(TAGS_PATH) ? JSON.parse(fs.readFileSync(TAGS_PATH, "utf8")) : {};
const TAGS_BY_PACK = TAGS && typeof TAGS.packs === "object" && TAGS.packs ? TAGS.packs : {};
const TAG_MAX_COUNT = 8, TAG_MAX_LEN = 16;
const tagProblems = [];
const tagUsed = new Set();
const tagsOf = (packFile, fontFile) => {
  const byFont = TAGS_BY_PACK[packFile];
  if (!byFont || typeof byFont !== "object") return [];
  const raw = byFont[fontFile];
  if (raw === undefined || raw === null) return [];
  tagUsed.add(`${packFile}|${fontFile}`);
  if (!Array.isArray(raw)) {
    tagProblems.push(`${packFile} の「${fontFile}」の tags が配列ではありません`);
    return [];
  }
  const out = [];
  for (const t of raw) {
    const s = typeof t === "string" ? t.trim() : "";
    if (!s) { tagProblems.push(`${packFile} の「${fontFile}」の tags に空の語があります`); continue; }
    if ([...s].length > TAG_MAX_LEN) {
      tagProblems.push(`${packFile} の「${fontFile}」のタグ「${s}」が ${[...s].length} 文字です（${TAG_MAX_LEN} 文字まで）`);
      continue;
    }
    if (!out.includes(s)) out.push(s);
  }
  if (out.length > TAG_MAX_COUNT) {
    tagProblems.push(`${packFile} の「${fontFile}」の tags が ${out.length} 個あります（${TAG_MAX_COUNT} 個まで）`);
  }
  return out.slice(0, TAG_MAX_COUNT);
};

/* L10／L15：パック自身（pack.json の fonts[]）に書かれた値と、目録の外（catalog/*.json）に書かれた値。
   2026-11-01 からパックにも書けるようになったので、**どちらか一方だけ**を受け付けます。
   二重に書くと、片方を直したときにもう片方が古いまま残る（＝目録とパックで違うことを言う）ので止めます。 */
const noteFor = (packFile, f) => {
  const fromPack = typeof f.note === "string" ? f.note.trim() : "";
  const fromFile = noteOf(packFile, f.file);
  if (fromPack && fromFile) {
    noteProblems.push(`${packFile} の「${f.file}」の note が、pack.json と catalog/font-notes.json の両方にあります（どちらか 1 つにしてください）`);
    return "";
  }
  if (!fromPack) return fromFile;
  if ([...fromPack].length > NOTE_MAX) {
    noteProblems.push(`${packFile} の「${f.file}」の note（pack.json）が ${[...fromPack].length} 文字です（${NOTE_MAX} 文字まで）`);
    return "";
  }
  return fromPack;
};
const tagsFor = (packFile, f) => {
  const fromFile = tagsOf(packFile, f.file);
  const raw = Array.isArray(f.tags) ? f.tags : [];
  if (raw.length && fromFile.length) {
    tagProblems.push(`${packFile} の「${f.file}」の tags が、pack.json と catalog/font-tags.json の両方にあります（どちらか 1 つにしてください）`);
    return [];
  }
  if (!raw.length) return fromFile;
  const out = [];
  for (const t of raw) {
    const tag = typeof t === "string" ? t.trim() : "";
    if (!tag) { tagProblems.push(`${packFile} の「${f.file}」の tags（pack.json）に空の語があります`); continue; }
    if ([...tag].length > TAG_MAX_LEN) {
      tagProblems.push(`${packFile} の「${f.file}」のタグ「${tag}」（pack.json）が ${[...tag].length} 文字です（${TAG_MAX_LEN} 文字まで）`);
      continue;
    }
    if (!out.includes(tag)) out.push(tag);
  }
  if (out.length > TAG_MAX_COUNT) {
    tagProblems.push(`${packFile} の「${f.file}」の tags（pack.json）が ${out.length} 個あります（${TAG_MAX_COUNT} 個まで）`);
  }
  return out.slice(0, TAG_MAX_COUNT);
};

/* L11：その書体が対応する字数（woff2 の cmap）と、その1本の大きさ。check-fonts と同じ読み方で数える */
async function fontStats(buf, fonts) {
  const out = new Map();
  if (!fonts.length) return out;
  let zipped = null;
  try { zipped = await openZip(buf, trk); } catch (_) { return out; }
  for (const f of fonts) {
    try {
      const bytes = await zipped.read(f.file);
      if (!bytes) continue;
      const stat = { bytes: bytes.length };
      const c = checkFont(Buffer.from(bytes), { family: f.family, file: f.file, weight: f.weight });
      if (c && c.info && Number.isInteger(c.info.cmap) && c.info.cmap > 0) stat.cmap = c.info.cmap;
      out.set(f.file, stat);
    } catch (_) { /* 読めない書体は check-fonts が別に知らせる（目録は cmap 抜きで作る） */ }
  }
  return out;
}

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
  const fontInfo = Array.isArray(r.info.fonts) ? r.info.fonts : [];
  const stats = await fontStats(buf, fontInfo);
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
    fonts: fontInfo.map(f => {
      const note = noteFor(p.file, f);
      const tags = tagsFor(p.file, f);
      const stat = stats.get(f.file) || {};
      return { family: f.family, file: f.file, license: f.license,
        ...(Number.isInteger(f.weight) ? { weight: f.weight } : {}),
        ...(f.licenseFile ? { licenseFile: f.licenseFile } : {}),
        ...(stat.bytes ? { bytes: stat.bytes } : {}),
        ...(note ? { note } : {}),
        ...(stat.cmap ? { cmap: stat.cmap } : {}),
        ...(tags.length ? { tags } : {}) };
    }),
    license: r.info.license || "",
    description: r.info.description || "",
    ...(r.info.url ? { url: r.info.url } : {}),
    ok: r.ok,
    warnings: r.warnings,
  });
}
/* catalog/font-notes.json の書き間違い（長すぎる・パックにない書体・目録にないパック）は、黙って捨てずに止める */
for (const [packFile, byFont] of Object.entries(NOTES_BY_PACK)) {
  if (!packs.some(p => p.file === packFile)) {
    noteProblems.push(`catalog/font-notes.json の「${packFile}」は目録にありません（file のつづりを確かめてください）`);
    continue;
  }
  if (!byFont || typeof byFont !== "object") { noteProblems.push(`catalog/font-notes.json の「${packFile}」が入れ物ではありません`); continue; }
  for (const fontFile of Object.keys(byFont)) {
    if (!noteUsed.has(`${packFile}|${fontFile}`)) {
      noteProblems.push(`catalog/font-notes.json の「${packFile}」の「${fontFile}」は、そのパックに入っていません`);
    }
  }
}
if (noteProblems.length) {
  console.error(`❌ catalog/font-notes.json に問題があります（${noteProblems.length} 件）`);
  for (const m of noteProblems) console.error(`   ❌ ${m}`);
  process.exit(1);
}

/* catalog/font-tags.json の書き間違い（多すぎる・長すぎる・パックにない書体）も、黙って捨てずに止める */
for (const [packFile, byFont] of Object.entries(TAGS_BY_PACK)) {
  if (!packs.some(p => p.file === packFile)) {
    tagProblems.push(`catalog/font-tags.json の「${packFile}」は目録にありません（file のつづりを確かめてください）`);
    continue;
  }
  if (!byFont || typeof byFont !== "object") { tagProblems.push(`catalog/font-tags.json の「${packFile}」が入れ物ではありません`); continue; }
  for (const fontFile of Object.keys(byFont)) {
    if (!tagUsed.has(`${packFile}|${fontFile}`)) {
      tagProblems.push(`catalog/font-tags.json の「${packFile}」の「${fontFile}」は、そのパックに入っていません`);
    }
  }
}
if (tagProblems.length) {
  console.error(`❌ catalog/font-tags.json に問題があります（${tagProblems.length} 件）`);
  for (const m of tagProblems) console.error(`   ❌ ${m}`);
  process.exit(1);
}

/* L16：書体パックを増やすときの受け入れ検査（trk233 からのお願い）。
   ここが赤いうちは「増やしても壊れない」とは言えないので、目録を作らずに止める。 */
const policyProblems = [];
const familyWeight = new Map();
const MB = 1048576;
for (const p of packs) {
  if (!p.fonts.length) continue;
  for (const f of p.fonts) {
    const label = `${p.file} の「${f.family || f.file}」`;
    if (String(f.license) !== "OFL-1.1") {
      policyProblems.push(`${label}: 書体の license は OFL-1.1 にしてください（\"${f.license || "なし"}\"）`);
    }
    if (!/^Trk/.test(String(f.family))) {
      policyProblems.push(`${label}: family は Trk で始めてください（OFL の予約名を避けるため）`);
    }
    const key = `${String(f.family).toLowerCase()}|${Number.isInteger(f.weight) ? f.weight : 400}`;
    if (familyWeight.has(key)) {
      policyProblems.push(`${label}: family＋太さが ${familyWeight.get(key)} と重複しています（目録全体で1つだけ）`);
    } else familyWeight.set(key, p.file);
    if (f.bytes && f.bytes > 4 * MB) {
      policyProblems.push(`${label}: 1 本が ${(f.bytes / MB).toFixed(2)} MiB です（4 MiB 以下にしてください）`);
    }
    if (Number.isInteger(f.cmap) && f.cmap < 1000) {
      policyProblems.push(`${label}: 対応する字が ${f.cmap} 字です（1,000 字以上にしてください）`);
    }
  }
  if (!p.fonts.some(f => f.licenseFile)) {
    policyProblems.push(`${p.file}: 書体のライセンス全文（fonts[].licenseFile）がありません（OFL は同梱が条件です）`);
  }
}
if (policyProblems.length) {
  console.error(`❌ L16：書体パックの受け入れ検査に通りません（${policyProblems.length} 件）`);
  for (const m of policyProblems) console.error(`   ❌ ${m}`);
  process.exit(1);
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
const noteCount = packs.reduce((n, p) => n + p.fonts.filter(f => f.note).length, 0);
const cmapCount = packs.reduce((n, p) => n + p.fonts.filter(f => f.cmap).length, 0);
const tagCount = packs.reduce((n, p) => n + p.fonts.filter(f => f.tags && f.tags.length).length, 0);
console.log(`✅ ${packs.length} パック → catalog/index.json（${text.length.toLocaleString()} B・書体の note ${noteCount} / cmap ${cmapCount} / tags ${tagCount}）`);
/* 2026-11-01（trk236 の返事）：note はアプリの「🔎 中身」に 1 行で出る。60 文字まで書けるが、
   狭い画面では 2 行になるので、30 文字を超えたら「短くできる」とだけ知らせる（止めはしない） */
const longNotes = packs.flatMap(p => p.fonts
  .filter(f => f.note && [...f.note].length > NOTE_SOFT)
  .map(f => `${p.file} の「${f.family}」（${[...f.note].length} 文字）`));
if (longNotes.length) {
  console.log(`   ℹ note が ${NOTE_SOFT} 文字を超える書体が ${longNotes.length} 件あります（🔎 中身では 1 行で出ます。短いほうが読みやすい）`);
  for (const m of longNotes) console.log(`     ・${m}`);
}
for (const p of packs) console.log(`   ${p.ok ? "✅" : "❌"} ${p.file} — ${p.name}${p.fonts.length ? `／書体 ${p.fonts.length}` : ""}`);
if (problems.length) {
  console.error("\n❌ 検査に通らないパックがあります（目録には載せましたが ok:false です）");
  for (const p of problems) for (const e of p.errors) console.error(`   ${p.file}: ${e}`);
  process.exit(1);
}
