#!/usr/bin/env node
// SPDX-License-Identifier: GPL-3.0-or-later
/* 🔤 trk! の「書体の一覧と検索」を作る（2026-11-01・L13／L14）

   なぜ要るか：
     書体パックが 15 種（22 ウェイト）になり、**名前とローマ字の family だけでは選べません**。
     trk-PWA からのお願い（2026-11-01 の手紙 L13・L14）は
       「倉庫＝配る前に選ぶ」「アプリ＝入れた後に選ぶ」の**手前**を倉庫が受け持つ、という分担です。

   作るもの：
     gallery/fonts.html … 1ファイルで開ける一覧（外部参照 0・オフラインOK）
     catalog/fonts.json … 同じ中身の JSON（機械が読む用）

   書体そのもの（woff2・26.5 MB）は HTML に埋めません。
     埋めると重いうえ、**アプリで見える姿と違う**（自分の端末の書体で出てしまう）ためです。
     見た目は trk! の「🔤 同梱の書体」で確かめる導線にし、ここでは
     名前・family・太さ・対応字数（cmap）・大きさ・ライセンス・ひとこと（note）・タグ・パック名を並べます。

   できること（L13・L14）：
     ・並べ替え：パック名（50 音順）／大きさ順／対応字数順／太さの数
     ・絞り込み：雰囲気（tags）／ライセンス／2 ウェイト有無／大きさ
     ・検索：パック名・family・ひとこと・タグ・スキン名を横断（日本語の部分一致）
     ・**1 本だけ欲しい人**のために、行ごとに .stpack への相対リンク（セットを展開した中でそのまま辿れる）

   使い方：
     node tools/export-font-gallery.mjs                 … 作り直す
     node tools/export-font-gallery.mjs --check         … 作らずに、いまのファイルと合っているかだけ見る（CI 用）
     node tools/export-font-gallery.mjs --out=gallery/fonts.html --json=catalog/fonts.json

   出どころ：catalog/index.json（目録そのもの）。目録に無い書体は載りません（＝配るものと一覧がずれない）。
*/
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const argv = Object.fromEntries(process.argv.slice(2).map(a => {
  const m = /^--([^=]+)=(.*)$/.exec(a); return m ? [m[1], m[2]] : [a.replace(/^--/, ""), true];
}));
if (argv.help || argv.h) {
  console.log("使い方: node tools/export-font-gallery.mjs [--out=gallery/fonts.html] [--json=catalog/fonts.json] [--check]");
  process.exit(0);
}
const checkOnly = !!argv.check;
const outHtml = path.resolve(HERE, String(argv.out || "gallery/fonts.html"));
const outJson = path.resolve(HERE, String(argv.json || "catalog/fonts.json"));
const rel = p => path.relative(HERE, p).split(path.sep).join("/");
const formatBytes = n => {
  const v = Number(n) || 0;
  if (v < 1024) return `${v} B`;
  if (v < 1048576) return `${(v / 1024).toFixed(1)} KB`;
  return `${(v / 1048576).toFixed(1)} MB`;
};

const catalogPath = path.join(HERE, "catalog/index.json");
if (!fs.existsSync(catalogPath)) { console.error("❌ catalog/index.json がありません（node tools/build-catalog.mjs）"); process.exit(1); }
const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));

/* 目録から、書体を持つパックだけを写す（表示に要る項目だけ・順は目録のまま） */
const packs = [];
for (const p of catalog.packs || []) {
  if (!Array.isArray(p.fonts) || !p.fonts.length) continue;
  packs.push({
    file: p.file,
    name: p.name || "",
    description: p.description || "",
    release: p.version || "",
    bytes: p.bytes || 0,
    skin: (p.skin && p.skin.name) || "",
    colors: p.colors || null,
    /* セットを展開した中でも、倉庫の中でも辿れる相対パス（HTML は gallery/ に置く） */
    download: `../${p.file}`,
    fonts: p.fonts.map(f => ({
      family: f.family || "",
      file: f.file || "",
      ...(Number.isInteger(f.weight) ? { weight: f.weight } : {}),
      license: f.license || "",
      ...(f.licenseFile ? { licenseFile: f.licenseFile } : {}),
      ...(Number.isInteger(f.bytes) ? { bytes: f.bytes } : {}),
      ...(f.note ? { note: f.note } : {}),
      ...(Number.isInteger(f.cmap) ? { cmap: f.cmap } : {}),
      ...(Array.isArray(f.tags) && f.tags.length ? { tags: f.tags.slice() } : {}),
    })),
  });
}

