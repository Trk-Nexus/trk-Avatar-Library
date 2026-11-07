// SPDX-License-Identifier: GPL-3.0-or-later
// Isolated research UI; JS and service workers disabled, no PWA integration.
// TRK_PWA=/path/to/pwa TRK_NEO_DIR=/path/to/fixed-files node tests/re-modern-license-study-browser.test.mjs
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
assert(process.env.TRK_PWA && process.env.TRK_NEO_DIR,'TRK_PWA and TRK_NEO_DIR required');
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'avatar-license-ui-'));let browser,server;
try{
 const args=[path.join(root,'tools/prepare-re-modern-license-study.mjs'),`--trk=${process.env.TRK_PWA}`,`--neo-dir=${process.env.TRK_NEO_DIR}`,`--out=${temp}`];
 const built=spawnSync(process.execPath,args,{cwd:root,encoding:'utf8'});assert.equal(built.status,0,built.stderr||built.stdout);
 server=createServer((req,res)=>{
  if(!['GET','HEAD'].includes(req.method))return res.writeHead(405).end();
  let pathname;try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{return res.writeHead(400).end();}
  const file=path.resolve(temp,'.'+(pathname==='/'?'/index.html':pathname));
  if(!file.startsWith(temp+path.sep))return res.writeHead(403).end();
  try{const bytes=fs.readFileSync(file);const type=file.endsWith('.html')?'text/html; charset=utf-8':'text/plain; charset=utf-8';res.writeHead(200,{'Content-Type':type}).end(req.method==='HEAD'?undefined:bytes);}catch{res.writeHead(404).end();}
 });
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}`;
 browser=await playwright.launch({args:chromium.args,executablePath:process.env.CHROMIUM_PATH||await chromium.executablePath(),headless:true});
 const page=await browser.newPage({javaScriptEnabled:false,serviceWorkers:'block',viewport:{width:1280,height:900}});
 const requests=[],errors=[];page.on('request',req=>requests.push(req.url()));page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',r=>r.request().url().startsWith(base+'/')?r.continue():r.abort());
 await page.goto(base+'/',{waitUntil:'load'});
 for(const id of ['dot','neo']){
  const detail=page.locator(`#${id}-details`),summary=detail.locator('summary');
  assert.equal(await detail.evaluate(el=>el.open),false);
  await summary.focus();await page.keyboard.press('Space');
  assert.equal(await detail.evaluate(el=>el.open),true);
  assert(await page.locator(`#${id}-license`).isVisible());
  assert.equal(await page.locator(`#${id}-license`).getAttribute('lang'),'en');
  assert.equal(await page.locator(`#${id}-license`).textContent(),fs.readFileSync(path.join(temp,`licenses/${id}/OFL.txt`),'utf8'));
  const link=page.locator(`a[href="licenses/${id}/OFL.txt"]`);
  assert(await link.isVisible());
  const response=await page.request.get(`${base}/licenses/${id}/OFL.txt`);assert(response.ok());
  assert.deepEqual(await response.body(),fs.readFileSync(path.join(temp,`licenses/${id}/OFL.txt`)));
 }
 for(const viewport of [{width:1280,height:900},{width:390,height:844},{width:320,height:700}]){
  await page.setViewportSize(viewport);
  for(const size of ['100%','200%']){
   await page.evaluate(v=>document.documentElement.style.fontSize=v,size);
   const dimensions=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));
   if(dimensions.scroll>dimensions.client){const overflow=await page.evaluate(()=>[...document.querySelectorAll('*')].map(e=>({tag:e.tagName,id:e.id,scroll:e.scrollWidth,client:e.clientWidth,right:e.getBoundingClientRect().right})).filter(e=>e.right>innerWidth||e.scroll>e.client+1));console.error(JSON.stringify({viewport,size,dimensions,overflow}));}
   assert(dimensions.scroll<=dimensions.client,JSON.stringify({viewport,size,dimensions}));
  }
 }
 await page.emulateMedia({forcedColors:'active',reducedMotion:'reduce'});
 assert(await page.locator('#dot-license').isVisible());assert(await page.locator('#neo-license').isVisible());
 assert.deepEqual(errors,[]);assert(requests.every(u=>u.startsWith(base+'/')));
 assert.equal(requests.filter(u=>/\.woff2?(?:\?|$)/.test(u)).length,0);
 console.log(JSON.stringify({browser:browser.version(),javascriptDisabled:true,bothFullTextsMatchFiles:true,keyboardDetails:true,noExternalRequests:true,noFontLoads:true,viewportWidths:[1280,390,320],rootFontSizes:['100%','200%'],forcedColorsEmulation:true,scope:'Offline isolated research UI; no PWA implementation, real device, actual browser zoom, AT/human review or legal approval.'},null,2));
}finally{if(browser)await browser.close();if(server)await new Promise(r=>server.close(r));fs.rmSync(temp,{recursive:true,force:true});}
