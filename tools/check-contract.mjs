#!/usr/bin/env node
// SPDX-License-Identifier: GPL-3.0-or-later
/* 🤝 目録（catalog/index.json）が、アプリの読み取り規則を通るか確かめる（2026-10-31）

   なぜ要るか：
     目録の形は「倉庫とアプリの取り決め」（trk-PWA の docs/LIBRARY-TRK230-2026-10-31.md §3）です。
     ここが崩れると、アプリ側は**黙って項目を落とします**（名前が空・パスが危ない・sha256 の形が違う…）。
     そこで、**アプリ自身の `js/pack-catalog.js`（sanitizeCatalog）をそのまま読み込んで**、
     いまの目録が1件も落とされずに読めるかを見ます。写しを持たないので、規則が変わっても追随します。

   見ること：
     ・format が "trk-avatar-library"・version が 1
     ・全パックが sanitizeCatalog を通り、落とされる件数が 0
     ・name/author/version/file/sha256/bytes/fonts/license/description/url が、書いたとおりに残る
     ・file が実在し、sha256・bytes が実物と一致する
     ・fonts[].licenseFile（任意・L7）・note（L10）・cmap（L11）・tags（L15）・bytes の形が正しい
       （アプリが読むか読まないかは、1 行にまとめて出す。落とされても不合格にしない）

   使い方：
     node tools/check-contract.mjs
     node tools/check-contract.mjs --trk=/path/to/trk-PWA
     （trk-PWA の場所は --trk=… か 環境変数 TRK_PWA。既定は ../trk-PWA）

   終了コード：0＝通る、1＝通らない、2＝trk-PWA が見つからない
*/
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const HERE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const argv = process.argv.slice(2);
const trk = (argv.find(a => a.startsWith("--trk=")) || "").slice(6)
  || process.env.TRK_PWA || path.resolve(HERE, "..", "trk-PWA");
const appFile = path.join(path.resolve(trk), "js/pack-catalog.js");
const catalogPath = path.join(HERE, "catalog/index.json");
const sha256 = buf => crypto.createHash("sha256").update(buf).digest("hex");

if (!fs.existsSync(appFile)) {
  console.error(`⚠ trk-PWA の js/pack-catalog.js が見つかりません: ${appFile}`);
  console.error("  trk230 以降の trk-PWA を --trk=/path/to/trk-PWA で指定してください（この検査は省けません）");
  process.exit(2);
}

/* アプリの画面まわりは動かさず、純粋関数だけを使う（document は空） */
const sandbox = {
  console,
  window: {},
  document: { readyState: "complete", getElementById: () => null },
  addEventListener: () => {},
  CSS: { escape: s => String(s) },
  confirm: () => false,
  Number, String, Array, Object, JSON, Math, Date, Error, TypeError, Promise, Uint8Array, crypto,
};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(appFile, "utf8"), sandbox, { filename: "trk-PWA/js/pack-catalog.js" });
const api = sandbox.window && sandbox.window.Trk && sandbox.window.Trk.packCatalog;
if (!api || typeof api.sanitizeCatalog !== "function") {
  console.error("❌ trk-PWA の pack-catalog.js から sanitizeCatalog を取り出せませんでした");
  process.exit(2);
}

