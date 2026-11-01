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
     set.json               … セットの名前と版（trk-PWA の trk235 が表示にだけ使う・2026-11-01 追加）
     gallery/all-skins.html … 全スキン見本
     gallery/fonts.html     … 書体の一覧と検索（L13／L14）
     catalog/index.json     … 目録
     font-packs/*.stpack    … パック（セットの中身は sets/*.json で決める）

   2 つの名前で配る（2026-11-01・trk-PWA の trk235 からのお願い）：
     定義に "extensions": ["zip", "stlib"] と書くと、**同じバイト列**を両方の名前で書きます。
     .stlib は trk235 以降が「そのまま選ぶ」だけで入れられます（.zip は展開してから）。
     中身が同じなので sha256 も同じです（記録にも files_out として両方残します）。

   目録は「セットに入っているパック」だけに絞って入れます（2026-11-01・r6 の 2 分割のため）：
     アプリ（trk235 以降）は目録の packs[] を 1 本ずつ探すので、入っていないパックが載っていると
     「見つからない n 件」になります。セットは「そのセットで配るものの一覧」なので、目録も同じ範囲にします。
     絞らなくてよいとき（全部入れるセット）は、倉庫の catalog/index.json をそのまま入れます（バイト列も同じ）。
     `"scopeCatalog": false` で、この動きを止められます。

   決定的：同じ中身なら同じ sha256（無圧縮で固定・README-はじめに.txt に時刻を入れない）。
  同じ日にもう一度配るときは、定義に "rev": "r2" を足します（ファイル名とタグの後ろに付き、前のセットを上書きしません）。
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
function guideText(cfg, entries, records, exts, scoped) {
  const packNames = records.filter(r => /\.stpack$/.test(r.path)).map(r => path.basename(r.path));
  const galleries = entries.filter(f => /^gallery\//.test(f)).map(f => path.basename(f));
  return [
    `${cfg.title || "trk! はじめてセット"}（${cfg.date}${cfg.rev ? ` ${cfg.rev}` : ""}）`,
    "=".repeat(60),
    "",
    "trk!（trk-PWA）の見た目を、まとめて持ち込むためのセットです。",
    "",
    "■ はじめの3手順",
    "",
    "  ① 見本を見る",
    `     gallery/all-skins.html をダブルクリック（ブラウザで開くだけ。オフラインOK）`,
    `     書体を選ぶときは gallery/fonts.html（名前・対応字数・大きさ・雰囲気で絞れます）`,
    "",
    "  ② 展開する",
    `     このZIPを展開すると、この説明のほかに ${entries.length + 1} 個（フォルダごと）が出てきます。`,
    ...entries.map(n => `       ${n}`),
    "       set.json（セットの名前と版。trk235 以降のアプリが表示にだけ使います）",
    "     そのうちアプリに入れるのは catalog/index.json と .stpack です",
    ...(galleries.includes("packs.html")
      ? [`     （gallery/ の ${galleries.length} つは、ブラウザで見る見本です。fonts.html は書体の一覧と検索、packs.html はパックごとの中身）`]
      : [`     （gallery/ の ${galleries.length} つは、ブラウザで見る見本です。fonts.html は書体の一覧と検索）`]),
    "",
    "  ③ trk! に入れる（trk231 以降）",
    "     trk235 以降：設定 → 📦 カスタムパック → 📚 目録から入れる → 📦 セット（.stlib / .zip）を選ぶ",
    "       → この 1 ファイルを選ぶだけで、中のパックがまとめて入ります（.stlib のまま／.zip のまま）",
    "     trk231〜trk234：設定 → 📦 カスタムパック → 📚 目録から入れる → 📥 まとめて入れる",
    "     展開した中の catalog/index.json と、packs/・font-packs/ の .stpack を「まとめて選ぶ」",
    "     （大きさと sha256 が目録と合わないものは入りません。入れたものは一覧の行の「使う」で適用）",
    "",
    "  trk230 の場合は「📚 目録（index.json）を選ぶ」→ 一覧の行ごとに「この .stpack を選ぶ」で入ります。",
    "",
    "  アプリが読むのは catalog/index.json と、その packs[].file が指す .stpack だけです。",
    `  gallery/（見本 ${galleries.length} 枚）と set.json は読まなくても動きます（将来 gallery/ を増やしても、入れ方には影響しません）。`,
    "",
    ...(scoped ? [
      `  目録（catalog/index.json）は、このセットに入っている ${scoped.count} パックだけを載せています`,
      "  （アプリは目録の packs[] を 1 本ずつ探すので、入っていないパックが載っていると「見つからない」になります）。",
      "  gallery/ の一覧には、セットに入っていない書体も載っています（1 本ずつ欲しいときは、書体セットか倉庫の font-packs/ から）。",
      "",
    ] : []),
    "■ 入っているもの",
    "",
    ...records.map(r => `  ${r.path}  ${fmt(r.bytes)}  sha256 ${r.sha256}`),
    "",
    ...(exts && exts.length > 1 ? [
      "■ 2 つの名前で配っています",
      "",
      `  同じ中身を ${exts.map(e => "." + e).join(" と ")} の 2 つの名前で置いています（中身は同じ・sha256 も同じ）。`,
      "  trk235 以降のアプリは .stlib をそのまま選ぶだけで入れられます。",
      "  それより前のアプリでは .zip を展開して、中の目録と .stpack を選んでください。",
      "",
    ] : []),
    "■ 書体について",
    "",
    "  font-packs/ の書体パックは、OFL-1.1 の書体（woff2）を同梱しています。",
    "  どの書体を選ぶかは gallery/fonts.html（名前・対応字数・大きさ・雰囲気で絞れます）で決められます。",
    "  1 本だけ欲しいときは、その 1 本の .stpack と catalog/index.json だけで入れられます。",
    "  ライセンス全文は、パックの中の fonts/OFL.txt にあります（目録の fonts[].licenseFile）。",
    "  書体が画面に効くのは trk! trk232 以降です（それまでは色とノーツの色だけが変わります）。",
    "  入れて「使う」を押すと本文の書体が変わり、外すと元に戻ります。",
    "",
    "■ 権利",
    "",
    "  このセットの作り（目録・見本・説明）: GPL-3.0-or-later",
    "  パックごとの権利は packs の pack.json の license、同梱した書体は上記のライセンスに従います。",
    "",
    "■ 出どころ",
    "",
    "  https://github.com/TonbokiriRaikiriMuramasa-Taikoubou/trk-Avatar-Library",
    `  セットの名前: ${cfg.title || cfg.name}（アプリに入れるのは ${packNames.length} パック）`,
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

  /* 目録は「このセットに入っているパック」だけに絞る（理由は冒頭のコメント）。
     絞る必要が無いときは、倉庫のファイルをそのまま使う（バイト列も変えない＝r5 までと同じ） */
  const CATALOG = "catalog/index.json";
  const packFiles = new Set(files.filter(f => f.endsWith(".stpack")));
  let catalogBuf = null, scopedInfo = null;
  const readFileBuf = f => fs.readFileSync(path.join(HERE, f));
  if (files.includes(CATALOG) && cfg.scopeCatalog !== false) {
    const original = readFileBuf(CATALOG);
    const raw = JSON.parse(original.toString("utf8"));
    const all = Array.isArray(raw.packs) ? raw.packs : [];
    const kept = all.filter(p => packFiles.has(String(p.file || "")));
    if (kept.length !== all.length) {
      const text = JSON.stringify({ ...raw, packs: kept }, null, 2) + "\n";
      catalogBuf = Buffer.from(text, "utf8");
      scopedInfo = { count: kept.length, dropped: all.length - kept.length, source: { bytes: original.length, sha256: sha256(original) } };
    }
  }
  const bufOf = f => (f === CATALOG && catalogBuf ? catalogBuf : readFileBuf(f));

  const records = files
    .map(f => {
      const buf = bufOf(f);
      return { path: f, bytes: buf.length, sha256: sha256(buf),
        ...(f === CATALOG && scopedInfo ? { scoped: true, source: scopedInfo.source } : {}) };
    });

  const rev = cfg.rev ? String(cfg.rev).replace(/[^A-Za-z0-9._-]/g, "") : "";
  const exts = (Array.isArray(cfg.extensions) && cfg.extensions.length ? cfg.extensions : [cfg.extension || "zip"])
    .map(e => String(e).replace(/[^A-Za-z0-9]/g, "").toLowerCase() || "zip");
  const guide = guideText(cfg, files, records, exts, scopedInfo);
  /* set.json（任意・trk235 以降のアプリが表示にだけ使う。無くても動く）。
     形式は trk-PWA の手紙（2026-11-01 §3-3）に合わせ、こちらが持っている「rev」も併記します。 */
  const setJson = {
    format: "trk-set",
    version: 1,
    name: cfg.title || "trk! はじめてセット",
    release: rev,
    rev,
    packs,
    note: cfg.note || "",
  };
  const entries = [
    { name: cfg.readme || "README-はじめに.txt", buf: Buffer.from(guide, "utf8") },
    { name: "set.json", buf: Buffer.from(JSON.stringify(setJson, null, 2) + "\n", "utf8") },
    ...files.map(f => ({ name: f, buf: bufOf(f) })),
  ];
  const zipIO = loadZipIO(opts.trk);
  const blob = await zipIO.zipWrite(entries.map(e => ({ name: e.name, blob: new Blob([e.buf]) })));
  const bytes = Buffer.from(await blob.arrayBuffer());

  const base = `trk-${cfg.name}-${cfg.date}${rev ? `-${rev}` : ""}`;
  const outDir = path.resolve(opts.out || path.join(HERE, "dist"));
  /* 同じバイト列を、拡張子だけ変えて複数の名前で書く（.stlib は trk235 以降がそのまま選べる） */
  const outs = exts.map(ext => ({ ext, file: `${base}.${ext}`, out: path.join(outDir, `${base}.${ext}`) }));
  const digest = sha256(bytes);
  const record = {
    name: cfg.name,
    title: cfg.title || "",
    date: cfg.date,
    tag: cfg.tag || `first-set-${cfg.date}${rev ? `-${rev}` : ""}`,
    file: outs[0].file,
    bytes: bytes.length,
    sha256: digest,
    ...(outs.length > 1 ? { files_out: outs.map(o => ({ name: o.file, bytes: bytes.length, sha256: digest })) } : {}),
    files: records,
    note: cfg.note || "",
  };
  return { out: outs[0].out, outs, bytes, record, records, cfg };
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
    const sameOut = JSON.stringify(rec.files_out || null) === JSON.stringify(built.record.files_out || null);
    const same = rec.sha256 === built.record.sha256 && rec.bytes === built.record.bytes
      && JSON.stringify(rec.files) === JSON.stringify(built.record.files) && sameOut;
    if (opts.json) console.log(JSON.stringify({ ok: same, record: rec, built: built.record }, null, 2));
    else if (same) console.log(`✅ ${built.record.file} は記録と合っています（${built.record.bytes.toLocaleString()} B・sha256 ${built.record.sha256.slice(0, 12)}…）`);
    else console.log(`❌ ${built.record.file} が記録と合っていません。node tools/build-set.mjs ${rel(cfgPath)} --release で作り直してください`);
    process.exit(same ? 0 : 1);
  }

  for (const o of built.outs) {
    fs.mkdirSync(path.dirname(o.out), { recursive: true });
    fs.writeFileSync(o.out, built.bytes);
  }
  if (opts.release) {
    fs.mkdirSync(path.dirname(recordPath), { recursive: true });
    fs.writeFileSync(recordPath, JSON.stringify(built.record, null, 2) + "\n", "utf8");
  }
  if (opts.json) { console.log(JSON.stringify({ ...built.record, out: rel(built.out), outs: built.outs.map(o => rel(o.out)) }, null, 2)); process.exit(0); }
  console.log(`✅ ${built.outs.map(o => rel(o.out)).join(" / ")}（${built.record.bytes.toLocaleString()} B・${built.record.files.length + 2} ファイル・sha256 ${built.record.sha256}）`);
  for (const r of built.records) console.log(`   + ${r.path}  ${fmt(r.bytes)}`);
  if (opts.release) console.log(`   記録: ${rel(recordPath)}`);
  else console.log("   （配るなら --release を付けて、記録も書いてください）");
}

main().catch(err => {
  console.error(`❌ ${err && err.message ? err.message : err}`);
  process.exit(1);
});
