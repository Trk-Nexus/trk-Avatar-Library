// SPDX-License-Identifier: GPL-3.0-or-later
// Fixed-source integration tests; use a clean, trusted trk320 PWA checkout.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {inspectWorkBytes} from '../tools/check-re-modern-work-pack.mjs';
import {loadZipIO} from '../tools/lib/zip.mjs';
const pwa=process.env.TRK_PWA_320;
const check=(n,fn)=>test(n,{skip:pwa?false:'set TRK_PWA_320 to trusted PWA trk320'},fn);
const manifest={format:'shadow-taiko-pack',version:1,name:'example',author:'example',license:'example',remodern:{version:1,id:'trk-re-modern-example',regions:['common'],colors:{stage:'#123456'}}};
async function zip(entries){const io=loadZipIO(pwa);return Buffer.from(await (await io.zipWrite(entries.map(([name,text])=>({name,blob:new Blob([text])})))).arrayBuffer());}
check('valid manifest and permitted documentation',async()=>{const r=await inspectWorkBytes(await zip([['pack.json',JSON.stringify(manifest)],['README.md','hello'],['LICENSE.txt','license']]),pwa);assert.equal(r.ok,true);assert.equal(r.work.id,'trk-re-modern-example');assert.deepEqual(r.possiblyIgnoredFields,['pack.json:version']);});
check('unknown properties are reported rather than silently treated as supported',async()=>{const raw=structuredClone(manifest);raw.remodern.titleFont='galmuri';raw.remodern.colors.future='#ffffff';const r=await inspectWorkBytes(await zip([['pack.json',JSON.stringify(raw)]]),pwa);assert.equal(r.ok,true);assert.deepEqual(r.possiblyIgnoredFields,['pack.json:version','remodern:titleFont','colors:future']);});
check('denies unsupported names and nested files',async()=>{for(const [name,reason] of [['LICENSE-OFL.txt','extra-file'],['fonts/font.woff2','nested-file'],['README.js','extra-file']]){const r=await inspectWorkBytes(await zip([['pack.json',JSON.stringify(manifest)],[name,'x']]),pwa);assert.equal(r.reason,reason);}});
check('rejects invalid zip, missing or invalid manifest, and size limits',async()=>{assert.equal((await inspectWorkBytes(Buffer.from('bad zip'),pwa)).stage,'zip');assert.equal((await inspectWorkBytes(await zip([['README.md','x']]),pwa)).reason,'missing-pack.json');assert.equal((await inspectWorkBytes(await zip([['pack.json','{']] ),pwa)).reason,'unreadable-or-invalid-json');assert.equal((await inspectWorkBytes(Buffer.alloc(256*1024+1),pwa)).reason,'too-large');assert.equal((await inspectWorkBytes(await zip([['pack.json',' '.repeat(32769)]]),pwa)).reason,'too-large');});
check('rejects invalid candidate values',async()=>{const raw=structuredClone(manifest);raw.remodern.heading={font:'dotneo'};const r=await inspectWorkBytes(await zip([['pack.json',JSON.stringify(raw)]]),pwa);assert.equal(r.reason,'bad-heading-font');});
check('different PWA sources fail closed before examining input',async()=>{const dir=fs.mkdtempSync(path.join(os.tmpdir(),'preflight-pin-'));try{fs.mkdirSync(path.join(dir,'js'));fs.writeFileSync(path.join(dir,'js/remodern-regions.js'),'not the fixed source');await assert.rejects(()=>inspectWorkBytes(Buffer.alloc(0),dir),/PWA source mismatch/);}finally{fs.rmSync(dir,{recursive:true,force:true});}});
