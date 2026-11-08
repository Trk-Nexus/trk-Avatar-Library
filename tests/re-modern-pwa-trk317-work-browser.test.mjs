// SPDX-License-Identifier: GPL-3.0-or-later
// Fixed branch + actual consultation archive. Fresh Chromium profile and local server only.
// TRK_PWA_316=/path/to/pwa-f8690d1 TRK_PWA_317=/path/to/pwa-3ade13f TRK_WORK_PACK=/path/to/consultation.stpack node tests/re-modern-pwa-trk317-work-browser.test.mjs
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {createServer} from 'node:http';
import {chromium as playwright} from 'playwright-core';
import chromium from '@sparticuz/chromium';
import {openZip,loadZipIO} from '../tools/lib/zip.mjs';
const pwa=process.env.TRK_PWA_317,old=process.env.TRK_PWA_316,pack=process.env.TRK_WORK_PACK;assert(pwa&&old&&pack,'TRK_PWA_316, TRK_PWA_317 and TRK_WORK_PACK required');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
assert.equal(sha(fs.readFileSync(path.join(old,'js/remodern-work.js'))),'a5b0e07b531f91ab812db81686d52a3d41b6512fafcdefb17761a2ac66352bd5');
assert.equal(sha(fs.readFileSync(path.join(pwa,'js/remodern-work.js'))),'6db59bcb17b39bd6de1c84145ee2862ff69b17c77f560ae56172357435f4d86d');
assert.equal(sha(fs.readFileSync(path.join(pwa,'js/remodern-ui.js'))),'c910b1e4448e19bea8e14d7a6d95bdcfce734cadf89389b1a94e3cd3117f04c0');
const bytes=fs.readFileSync(pack),hash=sha(bytes);assert.equal(hash,'628bafef9c2b71e3246416d7770622fc3df0f4dca54a4960322e6848fea56ddd');
const zip=await openZip(bytes,pwa);assert.deepEqual([...zip.names()].sort(),['LICENSE.txt','README.txt','pack.json']);const manifest=JSON.parse(await zip.readText('pack.json'));assert.equal(manifest.remodern.id,'trk-re-modern-pixel-console');
// A separate synthetic copy illustrates the compatibility break. The original archive is never modified.
const renamed=[];for(const name of zip.names())renamed.push({name:name==='LICENSE.txt'?'LICENSE-OFL.txt':name,blob:new Blob([await zip.read(name)])});
const modified=Buffer.from(await (await loadZipIO(pwa).zipWrite(renamed)).arrayBuffer());
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'trk317-work-review-'));let server,browser;
try{
 const bad=path.join(temp,'synthetic-license-name.stpack');fs.writeFileSync(bad,modified);let site=path.resolve(old);
 const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.wasm':'application/wasm'};
 server=createServer((req,res)=>{if(!['GET','HEAD'].includes(req.method))return res.writeHead(405).end();let n;try{n=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{return res.writeHead(400).end();}if(n.split('/').some(x=>x.startsWith('.')))return res.writeHead(404).end();const f=path.resolve(site,'.'+(n==='/'?'/index.html':n));if(!f.startsWith(site+path.sep))return res.writeHead(403).end();try{const b=fs.readFileSync(f);res.writeHead(200,{'Content-Type':types[path.extname(f)]||'application/octet-stream','Cache-Control':'no-store'});res.end(req.method==='HEAD'?undefined:b);}catch{res.writeHead(404).end();}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}`;
 browser=await playwright.launch({args:chromium.args,executablePath:process.env.CHROMIUM_PATH||await chromium.executablePath(),headless:true});const page=await browser.newPage({serviceWorkers:'block'});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.route('**/*',r=>r.request().url().startsWith(base+'/')?r.continue():r.abort());
 await page.goto(base+'/',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.Trk?.core?.settings&&window.TrkRemodernUi,{timeout:30000});
 if(await page.locator('#welcomeCloseBtn').isVisible())await page.locator('#welcomeCloseBtn').click();await page.click('#openSettingsBtn');
 // A synthetic legacy archive with a formerly accepted license name is imported in 316.
 await page.locator('#remodernWorkFile').setInputFiles({name:'synthetic-legacy.stpack',mimeType:'application/zip',buffer:modified});
 await page.waitForFunction(()=>window.Trk.core.settings.remodernWorks.some(w=>w.id==='trk-re-modern-pixel-console'),{timeout:15000});
 const legacy=await page.evaluate(()=>JSON.stringify(window.Trk.core.settings.remodernWorks));
 // Update on the same origin without SW or real user data and confirm already-saved metadata survives.
 site=path.resolve(pwa);await page.reload({waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.Trk?.core?.settings&&window.TrkRemodernUi,{timeout:30000});
 assert.equal(await page.evaluate(()=>JSON.stringify(window.Trk.core.settings.remodernWorks)),legacy);
 await page.click('#openSettingsBtn');
 await page.locator('#remodernWorkFile').setInputFiles({name:'consultation.stpack',mimeType:'application/zip',buffer:bytes});await page.waitForFunction(h=>document.querySelector('#remodernWorkStatus')?.textContent.includes(h),hash.slice(0,12),{timeout:15000});
 assert.match(await page.locator('#remodernWorkStatus').innerText(),/未確認|unverified/i);
 const before=await page.evaluate(()=>JSON.stringify(window.Trk.core.settings.remodernWorks));assert(before.includes('trk-re-modern-pixel-console'));
 await page.locator('#remodernWorkFile').setInputFiles({name:'synthetic-license-name.stpack',mimeType:'application/zip',buffer:modified});
 await page.waitForFunction(()=>document.querySelector('#remodernWorkStatus')?.textContent===window.tr('remodernWorkBad'),{timeout:15000});
 const after=await page.evaluate(()=>JSON.stringify(window.Trk.core.settings.remodernWorks));assert.equal(after,before);assert.deepEqual(errors,[]);
 console.log(JSON.stringify({browser:browser.version(),pwa:'3ade13fba6d3b19a8ef42c16b18362c4c8b26c29',archiveSha256:hash,knownConsultationImport:'accepted-unverified',syntheticLegacyAlreadySaved:'preserved-on-reload',syntheticLicenseOflName:'rejected-on-reimport',savedWorksUnchangedAfterRejection:true,scope:'fresh isolated profile, local server, service worker blocked; no legacy unknown archives, devices, accessibility or security audit'},null,2));
}finally{if(browser)await browser.close();if(server)await new Promise(r=>server.close(r));fs.rmSync(temp,{recursive:true,force:true});}