const tagCount = {};
for (const p of packs) for (const f of p.fonts) for (const t of f.tags || []) tagCount[t] = (tagCount[t] || 0) + 1;
const fontCount = packs.reduce((n, p) => n + p.fonts.length, 0);
const familyCount = new Set(packs.flatMap(p => p.fonts.map(f => f.family))).size;

const data = {
  format: "trk-avatar-library-fonts",
  version: 1,
  generatedAt: new Date().toISOString(),
  source: "catalog/index.json",
  count: packs.length,
  fonts: fontCount,
  families: familyCount,
  tags: tagCount,
  packs,
};

const drift = [];
function emit(file, text) {
  if (!checkOnly) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, text, "utf8");
    return;
  }
  const norm = t => t.replace(/("generatedAt":\s*)"[^"]*"/g, '$1""');
  const prev = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
  if (norm(prev) !== norm(text)) drift.push(rel(file));
}
emit(outJson, JSON.stringify(data, null, 2) + "\n");

const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const JSON_SAFE = JSON.stringify(data).replace(/</g, "\\u003c");
const JSON_SAFE_TAGS = JSON.stringify(data.tags && Object.keys(data.tags).length ? Object.entries(data.tags).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "ja")).map(([t]) => t) : []).replace(/</g, "\\u003c");
const tagList = Object.entries(tagCount).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "ja")).map(([t]) => t);

