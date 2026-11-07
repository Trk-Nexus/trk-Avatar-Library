// SPDX-License-Identifier: GPL-3.0-or-later
// Two-font local research mock, not a distributed work or PWA integration.
// TRK_PWA=/path/to/pwa TRK_NEO_DIR=/path/to/fixed-neo-files node tests/re-modern-korean-font-study.test.mjs
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
assert(process.env.TRK_PWA && process.env.TRK_NEO_DIR,'TRK_PWA and TRK_NEO_DIR are required');
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'avatar-korean-font-study-'));
let server,browser;
try{
 const built=spawnSync(process.execPath,[path.join(root,'tools/prepare-re-modern-font-study.mjs'),`--out=${temp}`,`--trk=${process.env.TRK_PWA}`,`--neo-dir=${process.env.TRK_NEO_DIR}`],{cwd:root,encoding:'utf8'});
 assert.equal(built.status,0,built.stderr||built.stdout);
 const neo=fs.readFileSync(path.join(temp,'assets/neodgm.woff2'));
 const dot=fs.readFileSync(path.join(temp,'assets/DotGothic16-Regular.woff2'));
 const labels=JSON.parse(fs.readFileSync(path.join(root,'drafts/re-modern/pixel-console/skin.json'))).label;
 const korean=coverage(cmapOf(neo,readWoff2(neo)),labels.ko);
 const japanese=coverage(cmapOf(dot,readWoff2(dot)),labels.ja);
 assert.deepEqual(korean.missing,[]);assert.deepEqual(japanese.missing,[]);
 const bad=path.join(temp,'bad');fs.mkdirSync(bad);fs.writeFileSync(path.join(bad,'neodgm.woff2'),'bad');fs.copyFileSync(path.join(temp,'assets/NeoDunggeunmo-OFL.txt'),path.join(bad,'LICENSE.txt'));
 const rejected=spawnSync(process.execPath,[path.join(root,'tools/prepare-re-modern-font-study.mjs'),`--out=${path.join(temp,'bad-output')}`,`--trk=${process.env.TRK_PWA}`,`--neo-dir=${bad}`],{cwd:root,encoding:'utf8'});
 assert.notEqual(rejected.status,0,'wrong font hash must not be accepted');
 server=createServer((req,res)=>{
   const name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
   const file=path.resolve(temp,'.'+(name==='/'?'/index.html':name));
   if(!file.startsWith(temp+path.sep)){res.writeHead(403).end();return;}
   try{const bytes=fs.readFileSync(file);const types={'.html':'text/html; charset=utf-8','.woff2':'font/woff2','.txt':'text/plain; charset=utf-8'};res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'}).end(bytes);}catch{res.writeHead(404).end();}
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const base=`http://127.0.0.1:${server.address().port}`;
 browser=await playwright.launch({args:chromium.args,executablePath:process.env.CHROMIUM_PATH||await chromium.executablePath(),headless:true});
 const page=await browser.newPage({viewport:{width:1280,height:900},javaScriptEnabled:false,serviceWorkers:'block'});
 const requests=[],errors=[];page.on('request',r=>requests.push(r.url()));page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',r=>r.request().url().startsWith(base+'/')?r.continue():r.abort());
 await page.goto(base+'/',{waitUntil:'load'});
 assert.equal(requests.filter(u=>u.endsWith('.woff2')).length,0,'fonts are not requested until the specimen selection');
 await page.locator('#font-dot').focus();await page.keyboard.press('Space');
 const loaded=await page.evaluate(async()=>{
  await document.fonts.ready;
  const [j,k]=await Promise.all([document.fonts.load('400 32px PixelResearchDotGothic','ピクセル'),document.fonts.load('400 32px NeoDunggeunmo','픽셀')]);
  return {j:j.map(f=>f.status),k:k.map(f=>f.status),body:getComputedStyle(document.querySelector('.sample-text')).fontFamily,heading:getComputedStyle(document.querySelector('.sample-ko')).fontFamily};
 });
 assert.deepEqual(loaded.j,['loaded']);assert.deepEqual(loaded.k,['loaded']);
 assert(!loaded.body.includes('NeoDunggeunmo'));assert(loaded.heading.includes('NeoDunggeunmo'));
 assert(requests.some(u=>u.endsWith('/assets/neodgm.woff2')));
 // Chromium's font information reports actual fonts used for the rendered text,
 // rather than only a CSS family declaration. This is browser-specific evidence.
 const cdp=await page.context().newCDPSession(page);
 await cdp.send('DOM.enable');await cdp.send('CSS.enable');
 const {root:doc}=await cdp.send('DOM.getDocument');
 const {nodeId}=await cdp.send('DOM.querySelector',{nodeId:doc.nodeId,selector:'.sample-ko'});
 const used=await cdp.send('CSS.getPlatformFontsForNode',{nodeId});
 assert(used.fonts.some(f=>/neodunggeunmo|neo둥근모/i.test(f.familyName)&&f.glyphCount>=4),JSON.stringify(used));
 const {nodeId:jaNode}=await cdp.send('DOM.querySelector',{nodeId:doc.nodeId,selector:'.sample-heading [lang="ja"]'});
 const usedJa=await cdp.send('CSS.getPlatformFontsForNode',{nodeId:jaNode});
 assert(usedJa.fonts.some(f=>/dotgothic16/i.test(f.familyName)&&f.glyphCount>=9),JSON.stringify(usedJa));
 for(const viewport of [{width:1280,height:900},{width:390,height:844},{width:320,height:700}]){
  await page.setViewportSize(viewport);
  for(const size of ['100%','200%']){
   await page.evaluate(v=>document.documentElement.style.fontSize=v,size);
   const dims=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));
   assert(dims.scroll<=dims.client,JSON.stringify({viewport,size,dims}));
  }
 }
 assert.deepEqual(errors,[]);
 assert(requests.every(u=>u.startsWith(base+'/')),'specimen must not attempt external requests');
 // If Neo cannot load, the text element remains present; this does not prove
 // the system has a Korean font or that its substitute glyphs are legible.
 const failurePage=await browser.newPage({javaScriptEnabled:false,serviceWorkers:'block'});
 await failurePage.route('**/*',r=>!r.request().url().startsWith(base+'/')||r.request().url().endsWith('/assets/neodgm.woff2')?r.abort():r.continue());
 await failurePage.goto(base+'/',{waitUntil:'load'});
 await failurePage.locator('#font-dot').focus();await failurePage.keyboard.press('Space');
 // Trigger and await the rejected load explicitly. document.fonts.ready can
 // resolve before a style-driven load has started, leaving status='loading'.
 await failurePage.evaluate(async()=>{try{await document.fonts.load('400 32px NeoDunggeunmo','픽셀');}catch{}});
 assert(await failurePage.locator('.sample-ko').isVisible());
 const status=await failurePage.evaluate(()=>Array.from(document.fonts).filter(f=>f.family==='NeoDunggeunmo').map(f=>f.status));
 assert.deepEqual(status,['error']);
 console.log(JSON.stringify({browser:browser.version(),scriptDisabled:true,japaneseLabelCmap:japanese,koreanLabelCmap:korean,loaded,platformFonts:used.fonts,hashMismatchRejected:true,failedNeoTextElementVisible:true,noExternalRequests:true,widths:[1280,390,320],rootFontSizes:['100%','200%'],scope:'Isolated heading example only; no PWA integration, real devices, Korean-language visual review, complete glyph/shape/OS coverage, or accessibility guarantee.'},null,2));
}finally{if(browser)await browser.close();if(server)await new Promise(resolve=>server.close(resolve));fs.rmSync(temp,{recursive:true,force:true});}
