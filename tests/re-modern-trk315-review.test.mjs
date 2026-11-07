// SPDX-License-Identifier: GPL-3.0-or-later
// Characterization of a PWA PR, NOT a PWA fix or production browser test.
// TRK_PWA_315=/path/to/pr-e4c5427c node --test tests/re-modern-trk315-review.test.mjs
import {test} from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
const pwa=process.env.TRK_PWA_315;
const source=pwa?fs.readFileSync(path.join(pwa,'js/title-font.js'),'utf8'):'';
if(pwa)assert.equal(crypto.createHash('sha256').update(source).digest('hex'),'cb71d7deed510d9099d9699c1c6923c1a07f4cf9175610c82c3e03c0edbf9bf9','wrong PR source');
const css=pwa?fs.readFileSync(path.join(pwa,'css/style.css'),'utf8'):'';
const check=(name,fn)=>test(name,{skip:pwa?false:'set TRK_PWA_315 to the fixed PR copy'},fn);
function harness(shared={records:new Map(),storage:{},failDelete:null,failChoice:false}){
 const classes=new Set(),style={},faces=new Set();
 const localStorage={getItem:k=>shared.storage[k]??null,setItem:(k,v)=>{if(shared.failChoice)throw Error('storage disabled');shared.storage[k]=String(v);},removeItem:k=>{if(shared.failChoice)throw Error('storage disabled');delete shared.storage[k];}};
 const indexedDB={open(){const req={};queueMicrotask(()=>{req.result={objectStoreNames:{contains:()=>true},transaction(){const tx={};return Object.assign(tx,{objectStore(){const op=(kind,arg)=>{const r={};setImmediate(()=>{if(kind==='delete'&&shared.failDelete===arg){tx.error=Error('simulated delete failure');tx.onabort?.();return;}if(kind==='get')r.result=shared.records.get(arg);if(kind==='put')shared.records.set(arg.key,arg);if(kind==='delete')shared.records.delete(arg);tx.oncomplete?.();});return r;};return {get:k=>op('get',k),put:v=>op('put',v),delete:k=>op('delete',k)};}});},close(){}};req.onsuccess?.();});return req;}};
 const doc={readyState:'loading',addEventListener(){},fonts:{add:f=>faces.add(f),delete:f=>faces.delete(f)},body:{classList:{add:s=>classes.add(s),remove:s=>classes.delete(s)}},documentElement:{style:{setProperty:(k,v)=>style[k]=v,removeProperty:k=>delete style[k]}}};
 class FakeFontFace{constructor(family){this.family=family;}async load(){return this;}}
 const box={document:doc,localStorage,indexedDB,crypto:crypto.webcrypto,FontFace:FakeFontFace,Uint8Array,ArrayBuffer,Date,Promise,Set,Object,Array,JSON,Math,Number,String,Error};box.window=box;vm.runInNewContext(source,box);
 const api=box.Trk.titleFont,inputs=new Map();for(const c of api.CANDIDATES)for(const f of c.files){const b=Buffer.from('synthetic test content: '+f.key);f.sha256=crypto.createHash('sha256').update(b).digest('hex');f.bytes=b.length;inputs.set(f.key,{arrayBuffer:async()=>Uint8Array.from(b).buffer});}
 const importCandidate=async id=>{const c=api.CANDIDATES.find(x=>x.id===id);for(const f of c.files){const r=await api.importFile(id,f.key,inputs.get(f.key));assert.equal(r.ok,true);}};
 return {api,classes,style,faces,shared,inputs,importCandidate};
}
check('comparison characterizes global card selector and typography precedence in fixed CSS',()=>{
 const prior='body.trk-typo-on .brand h1,body.trk-typo-on details.panel>summary,body.trk-typo-on .panel h3{font-family:var(--trk-typo-display,var(--font))}';
 const next='body.trk-title-font-on .brand h1,body.trk-title-font-on #skinGrid .skinCard b{font-family:var(--trk-title-font)}';
 assert(css.includes(prior));assert(css.indexOf(next)>css.indexOf(prior));
 // Equal .brand h1 selector specificity and later source order; card selector covers all matching cards.
 assert(!source.includes('settings.remodern'));assert(source.includes('concat(["var(--font)"])'));
});
check('switch to missing candidate drops old active face and records requested candidate',async()=>{
 const h=harness();await h.importCandidate('galmuri');await h.api.choose('galmuri');assert.equal(h.api.state().status,'active');assert(h.classes.has('trk-title-font-on'));
 await h.api.choose('dotneo');assert.equal(h.api.state().status,'missing');assert.equal(h.api.readChoice(),'dotneo');assert.equal(h.classes.has('trk-title-font-on'),false);assert.equal(h.faces.size,0);
});
check('failure deleting second file leaves first missing but active state and face remain',async()=>{
 const h=harness();await h.importCandidate('dotneo');await h.api.choose('dotneo');assert.equal(h.api.state().status,'active');h.shared.failDelete='neodunggeunmo';const result=await h.api.removeCandidate('dotneo');
 assert.equal(result.ok,false);assert.equal(h.shared.records.has('dotgothic16'),false);assert.equal(h.shared.records.has('neodunggeunmo'),true);assert.equal(h.api.readChoice(),'dotneo');assert.equal(h.api.state().status,'active');assert(h.classes.has('trk-title-font-on'));assert.equal(h.faces.size,2);
});
check('choice removal failure is ignored after successful file deletion',async()=>{
 const h=harness();await h.importCandidate('galmuri');await h.api.choose('galmuri');h.shared.failChoice=true;const result=await h.api.removeCandidate('galmuri');
 assert.equal(result.ok,true);assert.equal(h.api.readChoice(),'galmuri');assert.equal(h.api.state().status,'missing');assert.equal(h.shared.records.has('galmuri11'),false);
});
check('another tab does not refresh after a shared candidate is deleted',async()=>{
 const shared={records:new Map(),storage:{},failDelete:null,failChoice:false},a=harness(shared),b=harness(shared);
 await a.importCandidate('galmuri');await a.api.choose('galmuri');await b.api.refresh();assert.equal(b.api.state().status,'active');await a.api.removeCandidate('galmuri');
 assert.equal(a.api.state().status,'off');assert.equal(b.api.state().status,'active');assert(b.classes.has('trk-title-font-on'));
 await b.api.refresh();assert.equal(b.api.state().status,'off');assert.equal(b.classes.has('trk-title-font-on'),false);
});
