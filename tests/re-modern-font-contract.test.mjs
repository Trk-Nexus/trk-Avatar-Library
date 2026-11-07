// SPDX-License-Identifier: GPL-3.0-or-later
// Verifies this research proposal against the draft and pinned font bytes.
// TRK_PWA=/path/to/fixed-pwa TRK_NEO_DIR=/path/to/fixed-fonts node tests/re-modern-font-contract.test.mjs
// cmap coverage is not a shaping, language quality or PWA compatibility test.
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {readWoff2,cmapOf,coverage} from '../tools/check-fonts.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const contract=JSON.parse(fs.readFileSync(path.join(root,'docs/re-modern-research/pixel-console-font-contract.json')));
assert.equal(contract.status,'research-proposal-not-a-pwa-schema');
assert(process.env.TRK_PWA && process.env.TRK_NEO_DIR,'TRK_PWA and TRK_NEO_DIR are required');
const pwa=path.resolve(process.env.TRK_PWA);
for(const [args,want] of [[['rev-parse','HEAD'],contract.pwaReference],[['status','--porcelain'],'']]){
 const r=spawnSync('git',args,{cwd:pwa,encoding:'utf8'});assert.equal(r.status,0,r.stderr);assert.equal(r.stdout.trim(),want,'PWA must be clean and pinned');
}
const draft=JSON.parse(fs.readFileSync(path.join(root,contract.draftSource)));
assert.equal(draft.id,contract.workId);
const brand=contract.targetCandidates.find(t=>t.id==='common-brand-title');
const labels=contract.targetCandidates.find(t=>t.id==='work-label-specimen');
assert.equal(brand.selectorAtFixedPwa,'.brand h1');
assert.equal(brand.selectionRequired,'common-work-and-explicit-font-use');
assert.match(fs.readFileSync(path.join(pwa,'index.html'),'utf8'),/<div class="brand">\s*<h1>trk<span>!<\/span><\/h1>/);
assert.equal(brand.textAtFixedPwa,'trk!');
assert.equal(labels.kind,'isolated-specimen-only');
assert.equal(labels.draftProperty,'label');
assert.deepEqual(labels.languages,['ja','en','zh','ko']);
assert.deepEqual(Object.keys(draft.label).sort(),[...labels.languages].sort());
assert.deepEqual(contract.fallbackOrder,[...contract.fontAssets.map(f=>f.id),'user-existing-font-stack','system-fallback']);
assert.equal(contract.dependencyPolicy,'both-verified-and-loaded-before-work-font-application');
assert.deepEqual(contract.protectedAreas,['body-and-descriptions','other-headings','study','base','playback-and-captions','shared-notes','other-packs-and-skins']);
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'avatar-font-contract-'));
try{
 const built=spawnSync(process.execPath,[path.join(root,'tools/prepare-re-modern-font-study.mjs'),`--out=${tmp}`,`--trk=${pwa}`,`--neo-dir=${process.env.TRK_NEO_DIR}`],{cwd:root,encoding:'utf8'});
 assert.equal(built.status,0,built.stderr||built.stdout);
 const files=[['DotGothic16-Regular.woff2','OFL.txt'],['neodgm.woff2','NeoDunggeunmo-OFL.txt']];
 const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
 const maps=files.map(([filename,license],i)=>{
  const f=fs.readFileSync(path.join(tmp,'assets',filename));
  const l=fs.readFileSync(path.join(tmp,'assets',license));
  assert.equal(f.length,contract.fontAssets[i].fontBytes);assert.equal(hash(f),contract.fontAssets[i].fontSha256);
  assert.equal(hash(l),contract.fontAssets[i].licenseSha256);
  return cmapOf(f,readWoff2(f));
 });
 assert.deepEqual(coverage(maps[0],brand.textAtFixedPwa).missing,[]);
 const result={};
 for(const lang of labels.languages){
  const text=draft.label[lang];assert.equal(typeof text,'string');assert(text.length>0);
  const dot=coverage(maps[0],text),neo=coverage(maps[1],text);
  assert.deepEqual(dot.missing,contract.expectedLabelCoverage[lang].dotMissing,`${lang} Dot cmap changed`);
  assert.deepEqual(neo.missing,contract.expectedLabelCoverage[lang].neoMissing,`${lang} Neo cmap changed`);
  const unionMissing=dot.missing.filter(ch=>neo.missing.includes(ch));
  assert.deepEqual(unionMissing,[],`${lang} label needs an additional font`);
  result[lang]={text,dotMissing:dot.missing,neoMissing:neo.missing,unionMissing};
 }
 console.log(JSON.stringify({pwa:contract.pwaReference,workId:draft.id,brandText:brand.textAtFixedPwa,labels:result,protectedAreas:contract.protectedAreas,scope:'Pinned standalone cmap checks; whitespace excluded. Not shaping, glyph appearance, complete language support, production font policy, actual user approval, or host implementation.'},null,2));
}finally{fs.rmSync(tmp,{recursive:true,force:true});}
