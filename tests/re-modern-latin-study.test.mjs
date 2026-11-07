// SPDX-License-Identifier: GPL-3.0-or-later
// Isolated study: JS disabled, local assets only, not PWA or a human review.
// TRK_PWA=/path/to/pwa TRK_NEO_DIR=/path/to/neo TRK_GALMURI_DIR=/path/to/galmuri TRK_LATIN_DIR=/path/to/latin node tests/re-modern-latin-study.test.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import zlib from 'node:zlib';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {createServer} from 'node:http';
import {fileURLToPath} from 'node:url';
import {chromium as playwright} from 'playwright-core';
import chromium from '@sparticuz/chromium';
import {readWoff2,cmapOf,coverage} from '../tools/check-fonts.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const {TRK_PWA:pwa,TRK_NEO_DIR:neo,TRK_GALMURI_DIR:gal,TRK_LATIN_DIR:latin}=process.env;assert(pwa&&neo&&gal&&latin,'TRK_PWA, TRK_NEO_DIR, TRK_GALMURI_DIR, TRK_LATIN_DIR required');
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'avatar-latin-test-'));let browser,server;
try{
 const script=path.join(root,'tools/prepare-re-modern-latin-study.mjs');
 const build=dir=>spawnSync(process.execPath,[script,`--trk=${pwa}`,`--neo-dir=${neo}`,`--galmuri-dir=${gal}`,`--latin-dir=${dir}`,`--out=${tmp}`],{cwd:root,encoding:'utf8'});
 let r=build(latin);assert.equal(r.status,0,r.stderr||r.stdout);const old=fs.readFileSync(path.join(tmp,'index.html'));
 const bad=path.join(tmp,'bad');fs.mkdirSync(bad);for(const name of ['press-start-2p.woff2','press-start-2p-LICENSE.txt','JetBrainsMono-Regular.woff2','JetBrainsMono-OFL.txt','fira-code.woff2','fira-code-LICENSE.txt'])fs.copyFileSync(path.join(latin,name),path.join(bad,name));
 fs.writeFileSync(path.join(bad,'fira-code.woff2'),'bad');r=build(bad);assert.notEqual(r.status,0);assert.deepEqual(fs.readFileSync(path.join(tmp,'index.html')),old);
 fs.copyFileSync(path.join(latin,'fira-code.woff2'),path.join(bad,'fira-code.woff2'));fs.writeFileSync(path.join(bad,'press-start-2p-LICENSE.txt'),'bad');r=build(bad);assert.notEqual(r.status,0);assert.deepEqual(fs.readFileSync(path.join(tmp,'index.html')),old);
 const cmap={};for(const name of ['press-start-2p.woff2','JetBrainsMono-Regular.woff2','fira-code.woff2']){
  const b=fs.readFileSync(path.join(tmp,'assets',name)),w=readWoff2(b),m=cmapOf(b,w);
  const plain=zlib.brotliDecompressSync(b.subarray(48+w.tableBytes,48+w.tableBytes+w.totalCompressedSize));let offset=0,weight;
  for(const t of w.tables){if(t.tag==='OS/2'){assert(!t.transformed);weight=plain.readUInt16BE(offset+4);}offset+=t.transformLength;}
  assert.equal(weight,400,name);cmap[name]={size:m.size,weight,brand:coverage(m,'trk!').missing,en:coverage(m,'Pixel Console').missing,ja:coverage(m,'ピクセル・コンソール').missing,zh:coverage(m,'像素控制台').missing,ko:coverage(m,'픽셀 콘솔').missing,cyr:coverage(m,'Привет').missing,greek:coverage(m,'Γειά').missing};
  assert.deepEqual(cmap[name].brand,[]);assert.deepEqual(cmap[name].en,[]);assert.equal(cmap[name].ja.length,9);assert.equal(cmap[name].zh.length,5);assert.equal(cmap[name].ko.length,4);
 }
 assert.deepEqual(cmap['JetBrainsMono-Regular.woff2'].cyr,[]);assert.deepEqual(cmap['JetBrainsMono-Regular.woff2'].greek,[]);
 assert(cmap['fira-code.woff2'].cyr.length&&cmap['press-start-2p.woff2'].greek.length);
 server=createServer((req,res)=>{let n;try{n=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{return res.writeHead(400).end();}const f=path.resolve(tmp,'.'+(n==='/'?'/index.html':n));if(!f.startsWith(tmp+path.sep))return res.writeHead(403).end();const types={'.html':'text/html; charset=utf-8','.woff2':'font/woff2','.txt':'text/plain; charset=utf-8'};try{res.writeHead(200,{'Content-Type':types[path.extname(f)]||'application/octet-stream'}).end(fs.readFileSync(f));}catch{res.writeHead(404).end();}});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const base=`http://127.0.0.1:${server.address().port}`;
 browser=await playwright.launch({args:chromium.args,executablePath:process.env.CHROMIUM_PATH||await chromium.executablePath(),headless:true});
 const page=await browser.newPage({javaScriptEnabled:false,serviceWorkers:'block'}),requests=[];page.on('request',r=>requests.push(r.url()));await page.route('**/*',r=>r.request().url().startsWith(base+'/')?r.continue():r.abort());await page.goto(base+'/',{waitUntil:'load'});
 const draft=JSON.parse(fs.readFileSync(path.join(root,'drafts/re-modern/pixel-console/skin.json')));assert.equal(await page.locator('#label-en').textContent(),draft.label.en);assert.equal(await page.locator('#brand').textContent(),'trk!');assert.equal(await page.locator('#symbols').textContent(),'0 O 1 l I \u00a0 -> <= != ===');
 assert(await page.locator('#system').isChecked());assert.equal(requests.filter(x=>x.endsWith('.woff2')).length,0);const body=await page.locator('#protected').evaluate(e=>getComputedStyle(e).fontFamily);
 await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.id),'system');
 const choices=[['pair','StudyDot',/dotgothic16/i],['galmuri','StudyGalmuri',/galmuri11/i],['press','StudyPress',/press.?start/i],['jet','StudyJet',/jetbrains.?mono/i],['fira','StudyFira',/fira.?code/i]];
 const cdp=await page.context().newCDPSession(page);await cdp.send('DOM.enable');await cdp.send('CSS.enable');const {root:doc}=await cdp.send('DOM.getDocument');const used={};
 for(const [id,family,re] of choices){
  await page.keyboard.press('ArrowRight');assert(await page.locator(`#${id}`).isChecked(),id);
  const status=await page.evaluate(async(family)=>{const f=await document.fonts.load(`400 32px ${family}`,'trk! Pixel Console');await document.fonts.ready;return f.map(x=>x.status);},family);assert.deepEqual(status,['loaded'],id);
  // Force style/layout before querying Chromium's platform-font information.
  await page.locator('#brand').evaluate(e=>e.getBoundingClientRect().width);
  used[id]={};for(const [node,count] of [['brand',4],['label-en',13]]){const {nodeId}=await cdp.send('DOM.querySelector',{nodeId:doc.nodeId,selector:`#${node}`});const fonts=(await cdp.send('CSS.getPlatformFontsForNode',{nodeId})).fonts;used[id][node]=fonts;assert(fonts.some(x=>re.test(x.familyName)&&x.glyphCount===count),JSON.stringify({id,node,fonts}));}
  assert.equal(await page.locator('#protected').evaluate(e=>getComputedStyle(e).fontFamily),body);
 }
 for(const id of ['system',...choices.map(c=>c[0])]){await page.locator(`#${id}`).check();for(const width of [1280,390,320]){await page.setViewportSize({width,height:900});for(const size of ['100%','200%']){await page.evaluate(s=>document.documentElement.style.fontSize=s,size);const d=await page.evaluate(()=>({w:document.documentElement.scrollWidth,c:document.documentElement.clientWidth}));assert(d.w<=d.c,JSON.stringify({id,width,size,d}));}}}
 await page.emulateMedia({forcedColors:'active',reducedMotion:'reduce'});assert(await page.locator('#label-en').isVisible());await page.reload({waitUntil:'load'});assert(await page.locator('#system').isChecked());
 for(const name of ['OFL.txt','NeoDunggeunmo-OFL.txt','Galmuri-LICENSE.txt','press-start-2p-LICENSE.txt','JetBrainsMono-OFL.txt','fira-code-LICENSE.txt']){const x=await page.request.get(`${base}/assets/${name}`);assert(x.ok());assert.deepEqual(await x.body(),fs.readFileSync(path.join(tmp,'assets',name)));}
 assert(requests.every(u=>u.startsWith(base+'/')));
 const failed=await browser.newPage({javaScriptEnabled:false,serviceWorkers:'block'});await failed.route('**/*',r=>!r.request().url().startsWith(base+'/')||r.request().url().endsWith('/fira-code.woff2')?r.abort():r.continue());await failed.goto(base+'/',{waitUntil:'load'});await failed.locator('#fira').check();await failed.evaluate(async()=>{try{await document.fonts.load('400 32px StudyFira','trk!');}catch{}});assert.deepEqual(await failed.evaluate(()=>[...document.fonts].filter(f=>f.family==='StudyFira').map(f=>f.status)),['error']);assert(await failed.locator('#brand').isVisible());
 console.log(JSON.stringify({browser:browser.version(),jsDisabled:true,cmap,used,keyboard:true,protectedBodyUnchanged:true,noAutomaticFontRequest:true,noExternalRequests:true,reloadDefault:true,widths:[1280,390,320],rootSizes:['100%','200%'],forcedColorsAndReducedMotion:true,blockedFiraTextVisible:true,scope:'Research preview only. Subsets are not full fonts. No PWA integration, human, real-device, actual zoom, assistive technology, shaping, ligature or legal review.'},null,2));
}finally{if(browser)await browser.close();if(server)await new Promise(r=>server.close(r));fs.rmSync(tmp,{recursive:true,force:true});}
