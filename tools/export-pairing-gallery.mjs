#!/usr/bin/env node
// SPDX-License-Identifier: GPL-3.0-or-later
/* 🎨 書体の組み合わせ見本（gallery/pairings.html）を作る（2026-11-01）

   なぜ要るか：
     「有名・変わった・人気の書体を組み合わせて、エディターとして設定を細分化できるか」という相談に、
     言葉ではなく**見て触れるもの**で返すため。14 組の組み合わせを、題字・見出し・本文・注記を
     **本物の書体**で並べ、倍率・字間・行間・役ごとの書体をその場で変えられる試作を付けます。

   作るもの：
     gallery/pairings.html … 1 ファイル・外部参照 0（書体は base64 で埋め込み・オフラインで開ける）

   埋める書体：
     catalog/preview/*.woff2（python3 tools/build-preview-fonts.py が作る「見本の字だけの woff2」）。
     本物の書体は各パック（.stpack）の中にあり、ここで埋めるのは**見本のための抜き出し**です。

   使い方：
     python3 tools/build-preview-fonts.py        … 見本用の woff2 を作り直す（見本の文を変えたとき）
     node tools/export-pairing-gallery.mjs       … gallery/pairings.html を作る
     node tools/export-pairing-gallery.mjs --check … 作らずに、今のファイルと合っているかだけ見る（CI 用）
*/
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const argv = process.argv.slice(2);
const checkOnly = argv.includes("--check");
const OUT = path.join(HERE, "gallery/pairings.html");
const BUNDLE = path.join(HERE, "catalog/typography-preview.json");
const CLIENT = path.join(HERE, "tools/lib/pairings-client.js");

const read = p => fs.readFileSync(p, "utf8");
const typo = JSON.parse(read(path.join(HERE, "catalog/typography.json")));
const index = JSON.parse(read(path.join(HERE, "catalog/index.json")));
const previewDir = path.join(HERE, "catalog/preview");

/* 見本用の woff2（無ければ、先に作るよう言って止まる） */
if (!fs.existsSync(previewDir)) {
  console.error("❌ catalog/preview/ がありません。先に `python3 tools/build-preview-fonts.py` を実行してください");
  process.exit(2);
}
const previews = [];
for (const name of fs.readdirSync(previewDir).sort()) {
  if (!name.endsWith(".woff2")) continue;
  const m = name.replace(/\.woff2$/, "").match(/^(.*)-(\d+)$/);
  if (!m) continue;
  previews.push({ family: m[1], weight: Number(m[2]), b64: fs.readFileSync(path.join(previewDir, name)).toString("base64") });
}
if (!previews.length) {
  console.error("❌ catalog/preview/ に woff2 がありません。`python3 tools/build-preview-fonts.py` を実行してください");
  process.exit(2);
}
const previewKeys = new Set(previews.map(p => `${p.family}|${p.weight}`));
const fontCount = index.packs.flatMap(p => p.fonts || []).length;

/* 見本に本物が無い書体は、ページの下で「見本外」と分かるように名指ししておく */
const missing = new Set();
for (const p of typo.pairings) {
  for (const [role, s] of Object.entries(p.slots)) {
    if (!["display", "heading", "body", "caption"].includes(role)) continue;
    if (!previewKeys.has(`${s.family}|${s.weight}`)) missing.add(`${s.family} ${s.weight}`);
  }
}

const DATA = {
  typography: typo,
  previews,
  generatedAt: typo.generatedAt,
  fontCount,
  packCount: index.packs.length,
};

