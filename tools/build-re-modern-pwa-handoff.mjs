#!/usr/bin/env node
// SPDX-License-Identifier: GPL-3.0-or-later
// A reproducible PWA consultation experiment; not a published work or font pack.
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {loadZipIO,openZip} from './lib/zip.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export const PWA_REF='4f93a69f94ec3a3c14c6ea8d1cf9c064723b43e6';
const keys=['stage','ink','text','muted','bg','panel','field','button','accent','onAccent','gold','border','don','ka'];
function git(pwa,...args){const r=spawnSync('git',args,{cwd:pwa,encoding:'utf8'});assert.equal(r.status,0,r.stderr||String(r.error));return r.stdout.trim();}
export async function buildHandoff(pwa){
 assert(pwa,'TRK_PWA must name the clean fixed PWA checkout');pwa=path.resolve(pwa);
 assert.equal(git(pwa,'rev-parse','HEAD'),PWA_REF,'incorrect PWA revision');assert.equal(git(pwa,'status','--porcelain'),'','PWA checkout must be clean');
 const draft=JSON.parse(fs.readFileSync(path.join(root,'drafts/re-modern/pixel-console/skin.json'),'utf8'));
 const registry=JSON.parse(fs.readFileSync(path.join(root,'catalog/re-modern/index.json'),'utf8'));
 const catalog=JSON.parse(fs.readFileSync(path.join(root,'catalog/skins.json'),'utf8'));
 assert.equal(draft.id,'trk-re-modern-pixel-console');assert(draft.cat?.includes('trk-re-modern'));assert(!registry.ids.includes(draft.id)&&!catalog.skins.some(s=>s.id===draft.id),'draft must remain unregistered');
 assert.equal(Object.keys(draft.colors).length,keys.length);for(const k of keys)assert.match(draft.colors[k]||'',/^#[0-9a-f]{6}$/i,k);
 const colors=Object.fromEntries(keys.map(k=>[k,draft.colors[k]]));
 const manifest={format:'shadow-taiko-pack',version:1,name:'ピクセル・コンソール（相談・検証用）',author:'trk-Avatar-Library',license:'GPL-3.0-or-later',remodern:{version:1,id:draft.id,regions:['common'],colors}};
 const ctx={};vm.createContext(ctx);for(const name of ['js/remodern-regions.js','js/remodern-work.js'])vm.runInContext(fs.readFileSync(path.join(pwa,name),'utf8'),ctx,{filename:name});
 const W=ctx.TrkReModernWork,valid=W.checkManifest(manifest);assert(valid.ok,`PWA manifest rejected: ${valid.reason}`);
 const readme='ピクセル・コンソール：PWA相談・検証用／正式配布物ではありません。\n作品案は承認済みですが、正式登録・公開・フォント採用は未了です。\nこれは作品全体ではなく、共通題字の作品色を検討する実験です。\nフォント、スキン全体、ノーツ、書斎・基地は含みません。\n未登録作品のため、固定PWAでは開発用の未確認作品色の試験を明示的に有効化しない限り色は適用されません。\n背景の判定により色が保留される場合があります。通常の利用者データを使わず隔離環境で確認してください。\n';
 const files=[{name:'LICENSE.txt',blob:new Blob([fs.readFileSync(path.join(root,'LICENSE'))])},{name:'README.txt',blob:new Blob([readme])},{name:'pack.json',blob:new Blob([JSON.stringify(manifest,null,2)+'\n'])}];
 assert(W.checkEntryNames(files.map(f=>f.name)).ok);const bytes=Buffer.from(await (await loadZipIO(pwa).zipWrite(files)).arrayBuffer());
 assert(bytes.length<=W.MAX_ZIP_BYTES);assert(Buffer.byteLength(JSON.stringify(manifest,null,2)+'\n')<=W.MAX_JSON_BYTES);
 const archive=await openZip(bytes,pwa);assert.deepEqual([...archive.names()].sort(),['LICENSE.txt','README.txt','pack.json']);assert.deepEqual(JSON.parse(await archive.readText('pack.json')),manifest);
 return {bytes,manifest,sha256:crypto.createHash('sha256').update(bytes).digest('hex'),pwaRef:PWA_REF};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{assert.equal(process.argv.length,2,'No arguments supported. Set TRK_PWA.');const r=await buildHandoff(process.env.TRK_PWA);const out=path.join(root,'dist/re-modern-pwa-handoff/pixel-console-consultation.stpack');fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,r.bytes);console.log(JSON.stringify({out,bytes:r.bytes.length,sha256:r.sha256,pwaRef:r.pwaRef,status:'CONSULTATION EXPERIMENT; NOT A RELEASE'},null,2));}catch(e){console.error(`❌ ${e.message}`);process.exitCode=1;}
}
