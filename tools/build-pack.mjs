#!/usr/bin/env node
// SPDX-License-Identifier: GPL-3.0-or-later
/* 📦 配る .stpack を、フォルダから組み立てる（2026-10-31）

   なぜ要るか：
     書体パックは woff2 を数百 KB〜数 MB 同梱するので、ZIP を手で作ると
     「どのファイルが入ったか」「作り直したら同じバイト列か」を確かめられません。
     ここでは**フォルダをそのまま正**にして、決定的な（同じ入力なら同じ sha256 の）ZIP を作ります。

   使い方：
     node tools/build-pack.mjs font-packs/maru-go                 … font-packs/maru-go.stpack を作る
     node tools/build-pack.mjs font-packs/maru-go --check         … いまの .stpack がフォルダと合っているかだけ見る（CI 向け）
     node tools/build-pack.mjs font-packs/maru-go --fetch         … SOURCE.json の tarball から素材を取ってくる
     node tools/build-pack.mjs <src> --out=packs/foo.stpack --trk=/path/to/trk-PWA

   フォルダの形：
     <src>/pack.json         … パックの中身の説明（アプリの仕様そのまま）
     <src>/SOURCE.json       … 同梱素材の出どころ（tarball・sha256）。**パックには入れません**
     <src>/fonts/*.woff2     … 書体（SOURCE.json から取ることも、手で置くこともできる）
     <src>/fonts/OFL.txt     … 書体のライセンス全文（パックに入ります）

   ZIP は trk-PWA の `js/zip-io.js`（アプリと同じ実装）で書きます。
   **無圧縮（store）で固定**しているので、Node の版が変わっても同じバイト列になります
   （woff2 はすでに圧縮済みなので、実害はありません）。
*/
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import zlib from "node:zlib";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { loadZipIO } from "./lib/zip.mjs";
import { verifyPack } from "./verify-pack.mjs";

const HERE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CACHE = path.join(HERE, ".cache/font-packs");
/* パックに入れないもの（フォルダのいちばん上だけ） */
const SKIP = new Set(["SOURCE.json", "README.md", ".DS_Store", "Thumbs.db"]);

const sha256 = buf => crypto.createHash("sha256").update(buf).digest("hex");
const cstr = (buf, start, len) => {
  let end = start; const max = Math.min(start + len, buf.length);
  while (end < max && buf[end] !== 0) end++;
  return buf.toString("utf8", start, end);
};

/* --- tar（npm の tarball は tar.gz）から、要るファイルだけ取り出す --- */
function untar(buf) {
  const files = new Map();
  let off = 0, longName = null, paxPath = null;
  while (off + 512 <= buf.length) {
    const block = buf.subarray(off, off + 512);
    if (block.every(v => v === 0)) break;
    const name = cstr(block, 0, 100);
    const size = parseInt(cstr(block, 124, 12).trim() || "0", 8);
    if (!Number.isFinite(size) || size < 0) break;
    const type = String.fromCharCode(block[156] || 0x30);
    const prefix = cstr(block, 345, 155);
    const full = paxPath || longName || (prefix ? `${prefix}/${name}` : name);
    const dataStart = off + 512;
    const data = buf.subarray(dataStart, Math.min(dataStart + size, buf.length));
    if (type === "L") longName = cstr(data, 0, data.length);
    else if (type === "x" || type === "X") {
      const m = data.toString("utf8").match(/(?:^|\n)\d+ path=([^\n]+)\n/);
      if (m) paxPath = m[1];
    } else if (type === "0" || type === "\0" || type === "7") {
      files.set(full, data);
      longName = null; paxPath = null;
    }
    off = dataStart + Math.ceil(size / 512) * 512;
  }
  return files;
}

