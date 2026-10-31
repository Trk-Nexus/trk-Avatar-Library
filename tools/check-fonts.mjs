#!/usr/bin/env node
// SPDX-License-Identifier: GPL-3.0-or-later
/* 🔤 パックに入っている書体（woff2）が、本当に書体として読める形かを見る（2026-11-01）

   なぜ要るか：
     書体パックの「宣言」（family・license）は verify-pack が見ていますが、
     **woff2 の中身**は誰も見ていませんでした。壊れた・別のものに差し替わった woff2 でも
     宣言さえ正しければ通ってしまい、アプリの FontFace.load() で初めて失敗します
     （この倉庫にはブラウザが無いので、それに気づく手段がありませんでした）。

   見ること（ブラウザ無しで分かる範囲）：
     ・先頭が wOF2（WOFF2 の署名）で、宣言した大きさとファイルの大きさが一致
     ・sfnt の種類が TrueType（0x00010000）か CFF（OTTO）
     ・表（cmap・name・head・hhea・hmtx・maxp・OS/2 と、glyf＋loca か CFF）がそろっている
     ・1書体 16 MiB まで（アプリの上限）
     ・同じパックの中で、同じ family＋weight が重複していない（アプリは1つにまとめます）
     ・**見本に出す文字（あア漢 Aa 12 など）の字形が cmap に入っているか**（brotli を解いて中を見る）

   見ていないこと（ブラウザでしか分からないこと）：
     ・字形そのものの見た目（太さ・字間・OS ごとの差）・FontFace の読み込み結果
     → ここが通っても「表示は実機で見る」が要ります（HANDOFF §4）。

   使い方：
     node tools/check-fonts.mjs                        … 倉庫の全パックの書体を見る（CI 用）
     node tools/check-fonts.mjs --json
     node tools/check-fonts.mjs --trk=/path/to/trk-PWA

   終了コード：0＝全部読める形、1＝怪しいものがある、2＝使い方の誤り
*/
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";
import { openZip } from "./lib/zip.mjs";
import { verifyPack } from "./verify-pack.mjs";

const HERE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const argv = process.argv.slice(2);
const asJson = argv.includes("--json");
const trk = (argv.find(a => a.startsWith("--trk=")) || "").slice(6) || undefined;
const MAX_FONT = 16 * 1024 * 1024;      /* アプリの 1書体の上限（js/custom.js） */

/* WOFF2 の「知られている表」の並び（WOFF2 仕様の表。63 は「後に 4 文字のタグが続く」） */
const KNOWN_TAGS = [
  "cmap", "head", "hhea", "hmtx", "maxp", "name", "OS/2", "post", "cvt ", "fpgm",
  "glyf", "loca", "prep", "CFF ", "VORG", "EBDT", "EBLC", "gasp", "hdmx", "kern",
  "LTSH", "PCLT", "VDMX", "vhea", "vmtx", "BASE", "GDEF", "GPOS", "GSUB", "EBSC",
  "JSTF", "MATH", "CBDT", "CBLC", "COLR", "CPAL", "SVG ", "sbix", "acnt", "avar",
  "bdat", "bloc", "bsln", "cvar", "fdsc", "feat", "fmtx", "fvar", "gvar", "hsty",
  "just", "lcar", "mort", "morx", "opbd", "prop", "trak", "Zapf", "Silf", "Glat",
  "Gloc", "Feat", "Sill",
];

/* UIntBase128 を読む（最大5バイト・先頭が 0x80 なら不正） */
function readBase128(buf, at) {
  let value = 0;
  for (let i = 0; i < 5; i++) {
    if (at.i >= buf.length) throw new Error("表の長さが途中で終わっています");
    const b = buf[at.i++];
    if (i === 0 && b === 0x80) throw new Error("UIntBase128 の先頭バイトが 0x80 です");
    if (value & 0xfe000000) throw new Error("UIntBase128 が大きすぎます");
    value = (value * 128) + (b & 0x7f);
    if ((b & 0x80) === 0) return value;
  }
  throw new Error("UIntBase128 が 5 バイトを超えています");
}

