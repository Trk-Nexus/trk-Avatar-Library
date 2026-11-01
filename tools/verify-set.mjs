#!/usr/bin/env node
// SPDX-License-Identifier: GPL-3.0-or-later
/* 📦 セット（`.stlib` / `.zip`）を、アプリ（trk! trk235 以降）と同じ手順で開いて確かめる（2026-11-01）

   なぜ要るか：
     `build-set --check` は「作ったものが記録と一致するか」を見ますが、
     **アプリがそのセットを開いて中身を入れられるか**は見ていませんでした。
     trk235 が `.stlib` を読めるようになったので、アプリ側の受け入れ条件（A1〜A6）を
     こちらでも同じ手順で確かめられるようにします（ブラウザが無くても、ZIP と目録の照合までは見られます）。

   見ること（trk-PWA の trk235 と同じ決めごと）：
     ・**拡張子は信じない**：先頭 4 バイトが `PK` なら ZIP として開く（`.stlib` の関連付けが無い端末のため）
     ・1 セット 1 GiB まで（超えたら開く前に断る）
     ・パスは安全な相対パスだけ（`..`・先頭 `/`・`\`・制御文字は不可）
     ・`catalog/index.json` が読める（無い・壊れている → **何も入れずに**止まる）
     ・目録の `packs[].file` を、**目録のとおりのパス**で探す（`packs/` と `font-packs/` は区別しない）
     ・中の**実バイト**で sha256 と大きさを計算し、目録と比べる（合わない 1 本は入れない・他は続ける）
     ・目録にない `.stpack` は対象にしない（数えて出す）
     ・`set.json` は任意（名前と版の**表示にだけ**使う。無い・壊れていても目録だけで動く）
     ・`README-はじめに.txt` も任意（あれば有るとして数える）

   使い方：
     node tools/verify-set.mjs dist/trk-first-set-2026-11-01-r5.stlib
     node tools/verify-set.mjs dist/trk-first-set-2026-11-01-r5.zip
     node tools/verify-set.mjs dist/…stlib --record=release/first-set.json   … 記録の大きさ・sha256 とも比べる
     node tools/verify-set.mjs dist/…stlib --json

   終了コード：0＝入れるものが全部そろって一致、1＝入れない・見つからないものがある、2＝使い方の誤り
*/
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { openZip } from "./lib/zip.mjs";

const MB = 1024 * 1024;
const MAX_SET = 1024 * MB;          /* アプリの「1 セット 1 GiB」 */
const MAX_PACK = 500 * MB;          /* アプリの「1 本 500 MB」 */
const MAX_CATALOG = 8 * MB;         /* 目録の上限（アプリ側） */
const SAFE_PATH = /^(?!\/)(?!.*(?:^|\/)\.\.(?:\/|$))[^\\\u0000-\u001f\u007f]+$/;
const sha256 = buf => crypto.createHash("sha256").update(buf).digest("hex");
const rel = p => p.split(path.sep).join("/");

/* 目録の最低限の形（アプリの sanitizeCatalog と同じ見方。ここが違えば「目録が読めません」） */
function readCatalog(json) {
  if (!json || typeof json !== "object" || Array.isArray(json)) return { error: "目録が JSON の入れ物ではありません" };
  if (json.format !== "trk-avatar-library") return { error: `目録の format が "trk-avatar-library" ではありません（"${json.format}"）` };
  if (json.version !== 1) return { error: `目録の version が 1 ではありません（"${json.version}"）` };
  if (!Array.isArray(json.packs)) return { error: "目録の packs が配列ではありません" };
  const packs = [];
  for (const p of json.packs) {
    if (!p || typeof p !== "object" || Array.isArray(p)) continue;
    const file = typeof p.file === "string" ? p.file.trim() : "";
    if (!file || !/\.stpack$/i.test(file) || !SAFE_PATH.test(file)) continue;   /* アプリはこの1件だけ落とす */
    packs.push({
      file,
      name: typeof p.name === "string" ? p.name : "",
      version: typeof p.version === "string" ? p.version : "1.0.0",
      sha256: typeof p.sha256 === "string" ? p.sha256.trim().toLowerCase() : "",
      bytes: Number.isFinite(p.bytes) ? p.bytes : null,
    });
  }
  return { catalog: json, packs, dropped: json.packs.length - packs.length };
}

