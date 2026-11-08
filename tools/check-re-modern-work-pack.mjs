#!/usr/bin/env node
// SPDX-License-Identifier: GPL-3.0-or-later
// Local, read-only preflight against the pinned PWA implementation; NOT a security or rights audit.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {openZip} from './lib/zip.mjs';

export const PWA_REF='8531b4e206dd79adffcad3782fce3e7dd3521d7f';
const PINS={
 'remodern-regions.js':'40a57a0d33b3ff9721c03df77ef1d2449c02bd505af680e565da41e7ed592df0',
 'remodern-work.js':'6db59bcb17b39bd6de1c84145ee2862ff69b17c77f560ae56172357435f4d86d',
 'remodern-ui.js':'c910b1e4448e19bea8e14d7a6d95bdcfce734cadf89389b1a94e3cd3117f04c0',
 'zip-io.js':'5e5b274f8656d469fcc25e95f83a7379fa2c3f36a28e79bcbc83b20d34f2fcbf'
};
const CAP=256*1024;
const digest=x=>crypto.createHash('sha256').update(x).digest('hex');
function loadRules(pwa){
 if(!pwa)throw Error('TRK_PWA_320 must identify a trusted PWA checkout');
 const sources={};
 for(const [name,sha] of Object.entries(PINS)){const bytes=fs.readFileSync(path.join(pwa,'js',name));if(digest(bytes)!==sha)throw Error(`PWA source mismatch: ${name}; expected trk320 ${PWA_REF}`);sources[name]=bytes.toString('utf8');}
 // Run only code from the trusted checkout after the fixed-source hash check.
 const ctx={};vm.createContext(ctx);for(const name of ['remodern-regions.js','remodern-work.js'])vm.runInContext(sources[name],ctx,{filename:name});return ctx.TrkReModernWork;
}
const failed=(stage,reason,extra={})=>({ok:false,stage,reason,...extra});
export async function inspectWorkBytes(bytes,pwa){
 const W=loadRules(pwa);
 if(bytes.length>W.MAX_ZIP_BYTES)return failed('zip-size','too-large',{limit:W.MAX_ZIP_BYTES});
 let zip;try{zip=await openZip(bytes,pwa);}catch{return failed('zip','invalid-or-unsupported-zip');}
 const names=zip.names();const allowed=W.checkEntryNames(names);if(!allowed.ok)return failed('entries',allowed.reason,{names});
 const entry=zip.entry('pack.json');if(!entry)return failed('manifest','missing-pack.json');
 if(entry.usize>W.MAX_JSON_BYTES)return failed('manifest','too-large',{limit:W.MAX_JSON_BYTES});
 let raw;try{raw=JSON.parse(await zip.readText('pack.json',W.MAX_JSON_BYTES));}catch{return failed('manifest','unreadable-or-invalid-json');}
 const checked=W.checkManifest(raw);if(!checked.ok)return failed('manifest',checked.reason);
 const dropped=[];
 const unknown=(obj,allowed,prefix)=>{if(obj&&typeof obj==='object'&&!Array.isArray(obj))for(const k of Object.keys(obj))if(!allowed.includes(k))dropped.push(prefix+k);};
 unknown(raw,['format','name','author','license','remodern'],'pack.json:');
 unknown(raw.remodern,['version','id','regions','colors','heading'],'remodern:');
 unknown(raw.remodern?.colors,W.COLOR_KEYS,'colors:');unknown(raw.remodern?.heading,['font'],'heading:');
 return {ok:true,stage:'preflight',pwaRef:PWA_REF,bytes:bytes.length,sha256:digest(bytes),entries:names,work:checked.work,possiblyIgnoredFields:dropped,limitations:['No storage, registration, permission, rights, safety, UI, rendering or device verification','This examines pack.json and entry names only; accompanying documents are not read','Source hashes, not actual PWA execution environment, are pinned']};
}
function readBounded(file){const fd=fs.openSync(file,'r');try{const s=fs.fstatSync(fd);if(!s.isFile())throw Error('input must be a regular file');if(s.size>CAP)return Buffer.alloc(CAP+1);const b=Buffer.alloc(CAP+1);let n=0;while(n<b.length){const r=fs.readSync(fd,b,n,b.length-n,null);if(!r)break;n+=r;}return b.subarray(0,n);}finally{fs.closeSync(fd);}}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{if(process.argv.length!==3)throw Error('Usage: TRK_PWA_320=/path/to/trusted-pwa node tools/check-re-modern-work-pack.mjs /path/to/work.stpack');const r=await inspectWorkBytes(readBounded(process.argv[2]),process.env.TRK_PWA_320);console.log(JSON.stringify(r,null,2));if(!r.ok)process.exitCode=1;}
 catch(e){console.error(`preflight error: ${e.message}`);process.exitCode=2;}
}
