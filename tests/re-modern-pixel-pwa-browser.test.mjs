// SPDX-License-Identifier: GPL-3.0-or-later
// Narrow research test; never changes the real PWA checkout or registers a skin.
// TRK_PWA=/path/to/clean-fixed-pwa node tests/re-modern-pixel-pwa-browser.test.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {researchCatalog} from '../tools/lib/re-modern-research-catalog.mjs';
import os from 'node:os';
import path from 'node:path';
import {createServer} from 'node:http';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {chromium as playwright} from 'playwright-core';
import chromium from '@sparticuz/chromium';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const pwa=process.env.TRK_PWA && path.resolve(process.env.TRK_PWA);
const spec=JSON.parse(fs.readFileSync(path.join(root,'docs/re-modern-research/pixel-console-candidate.json')));
function run(cmd,args,cwd){const r=spawnSync(cmd,args,{cwd,encoding:'utf8'}); if(r.error || r.status!==0) throw Error(`${cmd}: ${r.error || r.stderr || r.stdout}`);return r.stdout;}
assert(pwa,'TRK_PWA is required');
assert.equal(run('git',['rev-parse','HEAD'],pwa).trim(),spec.pwaRef);
assert.equal(run('git',['status','--porcelain'],pwa).trim(),'','PWA checkout must be clean');
let temp,browser,server;
try {
 temp=fs.mkdtempSync(path.join(os.tmpdir(),'pixel-pwa-test-'));
 const copy=path.join(temp,'pwa');
 fs.cpSync(pwa,copy,{recursive:true,filter:src=>!['.git','node_modules'].includes(path.basename(src))});
 const {bytes:catalogBytes,source:catalogSource}=researchCatalog(root,spec.catalogSha256);
 const cat=JSON.parse(catalogBytes);
 const groups=JSON.parse(fs.readFileSync(path.join(root,'skin-volumes/volumes.json')));
 const source=cat.skins.find(s=>s.id===spec.sourceId);
 assert(source);assert(!cat.skins.some(s=>s.id===spec.candidate.id));
 cat.skins.push({...source,...spec.candidate});cat.count=cat.skins.length;
 groups.groups.find(g=>g.id==='glitch').ids.push(spec.candidate.id);
 const cfile=path.join(temp,'catalog.json'), vfile=path.join(temp,'volumes.json');
 fs.writeFileSync(cfile,JSON.stringify(cat));fs.writeFileSync(vfile,JSON.stringify(groups));
 run(process.execPath,['tools/import-skin-catalog.mjs',cfile,'--cat=','--exclude-cat=wizard','--only-new',`--volumes=${vfile}`,'--kind=volumes','--out=js/skins-volumes.js'],copy);
 const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.wasm':'application/wasm'};
 server=createServer((req,res)=>{let name;try{name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400).end();return;}
  const file=path.resolve(copy,'.'+(name==='/'?'/index.html':name));
  if(!file.startsWith(copy+path.sep)){res.writeHead(403).end();return;}
  try{const data=fs.readFileSync(file);res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'});res.end(data);}catch{res.writeHead(404).end();}});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const base=`http://127.0.0.1:${server.address().port}`;
 browser=await playwright.launch({args:chromium.args,executablePath:process.env.CHROMIUM_PATH || await chromium.executablePath(),headless:true});
 const page=await browser.newPage({viewport:{width:1280,height:900},serviceWorkers:'block'});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',route=>route.request().url().startsWith(base+'/')?route.continue():route.abort());
 await page.goto(base+'/',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(id=>window.Trk?.data?.SKINS?.[id] && window.Trk?.core?.settings && window.Trk?.custom,spec.candidate.id,{timeout:30000});
 const before=await page.evaluate(()=>structuredClone(window.Trk.core.settings.notes));
 // Deliberately call the same handler as the shelf; this is not an end-to-end shelf discovery test.
 await page.evaluate(id=>window.Trk.core.applySkin(id),spec.candidate.id);
 assert.deepEqual(await page.evaluate(()=>window.Trk.core.settings.notes),before,'selecting a skin must not change shared notes');
 if (await page.locator('#welcomeCloseBtn').isVisible()) await page.locator('#welcomeCloseBtn').click();
 await page.click('#openSettingsBtn');
 await page.evaluate(()=>{let e=document.getElementById('notePresets');while(e){if(e.tagName==='DETAILS')e.open=true;e=e.parentElement;}});
 await page.locator('#notePresets [data-preset="skin"]').click({timeout:10000});
 const expected=[{color:spec.candidate.colors.don,shape:'square'},{color:spec.candidate.colors.ka,shape:'diamond'}];
 assert.deepEqual(await page.evaluate(()=>window.Trk.core.settings.notes),expected,'explicit skin suggestion should use the candidate notes');
 await page.reload({waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.Trk?.core?.settings && window.Trk?.custom,{timeout:30000});
 assert.deepEqual(await page.evaluate(()=>window.Trk.core.settings.notes),expected,'suggested shared notes persist after reload');
 await page.evaluate(()=>window.Trk.core.applySkin('shadow'));
 assert.deepEqual(await page.evaluate(()=>window.Trk.core.settings.notes),expected,'changing skins does not restore prior notes');
 if (!await page.locator('#settingsScreen').isVisible()) await page.click('#openSettingsBtn');
 await page.evaluate(()=>{let e=document.getElementById('notePresets');while(e){if(e.tagName==='DETAILS')e.open=true;e=e.parentElement;}});
 for (const i of [0,1]) {
  await page.locator(`#noteColor${i}`).evaluate((el,color)=>{el.value=color;el.dispatchEvent(new Event('input',{bubbles:true}));},before[i].color);
  await page.locator(`#noteShape${i}`).selectOption(before[i].shape);
 }
 assert.deepEqual(await page.evaluate(()=>window.Trk.core.settings.notes),before,'settings controls can restore recorded values');
 assert.deepEqual(errors,[],'uncaught JS errors');
 console.log(JSON.stringify({pwa:spec.pwaRef,catalogSource,browser:browser.version(),candidate:spec.candidate.id,selectedSkinKeepsNotes:true,explicitSuggestion:expected,reloadKeepsNotes:true,changingSkinKeepsNotes:true,restoreViaControls:true,method:'clean temporary copy, core.applySkin, preset click, synthetic color input and shape select; native picker, accessibility, modes and human review not tested'},null,2));
} finally {if(browser)await browser.close();if(server)await new Promise(resolve=>server.close(resolve));if(temp)fs.rmSync(temp,{recursive:true,force:true});}
