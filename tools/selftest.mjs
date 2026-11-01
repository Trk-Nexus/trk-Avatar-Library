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
import { checkFont } from "./check-fonts.mjs";
import { verifySet } from "./verify-set.mjs";
import { loadZipIO } from "./lib/zip.mjs";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
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

/* L7：書体のライセンス全文（fonts[].licenseFile・任意） */
const fontManifest = extra => ({ ...goodManifest(),
  fonts: [{ family: "TrkTest", file: "fonts/test.woff2", weight: 400, license: "OFL-1.1", ...extra }] });

await expect("licenseFile を書いても合格（実在する全文を指す）",
  await makePack("font-licensefile-ok.stpack", { "pack.json": fontManifest({ licenseFile: "fonts/OFL.txt" }),
    "fonts/test.woff2": "wOF2", "fonts/OFL.txt": "SIL OPEN FONT LICENSE Version 1.1 — " + "x".repeat(200) }), true);

await expect("licenseFile が指すファイルが無いと不合格",
  await makePack("font-licensefile-missing.stpack", { "pack.json": fontManifest({ licenseFile: "fonts/NOPE.txt" }),
    "fonts/test.woff2": "wOF2", "OFL.txt": "SIL OPEN FONT LICENSE Version 1.1" }), false, "licenseFile");

await expect("licenseFile が .txt／.md でないと不合格",
  await makePack("font-licensefile-ext.stpack", { "pack.json": fontManifest({ licenseFile: "fonts/test.woff2" }),
    "fonts/test.woff2": "wOF2", "OFL.txt": "SIL OPEN FONT LICENSE Version 1.1" }), false, "licenseFile");

await expect("licenseFile のパスに .. があると不合格",
  await makePack("font-licensefile-traversal.stpack", { "pack.json": fontManifest({ licenseFile: "../OFL.txt" }),
    "fonts/test.woff2": "wOF2", "OFL.txt": "SIL OPEN FONT LICENSE Version 1.1" }), false, "licenseFile");

/* L10／L15：書体の「ひとこと」と「雰囲気のタグ」は、パック自身（pack.json）にも書ける（2026-11-01）
   trk238 予定の「起動時にパックから索引を作る」ための下ごしらえ。目録の外（catalog/*.json）と二重に書いたら
   build-catalog が止めるので、ここでは「読めること」と「行儀の悪い書き方は警告になること」だけ見る */
{
  const file = await makePack("font-note-tags.stpack", { "pack.json": fontManifest({ note: "丸くてやわらかい", tags: ["丸ゴ", "かわいい"] }),
    "fonts/test.woff2": "wOF2", "OFL.txt": "SIL OPEN FONT LICENSE Version 1.1" });
  const r = await verifyPack(file, { trk });
  const f0 = (r.info.fonts || [])[0] || {};
  const ok = r.ok && f0.note === "丸くてやわらかい" && (f0.tags || []).join(",") === "丸ゴ,かわいい";
  results.push({ label: "pack.json の fonts[].note と tags を読む", ok, detail: ok ? "" : `ok=${r.ok} note=${f0.note} tags=${(f0.tags || []).join(",")} ${r.errors.join(" / ")}` });
  console.log(`${ok ? "✅" : "❌"} pack.json の fonts[].note と tags を読む${ok ? "" : `  ← ok=${r.ok} note=${f0.note}`}`);
}
{
  const file = await makePack("font-note-tags-long.stpack", { "pack.json": fontManifest({
    note: "あ".repeat(61), tags: [...Array.from({ length: 9 }, (_, i) => `タグ${i}`), "と".repeat(17)] }),
    "fonts/test.woff2": "wOF2", "OFL.txt": "SIL OPEN FONT LICENSE Version 1.1" });
  const r = await verifyPack(file, { trk });
  const all = [...r.errors, ...r.warnings].join(" / ");
  const ok = r.ok && all.includes("note") && all.includes("タグ") && all.includes("個");
  results.push({ label: "note が長すぎる／tags が多すぎると警告（合格は変えない）", ok, detail: ok ? "" : `ok=${r.ok} ${all}` });
  console.log(`${ok ? "✅" : "❌"} note が長すぎる／tags が多すぎると警告（合格は変えない）${ok ? "" : `  ← ok=${r.ok} ${all.slice(0, 120)}`}`);
}

