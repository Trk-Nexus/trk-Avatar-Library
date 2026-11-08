// SPDX-License-Identifier: GPL-3.0-or-later
// Fixed PWA main, isolated browser and REAL font; load completion deliberately gated.
// TRK_PWA_319=/path/to/pwa TRK_GALMURI_FILE=/path/to/Galmuri11.woff2 node tests/re-modern-pwa-trk319-browser.test.mjs
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {createServer} from 'node:http';
import {chromium as playwright} from 'playwright-core';
import chromium from '@sparticuz/chromium';
const pwa=process.env.TRK_PWA_319,font=process.env.TRK_GALMURI_FILE;assert(pwa&&font,'TRK_PWA_319 and TRK_GALMURI_FILE required');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
assert.equal(sha(fs.readFileSync(path.join(pwa,'js/title-font.js'))),'09dbdcc97fb2e65312766d311d81cee0aad89393ae90d139026ca6cfd399ef91');
const bytes=fs.readFileSync(font);assert.equal(bytes.length,505400);assert.equal(sha(bytes),'8bad9322b3340bfb5cb26cb00f4752bf4c8e7d1b526bb07205f4af458eebed31');
const site=path.resolve(pwa),types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.wasm':'application/wasm'};
const server=createServer((req,res)=>{if(!['GET','HEAD'].includes(req.method))return res.writeHead(405).end();let n;try{n=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{return res.writeHead(400).end();}if(n.split('/').some(x=>x.startsWith('.')))return res.writeHead(404).end();const f=path.resolve(site,'.'+(n==='/'?'/index.html':n));if(!f.startsWith(site+path.sep))return res.writeHead(403).end();try{const b=fs.readFileSync(f);res.writeHead(200,{'Content-Type':types[path.extname(f)]||'application/octet-stream','Cache-Control':'no-store'});res.end(req.method==='HEAD'?undefined:b);}catch{res.writeHead(404).end();}});
let browser;
try{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}`;
 browser=await playwright.launch({args:chromium.args,executablePath:process.env.CHROMIUM_PATH||await chromium.executablePath(),headless:true});
 const contexts=[];for(let i=0;i<4;i++)contexts.push(await browser.newContext({serviceWorkers:'block'}));
 await contexts[1].addInitScript(()=>Object.defineProperty(navigator,'locks',{value:undefined,configurable:true}));
 const pages=[];for(const c of contexts)pages.push(await c.newPage());const pageB=await contexts[2].newPage();
 const errors=[];for(const page of [...pages,pageB]){page.on('pageerror',e=>errors.push(e.message));await page.route('**/*',r=>r.request().url().startsWith(base+'/')?r.continue():r.abort());await page.goto(base+'/',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.Trk?.titleFont&&document.fonts,{timeout:30000});}
 const [sameLock,noLock,twoA,storagePage]=pages;assert.equal(await sameLock.evaluate(()=>!!navigator.locks),true);assert.equal(await noLock.evaluate(()=>!!navigator.locks),false);
 async function install(page){return page.evaluate(async b64=>{const arr=Uint8Array.from(atob(b64),c=>c.charCodeAt(0));return window.Trk.titleFont.importFile('galmuri','galmuri11',new File([arr],'Galmuri11.woff2'));},bytes.toString('base64'));}
 async function start(page){return page.evaluate(async()=>{let release,mark;const gate=new Promise(r=>{release=r;}),reached=new Promise(r=>{mark=r;}),old=FontFace.prototype.load;FontFace.prototype.load=function(){const p=old.call(this);if(this.family==='TrkTitleGalmuri'){mark();return p.then(()=>gate).then(()=>this);}return p;};window.__release=release;window.__restore=()=>{FontFace.prototype.load=old;};window.__choose=window.Trk.titleFont.choose('galmuri');await reached;});}
 async function remove(page){await page.evaluate(()=>{window.__removeDone=false;window.__remove=window.Trk.titleFont.removeCandidate('galmuri').then(r=>{window.__removeDone=true;return r;});});}
 async function unlock(page){await page.evaluate(()=>window.__release());}
 async function finish(page){return page.evaluate(async()=>{const choice=await window.__choose,api=window.Trk.titleFont;window.__restore();return {choice,selected:api.readChoice(),status:api.state().status,on:document.body.classList.contains(api.CLASS_ON)};});}
 const results={};
 // Same-tab with real Web Locks: delete waits until cancelled preparation exits.
 assert.equal((await install(sameLock)).ok,true);await start(sameLock);await remove(sameLock);
 await sameLock.waitForFunction(async()=>{const q=await navigator.locks.query();return q.pending.some(l=>l.name==='trk-title-font');},{timeout:5000});
 assert.equal(await sameLock.evaluate(()=>window.__removeDone),false);await unlock(sameLock);const sameChoice=await finish(sameLock);const sameDelete=await sameLock.evaluate(()=>window.__remove);
 assert.equal(sameChoice.choice.reason,'superseded');assert.equal(sameDelete.ok,true);assert.equal(await sameLock.evaluate(async()=>{const a=window.Trk.titleFont;return (await a.inventory(a.CANDIDATES.find(c=>c.id==='galmuri'))).galmuri11.state;}),'absent');
 assert.equal(await sameLock.evaluate(()=>window.Trk.titleFont.readChoice()),'');results.sameTabLocked={choose:sameChoice.choice,remove:sameDelete};
 // Select followed by off in the same tab: with locks the off request queues.
 assert.equal((await install(sameLock)).ok,true);await start(sameLock);await sameLock.evaluate(()=>{window.__off=window.Trk.titleFont.choose('');});
 await sameLock.waitForFunction(async()=>{const q=await navigator.locks.query();return q.pending.some(l=>l.name==='trk-title-font');},{timeout:5000});await unlock(sameLock);const offChoice=await finish(sameLock),offResult=await sameLock.evaluate(()=>window.__off);assert.equal(offChoice.choice.reason,'superseded');assert.equal(offResult.ok,true);assert.equal(await sameLock.evaluate(()=>window.Trk.titleFont.readChoice()),'');assert.equal(await sameLock.evaluate(()=>window.Trk.titleFont.state().status),'off');results.sameTabOffLocked={choose:offChoice.choice,off:offResult};
 // Same-tab fallback without locks: delete completes first; stale selection is still cancelled.
 assert.equal((await install(noLock)).ok,true);await start(noLock);await remove(noLock);const fallbackDelete=await noLock.evaluate(()=>window.__remove);assert.equal(fallbackDelete.ok,true);await unlock(noLock);const fallbackChoice=await finish(noLock);assert.equal(fallbackChoice.choice.reason,'superseded');assert.equal(fallbackChoice.selected,'');assert.equal(fallbackChoice.on,false);results.sameTabNoLocks={choose:fallbackChoice.choice,remove:fallbackDelete};
 assert.equal((await install(noLock)).ok,true);await start(noLock);const fallbackOff=await noLock.evaluate(()=>window.Trk.titleFont.choose(''));assert.equal(fallbackOff.ok,true);await unlock(noLock);const fallbackOffChoice=await finish(noLock);assert.equal(fallbackOffChoice.choice.reason,'superseded');assert.equal(fallbackOffChoice.selected,'');assert.equal(fallbackOffChoice.on,false);results.sameTabOffNoLocks={choose:fallbackOffChoice.choice,off:fallbackOff};
 // Two tabs, one context/origin, real lock: second tab waits; shared state converges after delete.
 assert.equal((await install(twoA)).ok,true);await start(twoA);await remove(pageB);
 await twoA.waitForFunction(async()=>{const q=await navigator.locks.query();return q.pending.some(l=>l.name==='trk-title-font');},{timeout:5000});
 assert.equal(await pageB.evaluate(()=>window.__removeDone),false);await unlock(twoA);const tabA=await finish(twoA);const tabBdel=await pageB.evaluate(()=>window.__remove);assert.equal(tabA.choice.ok,true);assert.equal(tabBdel.ok,true);
 await twoA.waitForFunction(()=>window.Trk.titleFont.readChoice()===''&&window.Trk.titleFont.state().status==='off'&&!document.body.classList.contains(window.Trk.titleFont.CLASS_ON),{timeout:10000});
 assert.equal(await pageB.evaluate(()=>window.Trk.titleFont.readChoice()),'');assert.equal(await pageB.evaluate(async()=>{const a=window.Trk.titleFont;return (await a.inventory(a.CANDIDATES.find(c=>c.id==='galmuri'))).galmuri11.state;}),'absent');await twoA.reload({waitUntil:'domcontentloaded'});await twoA.waitForFunction(()=>window.Trk?.titleFont?.state().status==='off');assert.equal(await twoA.evaluate(()=>window.Trk.titleFont.readChoice()),'');results.twoTabLocked={choose:tabA.choice,remove:tabBdel,final:'both off; file absent; A reload off'};
 const badResults=await storagePage.evaluate(()=>{const a=window.Trk.titleFont,out=[];for(const raw of ['{"old-work":','[]','42','null']){localStorage.setItem(a.WORKS_KEY,raw);const result=a.setWorkFont('trk-re-modern-new','galmuri');out.push({raw,result,after:localStorage.getItem(a.WORKS_KEY)});}localStorage.removeItem(a.WORKS_KEY);out.push({empty:a.setWorkFont('trk-re-modern-new','galmuri')});return out;});
 for(const r of badResults.slice(0,-1)){assert.equal(r.result,false);assert.equal(r.after,r.raw);}assert.equal(badResults.at(-1).empty,true);results.invalidSettings='rejected, original preserved; empty allowed';
 assert.deepEqual(errors,[]);console.log(JSON.stringify({browser:browser.version(),pwa:'a49a8e06f548600b5f2555a1d73c4c8dc8b92d73',fontSha:sha(bytes),results,scope:'API-level, native FontFace with injected delay, actual IndexedDB and Web Locks, clean contexts; network and SW blocked; no device, AT, offline update or multi-tab no-lock guarantee'},null,2));
}finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
