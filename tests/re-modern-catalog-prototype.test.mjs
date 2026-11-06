// SPDX-License-Identifier: GPL-3.0-or-later
// Research prototype only. Does not register or publish works, or test PWA compatibility.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createServer} from 'node:http';
import {chromium as playwright} from 'playwright-core';
import chromium from '@sparticuz/chromium';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const allow=new Set(['/docs/re-modern-research/pixel-console-preview/index.html','/docs/re-modern-research/pixel-console-preview/catalog.html','/gallery/fonts.html']);
const server=createServer((req,res)=>{let pathname;try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400).end();return;}
 if(!allow.has(pathname)){res.writeHead(404).end();return;}
 try{res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});res.end(fs.readFileSync(path.join(root,pathname)));}catch{res.writeHead(404).end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base=`http://127.0.0.1:${server.address().port}`;
let browser;
try{
 browser=await playwright.launch({args:chromium.args,executablePath:process.env.CHROMIUM_PATH||await chromium.executablePath(),headless:true});
 const ctx=await browser.newContext({viewport:{width:1280,height:900}}),page=await ctx.newPage();
 const errors=[],requests=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>requests.push(r.url()));
 await page.route('**/*',route=>route.request().url().startsWith(base+'/')?route.continue():route.abort());
 const catalog=base+'/docs/re-modern-research/pixel-console-preview/catalog.html';
 await page.goto(catalog);
 assert.equal(await page.locator('#pixel').isVisible(),true);assert.equal(await page.locator('#searchTools').isVisible(),true);
 for(const term of ['DotGothic16','ｄｏｔｇｏｔｈｉｃ１６','書斎 ピクセル','system-ui','基地']){
  await page.locator('#search').fill(term);assert.equal(await page.locator('#pixel').isVisible(),true,term);assert.equal(await page.locator('#searchStatus').textContent(),'1 件');
 }
 await page.locator('#search').fill('対象外の文字列');assert.equal(await page.locator('#pixel').isVisible(),false);assert.equal(await page.locator('#noResults').isVisible(),true);assert.equal(await page.locator('#searchStatus').textContent(),'0 件');
 await page.locator('#search').fill('');assert.equal(await page.locator('#pixel').isVisible(),true);assert.equal(await page.locator('#noResults').isVisible(),false);
 for(const width of [1280,390,320]) for(const size of ['100%','200%']){
  await page.setViewportSize({width,height:900});await page.evaluate(z=>document.documentElement.style.fontSize=z,size);
  const d=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));assert(d.scroll<=d.client,`${width}/${size}: ${JSON.stringify(d)}`);
 }
 await page.emulateMedia({forcedColors:'active',reducedMotion:'reduce'});assert.equal(await page.locator('#pixel h3').isVisible(),true);
 await page.emulateMedia({forcedColors:'none',reducedMotion:'no-preference'});await page.setViewportSize({width:1280,height:900});await page.evaluate(()=>document.documentElement.style.fontSize='100%');
 if(process.env.PIXEL_CATALOG_SCREENSHOT)await page.screenshot({path:process.env.PIXEL_CATALOG_SCREENSHOT,fullPage:true});
 await page.getByRole('link',{name:'見本と詳細を見る'}).click();
 assert.equal(await page.locator('#font').isVisible(),true);assert.equal(await page.locator('#spaces').isVisible(),true);
 await page.getByRole('link',{name:'既存の書体一覧を見る'}).click();assert.equal(await page.locator('#q').isVisible(),true);
 await page.locator('#q').fill('TrkDotGothic');assert.match(await page.locator('body').innerText(),/ドットの電子音/);
 assert.deepEqual(errors,[]);assert(requests.every(u=>u.startsWith(base+'/')),'no third-party requests');
 const nojs=await browser.newContext({javaScriptEnabled:false});const p2=await nojs.newPage();await p2.goto(catalog);
 assert.equal(await p2.locator('#pixel').isVisible(),true);assert.equal(await p2.locator('#searchTools').isVisible(),false);assert.match(await p2.locator('body').innerText(),/検索には JavaScript を使います/);
 console.log(`✅ catalog prototype: Chromium ${browser.version()}, search and reset, NFKC, no-JS fallback, detail→font gallery, no third-party requests; 320/390/1280 & 100/200% root font`);
}finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