/* L8：release を書いていないパックは「ℹ」で知らせる（合格は変えない） */
{
  const r = await verifyPack(await makePack("no-release.stpack", { "pack.json": goodManifest() }), { trk });
  const ok = r.ok && (r.notes || []).some(n => n.includes("release"));
  results.push({ label: "release が無いときは ℹ で知らせる（合格のまま）", ok, detail: ok ? "" : `ok=${r.ok} notes=${(r.notes || []).join(" / ")}` });
  console.log(`${ok ? "✅" : "❌"} release が無いときは ℹ で知らせる（合格のまま）${ok ? "" : `  ← ok=${r.ok}`}`);
}

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

/* L7：licenseFile が info.fonts に残る（目録に載せる値） */
{
  const file = await makePack("licensefile-info.stpack", { "pack.json": fontManifest({ licenseFile: "fonts/OFL.txt" }),
    "fonts/test.woff2": "wOF2", "fonts/OFL.txt": "SIL OPEN FONT LICENSE Version 1.1 — " + "x".repeat(200) });
  const r = await verifyPack(file, { trk });
  const got = (r.info.fonts || []).map(f => f.licenseFile).join(",");
  const ok = r.ok && got === "fonts/OFL.txt";
  results.push({ label: "licenseFile が検査結果（目録に載せる値）に残る", ok, detail: ok ? "" : `ok=${r.ok} licenseFile=${got} ${r.errors.join(" / ")}` });
  console.log(`${ok ? "✅" : "❌"} licenseFile が検査結果（目録に載せる値）に残る${ok ? "" : `  ← ${got}`}`);
}

/* L9：woff2 の中身（check-fonts）が「書体でないもの」を断るか */
{
  const cases = [
    { label: "woff2 でない中身（ヘッダだけ）は不合格", buf: Buffer.alloc(64, 0), needle: "wOF2" },
    { label: "woff2 の署名だけの空ファイルは不合格", buf: Buffer.from("wOF2"), needle: "" },
  ];
  for (const c of cases) {
    const r = checkFont(c.buf);
    const all = r.errors.join(" / ");
    const ok = !r.ok && (!c.needle || all.includes(c.needle));
    results.push({ label: c.label, ok, detail: ok ? "" : `ok=${r.ok} ${all}` });
    console.log(`${ok ? "✅" : "❌"} ${c.label}${ok ? "" : `  ← ok=${r.ok} ${all}`}`);
  }
}

