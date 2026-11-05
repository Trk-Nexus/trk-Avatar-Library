// SPDX-License-Identifier: GPL-3.0-or-later
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
const catalog = JSON.parse(readFileSync('catalog/skins.json', 'utf8'));
const expected = {
  'creme-brulee': {bg:'linear-gradient(180deg,#ffecb3,#ffe082)',stage:'linear-gradient(180deg,#ffe082,#ffb74d)'},
  'melon-pan': {bg:'#ffe082',stage:'#fff9c4'},
  'pancake': {bg:'#fff59d',stage:'#fff176'},
};
const rgb = hex => hex.match(/[0-9a-f]{2}/gi).map(x=>parseInt(x,16));
const luminance = channels => channels.map(x=>x/255).map(x=>x<=0.04045?x/12.92:((x+0.055)/1.055)**2.4).reduce((s,x,i)=>s+x*[0.2126,0.7152,0.0722][i],0);
const ratio = (a,b) => {let x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
const stops = s => [...s.matchAll(/#[0-9a-f]{6}/gi)].map(m=>rgb(m[0]));
for (const [id, originals] of Object.entries(expected)) {
  const c = catalog.skins.find(s=>s.id===id).colors;
  assert.equal(c.bg, originals.bg); assert.equal(c.stage, originals.stage);
  assert.equal(c.panel, 'rgba(255,255,255,.96)');
  // Check panel composited over every gradient stop, not just opaque white.
  const panels = stops(c.bg).map(b=>b.map(v=>255*.96+v*.04));
  const surfaces = [...stops(c.bg), ...panels, rgb(c.field), rgb(c.button)];
  for (const key of ['text','muted']) for (const surface of surfaces) assert.ok(ratio(rgb(c[key]),surface)>=4.5, `${id}: ${key}`);
  for (const surface of stops(c.stage)) assert.ok(ratio(rgb(c.ink),surface)>=4.5, `${id}: stage`);
  assert.ok(ratio(rgb(c.onAccent),rgb(c.accent))>=4.5, `${id}: accent`);
  assert.notEqual(c.text,c.muted, `${id}: hierarchy`);
}
execFileSync('python3',['tools/generate-theme-gallery.py','--wizard-all','--check'],{stdio:'inherit'});
const g=JSON.parse(readFileSync('skin-volumes/volumes.json','utf8')).groups.find(g=>g.id==='vol-05');
execFileSync('python3',['tools/generate-theme-gallery.py','sweets','スイーツ・カフェ vol.5',...g.ids,'--check'],{stdio:'inherit'});
console.log('✅ 3 種の元色・面と舞台のコントラスト／見本');
