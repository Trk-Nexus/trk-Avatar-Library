// SPDX-License-Identifier: GPL-3.0-or-later
// Draft-only PWA import/shelf test. Never writes to the original PWA or the registry.
// TRK_PWA=/path/to/clean-fixed-pwa node tests/re-modern-pixel-production-browser.test.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createServer} from 'node:http';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {chromium as playwright} from 'playwright-core';
import chromium from '@sparticuz/chromium';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const ref='f7b1272547f712d9a7d7a198404148457e936008';
const pwa=process.env.TRK_PWA && path.resolve(process.env.TRK_PWA);
const skin=JSON.parse(fs.readFileSync(path.join(root,'drafts/re-modern/pixel-console/skin.json')));
function run(cmd,args,cwd){const r=spawnSync(cmd,args,{cwd,encoding:'utf8',maxBuffer:10*1024*1024});if(r.error||r.status!==0)throw Error(`${cmd}: ${r.error||r.stderr||r.stdout}`);return r.stdout;}
assert(pwa,'TRK_PWA must point to a clean fixed PWA checkout');
assert.equal(run('git',['rev-parse','HEAD'],pwa).trim(),ref);
assert.equal(run('git',['status','--porcelain'],pwa).trim(),'','PWA checkout must be clean');
let temp,server,browser;
try {
  temp=fs.mkdtempSync(path.join(os.tmpdir(),'re-modern-production-'));
  const copy=path.join(temp,'pwa');
  fs.cpSync(pwa,copy,{recursive:true,filter:s=>!['.git','node_modules'].includes(path.basename(s))});
  const catalog=JSON.parse(fs.readFileSync(path.join(root,'catalog/skins.json')));
  const groups=JSON.parse(fs.readFileSync(path.join(root,'skin-volumes/volumes.json')));
  assert(!catalog.skins.some(s=>s.id===skin.id),'draft must not already be in the official catalog');
  assert(!groups.groups.some(g=>g.id==='trk-re-modern'),'test-only volume must not exist in the official groups');
  catalog.skins.push(skin);catalog.count=catalog.skins.length;
  groups.groups.push({id:'trk-re-modern',title:'制作案・一時テスト',ids:[skin.id]});
  const cat=path.join(temp,'catalog.json'),vol=path.join(temp,'volumes.json');
  fs.writeFileSync(cat,JSON.stringify(catalog));fs.writeFileSync(vol,JSON.stringify(groups));
  run(process.execPath,['tools/import-skin-catalog.mjs',cat,'--cat=','--exclude-cat=wizard','--only-new',`--volumes=${vol}`,'--kind=volumes','--out=js/skins-volumes.js'],copy);
  const contrast=JSON.parse(run(process.execPath,['tools/check-skin-contrast.mjs','js/skins-volumes.js','--json'],copy));
  assert.deepEqual(contrast.problems.filter(x=>x.id===skin.id),[]);
  assert.deepEqual(contrast.holdbackProblems.filter(x=>x.id===skin.id),[]);
  const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.wasm':'application/wasm'};
  server=createServer((req,res)=>{let name;try{name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{return res.writeHead(400).end();}
    const file=path.resolve(copy,'.'+(name==='/'?'/index.html':name));
    if(!file.startsWith(copy+path.sep))return res.writeHead(403).end();
    try{const data=fs.readFileSync(file);res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'});res.end(data);}catch{res.writeHead(404).end();}});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base=`http://127.0.0.1:${server.address().port}`;
  browser=await playwright.launch({args:chromium.args,executablePath:process.env.CHROMIUM_PATH||await chromium.executablePath(),headless:true});
  const page=await browser.newPage({viewport:{width:1280,height:900},serviceWorkers:'block'});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',route=>route.request().url().startsWith(base+'/')?route.continue():route.abort());
  await page.goto(base+'/',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(id=>window.Trk?.data?.SKINS?.[id] && window.Trk?.core?.settings && window.Trk?.custom,skin.id,{timeout:30000});
  const original=await page.evaluate(()=>({skin:window.Trk.core.settings.skin,notes:structuredClone(window.Trk.core.settings.notes)}));
  if(await page.locator('#welcomeCloseBtn').isVisible())await page.locator('#welcomeCloseBtn').click();
  await page.click('#openSettingsBtn');
  await page.locator('#skinVol').selectOption('trk-re-modern');
  await page.locator('#skinSearch').fill('ピクセル・コンソール');
  const card=page.locator(`#skinGrid button[data-skin="${skin.id}"]`);
  assert.equal(await card.count(),1,'draft must be discoverable by its actual shelf name in the test-only volume');
  await card.click();
  assert.equal(await page.evaluate(()=>window.Trk.core.settings.skin),skin.id);
  assert.deepEqual(await page.evaluate(()=>window.Trk.core.settings.notes),original.notes,'selecting the skin must not change shared notes');
  const computed=await page.evaluate(()=>{
    const css=getComputedStyle(document.documentElement);
    return {bg:css.getPropertyValue('--ui-bg').trim(),text:css.getPropertyValue('--ui-text').trim(),font:css.getPropertyValue('--font').trim(),title:css.getPropertyValue('--font-title').trim()};
  });
  assert.equal(computed.bg,skin.colors.bg);assert.equal(computed.text,skin.colors.text);
  assert.match(computed.font,/system-ui/);assert.match(computed.title,/system-ui/);
  // Existing optional PWA pairing is independent of this skin; it does not install fonts.
  const previousPairing=await page.locator('#typoPairing').inputValue();
  const loadedBefore=await page.evaluate(()=>[...document.fonts].filter(f=>f.family==='TrkDotGothic').length);
  await page.locator('#typoPairing').selectOption('denshi');
  const pairing=await page.evaluate(()=>({id:window.Trk.core.settings.typography?.pairing,display:getComputedStyle(document.documentElement).getPropertyValue('--trk-typo-display').trim(),loaded:[...document.fonts].filter(f=>f.family==='TrkDotGothic').length}));
  assert.equal(pairing.id,'denshi');assert.match(pairing.display,/TrkDotGothic/);
  assert.equal(pairing.loaded,loadedBefore,'selecting a pairing is not a font installation');
  await page.locator('#typoPairing').selectOption(previousPairing);
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(id=>window.Trk?.core?.settings?.skin===id,skin.id,{timeout:30000});
  assert.deepEqual(await page.evaluate(()=>window.Trk.core.settings.notes),original.notes);
  // The real shelf is used for both selection and return; all-volumes includes the original skin.
  if(await page.locator('#welcomeCloseBtn').isVisible())await page.locator('#welcomeCloseBtn').click();
  if(!await page.locator('#settingsScreen').isVisible())await page.click('#openSettingsBtn');
  await page.locator('#skinVol').selectOption('all');
  await page.locator('#skinSearch').fill(original.skin);
  const previous=page.locator(`#skinGrid button[data-skin="${original.skin}"]`);
  assert.equal(await previous.count(),1,'previous skin must be available to return to');
  await previous.click();
  assert.equal(await page.evaluate(()=>window.Trk.core.settings.skin),original.skin);
  assert.deepEqual(await page.evaluate(()=>window.Trk.core.settings.notes),original.notes);
  assert.deepEqual(errors,[]);
  console.log(JSON.stringify({ref,browser:browser.version(),draft:skin.id,temporaryVolume:true,catalogCount:catalog.count,
    imported:true,foundByShelf:true,selectedViaShelf:true,sharedNotesUnchanged:true,reloadRetainsSelection:true,returnedViaShelf:true,computed,pairing,
    candidateProblems:0,candidateHoldback:0,overallHoldbackProblems:contrast.holdbackProblems.length,
    scope:'Headless Chromium, new profile, service worker blocked, external requests blocked. Not a public PWA, physical device, visual/accessibility review or approval.'},null,2));
} finally {if(browser)await browser.close();if(server)await new Promise(r=>server.close(r));if(temp)fs.rmSync(temp,{recursive:true,force:true});}
