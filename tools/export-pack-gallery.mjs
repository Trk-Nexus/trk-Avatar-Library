#!/usr/bin/env node
// SPDX-License-Identifier: GPL-3.0-or-later
/* 📦 trk! の「パックの一覧」（パックごとに、中に何が入っているか）を作る（2026-11-01）

   なぜ要るか：
     書体の一覧（gallery/fonts.html）は **書体から** 探せますが、
     「このパックには何が入っているか」「この書体はどのパックか」を **パックの側から** 見る場所がありませんでした。
     目録（catalog/index.json）にはパックごとの fonts[].note／tags／cmap／bytes がそろっているので、
     それを 1 ファイルの HTML にして、利用者（入れる前に確かめる）と開発者（どのパックに足すか決める）の
     両方が同じものを見られるようにします。

   作るもの：
     gallery/packs.html … 1ファイルで開ける一覧（外部参照 0・オフラインOK）

   できること：
     ・検索：パック名・ファイル・説明・スキン名・family・ひとこと・タグを横断
     ・絞り込み：雰囲気のタグ（catalog/font-tags.json の語）
     ・並べ替え：パック名（50 音順）／大きさ順／書体の数
     ・パックごとに、書体（family・太さ・ひとこと・タグ・対応字数・大きさ）・ライセンス・sha256 を表示
     ・「⬇ .stpack」で 1 本ずつ落とせる（セットを展開した中でも、倉庫の中でも辿れる相対パス）

   出どころ：catalog/index.json（目録そのもの）。目録に無いパックは載りません（＝配るものと一覧がずれない）。

   使い方：
     node tools/export-pack-gallery.mjs            … 作り直す
     node tools/export-pack-gallery.mjs --check    … 作らずに、いまのファイルと合っているかだけ見る（CI 用）
     node tools/export-pack-gallery.mjs --out=gallery/packs.html
*/
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const argv = Object.fromEntries(process.argv.slice(2).map(a => {
  const m = /^--([^=]+)=(.*)$/.exec(a); return m ? [m[1], m[2]] : [a.replace(/^--/, ""), true];
}));
if (argv.help || argv.h) {
  console.log("使い方: node tools/export-pack-gallery.mjs [--out=gallery/packs.html] [--check]");
  process.exit(0);
}
const checkOnly = !!argv.check;
const outHtml = path.resolve(HERE, String(argv.out || "gallery/packs.html"));
const rel = p => path.relative(HERE, p).split(path.sep).join("/");

const catalogPath = path.join(HERE, "catalog/index.json");
if (!fs.existsSync(catalogPath)) { console.error("❌ catalog/index.json がありません（node tools/build-catalog.mjs）"); process.exit(1); }
const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));

/* 目録から、表示に要る項目だけを写す（順は目録のまま・足りない項目は作らない） */
const packs = (catalog.packs || []).map(p => {
  const fonts = (Array.isArray(p.fonts) ? p.fonts : []).map(f => ({
    family: f.family || "",
    file: f.file || "",
    ...(Number.isInteger(f.weight) ? { weight: f.weight } : {}),
    license: f.license || "",
    ...(f.licenseFile ? { licenseFile: f.licenseFile } : {}),
    ...(Number.isInteger(f.bytes) ? { bytes: f.bytes } : {}),
    ...(f.note ? { note: f.note } : {}),
    ...(Number.isInteger(f.cmap) ? { cmap: f.cmap } : {}),
    ...(Array.isArray(f.tags) && f.tags.length ? { tags: f.tags.slice() } : {}),
  }));
  const tags = [];
  for (const f of fonts) for (const t of f.tags || []) if (!tags.includes(t)) tags.push(t);
  return {
    id: p.id || "",
    name: p.name || "",
    author: p.author || "",
    version: p.version || "",
    file: p.file || "",
    sha256: p.sha256 || "",
    bytes: p.bytes || 0,
    entries: Number.isInteger(p.entries) ? p.entries : 0,
    songs: Number.isInteger(p.songs) ? p.songs : 0,
    skin: (p.skin && p.skin.name) || "",
    colors: p.colors || null,
    license: p.license || "",
    description: p.description || "",
    tags,
    fonts,
    download: `../${p.file}`,
  };
});

const fontCount = packs.reduce((n, p) => n + p.fonts.length, 0);
const tagCount = {};
for (const p of packs) for (const t of p.tags) tagCount[t] = (tagCount[t] || 0) + 1;
const tagList = Object.entries(tagCount).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "ja")).map(([t]) => t);
const totalBytes = packs.reduce((n, p) => n + p.bytes, 0);