const CSS = `
:root{
  --bg:#101319;--panel:#181d26;--panel2:#1f2530;--text:#eef1f6;--muted:#a3adbd;--line:#2b3240;
  --accent:#7cc7ff;--gold:#ffd479;--ok:#8ee6a8;
}
@media (prefers-color-scheme:light){
  :root{--bg:#f6f7fa;--panel:#ffffff;--panel2:#eef1f6;--text:#161a21;--muted:#5a6472;--line:#d8dee8;--accent:#1d6fd0;--gold:#9a6b00;--ok:#1d7a3c}
}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--text);font:16px/1.7 system-ui,"Hiragino Sans","Noto Sans JP",sans-serif}
header.top{padding:28px 20px 18px;max-width:1100px;margin:0 auto}
h1{font-size:26px;margin:0 0 8px;letter-spacing:.01em}
h2{font-size:19px;margin:34px 0 10px;padding-bottom:6px;border-bottom:1px solid var(--line)}
h3{font-size:17px;margin:0}
.lead{color:var(--muted);margin:0;max-width:70ch}
nav{display:flex;gap:8px;flex-wrap:wrap;margin:16px 0 0}
nav button{background:var(--panel);color:var(--text);border:1px solid var(--line);border-radius:999px;padding:6px 12px;font:inherit;font-size:13px;cursor:pointer}
nav button:hover{border-color:var(--accent)}
main{max-width:1100px;margin:0 auto;padding:0 20px 60px}
table{width:100%;border-collapse:collapse;font-size:14px}
th,td{text-align:left;padding:7px 8px;border-bottom:1px solid var(--line);vertical-align:top}
th{color:var(--muted);font-weight:600;white-space:nowrap}
code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12.5px;background:var(--panel2);padding:1px 5px;border-radius:4px}
.cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(330px,1fr));gap:14px;margin-top:12px}
.card{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:14px 15px;display:flex;flex-direction:column;gap:10px}
.card header{display:flex;flex-direction:column;gap:4px}
.card h3 small{display:block;color:var(--muted);font-size:11.5px;font-weight:400;margin-top:2px}
.why{margin:0;font-size:13.5px;color:var(--text)}
.use{margin:0;font-size:12.5px;color:var(--muted)}
.tag{display:inline-block;font-size:11.5px;color:var(--muted);border:1px solid var(--line);border-radius:999px;padding:1px 8px;margin:2px 4px 0 0}
.spec{background:var(--panel2);border-radius:10px;padding:12px 13px;display:flex;flex-direction:column;gap:6px;min-height:150px}
.spec p{margin:0;word-break:normal;overflow-wrap:anywhere}
.spec .r-display{font-weight:700}
.spec .r-caption{color:var(--muted)}
.spec .r-accent{color:var(--gold)}
.spec .r-numeral{font-variant-numeric:tabular-nums}
.fake{font:10px/1 system-ui,sans-serif;color:var(--muted);border:1px dashed var(--line);border-radius:4px;padding:1px 4px;margin-left:6px;vertical-align:super}
details{margin-top:auto}
summary{cursor:pointer;font-size:12.5px;color:var(--muted)}
ul.roles{list-style:none;margin:8px 0 0;padding:0;font-size:12px;display:grid;grid-template-columns:1fr 1fr;gap:3px 10px}
ul.roles li{display:flex;justify-content:space-between;gap:6px;border-bottom:1px dotted var(--line);padding-bottom:2px}
ul.roles li b{color:var(--muted);font-weight:600}
.packs{margin:8px 0 0;font-size:11.5px;color:var(--muted)}
.tune{margin:0}
button.act,.tune button{background:var(--accent);color:#07131d;border:0;border-radius:9px;padding:7px 12px;font:inherit;font-size:13px;font-weight:600;cursor:pointer}
#form table{margin-bottom:10px}
#form select,#form input{font:inherit;font-size:13px;background:var(--panel2);color:var(--text);border:1px solid var(--line);border-radius:7px;padding:4px 6px;width:100%}
#form input[type=number]{width:82px}
.global{display:flex;flex-wrap:wrap;gap:12px;align-items:center;font-size:13px;color:var(--muted)}
.global input,.global select{font:inherit;font-size:13px;background:var(--panel2);color:var(--text);border:1px solid var(--line);border-radius:7px;padding:4px 6px}
.global button{background:var(--panel2);color:var(--text);border:1px solid var(--line);border-radius:9px;padding:6px 11px;font:inherit;font-size:13px;cursor:pointer}
.global button:hover{border-color:var(--accent)}
.editor{display:grid;grid-template-columns:minmax(280px,1fr) minmax(320px,1.15fr);gap:16px;align-items:start}
@media(max-width:820px){.editor{grid-template-columns:1fr}}
.box{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:14px}
pre{background:var(--panel2);border-radius:10px;padding:12px;overflow:auto;font-size:12px;margin:10px 0 0;max-height:260px}
.line{display:flex;justify-content:space-between;align-items:baseline;gap:12px;padding:6px 0;border-bottom:1px dotted var(--line)}
.line .lbl{font-size:12px;color:var(--muted);white-space:nowrap}
.note{font-size:13px;color:var(--muted)}
.warn{background:var(--panel2);border-left:3px solid var(--gold);padding:10px 12px;border-radius:0 8px 8px 0;font-size:13.5px;color:var(--text)}
footer{max-width:1100px;margin:0 auto;padding:20px;color:var(--muted);font-size:12.5px;border-top:1px solid var(--line)}
footer a{color:var(--accent)}
`;

