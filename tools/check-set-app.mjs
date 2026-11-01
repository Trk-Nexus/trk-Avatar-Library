#!/usr/bin/env node
// SPDX-License-Identifier: GPL-3.0-or-later
/* 🤝 セットを「アプリ自身の判定」でも受け入れる（2026-11-01・trk-PWA の trk239 から／trk240 で --json）

   なぜ要るか：
     この倉庫の `tools/verify-set.mjs` は**倉庫側の決めごと**（目録の形・実バイトの sha256・内訳）で検査します。
     trk-PWA の trk239 から、**アプリのコード（js/zip-io.js と js/pack-catalog.js）をそのまま読み込んで**
     同じセットを開き「アプリが何と表示するか」を出す `tools/check-set.mjs` が向こうに置かれました。
     2 つは見る角度が違う（倉庫の決めごと／アプリの表示）ので、**両方通してから配ります**。

   すること：
     相手側の `tools/check-set.mjs` を、そのまま呼びます（写しを持たない＝向こうが直れば追随します）。
     trk240 からは `--json` があるので、**日本語の文を読まずに数字で**判定します
     （無い版＝trk239 でもそのまま動きます。`--json` を知らない版は、そのまま素通りします）。

   2 つ続けて入れるとき：
     `--have=<もう 1 つのセット>` を渡すと、そのセットの中の `catalog/index.json` を取り出して、
     向こうの `--have` に渡し「これから入る分／飛ばす分」（`setPending`）を出させます。
     `--both` を付けると、**2 つを逆の順でも**数えます（書体セットを先に入れた人が、あとから
     はじめてセットを選んだときに何が入るか）。どちらも「食い違えば赤」です。

   使い方：
     node tools/check-set-app.mjs dist/trk-first-set-….stlib
     node tools/check-set-app.mjs dist/trk-font-set-….stlib --have=dist/trk-first-set-….stlib
     node tools/check-set-app.mjs dist/trk-font-set-….stlib --have=dist/trk-first-set-….stlib --both
     node tools/check-set-app.mjs <セット> --hash          … 1 本ずつの実バイトの sha256 まで見る
     node tools/check-set-app.mjs <セット> --verbose       … 向こうの文（人が読む形）もそのまま出す
     （trk-PWA の場所は --trk=… か 環境変数 TRK_PWA。既定は ../trk-PWA）

   終了コード：0＝アプリでそのまま入れられる、1＝食い違い、2＝開けない・相手側の道具が無い

   ── 契約（返事9 の §4-1・`check-set.mjs` version 2）────────────────────
     ① 呼び方 ② 終了コード（0/1/2）③ `--json` の項目 ④ `--have` の形 は向こうが固定しています。
     こちらは**その 4 つに寄りかかる**ので、`tools/selftest.mjs` が毎回その形を確かめます。
     向こうが「増やす」ぶんには赤にしません（知らない項目は読み飛ばす）。「減らす・意味を変える」ときだけ、
     こちらが「契約が変わりました」と言って止まります（黙って通さない）。
*───────────────────────────────────────────────────────────────────── */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { openZip } from "./lib/zip.mjs";

const HERE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const argv = process.argv.slice(2);
const trk = (argv.find(a => a.startsWith("--trk=")) || "").slice("--trk=".length)
  || process.env.TRK_PWA || path.resolve(HERE, "..", "trk-PWA");
const have = (argv.find(a => a.startsWith("--have=")) || "").slice("--have=".length);
const wantHash = argv.includes("--hash");
const both = argv.includes("--both");
const verbose = argv.includes("--verbose");
const file = argv.find(a => !a.startsWith("--"));

function usage() {
  console.log("使い方: node tools/check-set-app.mjs <セット.stlib|.zip> [--have=<もう1つのセット>] [--both] [--hash] [--verbose] [--trk=/path/to/trk-PWA]");
}
if (!file || argv.includes("--help") || argv.includes("-h")) { usage(); process.exit(file ? 0 : 2); }