/* 📦 セット（.stlib / .zip）の受け入れ検査（trk235 の A1〜A6 と同じ手順・verify-set） */
{
  const sha = buf => crypto.createHash("sha256").update(buf).digest("hex");
  const realPacks = ["packs/sample-mincho.stpack", "font-packs/potta-one.stpack"].map(f => ({
    file: f, buf: fs.readFileSync(path.join(ROOT, f)),
  }));
  const catalogOf = packs => ({
    format: "trk-avatar-library", version: 1, name: "試験用セット",
    packs: packs.map(p => ({ name: p.file, file: p.file, version: "1.0.0", sha256: sha(p.buf), bytes: p.buf.length, fonts: [] })),
  });
  const setJson = packs => ({ format: "trk-set", version: 1, name: "試験セット", release: "t1", rev: "t1", packs: packs.map(p => p.file) });
  const makeSet = async (opts = {}) => {
    const packs = opts.packs || realPacks;
    const entries = [
      { name: "README-はじめに.txt", blob: new Blob(["試験用のセット（selftest）"]) },
      ...(opts.noSetJson ? [] : [{ name: "set.json", blob: new Blob([typeof opts.setJson === "string" ? opts.setJson : JSON.stringify(opts.setJson || setJson(packs))]) }]),
      { name: "catalog/index.json", blob: new Blob([typeof opts.catalog === "string" ? opts.catalog : JSON.stringify(opts.catalog || catalogOf(packs))]) },
      ...packs.map(p => ({ name: p.file, blob: new Blob([p.buf]) })),
      ...(opts.extra || []).map(e => ({ name: e.file, blob: new Blob([e.buf]) })),
    ];
    const blob = await zipIO.zipWrite(entries);
    return Buffer.from(await blob.arrayBuffer());
  };
  const setCase = (label, r, want) => {
    const c = (r.info && r.info.count) || {};
    const diffs = [];
    if (want.pass !== undefined && r.ok !== want.pass) diffs.push(`ok=${r.ok}`);
    for (const k of ["ok", "mismatch", "missing", "stray"]) {
      if (want[k] !== undefined && c[k] !== want[k]) diffs.push(`${k}=${c[k]}`);
    }
    const all = [...r.errors, ...r.warnings, ...r.notes, ...((r.info.results || []).map(x => x.reason || ""))].join(" / ");
    if (want.needle && !all.includes(want.needle)) diffs.push(`メッセージに「${want.needle}」が無い`);
    const ok = diffs.length === 0;
    results.push({ label, ok, detail: ok ? "" : `${diffs.join("・")} ← ${all.slice(0, 160)}` });
    console.log(`${ok ? "✅" : "❌"} ${label}${ok ? "" : `  ← ${diffs.join("・")} ← ${all.slice(0, 160)}`}`);
  };

  const good = await makeSet();
  setCase("セット（.stlib）は目録の 2 本とも入る", await verifySet(good, { trk }), { pass: true, ok: 2, mismatch: 0, missing: 0, stray: 0 });
  setCase("セット（同じ中身・.zip の名前）も中身で判断して通る", await verifySet(good, { trk, fileName: "x.zip" }), { pass: true, ok: 2 });
  /* 目録は 2 本のまま、中の 1 本だけ差し替える（アプリと同じ「その 1 本だけ入れない」） */
  setCase("中身を差し替えた 1 本は入れない（ほかは入る）",
    await verifySet(await makeSet({ packs: [realPacks[0], { file: realPacks[1].file, buf: Buffer.from("not-a-zip") }],
      catalog: catalogOf(realPacks) }), { trk }),
    { pass: false, ok: 1, mismatch: 1, needle: "sha256" });
  /* 目録は 2 本のまま、中の 1 本を抜く */
  setCase("目録にあるのに中身が無い 1 本は「入っていない」",
    await verifySet(await makeSet({ packs: [realPacks[0]], catalog: catalogOf(realPacks) }), { trk }),
    { pass: false, ok: 1, missing: 1, needle: "セットに入っていません" });
  setCase("目録にない .stpack は入れずに数える",
    await verifySet(await makeSet({ extra: [{ file: "font-packs/extra.stpack", buf: realPacks[0].buf }] }), { trk }),
    { pass: true, ok: 2, stray: 1 });
  setCase("目録が壊れていると、何も入れずに止まる",
    await verifySet(await makeSet({ catalog: '{ "format": "trk-avatar-library", "version": 1, "packs": [' }), { trk }),
    { pass: false, ok: 0, needle: "目録" });
  setCase("目録の format が違えば止まる",
    await verifySet(await makeSet({ catalog: { format: "something", version: 1, packs: [] } }), { trk }),
    { pass: false, needle: "format" });
  setCase("set.json が壊れていても、目録だけで動く（警告だけ）",
    await verifySet(await makeSet({ setJson: "{ 壊れています" }), { trk }),
    { pass: true, ok: 2, needle: "set.json が読めません" });
  setCase("set.json が無くても動く",
    await verifySet(await makeSet({ noSetJson: true }), { trk }),
    { pass: true, ok: 2, needle: "set.json がありません" });
  setCase("PK で始まらないファイルは ZIP として開かない",
    await verifySet(Buffer.from("not a zip at all"), { trk }),
    { pass: false, needle: "PK" });

  /* アプリ自身の判定（trk239 の tools/check-set.mjs）でも、同じセットが通るか。
     相手側に道具が無い（trk238 以前）ときは飛ばす＝古い版でも selftest は赤にしない */
  const appRoot = path.resolve(trk || process.env.TRK_PWA || path.resolve(ROOT, "..", "trk-PWA"));
  const appTool = path.join(appRoot, "tools/check-set.mjs");
  if (fs.existsSync(appTool)) {
    const { spawnSync } = await import("node:child_process");
    const goodFile = path.join(work, "app-check.stlib");
    fs.writeFileSync(goodFile, await makeSet());
    const runApp = (args) => spawnSync(process.execPath, [path.join(ROOT, "tools/check-set-app.mjs"), ...args, `--trk=${appRoot}`], { encoding: "utf8" });
    const run = runApp([goodFile]);
    const ok = run.status === 0 && /そろっています/.test(String(run.stdout));
    results.push({ label: "アプリ自身の判定（相手側の check-set.mjs）でも通る", ok,
      detail: ok ? "" : `status=${run.status} ${String(run.stderr || run.stdout).trim().slice(0, 160)}` });
    console.log(`${ok ? "✅" : "❌"} アプリ自身の判定（相手側の check-set.mjs）でも通る${ok ? "" : `  ← status=${run.status}`}`);

    /* ① 契約の見張り（返事9 §4-1）。向こうの道具に寄りかかっているので、終了コードと --json の形を毎回見る。
       増えた項目では赤にしない（知らない項目は読み飛ばす）。減った・意味が変わったときだけ気づく */
    {
      const problems = [];
      const missing = runApp([path.join(work, "no-such.stlib")]);
      if (missing.status !== 2) problems.push(`無いファイルで ${missing.status}（2 のはず）`);
      const notZip = path.join(work, "not-zip.stlib");
      fs.writeFileSync(notZip, Buffer.from("not a zip"));
      const rNotZip = runApp([notZip]);
      if (rNotZip.status !== 2) problems.push(`ZIP でないファイルで ${rNotZip.status}（2 のはず）`);
      const rJson = spawnSync(process.execPath, [appTool, goodFile, "--json"], { encoding: "utf8" });
      const last = String(rJson.stdout || "").split("\n").map(x => x.trim()).filter(x => x.startsWith("{")).pop();
      if (!last) {
        console.log("ℹ 相手側の check-set.mjs は --json を知りません（trk240 より前）。終了コードと文で見ました");
      } else {
        try {
          const j = JSON.parse(last);
          for (const k of ["tool", "version", "ok", "problems", "packs", "missing", "pending"]) {
            if (!(k in j)) problems.push(`--json に ${k} が無い（契約 ③）`);
          }
          if (j.tool !== "check-set") problems.push(`--json の tool が ${j.tool}（契約 ③）`);
        } catch (_) { problems.push("--json が JSON として読めない（契約 ③）"); }
      }
      const ok2 = problems.length === 0;
      results.push({ label: "受け入れの道具の契約（終了コード 0/1/2 と --json の形）が保たれている", ok: ok2, detail: problems.join("・") });
      console.log(`${ok2 ? "✅" : "❌"} 受け入れの道具の契約（終了コード 0/1/2 と --json の形）が保たれている${ok2 ? "" : `  ← ${problems.join("・")}`}`);
    }

    /* ② 2 つ目を選んだとき「これから入る分」が出るか（--have）。出ないまま通ると、
       CI の「2 つ続けて」が空振りするので、ここで見る */
    {
      const setA = path.join(work, "have-a.stlib");   /* 1 本だけ入ったセット（＝もう入っている側） */
      fs.writeFileSync(setA, await makeSet({ packs: [realPacks[0]] }));
      const setB = path.join(work, "have-b.stlib");   /* 2 本入ったセット（＝あとから選ぶ側） */
      fs.writeFileSync(setB, await makeSet());
      const r = runApp([setB, `--have=${setA}`]);
      const ok2 = r.status === 0 && /これから入る 1 本/.test(String(r.stdout));
      results.push({ label: "2 つ目を選ぶと「これから入る分」が出る（--have・飛ばす分と合わせて）", ok: ok2,
        detail: ok2 ? "" : `status=${r.status} ${String(r.stdout || r.stderr).trim().slice(0, 160)}` });
      console.log(`${ok2 ? "✅" : "❌"} 2 つ目を選ぶと「これから入る分」が出る（--have・飛ばす分と合わせて）${ok2 ? "" : `  ← status=${r.status}`}`);
    }
  } else {
    console.log("ℹ 相手側に tools/check-set.mjs がありません（trk239 より前）。アプリ側の判定は飛ばしました");
  }
}

