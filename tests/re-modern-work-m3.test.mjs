// SPDX-License-Identifier: GPL-3.0-or-later
// End-to-end compatibility test: unregistered draft → trk305 ZIP upload → common title.
// TRK_PWA=/path/to/clean-pinned-pwa node tests/re-modern-work-m3.test.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {createServer} from 'node:http';
import {chromium as playwright} from 'playwright-core';
import chromium from '@sparticuz/chromium';
import {buildDraft,PWA_REF} from '../tools/build-re-modern-draft.mjs';
import {openZip,readJsonEntry,loadZipIO} from '../tools/lib/zip.mjs';
const pwa=process.env.TRK_PWA&&path.resolve(process.env.TRK_PWA);
const built=await buildDraft(pwa), repeated=await buildDraft(pwa);
assert.deepEqual(built.bytes,repeated.bytes,'same inputs must produce identical bytes');
const zip=await openZip(built.bytes,pwa);
assert.deepEqual([...zip.names()].sort(),['LICENSE.txt','README.txt','pack.json']);
assert.deepEqual(await readJsonEntry(zip,'pack.json'),built.manifest);
assert.match(await zip.readText('README.txt'),/UNAPPROVED/);
assert.match(await zip.readText('LICENSE.txt'),/GNU GENERAL PUBLIC LICENSE/);
assert.deepEqual(built.manifest.remodern.regions,['common']);
assert.equal(built.manifest.remodern.heading,undefined,'no font is shipped or applied');
let dir,server,browser;
try {
  dir=fs.mkdtempSync(path.join(os.tmpdir(),'remodern-m3-test-'));
  const pack=path.join(dir,'test.DRAFT.stpack');fs.writeFileSync(pack,built.bytes);
  const invalid=await loadZipIO(pwa).zipWrite([{name:'pack.json',blob:new Blob(['not JSON'])}]);
  const bad=path.join(dir,'bad.stpack');fs.writeFileSync(bad,Buffer.from(await invalid.arrayBuffer()));
  const copy=path.join(dir,'pwa');fs.cpSync(pwa,copy,{recursive:true,filter:s=>!['.git','node_modules'].includes(path.basename(s))});
  const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.wasm':'application/wasm'};
  server=createServer((req,res)=>{let name;try{name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{return res.writeHead(400).end();}
    const file=path.resolve(copy,'.'+(name==='/'?'/index.html':name));if(!file.startsWith(copy+path.sep))return res.writeHead(403).end();
    try{const b=fs.readFileSync(file);res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'});res.end(b);}catch{res.writeHead(404).end();}});
  await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}`;
  browser=await playwright.launch({args:chromium.args,executablePath:process.env.CHROMIUM_PATH||await chromium.executablePath(),headless:true});
  const page=await browser.newPage({viewport:{width:1280,height:900},serviceWorkers:'block'});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',r=>r.request().url().startsWith(base+'/')?r.continue():r.abort());
  await page.goto(base+'/',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.Trk?.core?.settings && window.TrkRemodernUi && window.TrkReModernPaint,{timeout:30000});
  const snapshot=()=>page.evaluate(()=>{
    const h=document.querySelector('.brand h1'),s=window.Trk.core.settings;
    return {text:h.style.color,accent:h.querySelector('span').style.color,notes:structuredClone(s.notes),skin:s.skin,
      typography:structuredClone(s.typography),state:structuredClone(s.remodern)};
  });
  const before=await snapshot();
  assert.equal(before.state.common.mode,'keep');assert.equal(before.state.study.mode,'keep');assert.equal(before.state.base.mode,'keep');
  if(await page.locator('#welcomeCloseBtn').isVisible())await page.locator('#welcomeCloseBtn').click();
  await page.click('#openSettingsBtn');
  await page.locator('#remodernWorkFile').setInputFiles(pack);
  await page.waitForFunction(hash=>document.querySelector('#remodernWorkStatus')?.textContent.includes(hash),built.sha256.slice(0,12),{timeout:15000});
  const stored=await page.evaluate(id=>window.TrkReModernWorks[id],built.manifest.remodern.id);
  assert.equal(stored.id,built.manifest.remodern.id);assert.deepEqual(stored.regions,['common']);
  assert.equal(stored.colors.text,built.manifest.remodern.colors.text);assert.equal(stored.colors.accent,built.manifest.remodern.colors.accent);
  const loaded=await snapshot();assert.equal(loaded.text,before.text);assert.equal(loaded.accent,before.accent);assert.deepEqual(loaded.notes,before.notes);
  assert.equal(await page.locator('#remodern-study-work option').count(),1);assert.equal(await page.locator('#remodern-base-work option').count(),1);
  await page.locator('#remodern-common-mode').selectOption('own');
  await page.locator('#remodern-common-work').selectOption(built.manifest.remodern.id);
  const paint=await page.evaluate(id=>{const h=document.querySelector('.brand h1'),P=window.TrkReModernPaint,bg=P.effectiveBg(h);return {bg,expected:P.titlePaint(window.TrkReModernWorks[id],bg),text:h.style.color,accent:h.querySelector('span').style.color};},built.manifest.remodern.id);
  const normalized=hex=>hex?`rgb(${parseInt(hex.slice(1,3),16)}, ${parseInt(hex.slice(3,5),16)}, ${parseInt(hex.slice(5,7),16)})`:'';
  assert.equal(paint.text,normalized(paint.expected.text));assert.equal(paint.accent,normalized(paint.expected.accent));
  assert(paint.expected.text||paint.expected.accent,'test must actually apply at least one color');
  const applied=await snapshot();assert.deepEqual(applied.notes,before.notes);assert.equal(applied.skin,before.skin);assert.deepEqual(applied.typography,before.typography);
  assert.equal(applied.state.study.mode,'keep');assert.equal(applied.state.base.mode,'keep');
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(id=>window.Trk?.core?.settings?.remodern?.common?.work===id,built.manifest.remodern.id,{timeout:30000});
  await page.waitForFunction(()=>!!window.TrkRemodernUi);
  const reload=await snapshot();assert.equal(reload.text,paint.text);assert.equal(reload.accent,paint.accent);assert.deepEqual(reload.notes,before.notes);
  // Characterize a known pinned-PWA limitation, not a release pass: changing the
  // ordinary skin does not invoke the work paint calculation again.
  const skinTransition=await page.evaluate(({id,oldSkin})=>{
    const h=document.querySelector('.brand h1'),P=window.TrkReModernPaint;
    const choice=Object.entries(window.Trk.data.SKINS).find(([,s])=>s.ui?.['--ui-bg']==='#ffffff' && !s.locked);
    if(!choice)return null;
    window.Trk.core.applySkin(choice[0]);
    const bg=P.effectiveBg(h), desired=P.titlePaint(window.TrkReModernWorks[id],bg);
    const actual=h.style.color, ratio=P.ratio(P.hexToRgb('#ecf6ee'),bg);
    window.Trk.core.applySkin(oldSkin);
    return {skin:choice[0],bg,desired,actual,ratio};
  },{id:built.manifest.remodern.id,oldSkin:before.skin});
  assert(skinTransition,'light skin is required for this diagnostic');
  assert(skinTransition.ratio<4.5);
  assert.equal(skinTransition.desired.text,null,'a fresh contrast check would drop this color');
  assert.equal(skinTransition.actual,paint.text,'pinned PWA currently leaves the old inline color after a skin change');
  if(await page.locator('#welcomeCloseBtn').isVisible())await page.locator('#welcomeCloseBtn').click();
  if(!await page.locator('#settingsScreen').isVisible())await page.click('#openSettingsBtn');
  await page.locator('#remodernWorkFile').setInputFiles(bad);
  await page.waitForFunction(()=>document.querySelector('#remodernWorkStatus')?.textContent.includes('Could not read')||document.querySelector('#remodernWorkStatus')?.textContent.includes('読めませんでした'),null,{timeout:10000});
  assert.equal((await snapshot()).state.common.work,built.manifest.remodern.id,'bad import must not replace selection');
  await page.locator('#remodern-common-mode').selectOption('keep');
  const cleared=await snapshot();assert.equal(cleared.text,before.text);assert.equal(cleared.accent,before.accent);assert.deepEqual(cleared.notes,before.notes);
  assert.deepEqual(errors,[]);
  console.log(JSON.stringify({pwa:PWA_REF,browser:browser.version(),bytes:built.bytes.length,sha256:built.sha256,entries:zip.names(),uploadedViaFileInput:true,
    noAutomaticApply:true,commonTitleViaUi:true,reloadPersisted:true,badFileRejected:true,keepRestoresTitle:true,notesAndSkinUnchanged:true,paint,skinTransition,
    scope:'Unapproved draft, isolated PWA copy, headless Chromium, external requests and service worker blocked. Not a formal release or an accessibility/physical-device review.'},null,2));
}finally {if(browser)await browser.close();if(server)await new Promise(r=>server.close(r));if(dir)fs.rmSync(dir,{recursive:true,force:true});}