/* woff2 のヘッダと表の目録だけを読む（中身の展開はしない） */
export function readWoff2(buf) {
  if (buf.length < 48) throw new Error("48 バイトより小さい（ヘッダがありません）");
  const sig = buf.toString("latin1", 0, 4);
  if (sig !== "wOF2") throw new Error(`先頭が wOF2 ではありません（"${sig}"）`);
  const flavor = buf.readUInt32BE(4);
  const declared = buf.readUInt32BE(8);
  const numTables = buf.readUInt16BE(12);
  const totalSfntSize = buf.readUInt32BE(16);
  const totalCompressedSize = buf.readUInt32BE(20);
  if (declared !== buf.length) throw new Error(`ヘッダの大きさ（${declared} B）と、ファイルの大きさ（${buf.length} B）が違います`);
  if (!numTables) throw new Error("表が1つもありません");
  if (numTables > 200) throw new Error(`表が多すぎます（${numTables}）`);
  if (totalSfntSize < 100 || totalSfntSize > 64 * 1024 * 1024) throw new Error(`totalSfntSize が不自然です（${totalSfntSize}）`);

  const at = { i: 48 };
  const tables = [];
  for (let n = 0; n < numTables; n++) {
    if (at.i >= buf.length) throw new Error("表の目録が途中で終わっています");
    const flags = buf[at.i++];
    const index = flags & 0x3f;
    const transform = (flags >> 6) & 0x03;
    let tag;
    if (index === 63) {
      if (at.i + 4 > buf.length) throw new Error("タグが途中で終わっています");
      tag = buf.toString("latin1", at.i, at.i + 4); at.i += 4;
    } else {
      tag = KNOWN_TAGS[index];
      if (!tag) throw new Error(`知られていない表の番号です（${index}）`);
    }
    const origLength = readBase128(buf, at);
    /* glyf／loca は「変換あり」が既定（3 のときだけ変換なし）、それ以外は 0 のときだけ変換なし */
    const transformed = (tag === "glyf" || tag === "loca") ? transform !== 3 : transform !== 0;
    let transformLength = origLength;
    if (transformed) transformLength = readBase128(buf, at);
    tables.push({ tag, origLength, transformLength, transformed });
  }
  return {
    tableBytes: at.i - 48,          /* 表の目録のバイト数（圧縮データの始まりを出すのに使う） */
    flavor,
    flavorName: flavor === 0x00010000 ? "TrueType" : flavor === 0x4f54544f ? "CFF（OTTO）" : `その他（0x${flavor.toString(16)}）`,
    declared, numTables, totalSfntSize, totalCompressedSize,
    tables,
    tags: tables.map(t => t.tag),
  };
}