/* 相手側（trk-PWA）の版。CI の TRK_PWA_REF と突き合わせられるように、読めたら出す */
function appRevision(dir) {
  const tryGit = (...args) => {
    try { return execFileSync("git", ["-C", dir, ...args], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim(); }
    catch (_) { return ""; }
  };
  const sha = tryGit("rev-parse", "--short=7", "HEAD");
  if (!sha) return "";
  const tag = tryGit("describe", "--tags", "--always", "HEAD");
  const date = tryGit("log", "-1", "--format=%cs", "HEAD");
  return `${sha}${date ? `（${date}）` : ""}${tag && tag !== sha ? ` ${tag}` : ""}`;
}

const raw = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
const fails = [];
const notes = [];
const fail = (msg) => fails.push(msg);
/* 任意項目を、アプリが読むかどうかの集計（L3・L7・L10・L11） */
let licCount = 0, licKept = 0, noteCount = 0, cmapCount = 0, colorsKept = 0;
let tagCount = 0, tagKept = 0, fontBytesCount = 0, fontBytesKept = 0;

if (raw.format !== api.CATALOG_FORMAT) fail(`format が "${api.CATALOG_FORMAT}" ではありません（"${raw.format}"）`);
if (Number(raw.version) > api.CATALOG_VERSION) fail(`version ${raw.version} は、このアプリ（${api.CATALOG_VERSION} まで）では読めません`);
if (!raw.name) fail("name がありません（目録の名前。アプリは既定名で補いますが、書いておくのが確実です）");

const cat = api.sanitizeCatalog(raw);
if (!cat) {
  fail("sanitizeCatalog が null を返しました（目録として読めません）");
} else {
  if (cat.dropped !== 0) fail(`${cat.dropped} 件がアプリ側で落とされています（name/file/sha256 などの形を確認してください）`);
  if (cat.packs.length !== raw.packs.length) fail(`件数が違います（目録 ${raw.packs.length}／アプリが読む ${cat.packs.length}）`);
  for (let i = 0; i < Math.min(cat.packs.length, raw.packs.length); i++) {
    const a = raw.packs[i], b = cat.packs[i];
    const where = `packs[${i}]（${a.file || "file なし"}）`;
    for (const k of ["id", "name", "author", "version", "file", "license", "description", "url"]) {
      const want = String(a[k] === undefined ? "" : a[k]);
      const got = String(b[k] === undefined ? "" : b[k]);
      if (got !== want) fail(`${where} の ${k} が変わりました（目録 "${want}" → アプリ "${got}"）`);
    }
    if (String(a.sha256 || "").toLowerCase() !== b.sha256) fail(`${where} の sha256 が通りません（64 桁の16進か確認してください）`);
    if (Number(a.bytes) !== b.bytes) fail(`${where} の bytes が通りません（"${a.bytes}"）`);
    const af = (a.fonts || []).map(f => `${f.family}|${f.file}|${f.license}`).join(",");
    const bf = (b.fonts || []).map(f => `${f.family}|${f.file}|${f.license}`).join(",");
    if (af !== bf) fail(`${where} の fonts が変わりました（目録 "${af}" → アプリ "${bf}"）`);
    /* L7・L10・L11：フォントの任意項目（licenseFile・note・cmap）は、形だけこちらで決めて、
       アプリが落としても不合格にしません（載せること自体が契約違反にならないように）。
       読むか読まないかは、下でまとめて1行にします（パックごとに出すと 16 行になって読みにくい）。 */
    for (const f of a.fonts || []) {
      if (f.licenseFile !== undefined) {
        const p = String(f.licenseFile || "");
        const ok = typeof f.licenseFile === "string" && /^[A-Za-z0-9_\-./]{1,120}$/.test(p)
          && !p.includes("..") && !p.startsWith("/") && /\.(txt|md)$/i.test(p);
        if (!ok) fail(`${where} の fonts[].licenseFile（"${p}"）は .txt か .md のパスにしてください`);
        else {
          licCount++;
          if ((b.fonts || []).some(x => x.licenseFile)) licKept++;
        }
      }
      /* L10：note は「雰囲気の一行」（60 文字まで） */
      if (f.note !== undefined) {
        const n = typeof f.note === "string" ? f.note.trim() : "";
        if (!n || [...n].length > 60) fail(`${where} の fonts[].note は 1〜60 文字にしてください（"${f.note}"）`);
        else noteCount++;
      }
      /* L11：cmap は対応する字数（正の整数） */
      if (f.cmap !== undefined) {
        if (!(Number.isInteger(f.cmap) && f.cmap > 0 && f.cmap <= 200000)) {
          fail(`${where} の fonts[].cmap は正の整数（字数）にしてください（"${f.cmap}"）`);
        } else cmapCount++;
      }
      /* L15：tags は検索と絞り込みの語（8 個まで・各 16 文字） */
      if (f.tags !== undefined) {
        const t = f.tags;
        const okShape = Array.isArray(t) && t.length > 0 && t.length <= 8
          && t.every(x => typeof x === "string" && x.trim() && [...x.trim()].length <= 16);
        if (!okShape) fail(`${where} の fonts[].tags は、1〜8 個の文字列（各 16 文字まで）にしてください`);
        else {
          tagCount++;
          if ((b.fonts || []).some(x => Array.isArray(x.tags) && x.tags.length)) tagKept++;
        }
      }
      /* 書体 1 本の大きさ（`gallery/fonts.html` の「大きさ」用。任意） */
      if (f.bytes !== undefined) {
        if (!(Number.isInteger(f.bytes) && f.bytes > 0 && f.bytes <= 16 * 1024 * 1024)) {
          fail(`${where} の fonts[].bytes は正の整数（1 本の大きさ・16 MiB 以下）にしてください（"${f.bytes}"）`);
        } else {
          fontBytesCount++;
          if ((b.fonts || []).some(x => Number.isInteger(x.bytes))) fontBytesKept++;
        }
      }
    }
    if (a.colors !== undefined && b.colors !== undefined) colorsKept++;
    /* L3：colors は任意項目。形だけこちらで決める（アプリの trk231 は無視する） */
    if (a.colors !== undefined) {
      const c = a.colors;
      const ok = c && typeof c === "object" && !Array.isArray(c)
        && /^#[0-9a-f]{6}$/i.test(String(c.stage)) && /^#[0-9a-f]{6}$/i.test(String(c.accent));
      if (!ok) fail(`${where} の colors は { stage: "#rrggbb", accent: "#rrggbb" } にしてください`);

    }
  }
}

/* 目録の指すファイルが実在し、sha256・bytes が実物と一致するか */
for (const p of raw.packs) {
  const abs = path.join(HERE, p.file);
  if (!fs.existsSync(abs)) { fail(`${p.file} がありません`); continue; }
  const buf = fs.readFileSync(abs);
  if (sha256(buf) !== p.sha256) fail(`${p.file} の sha256 が目録と違います`);
  if (buf.length !== p.bytes) fail(`${p.file} の大きさが目録と違います（目録 ${p.bytes}／実際 ${buf.length}）`);
}

/* 任意項目の「読む／読まない」をまとめて出す（見直しどきの合図） */
if (licCount) {
  notes.push(licKept
    ? `fonts[].licenseFile（L7）をアプリが読むようになりました（${licCount} 件・trk233 以降）。check-contract の見直しどきです`
    : `fonts[].licenseFile（L7）を ${licCount} 件載せていますが、アプリはまだ読みません（trk233 以降の予定）`);
}
if (noteCount || cmapCount) {
  notes.push(`fonts[].note（L10・${noteCount} 件）と cmap（L11・${cmapCount} 件）を載せています。`
    + `アプリ（trk235）はまだ読みません（trk236 で読む予定。読む版になったら、ここが「読みました」に変わります）`);
}
if (tagCount) {
  notes.push(tagKept
    ? `fonts[].tags（L15）をアプリが読むようになりました（${tagCount} 件）。check-contract の見直しどきです`
    : `fonts[].tags（L15）を ${tagCount} 件載せていますが、アプリはまだ読みません（trk237 の「書体で絞る」で使う予定）`);
}
if (fontBytesCount) {
  notes.push(fontBytesKept
    ? `fonts[].bytes（書体 1 本の大きさ）をアプリが読むようになりました（${fontBytesCount} 件）`
    : `fonts[].bytes（書体 1 本の大きさ）を ${fontBytesCount} 件載せています。アプリは読まなくても構いません（一覧の表示用）`);
}
if (colorsKept) notes.push(`packs[].colors をアプリが読むようになりました（trk235 以降）。check-contract の見直しどきです`);

if (fails.length) {
  console.error(`❌ 目録がアプリの読み取り規則を通りません（${fails.length} 件）`);
  for (const f of fails) console.error(`   ❌ ${f}`);
  process.exit(1);
}
const rev = appRevision(path.resolve(trk));
console.log(`✅ 目録はアプリ（trk-PWA/js/pack-catalog.js）の規則を通ります（${raw.packs.length} パック）`);
if (rev) console.log(`   相手側 trk-PWA: ${rev}${process.env.TRK_PWA_REF ? `（CI の TRK_PWA_REF=${process.env.TRK_PWA_REF}）` : ""}`);
for (const n of notes) console.log(`   ℹ ${n}`);
for (const p of raw.packs) {
  console.log(`   ${p.file} — ${p.name}${p.fonts && p.fonts.length ? `／書体 ${p.fonts.length}` : ""}${p.bytes ? `（${p.bytes.toLocaleString()} B）` : ""}`);
}
