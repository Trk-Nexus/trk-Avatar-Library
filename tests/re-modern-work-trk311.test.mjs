// SPDX-License-Identifier: GPL-3.0-or-later
// Pixel-console draft through trk311 merged main: actual import/apply UI, dev badge, save failure, and restoration.
// TRK_PWA_M3=/clean/trk305 TRK_PWA=/clean/trk311 node tests/re-modern-work-trk311.test.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {createServer} from 'node:http';
import {spawnSync} from 'node:child_process';
import {chromium as playwright} from 'playwright-core';
import chromium from '@sparticuz/chromium';
import {buildDraft} from '../tools/build-re-modern-draft.mjs';

const ref='d76489872b81deddab0bce30ee09de1e99ebe080';
const pwa=process.env.TRK_PWA&&path.resolve(process.env.TRK_PWA);
assert(pwa,'TRK_PWA must be a clean checkout of '+ref);
for(const [args,expected] of [[['rev-parse','HEAD'],ref],[['status','--porcelain'],'']]) {
  const r=spawnSync('git',args,{cwd:pwa,encoding:'utf8'});
  assert.equal(r.status,0,r.stderr);assert.equal(r.stdout.trim(),expected,'PWA checkout must be clean and fixed');
}
assert.match(fs.readFileSync(path.join(pwa,'index.html'),'utf8'), /name="trk-build" content="trk311"/);
assert.match(fs.readFileSync(path.join(pwa,'sw.js'),'utf8'), /const CACHE = "trk-v2026\.11\.04-trk311";/);
const built=await buildDraft(process.env.TRK_PWA_M3), id=built.manifest.remodern.id;
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'avatar-trk311-'));
let server,browser;
try {
  const file=path.join(temp,'pixel-console.DRAFT.stpack');fs.writeFileSync(file,built.bytes);
  const site=path.join(temp,'pwa');
  fs.cpSync(pwa,site,{recursive:true,filter:s=>!['.git','node_modules'].includes(path.basename(s))});
  const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.wasm':'application/wasm'};
  server=createServer((req,res)=>{
    if(!['GET','HEAD'].includes(req.method))return res.writeHead(405).end();
    let name;try{name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{return res.writeHead(400).end();}
    if(name.split('/').some(s=>s.startsWith('.')))return res.writeHead(404).end();
    const f=path.resolve(site,'.'+(name==='/'?'/index.html':name));
    if(!f.startsWith(site+path.sep))return res.writeHead(404).end();
    try{const b=fs.readFileSync(f);res.writeHead(200,{'Content-Type':types[path.extname(f)]||'application/octet-stream'});res.end(req.method==='HEAD'?undefined:b);}catch{res.writeHead(404).end();}
  });
  await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}`;
  browser=await playwright.launch({args:chromium.args,executablePath:process.env.CHROMIUM_PATH||await chromium.executablePath(),headless:true});
  const page=await browser.newPage({viewport:{width:1280,height:900},serviceWorkers:'block'});
  const errors=[],warnings=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='warning')warnings.push(m.text());});
  await page.route('**/*',r=>r.request().url().startsWith(base+'/')?r.continue():r.abort());
  await page.goto(base+'/',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.Trk?.core?.settings && window.TrkReModernDev && window.TrkRemodernUi,{timeout:30000});
  const snap=()=>page.evaluate(()=>{const s=window.Trk.core.settings,h=document.querySelector('.brand h1');return {dev:window.TrkReModernDev.isUnverifiedPaint(),text:h.style.color,accent:h.querySelector('span').style.color,skin:s.skin,notes:structuredClone(s.notes),state:structuredClone(s.remodern)};});
  const initial=await snap();assert.equal(initial.dev,false);
  if(await page.locator('#welcomeCloseBtn').isVisible())await page.locator('#welcomeCloseBtn').click();
  await page.click('#openSettingsBtn');
  await page.locator('#remodernWorkFile').setInputFiles(file);
  await page.waitForFunction(hash=>document.querySelector('#remodernWorkStatus')?.textContent.includes(hash),built.sha256.slice(0,12),{timeout:15000});
  assert.match(await page.locator('#remodernWorkStatus').innerText(),/未確認|unverified/i);
  await page.locator('#remodern-common-mode').selectOption('own');
  await page.locator('#remodern-common-work').selectOption(id);
  assert.match(await page.locator('#remodern-common-work option:checked').innerText(),/未確認|unverified/i);
  await page.locator('#remodern-common-apply').click();
  const off=await snap();assert.equal(off.state.common.work,id);assert.equal(off.text,initial.text);assert.equal(off.accent,initial.accent);
  // First attempt to enable: simulate a save failure without changing storage.
  const warningsBeforeFirst=warnings.length;
  const failedFirst=await page.evaluate(()=>{const save=Storage.prototype.setItem;Storage.prototype.setItem=()=>{throw new DOMException('simulated quota','QuotaExceededError');};try{return TrkReModernDev.setUnverifiedPaint(true);}finally{Storage.prototype.setItem=save;}});
  assert.equal(failedFirst,false);const firstAfter=await snap();assert.equal(firstAfter.dev,false);assert.equal(firstAfter.text,off.text);assert.equal(firstAfter.accent,off.accent);assert.deepEqual(firstAfter.state,off.state);
  const firstFailureConsole=warnings.slice(warningsBeforeFirst).some(x=>x.includes('保存できませんでした'));
  assert.equal(firstFailureConsole,true,'first failed ON must warn');
  assert.equal(await page.locator('#remodernStatus').isVisible(),true);
  assert.match(await page.locator('#remodernStatus').innerText(),/保存できなかった|Could not save/);
  await page.evaluate(()=>window.TrkReModernDev.setUnverifiedPaint(true));
  const on=await snap();assert.equal(on.dev,true);assert.equal(on.text,'rgb(236, 246, 238)');assert.equal(on.accent,'rgb(86, 217, 148)');
  assert.equal(await page.locator('#remodernDevBadge').isVisible(),true);
  assert.match(await page.locator('#remodernDevBadge').innerText(),/開発用：未確認作品の色の試験が有効です|Developer test: unverified work colors are ON/);
  assert.equal(on.skin,initial.skin);assert.deepEqual(on.notes,initial.notes);
  // Current trk311 persists the developer toggle, including across reload.
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(id=>window.TrkReModernDev && window.Trk?.core?.settings?.remodern?.common?.work===id,id,{timeout:30000});
  const reload=await snap();assert.equal(reload.dev,true);assert.equal(reload.text,on.text);assert.equal(reload.accent,on.accent);assert.equal(await page.locator('#remodernDevBadge').isVisible(),true);
  const transition=await page.evaluate(({id,oldSkin})=>{
    const h=document.querySelector('.brand h1'),P=window.TrkReModernPaint;
    const choice=Object.entries(window.Trk.data.SKINS).find(([,s])=>s.ui?.['--ui-bg']==='#ffffff'&&!s.locked);
    if(!choice)return null;
    window.Trk.core.applySkin(choice[0]);
    const bg=P.effectiveBg(h),fresh=P.titlePaint(window.TrkReModernWorks[id],bg);
    const result={skin:choice[0],bg,fresh,text:h.style.color,accent:h.querySelector('span').style.color};
    window.Trk.core.applySkin(oldSkin);
    return result;
  },{id,oldSkin:initial.skin});
  assert(transition);assert.equal(transition.fresh.text,null);assert.equal(transition.fresh.accent,null);
  assert.equal(transition.text,'');assert.equal(transition.accent,'');
  const restored=await snap();assert.equal(restored.text,on.text);assert.equal(restored.accent,on.accent);
  // A failed OFF leaves paint ON and reports the failure in the visible badge.
  const failedOff=await page.evaluate(()=>{const save=Storage.prototype.setItem;Storage.prototype.setItem=()=>{throw new DOMException('simulated quota','QuotaExceededError');};try{return TrkReModernDev.setUnverifiedPaint(false);}finally{Storage.prototype.setItem=save;}});
  assert.equal(failedOff,true);assert.equal((await snap()).text,on.text);
  assert.match(await page.locator('#remodernDevBadge [data-dev-note]').innerText(),/保存できなかった|Could not save/);
  await page.locator('#remodernDevBadge button').click();
  assert.equal(await page.locator('#remodernDevBadge').isVisible(),false);
  // The badge exists but is hidden. Clear the status first to prove the next failure updates it.
  if(!await page.locator('#remodernStatus').isVisible()) await page.click('#openSettingsBtn');
  assert.equal(await page.locator('#remodernStatus').isVisible(),true);
  await page.locator('#remodernStatus').evaluate(node=>{node.textContent='sentinel';});
  const warningsBeforeAgain=warnings.length;
  const failedAgain=await page.evaluate(()=>{const save=Storage.prototype.setItem;Storage.prototype.setItem=()=>{throw new DOMException('simulated quota','QuotaExceededError');};try{return TrkReModernDev.setUnverifiedPaint(true);}finally{Storage.prototype.setItem=save;}});
  assert.equal(failedAgain,false);assert.equal(await page.locator('#remodernDevBadge').isVisible(),false);
  const hiddenBadgeFailureConsole=warnings.slice(warningsBeforeAgain).some(x=>x.includes('保存できませんでした'));
  assert.equal(hiddenBadgeFailureConsole,true,'failed ON after OFF must warn');
  assert.equal(await page.locator('#remodernStatus').isVisible(),true);
  assert.match(await page.locator('#remodernStatus').innerText(),/保存できなかった|Could not save/);
  const disabled=await snap();assert.deepEqual(disabled.state,off.state);assert.equal(disabled.dev,false);assert.equal(disabled.text,initial.text);assert.equal(disabled.accent,initial.accent);assert.deepEqual(disabled.notes,initial.notes);
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.TrkReModernDev && window.Trk?.core?.settings,{timeout:30000});
  const after=await snap();assert.equal(after.dev,false);assert.equal(after.text,initial.text);assert.equal(after.accent,initial.accent);assert.deepEqual(after.notes,initial.notes);
  assert.deepEqual(errors,[]);
  console.log(JSON.stringify({pwa:ref,browser:browser.version(),fileSha256:built.sha256,unverifiedImportViaUi:true,applyOffDoesNotPaint:true,explicitDevOnPaints:true,onPersistsReload:true,lightSkinReevaluated:true,badgeOn:true,failedOffRollsBackWithVisibleNotice:true,devOffButtonRestores:true,firstFailureConsole,firstFailureStatusVisible:true,hiddenBadgeFailureConsole,hiddenBadgeFailureStatusVisible:true,offPersistsReload:true,notesUnchanged:true,transition,scope:'Isolated PWA copy; empty registry; headless Chromium; service worker and external requests blocked. Study/base paint, registry failure paths, backups, real devices and assistive tech are not covered.'},null,2));
} finally {if(browser)await browser.close();if(server)await new Promise(r=>server.close(r));fs.rmSync(temp,{recursive:true,force:true});}