const tarCache = new Map();
async function tarball(url) {
  if (tarCache.has(url)) return tarCache.get(url);
  const dir = path.join(CACHE, path.basename(url, ".tgz"));
  const cached = path.join(dir, "package.tgz");
  let gz;
  if (fs.existsSync(cached)) gz = fs.readFileSync(cached);
  else {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`素材を取得できませんでした（HTTP ${res.status}）: ${url}`);
    gz = Buffer.from(await res.arrayBuffer());
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(cached, gz);
  }
  const tar = untar(zlib.gunzipSync(gz));
  tarCache.set(url, tar);
  return tar;
}

function checkBytes(buf, spec, name) {
  if (!spec.sha256) return;
  const got = sha256(buf);
  if (got !== String(spec.sha256).toLowerCase()) {
    throw new Error(`「${name}」の sha256 が SOURCE.json と違います（期待 ${spec.sha256}／実際 ${got}）`);
  }
  if (Number.isFinite(spec.bytes) && buf.length !== spec.bytes) {
    throw new Error(`「${name}」の大きさが SOURCE.json と違います（期待 ${spec.bytes}／実際 ${buf.length}）`);
  }
}

/* 手元のファイル → .cache → （--fetch のときだけ）tarball の順に探す */
async function resolveAsset(src, name, spec, fetchAllowed, state) {
  const local = path.join(src, name);
  if (fs.existsSync(local)) { const buf = fs.readFileSync(local); checkBytes(buf, spec, name); return buf; }
  const cached = path.join(CACHE, path.basename(String(spec.tarball || ""), ".tgz"), path.basename(name));
  if (fs.existsSync(cached)) { const buf = fs.readFileSync(cached); checkBytes(buf, spec, name); return buf; }
  if (!spec.tarball || !spec.path) return null;
  if (!fetchAllowed) return null;
  state.fetched = true;
  const tar = await tarball(String(spec.tarball));
  const buf = tar.get(String(spec.path));
  if (!buf) throw new Error(`tarball の中に「${spec.path}」がありません: ${spec.tarball}`);
  checkBytes(buf, spec, name);
  fs.mkdirSync(path.dirname(cached), { recursive: true });
  fs.writeFileSync(cached, buf);
  return buf;
}

function walk(dir, base = "") {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))) {
    const rel = base ? `${base}/${e.name}` : e.name;
    if (e.isDirectory()) out.push(...walk(path.join(dir, e.name), rel));
    else if (e.isFile()) out.push(rel);
  }
  return out;
}

/* フォルダ → .stpack のバイト列（決定的） */
async function buildPack(src, opts) {
  const manPath = path.join(src, "pack.json");
  if (!fs.existsSync(manPath)) throw new Error(`pack.json がありません: ${manPath}`);
  const manBuf = fs.readFileSync(manPath);
  JSON.parse(manBuf.toString("utf8"));   /* JSON でないと組み立てられない（中身の検査は verify-pack） */

  const files = new Map([["pack.json", manBuf]]);
  const state = { fetched: false };
  const sourcePath = path.join(src, "SOURCE.json");
  const source = fs.existsSync(sourcePath) ? JSON.parse(fs.readFileSync(sourcePath, "utf8")) : {};
  for (const [name, spec] of Object.entries(source.files && typeof source.files === "object" ? source.files : {})) {
    if (!spec || typeof spec !== "object") continue;
    const buf = await resolveAsset(src, name, spec, opts.fetch, state);
    if (!buf) throw new Error(`「${name}」がありません（--fetch を付けると SOURCE.json の tarball から取ります）`);
    files.set(name, buf);
  }
  for (const rel of walk(src)) {
    if (files.has(rel)) continue;
    if (!rel.includes("/") && SKIP.has(rel)) continue;
    files.set(rel, fs.readFileSync(path.join(src, rel)));
  }

  const names = [...files.keys()].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
  const zipIO = loadZipIO(opts.trk);
  /* 無圧縮で固定（Node の zlib の版でバイト列が変わらないように） */
  const entries = names.map(name => ({ name, blob: new Blob([files.get(name)]) }));
  const blob = await zipIO.zipWrite(entries);
  return { bytes: Buffer.from(await blob.arrayBuffer()), names, fetched: state.fetched };
}