/* check-fonts は trk-PWA が見つからないとき、黙って合格にせず止まるか（2026-11-01・trk235 の指摘） */
{
  const { spawnSync } = await import("node:child_process");
  const r = spawnSync(process.execPath, [path.join(ROOT, "tools/check-fonts.mjs")], {
    encoding: "utf8", env: { ...process.env, TRK_PWA: path.join(work, "no-such-trk-pwa") },
  });
  const ok = r.status === 2 && /使い方/.test(String(r.stderr));
  results.push({ label: "check-fonts は trk-PWA が無いと使い方を出して止まる（exit 2）", ok, detail: ok ? "" : `status=${r.status}` });
  console.log(`${ok ? "✅" : "❌"} check-fonts は trk-PWA が無いと使い方を出して止まる（exit 2）${ok ? "" : `  ← status=${r.status}`}`);
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

/* sets/*.json（セットの定義）が、いまの倉庫と合っているか（軽い見方・CI の --check はもっと強い） */
{
  const setsDir = path.join(ROOT, "sets");
  const defs = fs.existsSync(setsDir) ? fs.readdirSync(setsDir).filter(f => f.endsWith(".json")) : [];
  const problems = [];
  for (const d of defs) {
    const cfg = JSON.parse(fs.readFileSync(path.join(setsDir, d), "utf8"));
    const files = Array.isArray(cfg.files) ? cfg.files : [];
    if (!files.includes("catalog/index.json")) problems.push(`${d}: catalog/index.json が入っていません`);
    if (!files.some(f => f.endsWith(".stpack"))) problems.push(`${d}: .stpack が 1 本も入っていません`);
    for (const f of files) if (!fs.existsSync(path.join(ROOT, f))) problems.push(`${d}: ${f} がありません`);
    if (!cfg.record) problems.push(`${d}: record（記録の置き場所）がありません`);
  }
  const ok = defs.length > 0 && problems.length === 0;
  const detail = ok ? "" : (problems.length ? problems.slice(0, 3).join(" / ") : "sets/*.json がありません");
  results.push({ label: `セットの定義（${defs.length} 件）が、いまの倉庫と合っている`, ok, detail });
  console.log(`${ok ? "✅" : "❌"} セットの定義（${defs.length} 件）が、いまの倉庫と合っている${ok ? "" : `  ← ${detail}`}`);
}

/* パックの一覧（gallery/packs.html）が目録と合っているか（--check と同じ見方） */
{
  const { spawnSync } = await import("node:child_process");
  const r = spawnSync(process.execPath, [path.join(ROOT, "tools/export-pack-gallery.mjs"), "--check"], { encoding: "utf8" });
  const ok = r.status === 0;
  results.push({ label: "パックの一覧（gallery/packs.html）が目録と合っている", ok,
    detail: ok ? "" : `${String(r.stderr || r.stdout).trim().slice(0, 160)}（node tools/export-pack-gallery.mjs で作り直す）` });
  console.log(`${ok ? "✅" : "❌"} パックの一覧（gallery/packs.html）が目録と合っている${ok ? "" : "  ← 作り直してください"}`);
}

if (!keep) fs.rmSync(work, { recursive: true, force: true });
const bad = results.filter(r => !r.ok).length;
console.log(`\n${bad ? "❌" : "✅"} ${results.length - bad} / ${results.length} 合格`);
process.exit(bad ? 1 : 0);
