// SPDX-License-Identifier: GPL-3.0-or-later
// Characterization of PWA main 1fd6a89. Fakes inject failures; this is not a browser or PWA fix.
// TRK_PWA_REVIEW=/path/to/1fd6a89 node --test tests/re-modern-integration-review.test.mjs
import {test} from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
const pwa=process.env.TRK_PWA_REVIEW;
const pins={'title-font.js':'ddf4a4d4d46ebab765a0f0da789dec7b6a8eac9986cf5c86ad04de0908390581','remodern-regions.js':'40a57a0d33b3ff9721c03df77ef1d2449c02bd505af680e565da41e7ed592df0','remodern-work.js':'a5b0e07b531f91ab812db81686d52a3d41b6512fafcdefb17761a2ac66352bd5'};
const src={};if(pwa)for(const [name,sha] of Object.entries(pins)){const bytes=fs.readFileSync(path.join(pwa,'js',name));assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),sha,`wrong PWA ${name}`);src[name]=bytes.toString('utf8');}
const check=(name,fn)=>test(name,{skip:pwa?false:'set TRK_PWA_REVIEW to PWA main 1fd6a89'},fn);
function workApi(){const box={};vm.createContext(box);for(const name of ['remodern-regions.js','remodern-work.js'])vm.runInContext(src[name],box);return box.TrkReModernWork;}
function manifest(){return {format:'shadow-taiko-pack',name:'Example',license:'test-only',remodern:{version:1,id:'trk-re-modern-pixel-console',regions:['common'],colors:{text:'#ecf6ee'},titleFont:'dotneo'}};}
check('unknown titleFont is silently discarded; dotneo is not a heading.font value',()=>{const api=workApi(),input=manifest(),a=api.checkManifest(input);assert.equal(a.ok,true);assert.equal(Object.hasOwn(a.work,'titleFont'),false);input.remodern.heading={font:'dotneo'};const b=api.checkManifest(input);assert.equal(b.ok,false);assert.equal(b.reason,'bad-heading-font');input.remodern.heading={font:'dotgothic'};assert.equal(api.checkManifest(input).ok,true);});
check('missing colors are accepted by work validator; incomplete palette is not a full display',()=>{const api=workApi(),input=manifest();input.remodern.colors={};const r=api.checkManifest(input);assert.equal(r.ok,true);assert.equal(Object.keys(r.work.colors).length,0);});
function fontHarness(){const records=new Map(),storage={},classes=new Set(),faces=new Set(),style={};let failFamily='';
 const localStorage={getItem:k=>storage[k]??null,setItem:(k,v)=>{storage[k]=String(v);},removeItem:k=>{delete storage[k];}};
 const indexedDB={open(){const req={};queueMicrotask(()=>{req.result={objectStoreNames:{contains:()=>true},transaction(){const tx={};return Object.assign(tx,{objectStore(){const op=(kind,arg)=>{const r={};setImmediate(()=>{if(kind==='get')r.result=records.get(arg);if(kind==='put')records.set(arg.key,arg);if(kind==='delete')records.delete(arg);tx.oncomplete?.();});return r;};return {get:k=>op('get',k),put:v=>op('put',v),delete:k=>op('delete',k)};}});},close(){}};req.onsuccess?.();});return req;}};
 const document={readyState:'loading',addEventListener(){},fonts:{add:f=>faces.add(f),delete:f=>faces.delete(f)},body:{classList:{add:s=>classes.add(s),remove:s=>classes.delete(s)}},documentElement:{style:{setProperty:(k,v)=>style[k]=v,removeProperty:k=>delete style[k]}}};
 class FakeFontFace{constructor(family){this.family=family;}async load(){if(this.family===failFamily)throw Error('injected FontFace failure');return this;}}
 const box={document,localStorage,indexedDB,crypto:crypto.webcrypto,FontFace:FakeFontFace,Uint8Array,ArrayBuffer,Date,Promise,Set,Object,Array,JSON,Math,Number,String,Error};box.window=box;box.addEventListener=()=>{};vm.runInNewContext(src['title-font.js'],box);
 const api=box.Trk.titleFont,inputs=new Map();for(const c of api.CANDIDATES)for(const f of c.files){const b=Buffer.from('synthetic test content: '+f.key);f.sha256=crypto.createHash('sha256').update(b).digest('hex');f.bytes=b.length;inputs.set(f.key,{size:b.length,arrayBuffer:async()=>Uint8Array.from(b).buffer});}
 async function importCandidate(id){const c=api.CANDIDATES.find(x=>x.id===id);for(const f of c.files)assert.equal((await api.importFile(id,f.key,inputs.get(f.key))).ok,true);}
 return {api,classes,faces,storage,importCandidate,fail:f=>{failFamily=f;}};
}
check('current work lookup prioritizes work mapping over explicit global choice',()=>{const h=fontHarness();h.storage.trkTitleFont='galmuri';assert.equal(h.api.setWorkFont('trk-re-modern-pixel-console','dotneo'),true);assert.equal(h.api.fontForWork('trk-re-modern-pixel-console'),'dotneo');assert.equal(h.api.fontForWork('another-work'),'galmuri');});
check('verified but un-loadable next font loses previous active choice and choose reports success',async()=>{const h=fontHarness();await h.importCandidate('galmuri');await h.importCandidate('dotneo');assert.equal((await h.api.choose('galmuri')).ok,true);assert.equal(h.api.state().status,'active');h.fail('TrkTitleDot');const r=await h.api.choose('dotneo');assert.equal(r.ok,true);assert.equal(h.api.readChoice(),'dotneo');assert.equal(h.api.state().status,'error');assert.equal(h.classes.has('trk-title-font-on'),false);assert.equal(h.faces.size,0);});
