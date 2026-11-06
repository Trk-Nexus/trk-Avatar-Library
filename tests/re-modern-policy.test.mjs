// SPDX-License-Identifier: GPL-3.0-or-later
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {evaluate, checkRepository} from '../tools/check-re-modern.mjs';

const id = 'trk-re-modern-example';
const text = '検討内容と根拠をここに記す。';
const record = {
  id, version:1, directions:['aesthetic'],
  concept:{intent:text,tradeoffs:text,originality:text},
  typography:{family:'Example',origin:'pack',sourceUrl:'https://example.org/font',rationale:text,license:text,distribution:text,fallback:text},
  design:{palette:text,transparency:text,effects:text},
  safety:{readability:text,exit:text,motion:text,forcedColors:text},
  permissions:{research:text,runtimeNetwork:text,assetRights:text,browserRequirements:text},
  compatibility:{pwa:text,legacy:text},
  verification:{chromium:text,accessibility:text,contrast:text,failureCases:text,unverified:text},
  review:{reviewer:'Reviewer',decision:text,evidence:text,date:'2026-11-06',approved:true},
  references:[{kind:'guidance',title:'Color',url:'https://github.com/GoogleChrome/modern-web-guidance-src/blob/690d58e799bc74e2740880d84a01625e8746eaff/guides/visual-design/color/guide.md',checked:'2026-11-06',relevance:text}]
};
const args = () => ({catalog:{skins:[{id,cat:['trk-re-modern']}]},volumes:{groups:[{id:'trk-re-modern',ids:[id]},{id:'wizard',category:'wizard'}]},registry:{format:'trk-re-modern-registry',version:1,ids:[id]},records:{[id]:structuredClone(record)},hasFile:()=>true});
const isInvalid = (fn, expected) => {const a=args();fn(a);assert.ok(evaluate(a).some(x=>x.includes(expected)), expected)};
assert.deepEqual(evaluate(args()), []);
assert.deepEqual(evaluate({catalog:{skins:[]},volumes:{groups:[]},registry:{format:'trk-re-modern-registry',version:1,ids:[]},records:{},hasFile:()=>false}),[]);
isInvalid(a=>{a.catalog.skins[0].cat=[]},'予約 ID');
isInvalid(a=>{a.catalog.skins[0].id='another-id'},'予約 ID');
isInvalid(a=>{a.registry.ids=[]},'台帳');
isInvalid(a=>{a.registry.ids.push(id)},'重複');
isInvalid(a=>{delete a.records[id]},'作品記録');
isInvalid(a=>{a.records[id].id='different'},'版が一致');
isInvalid(a=>{a.records[id].typography.rationale=''},'typography.rationale');
isInvalid(a=>{a.records[id].typography.sourceUrl=null},'入手先');
isInvalid(a=>{a.records[id].typography.origin='system';a.records[id].typography.sourceUrl=null},'ない理由');
isInvalid(a=>{a.records[id].references[0].url='http://example.org'},'HTTPS');
isInvalid(a=>{a.records[id].references[0].url='https://github.com/GoogleChrome/modern-web-guidance-src/blob/main/guides/a'},'commit 固定');
isInvalid(a=>{a.records[id].references[0].checked='2026-02-30'},'確認日');
isInvalid(a=>{a.records[id].review.approved=false},'承認');
isInvalid(a=>{a.hasFile=()=>false},'公開・レビュー');
isInvalid(a=>{a.volumes.groups[0].ids.push('not-registered')},'台帳外');
const dir = fs.mkdtempSync(path.join(os.tmpdir(),'re-modern-test-'));
try {
  for (const d of ['catalog/re-modern/records','skin-volumes','catalog','docs/re-modern','gallery/re-modern']) fs.mkdirSync(path.join(dir,d),{recursive:true});
  const a=args();
  const write=(p,v)=>fs.writeFileSync(path.join(dir,p),typeof v==='string'?v:JSON.stringify(v));
  write('catalog/skins.json',a.catalog);write('skin-volumes/volumes.json',a.volumes);write('catalog/re-modern/index.json',a.registry);write(`catalog/re-modern/records/${id}.json`,a.records[id]);
  write(`docs/re-modern/${id}.md`,'review');write('gallery/re-modern/index.html','public index');write(`gallery/re-modern/${id}.html`,'public explanation');
  write('docs/trk-re-modern-introduction-template.md','template');
  write('docs/trk-re-modern-concept.md','concept');
  assert.deepEqual(checkRepository(dir),[]);
  fs.unlinkSync(path.join(dir,'docs/trk-re-modern-concept.md'));
  assert.ok(checkRepository(dir).some(x=>x.includes('コンセプト文書')));
  write('docs/trk-re-modern-concept.md','concept');
  fs.unlinkSync(path.join(dir,'docs/trk-re-modern-introduction-template.md'));
  assert.ok(checkRepository(dir).some(x=>x.includes('紹介・カタログ書式')));
  write('docs/trk-re-modern-introduction-template.md','template');
  // Exercise the actual exporter and Pages pipeline with a tiny, temporary catalog.
  fs.mkdirSync(path.join(dir,'tools')); fs.mkdirSync(path.join(dir,'css')); fs.mkdirSync(path.join(dir,'js'));
  for (const script of ['check-re-modern.mjs','export-skin-volumes.mjs','prepare-pages.mjs']) {
    fs.copyFileSync(new URL(`../tools/${script}`,import.meta.url),path.join(dir,'tools',script));
  }
  for (const file of ['index.html','manifest.json','sw.js','icon-192.png','icon-512.png']) write(file,'fixture');
  execFileSync(process.execPath,['tools/export-skin-volumes.mjs'],{cwd:dir,stdio:'pipe'});
  execFileSync(process.execPath,['tools/prepare-pages.mjs'],{cwd:dir,stdio:'pipe'});
  assert.ok(fs.readFileSync(path.join(dir,'dist/pages/skin-volumes/index.html'),'utf8').includes('../gallery/re-modern/index.html'));
  assert.ok(fs.existsSync(path.join(dir,`dist/pages/gallery/re-modern/${id}.html`)));
  assert.ok(fs.existsSync(path.join(dir,'dist/pages/gallery/re-modern/index.html')));
  assert.ok(!fs.existsSync(path.join(dir,'dist/pages/catalog/re-modern')));
  fs.unlinkSync(path.join(dir,'gallery/re-modern/index.html'));
  assert.throws(()=>execFileSync(process.execPath,['tools/prepare-pages.mjs'],{cwd:dir,stdio:'pipe'}));
  assert.ok(checkRepository(dir).some(x=>x.includes('公開一覧')));
  fs.unlinkSync(path.join(dir,`gallery/re-modern/${id}.html`));
  assert.ok(checkRepository(dir).some(x=>x.includes('公開・レビュー')));
  write('catalog/re-modern/records/trk-re-modern-orphan.json',record);
  assert.ok(checkRepository(dir).some(x=>x.includes('台帳にない')));
} finally { fs.rmSync(dir,{recursive:true,force:true}); }
console.log('✅ trk-re-modern の登録・必須記録・未登録・公開経路の検査');
