#!/usr/bin/env node
// SPDX-License-Identifier: GPL-3.0-or-later
/* 🖼 .stpack を、入れる前に見る（1ファイルの HTML を書き出す・2026-10-31）

   なぜ要るか：
     見本（gallery/all-skins.html）はアプリに入っているスキンの見本です。
     配るパックは、入れてみるまで見た目がわかりません。とくに**書体パック**は
     「丸ゴらしさ」が伝わらないと選べません。そこで、パックの中の色と書体を
     そのまま埋め込んだ HTML を1枚作ります（外部からは何も読みません・オフラインで開けます）。

   使い方：
     node tools/preview-pack.mjs font-packs/maru-go.stpack
     node tools/preview-pack.mjs packs/*.stpack --out=dist/preview
     node tools/preview-pack.mjs <pack> --trk=/path/to/trk-PWA

   出力：既定は dist/preview/<パック名>.html（dist/ は .gitignore 済み。
         「配る見本」として残したくなったら gallery/ に置いてください）
*/
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { openZip, readJsonEntry } from "./lib/zip.mjs";
import { verifyPack } from "./verify-pack.mjs";

const HERE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const argv = process.argv.slice(2);
const opt = { out: "", trk: undefined, json: false };
const files = [];
for (const a of argv) {
  if (a.startsWith("--out=")) opt.out = a.slice(6);
  else if (a.startsWith("--trk=")) opt.trk = a.slice(6);
  else if (a === "--json") opt.json = true;
  else if (a === "-h" || a === "--help") { usage(); process.exit(0); }
  else if (a.startsWith("--")) { console.error(`使い方にないオプションです: ${a}`); process.exit(2); }
  else files.push(a);
}
if (!files.length) { usage(); process.exit(2); }

