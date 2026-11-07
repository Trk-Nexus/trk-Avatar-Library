// SPDX-License-Identifier: GPL-3.0-or-later
// Fixed PWA, empty profile, isolated browser. Never operate on a real user profile.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {createServer} from 'node:http';
import {chromium as playwright} from 'playwright-core';
import chromium from '@sparticuz/chromium';
import {buildHandoff,PWA_REF} from '../tools/build-re-modern-pwa-handoff.mjs';
import {openZip} from '../tools/lib/zip.mjs';
const pwa=process.env.TRK_PWA;assert(pwa,'TRK_PWA required');
const built=await buildHandoff(pwa),again=await buildHandoff(pwa);assert.deepEqual(built.bytes,again.bytes,'deterministic archive');
const zip=await openZip(built.bytes,pwa);assert.deepEqual([...zip.names()].sort(),['LICENSE.txt','README.txt','pack.json']);
assert.equal(built.manifest.remodern.id,'trk-re-modern-pixel-console');assert.deepEqual(built.manifest.remodern.regions,['common']);assert(!('heading' in built.manifest.remodern));assert(!('fonts' in built.manifest));
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'pixel-handoff-test-'));let server,browser;
try{
 const file=path.join(temp,'consultation.stpack');fs.writeFileSync(file,built.bytes);const site=path.join(temp,'pwa');fs.cpSync(pwa,site,{recursive:true,filter:s=>!['.git','node_modules'].includes(path.basename(s))});
 const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.wasm':'application/wasm'};
 server=createServer((req,res)=>{if(!['GET','HEAD'].includes(req.method))return res.writeHead(405).end();let n;try{n=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{return res.writeHead(400).end();}if(n.split('/').some(x=>x.startsWith('.')))return res.writeHead(404).end();const f=path.resolve(site,'.'+(n==='/'?'/index.html':n));if(!f.startsWith(site+path.sep))return res.writeHead(403).end();try{const b=fs.readFileSync(f);res.writeHead(200,{'Content-Type':types[path.extname(f)]||'application/octet-stream'});res.end(req.method==='HEAD'?undefined:b);}catch{res.writeHead(404).end();}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}`;
 browser=await playwright.launch({args:chromium.args,executablePath:process.env.CHROMIUM_PATH||await chromium.executablePath(),headless:true});const page=await browser.newPage({viewport:{width:1280,height:900},serviceWorkers:'block'});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.route('**/*',r=>r.request().url().startsWith(base+'/')?r.continue():r.abort());
 await page.goto(base+'/',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.Trk?.core?.settings&&window.TrkReModernDev&&window.TrkRemodernUi,{timeout:30000});
 const snap=()=>page.evaluate(()=>{const s=window.Trk.core.settings,h=document.querySelector('.brand h1');return {dev:window.TrkReModernDev.isUnverifiedPaint(),text:h.style.color,accent:h.querySelector('span').style.color,skin:s.skin,notes:structuredClone(s.notes),state:structuredClone(s.remodern),font:getComputedStyle(h).fontFamily};});
 const initial=await snap();assert.equal(initial.dev,false);if(await page.locator('#welcomeCloseBtn').isVisible())await page.locator('#welcomeCloseBtn').click();await page.click('#openSettingsBtn');await page.locator('#remodernWorkFile').setInputFiles(file);
 await page.waitForFunction(hash=>document.querySelector('#remodernWorkStatus')?.textContent.includes(hash),built.sha256.slice(0,12),{timeout:15000});assert.match(await page.locator('#remodernWorkStatus').innerText(),/未確認|unverified/i);
 await page.locator('#remodern-common-mode').selectOption('own');await page.locator('#remodern-common-work').selectOption(built.manifest.remodern.id);assert.match(await page.locator('#remodern-common-work option:checked').innerText(),/未確認|unverified/i);await page.locator('#remodern-common-apply').click();
 const off=await snap();assert.equal(off.state.common.work,built.manifest.remodern.id);assert.equal(off.text,initial.text);assert.equal(off.accent,initial.accent);
 await page.evaluate(()=>window.TrkReModernDev.setUnverifiedPaint(true));const on=await snap();assert.equal(on.dev,true);assert.equal(on.text,'rgb(236, 246, 238)');assert.equal(on.accent,'rgb(86, 217, 148)');assert.equal(on.skin,initial.skin);assert.deepEqual(on.notes,initial.notes);assert.equal(on.font,initial.font);assert(await page.locator('#remodernDevBadge').isVisible());
 await page.reload({waitUntil:'domcontentloaded'});await page.waitForFunction(id=>window.TrkReModernDev&&window.Trk?.core?.settings?.remodern?.common?.work===id,built.manifest.remodern.id,{timeout:30000});const reload=await snap();assert.equal(reload.dev,true);assert.equal(reload.text,on.text);assert.equal(reload.accent,on.accent);
 await page.locator('#remodernDevBadge button').click();const restored=await snap();assert.equal(restored.dev,false);assert.equal(restored.text,initial.text);assert.equal(restored.accent,initial.accent);assert.deepEqual(restored.notes,initial.notes);assert.equal(restored.font,initial.font);assert.deepEqual(errors,[]);
 console.log(JSON.stringify({pwa:PWA_REF,sha256:built.sha256,bytes:built.bytes.length,browser:browser.version(),deterministic:true,isolatedImport:true,unverifiedMarked:true,noPaintWithoutDev:true,devPaint:true,persistReload:true,devOffRestoresTitle:true,skinNotesFontUnchanged:true,scope:'Only common-title color experiment, empty profile and default background. No fonts, full skin, notes, library/base, real device, human, AT, legal or release approval.'},null,2));
}finally{if(browser)await browser.close();if(server)await new Promise(r=>server.close(r));fs.rmSync(temp,{recursive:true,force:true});}