export async function verifySet(bytes, opts = {}) {
  const errors = [], warnings = [], notes = [];
  const info = { bytes: bytes.length, count: { total: 0, ok: 0, mismatch: 0, bad: 0, missing: 0, stray: 0 } };
  if (bytes.length > MAX_SET) {
    errors.push(`セットが大きすぎます（${(bytes.length / MB).toFixed(1)} MB・上限 1 GiB）`);
    return { ok: false, errors, warnings, notes, info };
  }
  /* 拡張子ではなく、中身で判断する（アプリと同じ） */
  const sig = bytes.length >= 4 ? bytes.slice(0, 4) : Buffer.alloc(0);
  if (!(sig[0] === 0x50 && sig[1] === 0x4b)) {
    errors.push("ZIP として開けません（先頭が PK ではありません。拡張子ではなく中身で判断します）");
    return { ok: false, errors, warnings, notes, info };
  }
  let zipped = null;
  try {
    zipped = await openZip(bytes, opts.trk);
  } catch (e) {
    errors.push(`ZIP として開けません（${e && e.message ? e.message : e}）`);
    return { ok: false, errors, warnings, notes, info };
  }
  const names = zipped.names();
  info.entries = names.length;

  /* 安全でないパスが混ざっていないか（アプリは開く前に断る） */
  const unsafe = names.filter(n => !SAFE_PATH.test(n) || n.includes("\\") || n.startsWith("/") || n.split("/").includes(".."));
  if (unsafe.length) errors.push(`安全でないパスが ${unsafe.length} 件あります（${unsafe.slice(0, 3).join(" / ")}）`);
  const dup = names.filter((n, i) => names.indexOf(n) !== i);
  if (dup.length) warnings.push(`同じ名前のファイルが ${dup.length} 件あります（後に出てきたものだけが読まれます）`);

  /* 目録（無い・壊れている → 何も入れずに止まる） */
  const catRaw = await (async () => { try { return await zipped.read("catalog/index.json", MAX_CATALOG); } catch (_) { return null; } })();
  if (!catRaw) {
    errors.push("catalog/index.json が読めません（目録が無いセットは、何も入れずに止まります）");
    return { ok: false, errors, warnings, notes, info };
  }
  let catJson = null;
  try { catJson = JSON.parse(Buffer.from(catRaw).toString("utf8")); }
  catch (e) { errors.push("catalog/index.json が JSON として読めません（目録が壊れています）"); return { ok: false, errors, warnings, notes, info }; }
  const parsed = readCatalog(catJson);
  if (parsed.error) {
    errors.push(parsed.error);
    return { ok: false, errors, warnings, notes, info };
  }
  const packs = parsed.packs;
  info.packs = packs.length;
  if (parsed.dropped) warnings.push(`目録のうち ${parsed.dropped} 件は、形が違うのでアプリが落とします（入れません）`);

  /* 目録の各パックを、目録のとおりのパスで探して照合する */
  const results = [];
  let totalBytes = 0;
  for (const p of packs) {
    const entry = zipped.entry(p.file);
    if (!entry) { results.push({ ...p, state: "missing", reason: "セットに入っていません" }); continue; }
    let buf = null;
    try { buf = await zipped.read(p.file, MAX_PACK + 1); } catch (e) { results.push({ ...p, state: "bad", reason: "取り出せません（CRC 不一致など）" }); continue; }
    if (!buf) { results.push({ ...p, state: "bad", reason: "取り出せません" }); continue; }
    const got = { bytes: buf.length, sha256: sha256(Buffer.from(buf)) };
    if (got.bytes > MAX_PACK) { results.push({ ...p, state: "bad", reason: `1 本 500 MB を超えています（${(got.bytes / MB).toFixed(1)} MB）` }); continue; }
    const hashOk = !p.sha256 || p.sha256 === got.sha256;
    const bytesOk = p.bytes === null || p.bytes === got.bytes;
    if (!hashOk || !bytesOk) {
      results.push({ ...p, ...got, state: "mismatch",
        reason: [!hashOk ? `sha256 が違います（目録 ${p.sha256.slice(0, 12)}… / 実物 ${got.sha256.slice(0, 12)}…）` : "",
          !bytesOk ? `大きさが違います（目録 ${p.bytes} B / 実物 ${got.bytes} B）` : ""].filter(Boolean).join("・") });
      continue;
    }
    totalBytes += got.bytes;
    results.push({ ...p, ...got, state: "ok" });
  }

  /* 目録にない .stpack（アプリは対象にしない。数えて出す） */
  const listed = new Set(packs.map(p => p.file));
  const stray = names.filter(n => /\.stpack$/i.test(n) && !listed.has(n) && !n.startsWith("__MACOSX/"));
  const count = {
    total: packs.length,
    ok: results.filter(r => r.state === "ok").length,
    mismatch: results.filter(r => r.state === "mismatch").length,
    bad: results.filter(r => r.state === "bad").length,
    missing: results.filter(r => r.state === "missing").length,
    stray: stray.length,
  };
  info.count = count;
  info.totalBytes = totalBytes;
  info.results = results;
  info.stray = stray;

  /* set.json（任意・表示にだけ使う。壊れていても止めない） */
  const setRaw = await (async () => { try { return await zipped.read("set.json", MB); } catch (_) { return null; } })();
  info.set = null;
  if (setRaw) {
    try {
      const s = JSON.parse(Buffer.from(setRaw).toString("utf8"));
      if (!s || typeof s !== "object" || Array.isArray(s)) throw new Error("入れ物ではありません");
      info.set = {
        name: typeof s.name === "string" ? s.name : "",
        release: typeof s.release === "string" ? s.release : (typeof s.rev === "string" ? s.rev : ""),
        format: typeof s.format === "string" ? s.format : "",
        version: s.version,
      };
      if (s.format !== "trk-set") warnings.push(`set.json の format が "trk-set" ではありません（"${s.format}"）。表示にだけ使うので、入れられはします`);
      if (s.version !== 1) warnings.push(`set.json の version が 1 ではありません（"${s.version}"）`);
      if (Array.isArray(s.packs) && s.packs.length && s.packs.length !== packs.length) {
        notes.push(`set.json の packs は ${s.packs.length} 件、目録は ${packs.length} 件です（アプリは目録を正にします）`);
      }
    } catch (e) {
      warnings.push(`set.json が読めません（${e && e.message ? e.message : e}）。無いものとして目録だけで動きます`);
    }
  } else {
    notes.push("set.json がありません（任意。無くても目録だけで入れられます）");
  }
  info.guide = zipped.has("README-はじめに.txt");

  /* 記録（release/first-set.json）との一致（--record を付けたときだけ） */
  if (opts.record) {
    const rec = JSON.parse(fs.readFileSync(opts.record, "utf8"));
    const digest = sha256(bytes);
    const outs = Array.isArray(rec.files_out) && rec.files_out.length ? rec.files_out : [{ name: rec.file, bytes: rec.bytes, sha256: rec.sha256 }];
    const ext = (opts.fileName || "").split(".").pop() || "";
    /* 同じ中身を .zip と .stlib の 2 つで配っているので、いま見ている名前の拡張子を優先して照合する */
    const same = outs.filter(o => o.sha256 === digest && o.bytes === bytes.length);
    const hit = same.find(o => (o.name.split(".").pop() || "") === ext) || same[0];
    info.record = { file: rec.file, bytes: rec.bytes, sha256: rec.sha256, matched: !!hit, matchedAs: hit ? hit.name : "" };
    if (!hit) {
      errors.push(`記録（${rel(opts.record)}）と一致しません（実物 ${bytes.length} B・${digest.slice(0, 12)}…）`);
    }
  }

  if (count.ok === 0) errors.push("入れるものが 1 本もありません（目録とセットの中身が合っていません）");
  if (count.mismatch || count.bad || count.missing) {
    errors.push(`入れられない ${count.mismatch + count.bad + count.missing} 本（sha256・大きさの不一致 ${count.mismatch}・読めない ${count.bad}・入っていない ${count.missing}）`);
  }
  return { ok: errors.length === 0, errors, warnings, notes, info };
}