const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const safeName = s => String(s || "pack").replace(/[^A-Za-z0-9._-]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "pack";
const fmtBytes = n => n < 1024 ? `${n} B` : n < 1048576 ? `${(n / 1024).toFixed(1)} KB` : `${(n / 1048576).toFixed(2)} MB`;
const hexOr = (v, d) => typeof v === "string" && /^#[0-9a-f]{6}$/i.test(v) ? v.toLowerCase() : d;
const lum = hex => {
  const m = /^#([0-9a-f]{6})$/i.exec(hex || ""); if (!m) return 0;
  const c = [0, 2, 4].map(i => parseInt(m[1].slice(i, i + 2), 16) / 255)
    .map(v => v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const contrast = (a, b) => { const x = lum(a), y = lum(b); const hi = Math.max(x, y), lo = Math.min(x, y); return (hi + 0.05) / (lo + 0.05); };

function usage() {
  console.log(`使い方: node tools/preview-pack.mjs <file.stpack> [--out=dist/preview] [--trk=/path/to/trk-PWA]

  パックの色と書体を埋め込んだ、1ファイルで開ける見本 HTML を作ります。
  出力の既定は dist/preview/<パック名>.html です（dist/ は .gitignore 済み）。`);
}

async function preview(file) {
  const bytes = fs.readFileSync(file);
  const check = await verifyPack(file, { trk: opt.trk });
  const zipped = await openZip(bytes, opt.trk);
  const names = zipped.names();
  const manifests = names.filter(n => /(^|\/)pack\.json$/.test(n)).sort((a, b) => a.length - b.length);
  if (!manifests.length) throw new Error(`${file}: pack.json がありません`);
  const mf = manifests[0], root = mf.slice(0, mf.length - "pack.json".length);
  const man = await readJsonEntry(zipped, mf);
  if (!man || typeof man !== "object") throw new Error(`${file}: pack.json が読めません`);

  const skin = man.skin && typeof man.skin === "object" ? man.skin : {};
  const c = skin.colors && typeof skin.colors === "object" ? skin.colors : {};
  const color = {
    bg: hexOr(c.bg, "#14161d"), panel: hexOr(c.panel, "#1d2029"), text: hexOr(c.text, "#f2f3f7"),
    accent: hexOr(c.accent, "#ff3b55"), gold: hexOr(c.gold, "#ffd166"),
  };
  const dark = lum(color.bg) < 0.35;
  const notes = { don: hexOr(man.notes && man.notes.don && man.notes.don.color, color.accent),
                  ka: hexOr(man.notes && man.notes.ka && man.notes.ka.color, color.gold) };

  /* 書体は base64 で埋め込む（オフラインで開けるように） */
  const fonts = [];
  for (const f of Array.isArray(man.fonts) ? man.fonts : []) {
    if (!f || typeof f.file !== "string") continue;
    const data = await zipped.read(root + f.file).catch(() => null);
    if (!data) continue;
    fonts.push({ family: String(f.family || ""), weight: Number.isInteger(f.weight) ? f.weight : 400,
      license: String(f.license || ""), file: f.file, b64: Buffer.from(data).toString("base64") });
  }
  const face = fonts.map(f => `@font-face{font-family:"${esc(f.family)}";font-weight:${f.weight};font-style:normal;font-display:swap;src:url(data:font/woff2;base64,${f.b64}) format("woff2")}`).join("\n");
  const families = [...new Set(fonts.map(f => f.family))];
  const stack = families.length ? `"${families[0]}", system-ui, sans-serif` : "system-ui, -apple-system, \"Segoe UI\", \"Noto Sans JP\", sans-serif";

  const title = String(man.name || path.basename(file, ".stpack"));
  const meta = [
    man.author ? `作者 ${esc(man.author)}` : "",
    man.release ? `版 ${esc(man.release)}` : "",
    man.license ? esc(man.license) : "",
    `${bytes.length.toLocaleString()} B`,
    check.ok ? "検査 OK" : "検査に通っていません",
  ].filter(Boolean);

  const sample = "あア漢 Aa 12 いろはにほへと ドン・カッ";
  const fontCards = fonts.length
    ? fonts.map(f => `
      <div class="fontCard">
        <div class="fontMeta"><b>${esc(f.family)}</b> <span>weight ${f.weight}</span> <span>${esc(f.license)}</span></div>
        <div class="fontSample" style="font-family:'${esc(f.family)}';font-weight:${f.weight}">${esc(sample)}</div>
        <div class="fontSmall" style="font-family:'${esc(f.family)}';font-weight:${f.weight}">${esc(title)} — ${esc(man.description || "書体の見本です")}</div>
      </div>`).join("")
    : `<p class="hint">このパックは書体を同梱していません。色と形の見本だけを出します。</p>`;

  const warnings = [...(check.errors || []).map(e => `❌ ${e}`), ...(check.warnings || []).map(w => `⚠ ${w}`)];

  const html = `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)} — パックの見本（trk-Avatar-Library）</title>
<meta name="description" content="${esc(title)} の色と書体を、入れる前に見られる見本です。外部からは何も読みません。">
<style>
${face}
  :root{ --bg:${color.bg}; --panel:${color.panel}; --text:${color.text}; --accent:${color.accent}; --gold:${color.gold};
         --line:${dark ? "rgba(255,255,255,.16)" : "rgba(20,30,50,.18)"}; --muted:${dark ? "rgba(255,255,255,.62)" : "rgba(20,30,50,.62)"}; }
  *{box-sizing:border-box}
  body{margin:0;background:var(--bg);color:var(--text);font:15px/1.7 ${stack}}
  header{max-width:1000px;margin:0 auto;padding:28px 20px 8px}
  h1{font-size:26px;margin:0 0 6px}
  .desc{color:var(--muted);margin:0 0 12px;font-size:14px}
  .meta{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 6px}
  .chip{border:1px solid var(--line);border-radius:999px;padding:4px 11px;font-size:12px;color:var(--muted)}
  .chip.ok{color:var(--accent);border-color:var(--accent)}
  .chip.bad{color:#ff6b6b;border-color:#ff6b6b}
  main{max-width:1000px;margin:0 auto;padding:12px 20px 60px}
  .stage{background:var(--bg);border:1px solid var(--line);border-radius:16px;padding:22px;margin:14px 0}
  .banner{font-size:30px;font-weight:800;letter-spacing:.02em;margin:0 0 4px}
  .banner small{display:block;font-size:13px;font-weight:400;color:var(--muted);margin-top:6px}
  .notes{display:flex;gap:14px;margin:18px 0 6px;align-items:center}
  .note{width:46px;height:46px;border-radius:50%;display:grid;place-items:center;font-weight:800;color:#111;font-size:13px}
  .note.don{background:${notes.don}} .note.ka{background:${notes.ka};border-radius:12px}
  .ui{display:flex;gap:8px;flex-wrap:wrap;margin-top:16px}
  .ui .btn{border-radius:10px;padding:9px 14px;font-size:13px;border:1px solid var(--line)}
  .ui .btn.acc{background:${color.accent};color:${contrast(color.accent, "#000000") >= 4.5 ? "#000" : "#fff"};border-color:${color.accent};font-weight:700}
  .ui .btn.gold{background:${color.gold};color:${contrast(color.gold, "#000000") >= 4.5 ? "#000" : "#fff"};border-color:${color.gold}}
  .ui .btn.pan{background:${color.panel}}
  .ui .field{flex:1 1 160px;border-radius:10px;padding:9px 12px;border:1px solid var(--line);color:var(--muted);font-size:13px}
  h2{font-size:16px;margin:28px 0 10px}
  .fontCard{border:1px solid var(--line);border-radius:14px;padding:16px 18px;margin:0 0 12px;background:${dark ? "rgba(255,255,255,.03)" : "rgba(0,0,0,.03)"}}
  .fontMeta{display:flex;gap:10px;flex-wrap:wrap;font-size:12px;color:var(--muted);margin-bottom:8px}
  .fontMeta b{color:var(--text);font-size:13px}
  .fontSample{font-size:26px;line-height:1.5;margin-bottom:6px;word-break:break-word}
  .fontSmall{font-size:14px;color:var(--muted);word-break:break-word}
  .hint{color:var(--muted);font-size:13px}
  .warn{font-size:13px;color:#ff9b9b;margin:6px 0 0}
  footer{max-width:1000px;margin:0 auto;padding:0 20px 48px;color:var(--muted);font-size:12px}
  a{color:var(--accent)}
</style>
</head>
<body>
<header>
  <h1>${esc(title)}</h1>
  ${man.description ? `<p class="desc">${esc(man.description)}</p>` : ""}
  <div class="meta">
    ${meta.map((m, i) => `<span class="chip${i === meta.length - 1 ? (check.ok ? " ok" : " bad") : ""}">${m}</span>`).join("")}
  </div>
  ${warnings.length ? `<p class="warn">${warnings.map(esc).join("<br>")}</p>` : ""}
</header>
<main>
  <h2>色と形（パックのスキン）</h2>
  <div class="stage">
    <p class="banner">${esc(skin.name || title)}<small>${esc(man.author || "")}${man.license ? ` — ${esc(man.license)}` : ""}</small></p>
    <div class="notes">
      <span class="note don">ドン</span><span class="note ka">カ</span>
      <span class="hint">ノーツの色（${esc(notes.don)} / ${esc(notes.ka)}）</span>
    </div>
    <div class="ui">
      <span class="btn acc">アクセント</span>
      <span class="btn gold">ゴールド</span>
      <span class="btn pan">パネル</span>
      <span class="field">入力欄の見本</span>
    </div>
  </div>

  <h2>書体（パックに同梱）</h2>
  ${fontCards}

  <p class="hint">この見本は ${esc(path.basename(file))} から作りました。表示している書体はパックの中の woff2 をそのまま埋め込んでいます。
    本物の見た目は、trk! にパックを入れて 設定 → 🎨 見た目 で確かめてください。</p>
</main>
<footer>
  trk-Avatar-Library の見本（GPL-3.0-or-later）。外部からは何も読みません（この1ファイルだけで開けます）。
</footer>
</body>
</html>
`;

  const outDir = opt.out ? path.resolve(opt.out) : path.join(HERE, "dist/preview");
  fs.mkdirSync(outDir, { recursive: true });
  const out = path.join(outDir, `${safeName(path.basename(file, ".stpack"))}.html`);
  fs.writeFileSync(out, html, "utf8");
  return { file, out, bytes: html.length, fonts: fonts.length, ok: check.ok, errors: check.errors, warnings: check.warnings };
}

const results = [];
for (const f of files) results.push(await preview(f));
if (opt.json) console.log(JSON.stringify(results, null, 2));
else {
  for (const r of results) {
    console.log(`${r.ok ? "✅" : "⚠"} ${path.relative(HERE, r.out)}（${r.bytes.toLocaleString()} B・書体 ${r.fonts}）`);
    for (const e of r.errors) console.log(`   ❌ ${e}`);
    for (const w of r.warnings) console.log(`   ⚠ ${w}`);
  }
}