const NAV = [
  ["#roles", "6 つの役"],
  ["#scale", "倍率と字間"],
  ["#pairings", "組み合わせ 14 組"],
  ["#editor", "エディターの試作"],
  ["#contract", "アプリ側へのお願い"],
].map(([href, label]) => `<button type="button" data-jump="${href}">${label}</button>`).join("");

const roleRows = typo.slots.map(s => `<tr><th>${s.label}</th><td>${s.where}</td><td class="note">${s.purpose}</td></tr>`).join("");
const scaleOptions = typo.scales.map(s => `<option value="${s.id}"${s.id === "1.25" ? " selected" : ""}>${s.label}</option>`).join("");
const scaleRows = typo.scales.map(s => `<tr><th>${s.label}</th><td>${s.feel}</td><td class="note">${s.useFor}</td>
  <td><code>題字 ${s.sizes.display}</code> <code>見出し ${s.sizes.heading}</code> <code>本文 ${s.sizes.body}</code> <code>注記 ${s.sizes.caption}</code></td></tr>`).join("");
const trackRows = typo.tracking.map(t => `<tr><th>${t.target}</th><td>${t.min} 〜 ${t.max} em</td><td>${t.default} em</td><td class="note">${t.why}</td></tr>`).join("");
const leadRows = typo.leading.map(t => `<tr><th>${t.target}</th><td>${t.min} 〜 ${t.max}</td><td>${t.default}</td><td class="note">${t.why}</td></tr>`).join("");
const presetRows = typo.presets.map(p => `<tr><th>${p.label}</th><td><code>${p.fields.join("</code> <code>")}</code></td><td class="note">${p.note}</td></tr>`).join("");

const missingNote = missing.size
  ? `<p class="warn">差し色（accent）と数字（numeral）のうち <b>${missing.size}</b> 書体は、見本の woff2 を埋めていません（ページを軽くするため）。その行には「見本外」と出ます。<b>本物は各パックに入っています</b>——trk! に入れて確かめてください。</p>`
  : "";

