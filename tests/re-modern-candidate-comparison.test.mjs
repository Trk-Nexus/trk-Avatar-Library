// SPDX-License-Identifier: GPL-3.0-or-later
// Explicitly supplied fixed candidate, offline comparative research only.
// TRK_PWA=/path/to/pwa TRK_NEO_DIR=/path/to/neo TRK_GALMURI_DIR=/path/to/galmuri node tests/re-modern-candidate-comparison.test.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {createServer} from 'node:http';
import {fileURLToPath} from 'node:url';
import {chromium as playwright} from 'playwright-core';
import chromium from '@sparticuz/chromium';
import {readWoff2,cmapOf,coverage} from '../tools/check-fonts.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const {TRK_PWA:pwa,TRK_NEO_DIR:neo,TRK_GALMURI_DIR:gal}=process.env;assert(pwa&&neo&&gal,'TRK_PWA, TRK_NEO_DIR and TRK_GALMURI_DIR required');
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'avatar-candidate-test-'));let browser,server;
try{
 const script=path.join(root,'tools/prepare-re-modern-candidate-comparison.mjs');
 const build=(dir)=>spawnSync(process.execPath,[script,`--trk=${pwa}`,`--neo-dir=${neo}`,`--galmuri-dir=${dir}`,`--out=${tmp}`],{cwd:root,encoding:'utf8'});
 let r=build(gal);assert.equal(r.status,0,r.stderr||r.stdout);
 const output=fs.readFileSync(path.join(tmp,'index.html'));const bad=path.join(tmp,'bad');fs.mkdirSync(bad);fs.writeFileSync(path.join(bad,'Galmuri11.woff2'),'bad');fs.copyFileSync(path.join(gal,'Galmuri-LICENSE.txt'),path.join(bad,'Galmuri-LICENSE.txt'));
 r=build(bad);assert.notEqual(r.status,0);assert.deepEqual(fs.readFileSync(path.join(tmp,'index.html')),output);
 fs.copyFileSync(path.join(gal,'Galmuri11.woff2'),path.join(bad,'Galmuri11.woff2'));fs.writeFileSync(path.join(bad,'Galmuri-LICENSE.txt'),'bad');
 r=build(bad);assert.notEqual(r.status,0);assert.deepEqual(fs.readFileSync(path.join(tmp,'index.html')),output);
 const draft=JSON.parse(fs.readFileSync(path.join(root,'drafts/re-modern/pixel-console/skin.json')));
 const files=['DotGothic16-Regular.woff2','neodgm.woff2','Galmuri11.woff2'];
 const maps=files.map(n=>{const b=fs.readFileSync(path.join(tmp,'assets',n));return cmapOf(b,readWoff2(b));});
 const samples={brand:'trk!',...draft.label,zh_probe:'你好',ko_probe:'한글',combining:'픽',symbols:'❤ 🎵'};
 const expected={brand:[[],[],[]],ja:[[],['ピ','ク','セ','ル','・','コ','ン','ソ','ー'],[]],en:[[],[],[]],zh:[[],['像','素','控','制','台'],[]],ko:[['픽','셀','콘','솔'],[],[]],zh_probe:[['你'],['你','好'],['你']],ko_probe:[['한','글'],[],[]],combining:[['ᄑ','ᅵ','ᆨ'],[],['ᄑ','ᅵ','ᆨ']],symbols:[['❤','🎵'],['❤','🎵'],['❤','🎵']]};
 const cmap={};for(const [key,text] of Object.entries(samples)){cmap[key]=maps.map(m=>coverage(m,text).missing);assert.deepEqual(cmap[key],expected[key],key);}
 server=createServer((req,res)=>{let name;try{name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{return res.writeHead(400).end();}const file=path.resolve(tmp,'.'+(name==='/'?'/index.html':name));if(!file.startsWith(tmp+path.sep))return res.writeHead(403).end();const types={'.html':'text/html; charset=utf-8','.woff2':'font/woff2','.txt':'text/plain; charset=utf-8'};try{res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'}).end(fs.readFileSync(file));}catch{res.writeHead(404).end();}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}`;
 browser=await playwright.launch({args:chromium.args,executablePath:process.env.CHROMIUM_PATH||await chromium.executablePath(),headless:true});
 const page=await browser.newPage({javaScriptEnabled:false,serviceWorkers:'block'});const requests=[];page.on('request',r=>requests.push(r.url()));
 await page.route('**/*',r=>r.request().url().startsWith(base+'/')?r.continue():r.abort());await page.goto(base+'/',{waitUntil:'load'});
 assert(await page.locator('#font-system').isChecked());assert.equal(requests.filter(x=>x.endsWith('.woff2')).length,0);
 for(const lang of ['ja','en','zh','ko']){assert.equal(await page.locator(`#label-${lang}`).textContent(),draft.label[lang]);assert.equal(await page.locator(`#label-${lang}`).getAttribute('lang'),lang);}
 await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.id),'font-system');await page.keyboard.press('ArrowRight');assert(await page.locator('#font-pair').isChecked());
 await page.evaluate(async()=>{await Promise.all([document.fonts.load('400 32px ResearchDot','ピクセル'),document.fonts.load('400 32px ResearchNeo','픽셀')]);await document.fonts.ready;});
 assert.equal(requests.filter(x=>x.endsWith('/assets/Galmuri11.woff2')).length,0,'unselected candidate must not be fetched');
 await page.keyboard.press('ArrowRight');assert(await page.locator('#font-galmuri').isChecked());
 const status=await page.evaluate(async()=>{const f=await document.fonts.load('400 32px ResearchGalmuri','ピクセル像素픽셀trk!');await document.fonts.ready;return f.map(x=>x.status);});assert.deepEqual(status,['loaded']);
 const cdp=await page.context().newCDPSession(page);await cdp.send('DOM.enable');await cdp.send('CSS.enable');const {root:doc}=await cdp.send('DOM.getDocument');const used={};
 for(const [id,count] of [['brand',4],['label-ja',10],['label-en',13],['label-zh',5],['label-ko',5]]){
  const {nodeId}=await cdp.send('DOM.querySelector',{nodeId:doc.nodeId,selector:`#${id}`});used[id]=(await cdp.send('CSS.getPlatformFontsForNode',{nodeId})).fonts;
  assert(used[id].some(f=>/galmuri11/i.test(f.familyName)&&f.glyphCount===count),JSON.stringify({id,used:used[id]}));
 }
 assert(!(await page.locator('section[aria-labelledby="comparison"] > p').first().evaluate(el=>getComputedStyle(el).fontFamily)).includes('ResearchGalmuri'));
 for(const choice of ['font-system','font-pair','font-galmuri']){await page.locator(`#${choice}`).check();for(const w of [1280,390,320]){await page.setViewportSize({width:w,height:900});for(const size of ['100%','200%']){await page.evaluate(v=>document.documentElement.style.fontSize=v,size);const d=await page.evaluate(()=>({w:document.documentElement.scrollWidth,c:document.documentElement.clientWidth}));assert(d.w<=d.c,JSON.stringify({choice,w,size,d}));}}}
 await page.emulateMedia({forcedColors:'active',reducedMotion:'reduce'});assert(await page.locator('#label-ko').isVisible());
 await page.reload({waitUntil:'load'});assert(await page.locator('#font-system').isChecked());
 for(const name of ['OFL.txt','NeoDunggeunmo-OFL.txt','Galmuri-LICENSE.txt']){const x=await page.request.get(`${base}/assets/${name}`);assert(x.ok());assert.deepEqual(await x.body(),fs.readFileSync(path.join(tmp,'assets',name)));}
 assert(requests.every(u=>u.startsWith(base+'/')));
 const failed=await browser.newPage({javaScriptEnabled:false,serviceWorkers:'block'});await failed.route('**/*',r=>!r.request().url().startsWith(base+'/')||r.request().url().endsWith('/Galmuri11.woff2')?r.abort():r.continue());await failed.goto(base+'/',{waitUntil:'load'});await failed.locator('#font-galmuri').check();await failed.evaluate(async()=>{try{await document.fonts.load('400 32px ResearchGalmuri','픽셀');}catch{}});assert.deepEqual(await failed.evaluate(()=>[...document.fonts].filter(f=>f.family==='ResearchGalmuri').map(f=>f.status)),['error']);assert(await failed.locator('#label-ko').isVisible());
 console.log(JSON.stringify({browser:browser.version(),cmapMissing:cmap,galmuriPlatformFonts:used,keyboard:true,noAutomaticFontRequest:true,noExternalRequests:true,galmuriErrorLeavesText:true,scope:'Candidate comparison only. No PWA integration, actual browser zoom, real devices, human, language or AT review, legal approval, or shaping guarantee.'},null,2));
}finally{if(browser)await browser.close();if(server)await new Promise(r=>server.close(r));fs.rmSync(tmp,{recursive:true,force:true});}
