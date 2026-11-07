#!/usr/bin/env node
// SPDX-License-Identifier: GPL-3.0-or-later
// Verify and copy explicitly provided fonts into a local, isolated specimen.
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const args=process.argv.slice(2);
for(const a of args)assert(/^--(?:trk|neo-dir|galmuri-dir|latin-dir|out)=.+$/.test(a),`unknown or empty argument: ${a}`);
for(const k of ['trk','neo-dir','galmuri-dir','latin-dir','out'])assert(args.filter(a=>a.startsWith(`--${k}=`)).length<=1,`duplicate argument: ${k}`);
const val=k=>args.find(a=>a.startsWith(`--${k}=`))?.slice(k.length+3);
const trk=val('trk')||process.env.TRK_PWA,neo=val('neo-dir'),gal=val('galmuri-dir'),latin=val('latin-dir');
assert(trk&&neo&&gal&&latin,'--trk (or TRK_PWA), --neo-dir, --galmuri-dir, --latin-dir required');
const out=path.resolve(val('out')||path.join(root,'dist/re-modern-latin-study'));
const expected={
 'press-start-2p.woff2':[12512,'afec86997fdaf54af1f59358fa2c1e2a0f1d04146edad18e5cd141d0384a7548'],
 'press-start-2p-LICENSE.txt':[null,'98e451fe911e5ee4a1a45359535dc30ea7df28b8d9a9cd1f741778efab1387ee'],
 'JetBrainsMono-Regular.woff2':[92380,'f1a7a03672cdd494ce0d5543fac6e4360fe22403c6de297fdc2e55a815f7baff'],
 'JetBrainsMono-OFL.txt':[null,'a76abf002c49097d146e86740a3105a5d00450b1592e820a1109a8c5680cd697'],
 'fira-code.woff2':[23312,'6dc9da171ccea71d525379ee1cbf51d143e31acac330a251bb71b3d6060e687c'],
 'fira-code-LICENSE.txt':[null,'126cd7bf732b86f42885f1fbf682e6aeea456672c7fdb99f2d557ec44e468a28']
};
const files={};for(const [name,[size,sha]] of Object.entries(expected)){const bytes=fs.readFileSync(path.join(latin,name));if(size!==null)assert.equal(bytes.length,size,name);assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),sha,`unexpected input: ${name}`);files[name]=bytes;}
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'avatar-latin-study-'));
try{
 const r=spawnSync(process.execPath,[path.join(root,'tools/prepare-re-modern-candidate-comparison.mjs'),`--trk=${trk}`,`--neo-dir=${neo}`,`--galmuri-dir=${gal}`,`--out=${temp}`],{cwd:root,encoding:'utf8'});assert.equal(r.status,0,r.stderr||r.stdout);
 const contract=JSON.parse(fs.readFileSync(path.join(root,'docs/re-modern-research/pixel-console-font-contract.json'),'utf8'));
 const draft=JSON.parse(fs.readFileSync(path.join(root,contract.draftSource),'utf8'));const brand=contract.targetCandidates.find(x=>x.id==='common-brand-title');
 assert.equal(draft.id,contract.workId);assert.equal(brand.textAtFixedPwa,'trk!');assert.equal(typeof draft.label.en,'string');assert(draft.label.en.length);
 let html=fs.readFileSync(path.join(root,'docs/re-modern-research/pixel-console-latin-study/index.html'),'utf8');
 for(const [key,value] of [['BRAND',brand.textAtFixedPwa],['LABEL_EN',draft.label.en]]){const marker=`<!-- ${key} -->`;assert.equal(html.split(marker).length,2,marker);html=html.replace(marker,()=>value.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;'));}
 fs.mkdirSync(path.join(out,'assets'),{recursive:true});
 for(const name of ['DotGothic16-Regular.woff2','neodgm.woff2','Galmuri11.woff2','OFL.txt','NeoDunggeunmo-OFL.txt','Galmuri-LICENSE.txt'])fs.copyFileSync(path.join(temp,'assets',name),path.join(out,'assets',name));
 for(const [name,bytes] of Object.entries(files))fs.writeFileSync(path.join(out,'assets',name),bytes);
 const base=fs.readFileSync(path.join(temp,'FONT-SOURCE.txt'),'utf8');
 fs.writeFileSync(path.join(out,'FONT-SOURCE.txt'),base+'\nPress Start 2P Latin subset: @fontsource/press-start-2p@5.3.0, 12512 B, SHA-256 afec86997fdaf54af1f59358fa2c1e2a0f1d04146edad18e5cd141d0384a7548。個別 LICENSE: assets/press-start-2p-LICENSE.txt。\nJetBrains Mono Regular: 作者 commit 19371302b95d218af43299bce79ddbddd0bc364d, 92380 B, SHA-256 f1a7a03672cdd494ce0d5543fac6e4360fe22403c6de297fdc2e55a815f7baff。個別 LICENSE: assets/JetBrainsMono-OFL.txt。\nFira Code Latin subset: @fontsource/fira-code@5.3.0, 23312 B, SHA-256 6dc9da171ccea71d525379ee1cbf51d143e31acac330a251bb71b3d6060e687c。OS/2 weight 400、内部名 Fira Code Light Regular。個別 LICENSE: assets/fira-code-LICENSE.txt。\n採用・配布の判断、字形や権利の人手確認は別。\n');
 fs.writeFileSync(path.join(out,'index.html'),html);console.log(`英字候補の研究見本を作成: ${out}\nPWA設定・正式採用・正式配布ではありません。`);
}finally{fs.rmSync(temp,{recursive:true,force:true});}
