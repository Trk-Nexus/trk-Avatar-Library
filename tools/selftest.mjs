#!/usr/bin/env node
// SPDX-License-Identifier: GPL-3.0-or-later
/* 🧪 この倉庫の道具が「ちゃんと断る」ことを確かめる（2026-10-31）

   合格するパックと、わざと壊したパックを作って、`verifyPack` の判定を見ます。
   ブラウザも端末も要りません。Node 18 以降だけ。

     node tools/selftest.mjs
     node tools/selftest.mjs --keep     … 途中で作ったファイルを残す（手で見たいとき）
*/
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import { verifyPack } from "./verify-pack.mjs";
import { loadZipIO } from "./lib/zip.mjs";

const keep = process.argv.includes("--keep");
const trk = (process.argv.find(a => a.startsWith("--trk=")) || "").slice(6) || undefined;
const work = fs.mkdtempSync(path.join(os.tmpdir(), "trk-lib-selftest-"));

const zipIO = loadZipIO(trk);
async function makePack(name, files) {
  const entries = Object.entries(files).map(([n, v]) => ({
    name: n, blob: new Blob([typeof v === "string" ? v : JSON.stringify(v)]),
  }));
  const blob = await zipIO.zipWrite(entries);
  const file = path.join(work, name);
  fs.writeFileSync(file, Buffer.from(await blob.arrayBuffer()));
  return file;
}

const goodManifest = () => ({
  format: "shadow-taiko-pack", version: 1, name: "試験用パック", author: "selftest",
  description: "道具の検査用", license: "GPL-3.0-or-later",
  skin: { name: "試験", colors: { bg: "#101010", panel: "#181818", text: "#f0f0f0", accent: "#ff3b55", gold: "#ffd166" } },
});

const results = [];
const expect = async (label, file, shouldPass, needle) => {
  const r = await verifyPack(file, { trk });
  const all = [...r.errors, ...r.warnings].join(" / ");
  const ok = shouldPass ? r.ok : (!r.ok && (!needle || all.includes(needle)));
  results.push({ label, ok, detail: ok ? "" : `ok=${r.ok} ${all}` });
  console.log(`${ok ? "✅" : "❌"} ${label}${ok ? "" : `  ← ok=${r.ok} ${all}`}`);
};

console.log(`作業フォルダ: ${work}\n`);

await expect("正しいパックは合格", await makePack("good.stpack", { "pack.json": goodManifest() }), true);

await expect("pack.json がないと不合格",
  await makePack("no-manifest.stpack", { "skin.txt": "x" }), false, "pack.json がありません");

await expect("format が違うと不合格",
  await makePack("bad-format.stpack", { "pack.json": { ...goodManifest(), format: "something-else" } }), false, "format");

await expect("色が #rrggbb でないと不合格",
  await makePack("bad-color.stpack", { "pack.json": { ...goodManifest(), skin: { ...goodManifest().skin,
    colors: { ...goodManifest().skin.colors, accent: "red" } } } }), false, "accent");

await expect("pack.json が指すファイルが無いと不合格",
  await makePack("missing-file.stpack", { "pack.json": { ...goodManifest(),
    sounds: { don: "sounds/don.wav", ka: "sounds/ka.wav" } } }), false, "入っていません");

await expect("指すファイルがあれば合格（効果音1つ）",
  await makePack("with-sound.stpack", { "pack.json": { ...goodManifest(), sounds: { don: "sounds/don.wav" } },
    "sounds/don.wav": "RIFF....WAVEfmt " }), true);

await expect("書体に license がないと不合格",
  await makePack("font-no-license.stpack", { "pack.json": { ...goodManifest(),
    fonts: [{ family: "TrkTest", file: "fonts/test.woff2", weight: 400 }] },
    "fonts/test.woff2": "wOF2" }), false, "license");

