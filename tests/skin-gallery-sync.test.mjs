// SPDX-License-Identifier: GPL-3.0-or-later
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read = p=>JSON.parse(readFileSync(p,'utf8'));
const catalog=read('catalog/skins.json').skins;
const by=new Map(catalog.map(s=>[s.id,s]));
for (const g of read('skin-volumes/volumes.json').groups.filter(g=>g.preview)) {
  const html=readFileSync(g.preview,'utf8');
  const match=html.match(/const SKINS = (\[[\s\S]*?\]);\s*const CAT = /);
  assert.ok(match, `${g.preview}: 埋め込みデータなし`);
  const skins=JSON.parse(match[1]);
  const expected=g.ids || catalog.filter(s=>s.cat?.includes(g.category)).map(s=>s.id);
  assert.deepEqual(skins.map(s=>s.id),expected,`${g.id}: ID`);
  for(const skin of skins) {
    const source=by.get(skin.id);
    for(const key of ['label','desc','cat','colors']) assert.deepEqual(skin[key],source[key],`${g.id}/${skin.id}: ${key}`);
    for(const key of ['font','type','shapes','locked']) assert.deepEqual(skin[key],source[key] ?? ({font:'',type:null,shapes:['circle','circle'],locked:false})[key],`${g.id}/${skin.id}: ${key}`);
    assert.equal(skin.readability,source.readability,`${g.id}/${skin.id}: readability`);
  }
}
console.log('✅ すべての巻別見本と目録の一致');