const HTML = `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>書体の組み合わせと、役ごとの設定（14 組）— trk-Avatar-Library</title>
<style>${CSS}</style>
</head>
<body>
<header class="top">
  <h1>🎨 書体の組み合わせと、役ごとの設定</h1>
  <p class="lead">${typo.pairings.length} 組の組み合わせを、<b>題字・見出し・本文・注記は本物の書体</b>で並べました（${previews.length} 本ぶんの見本を埋め込み）。
    下の「エディターの試作」では、倍率・字間・行間・役ごとの書体をその場で変えて、<b>アプリに持たせる設定の形</b>を試せます。
    このページは 1 ファイル・外部参照 0 です（オフラインで開けます）。</p>
  <nav>${NAV}</nav>
</header>
<main>

<h2 id="roles">1. 6 つの役（やく）</h2>
<p class="lead">いまの trk! は、スキンの書体を <b>1 つ</b>選んで画面の全部に使っています。それを役ごとに分けられるか、が今回の相談です。
最初から 6 つに分けるのではなく、<b>「1 つ」→「見出しと本文の 2 役」→「5 役」</b>と段階を踏めるようにしました（下の 5 章）。</p>
<table><thead><tr><th>役</th><th>どこに出るか</th><th>決めごと</th></tr></thead><tbody>${roleRows}</tbody></table>

<h2 id="scale">2. 倍率と、字間・行間</h2>
<p class="lead">大きさは「本文を 1 として、決まった倍率で掛ける」だけにすると、役を増やしても破綻しません。倍率を変えて大きさの関係を見てください。</p>
<div class="box">
  <label class="note">倍率 <select id="ratio">${scaleOptions}</select></label>
  <div id="ratioDemo"></div>
</div>
<table style="margin-top:12px"><thead><tr><th>倍率</th><th>感じ</th><th>どこで</th><th>大きさ（16px のとき）</th></tr></thead><tbody>${scaleRows}</tbody></table>
<table style="margin-top:14px"><thead><tr><th>字間</th><th>範囲</th><th>既定</th><th>なぜ</th></tr></thead><tbody>${trackRows}</tbody></table>
<table style="margin-top:14px"><thead><tr><th>行間</th><th>範囲</th><th>既定</th><th>なぜ</th></tr></thead><tbody>${leadRows}</tbody></table>
<p class="note">倍率は「モジュラー・スケール」と呼ばれる作り方です（1.125／1.2／1.25／1.333／1.5）。日本語では本文の行間 1.7〜1.9・字間 0.02em 前後が読みやすい、というのが実務の目安でした。</p>

<h2 id="pairings">3. 組み合わせ ${typo.pairings.length} 組</h2>
<p class="lead">どれも「見出し用と本文用を分ける」「家族は 3 つまで」「差し色は 1 語だけ」を守っています。気に入った組の「この組み合わせをエディターで開く」を押すと、下の試作に読み込まれます。</p>
${missingNote}
<div class="cards" id="cards"></div>

<h2 id="editor">4. エディターの試作</h2>
<p class="lead">役ごとに <b>書体・字間・行間</b>を、全体で <b>基本サイズ・倍率</b>を変えられます。右の「設定を JSON で書き出す」を押すと、<b>アプリに保存してもらう形</b>（下の 5 章の案）がそのまま出ます。</p>
<div class="editor">
  <div class="box"><div id="form"></div><p class="note">書体の選択肢は、このページに埋め込んだ見本の書体だけです（ページを軽くするため）。アプリでは全 ${fontCount} 書体から選べます。</p></div>
  <div class="box">
    <div id="editSpecimen" class="spec" style="min-height:200px"></div>
    <pre id="exportJson" hidden></pre>
  </div>
</div>

<h2 id="contract">5. アプリ側と合意した形（2026-11-01・返事13 §3）</h2>
<p class="lead">この倉庫が用意できるのは<b>データと見本</b>までです。設定の形は trk-PWA と<b>合意しました</b>（下の「書き出す」JSON がそのまま <code>settings.typography</code> / <code>pack.json</code> の <code>skin.typography</code> になります）。<b>足すだけ・無くても今までどおり動く</b>形です。</p>
<table><thead><tr><th>段階</th><th>設定の形</th><th>意味</th></tr></thead><tbody>${presetRows}</tbody></table>
<p class="note" style="margin-top:12px">案の要点：</p>
<ul class="note">
  <li><code>skin.font</code>（いまの 1 つ）は<b>そのまま残す</b>。細分化した設定があるときだけ、そちらを優先する</li>
  <li>パックの <code>skin.typography</code>（任意）と、利用者の設定（<code>settings.typography</code>）は<b>同じ形</b>にする（上の「書き出す」JSON）</li>
  <li>書体は <code>family</code>＋<code>weight</code> で指す（<code>pack</code> は「どのパックに入っているか」の覚え書き。無くても動く）</li>
  <li>大きさ（<code>size</code>）は<b>持ちません</b>。<code>base</code> と <code>scale</code> から決めます（出どころを 1 つに）</li>
  <li><code>preset</code> は<b>利用者の段階</b>（<code>one</code>／<code>pair</code>／<code>roles</code>／<code>digits</code>）。14 組そのものは段階を持ちません（どの段階でも使える）</li>
  <li>古いアプリは知らない項目を捨てるだけ（<code>sanitizeSkinDef</code> は今もそう）なので、<b>入れて壊れません</b></li>
  <li>段階は 4 つ：<b>ひとつだけ</b>（いま）→ <b>2 役</b> → <b>5 役</b> → <b>数字だけ別</b></li>
</ul>
<p class="note">くわしい経緯・出どころ・14 組の理由は <code>docs/2026-11-01-書体の組み合わせとエディター設定.md</code>、データは <code>catalog/typography.json</code>、見本は <code>catalog/preview/</code> にあります。</p>

</main>
<footer>
  ${typo.pairings.length} 組・${previews.length} 書体の見本・${index.packs.length} パック／${fontCount} ウェイト。データは <code>catalog/typography.json</code> と <code>catalog/index.json</code> から作りました。
  見本の書体は各パックの woff2 から<b>見本に出す字だけを抜いたもの</b>です（OFL-1.1 と Apache-2.0。全文は各パックの <code>fonts/OFL.txt</code>／<code>fonts/LICENSE.txt</code>）。
  このページは外部から何も読みません。GPL-3.0-or-later。
</footer>
<script id="typ" type="application/json">${JSON.stringify(DATA).replace(/</g, "\\u003c")}</script>
<script>
${read(CLIENT)}
</script>
</body>
</html>
`;