/* --- コマンドとして動かす --- */
async function main() {
  const argv = process.argv.slice(2);
  const opts = { check: false, fetch: false, json: false, out: "", trk: undefined };
  const rest = [];
  for (const a of argv) {
    if (a === "--check") opts.check = true;
    else if (a === "--fetch") opts.fetch = true;
    else if (a === "--json") opts.json = true;
    else if (a.startsWith("--out=")) opts.out = a.slice(6);
    else if (a.startsWith("--trk=")) opts.trk = a.slice(6);
    else if (a === "-h" || a === "--help") { usage(); process.exit(0); }
    else if (a.startsWith("--")) { console.error(`使い方にないオプションです: ${a}\n`); usage(); process.exit(2); }
    else rest.push(a);
  }
  if (!rest.length) { usage(); process.exit(2); }
  const src = path.resolve(rest[0]);
  if (!fs.existsSync(src) || !fs.statSync(src).isDirectory()) {
    console.error(`フォルダが見つかりません: ${src}`);
    process.exit(2);
  }
  const out = path.resolve(opts.out || `${src}.stpack`);

  const built = await buildPack(src, opts);
  const sha = sha256(built.bytes);

  /* 出来たものを、アプリと同じ検査に通す（通らないものは置かない） */
  const tmp = path.join(os.tmpdir(), `trk-pack-${process.pid}-${Date.now()}.stpack`);
  fs.writeFileSync(tmp, built.bytes);
  const r = await verifyPack(tmp, { trk: opts.trk });
  fs.rmSync(tmp, { force: true });

  const report = { ok: r.ok, out, bytes: built.bytes.length, sha256: sha, entries: built.names.length,
    name: r.info.name || "", fonts: r.info.fonts || [], errors: r.errors, warnings: r.warnings };
  if (opts.json) console.log(JSON.stringify(report, null, 2));

  if (!r.ok) {
    if (!opts.json) {
      console.error(`❌ 検査に通りませんでした（${path.relative(HERE, out)} は書き換えていません）`);
      for (const e of r.errors) console.error(`   ❌ ${e}`);
    }
    process.exit(1);
  }

  let same = false;
  if (fs.existsSync(out)) same = sha256(fs.readFileSync(out)) === sha;

  if (opts.check) {
    if (!opts.json) {
      if (same) console.log(`✅ ${path.relative(HERE, out)} はフォルダと合っています（${built.bytes.length.toLocaleString()} B・sha256 ${sha.slice(0, 12)}…）`);
      else console.log(`❌ ${path.relative(HERE, out)} がフォルダと合っていません。node tools/build-pack.mjs ${path.relative(HERE, src)}${built.fetched ? " --fetch" : ""} で作り直してください`);
      for (const w of r.warnings) console.log(`   ⚠ ${w}`);
    }
    process.exit(same ? 0 : 1);
  }

  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, built.bytes);
  if (!opts.json) {
    console.log(`✅ ${path.relative(HERE, out)}（${built.bytes.length.toLocaleString()} B・${built.names.length} ファイル・sha256 ${sha}）`);
    console.log(`   ${r.info.name || "(名前なし)"}${r.info.fonts && r.info.fonts.length ? `／書体 ${r.info.fonts.length}` : ""}`);
    for (const n of built.names) console.log(`   + ${n}`);
    for (const w of r.warnings) console.log(`   ⚠ ${w}`);
  }
}

function usage() {
  console.log(`使い方: node tools/build-pack.mjs <フォルダ> [--out=…] [--check] [--fetch] [--json] [--trk=/path/to/trk-PWA]

  <フォルダ>/pack.json     パックの説明（アプリの仕様そのまま）
  <フォルダ>/SOURCE.json   同梱素材の出どころ（tarball・sha256）。パックには入りません
  --check                  .stpack がフォルダと合っているかだけ見る（CI 向け）
  --fetch                  SOURCE.json の tarball から素材を取ってくる（.cache/font-packs に保存）`);
}

main().catch(err => {
  console.error(`❌ ${err && err.message ? err.message : err}`);
  process.exit(1);
});
