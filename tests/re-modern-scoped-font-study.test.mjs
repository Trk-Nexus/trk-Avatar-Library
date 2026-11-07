// SPDX-License-Identifier: GPL-3.0-or-later
// Research injection into an isolated PWA. No source or normal user data changes.
// TRK_PWA=/path/to/fixed-pwa TRK_NEO_DIR=/path/to/fixed-fonts node tests/re-modern-scoped-font-study.test.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {createServer} from 'node:http';
import {fileURLToPath} from 'node:url';
import {chromium as playwright} from 'playwright-core';
import chromium from '@sparticuz/chromium';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const ref='4f93a69f94ec3a3c14c6ea8d1cf9c064723b43e6';
assert(process.env.TRK_PWA && process.env.TRK_NEO_DIR,'TRK_PWA and TRK_NEO_DIR required');
const pwa=path.resolve(process.env.TRK_PWA),neo=path.resolve(process.env.TRK_NEO_DIR);
for(const [args,expected] of [[['rev-parse','HEAD'],ref],[['status','--porcelain'],'']]){
 const r=spawnSync('git',args,{cwd:pwa,encoding:'utf8'});assert.equal(r.status,0,r.stderr);assert.equal(r.stdout.trim(),expected,'PWA checkout must be clean and fixed');
}
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'avatar-scope-font-'));let server,browser;
try{
 const pack=path.join(temp,'research.stpack');
 const build=spawnSync(process.execPath,[path.join(root,'tools/build-re-modern-font-pack-study.mjs'),`--trk=${pwa}`,`--neo-dir=${neo}`,`--out=${pack}`],{cwd:root,encoding:'utf8'});assert.equal(build.status,0,build.stderr||build.stdout);
 server=createServer((req,res)=>{
  if(!['GET','HEAD'].includes(req.method))return res.writeHead(405).end();
  let name;try{name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{return res.writeHead(400).end();}
  if(name.split('/').some(s=>s.startsWith('.')))return res.writeHead(404).end();
  const f=path.resolve(pwa,'.'+(name==='/'?'/index.html':name));if(!f.startsWith(pwa+path.sep))return res.writeHead(404).end();
  const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.wasm':'application/wasm'};
  try{const body=fs.readFileSync(f);res.writeHead(200,{'Content-Type':types[path.extname(f)]||'application/octet-stream'}).end(req.method==='HEAD'?undefined:body);}catch{res.writeHead(404).end();}
 });
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}`;
 browser=await playwright.launch({args:chromium.args,executablePath:process.env.CHROMIUM_PATH||await chromium.executablePath(),headless:true});
 const page=await browser.newPage({viewport:{width:1280,height:900},serviceWorkers:'block'}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',r=>r.request().url().startsWith(base+'/')?r.continue():r.abort());
 await page.goto(base+'/',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>Trk?.custom?.packRuntime&&Trk?.core?.settings,{timeout:30000});
 if(await page.locator('#welcomeCloseBtn').isVisible())await page.locator('#welcomeCloseBtn').click();
 await page.click('#openSettingsBtn');await page.click('#setLevelPro');await page.locator('#packPanel summary').first().click();
 await page.locator('#packFile').setInputFiles(path.join(root,'font-packs/dotgothic.stpack'));
 await page.waitForFunction(()=>Trk.custom.packRuntime.fontFaces.some(f=>f.family==='TrkDotGothic'),{timeout:20000});
 const snap=()=>page.evaluate(()=>({id:Trk.custom.packRuntime.id,skin:Trk.core.settings.skin,notes:structuredClone(Trk.core.settings.notes),body:getComputedStyle(document.body).fontFamily,rootFont:getComputedStyle(document.documentElement).getPropertyValue('--font'),title:getComputedStyle(document.querySelector('.brand h1')).fontFamily,other:getComputedStyle(document.querySelector('#settingsScreen h2')).fontFamily,faces:[...document.fonts].filter(f=>f.family.startsWith('AvatarScopeResearch')).map(f=>f.family),researchClasses:[...document.querySelector('.brand h1').classList].filter(c=>c.startsWith('avatar-scope-research-')),researchStyles:[...document.querySelectorAll('style')].filter(s=>s.textContent.includes('AvatarScopeResearchDot')).length}));
 const existing=await snap();assert(existing.id);
 // Explicitly call the existing *save-only* internal API; the settings file
 // input would activate the whole pack, so this is not an existing UI workflow.
 const base64=fs.readFileSync(pack).toString('base64');
 const installed=await page.evaluate(async data=>{const raw=atob(data),bytes=Uint8Array.from(raw,c=>c.charCodeAt(0));return Trk.custom.installPackFile(new File([bytes],'research.stpack',{type:'application/octet-stream'}));},base64);
 assert(installed?.id);assert.notEqual(installed.id,existing.id);
 const stored=await snap();assert.deepEqual(stored,existing,'save-only import must not activate the research pack');
 await page.click('#closeSettingsBtn');
 await page.addScriptTag({content:fs.readFileSync(path.join(root,'docs/re-modern-research/pixel-console-scoped-font-study/controller.js'),'utf8')});
 await page.evaluate(()=>{window.scopeStudy=AvatarScopedFontStudy.create({title:document.querySelector('.brand h1'),readRecord:id=>Trk.custom.packDB.get(id)});});
 assert.deepEqual(await page.evaluate(id=>scopeStudy.enable(id),installed.id),{status:'on',id:installed.id});
 const scoped=await snap();assert.match(scoped.title,/AvatarScopeResearchDot/);assert.match(scoped.title,/AvatarScopeResearchNeo/);
 for(const key of ['id','skin','notes','body','rootFont','other'])assert.deepEqual(scoped[key],existing[key],`${key} must stay unchanged`);
 assert.deepEqual(scoped.faces,['AvatarScopeResearchDot','AvatarScopeResearchNeo']);
 // Real font used for a Korean sample attached to the actual title element.
 await page.evaluate(async()=>{const s=document.createElement('span');s.id='scope-korean-fixture';s.lang='ko';s.textContent='픽셀 콘솔';document.querySelector('.brand h1').append(s);await document.fonts.ready;await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));});
 assert(await page.locator('#scope-korean-fixture').isVisible(),'actual title must be visible for rendered-font query');
 const cdp=await page.context().newCDPSession(page);await cdp.send('DOM.enable');await cdp.send('CSS.enable');
 const {root:doc}=await cdp.send('DOM.getDocument');const {nodeId}=await cdp.send('DOM.querySelector',{nodeId:doc.nodeId,selector:'#scope-korean-fixture'});
 const rendered=await cdp.send('CSS.getPlatformFontsForNode',{nodeId});
 assert(rendered.fonts.some(f=>/neodunggeunmo/i.test(f.familyName)&&f.glyphCount>=4),JSON.stringify(rendered));
 await page.evaluate(()=>document.querySelector('#scope-korean-fixture').remove());
 // A user's later inline choice survives disable; the controller removes only
 // its class/style/FontFaces, not a captured or overwritten user style.
 await page.evaluate(()=>document.querySelector('.brand h1').style.fontFamily='serif');
 assert.equal(await page.locator('.brand h1').evaluate(e=>getComputedStyle(e).fontFamily),'serif');
 assert.deepEqual(await page.evaluate(()=>scopeStudy.disable()),{status:'off'});
 assert.equal(await page.locator('.brand h1').evaluate(e=>e.style.fontFamily),'serif');
 assert.deepEqual((await snap()).faces,[]);
 const blocked=await page.evaluate(id=>scopeStudy.enable(id),installed.id);assert.equal(blocked.status,'error');assert.match(blocked.reason,/overridden/);assert.equal(await page.evaluate(()=>scopeStudy.status()),'off');assert.deepEqual((await snap()).faces,[]);
 await page.evaluate(()=>document.querySelector('.brand h1').style.removeProperty('font-family'));
 assert.deepEqual(await snap(),existing);
 // Missing, tampered, partial FontFace failure and cancellation all roll back.
 const failures=await page.evaluate(async id=>{
  const title=document.querySelector('.brand h1'),real=await Trk.custom.packDB.get(id);
  const missing=AvatarScopedFontStudy.create({title,readRecord:async()=>null});
  const m=await missing.enable(id);
  const bad={...real,files:{...real.files,'fonts/neo/OFL.txt':new Blob([new Uint8Array(4420)])}};
  const corrupt=AvatarScopedFontStudy.create({title,readRecord:async()=>bad});
  const c=await corrupt.enable(id);
  const oversized={...real,files:{...real.files,'fonts/neo/OFL.txt':new Blob(['bad'])}};
  const wrongSize=await AvatarScopedFontStudy.create({title,readRecord:async()=>oversized}).enable(id);
  const Original=window.FontFace;let count=0;window.FontFace=function(...args){if(++count===2)throw new Error('simulated second face failure');return new Original(...args);};
  let partial;try{partial=await AvatarScopedFontStudy.create({title,readRecord:async()=>real}).enable(id);}finally{window.FontFace=Original;}
  let release;const pending=AvatarScopedFontStudy.create({title,readRecord:()=>new Promise(r=>{release=r;})});
  const promise=pending.enable(id);pending.disable();release(real);const cancelled=await promise;
  return {missing:m,corrupt:c,wrongSize,partial,cancelled};
 },installed.id);
 assert.equal(failures.missing.status,'error');assert.equal(failures.corrupt.status,'error');assert.match(failures.corrupt.reason,/hash mismatch/);assert.equal(failures.wrongSize.status,'error');assert.match(failures.wrongSize.reason,/size mismatch/);assert.equal(failures.partial.status,'error');assert.equal(failures.cancelled.status,'cancelled');assert.deepEqual(await snap(),existing);
 // Changing the actual PWA skin while scoped text is active must not be undone
 // by our later disable. This changes only this isolated profile.
 assert.equal((await page.evaluate(id=>scopeStudy.enable(id),installed.id)).status,'on');
 await page.evaluate(()=>Trk.core.applySkin('shadow'));
 const changed=await snap();assert.equal(changed.skin,'shadow');assert.equal(changed.id,existing.id);
 await page.evaluate(()=>scopeStudy.disable());
 const changedOff=await snap();assert.equal(changedOff.skin,'shadow');assert.equal(changedOff.id,existing.id);assert.equal(changedOff.body,changed.body);assert.deepEqual(changedOff.notes,changed.notes);assert.deepEqual(changedOff.faces,[]);
 // No persistence is intentionally implemented; scoped state is not restored.
 await page.reload({waitUntil:'domcontentloaded'});await page.waitForFunction(()=>Trk?.custom?.packRuntime?.fontFaces?.some(f=>f.family==='TrkDotGothic'),{timeout:30000});
 const reload=await snap();assert.equal(reload.id,existing.id);assert.equal(reload.skin,'shadow');assert.equal(reload.title,changedOff.title);assert.deepEqual(reload.faces,[]);
 assert.deepEqual(errors,[]);
 console.log(JSON.stringify({pwa:ref,browser:browser.version(),savedWithoutActivatingViaInternalApi:true,previousPackRemainedActive:true,scopeTitle:scoped.title,bodyUnchanged:scoped.body,otherHeadingUnchanged:true,skinAndNotesUnchanged:true,actualKoreanFont:rendered.fonts,userChangePreserved:true,changedSkinPreserved:true,priorityOverrideRejected:true,failures,cleanupAfterFailure:true,sessionOnly:true,scope:'Injected isolated research code, not a PWA feature or approved distribution. Does not prove full user settings, work lifecycle, deletion/updates, persistence, AT, devices, all scripts, or visual suitability.'},null,2));
}finally{if(browser)await browser.close();if(server)await new Promise(r=>server.close(r));fs.rmSync(temp,{recursive:true,force:true});}
