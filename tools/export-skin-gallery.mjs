#!/usr/bin/env node
// SPDX-License-Identifier: GPL-3.0-or-later
/* 🖼 trk! の「全スキン見本」を作る（2026-10-31）

   trk-PWA の `js/data.js`（と `js/characters/miku.js`）から、見た目のスキンを全部読み、
   1枚で開ける HTML と、機械が読める JSON を書き出します。

   なぜ要るか：
     スキンが 53 種になり、アプリを起動しないと「どれが好みか」を確かめられませんでした。
     この見本は **外部から何も読まない**（CDN・外部API・フォントの取得なし）1ファイルなので、
     ダウンロードしてダブルクリックするだけで、オフラインでも全スキンを並べて見られます。

   使い方：
     node tools/export-skin-gallery.mjs --trk=/path/to/trk-PWA
     node tools/export-skin-gallery.mjs --trk=. --out=gallery/all-skins.html --json=catalog/skins.json
     node tools/export-skin-gallery.mjs --trk=… --check      … 書き出さずに、いまのファイルと合っているかだけ見る（CI 用）

   書き出すもの：
     gallery/all-skins.html … 単体で開ける見本（データを埋め込み・相対パス不要）
     catalog/skins.json     … 同じ中身の JSON（アプリや他の道具が読む用）

   同梱の書体（L9・trk232 からのお願い）：
     font-packs/ の .stpack が宣言している書体を「🔤 同梱の書体」の節に並べます。
     ここでは @font-face を使わず、**家族名だけ**を指定します（端末に同じ家族名の書体が入っているときだけ
     その書体で表示され、無ければ次の候補）。書体そのものは .stpack の中にあり、アプリに入れると本文に効きます。
     → 「入れる前に、どんな書体か・どのライセンスか」が分かるようにするのが目的で、書体ファイルは配りません。
*/
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { verifyPack } from "./verify-pack.mjs";

const args = Object.fromEntries(process.argv.slice(2).map(a => {
  const m = /^--([^=]+)=(.*)$/.exec(a); return m ? [m[1], m[2]] : [a.replace(/^--/, ""), true];
}));
if (args.help || args.h) {
  console.log("使い方: node tools/export-skin-gallery.mjs --trk=/path/to/trk-PWA [--out=…] [--json=…]");
  process.exit(0);
}
const HERE = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const TRK = path.resolve(String(args.trk || ""));
const checkOnly = !!args.check;
const outHtml = path.resolve(HERE, String(args.out || "gallery/all-skins.html"));
const outJson = path.resolve(HERE, String(args.json || "catalog/skins.json"));

/* --- trk-PWA の SKINS を読む（tests と同じ順：data.js → characters/miku.js） --- */
const sandbox = {
  console, Math, Array, Object, Number, String, JSON, Set, Map, Date,
  window: {}, TEXT: { ja:{}, en:{}, zh:{}, ko:{} }, tr: () => "",
  document: { getElementById: () => null },
};
vm.createContext(sandbox);
for (const rel of ["js/data.js", "js/characters/miku.js"]) {
  const file = path.join(TRK, rel);
  if (!fs.existsSync(file)) { console.error(`見つかりません: ${file}`); process.exit(1); }
  vm.runInContext(fs.readFileSync(file, "utf8"), sandbox, { filename: rel });
}
const data = sandbox.window.Trk.data;
const SKINS = data.SKINS;

/* --- 見本に載せる項目だけを写す（関数・Blob などは入れない） --- */
const pickLabel = o => (o && typeof o === "object") ? {
  ja: o.ja || o.en || "", en: o.en || o.ja || "", zh: o.zh || o.en || o.ja || "", ko: o.ko || o.en || o.ja || ""
} : { ja:"", en:"", zh:"", ko:"" };