const JSON_SAFE = JSON.stringify({ packs, tags: tagList }).replace(/</g, "\\u003c");
const fmtMB = n => (n / 1048576).toFixed(1);

const html = `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>trk! パックの一覧（${packs.length} パック・書体 ${fontCount} 本）— trk-Avatar-Library</title>
<meta name="description" content="trk! に入れられるパック ${packs.length} 種を、中身（書体・雰囲気のタグ・大きさ・ライセンス）つきで見られる一覧です。外部からは何も読みません。">
<style>
  :root{ --bg:#0b0c10; --panel:#14161d; --line:#2a2e3a; --text:#f2f3f7; --muted:#a9adbd; --accent:#ff3b55; --gold:#ffd166; }
  *{box-sizing:border-box}
  body{margin:0;background:var(--bg);color:var(--text);font:15px/1.6 system-ui,-apple-system,"Segoe UI","Noto Sans JP",sans-serif}
  header{padding:22px 20px 10px;max-width:1200px;margin:0 auto}
  h1{font-size:22px;margin:0 0 6px}
  .lead{color:var(--muted);font-size:13px;margin:0 0 14px}
  .lead a{color:var(--accent)}
  .tools{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin:0 0 8px}
  .tools input{flex:1 1 260px;padding:9px 12px;border-radius:10px;border:1px solid var(--line);background:var(--panel);color:var(--text);font:inherit}
  .tools select{padding:9px 12px;border-radius:10px;border:1px solid var(--line);background:var(--panel);color:var(--text);font:inherit}
  .tools button{padding:9px 14px;border-radius:10px;border:1px solid var(--line);background:var(--panel);color:var(--text);font:inherit;cursor:pointer}
  .chips{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0 4px}
  .chip{padding:5px 12px;border-radius:999px;border:1px solid var(--line);background:var(--panel);color:var(--text);font-size:13px;font-weight:700;cursor:pointer}
  .chip.on{background:var(--accent);border-color:var(--accent);color:#fff}
  .count{color:var(--muted);font-size:13px;margin:6px 0 0}
  main{max-width:1200px;margin:0 auto;padding:10px 20px 60px;display:grid;gap:14px}
  .card{border:1px solid var(--line);background:var(--panel);border-radius:16px;padding:14px 16px}
  .card h2{font-size:17px;margin:0 0 2px;display:flex;flex-wrap:wrap;gap:8px;align-items:baseline}
  .card h2 small{color:var(--muted);font:12px ui-monospace,SFMono-Regular,monospace;font-weight:400}
  .badges{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0 8px}
  .badge{padding:1px 9px;border-radius:999px;border:1px solid var(--line);color:var(--muted);font-size:11px;white-space:nowrap}
  .badge.size{color:var(--gold);border-color:#5a4a1c}
  .desc{margin:0 0 8px;font-size:13px;color:var(--text);opacity:.94}
  .dots{display:inline-flex;gap:4px;vertical-align:middle;margin-right:6px}
  .dot{width:12px;height:12px;border-radius:50%;border:1px solid #0006;display:inline-block}
  table{width:100%;border-collapse:collapse;font-size:12.5px;margin:6px 0 0}
  th,td{text-align:left;padding:6px 8px;border-bottom:1px solid var(--line);vertical-align:top}
  th{color:var(--muted);font-weight:700;white-space:nowrap;font-size:11.5px}
  .fam{font-family:ui-monospace,SFMono-Regular,monospace;font-size:12px}
  .num{font-variant-numeric:tabular-nums;white-space:nowrap}
  .tag{display:inline-block;padding:1px 8px;margin:0 4px 4px 0;border-radius:999px;border:1px solid var(--line);color:var(--muted);font-size:11px;white-space:nowrap}
  .foot{display:flex;flex-wrap:wrap;gap:12px;align-items:center;justify-content:space-between;margin-top:10px;font-size:12px;color:var(--muted)}
  .foot a{color:var(--accent);font-weight:700;text-decoration:none;white-space:nowrap}
  code{background:#0b0c10;border:1px solid var(--line);border-radius:6px;padding:1px 5px;font-size:11.5px}
  .empty{color:var(--muted);padding:20px 0}
  footer{max-width:1200px;margin:0 auto;padding:16px 20px 40px;color:var(--muted);font-size:12px}
  a{color:var(--accent)}
  @media (max-width:760px){ .hideSm{display:none} main{padding:10px 12px 40px} header{padding:18px 12px 8px} }
</style>
</head>
<body>
<header>
  <h1>📦 trk! パックの一覧 <span id="total"></span></h1>
  <p class="lead">${packs.length} パック・書体 ${fontCount} 本・合計 ${fmtMB(totalBytes)} MB。パックごとに <b>中に何が入っているか</b>（書体・雰囲気のタグ・大きさ・ライセンス）を見られます。
    外部からは何も読みません（オフラインで開けます）。書体から探すときは <a href="fonts.html">🔤 書体の一覧と検索</a> へ
    （アプリの「🔤 入れている書体」と同じ並び＝<b>家族名・太さ・パック名</b>で見られます）。</p>
  <div class="tools">
    <input id="q" type="search" placeholder="🔍 パック名・説明・family・ひとこと・タグで絞る（例：丸ゴ / TrkZen / 極太）" autocomplete="off">
    <select id="sort">
      <option value="name">パック名（50 音順）</option>
      <option value="size">大きさ順（小さい順）</option>
      <option value="fonts">書体の数（少ない順）</option>
    </select>
    <button type="button" id="reset">絞り込みを解除</button>
  </div>
  <div class="chips" id="chips"></div>
  <p class="count" id="count"></p>
</header>
<main id="cards"></main>
<p class="empty" id="empty" hidden style="max-width:1200px;margin:0 auto;padding:0 20px">見つかりませんでした。言葉を変えるか、「絞り込みを解除」を押してください。</p>
<footer>
  ${packs.length} パック・書体 ${fontCount} 本。目録（<code>catalog/index.json</code>）から作りました。ひとことは <code>catalog/font-notes.json</code>、
  雰囲気のタグは <code>catalog/font-tags.json</code> か、パック自身の <code>pack.json</code>（<code>fonts[].note</code>／<code>fonts[].tags</code>）にあります。
  このページはパックの中身を展開せず、目録の値をそのまま並べています。GPL-3.0-or-later。
</footer>
<script id="packs" type="application/json">${JSON_SAFE}</script>
<script>
(function () {
  var DATA = JSON.parse(document.getElementById("packs").textContent);
  var TAGS = DATA.tags;
  var packs = DATA.packs;
  var state = { q: "", tag: "", sort: "name" };

  function fmtBytes(n) {
    if (!n) return "—";
    if (n < 1024) return n + " B";
    if (n < 1048576) return (n / 1024).toFixed(1) + " KB";
    return (n / 1048576).toFixed(1) + " MB";
  }
  function haystack(p) {
    return [p.name, p.file, p.description, p.skin, p.author, p.license,
      p.fonts.map(function (f) { return [f.family, f.note || "", (f.tags || []).join(" ")].join(" "); }).join(" ")]
      .join(" ").toLowerCase();
  }
  packs.forEach(function (p) { p._h = haystack(p); });

  var chips = document.getElementById("chips");
  var all = document.createElement("button");
  all.type = "button"; all.className = "chip on"; all.textContent = "すべて";
  all.addEventListener("click", function () { state.tag = ""; sync(); render(); });
  chips.appendChild(all);
  TAGS.forEach(function (t) {
    var b = document.createElement("button");
    b.type = "button"; b.className = "chip"; b.textContent = t; b.dataset.tag = t;
    b.addEventListener("click", function () { state.tag = state.tag === t ? "" : t; sync(); render(); });
    chips.appendChild(b);
  });
  function sync() {
    Array.prototype.forEach.call(chips.children, function (x) {
      x.classList.toggle("on", x.dataset.tag ? x.dataset.tag === state.tag : state.tag === "");
    });
  }

  function matches(p) {
    if (state.tag && p.tags.indexOf(state.tag) < 0) return false;
    var words = state.q.trim().toLowerCase().split(/\\s+/).filter(Boolean);
    for (var i = 0; i < words.length; i++) { if (p._h.indexOf(words[i]) < 0) return false; }
    return true;
  }

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  function card(p) {
    var c = el("section", "card");

    var h = el("h2");
    h.appendChild(document.createTextNode(p.name));
    h.appendChild(el("small", "", p.file));
    c.appendChild(h);

    var badges = el("div", "badges");
    if (p.version) badges.appendChild(el("span", "badge", "版 " + p.version));
    badges.appendChild(el("span", "badge size", fmtBytes(p.bytes)));
    badges.appendChild(el("span", "badge", "書体 " + p.fonts.length + " 本"));
    if (p.songs) badges.appendChild(el("span", "badge", "曲 " + p.songs));
    if (p.skin) badges.appendChild(el("span", "badge", "スキン「" + p.skin + "」"));
    p.tags.forEach(function (t) { badges.appendChild(el("span", "badge", t)); });
    c.appendChild(badges);

    if (p.description) c.appendChild(el("p", "desc", p.description));

    if (p.fonts.length) {
      var t = el("table");
      var thead = el("thead"), hr = el("tr");
      ["家族名（family）", "太さ", "ひとこと", "タグ", "対応字数", "大きさ"].forEach(function (name, i) {
        var th = el("th", i >= 4 ? "hideSm" : "", name);
        hr.appendChild(th);
      });
      thead.appendChild(hr); t.appendChild(thead);
      var tb = el("tbody");
      p.fonts.forEach(function (f) {
        var tr = el("tr");
        tr.appendChild(el("td", "fam", f.family));
        tr.appendChild(el("td", "num", f.weight === undefined ? "400" : String(f.weight)));
        tr.appendChild(el("td", "", f.note || "—"));
        var tdTags = el("td");
        (f.tags || []).forEach(function (x) { tdTags.appendChild(el("span", "tag", x)); });
        tr.appendChild(tdTags);
        tr.appendChild(el("td", "num hideSm", f.cmap ? f.cmap.toLocaleString("ja") + " 字" : "—"));
        tr.appendChild(el("td", "num hideSm", f.bytes ? fmtBytes(f.bytes) : "—"));
        tb.appendChild(tr);
      });
      t.appendChild(tb);
      c.appendChild(t);
    }

    var foot = el("div", "foot");
    var left = el("div");
    if (p.colors && p.colors.stage && p.colors.accent) {
      var dots = el("span", "dots");
      [p.colors.stage, p.colors.accent].forEach(function (col) {
        var d = el("span", "dot"); d.style.background = col; dots.appendChild(d);
      });
      left.appendChild(dots);
    }
    left.appendChild(document.createTextNode((p.license || "") + (p.sha256 ? " ・ sha256 " + p.sha256.slice(0, 12) + "…" : "")));
    foot.appendChild(left);

    var right = el("div");
    if (p.fonts.length) {
      var fl = el("a", "", "🔤 書体から見る（家族名・太さ・パック名）");
      fl.href = "fonts.html";
      fl.style.marginRight = "12px";
      right.appendChild(fl);
    }
    var a = el("a", "", "⬇ .stpack");
    a.href = p.download; a.setAttribute("download", "");
    right.appendChild(a);
    foot.appendChild(right);
    c.appendChild(foot);
    return c;
  }

  function render() {
    var list = packs.filter(matches);
    if (state.sort === "size") list.sort(function (a, b) { return (a.bytes || 0) - (b.bytes || 0) || a.name.localeCompare(b.name, "ja"); });
    else if (state.sort === "fonts") list.sort(function (a, b) { return a.fonts.length - b.fonts.length || a.name.localeCompare(b.name, "ja"); });
    else list.sort(function (a, b) { return a.name.localeCompare(b.name, "ja"); });

    var host = document.getElementById("cards");
    host.textContent = "";
    document.getElementById("empty").hidden = list.length > 0;
    document.getElementById("count").textContent = list.length === packs.length
      ? ""
      : "（" + list.length + " パック／" + packs.length + "・絞り込み中）";
    list.forEach(function (p) { host.appendChild(card(p)); });
  }

  document.getElementById("q").addEventListener("input", function (e) { state.q = e.target.value; render(); });
  document.getElementById("sort").addEventListener("change", function (e) { state.sort = e.target.value; render(); });
  document.getElementById("reset").addEventListener("click", function () {
    state.q = ""; state.tag = "";
    document.getElementById("q").value = "";
    sync(); render();
  });

  document.getElementById("total").textContent = "（" + packs.length + " パック・書体 " + DATA.packs.reduce(function (n, p) { return n + p.fonts.length; }, 0) + " 本）";
  render();
})();
</script>
</body>
</html>
`;

if (checkOnly) {
  const prev = fs.existsSync(outHtml) ? fs.readFileSync(outHtml, "utf8") : "";
  if (prev !== html) {
    console.error(`❌ ${rel(outHtml)} が今の中身と合っていません。node tools/export-pack-gallery.mjs で作り直してください`);
    process.exit(1);
  }
  console.log(`✅ パックの一覧は最新です（${packs.length} パック・書体 ${fontCount} 本・タグ ${tagList.length} 種）`);
  process.exit(0);
}
fs.mkdirSync(path.dirname(outHtml), { recursive: true });
fs.writeFileSync(outHtml, html, "utf8");
console.log(`✅ ${packs.length} パック・書体 ${fontCount} 本・タグ ${tagList.length} 種`);
console.log(`   ${rel(outHtml)}  ${fs.statSync(outHtml).size.toLocaleString()} B`);