const tool = path.join(path.resolve(trk), "tools/check-set.mjs");
if (!fs.existsSync(tool)) {
  console.error(`❌ 相手側（trk-PWA）の tools/check-set.mjs が見つかりません: ${tool}`);
  console.error("   trk239 以降の trk-PWA を --trk=/path/to/trk-PWA で指定してください（この検査は「あるときだけ」走らせます）");
  process.exit(2);
}
if (!fs.existsSync(file)) { console.error(`❌ セットがありません: ${file}`); process.exit(2); }
if (have && !fs.existsSync(have)) { console.error(`❌ --have のセットがありません: ${have}`); process.exit(2); }
if (both && !have) { console.error("❌ --both は --have=<もう 1 つのセット> と一緒に使います"); process.exit(2); }

/* 人が読む大きさ（向こうの formatBytes とだいたい同じ見え方） */
function fmtBytes(n) {
  const v = Number(n) || 0;
  if (v >= 1024 * 1024) return `${(v / (1024 * 1024)).toFixed(1)} MB`;
  if (v >= 1024) return `${Math.round(v / 1024)} KB`;
  return `${v} B`;
}
const base = p => path.basename(p);

/* セットの中の目録（catalog/index.json）を、一時ファイルに取り出す（向こうの --have は「目録の JSON」を取る） */
const tmpDirs = [];
function catalogOf(setPath) {
  try {
    const zipped = openZip(fs.readFileSync(setPath), trk);
    return Promise.resolve(zipped).then(async z => {
      const buf = await z.read("catalog/index.json", 8 * 1024 * 1024);
      if (!buf) throw new Error("catalog/index.json が入っていません");
      const dir = fs.mkdtempSync(path.join(os.tmpdir(), "trk-have-"));
      tmpDirs.push(dir);
      const out = path.join(dir, "catalog.json");
      fs.writeFileSync(out, Buffer.from(buf));
      return out;
    });
  } catch (e) {
    return Promise.reject(e);
  }
}

