// SPDX-License-Identifier: GPL-3.0-or-later
// Local, isolated static research preview only. Does not prove AT or human evaluation.
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {chromium as playwright} from 'playwright-core';
import chromium from '@sparticuz/chromium';
const html=await readFile(new URL('../docs/re-modern-research/title-font-integration/preview.html',import.meta.url));
const server=createServer((req,res)=>{if(req.url!=='/'){res.writeHead(404).end();return;}res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});res.end(html);});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}`;
let browser;
try{
 browser=await playwright.launch({args:chromium.args,executablePath:process.env.CHROMIUM_PATH||await chromium.executablePath(),headless:true});
 const page=await browser.newPage({javaScriptEnabled:false,serviceWorkers:'block'});const errors=[],requests=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>requests.push(r.url()));
 await page.route('**/*',r=>r.request().url()===base+'/'?r.continue():r.abort());
 await page.goto(base+'/');assert.equal(await page.locator('h1').innerText(),'ピクセル・コンソール');assert.equal(await page.locator('details').count(),3);assert.equal(await page.locator('script,button,input,select').count(),0);
 const dot=page.locator('details').first();await dot.locator('summary').focus();await page.keyboard.press('Enter');assert.equal(await dot.evaluate(x=>x.open),true);assert.equal(await dot.locator('a').count(),2);assert.equal(await page.locator('#credits a[href*="/fonts/licenses/"]').count(),4);
 for(const width of [1280,390,320])for(const zoom of ['100%','200%']){await page.setViewportSize({width,height:900});await page.evaluate(z=>document.documentElement.style.fontSize=z,zoom);const sizes=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));assert(sizes.scroll<=sizes.client,`${width}/${zoom}: ${JSON.stringify(sizes)}`);}
 await page.emulateMedia({forcedColors:'active',reducedMotion:'reduce'});assert.equal(await page.locator('h1').isVisible(),true);assert.deepEqual(errors,[]);assert.deepEqual(requests,[base+'/']);
 console.log(`✅ title/license preview: Chromium ${browser.version()}, no JS, keyboard details, 4 license links, 320/390/1280 at 100/200%, forced-colors emulation; no external requests`);
}finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
