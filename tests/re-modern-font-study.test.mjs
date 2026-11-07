// SPDX-License-Identifier: GPL-3.0-or-later
// Research specimen only: actual packaged font loading, not PWA integration.
// TRK_PWA=/path/to/pwa node tests/re-modern-font-study.test.mjs
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
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'avatar-font-study-'));
let server,browser;
try {
 const args=[path.join(root,'tools/prepare-re-modern-font-study.mjs'),`--out=${temp}`];
 if(process.env.TRK_PWA) args.push(`--trk=${process.env.TRK_PWA}`);
 const built=spawnSync(process.execPath,args,{cwd:root,encoding:'utf8'});
 assert.equal(built.status,0,built.stderr||built.stdout);
 const font=fs.readFileSync(path.join(temp,'assets/DotGothic16-Regular.woff2'));
 const codes=cmapOf(font,readWoff2(font));
 assert.deepEqual(coverage(codes,'ピクセル・コンソール PIXEL CONSOLE 0123').missing,[]);
 assert(coverage(codes,'你好').missing.includes('你'));
 assert(coverage(codes,'한글').missing.includes('한'));
 server=createServer((req,res)=>{
  const name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  const file=path.resolve(temp,'.'+(name==='/'?'/index.html':name));
  if(!file.startsWith(temp+path.sep)){res.writeHead(403).end();return;}
  const types={'.html':'text/html; charset=utf-8','.woff2':'font/woff2','.txt':'text/plain; charset=utf-8'};
  try{res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'}).end(fs.readFileSync(file));}catch{res.writeHead(404).end();}
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const base=`http://127.0.0.1:${server.address().port}`;
 browser=await playwright.launch({args:chromium.args,executablePath:process.env.CHROMIUM_PATH||await chromium.executablePath(),headless:true});
 const context=await browser.newContext({viewport:{width:1280,height:900},javaScriptEnabled:false,serviceWorkers:'block'});
 const page=await context.newPage(),requests=[],errors=[];
 page.on('request',req=>requests.push(req.url()));page.on('pageerror',err=>errors.push(err.message));
 await page.route('**/*',r=>r.request().url().startsWith(base+'/')?r.continue():r.abort());
 await page.goto(base+'/',{waitUntil:'load'});
 assert.equal(await page.locator('#font-system').isChecked(),true);
 assert.equal(requests.filter(u=>u.endsWith('.woff2')).length,0,'font is not loaded until explicitly selected');
 const bodyBefore=await page.locator('.sample-text').evaluate(el=>getComputedStyle(el).fontFamily);
 const headingBefore=await page.locator('.sample-heading').evaluate(el=>getComputedStyle(el).fontFamily);
 assert(!headingBefore.includes('PixelResearchDotGothic'));
 await page.locator('#font-dot').focus();await page.keyboard.press('Space');
 await page.evaluate(()=>document.fonts.ready);
 const faces=await page.evaluate(()=>document.fonts.load('400 32px PixelResearchDotGothic','ピクセル').then(f=>f.map(x=>x.status)));
 assert.deepEqual(faces,['loaded']);
 assert((await page.locator('.sample-heading').evaluate(el=>getComputedStyle(el).fontFamily)).includes('PixelResearchDotGothic'));
 assert.equal(await page.locator('.sample-text').evaluate(el=>getComputedStyle(el).fontFamily),bodyBefore,'body font must stay system');
 assert.equal(requests.filter(u=>u.endsWith('.woff2')).length,1);
 for(const viewport of [{width:1280,height:900},{width:390,height:844},{width:320,height:700}]){
  await page.setViewportSize(viewport);
  for(const fontSize of ['100%','200%']){
   await page.evaluate(v=>{document.documentElement.style.fontSize=v;},fontSize);
   const dimensions=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));
   assert(dimensions.scroll<=dimensions.client,`${viewport.width}/${fontSize}: ${JSON.stringify(dimensions)}`);
  }
 }
 await page.emulateMedia({forcedColors:'active',reducedMotion:'reduce'});
 assert.equal(await page.locator('.sample-heading').isVisible(),true);
 await page.locator('#font-system').focus();await page.keyboard.press('Space');
 assert.equal(await page.locator('#font-system').isChecked(),true);
 assert(!(await page.locator('.sample-heading').evaluate(el=>getComputedStyle(el).fontFamily)).includes('PixelResearchDotGothic'));
 await page.reload({waitUntil:'load'});
 assert.equal(await page.locator('#font-system').isChecked(),true,'preference is not persisted');
 assert.deepEqual(errors,[]);
 // Simulate a missing font in a separate isolated page; the text stays present.
 const missing=await browser.newContext({javaScriptEnabled:false,serviceWorkers:'block'});
 const failed=await missing.newPage();
 await failed.route('**/*',r=>r.request().url().endsWith('.woff2')?r.abort():(r.request().url().startsWith(base+'/')?r.continue():r.abort()));
 await failed.goto(base+'/',{waitUntil:'load'});
 await failed.locator('#font-dot').check();
 await failed.evaluate(()=>document.fonts.ready);
 assert.equal(await failed.locator('.sample-heading').isVisible(),true);
 assert.equal(await failed.evaluate(()=>document.fonts.check('400 32px PixelResearchDotGothic','ピクセル')),false,'font load was blocked');
 // Chromium single-process cannot reliably close individual contexts; browser.close handles both.
 console.log(JSON.stringify({browser:browser.version(),scriptDisabled:true,fontsLoaded:faces,viewportWidths:[1280,390,320],rootFontSizes:['100%','200%'],keyboardSelection:true,bodyUnchanged:true,resetAfterReload:true,failedFontTextVisible:true,scope:'Research mock only. No PWA integration, real devices, human/AT review, browser zoom, comprehensive glyph coverage or accessibility guarantee.'},null,2));
} finally {if(browser)await browser.close();if(server)await new Promise(resolve=>server.close(resolve));fs.rmSync(temp,{recursive:true,force:true});}
