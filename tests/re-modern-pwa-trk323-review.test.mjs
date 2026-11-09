// SPDX-License-Identifier: GPL-3.0-or-later
// Characterization of fixed PWA trk323. Synthetic DOM/IndexedDB/fonts; NOT a real browser.
// TRK_PWA_323=/path/to/pwa node --test tests/re-modern-pwa-trk323-review.test.mjs
import {test} from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
const pwa=process.env.TRK_PWA_323;
let src,i18n;
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
if(pwa){src=fs.readFileSync(path.join(pwa,'js/title-font.js'),'utf8');i18n=fs.readFileSync(path.join(pwa,'js/i18n.js'),'utf8');assert.equal(sha(src),'379bf47f58279dbb41776035997ba605cfe5afeb91073f198d7a576257d11279');assert.equal(sha(i18n),'752da08914332ea5615f40814fefa4b1563d9455c16282fd388fc0e63adf12a6');}
const check=(n,fn)=>test(n,{skip:pwa?false:'set TRK_PWA_323'},fn);
function harness(){
 const records=new Map(), storage={},classes=new Set(),faces=new Set();let message='',confirmAnswer=false,failChoiceRemoval=false, worksRead=0, failWorksReads=new Set();
 class Element{constructor(tag){this.tagName=tag;this.children=[];this.dataset={};this.handlers={};this.id='';this.className='';this.value='';}set textContent(v){this.text=String(v);this.children=[];}get textContent(){return this.text||'';}appendChild(x){this.children.push(x);return x;}setAttribute(k,v){this[k]=v;}addEventListener(k,f){this.handlers[k]=f;}querySelectorAll(){return [];}focus(){}}
 const container=new Element('div');
 function all(el){return [el,...el.children.flatMap(all)];}
 const document={readyState:'loading',addEventListener(){},createElement:t=>new Element(t),getElementById:id=>all(container).find(e=>e.id===id)||null,activeElement:null,fonts:{add:f=>faces.add(f),delete:f=>faces.delete(f)},body:{classList:{add:v=>classes.add(v),remove:v=>classes.delete(v)}},documentElement:{style:{setProperty(){},removeProperty(){}}}};
 const localStorage={getItem:k=>{if(k==='trkTitleFontWorks' && failWorksReads.has(++worksRead))throw Error('injected read failure');return storage[k]??null;},setItem:(k,v)=>{storage[k]=String(v);},removeItem:k=>{if(k==='trkTitleFont'&&failChoiceRemoval)throw Error('injected storage failure');delete storage[k];}};
 const indexedDB={open(){const req={};queueMicrotask(()=>{req.result={objectStoreNames:{contains:()=>true},close(){},transaction(){const tx={};return Object.assign(tx,{objectStore(){const op=(kind,arg)=>{const r={};setImmediate(()=>{if(kind==='get')r.result=records.get(arg);if(kind==='put')records.set(arg.key,arg);if(kind==='delete')records.delete(arg);tx.oncomplete?.();});return r;};return {get:k=>op('get',k),put:v=>op('put',v),delete:k=>op('delete',k)};}});}};req.onsuccess?.();});return req;}};
 class FakeFontFace{constructor(family){this.family=family;}async load(){return this;}}
 const box={document,localStorage,indexedDB,crypto:crypto.webcrypto,FontFace:FakeFontFace,Option:class extends Element{constructor(text,value){super('option');this.textContent=text;this.value=value;}},setTimeout,clearTimeout,Uint8Array,ArrayBuffer,Date,Promise,Set,Object,Array,JSON,Math,Number,String,Error};box.window=box;box.addEventListener=()=>{};box.confirm=m=>{message=m;return confirmAnswer;};vm.createContext(box);vm.runInContext(i18n+'\nwindow.setTestLanguage = value => { lang = value; };',box);vm.runInContext(src,box);
 const api=box.Trk.titleFont;
 async function importCandidate(id){const c=api.CANDIDATES.find(x=>x.id===id);for(const f of c.files){const b=Buffer.from('synthetic trk323 '+f.key);f.sha256=sha(b);f.bytes=b.length;assert.equal((await api.importFile(id,f.key,{size:b.length,arrayBuffer:async()=>Uint8Array.from(b).buffer})).ok,true);}}
 async function mountAndFind(id){api.mount(container);for(let i=0;i<200;i++){await new Promise(r=>setTimeout(r,2));const card=all(container).find(x=>x.dataset.font===id);const button=card&&all(card).find(x=>x.className==='titleFontRemove');if(button && all(container).filter(x=>x.dataset.font).length===3)return button;}throw Error('render did not finish');}
 return {api,storage,records,classes,box,document,importCandidate,mountAndFind,setAnswer:x=>{confirmAnswer=x;},failChoiceRemoval:()=>{failChoiceRemoval=true;},message:()=>message,failWorksReads:(...reads)=>{worksRead=0;failWorksReads=new Set(reads);}};
}
check('single-read failure injection preserves existing work and count',()=>{
 let h=harness();h.storage.trkTitleFontWorks='{"a":"galmuri","unknown":{"font":"future","x":5}}';h.failWorksReads(2);
 assert.equal(h.api.linkedWorkCount('galmuri'),1);
 h=harness();h.storage.trkTitleFontWorks='{"a":"galmuri","unknown":{"font":"future","x":5}}';h.failWorksReads(2);
 assert.equal(h.api.setWorkFont('b','press'),true);assert.deepEqual(JSON.parse(h.storage.trkTitleFontWorks),{a:'galmuri',unknown:{font:'future',x:5},b:{font:'press',on:false}});
});
check('first read failure and invalid or empty values leave original unmodified',()=>{
 for(const raw of ['','{broken','[]','null']){const h=harness();h.storage.trkTitleFontWorks=raw;assert.equal(h.api.linkedWorkCount('galmuri'),null);assert.equal(h.api.setWorkFont('b','press'),false);assert.equal(h.storage.trkTitleFontWorks,raw);}
 const h=harness();h.storage.trkTitleFontWorks='{"a":"galmuri"}';h.failWorksReads(1);assert.equal(h.api.setWorkFont('b','press'),false);assert.equal(h.storage.trkTitleFontWorks,'{"a":"galmuri"}');
});
check('selected but missing uses hidden rather than active confirmation',()=>{const h=harness();h.storage.trkTitleFont='galmuri';const c=h.api.CANDIDATES.find(x=>x.id==='galmuri');const msg=h.api.removeConfirmText(c);assert.match(msg,/いまは題字に表示されていません/);assert.doesNotMatch(msg,/いま使っている書体なので/);});
check('backup preserves exact corrupt JS string and delete is confined to work key',()=>{
 const h=harness(),raw='{bad'+String.fromCharCode(0xd800);h.storage.trkTitleFontWorks=raw;h.storage.trkTitleFont='galmuri';h.storage.other='untouched';
 const backup=h.api.backupWorks();assert.equal(backup.ok,true);const envelope=JSON.parse(backup.text);assert.equal(envelope.raw,raw);assert.equal(envelope.state,'invalid');assert.equal(h.storage.trkTitleFontWorks,raw);
 assert.equal(h.api.removeWorksSettings().ok,true);assert.equal(h.storage.trkTitleFontWorks,undefined);assert.equal(h.storage.trkTitleFont,'galmuri');assert.equal(h.storage.other,'untouched');
});
check('unknown work entries outside the accepted ID range are dropped on a write (characterization)',()=>{
 const h=harness(),long='x'.repeat(65);h.storage.trkTitleFontWorks=JSON.stringify({[long]:{font:'future'},known:'galmuri'});
 assert.equal(h.api.setWorkFont('new','press'),true);const result=JSON.parse(h.storage.trkTitleFontWorks);assert.equal(Object.hasOwn(result,long),false);assert.equal(result.known,'galmuri');
});
check('all four languages implement the same 59 tf keys and placeholders',()=>{
 const b={};vm.runInNewContext(i18n+'\nglobalThis.testText=TEXT;',b);const keys=Object.keys(b.testText.en).filter(k=>k.startsWith('tf')).sort();assert.equal(keys.length,59);
 const vars=s=>[...s.matchAll(/\{([^}]+)\}/g)].map(x=>x[1]).sort();
 for(const lang of ['ja','zh','ko']){assert.deepEqual(Object.keys(b.testText[lang]).filter(k=>k.startsWith('tf')).sort(),keys);for(const key of keys){assert.ok(b.testText[lang][key].trim());assert.deepEqual(vars(b.testText[lang][key]),vars(b.testText.en[key]),`${lang}.${key}`);}}
});
check('PWA zh and ko counted and unknown confirmation use localized text',()=>{
 for(const lang of ['zh','ko']){const h=harness();h.box.setTestLanguage(lang);const c=h.api.CANDIDATES.find(x=>x.id==='galmuri');h.storage.trkTitleFontWorks='{bad';let text=h.api.removeConfirmText(c);assert.match(text,lang==='zh'?/无法确认受影响的作品数/:/작품 수를 확인할 수 없습니다/);assert.doesNotMatch(text,/\{\w+\}/);h.storage.trkTitleFontWorks='{"a":"galmuri"}';text=h.api.removeConfirmText(c);assert.match(text,lang==='zh'?/1 个作品/:/작품이 1개/);assert.doesNotMatch(text,/\{\w+\}/);}
});
check('extra fields on the changed known work entry are discarded (characterization)',()=>{const h=harness();h.storage.trkTitleFontWorks='{"a":{"font":"galmuri","on":false,"future":"keep?"},"b":{"font":"future","note":1}}';assert.equal(h.api.setWorkLink('a',true),true);assert.deepEqual(JSON.parse(h.storage.trkTitleFontWorks),{a:{font:'galmuri',on:true},b:{font:'future',note:1}});});
