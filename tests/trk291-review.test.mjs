// SPDX-License-Identifier: GPL-3.0-or-later
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateReadability} from '../tools/lib/skin-readability.mjs';
const catalog = JSON.parse(readFileSync('catalog/skins.json','utf8'));
const by = new Map(catalog.skins.map(s => [s.id,s]));
const old = JSON.parse(readFileSync('catalog/skin-revisions/2026-11-06-before-trk291-review.json','utf8'));
const oldBy = new Map(old.skins.map(s=>[s.id,s.colors]));
const proposal = JSON.parse(readFileSync('catalog/skin-revisions/2026-11-06-gold-pending-proposal.json','utf8'));
const rgb = h => h.match(/[a-f\d]{2}/gi).map(v=>parseInt(v,16));
const lum = c => c.map(x=>x/255).map(x=>x<=0.04045?x/12.92:((x+0.055)/1.055)**2.4).reduce((a,v,i)=>a+v*[.2126,.7152,.0722][i],0);
const contrast = (a,b) => { const x=lum(a),y=lum(b); return (Math.max(x,y)+.05)/(Math.min(x,y)+.05); };
const stops = v => [...v.matchAll(/#[\da-f]{6}/gi)].map(m=>rgb(m[0]));
const lab = h => {
  const [r,g,b]=rgb(h).map(x=>x/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);
  const l=Math.cbrt(.4122214708*r+.5363325363*g+.0514459929*b),m=Math.cbrt(.2119034982*r+.6806995451*g+.1073969566*b),s=Math.cbrt(.0883024619*r+.2817188376*g+.6299787005*b);
  return [.2104542553*l+.793617785*m-.0040720468*s,1.9779984951*l-2.428592205*m+.4505937099*s,.0259040371*l+.7827717662*m-.808675766*s];
};
const delta=(a,b)=>Math.hypot(...lab(a).map((v,i)=>v-lab(b)[i]));
for (const id of ['creme-brulee','melon-pan','pancake']) {
  const c=by.get(id).colors;
  assert.ok(delta(c.text,c.muted)>=0.10, `${id}: 本文と補足の階層`);
  for (const key of Object.keys(c)) if(key !== 'text') assert.equal(c[key],oldBy.get(id)[key],`${id}: 意図しない色変更 ${key}`);
}
for (const id of ['chocolate','hot-cocoa','ancient-bronze','tequila-sunrise']) {
  const c=by.get(id).colors;
  assert.equal(c.bg,oldBy.get(id).bg,`${id}: 地を維持`);
  assert.equal(c.stage,oldBy.get(id).stage,`${id}: 舞台を維持`);
  // Composite the translucent panel over every original background stop.
  const m=c.panel.match(/^rgba\((\d+),(\d+),(\d+),([\d.]+)\)$/);
  assert.ok(m,`${id}: panel format`);
  const alpha=Number(m[4]), panel=[+m[1],+m[2],+m[3]];
  const surfaces=[...stops(c.bg).map(bg=>bg.map((x,i)=>alpha*panel[i]+(1-alpha)*x)),rgb(c.field),rgb(c.button)];
  for (const k of ['text','muted']) for (const bg of surfaces) assert.ok(contrast(rgb(c[k]),bg)>=4.5,`${id}: ${k} on surface`);
  for (const bg of stops(c.stage)) assert.ok(contrast(rgb(c.ink),bg)>=4.5,`${id}: ink on stage`);
  assert.ok(contrast(rgb(c.onAccent),rgb(c.accent))>=4.5,`${id}: on accent`);
}
for (const id of ['gold-chip','orichalcum']) {
  assert.deepEqual(by.get(id).colors,oldBy.get(id),`${id}: PWA 対応前に保留`);
  for (const [key,p] of Object.entries(proposal.skins[id])) assert.equal(by.get(id).colors[key],p.from,`${id}: 提案の出発点`);
}
const house=by.get('house-edge');
assert.equal(house.readability,'intentional-low');
assert.deepEqual(house.colors, {stage:'#1a1a1a',ink:'#666666',don:'#ff0040',ka:'#999999',text:'#666666',muted:'#333333',bg:'#0a0a0a',panel:'rgba(10,10,10,.99)',field:'#1a1a1a',button:'#2a2a2a',accent:'#ff0040',onAccent:'#ffffff',gold:'#999999',border:'rgba(150,150,150,.18)'});
assert.deepEqual(validateReadability(house),[]);
assert.deepEqual(validateReadability({}),[]);
assert.ok(validateReadability({readability:'intentional-low'}).length);
assert.ok(validateReadability({readability:'always-pass',readabilityReason:house.readabilityReason}).length);
assert.ok(validateReadability({readabilityReason:house.readabilityReason}).length);
assert.ok(validateReadability({readability:'intentional-low',readabilityReason:{...house.readabilityReason,ja:''}}).length);
assert.equal(catalog.skins.filter(s=>s.readability).length,1);
const palettes=JSON.parse(readFileSync('catalog/skin-revisions/2026-11-06-duplicate-palette-proposals.json','utf8'));
assert.equal(Object.keys(palettes.proposals).length,19);
for (const [id, v] of Object.entries(palettes.proposals)) {
  if (id === 'orichalcum') continue; // its 'old' is the review's B intermediate, not the current original
  assert.deepEqual(by.get(id).colors,v.old,`${id}: 案を正本へ適用しない`);
}
const seven=by.get('wizard-seven-military-classics').desc.ja;
for (const name of ['孫子','呉子','司馬法','尉繚子','李衛公問対','三略','六韜']) assert.equal(seven.split(name).length-1,1,name);
assert.equal(by.get('wizard-lemgeton').id,'wizard-lemgeton');
for (const id of ['inkWash','rockwell','hiragino-kaku','noto-sans-jp','wizard-honorius','wizard-agrippa','wizard-heptameron','wizard-necronomicon']) for (const key of ['label','desc']) assert.doesNotMatch(by.get(id)[key].zh,/[\u3040-\u309f\u30a0-\u30ff]/,`${id}: ${key}.zh`);
console.log('✅ trk291 レビュー：配色・文字の階層・読みづらさの明示・翻訳');