const bundleExpected = {
  version: 1,
  generatedAt: typo.generatedAt,
  about: "組み合わせの見本に要る書体の見本（gallery/pairings.html と同じ中身）を、アプリがこれ 1 本で読めるようにしたもの。"
    + "woff2 は見本の字だけの抜き出し（数千 B〜数十 KB）。書体の本物は各パック（.stpack）にあります。",
  typography: {
    version: typo.version, base: typo.base, slots: typo.slots, scales: typo.scales,
    tracking: typo.tracking, leading: typo.leading, presets: typo.presets, pairings: typo.pairings,
    generatedAt: typo.generatedAt, source: "catalog/typography.json",
  },
  previews,
};
if (checkOnly) {
  if (!fs.existsSync(OUT)) { console.error("❌ gallery/pairings.html がありません（node tools/export-pairing-gallery.mjs）"); process.exit(1); }
  if (read(OUT) !== HTML) { console.error("❌ gallery/pairings.html が古いです（node tools/export-pairing-gallery.mjs）"); process.exit(1); }
  if (!fs.existsSync(BUNDLE) || read(BUNDLE) !== JSON.stringify(bundleExpected) + "\n") {
    console.error("❌ catalog/typography-preview.json が古いです（node tools/export-pairing-gallery.mjs）"); process.exit(1);
  }
  console.log(`✅ 組み合わせの見本は最新です（${typo.pairings.length} 組・${previews.length} 書体・${Buffer.byteLength(HTML).toLocaleString()} B）`);
  process.exit(0);
}

fs.writeFileSync(OUT, HTML);

/* アプリ（trk247 以降）が 1 本で読める形。中身は同じ（woff2 は base64 のまま）。
   「アプリに入っている書体と見本の書体を、同じ画面で見比べたい」というお願い（返事13 §5）に応えるため。 */
const bundle = {
  version: 1,
  generatedAt: typo.generatedAt,
  about: "組み合わせの見本に要る書体の見本（gallery/pairings.html と同じ中身）を、アプリがこれ 1 本で読めるようにしたもの。"
    + "woff2 は見本の字だけの抜き出し（数千 B〜数十 KB）。書体の本物は各パック（.stpack）にあります。",
  typography: {
    version: typo.version, base: typo.base, slots: typo.slots, scales: typo.scales,
    tracking: typo.tracking, leading: typo.leading, presets: typo.presets, pairings: typo.pairings,
    generatedAt: typo.generatedAt, source: "catalog/typography.json",
  },
  previews,
};
fs.writeFileSync(BUNDLE, JSON.stringify(bundle) + "\n");
console.log(`✅ ${path.relative(HERE, BUNDLE)} — ${typo.pairings.length} 組・見本 ${previews.length} 書体・${Buffer.byteLength(JSON.stringify(bundle)).toLocaleString()} B（アプリが 1 本で読める形）`);
console.log(`✅ gallery/pairings.html — ${typo.pairings.length} 組・見本 ${previews.length} 書体・${Buffer.byteLength(HTML).toLocaleString()} B（外部参照 0）`);
