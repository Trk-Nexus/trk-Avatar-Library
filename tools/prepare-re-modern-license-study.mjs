#!/usr/bin/env node
// SPDX-License-Identifier: GPL-3.0-or-later
// Offline, isolated research page, not a release or a PWA settings panel.
// Uses explicitly supplied source files; never downloads fonts or licences.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const args=process.argv.slice(2);
for(const a of args)assert(/^--(?:trk|neo-dir|out)=.+$/.test(a),`unknown or empty argument: ${a}`);
for(const k of ['trk','neo-dir','out'])assert(args.filter(a=>a.startsWith(`--${k}=`)).length<=1,`duplicate argument: ${k}`);
const val=k=>args.find(a=>a.startsWith(`--${k}=`))?.slice(k.length+3);
const trk=val('trk')||process.env.TRK_PWA, neo=val('neo-dir');
assert(trk && neo,'--trk (or TRK_PWA) and --neo-dir are required');
const out=path.resolve(val('out')||path.join(root,'dist/re-modern-license-study'));
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'avatar-license-research-'));
try {
 const source=path.join(temp,'font-study');
 const r=spawnSync(process.execPath,[path.join(root,'tools/prepare-re-modern-font-study.mjs'),`--trk=${trk}`,`--neo-dir=${neo}`,`--out=${source}`],{cwd:root,encoding:'utf8'});
 assert.equal(r.status,0,r.stderr||r.stdout);
 const dot=fs.readFileSync(path.join(source,'assets/OFL.txt'));
 const neoLicense=fs.readFileSync(path.join(source,'assets/NeoDunggeunmo-OFL.txt'));
 const escape=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
 let html=fs.readFileSync(path.join(root,'docs/re-modern-research/pixel-console-license-study/index.html'),'utf8');
 for(const [marker,bytes] of [['<!-- DOT_LICENSE_TEXT -->',dot],['<!-- NEO_LICENSE_TEXT -->',neoLicense]]){
  assert.equal(html.split(marker).length,2,`expected exactly one marker: ${marker}`);
  html=html.replace(marker,escape(new TextDecoder('utf-8',{fatal:true}).decode(bytes)));
 }
 // Input hashes and template markers are checked before touching the output.
 for(const [dest,bytes] of [['licenses/dot/OFL.txt',dot],['licenses/neo/OFL.txt',neoLicense]]){
  const file=path.join(out,dest);fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,bytes);
 }
 fs.writeFileSync(path.join(out,'index.html'),html);
 console.log(`研究専用のライセンス見本を作成: ${out}\n正式配布・PWA の設定画面ではありません。`);
}finally{fs.rmSync(temp,{recursive:true,force:true});}
