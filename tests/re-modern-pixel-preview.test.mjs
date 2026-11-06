// SPDX-License-Identifier: GPL-3.0-or-later
// The experimental static mock only; this does not test the PWA or visual accessibility.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createServer} from 'node:http';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium as playwright} from 'playwright-core';
import chromium from '@sparticuz/chromium';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const html=fs.readFileSync(path.join(root,'docs/re-modern-research/pixel-console-preview/index.html'));
const server=createServer((req,res)=>{if(req.url!=='/'){res.writeHead(404).end();return;}res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});res.end(html);});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
let browser;
try {
 browser=await playwright.launch({args:chromium.args,executablePath:process.env.CHROMIUM_PATH || await chromium.executablePath(),headless:true});
 const sizes=[{width:1280,height:900},{width:390,height:844},{width:320,height:700}];
 const page=await browser.newPage({viewport:sizes[0]});const requests=[],errors=[];
 page.on('request',req=>requests.push(req.url()));page.on('pageerror',err=>errors.push(err.message));
 await page.goto(`http://127.0.0.1:${server.address().port}/`);
 for(const viewport of sizes){
  await page.setViewportSize(viewport);
  assert.equal(await page.title(),'ピクセル・コンソール｜方向性の見本');
  assert.equal(await page.locator('h1').count(),1);
  assert.equal(await page.locator('script, button, input, select, textarea, iframe').count(),0,'no fake controls or scripts');
  assert.equal(requests.length,1,'the mock should make no network requests beyond the document');
  assert.deepEqual(errors,[]);
  for(const zoom of ['100%','200%']){
   await page.evaluate(z=>{document.documentElement.style.fontSize=z;},zoom);
   const info=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));
   assert(info.scroll<=info.client,`horizontal overflow at ${viewport.width} / ${zoom}: ${JSON.stringify(info)}`);
  }
  await page.emulateMedia({forcedColors:'active',reducedMotion:'reduce'});
  assert.equal(await page.evaluate(()=>matchMedia('(forced-colors: active)').matches),true);
  assert.equal(await page.evaluate(()=>matchMedia('(prefers-reduced-motion: reduce)').matches),true);
  assert.equal(await page.locator('h1').isVisible(),true);
  await page.emulateMedia({forcedColors:'none',reducedMotion:'no-preference'});
  await page.evaluate(()=>{document.documentElement.style.fontSize='100%';});
  if(process.env.PIXEL_SCREENSHOT && viewport.width===1280) await page.screenshot({path:process.env.PIXEL_SCREENSHOT,fullPage:true});
 }
 console.log(`✅ static mock: Chromium ${browser.version()}, 1280/390/320 px, 100%/200% root font, forced-colors and reduced-motion emulation; no external resources`);
} finally {if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