/* woff2 の中の cmap を読み、文字 → 字形があるかを調べる（brotli を解いて、表を切り出す） */
export function cmapOf(buf, w) {
  const dirEnd = 48 + w.tableBytes;           /* 表の目録の直後から、まとめて brotli で圧縮されている */
  const dataStart = dirEnd;
  const compressed = buf.subarray(dataStart, dataStart + w.totalCompressedSize);
  const plain = zlib.brotliDecompressSync(compressed);
  let at = 0;
  let cmapAt = -1, cmapLen = 0;
  for (const t of w.tables) {
    if (t.tag === "cmap") { cmapAt = at; cmapLen = t.transformLength; }
    at += t.transformLength;                  /* 表は目録の順に、その長さで並んでいる */
  }
  if (cmapAt < 0) return null;
  const c = plain.subarray(cmapAt, cmapAt + cmapLen);
  const dv = new DataView(c.buffer, c.byteOffset, c.byteLength);
  const num = dv.getUint16(2);
  const subtables = [];
  for (let i = 0; i < num; i++) {
    const o = 4 + i * 8;
    subtables.push({ platform: dv.getUint16(o), encoding: dv.getUint16(o + 2), offset: dv.getUint32(o + 4) });
  }
  const codes = new Set();
  for (const st of subtables) {
    const base = st.offset;
    if (base + 4 > c.length) continue;
    const format = dv.getUint16(base);
    if (format === 4) {                       /* BMP（よく使われる形） */
      const segX2 = dv.getUint16(base + 6), seg = segX2 / 2;
      const endAt = base + 14, startAt = endAt + segX2 + 2, deltaAt = startAt + segX2, rangeAt = deltaAt + segX2;
      for (let i = 0; i < seg; i++) {
        const end = dv.getUint16(endAt + i * 2), start = dv.getUint16(startAt + i * 2);
        const delta = dv.getInt16(deltaAt + i * 2), rangeOff = dv.getUint16(rangeAt + i * 2);
        if (start > end || start === 0xffff) continue;
        for (let cp = start; cp <= end && cp !== 0x10000; cp++) {
          let glyph;
          if (rangeOff === 0) glyph = (cp + delta) & 0xffff;
          else {
            const gAt = rangeAt + i * 2 + rangeOff + (cp - start) * 2;
            if (gAt + 2 > c.length) continue;
            glyph = dv.getUint16(gAt);
            if (glyph) glyph = (glyph + delta) & 0xffff;
          }
          if (glyph) codes.add(cp);
        }
      }
    } else if (format === 12) {               /* 4 バイトの範囲 */
      const groups = dv.getUint32(base + 12);
      for (let i = 0; i < groups; i++) {
        const o = base + 16 + i * 12;
        const start = dv.getUint32(o), end = dv.getUint32(o + 4);
        for (let cp = start; cp <= end && cp !== 0x110000; cp++) codes.add(cp);
      }
    }
  }
  return codes;
}

/* 見本に出す文字が、その書体に入っているか */
export function coverage(codes, text) {
  const missing = [...new Set([...text])].filter(ch => ch.trim() && !codes.has(ch.codePointAt(0)));
  return { text, total: [...new Set([...text])].filter(ch => ch.trim()).length, missing };
}

/* 1つの書体を、配る前の形として見る */
export function checkFont(buf, meta = {}) {
  const errors = [], warnings = [];
  const info = { ...meta, bytes: buf.length };
  if (buf.length > MAX_FONT) errors.push(`1書体 16 MiB の上限を超えています（${(buf.length / 1048576).toFixed(2)} MiB）`);
  let w = null;
  try { w = readWoff2(buf); }
  catch (e) { return { ok:false, errors:[`woff2 として読めません: ${e.message}`], warnings, info }; }
  Object.assign(info, { flavor: w.flavorName, tables: w.numTables, totalSfntSize: w.totalSfntSize });

  const need = ["cmap", "name", "head", "hhea", "hmtx", "maxp", "OS/2"];
  for (const t of need) if (!w.tags.includes(t)) errors.push(`表「${t}」がありません（ブラウザが書体として読めません）`);
  const hasOutline = w.tags.includes("glyf") && w.tags.includes("loca");
  const hasCff = w.tags.includes("CFF ") || w.tags.includes("CFF2");
  if (!hasOutline && !hasCff) errors.push("字形の表（glyf＋loca か CFF）がありません");
  if (hasOutline && hasCff) warnings.push("TrueType（glyf）と CFF の両方が入っています（どちらか一方が普通です）");
  if (["SVG ", "sbix", "CBDT", "EBDT"].some(t => w.tags.includes(t))) warnings.push("色つき書体の表が入っています（本文用としては大きくなりがちです）");
  info.outline = hasOutline ? "glyf（TrueType）" : "CFF";
  info.glyphs = w.tables.find(t => t.tag === "maxp") ? "maxp あり" : "—";

  /* 見本に出す文字（家族名の見本と同じ）が入っているか。無いと、その字だけ別の書体で出ます */
  const SAMPLE = meta.sample || "あア漢 Aa 12";
  try {
    const codes = cmapOf(buf, w);
    if (!codes || !codes.size) warnings.push("cmap から字形を取り出せませんでした（文字の有無は未確認）");
    else {
      const cov = coverage(codes, SAMPLE);
      info.cmap = codes.size;
      info.sample = cov;
      if (cov.missing.length) warnings.push(`見本の文字「${cov.missing.join("")}」が入っていません（その字だけ別の書体で表示されます）`);
    }
  } catch (e) {
    warnings.push(`cmap を読めませんでした（${e.message}・文字の有無は未確認）`);
  }
  return { ok: errors.length === 0, errors, warnings, info };
}

