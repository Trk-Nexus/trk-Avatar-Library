// SPDX-License-Identifier: GPL-3.0-or-later
// Fixed PWA branch regression and characterization; synthetic FontFace and storage, NOT browser proof.
// TRK_PWA_318=/path/to/pwa-285a357 node --test tests/re-modern-pwa-trk318-review.test.mjs
import {test} from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
const dir=process.env.TRK_PWA_318;
let src;
if(dir){const b=fs.readFileSync(path.join(dir,'js/title-font.js'));assert.equal(crypto.createHash('sha256').update(b).digest('hex'),'cbfb61f44677bbcc75ca356e44d95048a0b6374fbc04bec1e8219084fa905ff2');src=b.toString();}
const check=(name,fn)=>test(name,{skip:dir?false:'set TRK_PWA_318 to PWA commit 285a357'},fn);
function harness(){
 const records=new Map(),storage={},classes=new Set(),faces=new Set(),style={};let gate=null;
 const localStorage={getItem:k=>storage[k]??null,setItem:(k,v)=>{storage[k]=String(v);},removeItem:k=>{delete storage[k];}};
 const indexedDB={open(){const req={};queueMicrotask(()=>{req.result={objectStoreNames:{contains:()=>true},transaction(){const tx={};return Object.assign(tx,{objectStore(){const op=(kind,arg)=>{const r={};setImmediate(()=>{if(kind==='get')r.result=records.get(arg);if(kind==='put')records.set(arg.key,arg);if(kind==='delete')records.delete(arg);tx.oncomplete?.();});return r;};return {get:k=>op('get',k),put:v=>op('put',v),delete:k=>op('delete',k)};}});},close(){}};req.onsuccess?.();});return req;}};
 const document={readyState:'loading',addEventListener(){},fonts:{add:f=>faces.add(f),delete:f=>faces.delete(f)},body:{classList:{add:s=>classes.add(s),remove:s=>classes.delete(s)}},documentElement:{style:{setProperty:(k,v)=>style[k]=v,removeProperty:k=>delete style[k]}}};
 class FakeFontFace {constructor(family){this.family=family;} async load(){if(gate){gate.started();await gate.promise;}return this;}}
 const box={document,localStorage,indexedDB,crypto:crypto.webcrypto,FontFace:FakeFontFace,Uint8Array,ArrayBuffer,Date,Promise,Set,Object,Array,JSON,Math,Number,String,Error};box.window=box;box.addEventListener=()=>{};vm.runInNewContext(src,box);
 const api=box.Trk.titleFont;
 async function importCandidate(id){const c=api.CANDIDATES.find(x=>x.id===id);for(const f of c.files){const b=Buffer.from('synthetic trk318 '+f.key);f.sha256=crypto.createHash('sha256').update(b).digest('hex');f.bytes=b.length;assert.equal((await api.importFile(id,f.key,{size:b.length,arrayBuffer:async()=>Uint8Array.from(b).buffer})).ok,true);}}
 return {api,storage,classes,importCandidate,block(){let release,started;const promise=new Promise(r=>{release=r;});const reached=new Promise(r=>{started=r;});gate={promise,release,reached,started};return gate;}};
}
check('legacy work mapping remains off and survives another work being written',()=>{
 const h=harness();h.storage.trkTitleFontWorks=JSON.stringify({'trk-re-modern-pixel-console':'dotneo',unknown:'future',broken:42});
 assert.equal(h.api.fontForWork('trk-re-modern-pixel-console'),'');
 assert.equal(h.api.setWorkFont('trk-re-modern-another','galmuri'),true);
 const saved=JSON.parse(h.storage.trkTitleFontWorks);assert.equal(saved['trk-re-modern-pixel-console'],'dotneo');assert.equal(saved.unknown,'future');assert.equal(saved.broken,42);assert.equal(saved['trk-re-modern-another'].on,false);
 assert.equal(h.api.setWorkLink('trk-re-modern-pixel-console',true),true);assert.equal(h.api.fontForWork('trk-re-modern-pixel-console'),'dotneo');
});
check('pending prepare cannot overwrite a later off in the same tab',async()=>{
 const h=harness();await h.importCandidate('galmuri');const gate=h.block();const pending=h.api.choose('galmuri');await gate.reached;
 assert.equal((await h.api.choose('')).ok,true);assert.equal(h.api.readChoice(),'');gate.release();const result=await pending;
 assert.equal(result.ok,false);assert.equal(result.reason,'superseded');assert.equal(h.api.readChoice(),'');assert.equal(h.classes.has('trk-title-font-on'),false);
});
check('characterization: pending prepare can reactivate a candidate after its files are removed',async()=>{
 const h=harness();await h.importCandidate('galmuri');const gate=h.block();const pending=h.api.choose('galmuri');await gate.reached;
 assert.equal((await h.api.removeCandidate('galmuri')).ok,true);assert.equal((await h.api.inventory(h.api.CANDIDATES.find(c=>c.id==='galmuri'))).galmuri11.state,'absent');gate.release();const result=await pending;
 assert.equal(result.ok,true);assert.equal(h.api.readChoice(),'galmuri');assert.equal(h.classes.has('trk-title-font-on'),true);assert.equal((await h.api.inventory(h.api.CANDIDATES.find(c=>c.id==='galmuri'))).galmuri11.state,'absent');
});
check('characterization: invalid whole work-settings JSON is overwritten by a later write',()=>{
 const h=harness(),bad='{"old-work":';h.storage.trkTitleFontWorks=bad;
 assert.equal(h.api.setWorkFont('trk-re-modern-another','galmuri'),true);
 assert.notEqual(h.storage.trkTitleFontWorks,bad);
 assert.deepEqual(JSON.parse(h.storage.trkTitleFontWorks),{'trk-re-modern-another':{font:'galmuri',on:false}});
});
