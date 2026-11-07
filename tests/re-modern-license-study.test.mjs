// SPDX-License-Identifier: GPL-3.0-or-later
// Research page and candidate-archive consistency, no legal conclusion.
// TRK_PWA=/path/to/fixed-pwa TRK_NEO_DIR=/path/to/fixed-files node tests/re-modern-license-study.test.mjs
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {openZip} from '../tools/lib/zip.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
assert(process.env.TRK_PWA && process.env.TRK_NEO_DIR,'TRK_PWA and TRK_NEO_DIR required');
const pwa=path.resolve(process.env.TRK_PWA),neo=path.resolve(process.env.TRK_NEO_DIR);
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'avatar-license-test-'));
try{
 const run=(tool,args)=>spawnSync(process.execPath,[path.join(root,tool),...args],{cwd:root,encoding:'utf8'});
 const out=path.join(temp,'page');
 let r=run('tools/prepare-re-modern-license-study.mjs',[`--trk=${pwa}`,`--neo-dir=${neo}`,`--out=${out}`]);assert.equal(r.status,0,r.stderr||r.stdout);
 const pack=path.join(temp,'research.stpack');
 r=run('tools/build-re-modern-font-pack-study.mjs',[`--trk=${pwa}`,`--neo-dir=${neo}`,`--out=${pack}`]);assert.equal(r.status,0,r.stderr||r.stdout);
 const zip=await openZip(fs.readFileSync(pack),pwa);
 const man=JSON.parse(await zip.readText('pack.json'));
 const contract=JSON.parse(fs.readFileSync(path.join(root,'docs/re-modern-research/pixel-console-font-contract.json')));
 const data=[{id:'dot',archive:'fonts/dot/OFL.txt',sha:contract.fontAssets[0].licenseSha256}, {id:'neo',archive:'fonts/neo/OFL.txt',sha:contract.fontAssets[1].licenseSha256}];
 const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
 const html=fs.readFileSync(path.join(out,'index.html'),'utf8');
 assert(!html.includes('<!-- DOT_LICENSE_TEXT -->')&&!html.includes('<!-- NEO_LICENSE_TEXT -->'));
 assert(!/<script\b|<link\b|<iframe\b|<img\b|@import|@font-face/i.test(html),'no scripts, external assets, or automatic font loads');
 const escape=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
 for(const [i,entry] of data.entries()){
  const bytes=fs.readFileSync(path.join(out,`licenses/${entry.id}/OFL.txt`));
  assert.equal(hash(bytes),entry.sha);assert.deepEqual(bytes,Buffer.from(await zip.read(entry.archive)));
  assert.equal(man.fonts[i].licenseFile,entry.archive);
  assert(html.includes(`<pre id="${entry.id}-license" lang="en">${escape(bytes.toString('utf8'))}</pre>`),`${entry.id} must show the full exact text safely`);
  assert(html.includes(`href="licenses/${entry.id}/OFL.txt"`));
  assert(html.includes(contract.fontAssets[i].fontSha256));
 }
 assert.match(fs.readFileSync(path.join(out,'licenses/dot/OFL.txt'),'utf8'),/^Copyright 2020 The DotGothic16 Project Authors/);
 assert.match(fs.readFileSync(path.join(out,'licenses/neo/OFL.txt'),'utf8'),/^Copyright \(c\) 2021-2026, Eunbin Jeong \(Dalgona\.\)/);
 assert.match(fs.readFileSync(path.join(out,'licenses/neo/OFL.txt'),'utf8'),/with Reserved Font Name NeoDunggeunmo/);
 const bad=path.join(temp,'bad');fs.mkdirSync(bad);
 fs.copyFileSync(path.join(neo,'neodgm.woff2'),path.join(bad,'neodgm.woff2'));fs.writeFileSync(path.join(bad,'LICENSE.txt'),'wrong');
 const before=fs.readFileSync(path.join(out,'index.html'));
 r=run('tools/prepare-re-modern-license-study.mjs',[`--trk=${pwa}`,`--neo-dir=${bad}`,`--out=${out}`]);assert.notEqual(r.status,0);
 assert.deepEqual(fs.readFileSync(path.join(out,'index.html')),before,'validation failure must not change the existing page');
 console.log(JSON.stringify({candidateArchiveLicensesMatch:true,distinctCreditsAndFullTexts:true,htmlSafelyEscaped:true,noAutomaticAssets:true,badLicenseRejectedBeforeOutput:true,scope:'Static isolated research; no PWA UI, rights approval, accessibility or legal guarantee.'},null,2));
}finally{fs.rmSync(temp,{recursive:true,force:true});}