/* --- コマンドとして動かす --- */
if (import.meta.url === `file://${process.argv[1]}`) {
  const packs = [];
  for (const dir of ["packs", "font-packs"]) {
    const abs = path.join(HERE, dir);
    if (!fs.existsSync(abs)) continue;
    for (const n of fs.readdirSync(abs).filter(x => x.toLowerCase().endsWith(".stpack")).sort()) packs.push({ dir, file: path.posix.join(dir, n), abs: path.join(abs, n) });
  }
  if (!packs.length) { console.error("パックがありません"); process.exit(2); }

  const out = [];
  for (const p of packs) {
    const r = await verifyPack(p.abs, { trk });
    const fonts = (r.info && r.info.fonts) || [];
    if (!fonts.length) continue;
    let zipped;
    try { zipped = await openZip(fs.readFileSync(p.abs), trk); }
    catch (e) { out.push({ pack: p.file, errors:["ZIP として読めません"], warnings:[], fonts:[] }); continue; }
    const seen = new Map();
    const rows = [];
    for (const f of fonts) {
      const key = `${String(f.family).toLowerCase()}|${Number.isInteger(f.weight) ? f.weight : 400}`;
      const dup = seen.get(key);
      seen.set(key, (seen.get(key) || 0) + 1);
      let bytes = null;
      try { bytes = await zipped.read(f.file); } catch (_) { bytes = null; }
      if (!bytes) { rows.push({ ...f, ok:false, errors:[`${f.file} を ZIP から取り出せません`], warnings:[] }); continue; }
      const c = checkFont(Buffer.from(bytes), { family: f.family, file: f.file, weight: f.weight });
      if (dup && !c.warnings.some(w => w.includes("重複"))) c.warnings.push(`同じ family＋weight（${f.family} ${key.split("|")[1]}）が重複しています（アプリは1つにまとめます）`);
      rows.push({ ...f, ok: c.ok, errors: c.errors, warnings: c.warnings, info: c.info });
    }
    out.push({ pack: p.file, errors: [], warnings: [], fonts: rows });
  }

  const bad = out.filter(p => p.fonts.some(f => !f.ok)).length;
  if (asJson) console.log(JSON.stringify({ ok: bad === 0, packs: out }, null, 2));
  else {
    for (const p of out) {
      const n = p.fonts.length;
      const ng = p.fonts.filter(f => !f.ok).length;
      console.log(`${ng ? "❌" : "✅"} ${p.pack} — 書体 ${n} 件${ng ? `（${ng} 件が読めません）` : ""}`);
      for (const f of p.fonts) {
        const i = f.info || {};
        const cov = i.sample ? `・cmap ${i.cmap} 字（見本 ${i.sample.total - i.sample.missing.length}/${i.sample.total}）` : "";
        console.log(`   ${f.ok ? "✅" : "❌"} ${f.family} ${f.weight === undefined ? "" : f.weight} — ${f.file}（${i.bytes ? `${i.bytes.toLocaleString()} B` : "?"}・${i.flavor || "?"}・表 ${i.tables || "?"}${cov}）`);
        for (const e of f.errors) console.log(`      ❌ ${e}`);
        for (const w of f.warnings) console.log(`      ⚠ ${w}`);
      }
    }
  }
  process.exit(bad ? 1 : 0);
}
