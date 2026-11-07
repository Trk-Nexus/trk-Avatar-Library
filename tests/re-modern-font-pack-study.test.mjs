// SPDX-License-Identifier: GPL-3.0-or-later
// A research pack in a clean, isolated PWA checkout; never the user's data.
// TRK_PWA=/path/to/fixed-pwa TRK_NEO_DIR=/path/to/fixed-fonts node tests/re-modern-font-pack-study.test.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {createServer} from 'node:http';
import {fileURLToPath} from 'node:url';
import {chromium as playwright} from 'playwright-core';
import chromium from '@sparticuz/chromium';
import {openZip} from '../tools/lib/zip.mjs';
import {verifyPack} from '../tools/verify-pack.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const ref='4f93a69f94ec3a3c14c6ea8d1cf9c064723b43e6';
assert(process.env.TRK_PWA && process.env.TRK_NEO_DIR,'TRK_PWA and TRK_NEO_DIR are required');
const pwa=path.resolve(process.env.TRK_PWA),neo=path.resolve(process.env.TRK_NEO_DIR);
for(const [args,expected] of [[['rev-parse','HEAD'],ref],[['status','--porcelain'],'']]){
 const r=spawnSync('git',args,{cwd:pwa,encoding:'utf8'});assert.equal(r.status,0,r.stderr);assert.equal(r.stdout.trim(),expected,'PWA checkout must be clean and fixed');
}
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'avatar-fontpack-test-'));
let server,browser;
try{
 const run=(out,dir=neo)=>spawnSync(process.execPath,[path.join(root,'tools/build-re-modern-font-pack-study.mjs'),`--trk=${pwa}`,`--neo-dir=${dir}`,`--out=${out}`],{cwd:root,encoding:'utf8'});
 const a=path.join(temp,'first.stpack'),b=path.join(temp,'second.stpack');
 for(const dest of [a,b]){const r=run(dest);assert.equal(r.status,0,r.stderr||r.stdout);}
 const bytes=fs.readFileSync(a);assert.deepEqual(bytes,fs.readFileSync(b),'identical inputs must make identical archives');
 const hash=buf=>crypto.createHash('sha256').update(buf).digest('hex');
 const verified=await verifyPack(a,{trk:pwa});assert.equal(verified.ok,true,JSON.stringify(verified.errors));
 const zip=await openZip(bytes,pwa);
 assert.deepEqual([...zip.names()].sort(),['NOTICE.md','fonts/dot/OFL.txt','fonts/dotgothic.woff2','fonts/neo/OFL.txt','fonts/neodgm.woff2','pack.json']);
 const manifest=JSON.parse(await zip.readText('pack.json'));
 assert.equal(manifest.fonts.length,2);assert(!manifest.skin && !manifest.notes && !manifest.remodern);
 const expected={
  'fonts/dotgothic.woff2':'a042e37d1a36798f5a9dee9ab81d2fc4204950ae1729b856e4d22833a61997ee',
  'fonts/dot/OFL.txt':'335d6a81ce1afcf64c8bc36334458ba3292ca6fba5d3974895b3ed84ccee530e',
  'fonts/neodgm.woff2':'0c0ca9cd73f692a5da5d7fb39737902aa9ea312537237779972a9d81ef0a33bf',
  'fonts/neo/OFL.txt':'4d3155f4caba9970c8b386064b398822c29d9181cfba07964ba7b07ccc6cca91'
 };
 for(const [name,want] of Object.entries(expected))assert.equal(hash(await zip.read(name)),want,name);
 const invalid=path.join(temp,'invalid');fs.mkdirSync(invalid);fs.copyFileSync(path.join(neo,'neodgm.woff2'),path.join(invalid,'neodgm.woff2'));fs.writeFileSync(path.join(invalid,'LICENSE.txt'),'incorrect');
 const failed=path.join(temp,'should-not-exist.stpack');assert.notEqual(run(failed,invalid).status,0);assert(!fs.existsSync(failed));
 fs.writeFileSync(failed,'keep-existing-output');assert.notEqual(run(failed,invalid).status,0);assert.equal(fs.readFileSync(failed,'utf8'),'keep-existing-output');
 server=createServer((req,res)=>{
  if(!['GET','HEAD'].includes(req.method))return res.writeHead(405).end();
  let name;try{name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{return res.writeHead(400).end();}
  if(name.split('/').some(s=>s.startsWith('.')))return res.writeHead(404).end();
  const f=path.resolve(pwa,'.'+(name==='/'?'/index.html':name));
  if(!f.startsWith(pwa+path.sep))return res.writeHead(404).end();
  const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.wasm':'application/wasm'};
  try{const content=fs.readFileSync(f);res.writeHead(200,{'Content-Type':types[path.extname(f)]||'application/octet-stream'}).end(req.method==='HEAD'?undefined:content);}catch{res.writeHead(404).end();}
 });
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}`;
 browser=await playwright.launch({args:chromium.args,executablePath:process.env.CHROMIUM_PATH||await chromium.executablePath(),headless:true});
 const page=await browser.newPage({viewport:{width:1280,height:900},serviceWorkers:'block'}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',r=>r.request().url().startsWith(base+'/')?r.continue():r.abort());
 await page.goto(base+'/',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.Trk?.custom?.packRuntime&&window.Trk?.core?.settings,{timeout:30000});
 const snap=()=>page.evaluate(()=>({skin:Trk.core.settings.skin,notes:structuredClone(Trk.core.settings.notes),id:Trk.custom.packRuntime.id,faces:Trk.custom.packRuntime.fontFaces.map(f=>({family:f.family,status:f.status})),font:getComputedStyle(document.body).fontFamily,rootFont:getComputedStyle(document.documentElement).getPropertyValue('--font')}));
 const before=await snap();assert.equal(before.id,null);
 if(await page.locator('#welcomeCloseBtn').isVisible())await page.locator('#welcomeCloseBtn').click();
 await page.click('#openSettingsBtn');await page.click('#setLevelPro');await page.locator('#packPanel summary').first().click();
 await page.locator('#packFile').setInputFiles(a);
 await page.waitForFunction(()=>Trk.custom.packRuntime.fontFaces.length===2,{timeout:20000});
 const active=await snap();assert(active.id);assert.deepEqual(active.faces,[{family:'TrkPixelResearchDot',status:'loaded'},{family:'TrkPixelResearchNeo',status:'loaded'}]);
 assert.match(active.font,/TrkPixelResearchDot/);assert.match(active.font,/TrkPixelResearchNeo/);
 assert.equal(active.skin,before.skin);assert.deepEqual(active.notes,before.notes);
 const rows=await page.evaluate(()=>Trk.custom.listInstalledFonts());assert.deepEqual(rows.map(x=>x.family),manifest.fonts.map(x=>x.family));
 const stored=await page.evaluate(async()=>{const r=await Trk.custom.packDB.get(Trk.custom.packRuntime.id);return Object.keys(r.files).sort();});
 assert.deepEqual(stored,['fonts/dot/OFL.txt','fonts/dotgothic.woff2','fonts/neo/OFL.txt','fonts/neodgm.woff2']);
 // The current detail UI offers only the first license file, even though both are stored.
 const detail=page.locator('#packList .packCard details').first();await detail.locator('summary').click();
 await detail.locator('button').click();
 const displayed=await detail.locator('pre').textContent();assert.equal(displayed,await zip.readText('fonts/dot/OFL.txt'));
 assert.equal(await detail.locator('button').count(),1);
 await page.reload({waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>Trk?.custom?.packRuntime?.fontFaces?.length===2,{timeout:30000});
 const reloaded=await snap();assert.equal(reloaded.id,active.id);assert.match(reloaded.font,/TrkPixelResearchDot/);
 if(await page.locator('#welcomeCloseBtn').isVisible())await page.locator('#welcomeCloseBtn').click();
 await page.click('#openSettingsBtn');
 if(!await page.locator('#packPanel').evaluate(e=>e.open))await page.locator('#packPanel summary').first().click();
 await page.locator('#packOffBtn').click();
 const after=await snap();assert.equal(after.id,null);assert.deepEqual(after.faces,[]);assert.equal(after.font,before.font);assert.equal(after.skin,before.skin);assert.deepEqual(after.notes,before.notes);
 page.on('dialog',d=>d.accept());
 assert.equal(await page.evaluate(id=>Trk.custom.deletePackById(id),active.id),true);
 assert.equal((await page.evaluate(()=>Trk.custom.listInstalledFonts())).length,0);
 // Existing skin-and-notes pack first, then the research font-only pack:
 // observe whether the existing pack remains active, not just whether installed.
 await page.locator('#packFile').setInputFiles(path.join(root,'font-packs/dotgothic.stpack'));
 await page.waitForFunction(()=>Trk.custom.packRuntime.fontFaces.some(f=>f.family==='TrkDotGothic'),{timeout:20000});
 const previous=await snap();assert(previous.id);
 await page.locator('#packFile').setInputFiles(a);
 await page.waitForFunction(()=>Trk.custom.packRuntime.fontFaces.some(f=>f.family==='TrkPixelResearchNeo'),{timeout:20000});
 const switched=await snap(),installed=await page.evaluate(()=>Trk.custom.listInstalledPacks());
 assert.notEqual(switched.id,previous.id);
 assert.equal(installed.find(p=>p.id===previous.id)?.active,false);
 assert.equal(installed.find(p=>p.id===switched.id)?.active,true);
 assert.equal(switched.faces.some(f=>f.family==='TrkDotGothic'),false);
 assert.deepEqual(errors,[]);
 console.log(JSON.stringify({pwa:ref,browser:browser.version(),packBytes:bytes.length,packSha256:hash(bytes),archiveEntries:[...zip.names()],reproducible:true,badLicenseRejected:true,installThroughFileInput:true,activeFontFaces:active.faces,bodyBefore:before.font,bodyAfter:active.font,bothLicensesStored:true,onlyFirstLicenseDisplayed:true,reloadRestored:true,offRestoredBody:true,deleteClearedIndex:true,skinAndNotesUnchangedInEmptyProfile:true,previousPackDeactivatedOnSwitch:true,previousPackBefore:{skin:previous.skin,notes:previous.notes},afterSwitch:{skin:switched.skin,notes:switched.notes},scope:'Isolated clean PWA and profile, Chromium, default skin and one prior DotGothic pack; generic pack applies fonts beyond the work heading. No completion, real devices, AT, human font review, independent multi-pack coexistence or production distribution.'},null,2));
}finally{if(browser)await browser.close();if(server)await new Promise(r=>server.close(r));fs.rmSync(temp,{recursive:true,force:true});}