const skins = Object.entries(SKINS).map(([id, s]) => ({
  id,
  label: pickLabel(s.label),
  desc: pickLabel(s.desc),
  cat: Array.isArray(s.cat) ? s.cat.slice() : ["basic"],
  font: typeof s.font === "string" ? s.font : "",
  type: s.type ? {
    title: s.type.title || "", weight: s.type.weight || "", lh: s.type.lh || "",
    titleWeight: s.type.titleWeight || "", titleSpace: s.type.titleSpace || "",
    titleTransform: s.type.titleTransform || "", mark: s.type.mark || "",
  } : null,
  colors: {
    stage: s.game.stage, ink: s.game.ink, don: s.game.don, ka: s.game.ka,
    text: s.ui["--ui-text"], muted: s.ui["--ui-muted"], bg: s.ui["--ui-bg"],
    panel: s.ui["--ui-panel"], field: s.ui["--ui-field"], button: s.ui["--ui-button"],
    accent: s.ui["--ui-accent"], onAccent: s.ui["--ui-on-accent"], gold: s.ui["--ui-gold"],
    border: s.ui["--ui-border"],
  },
  shapes: Array.isArray(s.shapes) ? s.shapes.slice() : [],
  locked: !!s.locked,
  video: typeof s.video === "string" ? s.video : "",
}));

const catCount = {};
for (const s of skins) for (const c of s.cat) catCount[c] = (catCount[c] || 0) + 1;
const typeCount = skins.filter(s => s.cat.includes("type")).length;

/* --- 同梱の書体（font-packs/ と packs/ の .stpack が宣言しているもの） --- */
/* L10：書体の「雰囲気の一行」は catalog/font-notes.json（目録と同じ出どころ）から取る */
const NOTES_PATH = path.join(HERE, "catalog/font-notes.json");
const NOTES = fs.existsSync(NOTES_PATH) ? JSON.parse(fs.readFileSync(NOTES_PATH, "utf8")) : {};
const NOTES_BY_PACK = NOTES && typeof NOTES.packs === "object" && NOTES.packs ? NOTES.packs : {};
const noteOf = (packFile, fontFile) => {
  const byFont = NOTES_BY_PACK[packFile];
  if (!byFont || typeof byFont !== "object") return "";
  const n = byFont[fontFile];
  return typeof n === "string" ? n.trim() : "";
};
const fontPacks = [];
for (const dir of ["font-packs", "packs"]) {
  const abs = path.join(HERE, dir);
  if (!fs.existsSync(abs)) continue;
  for (const n of fs.readdirSync(abs).filter(x => x.toLowerCase().endsWith(".stpack")).sort()) {
    const file = path.posix.join(dir, n);
    let r = null;
    try { r = await verifyPack(path.join(abs, n), { trk: String(args.trk || "") }); } catch (_) { r = null; }
    const fonts = (r && r.info.fonts) || [];
    if (!fonts.length) continue;
    fontPacks.push({
      file,
      name: (r.info && r.info.name) || n,
      release: (r.info && r.info.release) || "",
      skin: (r.info && r.info.skin && r.info.skin.name) || "",
      colors: (r.info && r.info.colors) || null,
      fonts: fonts.map(f => ({ family: f.family, file: f.file, license: f.license,
        ...(Number.isInteger(f.weight) ? { weight: f.weight } : {}),
        ...(f.licenseFile ? { licenseFile: f.licenseFile } : {}),
        ...(noteOf(file, f.file) ? { note: noteOf(file, f.file) } : {}) })),
    });
  }
}

const catalog = {
  format: "trk-avatar-library-skins",
  version: 1,
  generatedAt: new Date().toISOString(),
  source: "trk-PWA / js/data.js + js/characters/miku.js",
  count: skins.length,
  typeSkins: typeCount,
  categories: catCount,
  skins,
  fontPacks,
};
/* 書き出す（--check のときは、いまのファイルと比べるだけ。generatedAt は比べない） */
const drift = [];

emit(outJson, JSON.stringify(catalog, null, 2) + "\n");
function emit(file, text) {
  if (!checkOnly) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, text, "utf8");
    return;
  }
  const norm = t => t.replace(/("generatedAt":\s*)"[^"]*"/g, '$1""');
  const prev = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
  if (norm(prev) !== norm(text)) drift.push(path.relative(HERE, file));
}

