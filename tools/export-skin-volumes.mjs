#!/usr/bin/env node
// SPDX-License-Identifier: GPL-3.0-or-later
// Generate browsable, lossless volume/single-skin JSON from the authoritative catalog.
// `--check` verifies every file without modifying it. Membership: skin-volumes/volumes.json.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'skin-volumes');
const catalog = JSON.parse(fs.readFileSync(path.join(root, 'catalog/skins.json'), 'utf8'));
const definition = JSON.parse(fs.readFileSync(path.join(out, 'volumes.json'), 'utf8'));
const modernRegistry = JSON.parse(fs.readFileSync(path.join(root, 'catalog/re-modern/index.json'), 'utf8'));
const modernLink = modernRegistry.ids.length ? '<p><a href="../gallery/re-modern/index.html">trk-re-modern の作品解説と検索</a></p>\n' : '';
const check = process.argv.includes('--check');
const esc = text => String(text).replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
const json = value => JSON.stringify(value, null, 2) + '\n';
const valid = /^[A-Za-z0-9][A-Za-z0-9_-]{0,79}$/;
const all = new Map();
for (const skin of catalog.skins) {
  if (!valid.test(skin.id) || all.has(skin.id)) throw new Error(`不正または重複する ID: ${skin.id}`);
  all.set(skin.id, skin);
}
const seen = new Set(), groupIds = new Set();
const results = [];
for (const group of definition.groups) {
  if (!valid.test(group.id) || groupIds.has(group.id)) throw new Error(`不正または重複する巻: ${group.id}`);
  groupIds.add(group.id);
  const selectors = [Array.isArray(group.ids), typeof group.category === 'string', group.remaining === true].filter(Boolean).length;
  if (selectors !== 1) throw new Error(`${group.id}: 分類条件を1つ指定してください`);
  let ids = group.ids || (group.category ? catalog.skins.filter(s => s.cat?.includes(group.category)).map(s => s.id) : catalog.skins.filter(s => !seen.has(s.id)).map(s => s.id));
  for (const id of ids) {
    if (!all.has(id) || seen.has(id)) throw new Error(`${group.id}: 存在しない／重複する ID ${id}`);
    seen.add(id);
  }
  if (group.preview && !fs.existsSync(path.join(root, group.preview))) throw new Error(`見本がありません: ${group.preview}`);
  results.push({ ...group, skins: ids.map(id => all.get(id)) });
}
if (seen.size !== all.size) throw new Error(`未分類が残っています: ${all.size - seen.size}件`);
const files = new Map();
for (const group of results) {
  files.set(`${group.id}/skins.json`, json({format: 'trk-avatar-library-skins', version: 1, count: group.skins.length, skins: group.skins}));
  for (const skin of group.skins) files.set(`${group.id}/items/${skin.id}.json`, json(skin));
}
const groupHtml = results.map(group => {
  const preview = group.preview ? `<a href="../${esc(group.preview)}">既存の見本を見る</a>` : '';
  const items = group.skins.map(s => `<li><span>${esc(s.label?.ja || s.label?.en || s.id)} <small>${esc(s.id)}</small>${s.readability === 'intentional-low' ? ` <strong class="readability-warning">⚠ 見づらさを意図した配色</strong>` : ''}</span><a href="${esc(group.id)}/items/${esc(s.id)}.json" download>1枚の元データ JSON</a></li>`).join('\n');
  return `<details class="volume"><summary><strong>${esc(group.title)}</strong><span>${group.skins.length} 種</span></summary><div class="volume-body"><p><a class="download" href="${esc(group.id)}/skins.json" download>巻の元データ JSON を取得</a> ${preview}</p><ul>${items}</ul></div></details>`;
}).join('\n');
files.set('index.html', `<!doctype html>
<html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>スキンを巻から探す | trk-Avatar-Library</title>
<style>
:root{color-scheme:dark;--bg:#10151b;--panel:#1a232c;--line:#465968;--text:#f3f6f8;--muted:#cfdae0;--accent:#a7eadf}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font:16px/1.65 system-ui,sans-serif}main{max-width:960px;margin:auto;padding:2rem 1rem 4rem}h1{font-size:clamp(1.6rem,4vw,2.4rem);line-height:1.25}p{max-width:75ch}a{color:var(--accent);text-underline-offset:.2em}a:focus-visible,summary:focus-visible{outline:3px solid #ffda8d;outline-offset:3px}.notice{border-left:4px solid #ffda8d;background:#262b2e;padding:.8rem 1rem}.volume{border:1px solid var(--line);border-radius:.8rem;background:var(--panel);margin:.8rem 0}.volume summary{padding:1rem;cursor:pointer;display:flex;justify-content:space-between;gap:1rem}.volume-body{padding:0 1rem 1rem;border-top:1px solid var(--line)}.download{display:inline-block;padding:.5rem .8rem;border:1px solid var(--accent);border-radius:.5rem;margin-right:.6rem}ul{padding:0;list-style:none}li{display:flex;gap:.5rem 1rem;align-items:baseline;justify-content:space-between;flex-wrap:wrap;padding:.45rem 0;border-bottom:1px solid var(--line)}small{color:var(--muted)}.readability-warning{display:inline-block;background:#fff3c6;color:#241b00;padding:.1rem .4rem;border-radius:.3rem;font-size:.8rem}footer{margin-top:2rem;color:var(--muted)}
</style></head><body><main><p><a href="../index.html">← ライブラリへ戻る</a></p><h1>スキンを巻から探す</h1><p>好きな巻を開いて、巻ごと、または1枚ずつ元データを取得できます。全 ${all.size} 種。色や名前は元の目録からそのまま収録しています。</p><div class="notice"><strong>ご注意：</strong>ここで取得できるのはスキンの<strong>元データ JSON</strong>です。trk-PWA の開発用の道具はこの形式を読めますが、画面から巻を一括でインストールする機能やパックではありません。画面の見た目や演出を完全に再現するものでもありません。</div><p>vol.1〜10 と glitch の分類は既存見本の ID、wizard は現在のカテゴリ全体（${results.find(g=>g.id==='wizard').skins.length} 種）です。残りは「その他」にまとめています。書体ファイルは含みません。</p>
${modernLink}${groupHtml}
<footer>正本：<a href="../catalog/skins.json">catalog/skins.json</a>。GPL-3.0-or-later。<a href="../index.html">ライブラリーに戻る</a></footer></main></body></html>\n`);

let errors = 0;
for (const [rel, content] of files) {
  const target = path.join(out, rel);
  if (check) {
    if (!fs.existsSync(target) || fs.readFileSync(target, 'utf8') !== content) { console.error(`不一致: skin-volumes/${rel}`); errors++; }
  } else {
    fs.mkdirSync(path.dirname(target), {recursive:true}); fs.writeFileSync(target, content);
  }
}
// Catch stale generated JSON after a skin is removed or moves to another volume.
for (const group of results) {
  const dir = path.join(out, group.id, 'items');
  if (!fs.existsSync(dir)) continue;
  for (const file of fs.readdirSync(dir)) {
    const rel = `${group.id}/items/${file}`;
    if (file.endsWith('.json') && !files.has(rel)) {
      if (check) { console.error(`不要な旧ファイル: skin-volumes/${rel}`); errors++; }
      else fs.unlinkSync(path.join(dir, file));
    }
  }
}
if (errors) process.exitCode = 1;
else console.log(`✅ 巻別スキン ${results.length} 巻・${seen.size} 種（${check ? '検査' : '生成'}）`);
