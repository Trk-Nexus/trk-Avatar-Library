#!/usr/bin/env node
// SPDX-License-Identifier: GPL-3.0-or-later
// Isolated specimen only; copies verified inputs, never downloads assets.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const args=process.argv.slice(2);
for(const arg of args)assert(/^--(?:trk|neo-dir|out)=.+$/.test(arg),`unknown or empty argument: ${arg}`);
for(const key of ['trk','neo-dir','out'])assert(args.filter(a=>a.startsWith(`--${key}=`)).length<=1,`duplicate argument: ${key}`);
const val=key=>args.find(a=>a.startsWith(`--${key}=`))?.slice(key.length+3);
const trk=val('trk')||process.env.TRK_PWA,neo=val('neo-dir');
assert(trk&&neo,'--trk (or TRK_PWA) and --neo-dir required');
const out=path.resolve(val('out')||path.join(root,'dist/re-modern-multilingual-study'));
const contract=JSON.parse(fs.readFileSync(path.join(root,'docs/re-modern-research/pixel-console-font-contract.json'),'utf8'));
const draft=JSON.parse(fs.readFileSync(path.join(root,contract.draftSource),'utf8'));
const brand=contract.targetCandidates.find(x=>x.id==='common-brand-title');
const languages=['ja','en','zh','ko'];
assert.equal(draft.id,contract.workId);assert.deepEqual(Object.keys(draft.label).sort(),[...languages].sort());
for(const [args,want] of [[['rev-parse','HEAD'],contract.pwaReference],[['status','--porcelain'],'']]){
 const p=spawnSync('git',args,{cwd:trk,encoding:'utf8'});assert.equal(p.status,0,p.stderr);assert.equal(p.stdout.trim(),want,'PWA checkout must be clean and pinned');
}
assert.equal(brand.textAtFixedPwa,'trk!');
assert.match(fs.readFileSync(path.join(trk,'index.html'),'utf8'),/<div class="brand">\s*<h1>trk<span>!<\/span><\/h1>/);
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'avatar-multilingual-study-'));
try{
 const built=spawnSync(process.execPath,[path.join(root,'tools/prepare-re-modern-font-study.mjs'),`--trk=${trk}`,`--neo-dir=${neo}`,`--out=${temp}`],{cwd:root,encoding:'utf8'});
 assert.equal(built.status,0,built.stderr||built.stdout);
 let html=fs.readFileSync(path.join(root,'docs/re-modern-research/pixel-console-multilingual-study/index.html'),'utf8');
 const values=[['BRAND',brand.textAtFixedPwa],...languages.map(l=>[`LABEL_${l.toUpperCase()}`,draft.label[l]])];
 for(const [key,value] of values){
  assert.equal(typeof value,'string');assert(value.length>0);
  const marker=`<!-- ${key} -->`;assert.equal(html.split(marker).length,2,`expected one marker: ${key}`);
  html=html.replace(marker,()=>value.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;'));
 }
 fs.mkdirSync(path.join(out,'assets'),{recursive:true});
 for(const name of ['DotGothic16-Regular.woff2','neodgm.woff2','OFL.txt','NeoDunggeunmo-OFL.txt'])fs.copyFileSync(path.join(temp,'assets',name),path.join(out,'assets',name));
 const source=fs.readFileSync(path.join(temp,'FONT-SOURCE.txt'),'utf8').replace('この見本は既存のスキン・ノーツ付きパックから書体だけを取り出した一時研究用です。','DotGothic16 は既存のスキン・ノーツ付きパックから取り出し、NeoDunggeunmo は明示的に用意した作者版から複写した一時研究用です。');
 fs.writeFileSync(path.join(out,'FONT-SOURCE.txt'),source);
 fs.writeFileSync(path.join(out,'index.html'),html);
 console.log(`研究用の多言語見本を作成: ${out}\nPWA の設定画面や正式配布物ではありません。`);
}finally{fs.rmSync(temp,{recursive:true,force:true});}