/* --- 1ファイルで開ける見本（CSS も JS もデータも埋め込み） --- */
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;" }[c]));
const JSON_SAFE = JSON.stringify(catalog).replace(/</g, "\\u003c");
const html = `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>trk! 全スキン見本（${skins.length}種）— trk-Avatar-Library</title>
<meta name="description" content="trk! の見た目のスキン${skins.length}種を、1枚で並べて見られる見本です。外部からは何も読みません。">
<style>
  :root{ --bg:#0b0c10; --panel:#14161d; --line:#2a2e3a; --text:#f2f3f7; --muted:#a9adbd; --accent:#ff3b55; }
  *{box-sizing:border-box}
  body{margin:0;background:var(--bg);color:var(--text);font:15px/1.6 system-ui,-apple-system,"Segoe UI","Noto Sans JP",sans-serif}
  header{padding:22px 20px 10px;max-width:1200px;margin:0 auto}
  h1{font-size:22px;margin:0 0 6px}
  .lead{color:var(--muted);font-size:13px;margin:0 0 14px}
  .tools{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin:0 0 8px}
  .tools input{flex:1 1 240px;padding:9px 12px;border-radius:10px;border:1px solid var(--line);background:var(--panel);color:var(--text);font:inherit}
  .tools select{padding:9px 12px;border-radius:10px;border:1px solid var(--line);background:var(--panel);color:var(--text);font:inherit}
  .chips{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0 4px}
  .chip{padding:5px 12px;border-radius:999px;border:1px solid var(--line);background:var(--panel);color:var(--text);font-size:13px;font-weight:700;cursor:pointer}
  .chip.on{background:var(--accent);border-color:var(--accent);color:#fff}
  .count{color:var(--muted);font-size:13px;margin:6px 0 0}
  main{max-width:1200px;margin:0 auto;padding:14px 20px 60px}
  .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:12px}
  .card{border-radius:14px;padding:12px 14px;border:2px solid var(--c-border);background:var(--c-bg);color:var(--c-text);
    display:flex;flex-direction:column;gap:6px;min-height:132px;font-family:var(--c-font,inherit)}
  .card .dots{display:flex;gap:6px}
  .card .dot{width:12px;height:12px;border-radius:3px}
  .card b{font-size:16px;font-family:var(--c-title,inherit);font-weight:var(--c-weight,700);letter-spacing:var(--c-space,normal)}
  .card .spec{font-size:17px;font-family:var(--c-title,inherit);font-weight:var(--c-weight,700);letter-spacing:var(--c-space,normal);text-transform:var(--c-transform,none)}
  .card small{opacity:.8;font-size:12px;line-height:1.35;font-family:system-ui,-apple-system,"Noto Sans JP",sans-serif}
  .card .meta{margin-top:auto;font-size:11px;color:var(--c-muted);font-family:ui-monospace,monospace}
  .empty{color:var(--muted);padding:20px 0}
  /* 🔤 同梱の書体（@font-face は使いません。家族名だけで当てる見本） */
  .fonts{max-width:1200px;margin:0 auto;padding:6px 20px 4px}
  .fonts h2{font-size:16px;margin:18px 0 4px}
  .fonts .hint{color:var(--muted);font-size:12px;margin:0 0 10px;line-height:1.5}
  .fontGrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px}
  .fontCard{border:1px solid var(--line);border-radius:14px;background:var(--panel);padding:12px 14px;color:var(--text)}
  .fontCard .fam{font-size:13px;color:var(--muted);margin:0 0 6px;font-family:ui-monospace,monospace}
  .fontCard .sample{font-size:26px;line-height:1.5;margin:2px 0 8px;letter-spacing:.02em}
  .fontCard .sample b{font-weight:700}
  .fontCard .note{font-size:13px;line-height:1.5;margin:0 0 8px;color:var(--text);opacity:.9}
  .fontCard .rows{font-size:12px;color:var(--muted);line-height:1.6}
  .fontCard .rows span{font-family:ui-monospace,monospace}
  footer{max-width:1200px;margin:0 auto;padding:0 20px 40px;color:var(--muted);font-size:12px}
  a{color:var(--accent)}
</style>
</head>
<body>
<header>
  <h1>🖼 trk! 全スキン見本 <span id="total"></span></h1>
  <p class="lead">${skins.length}種の見た目のスキンを、アプリを起動せずに並べて見られます。外部からは何も読みません（オフラインで開けます）。
    書体のスキンは、お使いの端末にある書体で表示されます（無い書体は次の候補になります）。</p>
  <div class="tools">
    <input id="q" type="search" placeholder="🔍 名前・説明・カテゴリで絞る（例：明朝 / dark / ネオン）" autocomplete="off">
    <select id="sort">
      <option value="default">カタログ順</option>
      <option value="name">名前順</option>
      <option value="dark">暗い順</option>
    </select>
  </div>
  <div class="chips" id="chips"></div>
  <p class="count" id="count"></p>
</header>
${fontPacks.length ? `<section class="fonts" id="fonts">
  <h2>🔤 同梱の書体（${fontPacks.length} パック）</h2>
  <p class="hint">書体パックに入っている書体の<b>名前</b>を並べた見本です。この見本は書体ファイルを読み込みません（@font-face なし）。
    お使いの端末に同じ家族名の書体が入っているときだけ、その書体で表示されます（無ければ次の候補）。
    書体そのものは <code>.stpack</code> に入っていて、trk! に入れて「使う」と本文の書体になります（trk232 以降）。
    名前・対応字数・雰囲気で選ぶときは <a href="fonts.html">🔤 書体の一覧と検索（fonts.html）</a> へ。</p>
  <div class="fontGrid">