await expect("書体の宣言がそろっていれば合格（OFL の全文つき）",
  await makePack("font-ok.stpack", { "pack.json": { ...goodManifest(),
    fonts: [{ family: "TrkTest", file: "fonts/test.woff2", weight: 400, license: "OFL-1.1" }] },
    "fonts/test.woff2": "wOF2", "OFL.txt": "SIL OPEN FONT LICENSE Version 1.1" }), true);

await expect("書体のパスに .. があると不合格",
  await makePack("font-traversal.stpack", { "pack.json": { ...goodManifest(),
    fonts: [{ family: "TrkTest", file: "../evil.woff2", weight: 400, license: "OFL-1.1" }] },
    "OFL.txt": "SIL OPEN FONT LICENSE Version 1.1" }), false, "パスが不正");

await expect("書体の family が英数字以外だと不合格",
  await makePack("font-family.stpack", { "pack.json": { ...goodManifest(),
    fonts: [{ family: "丸ゴ", file: "fonts/test.woff2", weight: 400, license: "OFL-1.1" }] },
    "fonts/test.woff2": "wOF2", "OFL.txt": "SIL OPEN FONT LICENSE Version 1.1" }), false, "family");

await expect("書体を入れてライセンス全文が無いと不合格",
  await makePack("font-no-ofl.stpack", { "pack.json": { ...goodManifest(),
    fonts: [{ family: "TrkTest", file: "fonts/test.woff2", weight: 400, license: "OFL-1.1" }] },
    "fonts/test.woff2": "wOF2" }), false, "ライセンス全文");

await expect("release の形が違うと不合格",
  await makePack("bad-release.stpack", { "pack.json": { ...goodManifest(), release: "新しい版" } }), false, "release");

/* 壊れた ZIP（CRC を壊す）は読めないこと */
{
  const file = await makePack("broken.stpack", { "pack.json": goodManifest() });
  const buf = fs.readFileSync(file);
  const i = buf.indexOf(Buffer.from("shadow-taiko-pack"));
  if (i > 0) buf[i + 3] ^= 0xff;
  const brokenPath = path.join(work, "broken-crc.stpack");
  fs.writeFileSync(brokenPath, buf);
  const r = await verifyPack(brokenPath, { trk });
  const ok = !r.ok;
  results.push({ label: "CRC を壊した ZIP は不合格", ok, detail: ok ? "" : "読めてしまった" });
  console.log(`${ok ? "✅" : "❌"} CRC を壊した ZIP は不合格${ok ? "" : "  ← 読めてしまった"}`);
}

/* 目録が今の中身と合っているか（--check と同じ見方） */
{
  const catalogPath = path.join(path.dirname(new URL(import.meta.url).pathname), "../catalog/index.json");
  let ok = false, detail = "catalog/index.json がない";
  if (fs.existsSync(catalogPath)) {
    const cat = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
    ok = cat.format === "trk-avatar-library" && Array.isArray(cat.packs) && cat.packs.every(p => /^[0-9a-f]{64}$/.test(p.sha256));
    detail = ok ? "" : "format か sha256 の形が違う";
    /* 目録の sha256 が、実際のファイルと一致するか */
    for (const p of cat.packs || []) {
      const abs = path.join(path.dirname(new URL(import.meta.url).pathname), "..", p.file);
      if (!fs.existsSync(abs)) { ok = false; detail = `${p.file} が見つからない`; continue; }
      const h = crypto.createHash("sha256").update(fs.readFileSync(abs)).digest("hex");
      if (h !== p.sha256) { ok = false; detail = `${p.file} の sha256 が目録と違う`; }
    }
  }
  results.push({ label: "目録の sha256 が実物と一致", ok, detail });
  console.log(`${ok ? "✅" : "❌"} 目録の sha256 が実物と一致${ok ? "" : `  ← ${detail}`}`);
}

if (!keep) fs.rmSync(work, { recursive: true, force: true });
const bad = results.filter(r => !r.ok).length;
console.log(`\n${bad ? "❌" : "✅"} ${results.length - bad} / ${results.length} 合格`);
process.exit(bad ? 1 : 0);
