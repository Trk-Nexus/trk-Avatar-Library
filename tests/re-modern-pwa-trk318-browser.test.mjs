// SPDX-License-Identifier: GPL-3.0-or-later
// Fixed PWA commit, real pinned Galmuri file, native FontFace with injected load delay.
// Fresh browser context, local server, service worker + external network blocked.
// TRK_PWA_318=/path/to/pwa TRK_GALMURI_FILE=/path/to/Galmuri11.woff2 node tests/re-modern-pwa-trk318-browser.test.mjs
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {createServer} from 'node:http';
import {chromium as playwright} from 'playwright-core';
import chromium from '@sparticuz/chromium';
const pwa=process.env.TRK_PWA_318,font=process.env.TRK_GALMURI_FILE;assert(pwa&&font,'TRK_PWA_318 and TRK_GALMURI_FILE required');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
assert.equal(sha(fs.readFileSync(path.join(pwa,'js/title-font.js'))),'cbfb61f44677bbcc75ca356e44d95048a0b6374fbc04bec1e8219084fa905ff2');
const bytes=fs.readFileSync(font);assert.equal(bytes.length,505400);assert.equal(sha(bytes),'8bad9322b3340bfb5cb26cb00f4752bf4c8e7d1b526bb07205f4af458eebed31');
const site=path.resolve(pwa),types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.wasm':'application/wasm'};
const server=createServer((req,res)=>{if(!['GET','HEAD'].includes(req.method))return res.writeHead(405).end();let n;try{n=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{return res.writeHead(400).end();}if(n.split('/').some(x=>x.startsWith('.')))return res.writeHead(404).end();const f=path.resolve(site,'.'+(n==='/'?'/index.html':n));if(!f.startsWith(site+path.sep))return res.writeHead(403).end();try{const b=fs.readFileSync(f);res.writeHead(200,{'Content-Type':types[path.extname(f)]||'application/octet-stream','Cache-Control':'no-store'});res.end(req.method==='HEAD'?undefined:b);}catch{res.writeHead(404).end();}});
let browser;
try{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}`;
 browser=await playwright.launch({args:chromium.args,executablePath:process.env.CHROMIUM_PATH||await chromium.executablePath(),headless:true});const results={};
 const contexts=[await browser.newContext({serviceWorkers:'block'}),await browser.newContext({serviceWorkers:'block'})];
 const pages=[await contexts[0].newPage(),await contexts[1].newPage()];
 for(const [i,operation] of ['off','remove'].entries()){
  const page=pages[i];const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.route('**/*',r=>r.request().url().startsWith(base+'/')?r.continue():r.abort());
  await page.goto(base+'/',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.Trk?.titleFont&&document.fonts,{timeout:30000});
  const r=await page.evaluate(async({b64,operation})=>{
   const api=window.Trk.titleFont,binary=atob(b64),arr=Uint8Array.from(binary,c=>c.charCodeAt(0));
   const installed=await api.importFile('galmuri','galmuri11',new File([arr],'Galmuri11.woff2',{type:'font/woff2'}));if(!installed.ok)throw Error('import '+JSON.stringify(installed));
   let unlock,mark;const gate=new Promise(r=>{unlock=r;}),reached=new Promise(r=>{mark=r;}),original=FontFace.prototype.load;
   FontFace.prototype.load=function(){const native=original.call(this);if(this.family==='TrkTitleGalmuri'){mark();return native.then(()=>gate).then(()=>this);}return native;};
   try{
    const pending=api.choose('galmuri');await reached;
    const newer=operation==='off'?await api.choose(''):await api.removeCandidate('galmuri');
    const afterNew={choice:api.readChoice(),on:document.body.classList.contains(api.CLASS_ON),inventory:(await api.inventory(api.CANDIDATES.find(c=>c.id==='galmuri'))).galmuri11.state};
    unlock();const old=await pending;
    const final={choice:api.readChoice(),on:document.body.classList.contains(api.CLASS_ON),inventory:(await api.inventory(api.CANDIDATES.find(c=>c.id==='galmuri'))).galmuri11.state,status:api.state().status};
    let afterRefresh=null;if(operation==='remove'){await api.refresh();afterRefresh={choice:api.readChoice(),on:document.body.classList.contains(api.CLASS_ON),status:api.state().status};}
    return {installed,newer,afterNew,old,final,afterRefresh};
   }finally{FontFace.prototype.load=original;unlock();}
  },{b64:bytes.toString('base64'),operation});
  assert.equal(r.installed.ok,true);assert.equal(r.newer.ok,true);assert.equal(r.afterNew.choice,'');assert.equal(r.afterNew.on,false);
  if(operation==='off'){assert.equal(r.old.ok,false);assert.equal(r.old.reason,'superseded');assert.equal(r.final.choice,'');assert.equal(r.final.on,false);}
  else{assert.equal(r.afterNew.inventory,'absent');assert.equal(r.old.ok,true);assert.equal(r.final.choice,'galmuri');assert.equal(r.final.on,true);assert.equal(r.final.status,'active');assert.equal(r.final.inventory,'absent');assert.equal(r.afterRefresh.choice,'galmuri');assert.equal(r.afterRefresh.on,false);assert.equal(r.afterRefresh.status,'missing');}
  assert.deepEqual(errors,[]);results[operation]=r;
 }
 console.log(JSON.stringify({browser:browser.version(),pwa:'285a3577df5b76e9936f74cb31162afc796b04b8',fontSha:sha(bytes),results,scope:'Native FontFace with injected load delay and real pinned Galmuri, real IndexedDB, fresh contexts, SW/external requests blocked; one browser only, not race frequency or AT'},null,2));
}finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
