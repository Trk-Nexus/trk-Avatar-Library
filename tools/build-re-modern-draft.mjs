#!/usr/bin/env node
// SPDX-License-Identifier: GPL-3.0-or-later
// UNRELEASED compatibility experiment, not an official work-pack builder.
// TRK_PWA=/path/to/clean-pwa node tools/build-re-modern-draft.mjs
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {loadZipIO} from './lib/zip.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export const PWA_REF='4b4624140757e8faddda5b5a3b8c95df992ad9ca';
const keys=['stage','ink','text','muted','bg','panel','field','button','accent','onAccent','gold','border','don','ka'];
function git(pwa,...args){const r=spawnSync('git',args,{cwd:pwa,encoding:'utf8'});if(r.error||r.status!==0)throw Error(`git: ${r.error||r.stderr}`);return r.stdout.trim();}
export async function buildDraft(pwa) {
  if(!pwa)throw Error('TRK_PWA must name a clean checkout of the fixed PWA');
  pwa=path.resolve(pwa);
  if(git(pwa,'rev-parse','HEAD')!==PWA_REF||git(pwa,'status','--porcelain')) throw Error('PWA checkout must be clean and at '+PWA_REF);
  const draft=JSON.parse(fs.readFileSync(path.join(root,'drafts/re-modern/pixel-console/skin.json')));
  const registry=JSON.parse(fs.readFileSync(path.join(root,'catalog/re-modern/index.json')));
  const catalog=JSON.parse(fs.readFileSync(path.join(root,'catalog/skins.json')));
  if(draft.id!=='trk-re-modern-pixel-console'||registry.ids.includes(draft.id)||catalog.skins.some(s=>s.id===draft.id)) throw Error('This experimental builder only accepts the unregistered pixel-console draft');
  if(!draft.cat?.includes('trk-re-modern')||!draft.label?.ja||!draft.colors||Object.keys(draft.colors).length!==keys.length||keys.some(k=>!/^#[0-9a-f]{6}$/i.test(draft.colors[k]||''))) throw Error('Draft colors or identity do not match the experimental contract');
  // Only current common-title painting is represented. No study/base or font support claimed.
  const colors=Object.fromEntries(keys.map(k=>[k,draft.colors[k]]));
  const manifest={format:'shadow-taiko-pack',version:1,name:'ピクセル・コンソール（未承認・検証用）',author:'trk-Avatar-Library',license:'GPL-3.0-or-later',remodern:{version:1,id:draft.id,regions:['common'],colors}};
  const ctx={};vm.createContext(ctx);
  for(const file of ['js/remodern-regions.js','js/remodern-work.js'])vm.runInContext(fs.readFileSync(path.join(pwa,file),'utf8'),ctx,{filename:file});
  const W=ctx.TrkReModernWork, checked=W.checkManifest(manifest);
  if(!checked.ok)throw Error(`PWA rejected draft manifest: ${checked.reason}`);
  const readme='UNAPPROVED EXPERIMENT. Not a registered or released work. Common title colors only on trk305; no fonts, study or base appearance. Do not distribute as a finished skin.\n';
  const files=[{name:'LICENSE.txt',blob:new Blob([fs.readFileSync(path.join(root,'LICENSE'))])},{name:'README.txt',blob:new Blob([readme])},{name:'pack.json',blob:new Blob([JSON.stringify(manifest,null,2)+'\n'])}];
  if(!W.checkEntryNames(files.map(f=>f.name)).ok)throw Error('PWA refused archive entries');
  const blob=await loadZipIO(pwa).zipWrite(files);
  const bytes=Buffer.from(await blob.arrayBuffer());
  if(bytes.length>W.MAX_ZIP_BYTES||Buffer.byteLength(JSON.stringify(manifest,null,2)+'\n')>W.MAX_JSON_BYTES)throw Error('Draft exceeds PWA limits');
  return {bytes,manifest,sha256:crypto.createHash('sha256').update(bytes).digest('hex'),pwaRef:PWA_REF};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  try {
    if(process.argv.length!==2)throw Error('No arguments supported; this tool writes only an ignored draft output');
    const result=await buildDraft(process.env.TRK_PWA);
    const out=path.join(root,'dist/re-modern-drafts/pixel-console.DRAFT.stpack');
    fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,result.bytes);
    console.log(JSON.stringify({out,bytes:result.bytes.length,sha256:result.sha256,pwaRef:result.pwaRef,status:'UNAPPROVED EXPERIMENT; NOT A RELEASE'},null,2));
  }catch(e){console.error(`❌ ${e.message}`);process.exitCode=1;}
}
