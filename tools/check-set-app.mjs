#!/usr/bin/env node
// SPDX-License-Identifier: GPL-3.0-or-later
/* 🤝 セットを「アプリ自身の判定」でも受け入れる（2026-11-01・trk-PWA の trk239 から）

   なぜ要るか：
     この倉庫の `tools/verify-set.mjs` は**倉庫側の決めごと**（目録の形・実バイトの sha256・内訳）で検査します。
     trk-PWA の trk239 から、**アプリのコード（js/zip-io.js と js/pack-catalog.js）をそのまま読み込んで**
     同じセットを開き「アプリが何と表示するか」を出す `tools/check-set.mjs` が向こうに置かれました。
     2 つは見る角度が違う（倉庫の決めごと／アプリの表示）ので、**両方通してから配ります**。

   すること：
     相手側の `tools/check-set.mjs` を、そのまま呼びます（写しを持たない＝向こうが直れば追随します）。
     2 つ目を選んだときの「これから入る分／飛ばす分」も見たいときは `--have=<もう 1 つのセット>` を渡すと、
     そのセットの中の `catalog/index.json` を一時ファイルに取り出して、向こうの `--have` に渡します。

   使い方：
     node tools/check-set-app.mjs dist/trk-first-set-….stlib
     node tools/check-set-app.mjs dist/trk-font-set-….stlib --have=dist/trk-first-set-….stlib
     node tools/check-set-app.mjs <セット> --hash          … 1 本ずつの実バイトの sha256 まで見る
     （trk-PWA の場所は --trk=… か 環境変数 TRK_PWA。既定は ../trk-PWA）

   終了コード：0＝アプリでそのまま入れられる、1＝食い違い、2＝開けない・相手側の道具が無い
*/
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
const file = argv.find(a => !a.startsWith("--"));

function usage() {
  console.log("使い方: node tools/check-set-app.mjs <セット.stlib|.zip> [--have=<もう1つのセット>] [--hash] [--trk=/path/to/trk-PWA]");
}

if (!file || argv.includes("--help") || argv.includes("-h")) { usage(); process.exit(file ? 0 : 2); }

const tool = path.join(path.resolve(trk), "tools/check-set.mjs");
if (!fs.existsSync(tool)) {
  console.error(`❌ 相手側（trk-PWA）の tools/check-set.mjs が見つかりません: ${tool}`);
  console.error("   trk239 以降の trk-PWA を --trk=/path/to/trk-PWA で指定してください（この検査は「あるときだけ」走らせます）");
  process.exit(2);
}
if (!fs.existsSync(file)) { console.error(`❌ セットがありません: ${file}`); process.exit(2); }

/* --have：もう 1 つのセットの中の目録を、一時ファイルに取り出す（向こうの --have は「目録の JSON」を取る） */
let tmpDir = "", haveArg = "";
if (have) {
  if (!fs.existsSync(have)) { console.error(`❌ --have のセットがありません: ${have}`); process.exit(2); }
  try {
    const zipped = await openZip(fs.readFileSync(have), trk);
    const buf = await zipped.read("catalog/index.json", 8 * 1024 * 1024);
    if (!buf) throw new Error("catalog/index.json が入っていません");
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "trk-have-"));
    haveArg = path.join(tmpDir, "catalog.json");
    fs.writeFileSync(haveArg, Buffer.from(buf));
  } catch (e) {
    console.error(`❌ --have のセットから目録を取り出せません: ${e && e.message ? e.message : e}`);
    process.exit(2);
  }
}

const args = [tool, path.resolve(file), ...(wantHash ? ["--hash"] : []), ...(haveArg ? [`--have=${haveArg}`] : [])];
const r = spawnSync(process.execPath, args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
if (r.stdout) process.stdout.write(r.stdout);
if (r.stderr) process.stderr.write(r.stderr);
if (tmpDir) fs.rmSync(tmpDir, { recursive: true, force: true });
if (r.error) { console.error(`❌ 相手側の道具を動かせませんでした: ${r.error.message}`); process.exit(2); }
process.exit(typeof r.status === "number" ? r.status : 1);
