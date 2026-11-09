// SPDX-License-Identifier: GPL-3.0-or-later
// Characterization of fixed PWA trk321. Synthetic DOM/IndexedDB/fonts; NOT a real browser.
// TRK_PWA_321=/path/to/pwa node --test tests/re-modern-pwa-trk321-review.test.mjs
import {test} from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
const pwa=process.env.TRK_PWA_321;
let src,i18n;
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
if(pwa){src=fs.readFileSync(path.join(pwa,'js/title-font.js'),'utf8');i18n=fs.readFileSync(path.join(pwa,'js/i18n.js'),'utf8');assert.equal(sha(src),'648e8a29da7298f160e42687af829902d8a19bd9ba7cc6ad263616832a342af9');assert.equal(sha(i18n),'6a35ddae03c519c4bdf4a4e3a8041c6e2ba39ad52255fcdeb4d2163e5eb51ac6');}
const check=(n,fn)=>test(n,{skip:pwa?false:'set TRK_PWA_321'},fn);
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
 async function importCandidate(id){const c=api.CANDIDATES.find(x=>x.id===id);for(const f of c.files){const b=Buffer.from('synthetic trk321 '+f.key);f.sha256=sha(b);f.bytes=b.length;assert.equal((await api.importFile(id,f.key,{size:b.length,arrayBuffer:async()=>Uint8Array.from(b).buffer})).ok,true);}}
 async function mountAndFind(id){api.mount(container);for(let i=0;i<200;i++){await new Promise(r=>setTimeout(r,2));const card=all(container).find(x=>x.dataset.font===id);const button=card&&all(card).find(x=>x.className==='titleFontRemove');if(button && all(container).filter(x=>x.dataset.font).length===3)return button;}throw Error('render did not finish');}
 return {api,storage,records,classes,box,document,importCandidate,mountAndFind,setAnswer:x=>{confirmAnswer=x;},failChoiceRemoval:()=>{failChoiceRemoval=true;},message:()=>message,failWorksReads:(...reads)=>{worksRead=0;failWorksReads=new Set(reads);}};
}
check('trk321 confirms unselected font without claiming the title returns',async()=>{const h=harness();await h.importCandidate('galmuri');await h.importCandidate('press');await h.api.choose('galmuri');h.storage.trkTitleFontWorks=JSON.stringify({a:'press'});const button=await h.mountAndFind('press');h.setAnswer(true);await button.handlers.click();assert.match(h.message(),/いまの題字は変わりません/);assert.match(h.message(),/1 件/);assert.equal(h.api.readChoice(),'galmuri');assert.equal(h.api.state().status,'active');});
check('corrupt JSON and read exception are unknown; no write',()=>{const h=harness();h.storage.trkTitleFontWorks='{broken';assert.equal(h.api.linkedWorkCount('galmuri'),null);assert.equal(h.api.setWorkFont('a','galmuri'),false);assert.equal(h.storage.trkTitleFontWorks,'{broken');h.storage.trkTitleFontWorks='{"a":"galmuri"}';h.failWorksReads(1);assert.equal(h.api.linkedWorkCount('galmuri'),null);assert.equal(h.storage.trkTitleFontWorks,'{"a":"galmuri"}');});
check('failure only on second work read reports zero after intact check',()=>{const h=harness();h.storage.trkTitleFontWorks='{"a":"galmuri"}';h.failWorksReads(2);assert.equal(h.api.linkedWorkCount('galmuri'),0);assert.equal(h.storage.trkTitleFontWorks,'{"a":"galmuri"}');});
check('failure only on second work read may replace existing work settings',()=>{const h=harness();h.storage.trkTitleFontWorks='{"a":"galmuri"}';h.failWorksReads(2);assert.equal(h.api.setWorkFont('b','press'),true);assert.equal(h.storage.trkTitleFontWorks,'{"b":{"font":"press","on":false}}');});
check('partial delete reports files removed and selection remains',async()=>{const h=harness();await h.importCandidate('galmuri');await h.api.choose('galmuri');const button=await h.mountAndFind('galmuri');h.setAnswer(true);h.failChoiceRemoval();await button.handlers.click();assert.equal(h.records.has('galmuri11'),false);assert.equal(h.api.readChoice(),'galmuri');assert.equal(h.api.state().status,'missing');assert.match(h.document.getElementById('titleFontState').textContent,/書体のファイルは削除しました/);});
check('proposed zh/ko cover all 46 title-font keys and match interpolation placeholders',()=>{
 const proposal=JSON.parse(fs.readFileSync('docs/re-modern-research/trk321-handoff/title-font-locales.proposal.json','utf8'));
 const b={};vm.runInNewContext(i18n+'\nglobalThis.testText=TEXT;',b);
 const keys=Object.keys(b.testText.en).filter(k=>k.startsWith('tf')).sort();assert.equal(keys.length,46);
 const vars=s=>[...s.matchAll(/\{([^}]+)\}/g)].map(x=>x[1]).sort();
 for(const lang of ['zh','ko']){assert.deepEqual(Object.keys(proposal[lang]).sort(),keys);for(const k of keys){assert.ok(proposal[lang][k].trim(),`${lang}.${k}`);assert.deepEqual(vars(proposal[lang][k]),vars(b.testText.en[k]),`${lang}.${k}`);}}
});
check('proposed zh/ko build unknown and counted confirmations without placeholder leakage',()=>{
 const proposal=JSON.parse(fs.readFileSync('docs/re-modern-research/trk321-handoff/title-font-locales.proposal.json','utf8'));
 for(const lang of ['zh','ko']){const h=harness();h.box.proposed=proposal[lang];vm.runInContext(`Object.assign(TEXT.${lang}, proposed)`,h.box);h.box.setTestLanguage(lang);const c=h.api.CANDIDATES.find(x=>x.id==='galmuri');h.storage.trkTitleFontWorks='{bad';let text=h.api.removeConfirmText(c);assert.match(text,lang==='zh'?/无法确认受影响的作品数/:/작품 수를 확인할 수 없습니다/);assert.doesNotMatch(text,/\{\w+\}/);h.storage.trkTitleFontWorks='{"a":"galmuri"}';text=h.api.removeConfirmText(c);assert.match(text,lang==='zh'?/1 个作品/:/작품이 1개/);assert.doesNotMatch(text,/\{\w+\}/);}
});