/* 向こうの道具を 1 回呼ぶ（--json を必ず付ける。知らない版は素通りするだけで壊れない） */
function callTool(setPath, havePath) {
  const args = [tool, path.resolve(setPath), "--json", ...(wantHash ? ["--hash"] : []), ...(havePath ? [`--have=${havePath}`] : [])];
  const r = spawnSync(process.execPath, args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  if (r.error) return { status: 2, raw: "", json: null, error: r.error.message };
  const raw = String(r.stdout || "");
  let json = null;
  /* 1 行の JSON が決まり。増えた行（注意書きなど）に備えて、後ろから JSON を探す */
  for (const line of raw.split("\n").map(s => s.trim()).filter(Boolean).reverse()) {
    if (!line.startsWith("{")) continue;
    try {
      const o = JSON.parse(line);
      if (o && o.tool === "check-set") { json = o; break; }
    } catch (_) { /* JSON でない行は読み飛ばす */ }
  }
  return { status: typeof r.status === "number" ? r.status : 1, raw, json, stderr: String(r.stderr || "") };
}

/* 結果を日本語 3〜5 行に畳む。problems が 1 つでもあれば「こちら側で気づいた食い違い」として赤にする。
   （終了コードは向こうの契約。`--json` の ok と食い違ったときは、その食い違いこそ知らせたい） */
function report(setPath, havePath, res) {
  const problems = [];
  let saidOk = false;   /* 向こうの文に「そろっています」が入っていれば、二度は言わない */
  const okByStatus = res.status === 0;
  if (res.json) {
    const j = res.json;
    const version = Number(j.version) || 1;
    if (verbose) console.log(res.raw.trimEnd());
    console.log(`${okByStatus ? "✅" : "❌"} アプリの判定（--json・version ${version}）：${j.file || base(setPath)}（${fmtBytes(j.bytes)}）／中身 ${j.entries || 0} エントリ`);
    if (j.name) console.log(`   セット名：「${j.name}」${j.release ? `（${j.release}）` : ""}`);
    if (j.reason) console.log(`   開けない理由：${j.reason}`);
    const cat = j.catalog || {};
    const packs = Array.isArray(j.packs) ? j.packs : [];
    const missing = Array.isArray(j.missing) ? j.missing : [];
    const inBytes = packs.filter(p => p.ok).reduce((n, p) => n + (Number(p.bytes) || 0), 0);
    console.log(`   目録 ${cat.packs || 0} 本 → 入れる ${packs.filter(p => p.ok).length} 本（${fmtBytes(inBytes)}）` +
      `／入っていない ${missing.length} 本／問題 ${Number(j.problems) || 0} 件`);
    if (j.ok !== okByStatus) problems.push(`--json の ok=${j.ok} と終了コード ${res.status} が食い違っています（契約 ③）`);
    if (okByStatus && Number(j.problems) > 0) problems.push(`終了コードは 0 ですが problems=${j.problems} です（契約 ③）`);
    if (havePath) {
      const p = j.pending;
      if (!p || typeof p.count !== "number" || typeof p.bytes !== "number" || typeof p.skip !== "number") {
        problems.push("--have を渡したのに pending（count／bytes／skip）が返りません（契約 ③）");
      } else {
        console.log(`🔁 ${base(havePath)} を入れた後に選ぶと：これから入る ${p.count} 本（${fmtBytes(p.bytes)}）／飛ばす ${p.skip} 本`);
        if (Array.isArray(p.ids) && p.ids.length) console.log(`   入る：${p.ids.join("・")}`);
      }
    }
    if (!okByStatus) {
      for (const row of packs.filter(p => !p.ok)) console.log(`   ❌ ${row.id}（${row.file}）← ${row.reason}`);
      for (const m of missing) console.log(`   ❌ 入っていません：${m.id}（${m.file}）`);
    }
  } else {
    /* trk239 以前：人が読む文しか無い。文をそのまま出して、終了コードで判定する */
    if (res.raw) console.log(res.raw.trimEnd());
    console.log(`ℹ 相手側の tools/check-set.mjs は --json を知りません（trk240 より前）。人が読む文と終了コードで判定しました`);
    if (havePath && !/これから入る/.test(res.raw)) {
      problems.push("--have を渡したのに「これから入る」が出ていません（契約 ③）");
    }
    saidOk = /そろっています/.test(res.raw);
  }
  if (!okByStatus) problems.push(`終了コード ${res.status}（0 ではありません）`);
  if (res.stderr && (verbose || !okByStatus)) process.stderr.write(res.stderr);
  for (const p of problems) console.log(`❌ ${p}`);
  if (okByStatus && !problems.length && !saidOk) console.log("✅ 目録と中身がそろっています（アプリでそのまま入れられます）");
  /* 終了コードは向こうの契約に合わせる：2＝アプリでも開けない／1＝食い違い（こちらが見つけた分も含む） */
  return { ok: problems.length === 0, status: res.status };
}

const results = [];
let catFail = "";
if (both) {
  /* 2 つを、両方の順で数える（どちらが先でも「これから入る分」が正しく出るか） */
  const a = path.resolve(file), b = path.resolve(have);
  try {
    const catA = await catalogOf(a), catB = await catalogOf(b);
    console.log(`—— ${base(a)} を先に入れて、${base(b)} を選ぶ`);
    results.push(report(b, a, callTool(b, catA)));
    console.log(`—— ${base(b)} を先に入れて、${base(a)} を選ぶ`);
    results.push(report(a, b, callTool(a, catB)));
  } catch (e) { catFail = e && e.message ? e.message : String(e); }
} else {
  try {
    const haveArg = have ? await catalogOf(have) : "";
    results.push(report(file, have, callTool(file, haveArg)));
  } catch (e) { catFail = e && e.message ? e.message : String(e); }
}
if (catFail) {
  for (const d of tmpDirs) fs.rmSync(d, { recursive: true, force: true });
  console.error(`❌ セットから目録を取り出せません（--have に渡すため）: ${catFail}`);
  process.exit(2);
}
for (const d of tmpDirs) fs.rmSync(d, { recursive: true, force: true });
/* 2＝開けない（いちばん重い）／1＝食い違い／0＝通った */
process.exit(results.some(r => r.status === 2) ? 2 : results.every(r => r.ok) ? 0 : 1);
