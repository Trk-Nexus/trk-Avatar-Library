// SPDX-License-Identifier: GPL-3.0-or-later
// A2: fixed PWA, isolated browser, a synthetic dev-mode work and selected real skins.
// TRK_PWA=/path/to/clean-575cb075 node tests/re-modern-trk314-screen-investigation.test.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createServer} from 'node:http';
import {spawnSync} from 'node:child_process';
import {chromium as playwright} from 'playwright-core';
import chromium from '@sparticuz/chromium';

const ref='575cb075dbaf23c7f3dac3dbd60e7353f0912184';
assert(process.env.TRK_PWA,'TRK_PWA must name a clean checkout of '+ref);
const pwa=path.resolve(process.env.TRK_PWA);
for(const [args,expected] of [[['rev-parse','HEAD'],ref],[['status','--porcelain'],'']]) {
 const r=spawnSync('git',args,{cwd:pwa,encoding:'utf8'});
 assert.equal(r.status,0,r.stderr);assert.equal(r.stdout.trim(),expected,'PWA checkout must be clean and fixed');
}
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.wasm':'application/wasm'};
let server,browser,temp;
try {
 temp=fs.mkdtempSync(path.join(os.tmpdir(),'avatar-pwa-screen-'));
 server=createServer((req,res)=>{
   let name;try{name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400).end();return;}
   const file=path.resolve(pwa,'.'+(name==='/'?'/index.html':name));
   if(!file.startsWith(pwa+path.sep)){res.writeHead(403).end();return;}
   try{const bytes=fs.readFileSync(file);res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'}).end(bytes);}catch{res.writeHead(404).end();}
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const base=`http://127.0.0.1:${server.address().port}`;
 browser=await playwright.launch({args:chromium.args,executablePath:process.env.CHROMIUM_PATH||await chromium.executablePath(),headless:true});
 const page=await browser.newPage({viewport:{width:1280,height:900},deviceScaleFactor:1,serviceWorkers:'block'});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',r=>r.request().url().startsWith(base+'/')?r.continue():r.abort());
 await page.goto(base+'/',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.Trk?.data?.SKINS?.shadow&&window.Trk?.core?.settings&&window.TrkRemodernUi,{timeout:30000});
 // Synthetic, unregistered work only in this ephemeral browser profile. Reload
 // is deliberate: remodern-ui loads the work map from saved isolated settings.
 await page.evaluate(()=>{
   const core=window.Trk.core;
   core.settings.remodernDevPaint=true;
   core.settings.remodernWorks=[{id:'trk-re-modern-avatar-a2',name:'Avatar A2 test',author:'x',license:'OFL-1.1',regions:['common'],colors:{text:'#e0e8ff',accent:'#202020'}}];
   core.settings.remodern={version:1,common:{mode:'own',work:'trk-re-modern-avatar-a2'},study:{mode:'keep',work:null},base:{mode:'keep',work:null}};
   core.saveUserPrefs();
 });
 await page.reload({waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.TrkRemodernUi&&window.Trk?.core?.settings?.remodernDevPaint===true,{timeout:30000});
 if(await page.locator('#welcomeCloseBtn').isVisible()) await page.locator('#welcomeCloseBtn').click();
 const results=[];
 for(const scenario of [
   {skin:'shadow',width:1280,height:900,zoom:1},
   {skin:'daylight',width:1280,height:900,zoom:1},
   {skin:'shadow',width:390,height:844,zoom:1},
   {skin:'daylight',width:390,height:844,zoom:1},
   {skin:'shadow',width:1280,height:900,zoom:1.5}
 ]) {
   await page.setViewportSize({width:scenario.width,height:scenario.height});
   await page.evaluate(({skin,zoom})=>{document.body.style.zoom=String(zoom);window.Trk.core.applySkin(skin,false);},scenario);
   // Allow the app's resize/layout handling and CSS transitions to settle.
   await page.waitForTimeout(1200);
   const info=await page.evaluate(()=>{
     const P=window.TrkReModernPaint,h=document.querySelector('.brand h1'),chain=[];
     for(let n=h;n&&n.nodeType===1;n=n.parentElement){const c=getComputedStyle(n);chain.push({element:n.tagName.toLowerCase()+(n.id?'#'+n.id:'')+(n.className&&typeof n.className==='string'?'.'+n.className.trim().split(/\s+/).join('.'):''),backgroundColor:c.backgroundColor,backgroundImage:c.backgroundImage,opacity:c.opacity,filter:c.filter});}
     const bgs=P.effectiveBgs(h),paint=P.titlePaint({colors:{text:'#e0e8ff',accent:'#202020'}},bgs),r=h.getBoundingClientRect();
     return {chain,candidates:bgs,decision:paint,inline:{text:h.style.color,accent:h.querySelector('span').style.color},rect:{x:r.x,y:r.y,width:r.width,height:r.height}};
   });
   assert(info.candidates&&info.candidates.length>0,JSON.stringify(scenario));
   const expected=info.decision.text?'rgb(224, 232, 255)':'';
   assert.equal(info.inline.text,expected,'skin handler should re-evaluate text');
   assert.equal(info.inline.accent,info.decision.accent?'rgb(32, 32, 32)':'','skin handler should re-evaluate accent');
   // Pixel is near the top-left inside the h1 box, expected away from glyphs;
   // it is an observational point only, not a text-pixel or contrast audit.
   const x=Math.floor(info.rect.x+2),y=Math.floor(info.rect.y+1);
   let pixel=null;
   if(x>=0&&y>=0&&x<scenario.width&&y<scenario.height){
     const screenshot=path.join(temp,'screen.png');await page.screenshot({path:screenshot,animations:'disabled'});
     const sample=spawnSync('convert',[screenshot,'-format',`%[pixel:p{${x},${y}}]`,'info:'],{encoding:'utf8'});
     assert.equal(sample.status,0,'ImageMagick convert required: '+(sample.error||sample.stderr));
     pixel={x,y,value:sample.stdout};
   }
   results.push({...scenario,...info,pixel});
 }
 assert.equal(results[0].decision.text,'#e0e8ff','test work should paint on shadow');
 assert.equal(results[1].decision.text,null,'test work should not paint on daylight');
 assert.deepEqual(errors,[],'uncaught page errors');
 console.log(JSON.stringify({pwa:ref,browser:browser.version(),isolation:'temporary server, ephemeral profile, service workers blocked, external requests aborted, synthetic work with dev mode',results,scope:'Only selected real screen, two skins, synthetic work and five viewport/CSS zoom scenarios; not a visual review, browser zoom, real device, assistive technology or safety guarantee.'},null,2));
} finally {if(browser)await browser.close();if(server)await new Promise(resolve=>server.close(resolve));if(temp)fs.rmSync(temp,{recursive:true,force:true});}