${fontPacks.map(fp => `    <div class="fontCard">
      <p class="fam">${esc(fp.file)}${fp.release ? ` · release ${esc(fp.release)}` : ""}</p>
      <div class="sample" style="font-family:${esc([...new Set(fp.fonts.map(f => f.family))].map(f => `"${f}"`).join(","))},system-ui,sans-serif">
        あア漢 Aa 12 <b>かな 漢字 いろは</b></div>
      ${[...new Set(fp.fonts.map(f => f.note).filter(Boolean))].length ? `<p class="note">${esc([...new Set(fp.fonts.map(f => f.note).filter(Boolean))].join(" ／ "))}</p>` : ""}
      <div class="rows">${esc(fp.name)}${fp.skin && fp.skin !== fp.name.replace(/（[^）]*）$/, "") ? `（スキン「${esc(fp.skin)}」）` : ""}<br>
        家族名 <span>${esc([...new Set(fp.fonts.map(f => f.family))].join(", "))}</span>／
        太さ <span>${esc(fp.fonts.map(f => (f.weight === undefined ? "—" : f.weight)).join(" / "))}</span>／
        ライセンス <span>${esc([...new Set(fp.fonts.map(f => f.license))].join(", "))}</span>${fp.fonts.some(f => f.licenseFile) ? `（全文 <span>${esc([...new Set(fp.fonts.map(f => f.licenseFile).filter(Boolean))].join(", "))}</span>）` : ""}
      </div>
    </div>`).join("\n")}
  </div>
