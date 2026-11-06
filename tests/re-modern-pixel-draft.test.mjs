// SPDX-License-Identifier: GPL-3.0-or-later
// Guard the in-progress candidate without pretending it is a reviewed release.
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=path=>JSON.parse(fs.readFileSync(new URL(`../${path}`,import.meta.url)));
const draft=read('drafts/re-modern/pixel-console/skin.json');
const catalog=read('catalog/skins.json');
const registry=read('catalog/re-modern/index.json');
assert.equal(draft.id,'trk-re-modern-pixel-console');
assert(draft.cat.includes('trk-re-modern'));
assert(!catalog.skins.some(s=>s.id===draft.id),'draft must remain outside the catalog until release review');
assert(!registry.ids.includes(draft.id),'draft must remain outside the registry until release review');
for (const lang of ['ja','en','zh','ko']) {
  assert(draft.label[lang]?.trim());assert(draft.desc[lang]?.trim());
}
assert.equal(draft.font,'system-ui, sans-serif');
assert.equal(draft.type.title,'system-ui, sans-serif');
assert.deepEqual(draft.shapes,['square','diamond']);
assert.equal(draft.video,'');
for(const key of ['stage','ink','don','ka','text','muted','bg','panel','field','button','accent','onAccent','gold','border']) {
  assert.match(draft.colors[key],/^#[\da-f]{6}$/i,`invalid ${key}`);
}
console.log('✅ 未登録のピクセル・コンソール制作案：構造・書体・正本との分離');