/* --- コマンドとして動かす --- */
if (import.meta.url === `file://${process.argv[1]}`) {
  const argv = process.argv.slice(2);
  const asJson = argv.includes("--json");
  const rest = argv.filter(a => !a.startsWith("--"));
  const record = (argv.find(a => a.startsWith("--record=")) || "").slice(9) || "";
  const trk = (argv.find(a => a.startsWith("--trk=")) || "").slice(6) || undefined;
  if (argv.includes("--help") || argv.includes("-h") || rest.length !== 1) {
    console.log(`使い方: node tools/verify-set.mjs <セット（.stlib / .zip）> [--record=release/first-set.json] [--json] [--trk=/path/to/trk-PWA]
  `.trim());
    console.log("  セットは 1 つだけ指定してください（アプリと同じく、拡張子ではなく中身で ZIP かどうかを見ます）");
    process.exit(rest.length === 1 ? 0 : 2);
  }
  const shown = rest[0];
  const file = path.resolve(shown);
  if (!fs.existsSync(file)) { console.error(`❌ セットがありません: ${shown}`); process.exit(2); }
  let r;
  try {
    r = await verifySet(fs.readFileSync(file), { trk, record: record ? path.resolve(record) : "", fileName: path.basename(file) });
  } catch (e) {
    console.error(`❌ ${e && e.message ? e.message : e}`);
    process.exit(2);
  }
  if (asJson) { console.log(JSON.stringify(r, null, 2)); process.exit(r.ok ? 0 : 1); }
  const i = r.info, c = i.count;
  console.log(`${r.ok ? "✅" : "❌"} ${shown}（${i.bytes.toLocaleString()} B${i.entries !== undefined ? `・${i.entries} ファイル` : ""}）`);
  if (i.set) console.log(`   セット名: 「${i.set.name || "（名前なし）"}」${i.set.release ? `（${i.set.release}）` : ""}`);
  if (c) {
    console.log(`   目録 ${c.total} 本 → 入れる ${c.ok} 本（合計 ${i.totalBytes.toLocaleString()} B）／入れない ${c.mismatch + c.bad} 本／入っていない ${c.missing} 本／目録にない ${c.stray} 本`);
    if (i.guide) console.log("   README-はじめに.txt: あり");
    for (const x of i.results.filter(y => y.state !== "ok")) console.log(`     ❌ ${x.file} — ${x.reason}`);
    for (const s of i.stray.slice(0, 3)) console.log(`     ℹ 目録にない: ${s}`);
    if (c.stray > 3) console.log(`     ℹ 目録にない: ほか ${c.stray - 3} 件`);
  }
  if (i.record) console.log(`   記録: ${i.record.matched ? `一致（${i.record.matchedAs}）` : "一致しません"}`);
  for (const n of r.notes) console.log(`   ℹ ${n}`);
  for (const w of r.warnings) console.log(`   ⚠ ${w}`);
  for (const e of r.errors) console.log(`   ❌ ${e}`);
  process.exit(r.ok ? 0 : 1);
}