</section>` : ""}
<main><div class="grid" id="grid"></div><p class="empty" id="empty" hidden>見つかりませんでした。言葉を変えてください。</p></main>
<footer>
  見本は trk-PWA の <code>js/data.js</code> から作りました（${skins.length}種・書体 ${typeCount} 種）。
  「🔤 同梱の書体」は <code>font-packs/</code> の <code>.stpack</code> の宣言から作りました（書体ファイルは含みません）。
  本物の見た目は、アプリの 設定 → 🎨 見た目 → 🖼 スキンの棚 で確かめてください。GPL-3.0-or-later。
</footer>
<script id="catalog" type="application/json">${JSON_SAFE}</script>
<script>
(function () {
  var DATA = JSON.parse(document.getElementById("catalog").textContent);
  var CAT = { all:"すべて", basic:"定番", type:"書体", miku:"ミク", dark:"ダーク", light:"ライト", grad:"グラデ",
              fun:"遊び心", access:"見やすさ", life:"生活", custom:"マイスキン" };
  var ORDER = ["all","basic","type","miku","dark","light","grad","fun","access","life"];
  var lang = (navigator.language || "ja").slice(0, 2);
  if (!DATA.skins[0].label[lang]) lang = "ja";
  var state = { q:"", cat:"all", sort:"default" };
  var present = {}; DATA.skins.forEach(function (s) { s.cat.forEach(function (c) { present[c] = 1; }); });

  function lum(hex) {
    var m = /^#([0-9a-f]{6})$/i.exec(hex || ""); if (!m) return 0;
    var c = [0,2,4].map(function (i) { return parseInt(m[1].slice(i, i+2), 16) / 255; })
      .map(function (v) { return v <= 0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4); });
    return 0.2126*c[0] + 0.7152*c[1] + 0.0722*c[2];
  }
  function textOf(id) {
    var s = DATA.skins.find(function (x) { return x.id === id; });
    return [s.label.ja, s.label.en, s.label.zh, s.label.ko, s.desc.ja, s.desc.en, s.desc.zh, s.desc.ko, id, s.cat.join(" ")]
      .join(" ").toLowerCase();
  }
  function matches(id) {
    var words = state.q.trim().toLowerCase().split(/\\s+/).filter(Boolean);
    if (!words.length) return true;
    var t = textOf(id); return words.every(function (w) { return t.indexOf(w) >= 0; });
  }
  function render() {
    var grid = document.getElementById("grid");
    var list = DATA.skins.filter(function (s) {
      if (state.cat !== "all" && s.cat.indexOf(state.cat) < 0) return false;
      return matches(s.id);
    });
    if (state.sort === "name") list.sort(function (a, b) { return a.label[lang].localeCompare(b.label[lang], lang); });
    else if (state.sort === "dark") list.sort(function (a, b) { return lum(a.colors.stage) - lum(b.colors.stage); });
    grid.textContent = "";
    document.getElementById("empty").hidden = list.length > 0;
    document.getElementById("count").textContent = list.length === DATA.count
      ? "（" + DATA.count + "）" : "（" + list.length + "／" + DATA.count + "）";
    list.forEach(function (s) {
      var c = s.colors;
      var el = document.createElement("div"); el.className = "card";
      el.style.setProperty("--c-bg", c.stage);
      el.style.setProperty("--c-text", c.text);
      el.style.setProperty("--c-border", c.border);
      el.style.setProperty("--c-muted", c.muted);
      if (s.font) el.style.setProperty("--c-font", s.font);
      if (s.type) {
        if (s.type.title) el.style.setProperty("--c-title", s.type.title);
        if (s.type.titleWeight) el.style.setProperty("--c-weight", s.type.titleWeight);
        if (s.type.titleSpace) el.style.setProperty("--c-space", s.type.titleSpace);
        if (s.type.titleTransform) el.style.setProperty("--c-transform", s.type.titleTransform);
      }
      var dots = document.createElement("div"); dots.className = "dots";
      [c.accent, c.gold, c.text].forEach(function (col) {
        var d = document.createElement("i"); d.className = "dot"; d.style.background = col; dots.appendChild(d);
      });
      var name = document.createElement("b"); name.textContent = (s.locked ? "❓ " : "") + s.label[lang];
      var spec = document.createElement("div"); spec.className = "spec"; spec.textContent = s.type && s.type.mark ? s.type.mark : "あア漢 Aa 12";
      var desc = document.createElement("small"); desc.textContent = s.desc[lang] || "";
      var meta = document.createElement("div"); meta.className = "meta"; meta.textContent = s.id + " · " + s.cat.join("/");
      el.append(dots, name, spec, desc, meta);
      grid.appendChild(el);
    });
  }
  var chips = document.getElementById("chips");
  ORDER.forEach(function (k) {
    if (k !== "all" && !present[k]) return;
    var b = document.createElement("button"); b.className = "chip" + (k === "all" ? " on" : "");
    b.type = "button"; b.textContent = CAT[k] || k;
    b.addEventListener("click", function () {
      state.cat = k;
      Array.prototype.forEach.call(chips.children, function (x) { x.classList.toggle("on", x === b); });
      render();
    });
    chips.appendChild(b);
  });
  document.getElementById("q").addEventListener("input", function (e) { state.q = e.target.value; render(); });
  document.getElementById("sort").addEventListener("change", function (e) { state.sort = e.target.value; render(); });
  document.getElementById("total").textContent = "（" + DATA.count + "種・書体 " + DATA.typeSkins + "種）";
  render();
})();
</script>
</body>
</html>
`;
emit(outHtml, html);

if (checkOnly) {
  if (drift.length) {
    console.error(`❌ 見本（${drift.join("・")}）が今の中身と合っていません。node tools/export-skin-gallery.mjs --trk=… で作り直してください`);
    process.exit(1);
  }
  console.log(`✅ 見本は最新です（${skins.length}種＋同梱の書体 ${fontPacks.length} パック）`);
  process.exit(0);
}

console.log(`✅ ${skins.length}種（書体 ${typeCount}種・カテゴリ ${Object.keys(catCount).length}）＋同梱の書体 ${fontPacks.length} パック`);
console.log(`   ${path.relative(HERE, outHtml)}  ${fs.statSync(outHtml).size.toLocaleString()} B`);
console.log(`   ${path.relative(HERE, outJson)}  ${fs.statSync(outJson).size.toLocaleString()} B`);
