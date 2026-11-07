// SPDX-License-Identifier: GPL-3.0-or-later
// Isolated research, not an evaluation of appearance, accessibility or permission.
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
const {TRK_PWA:pwa,TRK_NEO_DIR:neo,TRK_GALMURI_DIR:gal,TRK_LATIN_DIR:latin,TRK_SOLID_DIR:solid}=process.env;
assert(pwa&&neo&&gal&&latin&&solid,'TRK_PWA, TRK_NEO_DIR, TRK_GALMURI_DIR, TRK_LATIN_DIR, TRK_SOLID_DIR required');
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'solid-study-test-')),out=path.join(tmp,'out');let browser,server;
try{
 const build=dir=>spawnSync(process.execPath,[path.join(root,'tools/prepare-re-modern-solidlinker-study.mjs'),`--trk=${pwa}`,`--neo-dir=${neo}`,`--galmuri-dir=${gal}`,`--latin-dir=${latin}`,`--solid-dir=${dir}`,`--out=${out}`],{cwd:root,encoding:'utf8'});
 let r=build(solid);assert.equal(r.status,0,r.stderr||r.stdout);const original=fs.readFileSync(path.join(out,'index.html'));
 const bad=path.join(tmp,'bad');fs.mkdirSync(bad);for(const n of ['author-index.html','x12y16pxSolidLinker.ttf'])fs.copyFileSync(path.join(solid,n),path.join(bad,n));
 for(const n of ['author-index.html','x12y16pxSolidLinker.ttf']){fs.writeFileSync(path.join(bad,n),'bad');r=build(bad);assert.notEqual(r.status,0,n);assert.deepEqual(fs.readFileSync(path.join(out,'index.html')),original);fs.copyFileSync(path.join(solid,n),path.join(bad,n));}
 const rights=fs.readFileSync(path.join(out,'assets/SolidLinker-LICENSE.txt'),'utf8');assert(rights.includes('加工・改変・再配布も可能'));assert(rights.includes('© 2018-2025 hicc 患者長ひっく'));assert(rights.includes('この規約は予告なく変更'));assert(rights.includes('TTF 内から抽出したものではありません'));
 assert.deepEqual(fs.readFileSync(path.join(out,'assets/x12y16pxSolidLinker.ttf')),fs.readFileSync(path.join(solid,'x12y16pxSolidLinker.ttf')));
 server=createServer((req,res)=>{let n;try{n=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{return res.writeHead(400).end();}const f=path.resolve(out,'.'+(n==='/'?'/index.html':n));if(!f.startsWith(out+path.sep))return res.writeHead(403).end();const types={'.html':'text/html; charset=utf-8','.woff2':'font/woff2','.ttf':'font/ttf','.txt':'text/plain; charset=utf-8'};try{res.writeHead(200,{'Content-Type':types[path.extname(f)]||'application/octet-stream'}).end(fs.readFileSync(f));}catch{res.writeHead(404).end();}});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const base=`http://127.0.0.1:${server.address().port}`;
 browser=await playwright.launch({args:chromium.args,executablePath:process.env.CHROMIUM_PATH||await chromium.executablePath(),headless:true});
 const page=await browser.newPage({javaScriptEnabled:false,serviceWorkers:'block'}),requests=[];page.on('request',r=>requests.push(r.url()));await page.route('**/*',r=>r.request().url().startsWith(base+'/')?r.continue():r.abort());await page.goto(base+'/',{waitUntil:'load'});
 assert(await page.locator('#system').isChecked());assert.equal(requests.filter(u=>/\.(ttf|woff2)$/.test(u)).length,0);assert.equal(await page.locator('#brand').textContent(),'trk!');assert.equal(await page.locator('#brand-spaced').textContent(),'trk!');const protectedFont=await page.locator('#protected').evaluate(e=>getComputedStyle(e).fontFamily);
 await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.id),'system');for(let i=0;i<6;i++)await page.keyboard.press('ArrowRight');assert(await page.locator('#solid').isChecked());
 assert.deepEqual(await page.evaluate(async()=>{const f=await document.fonts.load('400 32px StudySolid','trk! Pixel Console');await document.fonts.ready;return f.map(x=>x.status);}),['loaded']);
 await page.locator('#brand').evaluate(e=>e.getBoundingClientRect());const cdp=await page.context().newCDPSession(page);await cdp.send('DOM.enable');await cdp.send('CSS.enable');const {root:doc}=await cdp.send('DOM.getDocument');const used={};
 for(const [id,count] of [['brand',4],['brand-spaced',4],['label-en',13],['label-en-spaced',13]]){const {nodeId}=await cdp.send('DOM.querySelector',{nodeId:doc.nodeId,selector:`#${id}`});const fonts=(await cdp.send('CSS.getPlatformFontsForNode',{nodeId})).fonts;used[id]=fonts;assert(fonts.some(f=>/x12y16pxSolidLinker/i.test(f.familyName)&&f.glyphCount===count),JSON.stringify({id,fonts}));}
 const dimensions=await page.evaluate(()=>{const width=id=>{const r=document.createRange();r.selectNodeContents(document.getElementById(id));return r.getBoundingClientRect().width;};return {zero:width('brand'),spaced:width('brand-spaced'),spacing:getComputedStyle(document.querySelector('#brand-spaced')).letterSpacing};});assert(dimensions.spaced>dimensions.zero,JSON.stringify(dimensions));assert.equal(await page.locator('#protected').evaluate(e=>getComputedStyle(e).fontFamily),protectedFont);
 for(const id of ['system','pair','galmuri','press','jet','fira','solid']){await page.locator(`#${id}`).check();for(const width of [1280,390,320]){await page.setViewportSize({width,height:900});for(const size of ['100%','200%']){await page.evaluate(s=>document.documentElement.style.fontSize=s,size);const d=await page.evaluate(()=>({w:document.documentElement.scrollWidth,c:document.documentElement.clientWidth}));assert(d.w<=d.c,JSON.stringify({id,width,size,d}));}}}
 await page.emulateMedia({forcedColors:'active',reducedMotion:'reduce'});assert(await page.locator('#brand').isVisible());await page.reload({waitUntil:'load'});assert(await page.locator('#system').isChecked());assert(requests.every(u=>u.startsWith(base+'/')));
 const blocked=await browser.newPage({javaScriptEnabled:false,serviceWorkers:'block'});await blocked.route('**/*',r=>!r.request().url().startsWith(base+'/')||r.request().url().endsWith('.ttf')?r.abort():r.continue());await blocked.goto(base+'/',{waitUntil:'load'});await blocked.locator('#solid').check();await blocked.evaluate(async()=>{try{await document.fonts.load('400 32px StudySolid','trk!');}catch{}});assert.deepEqual(await blocked.evaluate(()=>[...document.fonts].filter(f=>f.family==='StudySolid').map(f=>f.status)),['error']);assert(await blocked.locator('#brand').isVisible());
 console.log(JSON.stringify({browser:browser.version(),used,dimensions,jsDisabled:true,keyboard:true,protectedFont:true,noAutomaticFontRequest:true,noExternalRequests:true,reloadDefault:true,widths:[1280,390,320],rootSizes:['100%','200%'],forcedColorsAndReducedMotion:true,blockedFontTextVisible:true,scope:'Isolated study only; not visual, human, real device, AT, actual zoom or legal review.'},null,2));
}finally{if(browser)await browser.close();if(server)await new Promise(r=>server.close(r));fs.rmSync(tmp,{recursive:true,force:true});}