const html = `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>trk! 書体の一覧と検索（${packs.length} パック・${fontCount} ウェイト）— trk-Avatar-Library</title>
<meta name="description" content="trk! に入れられる書体パック ${packs.length} 種を、対応字数・大きさ・雰囲気で選べる一覧です。外部からは何も読みません。">
<style>
  :root{ --bg:#0b0c10; --panel:#14161d; --line:#2a2e3a; --text:#f2f3f7; --muted:#a9adbd; --accent:#ff3b55; --ok:#5ad19a; }
  *{box-sizing:border-box}
  body{margin:0;background:var(--bg);color:var(--text);font:15px/1.6 system-ui,-apple-system,"Segoe UI","Noto Sans JP",sans-serif}
  header{padding:22px 20px 10px;max-width:1200px;margin:0 auto}
  h1{font-size:22px;margin:0 0 6px}
  .lead{color:var(--muted);font-size:13px;margin:0 0 14px}
  .tools{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin:0 0 8px}
  .tools input{flex:1 1 260px;padding:9px 12px;border-radius:10px;border:1px solid var(--line);background:var(--panel);color:var(--text);font:inherit}
  .tools select{padding:9px 12px;border-radius:10px;border:1px solid var(--line);background:var(--panel);color:var(--text);font:inherit}
  .tools button{padding:9px 14px;border-radius:10px;border:1px solid var(--line);background:var(--panel);color:var(--text);font:inherit;cursor:pointer}
  .chips{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0 4px}
  .chip{padding:5px 12px;border-radius:999px;border:1px solid var(--line);background:var(--panel);color:var(--text);font-size:13px;font-weight:700;cursor:pointer}
  .chip.on{background:var(--accent);border-color:var(--accent);color:#fff}
  .count{color:var(--muted);font-size:13px;margin:6px 0 0}
  main{max-width:1200px;margin:0 auto;padding:10px 20px 60px}
  table{width:100%;border-collapse:collapse;font-size:13px}
  th,td{text-align:left;padding:8px 10px;border-bottom:1px solid var(--line);vertical-align:top}
  th{color:var(--muted);font-weight:700;white-space:nowrap;font-size:12px}
  tr:hover td{background:#12141b}
  .fam{font-family:ui-monospace,SFMono-Regular,monospace;font-size:12px;color:var(--text)}
  .pname{font-weight:700}
  .pname small{display:block;color:var(--muted);font-weight:400;font-family:ui-monospace,monospace;font-size:11px}
  .note{color:var(--text);opacity:.92}
  .tag{display:inline-block;padding:1px 8px;margin:0 4px 4px 0;border-radius:999px;border:1px solid var(--line);color:var(--muted);font-size:11px;white-space:nowrap}
  .num{font-variant-numeric:tabular-nums;white-space:nowrap}
  .dl a{color:var(--accent);font-weight:700;text-decoration:none;white-space:nowrap}
  .dl small{display:block;color:var(--muted);font-size:11px}
  .empty{color:var(--muted);padding:20px 0}
  .howto{border:1px solid var(--line);background:var(--panel);border-radius:14px;padding:12px 16px;margin:16px 0 0;font-size:13px;color:var(--text)}
  .howto h2{font-size:14px;margin:0 0 6px}
  .howto ol{margin:6px 0 0;padding-left:20px}
  .howto code{background:#0b0c10;border:1px solid var(--line);border-radius:6px;padding:1px 5px;font-size:12px}
  footer{max-width:1200px;margin:0 auto;padding:16px 20px 40px;color:var(--muted);font-size:12px}
  a{color:var(--accent)}
  @media (max-width:760px){ .hideSm{display:none} }
</style>
</head>
<body>
<header>
  <h1>🔤 trk! 書体の一覧と検索 <span id="total"></span></h1>
  <p class="lead">${packs.length} パック・${fontCount} ウェイトを<b>家族名（family）</b>と太さで並べています（アプリの 🔤 索引と同じ並び）。<b>対応字数・大きさ・雰囲気</b>でも選べます。外部からは何も読みません（オフラインで開けます）。
    書体そのものは各パックの <code>.stpack</code> に入っています。実際の見た目は、trk! に入れて「🔤 同梱の書体」と本文で確かめてください（このページは書体ファイルを読み込みません）。</p>
  <div class="tools">
    <input id="q" type="search" placeholder="🔍 家族名・パック名・ひとこと・タグで絞る（例：明朝 / TrkZen / 見出し）" autocomplete="off">
    <select id="sort">
      <option value="name">パック名（50 音順）</option>
      <option value="size">大きさ順（小さい順）</option>
      <option value="cmap">対応字数順（少ない順）</option>
      <option value="weights">太さの数（少ない順）</option>
    </select>
    <select id="license"><option value="">ライセンス（すべて）</option></select>
    <select id="weights"><option value="">太さ（すべて）</option><option value="1">1 ウェイト</option><option value="2">2 ウェイト以上</option></select>
    <select id="size"><option value="">大きさ（すべて）</option><option value="1000000">1 MB 以下</option><option value="2000000">2 MB 以下</option><option value="4000000">4 MB 以下</option><option value="10000000">10 MB 以下</option></select>
    <button type="button" id="reset">絞り込みを解除</button>
  </div>
  <div class="chips" id="chips"></div>
  <p class="count" id="count"></p>
</header>
<main>
  <table>
    <thead><tr>
      <th>家族名（family）</th><th>パック名</th><th>太さ</th><th class="hideSm">対応字数</th><th class="hideSm">大きさ</th>
      <th class="hideSm">ライセンス</th><th>ひとこと</th><th class="hideSm">タグ</th><th>落とす</th>
    </tr></thead>
    <tbody id="rows"></tbody>
  </table>
  <p class="empty" id="empty" hidden>見つかりませんでした。言葉を変えるか、「絞り込みを解除」を押してください。</p>
  <section class="howto">
    <h2>1 本だけ入れたいとき</h2>
    <ol>
      <li>表の右の「⬇ .stpack」を落とす（セットを展開しているときは、その中の <code>font-packs/</code> に同じものがあります）</li>
      <li>trk! を開いて 設定 → 📦 カスタムパック → 📚 目録から入れる で、<b>目録（catalog/index.json）</b>を選ぶ</li>
      <li>一覧の行の「この .stpack を選ぶ」で、落とした 1 本を選ぶ（大きさと sha256 が目録と照合されます）</li>
      <li>入れたら、その行の「使う」で本文の書体が変わります（trk232 以降・外すと元に戻ります）</li>
    </ol>
    <p style="margin:8px 0 0;color:var(--muted)">まとめて入れるなら <a href="all-skins.html">見本（all-skins.html）</a> と一緒に「📥 まとめて入れる」が早いです。ライセンス全文は各パックの <code>fonts/OFL.txt</code>（目録の <code>fonts[].licenseFile</code>）にあります。</p>
  </section>
</main>
<footer>
  ${packs.length} パック・${fontCount} ウェイト・${familyCount} 家族。目録（<code>catalog/index.json</code>）から作りました。
  雰囲気のタグは <code>catalog/font-tags.json</code>、ひとことは <code>catalog/font-notes.json</code>（パックの中身は変えていません）。GPL-3.0-or-later。
</footer>
<script id="fonts" type="application/json">${JSON_SAFE}</script>
<script>
(function () {
  var DATA = JSON.parse(document.getElementById("fonts").textContent);
  var TAGS = ${JSON_SAFE_TAGS};
  var state = { q: "", tag: "", license: "", weights: "", size: 0, sort: "name" };
  var packs = DATA.packs;

  function familiesOf(p) { var o = []; p.fonts.forEach(function (f) { if (o.indexOf(f.family) < 0) o.push(f.family); }); return o; }
  function weightsOf(p) { var o = []; p.fonts.forEach(function (f) { var w = f.weight === undefined ? 400 : f.weight; if (o.indexOf(w) < 0) o.push(w); }); return o.sort(function (a,b) { return a-b; }); }
  function notesOf(p) { var o = []; p.fonts.forEach(function (f) { if (f.note && o.indexOf(f.note) < 0) o.push(f.note); }); return o; }
  function tagsOf(p) { var o = []; p.fonts.forEach(function (f) { (f.tags || []).forEach(function (t) { if (o.indexOf(t) < 0) o.push(t); }); }); return o; }
  function cmapOf(p) { var n = 0; p.fonts.forEach(function (f) { if (f.cmap && f.cmap > n) n = f.cmap; }); return n; }
  function fontBytesOf(p) { var n = 0; p.fonts.forEach(function (f) { if (f.bytes) n += f.bytes; }); return n; }
  function haystack(p) {
    return [p.name, p.file, p.skin, p.description, familiesOf(p).join(" "), notesOf(p).join(" "), tagsOf(p).join(" ")].join(" ").toLowerCase();
  }
  packs.forEach(function (p) { p._h = haystack(p); p._fw = weightsOf(p); p._tags = tagsOf(p); p._cmap = cmapOf(p); p._note = notesOf(p).join(" ／ "); });

  /* ライセンスの選択肢（目録にあるものだけ） */
  var lics = []; packs.forEach(function (p) { p.fonts.forEach(function (f) { if (f.license && lics.indexOf(f.license) < 0) lics.push(f.license); }); });
  var lsel = document.getElementById("license");
  lics.sort().forEach(function (l) { var o = document.createElement("option"); o.value = l; o.textContent = "ライセンス: " + l; lsel.appendChild(o); });

  var chips = document.getElementById("chips");
  var all = document.createElement("button");
  all.type = "button"; all.className = "chip on"; all.textContent = "すべて";
  all.addEventListener("click", function () { state.tag = ""; sync(); });
  chips.appendChild(all);
  TAGS.forEach(function (t) {
    var b = document.createElement("button");
    b.type = "button"; b.className = "chip"; b.textContent = t;
    b.dataset.tag = t;
    b.addEventListener("click", function () { state.tag = state.tag === t ? "" : t; sync(); });
    chips.appendChild(b);
  });
  function sync() {
    Array.prototype.forEach.call(chips.children, function (x) {
      x.classList.toggle("on", x.dataset.tag ? x.dataset.tag === state.tag : state.tag === "");
    });
  }

  function matches(p) {
    if (state.tag && p._tags.indexOf(state.tag) < 0) return false;
    if (state.license && !p.fonts.some(function (f) { return f.license === state.license; })) return false;
    if (state.weights === "1" && p._fw.length !== 1) return false;
    if (state.weights === "2" && p._fw.length < 2) return false;
    if (state.size && !(p.bytes > 0 && p.bytes <= state.size)) return false;
    var words = state.q.trim().toLowerCase().split(/\\s+/).filter(Boolean);
    for (var i = 0; i < words.length; i++) { if (p._h.indexOf(words[i]) < 0) return false; }
    return true;
  }

  function render() {
    var list = packs.filter(matches);
    if (state.sort === "name") list.sort(function (a, b) { return a.name.localeCompare(b.name, "ja"); });
    else if (state.sort === "size") list.sort(function (a, b) { return (a.bytes || 0) - (b.bytes || 0) || a.name.localeCompare(b.name, "ja"); });
    else if (state.sort === "cmap") list.sort(function (a, b) { return a._cmap - b._cmap || a.name.localeCompare(b.name, "ja"); });
    else if (state.sort === "weights") list.sort(function (a, b) { return a._fw.length - b._fw.length || a.name.localeCompare(b.name, "ja"); });

    var tbody = document.getElementById("rows");
    tbody.textContent = "";
    document.getElementById("empty").hidden = list.length > 0;
    document.getElementById("count").textContent = list.length === packs.length
      ? "（" + packs.length + " パック・" + DATA.fonts + " ウェイト）"
      : "（" + list.length + " パック／" + packs.length + "・絞り込み中）";

    list.forEach(function (p) {
      var tr = document.createElement("tr");

      var tdFam = document.createElement("td");
      var fam = document.createElement("div"); fam.className = "fam"; fam.textContent = familiesOf(p).join(", ");
      tdFam.appendChild(fam);
      if (p._tags.length) { var tg = document.createElement("div"); tg.style.marginTop = "4px"; p._tags.forEach(function (t) { var s = document.createElement("span"); s.className = "tag"; s.textContent = t; tg.appendChild(s); }); tdFam.appendChild(tg); }

      var tdName = document.createElement("td");
      tdName.className = "pname"; tdName.textContent = p.name;
      var small = document.createElement("small"); small.textContent = p.file + (p.skin && p.skin !== p.name.replace(/（[^）]*）$/, "") ? " · スキン「" + p.skin + "」" : ""); tdName.appendChild(small);

      var tdW = document.createElement("td"); tdW.className = "num"; tdW.textContent = p._fw.join(" / ");

      var tdCmap = document.createElement("td"); tdCmap.className = "num hideSm";
      tdCmap.textContent = p._cmap ? p._cmap.toLocaleString("ja") + " 字" : "—";

      var tdSize = document.createElement("td"); tdSize.className = "num hideSm";
      tdSize.textContent = p.bytes ? p.bytes.toLocaleString("ja") + " B" : "—";
      var smallSize = document.createElement("small"); smallSize.style.display = "block"; smallSize.style.color = "var(--muted)";
      smallSize.textContent = p.bytes ? (p.bytes / 1048576).toFixed(1) + " MB" : "";
      tdSize.appendChild(smallSize);

      var tdLic = document.createElement("td"); tdLic.className = "hideSm";
      tdLic.textContent = lics.filter(function (l) { return p.fonts.some(function (f) { return f.license === l; }); }).join(", ");
      if (p.fonts.some(function (f) { return f.licenseFile; })) {
        var lf = document.createElement("small"); lf.style.display = "block"; lf.style.color = "var(--muted)"; lf.style.fontFamily = "ui-monospace,monospace";
        lf.textContent = p.fonts[0].licenseFile; tdLic.appendChild(lf);
      }

      var tdNote = document.createElement("td"); tdNote.className = "note"; tdNote.textContent = p._note || "—";

      var tdTags = document.createElement("td"); tdTags.className = "hideSm";
      p._tags.forEach(function (t) { var s = document.createElement("span"); s.className = "tag"; s.textContent = t; tdTags.appendChild(s); });

      var tdDl = document.createElement("td"); tdDl.className = "dl";
      var a = document.createElement("a"); a.href = p.download; a.setAttribute("download", ""); a.textContent = "⬇ .stpack";
      var dsmall = document.createElement("small"); dsmall.textContent = "1 本だけ";
      tdDl.appendChild(a); tdDl.appendChild(dsmall);

      tr.append(tdFam, tdName, tdW, tdCmap, tdSize, tdLic, tdNote, tdTags, tdDl);
      tbody.appendChild(tr);
    });
  }

  document.getElementById("q").addEventListener("input", function (e) { state.q = e.target.value; render(); });
  document.getElementById("sort").addEventListener("change", function (e) { state.sort = e.target.value; render(); });
  document.getElementById("license").addEventListener("change", function (e) { state.license = e.target.value; render(); });
  document.getElementById("weights").addEventListener("change", function (e) { state.weights = e.target.value; render(); });
  document.getElementById("size").addEventListener("change", function (e) { state.size = Number(e.target.value) || 0; render(); });
  document.getElementById("reset").addEventListener("click", function () {
    state = { q: "", tag: "", license: "", weights: "", size: 0, sort: state.sort };
    document.getElementById("q").value = ""; document.getElementById("license").value = "";
    document.getElementById("weights").value = ""; document.getElementById("size").value = "";
    sync(); render();
  });

  document.getElementById("total").textContent = "（" + DATA.count + " パック・" + DATA.fonts + " ウェイト）";
  render();
})();
</script>
</body>
</html>
`;
emit(outHtml, html);

if (checkOnly) {
  if (drift.length) {
    console.error(`❌ ${drift.join("・")} が今の中身と合っていません。node tools/export-font-gallery.mjs で作り直してください`);
    process.exit(1);
  }
  console.log(`✅ 書体の一覧は最新です（${packs.length} パック・${fontCount} ウェイト・タグ ${tagList.length} 種）`);
  process.exit(0);
}
console.log(`✅ ${packs.length} パック・${fontCount} ウェイト・タグ ${tagList.length} 種`);
console.log(`   ${rel(outHtml)}  ${fs.statSync(outHtml).size.toLocaleString()} B`);
console.log(`   ${rel(outJson)}  ${fs.statSync(outJson).size.toLocaleString()} B`);
